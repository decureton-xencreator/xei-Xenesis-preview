import { describe, expect, it } from "vitest";
import { classifyInterruptedAttempt, conservativeAnthropicEstimate, decideBudget, reclaimExpiredExecutionGuards } from "../src/governor";

describe("adaptive concurrency and cost governor", () => {
  const base = { missionLimitUsd: 0.1, dailyLimitUsd: 5, monthlyLimitUsd: 50, dailyActualUsd: 0, monthlyActualUsd: 0, estimatedCallUsd: 0.01, providerCallsUsed: 0, providerCallLimit: 1 };

  it("allows a bounded first provider call", () => {
    const decision = decideBudget(base);
    expect(decision.allowed).toBe(true);
    expect(decision.remainingMissionUsd).toBeCloseTo(0.09, 8);
  });

  it.each([
    [{ ...base, estimatedCallUsd: 0.11 }, "mission_budget"],
    [{ ...base, dailyActualUsd: 4.995 }, "daily_budget"],
    [{ ...base, monthlyActualUsd: 49.995 }, "monthly_budget"],
    [{ ...base, providerCallsUsed: 1 }, "provider_call_limit"],
  ] as const)("fails closed before provider invocation", (envelope, reason) => {
    expect(decideBudget(envelope)).toMatchObject({ allowed: false, reason });
  });

  it("estimates a worst-case call before authorization", () => {
    expect(conservativeAnthropicEstimate("x".repeat(300), 1024)).toBeCloseTo(0.010952, 6);
  });

  it("permits retry only when interruption is proven to precede provider dispatch", () => {
    expect(classifyInterruptedAttempt({ providerDispatchStarted: false, providerResultRecorded: false }))
      .toBe("retry_safe_before_provider_dispatch");
  });

  it("never auto-retries an ambiguous interruption after provider dispatch", () => {
    expect(classifyInterruptedAttempt({ providerDispatchStarted: true, providerResultRecorded: false }))
      .toBe("ambiguous_after_provider_dispatch_no_retry");
  });

  it("never retries a recorded terminal provider result", () => {
    expect(classifyInterruptedAttempt({ providerDispatchStarted: true, providerResultRecorded: true }))
      .toBe("terminal_provider_result_no_retry");
  });

  it("treats a recorded provider result as terminal even if dispatch telemetry is incomplete", () => {
    expect(classifyInterruptedAttempt({ providerDispatchStarted: false, providerResultRecorded: true }))
      .toBe("terminal_provider_result_no_retry");
  });

  it("reclaims expired guards and writes abandoned-attempt evidence atomically", async () => {
    const statements: Array<{ sql: string; bindings: unknown[] }> = [];
    const db = {
      prepare(sql: string) {
        const statement = { sql, bindings: [] as unknown[] };
        statements.push(statement);
        return { bind: (...bindings: unknown[]) => ({ ...statement, bindings }) };
      },
      async batch(items: unknown[]) {
        expect(items).toHaveLength(3);
        return [];
      },
    } as unknown as D1Database;
    await reclaimExpiredExecutionGuards(db, "2026-07-23T12:00:00.000Z");
    expect(statements[0]?.sql).toContain("state = 'abandoned'");
    expect(statements[0]?.sql).toContain("ambiguous_after_provider_dispatch_no_retry");
    expect(statements[1]?.sql).toContain("UPDATE worker_leases");
    expect(statements[2]?.sql).toContain("UPDATE resource_locks");
  });
});
