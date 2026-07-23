# XEN-CPC-001 Stage 2 Validation Evidence

Date: 2026-07-18  
Scope: synchronized local repository validation only  
Status: local gates passed; remote infrastructure gates remain open

Passed:

- current production experience validator, including the restored private-choice telemetry client
- bounded-module, family-dependency, and secret-exposure structural validation
- strict TypeScript compilation
- 10 Vitest cases covering mission state, authority, tenant isolation, provider errors, and Worker routing
- exact 20-table D1 migration structure
- Wrangler type generation with pinned Wrangler 4.112.0
- local D1 migration application: 26 commands, migration `0001_stage2_runtime.sql`
- Wrangler deployment dry-run: 20.67 KiB upload, 5.67 KiB gzip, with Durable Object, Workflow, Queue, D1, R2, and environment bindings resolved
- Git diff whitespace/error check

Synchronization corrections:

- Added `src/choice-telemetry.js`, which current mainline referenced and validated but did not contain.
- Reconciled stale validator expectations with the active `system-tts-disabled-1`, four-audience runtime.
- Evaluated Wrangler's optional Node type-package recommendation; it conflicts with this pinned TypeScript 7 workflow and was not retained because the generated Worker types and strict compilation already pass without it.
- Corrected the capability manifest so nonexistent XRI-006 is prospective, not falsely canonical.

Wrangler emitted a sandbox-local logging warning when the default `/root/.config` path was unavailable. Re-running with a writable temporary configuration path removed that warning. In this environment Wrangler left an idle proxy handle after printing successful completion; it was terminated after the results above were emitted.

No remote, physical-device, Cloudflare account, Access JWT, provider, load, cost, cross-device, or deployment evidence is claimed.

## Claude staging connection — 2026-07-18

- Cloudflare secret metadata verified: `ANTHROPIC_API_KEY` exists as `secret_text`; its value was not read or logged.
- Full `npm run validate`: passed (production shell, structure, TypeScript, 13 Continuum tests).
- Wrangler staging dry-run passed with D1, R2, Queue, Workflow, and Durable Object bindings.
- Staging deployment version: `63551857-c749-403c-a0d7-c32b642677d8`.
- Provider invocation is limited to one non-retried call, 1,024 output tokens, a $0.10 configured mission budget, one configured concurrent Anthropic request, and an approved queued mission.
- No live Anthropic request has been made. Staging authentication remains fail-closed until Cloudflare Access JWT issuer/audience verification is configured.

## Cloudflare Access verification — 2026-07-18

- Access application `Xen Continuum Stage 2 Staging` created for the exact staging Worker hostname.
- Access returned an unauthenticated HTTP 302 to the verified team domain.
- RS256 signature verification uses Cloudflare's remote JWKS and enforces issuer, audience, expiry, not-before, subject, application-token type, and an owner-email SHA-256 allowlist.
- Full validation passed with 14 Continuum tests before deployment.
- JWT verifier staging Worker version: `428f430c-d79c-4f19-bea2-b0b3c80e3e38`.
- Authenticated browser-session verification and the capped live Claude smoke test remain open; no provider call or cost is claimed.
- Owner-only, same-origin smoke approval page deployed in Worker version `05357672-bb0f-4674-a1d0-23db849613c5`; it is idempotent and cannot invoke Claude until the protected approval button is pressed.
- First live attempt failed before reaching Anthropic because the stored fetch function was invoked with an invalid receiver. No tokens, cost, artifact, or completion evidence were recorded; the mission correctly failed and produced a dead-letter record.
- Receiver-binding regression test added; 15 Continuum tests pass. Repaired one-time smoke gate deployed in Worker version `379b7478-9661-46a0-ac2d-f8e034026642` and requires a new explicit owner approval.
- Diagnostic mission `0003` identified `TypeError: Invalid header value` before Anthropic accepted the request. No tokens, cost, artifact, or completion evidence were recorded.
- Credential boundary now trims surrounding copy/paste whitespace and rejects remaining control characters; 17 Continuum tests pass. Mission `0004` gate deployed in Worker version `ddbab580-d369-4636-8abd-86168fcc499c` and requires explicit owner approval.
- Mission `0004` confirmed the original protected secret contained an internal control character and was rejected before provider acceptance. The secret was replaced without exposing its value.
- Mission `0005` completed successfully in staging Worker version `f746b365-efa5-4b27-b62e-4cd4735a01d3`.
- Cloudflare Workflow completed all five governed steps in 2 seconds: authority/load, checkpoint, running transition, provider invocation, and validation/completion.
- Anthropic invocation `15288e47-99f6-4aa7-aa87-ebcce7a7b513` used `claude-sonnet-5`: 117 input tokens, 24 output tokens, estimated cost `$0.000474`.
- D1 mission state is `succeeded` at version 6; provider invocation and Workflow state are `succeeded`; no mission `0005` dead-letter exists.
- R2 artifact is 50 bytes and contains exactly `XEN-CPC-001 Claude provider smoke test successful.`
- R2 content SHA-256, D1 artifact hash, and D1 validation-evidence hash all match: `044436c990cbbac9fa00a696c3e9f4366f84b8fa5b40cc6f704ff5231e9b270d`.

## Staging evidence — 2026-07-19

- Cloudflare account verified: `724d8b5c193838ea2871cca7aef7e0fb`.
- R2 bucket created: `xen-continuum-stage2-staging-artifacts`.
- D1 database created: `xen-continuum-stage2-staging` (`4e502b48-4281-4e87-89aa-6d840e40c81a`).
- D1 migration `0001_stage2_runtime.sql` applied remotely: 26 commands succeeded.
- Mission and dead-letter queues created.
- Durable Object and Workflow bindings deployed.
- Worker version: `b80bdb28-953c-4010-ae9a-724133c38aae`.
- Health endpoint returned HTTP 200 with `mode: staging` and `externalEffects: disabled`.
- Anthropic secret absent; model execution disabled; no provider call or cost incurred.

The earlier statement denying all remote deployment evidence is retained as the historical local-validation boundary. This section is the later, bounded staging evidence and does not establish provider, Access, cross-device, load, cost, or production certification.

## Governor and scheduler validation — 2026-07-19

- Worker version `5c222158-1e20-4bdb-ba65-41e5bc53d5d4` enforces dependency checks, pre-call budgets, Safe Mode, emergency stop, leases, locks, and pre-provider mission-state revalidation.
- Canonical migration `0004_canonical_evidence_backfill.sql` applied remotely and reconciled the proven smoke evidence into `mission_costs`, `provider_calls`, `mission_artifacts`, and `mission_validation_evidence` without a new provider call.
- The queue admission scheduler adds priority, bounded aging, tenant-activity fairness, scheduled-time eligibility, dependency exclusion, and the four-mission/four-WMU candidate envelope.
- Strict TypeScript and 27 runtime tests across six files pass. Scheduler tests cover priority, both capacity dimensions, blocked dependencies, bounded starvation aging, and the fairness tie-break.
- These are implementation and staging-validation facts, not a production concurrency certification. Multi-tenant load, workflow-start races, crash recovery, and repository-conflict measurements remain open.
- Migration `0005_global_provider_lock.sql` corrects the preliminary tenant-scoped provider lock to a globally unique active provider lock, matching the configured Anthropic concurrency limit of one.

## Guard-expiry and retry-safety validation — 2026-07-23

- Expired worker leases and provider resource locks are reclaimed atomically with abandoned-attempt evidence.
- Recovery classifies interruption before provider dispatch as retry-safe.
- Interruption after provider dispatch is classified ambiguous and non-retryable, preventing duplicate paid Claude calls when acceptance is unknown.
- Recorded terminal provider results remain non-retryable even if dispatch telemetry is incomplete.
- Strict TypeScript, the certified Xenesis shell gate, structure/secret scan, and 32 Continuum tests pass locally.
- No staging deployment or Anthropic request is claimed by this local validation record.

## Atomic multi-tenant admission validation — 2026-07-23

- Migration `0006_atomic_mission_admission.sql` adds a durable, expiring admission ledger with one active reservation per mission.
- Queue consumers must atomically reserve capacity before Workflow creation; the D1 insert rechecks both the four-mission and four-WMU limits at the write boundary.
- A real local D1 race test launched 12 simultaneous admissions across 12 tenants. Exactly four reservations totaling four WMU succeeded; eight were denied.
- Expired reservations are reclaimed before scheduling, failed Workflow dispatch releases its reservation, duplicate Queue receipts are idempotent, and Workflow execution fails closed without admission evidence.
- Strict TypeScript, the certified Xenesis shell gate, structure/secret scan, all 34 Continuum tests, local application of all six migrations, and the exact staging-environment dry run pass.
- This closes the admission-race implementation gate locally. It does not claim a remote load benchmark, staging deployment, higher Anthropic concurrency, or a new provider invocation.
