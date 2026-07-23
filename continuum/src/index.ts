import { API_PREFIX, isMissionState, isRiskLevel, type DispatchMessage, type Mission } from "./contracts";
import { authenticate, requireAuthority } from "./auth";
import { RuntimeError, messageFrom } from "./errors";
import { storeArtifact } from "./artifacts";
import { MissionCoordinator } from "./durable/mission-coordinator";
import { MissionWorkflow } from "./workflows/mission-workflow";
import { releaseMissionAdmission, reserveMissionAdmission } from "./scheduler";

export { MissionCoordinator, MissionWorkflow };

function response(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

function assertExecutionAvailable(env: Env): void {
  const control = env as Env & { XEN_SAFE_MODE?: string; XEN_EMERGENCY_STOP?: string };
  if (control.XEN_EMERGENCY_STOP === "true") throw new RuntimeError("emergency_stop", "Emergency stop is active.", 503);
  if (control.XEN_SAFE_MODE === "true") throw new RuntimeError("safe_mode", "Safe Mode denies mission execution.", 503);
}

function smokeApprovalPage(): Response {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Xen Continuum Claude Smoke Test</title><body><main><h1>Xen Continuum Claude Smoke Test</h1><p>This creates exactly one low-risk analytical mission. Maximum output: 1,024 tokens. Maximum authorized mission cost: $0.10. No repository or external action is permitted.</p><form method="post"><button type="submit">Approve and run one Claude smoke test</button></form></main></body></html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy": "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function text(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new RuntimeError("invalid_request", `${field} must be a non-empty string of at most ${maxLength} characters.`, 422);
  }
  return value.trim();
}

function optionalText(value: unknown, field: string, maxLength: number): string | undefined {
  return value === undefined ? undefined : text(value, field, maxLength);
}

function stringList(value: unknown, field: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 32 || value.some((item) => typeof item !== "string" || !item.trim() || item.length > 1000)) {
    throw new RuntimeError("invalid_request", `${field} must be an array of at most 32 non-empty strings.`, 422);
  }
  return value.map((item) => (item as string).trim());
}

async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new RuntimeError("json_required", "Content-Type must be application/json.", 415);
  }
  const parsed: unknown = await request.json();
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new RuntimeError("invalid_request", "Request body must be a JSON object.", 422);
  }
  return parsed as Record<string, unknown>;
}

function missionStub(env: Env, tenantId: string, missionId: string): DurableObjectStub<MissionCoordinator> {
  return env.CONTINUUM_MISSION.get(env.CONTINUUM_MISSION.idFromName(`${tenantId}:${missionId}`));
}

async function indexMission(env: Env, mission: Mission, actorSource = "runtime"): Promise<void> {
  await env.CONTINUUM_DB.batch([
    env.CONTINUUM_DB.prepare(
      "INSERT INTO tenants(id, name, status, created_at) VALUES (?, ?, 'active', ?) ON CONFLICT(id) DO NOTHING",
    ).bind(mission.tenantId, mission.tenantId, mission.createdAt),
    env.CONTINUUM_DB.prepare(
      "INSERT INTO actors(id, tenant_id, display_name, identity_source, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(tenant_id, id) DO NOTHING",
    ).bind(mission.createdBy, mission.tenantId, mission.createdBy, actorSource, mission.createdAt),
  ]);
  await env.CONTINUUM_DB.prepare(
    `INSERT INTO missions
      (id, tenant_id, title, objective, state, risk, version, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       objective = excluded.objective,
       state = excluded.state,
       version = excluded.version,
       updated_at = excluded.updated_at`,
  )
    .bind(
      mission.id,
      mission.tenantId,
      mission.title,
      mission.objective,
      mission.state,
      mission.risk,
      mission.version,
      mission.createdBy,
      mission.createdAt,
      mission.updatedAt,
    )
    .run();
  await env.CONTINUUM_DB.prepare(
    `UPDATE missions SET exact_intent = ?, constraints_document = ?, success_criteria_document = ?,
      capability_class = ?, weighted_mission_units = ?, parent_mission_id = ?, group_id = ?,
      priority = ?, progress = ?, current_operation = ? WHERE id = ? AND tenant_id = ?`,
  ).bind(
    mission.exactIntent ?? mission.objective, JSON.stringify(mission.constraints ?? []), JSON.stringify(mission.successCriteria ?? []),
    mission.capabilityClass ?? "analytical", mission.weightedMissionUnits ?? 1, mission.parentMissionId ?? null,
    mission.groupId ?? null, mission.priority ?? 50, mission.progress ?? 0, mission.currentOperation ?? null,
    mission.id, mission.tenantId,
  ).run();
}

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const correlationId = request.headers.get("x-correlation-id")?.trim() || crypto.randomUUID();

  if (request.method === "GET" && url.pathname === `${API_PREFIX}/health`) {
    const modelExecution = (env as Env & { XEN_MODEL_EXECUTION?: string }).XEN_MODEL_EXECUTION;
    return response({
      status: "ok",
      service: "xen-continuum-stage2",
      mode: env.XEN_RUNTIME_MODE,
      externalEffects: modelExecution === "enabled" ? "approval-gated" : "disabled",
      modelProvider: modelExecution === "enabled" ? "anthropic" : "disabled",
      safeMode: (env as Env & { XEN_SAFE_MODE?: string }).XEN_SAFE_MODE === "true",
      emergencyStop: (env as Env & { XEN_EMERGENCY_STOP?: string }).XEN_EMERGENCY_STOP === "true",
      correlationId,
    });
  }

  const actor = await authenticate(request, env);
  if (request.method === "GET" && url.pathname === `${API_PREFIX}/session`) {
    return response({
      authenticated: true,
      identitySource: actor.source,
      authorities: actor.authorities,
      correlationId,
    });
  }
  if (url.pathname === `${API_PREFIX}/smoke/claude`) {
    requireAuthority(actor, "admin");
    if (request.method === "GET") return smokeApprovalPage();
    if (request.method !== "POST") throw new RuntimeError("method_not_allowed", "Method not allowed.", 405);
    assertExecutionAvailable(env);
    if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") !== "same-origin") {
      throw new RuntimeError("smoke_approval_origin_invalid", "Smoke-test approval must originate from the protected same-origin page.", 403);
    }
    const missionId = "00000000-0000-4000-8000-000000000005";
    const stub = missionStub(env, actor.tenantId, missionId);
    const existing = await stub.getMission(actor.tenantId);
    if (existing) return response({ mission: existing, reused: true, correlationId }, 200);
    const created = await stub.createMission({
      id: missionId,
      tenantId: actor.tenantId,
      title: "Capped Claude staging smoke test",
      objective: "Reply with exactly: XEN-CPC-001 Claude provider smoke test successful.",
      risk: "low",
      actor,
      idempotencyKey: "stage2-claude-smoke:create:v5",
    });
    const awaiting = await stub.transition({
      tenantId: actor.tenantId, actor, target: "awaiting_approval", expectedVersion: created.version,
      idempotencyKey: "stage2-claude-smoke:awaiting:v5", reason: "Owner requested a capped provider smoke test after protected-secret replacement.",
    });
    const approved = await stub.transition({
      tenantId: actor.tenantId, actor, target: "approved", expectedVersion: awaiting.version,
      idempotencyKey: "stage2-claude-smoke:approved:v5",
      approvalEvidence: `Explicit protected-browser approval at ${new Date().toISOString()}.`,
    });
    const queued = await stub.transition({
      tenantId: actor.tenantId, actor, target: "queued", expectedVersion: approved.version,
      idempotencyKey: "stage2-claude-smoke:queued:v5", reason: "Approved capped smoke test queued after protected-secret replacement.",
    });
    await indexMission(env, queued, actor.source);
    await env.CONTINUUM_QUEUE.send({
      missionId, tenantId: actor.tenantId, expectedVersion: queued.version,
      correlationId, requestedBy: actor.id, runtimeMode: env.XEN_RUNTIME_MODE,
    });
    return response({ mission: queued, queued: true, correlationId }, 202);
  }
  const missionMatch = url.pathname.match(
    new RegExp(`^${API_PREFIX}/missions/([0-9a-fA-F-]+)(?:/(transitions|dispatch|events|artifacts|lineage|pause|resume|cancel|reprioritize|redirect|approve|reject|retry))?$`),
  );

  if (request.method === "POST" && url.pathname === `${API_PREFIX}/missions`) {
    requireAuthority(actor, "propose");
    const data = await body(request);
    const risk = data.risk;
    if (!isRiskLevel(risk)) throw new RuntimeError("invalid_risk", "risk is invalid.", 422);
    const id = typeof data.id === "string" ? data.id : crypto.randomUUID();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new RuntimeError("invalid_mission_id", "id must be a UUID.", 422);
    const idempotencyKey = text(request.headers.get("idempotency-key"), "Idempotency-Key", 128);
    const mission = await missionStub(env, actor.tenantId, id).createMission({
      id,
      tenantId: actor.tenantId,
      title: text(data.title, "title", 160),
      objective: text(data.objective, "objective", 4000),
      risk,
      actor,
      idempotencyKey,
    });
    await indexMission(env, mission, actor.source);
    return response({ mission, correlationId }, 201);
  }

  if (request.method === "GET" && url.pathname === `${API_PREFIX}/missions`) {
    requireAuthority(actor, "read");
    const state = url.searchParams.get("state");
    if (state && !isMissionState(state)) throw new RuntimeError("invalid_state", "state is invalid.", 422);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50) || 50));
    const query = state
      ? env.CONTINUUM_DB.prepare("SELECT * FROM missions WHERE tenant_id = ? AND state = ? ORDER BY priority DESC, created_at DESC LIMIT ?").bind(actor.tenantId, state, limit)
      : env.CONTINUUM_DB.prepare("SELECT * FROM missions WHERE tenant_id = ? ORDER BY priority DESC, created_at DESC LIMIT ?").bind(actor.tenantId, limit);
    const result = await query.all();
    return response({ missions: result.results, count: result.results.length, correlationId });
  }

  if (request.method === "GET" && url.pathname === `${API_PREFIX}/capacity`) {
    requireAuthority(actor, "read");
    const active = await env.CONTINUUM_DB.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(weighted_mission_units), 0) AS wmu FROM missions WHERE tenant_id = ? AND state IN ('queued','running')").bind(actor.tenantId).first<{ count: number; wmu: number }>();
    return response({ capacity: { configuredWeightedMissionUnits: 4, configuredMissionConcurrency: 4, providerConcurrency: 1, activeMissions: active?.count ?? 0, activeWeightedMissionUnits: active?.wmu ?? 0, certified: false }, correlationId });
  }

  if (!missionMatch) throw new RuntimeError("route_not_found", "Route not found.", 404);
  const missionId = missionMatch[1]!;
  const action = missionMatch[2];
  const stub = missionStub(env, actor.tenantId, missionId);

  if (request.method === "GET" && !action) {
    requireAuthority(actor, "read");
    const mission = await stub.getMission(actor.tenantId);
    if (!mission) throw new RuntimeError("mission_not_found", "Mission does not exist.", 404);
    return response({ mission, correlationId });
  }

  if (request.method === "GET" && action === "events") {
    requireAuthority(actor, "read");
    return stub.fetch(request);
  }

  if (request.method === "GET" && action === "artifacts") {
    requireAuthority(actor, "read");
    const artifacts = await env.CONTINUUM_DB.prepare("SELECT id, storage_key, sha256, size_bytes, media_type, created_at FROM artifacts WHERE tenant_id = ? AND mission_id = ? ORDER BY created_at").bind(actor.tenantId, missionId).all();
    return response({ artifacts: artifacts.results, correlationId });
  }

  if (request.method === "GET" && action === "lineage") {
    requireAuthority(actor, "read");
    const lineage = await env.CONTINUUM_DB.prepare("SELECT id, parent_mission_id, group_id FROM missions WHERE tenant_id = ? AND (id = ? OR parent_mission_id = ?)").bind(actor.tenantId, missionId, missionId).all();
    const dependencies = await env.CONTINUUM_DB.prepare("SELECT mission_id, depends_on_mission_id, dependency_type FROM mission_dependencies WHERE mission_id = ? OR depends_on_mission_id = ?").bind(missionId, missionId).all();
    return response({ lineage: lineage.results, dependencies: dependencies.results, correlationId });
  }

  if (request.method === "PATCH" && !action) {
    const data = await body(request);
    if (!Number.isInteger(data.expectedVersion) || (data.expectedVersion as number) < 1) throw new RuntimeError("invalid_version", "expectedVersion must be a positive integer.", 422);
    const priority = data.priority === undefined ? undefined : Number(data.priority);
    if (priority !== undefined && (!Number.isInteger(priority) || priority < 0 || priority > 100)) throw new RuntimeError("invalid_priority", "priority must be an integer from 0 through 100.", 422);
    const title = optionalText(data.title, "title", 160);
    const objective = optionalText(data.objective, "objective", 4000);
    const constraints = stringList(data.constraints, "constraints");
    const successCriteria = stringList(data.successCriteria, "successCriteria");
    const currentOperation = optionalText(data.currentOperation, "currentOperation", 500);
    const mission = await stub.modifyMission({ tenantId: actor.tenantId, actor, expectedVersion: data.expectedVersion as number, idempotencyKey: text(request.headers.get("idempotency-key"), "Idempotency-Key", 128),
      ...(title !== undefined ? { title } : {}), ...(objective !== undefined ? { objective } : {}),
      ...(constraints !== undefined ? { constraints } : {}), ...(successCriteria !== undefined ? { successCriteria } : {}),
      ...(priority !== undefined ? { priority } : {}), ...(currentOperation !== undefined ? { currentOperation } : {}),
    });
    await indexMission(env, mission, actor.source);
    return response({ mission, correlationId });
  }

  if (request.method === "POST" && ["pause", "resume", "cancel", "reprioritize", "redirect", "approve", "reject", "retry"].includes(action ?? "")) {
    const data = await body(request);
    if (!Number.isInteger(data.expectedVersion) || (data.expectedVersion as number) < 1) throw new RuntimeError("invalid_version", "expectedVersion must be a positive integer.", 422);
    const key = text(request.headers.get("idempotency-key"), "Idempotency-Key", 128);
    if (action === "reprioritize" || action === "redirect") {
      const priority = action === "reprioritize" ? Number(data.priority) : undefined;
      if (priority !== undefined && (!Number.isInteger(priority) || priority < 0 || priority > 100)) throw new RuntimeError("invalid_priority", "priority must be an integer from 0 through 100.", 422);
      const mission = await stub.modifyMission({ tenantId: actor.tenantId, actor, expectedVersion: data.expectedVersion as number, idempotencyKey: key, ...(priority !== undefined ? { priority } : {}), ...(action === "redirect" ? { objective: text(data.objective, "objective", 4000) } : {}) });
      await indexMission(env, mission, actor.source);
      return response({ mission, correlationId });
    }
    const target = action === "pause" ? "paused" : action === "resume" || action === "retry" ? "queued" : action === "cancel" || action === "reject" ? "cancelled" : "approved";
    const mission = await stub.transition({ tenantId: actor.tenantId, actor, target, expectedVersion: data.expectedVersion as number, idempotencyKey: key, ...(action === "approve" ? { approvalEvidence: text(data.approvalEvidence, "approvalEvidence", 2000) } : {}), reason: typeof data.reason === "string" ? data.reason : `Mission ${action}.` });
    await indexMission(env, mission, actor.source);
    if (action === "resume" || action === "retry") await env.CONTINUUM_QUEUE.send({ missionId, tenantId: actor.tenantId, expectedVersion: mission.version, correlationId, requestedBy: actor.id, runtimeMode: env.XEN_RUNTIME_MODE });
    return response({ mission, ...(action === "resume" || action === "retry" ? { queued: true } : {}), correlationId }, action === "resume" || action === "retry" ? 202 : 200);
  }

  if (request.method === "POST" && action === "transitions") {
    const data = await body(request);
    if (!isMissionState(data.target)) throw new RuntimeError("invalid_state", "target is invalid.", 422);
    if (!Number.isInteger(data.expectedVersion) || (data.expectedVersion as number) < 1) {
      throw new RuntimeError("invalid_version", "expectedVersion must be a positive integer.", 422);
    }
    const mission = await stub.transition({
      tenantId: actor.tenantId,
      actor,
      target: data.target,
      expectedVersion: data.expectedVersion as number,
      idempotencyKey: text(request.headers.get("idempotency-key"), "Idempotency-Key", 128),
      ...(typeof data.approvalEvidence === "string" ? { approvalEvidence: data.approvalEvidence } : {}),
      ...(typeof data.reason === "string" ? { reason: data.reason } : {}),
    });
    await indexMission(env, mission);
    return response({ mission, correlationId });
  }

  if (request.method === "POST" && action === "dispatch") {
    requireAuthority(actor, "execute");
    assertExecutionAvailable(env);
    const data = await body(request);
    if (!Number.isInteger(data.expectedVersion) || (data.expectedVersion as number) < 1) {
      throw new RuntimeError("invalid_version", "expectedVersion must be a positive integer.", 422);
    }
    const mission = await stub.transition({
      tenantId: actor.tenantId,
      actor,
      target: "queued",
      expectedVersion: data.expectedVersion as number,
      idempotencyKey: text(request.headers.get("idempotency-key"), "Idempotency-Key", 128),
      reason: "Approved mission dispatched to the local queue.",
    });
    await indexMission(env, mission);
    await env.CONTINUUM_QUEUE.send({
      missionId,
      tenantId: actor.tenantId,
      expectedVersion: mission.version,
      correlationId,
      requestedBy: actor.id,
      runtimeMode: env.XEN_RUNTIME_MODE,
    });
    return response({ mission, queued: true, correlationId }, 202);
  }

  if (request.method === "POST" && action === "artifacts") {
    requireAuthority(actor, "execute");
    const mission = await stub.getMission(actor.tenantId);
    if (!mission) throw new RuntimeError("mission_not_found", "Mission does not exist.", 404);
    const artifact = await storeArtifact(env.CONTINUUM_ARTIFACTS, actor.tenantId, missionId, request);
    ctx.waitUntil(
      env.CONTINUUM_DB.prepare(
        "INSERT INTO artifacts(id, tenant_id, mission_id, storage_key, sha256, size_bytes, media_type, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          crypto.randomUUID(),
          actor.tenantId,
          missionId,
          artifact.key,
          artifact.sha256,
          artifact.size,
          request.headers.get("content-type") ?? "application/octet-stream",
          actor.id,
          new Date().toISOString(),
        )
        .run(),
    );
    return response({ artifact, correlationId }, 201);
  }

  throw new RuntimeError("route_not_found", "Route not found.", 404);
}

const worker: ExportedHandler<Env, DispatchMessage> = {
  async fetch(request, env, ctx): Promise<Response> {
    const correlationId = request.headers.get("x-correlation-id")?.trim() || crypto.randomUUID();
    try {
      return await route(request, env, ctx);
    } catch (error) {
      const runtimeError =
        error instanceof RuntimeError
          ? error
          : new RuntimeError("internal_error", "The runtime could not complete the request.", 500);
      console.error(
        JSON.stringify({
          level: "error",
          code: runtimeError.code,
          correlationId,
          message: messageFrom(error),
        }),
      );
      return response(
        { error: { code: runtimeError.code, message: runtimeError.message, correlationId } },
        runtimeError.status,
      );
    }
  },

  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      const payload = message.body;
      try {
        assertExecutionAvailable(env);
        const admission = await reserveMissionAdmission(env.CONTINUUM_DB, payload.missionId);
        if (!admission) {
          message.retry({ delaySeconds: 5 });
          continue;
        }
        try {
          await env.CONTINUUM_DB.prepare(
            "INSERT OR IGNORE INTO queue_receipts(id, tenant_id, mission_id, correlation_id, status, received_at) VALUES (?, ?, ?, ?, 'received', ?)",
          )
            .bind(message.id, payload.tenantId, payload.missionId, payload.correlationId, new Date().toISOString())
            .run();
          await env.CONTINUUM_WORKFLOW.create({
            id: `${payload.missionId}-${payload.expectedVersion}`,
            params: { ...payload, admissionId: admission.id, admissionToken: admission.token },
          });
          message.ack();
        } catch (error) {
          await releaseMissionAdmission(env.CONTINUUM_DB, admission);
          throw error;
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            code: "queue_dispatch_failed",
            correlationId: payload.correlationId,
            message: messageFrom(error),
          }),
        );
        message.retry({ delaySeconds: 5 });
      }
    }
  },
};

export default worker;
