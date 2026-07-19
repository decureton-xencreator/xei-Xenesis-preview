# Xen Repository Synchronization Record

**Status:** Active public preview repository  
**Effective date:** 2026-07-19  
**Canonical authority:** `decureton-xencreator/xen-operating-system`  
**Execution authority:** AM-002 Version 1.2 — Autonomous Execution Authority

## Repository role

This repository is the public Xenesis preview implementation. It inherits canonical architecture, governance, design, truth-boundary, privacy, release, disclosure, dependency, and synchronization controls from the private Xen Operating System repository.

## Synchronization rules

- Canonical architecture and governance remain in `decureton-xencreator/xen-operating-system`.
- This repository implements approved public-preview experiences without redefining canonical architecture.
- Preview, planned, implemented, blocked, certified, and externally dependent capabilities must remain explicitly distinguished.
- Material implementation changes must be synchronized back into canonical manifests, dependency maps, indexes, release evidence, and changelog where applicable.
- Private architecture, credentials, personal data, internal business records, and unapproved commercial terms must not be exposed through the public preview.
- Routine repository work proceeds under standing delegated authority without repeated confirmation.
- Execution pauses only for destructive, irreversible, security-sensitive, legal, credential-related, privacy-sensitive, or materially ambiguous actions.

## Repository network

- `decureton-xencreator/xen-operating-system` — canonical source of truth
- `decureton-xencreator/daily-bread-` — Daily Bread implementation
- `decureton-xencreator/xei-Xenesis-preview` — public Xenesis preview
- `decureton-xencreator/xenengine-site` — public Xen Engine website

## Sync state

Registered and synchronized with the active Xen repository network as of 2026-07-19.

## XSMDE-002 propagation — 2026-07-19

Xenesis Preview may demonstrate XSMDE concepts only with explicit preview/implemented/not-certified states and must not expose private home evidence.

## XSMDE-003 propagation — 2026-07-19

Xenesis Preview may demonstrate M3 and reconstruction-adapter concepts only as explicit reference-runtime or preview states.

## XSMDE 1.0.0 completion — 2026-07-19

Xenesis Preview may demonstrate the completed XSMDE reference product with explicit reference/demo/external-gate states and no private evidence.

## XSMDE public product deployment — 2026-07-19

Xenesis Preview records the live XSMDE product as deployed while preserving private evidence and external-certification boundaries.

## AM-002 Warden activation — 2026-07-19

Xenesis Preview inherits the active Xen Governance Warden lifecycle and truth gates from the canonical activation receipt at `Governance/Warden/WARDEN-ACTIVATION-2026-07-19.md`.

Warden enforcement applies to preview truth labels, privacy boundaries, dependency inheritance, synchronization evidence, and prevention of candidate or demonstration state being represented as production completion. This record does not claim a continuously hosted Warden service inside this repository without separate runtime evidence.
