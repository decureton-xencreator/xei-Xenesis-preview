import type { Actor, Mission, MissionState, TransitionInput } from "./contracts";
import { RuntimeError } from "./errors";
import { requireAuthority } from "./auth";

const transitions: Record<MissionState, readonly MissionState[]> = {
  draft: ["awaiting_approval", "cancelled"],
  awaiting_approval: ["approved", "draft", "cancelled"],
  approved: ["queued", "cancelled"],
  queued: ["running", "paused", "cancelled"],
  running: ["paused", "succeeded", "failed", "cancelled"],
  paused: ["queued", "cancelled"],
  succeeded: [],
  failed: ["queued", "cancelled"],
  cancelled: [],
};

function requiredAuthority(target: MissionState): "propose" | "approve" | "execute" {
  if (target === "approved") return "approve";
  if (["queued", "running", "paused", "succeeded", "failed", "cancelled"].includes(target)) return "execute";
  return "propose";
}

export function transitionMission(mission: Mission, input: TransitionInput, now: string): Mission {
  if (mission.tenantId !== input.tenantId || mission.tenantId !== input.actor.tenantId) {
    throw new RuntimeError("tenant_boundary", "Mission tenant does not match the authenticated tenant.", 404);
  }
  if (mission.version !== input.expectedVersion) {
    throw new RuntimeError("version_conflict", "Mission version does not match expectedVersion.", 409);
  }
  if (!transitions[mission.state].includes(input.target)) {
    throw new RuntimeError(
      "invalid_transition",
      `Transition from ${mission.state} to ${input.target} is not allowed.`,
      409,
    );
  }
  requireAuthority(input.actor, requiredAuthority(input.target));
  if (mission.risk === "critical" && ["queued", "running"].includes(input.target)) {
    throw new RuntimeError("critical_risk_denied", "Critical-risk execution is denied by Stage 2 policy.", 403);
  }
  if (input.target === "approved" && !input.approvalEvidence?.trim()) {
    throw new RuntimeError("approval_evidence_required", "Approval evidence is required.", 422);
  }
  if (input.target === "queued" && !mission.approval) {
    throw new RuntimeError("approval_required", "Mission must have recorded approval before dispatch.", 403);
  }

  return {
    ...mission,
    state: input.target,
    version: mission.version + 1,
    updatedAt: now,
    ...(input.target === "approved"
      ? {
          approval: {
            actorId: input.actor.id,
            approvedAt: now,
            evidence: input.approvalEvidence!.trim(),
          },
        }
      : {}),
  };
}
