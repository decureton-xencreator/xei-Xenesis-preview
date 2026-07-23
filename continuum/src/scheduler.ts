export interface SchedulingCandidate {
  id: string;
  tenantId: string;
  priority: number;
  weightedMissionUnits: number;
  createdAt: string;
  tenantRunning: number;
  blocked: boolean;
}

export interface SchedulingEnvelope {
  maxMissions: number;
  maxWeightedMissionUnits: number;
  runningMissions: number;
  runningWeightedMissionUnits: number;
  now: string;
}

export interface AdmissionReservation {
  id: string;
  missionId: string;
  token: string;
}

export function effectivePriority(candidate: SchedulingCandidate, now: string): number {
  const ageHours = Math.max(0, (Date.parse(now) - Date.parse(candidate.createdAt)) / 3_600_000);
  return candidate.priority + Math.min(20, Math.floor(ageHours / 6));
}

export function selectAdmissions(candidates: SchedulingCandidate[], envelope: SchedulingEnvelope): string[] {
  let missionSlots = Math.max(0, envelope.maxMissions - envelope.runningMissions);
  let remainingWmu = Math.max(0, envelope.maxWeightedMissionUnits - envelope.runningWeightedMissionUnits);
  const selected: string[] = [];
  const ordered = candidates
    .filter((candidate) => !candidate.blocked && candidate.weightedMissionUnits > 0)
    .sort((left, right) =>
      effectivePriority(right, envelope.now) - effectivePriority(left, envelope.now)
      || left.tenantRunning - right.tenantRunning
      || Date.parse(left.createdAt) - Date.parse(right.createdAt)
      || left.id.localeCompare(right.id));

  for (const candidate of ordered) {
    if (missionSlots === 0) break;
    if (candidate.weightedMissionUnits > remainingWmu) continue;
    selected.push(candidate.id);
    missionSlots -= 1;
    remainingWmu -= candidate.weightedMissionUnits;
  }
  return selected;
}

export async function reserveMissionAdmission(
  db: D1Database,
  missionId: string,
  now = new Date().toISOString(),
): Promise<AdmissionReservation | null> {
  await db.prepare(
    "UPDATE mission_admissions SET released_at = ? WHERE released_at IS NULL AND expires_at <= ?",
  ).bind(now, now).run();
  const active = await db.prepare(
    `SELECT
       (SELECT COUNT(*) FROM missions WHERE state = 'running')
         + (SELECT COUNT(*) FROM mission_admissions WHERE released_at IS NULL AND expires_at > ?) AS count,
       (SELECT COALESCE(SUM(weighted_mission_units), 0) FROM missions WHERE state = 'running')
         + (SELECT COALESCE(SUM(weighted_mission_units), 0) FROM mission_admissions WHERE released_at IS NULL AND expires_at > ?) AS wmu`,
  ).bind(now, now).first<{ count: number; wmu: number }>();
  const candidateResult = await db.prepare(
    `SELECT m.id, m.tenant_id, m.priority, m.weighted_mission_units, m.created_at,
       (SELECT COUNT(*) FROM missions active WHERE active.tenant_id = m.tenant_id AND active.state = 'running') AS tenant_running,
       EXISTS(
         SELECT 1 FROM mission_dependencies d
         JOIN missions dependency ON dependency.id = d.depends_on_mission_id
         WHERE d.mission_id = m.id AND dependency.state <> 'succeeded'
       ) AS blocked
     FROM missions m
     WHERE m.state = 'queued'
       AND (m.scheduled_at IS NULL OR m.scheduled_at <= ?)
       AND NOT EXISTS (
         SELECT 1 FROM mission_admissions admission
         WHERE admission.mission_id = m.id AND admission.released_at IS NULL
       )
     ORDER BY m.priority DESC, m.created_at ASC
     LIMIT 256`,
  ).bind(now).all<{
    id: string; tenant_id: string; priority: number; weighted_mission_units: number;
    created_at: string; tenant_running: number; blocked: number;
  }>();
  const candidates = candidateResult.results.map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    priority: row.priority,
    weightedMissionUnits: row.weighted_mission_units,
    createdAt: row.created_at,
    tenantRunning: row.tenant_running,
    blocked: row.blocked !== 0,
  }));
  const selected = selectAdmissions(candidates, {
    maxMissions: 4,
    maxWeightedMissionUnits: 4,
    runningMissions: active?.count ?? 0,
    runningWeightedMissionUnits: active?.wmu ?? 0,
    now,
  });
  if (!selected.includes(missionId)) return null;

  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.parse(now) + 5 * 60_000).toISOString();
  const reservationResult = await db.prepare(
    `INSERT INTO mission_admissions(
       id, mission_id, tenant_id, weighted_mission_units, admission_token, admitted_at, expires_at
     )
     SELECT ?, m.id, m.tenant_id, m.weighted_mission_units, ?, ?, ?
     FROM missions m
     WHERE m.id = ?
       AND m.state = 'queued'
       AND NOT EXISTS (
         SELECT 1 FROM mission_admissions existing
         WHERE existing.mission_id = m.id AND existing.released_at IS NULL
       )
       AND (
         (SELECT COUNT(*) FROM missions WHERE state = 'running')
         + (SELECT COUNT(*) FROM mission_admissions WHERE released_at IS NULL AND expires_at > ?)
       ) < 4
       AND (
         (SELECT COALESCE(SUM(weighted_mission_units), 0) FROM missions WHERE state = 'running')
         + (SELECT COALESCE(SUM(weighted_mission_units), 0) FROM mission_admissions WHERE released_at IS NULL AND expires_at > ?)
         + m.weighted_mission_units
       ) <= 4`,
  ).bind(id, token, now, expiresAt, missionId, now, now).run();
  return reservationResult.meta.changes === 1 ? { id, missionId, token } : null;
}

export async function releaseMissionAdmission(
  db: D1Database,
  reservation: AdmissionReservation,
  now = new Date().toISOString(),
): Promise<void> {
  await db.prepare(
    "UPDATE mission_admissions SET released_at = ? WHERE id = ? AND admission_token = ? AND released_at IS NULL",
  ).bind(now, reservation.id, reservation.token).run();
}
