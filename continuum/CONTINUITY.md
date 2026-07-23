# Stage 2 Continuity

## 2026-07-19 governor milestone

- Added pre-provider dependency enforcement, conservative cost authorization, mission/daily/monthly budgets, provider-call limits, worker leases, provider resource locks, Safe Mode, emergency stop, and guaranteed normal-path release.
- Staging provider concurrency remains one. This is an enforced control, not evidence of a higher-concurrency production envelope.
- Continue with failure-injection guard-expiry/recovery tests, priority/fair scheduling, and server-backed Xenesis integration while preserving the shell isolation gate.

## 2026-07-19 scheduler milestone

- Queue consumption now admits only dependency-ready missions whose scheduled time has arrived.
- Admission is bounded by four simultaneous candidate missions and four Weighted Mission Units, while Anthropic provider concurrency remains separately locked to one.
- Effective priority uses bounded age escalation (one point per six queued hours, capped at 20) to limit starvation. Equal effective priority favors tenants with fewer running missions, then older work.
- The scheduler is an initial staging policy. Its fairness and latency envelope is not certified until multi-tenant load and failure-injection measurements are recorded.
- Continue with guard-expiry/recovery tests, retry classification, repository transactions, and server-backed Xenesis integration while preserving the shell isolation gate.

## 2026-07-23 recovery milestone

- Expired worker leases and provider locks are reclaimed together, and the interrupted running attempt is durably marked `abandoned`.
- Recovery evidence distinguishes work interrupted before provider dispatch from ambiguous interruption after dispatch.
- Any attempt with provider-dispatch evidence is classified `ambiguous_after_provider_dispatch_no_retry`; it is never automatically retried because the provider may have accepted a paid request before the interruption.
- Terminal provider results are also non-retryable. Only interruption proven to precede provider dispatch is classified retry-safe.
- Continue with multi-tenant race/load measurement and server-backed Xenesis integration. This recovery unit does not expand the certified provider-concurrency envelope or authorize a new Claude call.

## 2026-07-23 atomic admission milestone

- Queue admission now requires a durable D1 reservation before Workflow creation.
- The reservation write atomically rechecks the four-mission and four-WMU envelope, closing the prior read-then-dispatch race between simultaneous Queue consumers.
- Twelve simultaneous local D1 claimants across twelve tenants produced exactly four admissions totaling four WMU.
- Reservations expire after five minutes, are reclaimed before scheduling, release on dispatch failure, and convert to running mission state in the Workflow checkpoint.
- Continue with remote staging migration/deployment and representative latency/load measurement. Anthropic remains globally locked to one request, and no provider call is needed for this gate.

The production experience remains owned by the existing root index.html and its nine-scene client runtime. The Continuum module has no import, script tag, route, build step, or lifecycle dependency from that shell.

## Local continuation

Prerequisites: Node.js 22 or newer. Commands are local unless explicitly noted.

1. npm ci
2. npm run cf:typegen
3. npm run cf:migrate:local
4. npm test
5. npm run cf:dry-run
6. Optional local runtime: npx wrangler dev --config continuum/wrangler.jsonc --local

Local authenticated requests require X-Xen-Local-Actor, X-Xen-Local-Tenant, and X-Xen-Local-Authority. These headers are accepted only while both configured mode flags identify the local reconstruction. Non-local authentication fails closed because Access JWT verification is deliberately not configured.

## Recovery model

- Mission state and idempotency are owned by the SQLite Durable Object.
- D1 provides shared indexes, evidence, workflow, delivery, and dead-letter records.
- Queue delivery and completed execution are separate facts.
- Workflow steps use deterministic idempotency keys and retry limits.
- WebSocket clients reconnect and request the current Durable Object snapshot.
- R2 artifact keys are content-addressed by SHA-256.

## External boundary

The base configuration remains local-only. The explicit `staging` environment is deployed behind cryptographically verified Cloudflare Access with D1, Queue, Workflow, Durable Object and R2 bindings. Production remains unauthorized. Secrets must be entered interactively and must never enter source, logs, screenshots, generated files or deployment output.
