# Xen Protocol Enforcement Patch 1.0

Status: **Executable production enforcement / canonical upstream sync blocked**  
Owner: Architecture Manager + Warden  
Chain: `AM → XPS → Warden → AM-002 → XVS-001 → CPF-006 → SWS`

## What failed before

Controls were distributed across prose, product-specific manifests, string-presence tests, runtime checks, and separate workflows. No single mandatory interceptor proved that every applicable protocol had executed. Partial inspection could therefore be described as a pass, and documentation presence could be mistaken for enforcement. The root cause was an orchestration and evidence failure, not the absence of standards.

## One connected execution architecture

`protocol-registry.json` is the applicability and precedence authority. AM locks the request in `objective-contract.json`. CPF-006 resolves `canonical-baseline.json` and permits only `authorized-delta.json`. The executable Warden applies XPS, AM-002, and XVS-001 checks, compares protected hashes, and creates an evidence ledger. Publication remains blocked until deployed and complete visual evidence exists. SWS runs last and cannot propagate a failed or unauthorized candidate.

The executable order is fixed:

1. command capture;
2. objective and acceptance recovery;
3. baseline resolution;
4. applicability resolution;
5. precedence and conflict resolution;
6. smallest authorized delta;
7. dependency prediction;
8. isolated application;
9. static and governance validation;
10. runtime validation;
11. every-scene/every-viewport validation;
12. interaction validation;
13. voice and audio validation;
14. asset and derivative validation;
15. baseline comparison;
16. deployed artifact inspection;
17. evidence ledger;
18. publication interlock;
19. SWS;
20. canonical-state record.

Any missing, uncertain, or failed step returns `BLOCK`.

## Operator commands

Preflight (safe before expensive render/deploy):

```sh
npm run warden
```

Deliberate violation suite and existing product suite:

```sh
npm run test:protocol-enforcement
npm test
```

Release decision:

```sh
node scripts/protocol-warden.mjs release --evidence=path/to/release-evidence.json
```

Release evidence must identify the candidate commit and deployed URL, affirm direct deployed inspection, and provide all nine scenes at the three canonical viewports. It must also confirm the synchronized canonical record. Supplying a label without the evidence does not pass.

## Consolidation, migration, and deprecation map

| Existing control | Decision | Unified owner |
|---|---|---|
| `CANONICAL-AUTHORITY.md` | Retained | CPF-006 baseline resolver |
| `governance/XVS-001-CANONICAL-VOICE.json` | Retained | XVS voice Warden |
| `governance/XDE-DIRECTORS-CUT-LOCK.json` | Retained | Objective/baseline inputs |
| Product tests and release workflows | Retained beneath unified gate | Warden CI job |
| Runtime `runWarden()` | Retained as in-experience protection | Product runtime; never a release substitute |
| Standalone prose-only compliance claims | Deprecated as pass evidence | Evidence ledger |
| First-page or one-viewport inspection | Deprecated and rejected | XPS complete-render evidence |
| Manifest label-only voice checks | Deprecated and rejected | Hash + route + playback evidence |
| Newer-file-wins canonical behavior | Deprecated and rejected | Baseline + authorized delta |

No existing standard is renamed or replaced. Duplicate enforcement responsibility is consolidated under the interceptor; domain protocols remain authoritative for their domains.

## Dependency graph and synchronization

AM supplies objective authority. CPF-006 supplies source authority. XPS, AM-002, and XVS-001 independently evaluate the candidate. Warden aggregates their evidence and controls publication. Only an allowed decision can enter SWS. SWS updates manifests, registries, tests, dependency/inheritance maps, Lexicon, Source of Truth, build/release records, and continuity records without overwriting protected canon.

The separate canonical `decureton-xencreator/xen-operating-system` repository is not available in this workspace. Its required synchronization is therefore represented as unavailable and the release gate fails closed. An operator must make that repository available, reconcile contradictions explicitly, update `sws-map.json`, and attach its canonical record before promotion.

## Rollback, continuity, and credit efficiency

Rollback reverts only the authorized delta to the recorded baseline; protected artifacts are never regenerated as a recovery shortcut. Resume from the evidence ledger’s first blocked gate. Hash evidence is reused, unchanged assets are not regenerated, protected runtime is inspected before rendering, and deployment is never started after an earlier failure. Existing capability detection is registry-based, preventing a second competing implementation.

## Ed presentation continuation label

Use this exact command in the Ed presentation chat:

`AM: LOAD XPEP-1.0 — enforce AM → XPS → Warden → AM-002 → XVS-001 → CPF-006 → SWS; preserve the Ed canonical baseline; accept only an explicitly authorized delta; fail closed and require a complete evidence ledger before publication.`

This loads the enforcement requirement; it does not claim cross-repository canonical promotion until the upstream SWS record exists.
