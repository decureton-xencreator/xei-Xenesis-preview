# XEI Phone Gold Master Runtime Template

## Canonical ownership

One phone runtime owns the start gate, narration transport, caption placement, restart lifecycle, and phone session state. Supporting CSS may remain modular, but no second JavaScript controller may own the same behavior.

## Proven runtime rules

1. The landing shell exists before the director starts and remains completely silent.
2. Begin is the only action allowed to start narration.
3. iPhone narration pause uses hard cancellation with the active utterance retained. Native `speechSynthesis.pause()` is not trusted as the authoritative stop mechanism.
4. Cancellation callbacks are suppressed while paused or restarting so the director cannot advance automatically.
5. Resume replays the retained active sentence and then returns control to the existing director promise.
6. Captions are mounted inside the active scene before narration. The arrival caption sits immediately after the scene heading, not below the complete title stack.
7. CC state changes one canonical body class: `xen-captions-off`.
8. Restart enters a restart lock, cancels speech, clears the active utterance, resets controls, restores the silent landing, and only then releases the lock.
9. Back, Forward, and interaction navigation cancel the abandoned sentence and release paused state before the selected scene begins.
10. Phone runtime certification rejects every deprecated phone controller loaded beside the canonical runtime.

## Integration order

Load the canonical voice and human-delivery modules first, then the compiled phone runtime, then the master director:

```html
<script type="module" src="src/xvs-canonical-phone-v9.js"></script>
<script type="module" src="src/xvs-human-delivery-v10.js"></script>
<script type="module" src="src/phone-gold-runtime-v14.js"></script>
<script type="module" src="src/app-v6.js"></script>
```

## Required test sequence

1. Fresh load stays silent.
2. Begin starts scene one and its caption is visible during the first spoken sentence.
3. Pause stops speech and remains stopped for at least ten seconds.
4. Resume speaks the retained sentence and the director continues once.
5. CC Off hides captions immediately; CC On restores the current and future caption lane.
6. Restart during speech returns to a silent landing and remains silent for at least ten seconds.
7. A second Begin creates one clean session without duplicated controls, captions, or narration.
