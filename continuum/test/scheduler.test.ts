import { applyD1Migrations, env, type D1Migration } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import {
  effectivePriority,
  releaseMissionAdmission,
  reserveMissionAdmission,
  selectAdmissions,
  type SchedulingCandidate,
} from "../src/scheduler";

const now = "2026-07-19T18:00:00.000Z";
const candidate = (id: string, overrides: Partial<SchedulingCandidate> = {}): SchedulingCandidate => ({
  id, tenantId: "workspace-a", priority: 50, weightedMissionUnits: 1,
  createdAt: "2026-07-19T17:00:00.000Z", tenantRunning: 0, blocked: false, ...overrides,
});

describe("priority-aware weighted scheduler", () => {
  beforeAll(async () => {
    const testEnv = env as Env & { TEST_D1_MIGRATIONS: D1Migration[] };
    await applyD1Migrations(testEnv.CONTINUUM_DB, testEnv.TEST_D1_MIGRATIONS);
  });

  it("admits higher priority work within both capacity limits", () => {
    const selected = selectAdmissions([
      candidate("low", { priority: 20 }), candidate("high", { priority: 90, weightedMissionUnits: 2 }), candidate("middle", { priority: 50, weightedMissionUnits: 2 }),
    ], { maxMissions: 2, maxWeightedMissionUnits: 3, runningMissions: 0, runningWeightedMissionUnits: 0, now });
    expect(selected).toEqual(["high", "low"]);
  });

  it("excludes blocked work and respects the running envelope", () => {
    expect(selectAdmissions([
      candidate("blocked", { priority: 100, blocked: true }), candidate("ready", { weightedMissionUnits: 2 }),
    ], { maxMissions: 4, maxWeightedMissionUnits: 4, runningMissions: 3, runningWeightedMissionUnits: 3, now })).toEqual([]);
  });

  it("adds bounded aging to prevent starvation", () => {
    const old = candidate("old", { priority: 50, createdAt: "2026-07-14T18:00:00.000Z" });
    expect(effectivePriority(old, now)).toBe(70);
    expect(selectAdmissions([candidate("new", { priority: 65 }), old], {
      maxMissions: 1, maxWeightedMissionUnits: 4, runningMissions: 0, runningWeightedMissionUnits: 0, now,
    })).toEqual(["old"]);
  });

  it("uses tenant activity as a fairness tie-breaker", () => {
    expect(selectAdmissions([
      candidate("busy", { tenantId: "workspace-b", tenantRunning: 2 }), candidate("idle", { tenantId: "workspace-a", tenantRunning: 0 }),
    ], { maxMissions: 1, maxWeightedMissionUnits: 4, runningMissions: 0, runningWeightedMissionUnits: 0, now })).toEqual(["idle"]);
  });

  it("atomically caps simultaneous multi-tenant admissions at four missions and four WMU", async () => {
    const suffix = crypto.randomUUID();
    const admittedAt = "2026-07-23T18:00:00.000Z";
    const missionIds = Array.from({ length: 12 }, (_, index) => `${suffix}-mission-${index}`);
    await env.CONTINUUM_DB.batch(
      missionIds.flatMap((missionId, index) => {
        const tenantId = `${suffix}-tenant-${index}`;
        return [
          env.CONTINUUM_DB.prepare(
            "INSERT INTO tenants(id, name, status, created_at) VALUES (?, ?, 'active', ?)",
          ).bind(tenantId, tenantId, admittedAt),
          env.CONTINUUM_DB.prepare(
            `INSERT INTO missions(
               id, tenant_id, title, objective, state, risk, version, created_by, created_at, updated_at,
               weighted_mission_units, priority
             ) VALUES (?, ?, ?, 'race proof', 'queued', 'low', 1, 'test', ?, ?, 1, ?)`,
          ).bind(missionId, tenantId, missionId, admittedAt, admittedAt, 100 - index),
        ];
      }),
    );

    const reservations = (
      await Promise.all(missionIds.map((missionId) => reserveMissionAdmission(env.CONTINUUM_DB, missionId, admittedAt)))
    ).filter((reservation) => reservation !== null);

    expect(reservations).toHaveLength(4);
    const capacity = await env.CONTINUUM_DB.prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(weighted_mission_units), 0) AS wmu
       FROM mission_admissions
       WHERE released_at IS NULL AND expires_at > ?`,
    ).bind(admittedAt).first<{ count: number; wmu: number }>();
    expect(capacity).toEqual({ count: 4, wmu: 4 });

    await Promise.all(reservations.map((reservation) => releaseMissionAdmission(env.CONTINUUM_DB, reservation, admittedAt)));
    await env.CONTINUUM_DB.prepare(
      `UPDATE missions SET state = 'cancelled' WHERE id IN (${missionIds.map(() => "?").join(", ")})`,
    ).bind(...missionIds).run();
  });

  it("reclaims an expired reservation before admitting the mission again", async () => {
    const suffix = crypto.randomUUID();
    const tenantId = `${suffix}-tenant`;
    const missionId = `${suffix}-mission`;
    const firstAt = "2026-07-23T18:00:00.000Z";
    await env.CONTINUUM_DB.batch([
      env.CONTINUUM_DB.prepare(
        "INSERT INTO tenants(id, name, status, created_at) VALUES (?, ?, 'active', ?)",
      ).bind(tenantId, tenantId, firstAt),
      env.CONTINUUM_DB.prepare(
        `INSERT INTO missions(
           id, tenant_id, title, objective, state, risk, version, created_by, created_at, updated_at
         ) VALUES (?, ?, ?, 'expiry proof', 'queued', 'low', 1, 'test', ?, ?)`,
      ).bind(missionId, tenantId, missionId, firstAt, firstAt),
    ]);
    const first = await reserveMissionAdmission(env.CONTINUUM_DB, missionId, firstAt);
    expect(first).not.toBeNull();

    const second = await reserveMissionAdmission(env.CONTINUUM_DB, missionId, "2026-07-23T18:06:00.000Z");
    expect(second).not.toBeNull();
    expect(second?.id).not.toBe(first?.id);
    if (second) await releaseMissionAdmission(env.CONTINUUM_DB, second, "2026-07-23T18:06:00.000Z");
  });
});
