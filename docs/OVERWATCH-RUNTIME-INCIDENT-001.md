# OVERWATCH Runtime Incident 001

## Incident
The Executive Premiere could play narration while the film remained black.

## Root cause
Multiple independent runtimes competed for boot state, local storage, visibility, navigation, and narration. A CSS boot lock hid the film until a late module released it. When that release path lost the load race or was cached inconsistently, the header and audio remained active while the experience stayed hidden.

## Corrective decision
Remove the visual boot lock. The premiere must be visible-first and fail-open visually.

One controller owns:
- initial scene
- start gate
- narration
- navigation
- restart
- error recovery

The first scene must render without JavaScript timing dependencies. Voice enhancement may fail, but visuals may never be hidden because of voice or initialization state.

## Overwatch acceptance
1. Scene 01 is visible immediately.
2. No saved state can replace scene 01 on fresh open.
3. Clicking Begin with Xen starts narration without hiding the scene.
4. A voice failure leaves the complete visual experience usable.
5. Restart always returns to a visible scene 01.
6. No more than one scene controller may be active.