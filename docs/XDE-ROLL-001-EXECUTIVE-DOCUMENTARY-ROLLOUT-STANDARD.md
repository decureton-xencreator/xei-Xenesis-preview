# XDE-ROLL-001 — Executive Documentary Rollout Standard

**Status:** Canonical Candidate
**Authority:** Darren Cureton
**Applies to:** Executive documentaries, CEO premieres, board rollouts, investor showcases, strategic demonstrations, and derivative launch experiences.

## Governing outcome

A premiere is not complete when its code runs. It is complete when a recipient can open one branded URL, enter immediately, understand every scene without assistance, complete the experience, restart it, and share it without exposing development infrastructure.

## Rollout gates

1. **One branded route:** One public URL opens the canonical experience directly.
2. **No development leakage:** No repository, branch, preview, framework, or implementation language appears in the executive surface.
3. **Five-second opening:** The recipient understands the premise before interacting.
4. **Deterministic entry:** One visible action starts the experience synchronously.
5. **Repeatable session:** Restart returns to a reusable landing and a second complete session works.
6. **Silent coherence:** The complete documentary remains meaningful without voice or music.
7. **Executive participation:** Selections visibly alter later scenes or the close.
8. **Device resilience:** Safe areas, dynamic viewport height, short screens, reduced motion, keyboard navigation, and desktop presentation are supported.
9. **Rollout identity:** Title, favicon, installable manifest, share metadata, and preview art are present.
10. **Domain readiness:** Custom-domain activation requires only the final hostname and DNS configuration; no experience rewrite is permitted.

## Production motion rule

Motion supports comprehension and emotional pacing. The rollout layer may add entrance choreography, depth, lighting, focus states, restrained hero movement, and a stronger finale. It may not create another navigation owner, delayed start gate, voice dependency, or scene timeline.

## URL activation contract

When Darren supplies the purchased hostname:

1. Add the exact hostname to `CNAME`.
2. Configure the registrar DNS records required by GitHub Pages.
3. Enable HTTPS after DNS resolves.
4. Update canonical and social metadata to the final HTTPS URL.
5. Run the rollout certification workflow.
6. Verify the route in Safari on Darren's phone and on Ed's desktop display.

No placeholder hostname is committed to production.

## Release evidence

A completed rollout records:

- canonical merge commit,
- passing workflow runs,
- final public URL,
- iPhone acceptance recording,
- desktop acceptance recording or checklist,
- EERB gate results,
- approved share preview,
- release date and owner.

## Current implementation

The XEI Executive Documentary rollout retains the approved nine-scene skeleton and one runtime owner. The rollout layer adds premium visual depth, custom-domain readiness, share identity, keyboard and focus behavior, selection inheritance, full-screen installation support, and repeatable restart behavior.