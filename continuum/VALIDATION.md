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
