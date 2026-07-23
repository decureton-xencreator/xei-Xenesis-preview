import { describe, expect, it } from "vitest";
import type { Actor, Mission } from "../src/contracts";
import { RuntimeError } from "../src/errors";
import { transitionMission } from "../src/state-machine";

const approver: Actor = {
  id: "approver-1",
  tenantId: "tenant-1",
  authorities: ["propose", "approve", "execute"],
  source: "local-development",
};

function mission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "tenant-1",
    title: "Bounded mission",
    objective: "Prove governed local execution.",
    state: "awaiting_approval",
    risk: "moderate",
    version: 2,
    createdBy: "proposer-1",
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:01:00.000Z",
    ...overrides,
  };
}

describe("Stage 2 mission authority and state controls", () => {
  it("records approval evidence and advances optimistic version", () => {
    const result = transitionMission(
      mission(),
      {
        tenantId: "tenant-1",
        actor: approver,
        target: "approved",
        expectedVersion: 2,
        idempotencyKey: "approve-1",
        approvalEvidence: "Owner approved bounded local execution.",
      },
      "2026-07-17T00:02:00.000Z",
    );
    expect(result.state).toBe("approved");
    expect(result.version).toBe(3);
    expect(result.approval?.actorId).toBe("approver-1");
  });

  it("rejects stale optimistic versions", () => {
    expect(() =>
      transitionMission(
        mission(),
        {
          tenantId: "tenant-1",
          actor: approver,
          target: "approved",
          expectedVersion: 1,
          idempotencyKey: "stale",
          approvalEvidence: "approval",
        },
        "2026-07-17T00:02:00.000Z",
      ),
    ).toThrowError(expect.objectContaining<Partial<RuntimeError>>({ code: "version_conflict" }));
  });

  it("denies critical-risk dispatch even with execute authority", () => {
    expect(() =>
      transitionMission(
        mission({
          state: "approved",
          risk: "critical",
          approval: { actorId: "approver-1", approvedAt: "2026-07-17T00:02:00.000Z", evidence: "approval" },
        }),
        {
          tenantId: "tenant-1",
          actor: approver,
          target: "queued",
          expectedVersion: 2,
          idempotencyKey: "critical",
        },
        "2026-07-17T00:03:00.000Z",
      ),
    ).toThrowError(expect.objectContaining<Partial<RuntimeError>>({ code: "critical_risk_denied" }));
  });

  it("denies cross-tenant transitions", () => {
    expect(() =>
      transitionMission(
        mission(),
        {
          tenantId: "tenant-2",
          actor: { ...approver, tenantId: "tenant-2" },
          target: "approved",
          expectedVersion: 2,
          idempotencyKey: "cross-tenant",
          approvalEvidence: "approval",
        },
        "2026-07-17T00:02:00.000Z",
      ),
    ).toThrowError(expect.objectContaining<Partial<RuntimeError>>({ code: "tenant_boundary" }));
  });
});
