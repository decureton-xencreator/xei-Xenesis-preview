# Repository Governance Directive

This derivative repository inherits AM-002, XGW-001, XER federation contracts, and the canonical connection-readiness routine from `decureton-xencreator/xen-operating-system`.

At session startup, resume, repository handoff, and before any GitHub or Cloudflare action:

1. synchronize safely with the current repository and identify its canonical/derivative role;
2. apply `Governance/XER-CONNECTION-READINESS-STANDARD.md` and `Governance/XER-CONNECTION-READINESS-MANIFEST.json` from the canonical repository;
3. use the connected GitHub application first when available, then authenticated repository-local tooling;
4. distinguish Cloudflare documentation access, Wrangler authentication, dashboard evidence, deployment evidence, and Access verification;
5. exhaust safe current-session capability checks before asking the user to repeat a setup step;
6. never transfer, expose, invent, or persist credentials;
7. report exact repository, branch/ref, commit, validation, deployment target, external evidence, Warden truth state, blocker, and continuation.

A connection present in another chat is not presumed present here; the routine and evidence contract persist, while authentication must be verified in the current session.

Do not claim deployment from a build, expected content from HTTP 200 alone, or privacy before Cloudflare Access is tested.
