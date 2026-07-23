# XEN-CPC-001 Stage 2 Local Reconstruction Release Record

Version: 0.3.0-reconstruction
Status: local repository-validation candidate; not released or deployed
Date: 2026-07-18

This candidate is newly reconstructed from partial canonical evidence. It is not the missing historical implementation and does not reuse or claim recovery of missing commit identities.

The candidate is bounded to continuum/ plus repository-level development scripts and tests. Current production main and the nine-scene experience remain untouched. The candidate has no production route, remote binding, secret, provider activation, or certified operating envelope.

Repository validation results are recorded in VALIDATION.md. Any later staging release needs explicit authorization and new evidence; this record cannot be promoted by inference.

This revision synchronizes the candidate with implementation mainline `d026bdddaf721e889935029b9a2f41df74b73035`, records the verified family dependencies, and resolves the missing choice-telemetry and stale-validation conflicts discovered during synchronization.

Version 0.3.0 adds the production-oriented provider-neutral contract and Anthropic implementation for completion, streaming, tools, structured output, aborts, timeouts, retry classification, health, token accounting, and configurable cost accounting. It does not claim that Claude is connected: Cloudflare authentication, protected secret entry, staging deployment, and a capped live smoke test remain open gates.

The fail-closed Stage 2 runtime was deployed to Cloudflare staging on 2026-07-19 at `https://xen-continuum-stage2-staging.decureton.workers.dev`. D1, R2, Queues, Durable Objects, and Workflows are bound and the health route is verified. External model execution remains disabled, Anthropic is not connected, Cloudflare Access JWT verification remains unconfigured, and no live provider smoke test has occurred.

The protected Anthropic secret and provider binding were added to staging on 2026-07-18. The governed Workflow now checks approval, checkpoints before invocation, performs at most one bounded provider call, records token evidence, stores a hashed R2 artifact, and refuses success without validation evidence. Failures create a D1 dead-letter record. This is not live-provider certification: Cloudflare Access verification and the capped live smoke test remain open gates.

Cloudflare Access authentication and the capped Anthropic smoke gate are now validated in staging. Mission `0005` completed through the durable queue and Workflow using `claude-sonnet-5`, with 117 input tokens, 24 output tokens, estimated cost `$0.000474`, matched D1/R2 SHA-256 evidence, and no dead-letter record. This establishes a certified single-mission Claude staging envelope only; broader concurrency, recovery, API completeness, Xenesis graft, and production gates remain open.

The 2026-07-23 atomic-admission candidate adds a forward-only D1 reservation ledger and closes the queue consumer read/dispatch race locally. A 12-tenant simultaneous D1 test admits exactly four missions totaling four WMU. The candidate passes 34 Continuum tests and the exact staging dry-run, but migration `0006` and its Worker code are not claimed as remotely deployed by this record.
