# Stage 2 Continuity

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

Do not deploy this configuration as-is. Its D1 identifier is an explicit local placeholder and its resource names are local-development names. Production or staging requires a separate authorization to select an account and deployment target, provision or map resources, configure cryptographically verified Cloudflare Access, enter secrets interactively, set cost limits, run capped live tests, and approve publication.
