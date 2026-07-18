# XEN-CPC-001 Stage 2 Family Dependencies

Status: synchronized implementation record  
Repository mainline synchronized: `d026bdddaf721e889935029b9a2f41df74b73035`  
Date: 2026-07-18

## Governing family

| Control | Relationship | Stage 2 use |
|---|---|---|
| XPF-003 | capability-package parent | Manifest, evidence, validation, and truthful release boundaries |
| XSS-001 | security parent | Tenant isolation, secret handling, approval, and safe-mode boundaries |
| XRI-005 | runtime implementation parent | Authority, idempotency, trusted handlers, and completion evidence |
| XWF-001 | workflow parent | Versioned, resumable, deterministic workflow execution |
| XEF-001 | event parent | Event identity, correlation, retry, replay, and dead-letter handling |
| XAU-001 | automation parent | Authority, suspension, retry budgets, and evidence requirements |

These controls were verified as repository records. XRI-006 was not found as a canonical record. XRI-005 identifies it only as the next approved implementation source, so Stage 2 records XRI-006 as a future dependency and does not falsely claim that it is canonical.

## Related implementation family

PATLAS-007 and `apps/atlas/runtime/continuum-runtime.js` provide browser-local, same-origin mission continuity for the current Atlas/XMP experience. They are compatible foreground-family implementations, but they do not provide D1 persistence, remote execution, or cross-device recovery. The Stage 2 `continuum/` module is the bounded durable-server candidate and must remain distinct until the Xenesis shell conflict and remote release gates are resolved.

## Inheritance boundary

`XPF-003 + XSS-001` govern the capability boundary. `XRI-005` governs the runtime. `XWF-001`, `XEF-001`, and `XAU-001` govern workflow, event, and automation behavior. PATLAS-007 is a sibling client implementation, not a governing parent. XRI-006 remains prospective until its canonical record exists.
