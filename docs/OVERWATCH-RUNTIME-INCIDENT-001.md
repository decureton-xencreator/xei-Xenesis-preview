# OVERWATCH Runtime Incident 001

## Incident
Narration played while the Executive Premiere remained black.

## Root cause
Multiple startup runtimes competed for scene state, visibility, navigation, and narration. A CSS boot lock hid the film and depended on a later module to release it.

## Corrective architecture
The premiere is now visible-first. Scene 01 renders immediately. Visuals may never depend on voice availability or a late boot-release script.

One controller owns start, narration, navigation, restart, and recovery.

## Acceptance
1. Scene 01 is visible before any click.
2. Begin with Xen starts narration without hiding the scene.
3. Voice failure leaves the complete visual experience usable.
4. Restart always returns to visible scene 01.
5. No saved state may replace the opening scene on a fresh load.