export const API_PREFIX = "/api/v1/continuum";

export const missionStates = [
  "draft",
  "awaiting_approval",
  "approved",
  "queued",
  "running",
  "paused",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type MissionState = (typeof missionStates)[number];
export type AuthorityLevel = "read" | "propose" | "approve" | "execute" | "admin";
export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface Actor {
  id: string;
  tenantId: string;
  authorities: AuthorityLevel[];
  source: "local-development" | "cloudflare-access";
}

export interface Mission {
  id: string;
  tenantId: string;
  title: string;
  objective: string;
  exactIntent?: string;
  constraints?: string[];
  successCriteria?: string[];
  capabilityClass?: string;
  weightedMissionUnits?: number;
  parentMissionId?: string;
  groupId?: string;
  priority?: number;
  progress?: number;
  currentOperation?: string;
  state: MissionState;
  risk: RiskLevel;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approval?: {
    actorId: string;
    approvedAt: string;
    evidence: string;
  };
}

export interface ModifyMissionInput {
  tenantId: string;
  actor: Actor;
  expectedVersion: number;
  idempotencyKey: string;
  title?: string;
  objective?: string;
  constraints?: string[];
  successCriteria?: string[];
  priority?: number;
  currentOperation?: string;
}

export interface CreateMissionInput {
  id: string;
  tenantId: string;
  title: string;
  objective: string;
  risk: RiskLevel;
  actor: Actor;
  idempotencyKey: string;
}

export interface TransitionInput {
  tenantId: string;
  actor: Actor;
  target: MissionState;
  expectedVersion: number;
  idempotencyKey: string;
  approvalEvidence?: string;
  reason?: string;
}

export interface DispatchMessage {
  missionId: string;
  tenantId: string;
  expectedVersion: number;
  correlationId: string;
  requestedBy: string;
}

export interface MissionWorkflowParams extends DispatchMessage {
  runtimeMode?: string;
  admissionId?: string;
  admissionToken?: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    correlationId: string;
  };
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "low" || value === "moderate" || value === "high" || value === "critical";
}

export function isMissionState(value: unknown): value is MissionState {
  return typeof value === "string" && missionStates.includes(value as MissionState);
}
