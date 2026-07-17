import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { Actor, MissionWorkflowParams } from "../contracts";

export class MissionWorkflow extends WorkflowEntrypoint<Env, MissionWorkflowParams> {
  override async run(event: WorkflowEvent<MissionWorkflowParams>, step: WorkflowStep): Promise<void> {
    const params = event.payload;
    const id = this.env.CONTINUUM_MISSION.idFromName(`${params.tenantId}:${params.missionId}`);
    const stub = this.env.CONTINUUM_MISSION.get(id);
    const actor: Actor = {
      id: "continuum-workflow",
      tenantId: params.tenantId,
      authorities: ["execute"],
      source: "local-development",
    };

    const running = await step.do(
      "mark-running",
      { retries: { limit: 3, delay: "1 second", backoff: "exponential" }, timeout: "1 minute" },
      async () =>
        stub.transition({
          tenantId: params.tenantId,
          actor,
          target: "running",
          expectedVersion: params.expectedVersion,
          idempotencyKey: `${params.correlationId}:running`,
          reason: "Local Workflow execution started.",
        }),
    );

    await step.do(
      "complete-bounded-runtime",
      { retries: { limit: 3, delay: "1 second", backoff: "exponential" }, timeout: "1 minute" },
      async () =>
        stub.transition({
          tenantId: params.tenantId,
          actor,
          target: "succeeded",
          expectedVersion: running.version,
          idempotencyKey: `${params.correlationId}:succeeded`,
          reason: "Bounded local runtime completed without external side effects.",
        }),
    );
  }
}
