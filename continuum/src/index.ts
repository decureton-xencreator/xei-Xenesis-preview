import { API_PREFIX, isMissionState, isRiskLevel, type DispatchMessage, type Mission } from "./contracts";
import { authenticate, requireAuthority } from "./auth";
import { RuntimeError, messageFrom } from "./errors";
import { storeArtifact } from "./artifacts";
import { MissionCoordinator } from "./durable/mission-coordinator";
import { MissionWorkflow } from "./workflows/mission-workflow";

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
    new RegExp(`^${API_PREFIX}/missions/([0-9a-fA-F-]+)(?:/(transitions|dispatch|events|artifacts))?$`),
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
        await env.CONTINUUM_DB.prepare(
          "INSERT INTO queue_receipts(id, tenant_id, mission_id, correlation_id, status, received_at) VALUES (?, ?, ?, ?, 'received', ?)",
        )
          .bind(message.id, payload.tenantId, payload.missionId, payload.correlationId, new Date().toISOString())
          .run();
        await env.CONTINUUM_WORKFLOW.create({
          id: `${payload.missionId}-${payload.expectedVersion}`,
          params: payload,
        });
        message.ack();
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
