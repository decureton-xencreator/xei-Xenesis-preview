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
