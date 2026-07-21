# AM-002 Canonical Logo Continuity Sync

Date: 2026-07-20  
Scope: Checkmate executive premiere and executive rollout kit

## Warden finding

The executive premiere used the approved transparent Checkmate Holding Group lockup, but the executive rollout kit and the AM-002 protected-asset ledger still referenced a retired hand-built SVG. That disagreement allowed two different brand marks to exist across one delivery package.

## Canonical correction

- Canonical visible lockup: `assets/checkmate-holding-group-transparent-v1.png`
- Canonical SHA-256: `0001a14c08f5c8dfba04b1fdb59c39a2404b57a6df66fd1ea3cd9220d705ff52`
- Retired production asset: `assets/checkmate-executive-mark.svg`
- Executive premiere: canonical lockup confirmed
- Executive rollout kit: canonical lockup restored
- Artwork bytes: unchanged
- Presentation geometry: centered `contain`; no crop or redraw

## Enforcement

The validation gate now fails if either production HTML surface omits the canonical lockup or references the retired SVG. AM-002 protects the same asset that the approved premiere actually displays.
