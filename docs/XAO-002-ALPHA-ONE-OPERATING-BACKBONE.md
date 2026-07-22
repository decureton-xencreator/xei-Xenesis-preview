# XAO-002 — Xen Alpha One Operating Backbone

Status: **Repository backbone complete / external deployment pending**  
Date: **2026-07-21**  
Governance: **Warden fail-closed truth boundary**

## Executed slice

The first Alpha One Phase 2 runtime slice establishes a governed core for the live guide inside every Living Manual.

It now provides inspectable repository behavior for:

- retrieval from approved manual sources only;
- source and version citation;
- English and approved Spanish responses;
- escalation when knowledge or an approved translation is absent;
- role-play explicitly separated from live employment evaluation;
- manager-approved rubric scoring;
- employee observations routed as proposals that cannot self-publish.
- authenticated actor and permission enforcement;
- fail-closed tenant isolation for answers and proposals;
- explicit demonstration-versus-live provenance labels;
- append-only JSONL audit persistence with tenant-filtered reads.
- governed model-adapter contract that rejects uncited or citation-changing output.

Implementation:

- `src/alpha-one/living-manual-core.js`
- `src/alpha-one/living-manual-service.js`
- `src/alpha-one/file-audit-store.js`
- `src/alpha-one/governed-model-adapter.js`
- `content/alpha-one-bdc-approved-sources.json`
- `tests/alpha-one-living-manual.test.mjs`

## Truth boundary

This is a deterministic, tested service boundary for the conversational Living Manual. Identity claims are accepted and enforced by the service, but a production identity provider is not yet connected. It is not yet a connected generative model, speech service, production knowledge store, or live Checkmate deployment.

The Checkmate fixture is non-production proof material. Activation still requires a named organizational sponsor, approved source inventory, access and privacy boundaries, success measures, commercial authorization, and deployment evidence.

## Next execution gate

The service is connected to the XEI-005 employee interface, and the governed model-adapter boundary is implemented. Connect an approved production model and identity provider after vendor selection. Consented voice and real approved Checkmate sources remain gated on organizational authorization.
