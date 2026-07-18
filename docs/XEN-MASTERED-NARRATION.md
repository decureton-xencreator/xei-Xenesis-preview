# Xen mastered narration gate

The recipient-facing documentary must never use browser or operating-system speech synthesis.

## Voice approval sequence

1. Add `OPENAI_API_KEY` as a GitHub Actions repository secret.
2. Run **Generate Xen voice audition** from the Actions tab.
3. Review `assets/narration/xen-voice-audition-v2.mp3` on iPhone, Android, tablet, and desktop.
4. Approve or revise the voice direction.
5. Only after approval, generate the complete versioned narration family and connect it to the deterministic audio runtime.

The v2 audition was approved on July 18, 2026. The approved production profile is `gpt-4o-mini-tts` with the `marin` voice and the cultivated British executive-assistant direction in `scripts/xen-mastered-narration-copy-v1.mjs`.

## Full narration release sequence

1. Run **Generate Xen mastered narration** from Actions.
2. The workflow generates every audience, scene, branch ending, and click-gated second-appointment clip into `assets/narration/mastered-v1/`.
3. Warden verifies the manifest, byte size, four introductions, three path endings, and three explicit-continuation clips before committing anything.
4. A successful generation automatically triggers the GitHub Pages deployment workflow.
5. The recipient runtime may be connected only after the generated package exists on `main`; browser and operating-system speech synthesis remain prohibited.

This two-stage release prevents missing audio or an unapproved fallback voice from reaching a recipient.
