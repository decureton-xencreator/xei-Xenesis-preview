import { DurableObject } from "cloudflare:workers";
import type { CreateMissionInput, Mission, ModifyMissionInput, TransitionInput } from "../contracts";
import { RuntimeError } from "../errors";
import { requireAuthority } from "../auth";
import { transitionMission } from "../state-machine";

interface MissionRow {
  [key: string]: SqlStorageValue;
  document: string;
}

interface IdempotencyRow {
  [key: string]: SqlStorageValue;
  response: string;
}

export class MissionCoordinator extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS mission_state (singleton INTEGER PRIMARY KEY CHECK (singleton = 1), document TEXT NOT NULL)",
      );
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS idempotency (key TEXT PRIMARY KEY, response TEXT NOT NULL, created_at TEXT NOT NULL)",
      );
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS mission_events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, document TEXT NOT NULL, created_at TEXT NOT NULL)",
      );
    });
  }

  createMission(input: CreateMissionInput): Mission {
    requireAuthority(input.actor, "propose");
    if (input.actor.tenantId !== input.tenantId) {
      throw new RuntimeError("tenant_boundary", "Actor tenant does not match the mission tenant.", 403);
    }
    const replay = this.idempotentResult(input.idempotencyKey);
    if (replay) return replay;
    if (this.readMission()) {
      throw new RuntimeError("mission_exists", "Mission already exists.", 409);
    }

    const now = new Date().toISOString();
    const mission: Mission = {
      id: input.id,
      tenantId: input.tenantId,
      title: input.title,
      objective: input.objective,
      exactIntent: input.objective,
      constraints: [],
      successCriteria: [],
      capabilityClass: "analytical",
      weightedMissionUnits: 1,
      priority: 50,
      progress: 0,
      state: "draft",
      risk: input.risk,
      version: 1,
      createdBy: input.actor.id,
      createdAt: now,
      updatedAt: now,
    };
    this.persist(mission, "mission.created", input.idempotencyKey);
    return mission;
  }

  modifyMission(input: ModifyMissionInput): Mission {
    requireAuthority(input.actor, "propose");
    const replay = this.idempotentResult(input.idempotencyKey);
    if (replay) return replay;
    const mission = this.readMission();
    if (!mission || mission.tenantId !== input.tenantId) throw new RuntimeError("mission_not_found", "Mission does not exist.", 404);
    if (mission.version !== input.expectedVersion) throw new RuntimeError("version_conflict", "Mission version no longer matches expectedVersion.", 409);
    if (["running", "succeeded", "cancelled"].includes(mission.state)) throw new RuntimeError("mission_not_modifiable", `Mission cannot be modified while ${mission.state}.`, 409);
    const next: Mission = {
      ...mission,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.objective !== undefined ? { objective: input.objective, exactIntent: input.objective } : {}),
      ...(input.constraints !== undefined ? { constraints: input.constraints } : {}),
      ...(input.successCriteria !== undefined ? { successCriteria: input.successCriteria } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.currentOperation !== undefined ? { currentOperation: input.currentOperation } : {}),
      version: mission.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.persist(next, "mission.modified", input.idempotencyKey);
    return next;
  }

  getMission(tenantId: string): Mission | null {
    const mission = this.readMission();
    if (!mission || mission.tenantId !== tenantId) return null;
    return mission;
  }

  transition(input: TransitionInput): Mission {
    const replay = this.idempotentResult(input.idempotencyKey);
    if (replay) return replay;
    const mission = this.readMission();
    if (!mission) throw new RuntimeError("mission_not_found", "Mission does not exist.", 404);
    const next = transitionMission(mission, input, new Date().toISOString());
    this.persist(next, `mission.${next.state}`, input.idempotencyKey);
    return next;
  }

  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket upgrade required", { status: 426 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    server.send(JSON.stringify({ type: "mission.snapshot", mission: this.readMission() }));
    return new Response(null, { status: 101, webSocket: client });
  }

  override webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message === "string" && message === "ping") {
      socket.send(JSON.stringify({ type: "pong", at: new Date().toISOString() }));
    }
  }

  private readMission(): Mission | null {
    const rows = this.ctx.storage.sql
      .exec<MissionRow>("SELECT document FROM mission_state WHERE singleton = 1")
      .toArray();
    return rows[0] ? (JSON.parse(rows[0].document) as Mission) : null;
  }

  private idempotentResult(key: string): Mission | null {
    if (!key.trim()) throw new RuntimeError("idempotency_key_required", "Idempotency key is required.", 422);
    const rows = this.ctx.storage.sql
      .exec<IdempotencyRow>("SELECT response FROM idempotency WHERE key = ?", key)
      .toArray();
    return rows[0] ? (JSON.parse(rows[0].response) as Mission) : null;
  }

  private persist(mission: Mission, eventType: string, idempotencyKey: string): void {
    const document = JSON.stringify(mission);
    this.ctx.storage.transactionSync(() => {
      this.ctx.storage.sql.exec(
        "INSERT INTO mission_state(singleton, document) VALUES(1, ?) ON CONFLICT(singleton) DO UPDATE SET document = excluded.document",
        document,
      );
      this.ctx.storage.sql.exec(
        "INSERT INTO idempotency(key, response, created_at) VALUES(?, ?, ?)",
        idempotencyKey,
        document,
        mission.updatedAt,
      );
      this.ctx.storage.sql.exec(
        "INSERT INTO mission_events(event_type, document, created_at) VALUES(?, ?, ?)",
        eventType,
        document,
        mission.updatedAt,
      );
    });
    const event = JSON.stringify({ type: eventType, mission });
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(event);
      } catch {
        socket.close(1011, "Event delivery failed");
      }
    }
  }
}
