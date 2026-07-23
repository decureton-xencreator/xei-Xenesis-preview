export interface BudgetEnvelope {
  missionLimitUsd: number;
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  dailyActualUsd: number;
  monthlyActualUsd: number;
  estimatedCallUsd: number;
  providerCallsUsed: number;
  providerCallLimit: number;
}

export interface BudgetDecision {
  allowed: boolean;
  reason?: "mission_budget" | "daily_budget" | "monthly_budget" | "provider_call_limit";
  remainingMissionUsd: number;
  remainingDailyUsd: number;
  remainingMonthlyUsd: number;
}

export interface ExecutionGuard {
  leaseId: string;
  leaseToken: string;
  lockId: string;
  lockToken: string;
  estimatedCallUsd: number;
}

export type RecoveryClassification =
  | "retry_safe_before_provider_dispatch"
  | "ambiguous_after_provider_dispatch_no_retry"
  | "terminal_provider_result_no_retry";

export interface RecoveryEvidence {
  providerDispatchStarted: boolean;
  providerResultRecorded: boolean;
}

export function classifyInterruptedAttempt(evidence: RecoveryEvidence): RecoveryClassification {
  if (evidence.providerResultRecorded) return "terminal_provider_result_no_retry";
  if (evidence.providerDispatchStarted) return "ambiguous_after_provider_dispatch_no_retry";
  return "retry_safe_before_provider_dispatch";
}

export async function reclaimExpiredExecutionGuards(db: D1Database, nowIso = new Date().toISOString()): Promise<void> {
  await db.batch([
    db.prepare(
      `UPDATE mission_attempts
       SET state = 'abandoned',
           retry_classification = CASE
             WHEN EXISTS (
               SELECT 1 FROM provider_calls call
               WHERE call.attempt_id = mission_attempts.id
                  OR (call.attempt_id IS NULL AND call.mission_id = mission_attempts.mission_id
                      AND call.started_at >= mission_attempts.started_at)
             ) THEN 'ambiguous_after_provider_dispatch_no_retry'
             ELSE 'retry_safe_before_provider_dispatch'
           END,
           completed_at = ?,
           error_code = 'execution_guard_expired',
           version = version + 1
       WHERE state = 'running'
         AND mission_id IN (
           SELECT mission_id FROM worker_leases
           WHERE released_at IS NULL AND expires_at <= ?
         )`,
    ).bind(nowIso, nowIso),
    db.prepare(
      "UPDATE worker_leases SET released_at = ?, heartbeat_at = ?, version = version + 1 WHERE released_at IS NULL AND expires_at <= ?",
    ).bind(nowIso, nowIso, nowIso),
    db.prepare(
      "UPDATE resource_locks SET released_at = ?, version = version + 1 WHERE released_at IS NULL AND expires_at <= ?",
    ).bind(nowIso, nowIso),
  ]);
}

export function decideBudget(envelope: BudgetEnvelope): BudgetDecision {
  const remainingMissionUsd = Math.max(0, envelope.missionLimitUsd - envelope.estimatedCallUsd);
  const remainingDailyUsd = Math.max(0, envelope.dailyLimitUsd - envelope.dailyActualUsd - envelope.estimatedCallUsd);
  const remainingMonthlyUsd = Math.max(0, envelope.monthlyLimitUsd - envelope.monthlyActualUsd - envelope.estimatedCallUsd);
  const base = { remainingMissionUsd, remainingDailyUsd, remainingMonthlyUsd };
  if (envelope.providerCallsUsed >= envelope.providerCallLimit) return { allowed: false, reason: "provider_call_limit", ...base };
  if (envelope.estimatedCallUsd > envelope.missionLimitUsd) return { allowed: false, reason: "mission_budget", ...base };
  if (envelope.dailyActualUsd + envelope.estimatedCallUsd > envelope.dailyLimitUsd) return { allowed: false, reason: "daily_budget", ...base };
  if (envelope.monthlyActualUsd + envelope.estimatedCallUsd > envelope.monthlyLimitUsd) return { allowed: false, reason: "monthly_budget", ...base };
  return { allowed: true, ...base };
}

export function conservativeAnthropicEstimate(prompt: string, maxOutputTokens: number): number {
  const estimatedInputTokens = Math.ceil(prompt.length / 3) + 256;
  return (estimatedInputTokens * 2 + maxOutputTokens * 10) / 1_000_000;
}

export async function acquireExecutionGuard(
  db: D1Database,
  input: {
    tenantId: string;
    missionId: string;
    workflowId: string;
    missionLimitUsd: number;
    dailyLimitUsd: number;
    monthlyLimitUsd: number;
    providerCallLimit: number;
    estimatedCallUsd: number;
    leaseSeconds: number;
  },
): Promise<ExecutionGuard> {
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + input.leaseSeconds * 1000).toISOString();
  await reclaimExpiredExecutionGuards(db, nowIso);

  const blocked = await db.prepare(
    `SELECT COUNT(*) AS count FROM mission_dependencies d
     JOIN missions dependency ON dependency.id = d.depends_on_mission_id
     WHERE d.mission_id = ? AND dependency.state <> 'succeeded'`,
  ).bind(input.missionId).first<{ count: number }>();
  if ((blocked?.count ?? 0) > 0) throw new Error("Mission dependencies are not satisfied.");

  const spend = await db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN recorded_at >= datetime('now','start of day') THEN actual_cost_usd ELSE 0 END), 0) AS daily,
       COALESCE(SUM(CASE WHEN recorded_at >= datetime('now','start of month') THEN actual_cost_usd ELSE 0 END), 0) AS monthly
     FROM mission_costs WHERE tenant_id = ? AND provider = 'anthropic'`,
  ).bind(input.tenantId).first<{ daily: number; monthly: number }>();
  const calls = await db.prepare("SELECT COALESCE(SUM(provider_calls), 0) AS count FROM mission_costs WHERE mission_id = ?").bind(input.missionId).first<{ count: number }>();
  const decision = decideBudget({
    missionLimitUsd: input.missionLimitUsd,
    dailyLimitUsd: input.dailyLimitUsd,
    monthlyLimitUsd: input.monthlyLimitUsd,
    dailyActualUsd: spend?.daily ?? 0,
    monthlyActualUsd: spend?.monthly ?? 0,
    estimatedCallUsd: input.estimatedCallUsd,
    providerCallsUsed: calls?.count ?? 0,
    providerCallLimit: input.providerCallLimit,
  });
  if (!decision.allowed) throw new Error(`Provider budget denied: ${decision.reason}.`);

  const leaseId = crypto.randomUUID();
  const leaseToken = crypto.randomUUID();
  const lockId = crypto.randomUUID();
  const lockToken = crypto.randomUUID();
  await db.batch([
    db.prepare("INSERT INTO worker_leases(id, tenant_id, mission_id, worker_id, lease_token, acquired_at, heartbeat_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(leaseId, input.tenantId, input.missionId, input.workflowId, leaseToken, nowIso, nowIso, expiresAt),
    db.prepare("INSERT INTO resource_locks(id, tenant_id, resource_type, resource_key, mission_id, lease_token, acquired_at, expires_at) VALUES (?, ?, 'provider', 'anthropic', ?, ?, ?, ?)")
      .bind(lockId, input.tenantId, input.missionId, lockToken, nowIso, expiresAt),
  ]);
  return { leaseId, leaseToken, lockId, lockToken, estimatedCallUsd: input.estimatedCallUsd };
}

export async function releaseExecutionGuard(db: D1Database, guard: ExecutionGuard): Promise<void> {
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE resource_locks SET released_at = ?, version = version + 1 WHERE id = ? AND lease_token = ? AND released_at IS NULL").bind(now, guard.lockId, guard.lockToken),
    db.prepare("UPDATE worker_leases SET released_at = ?, heartbeat_at = ?, version = version + 1 WHERE id = ? AND lease_token = ? AND released_at IS NULL").bind(now, now, guard.leaseId, guard.leaseToken),
  ]);
}
