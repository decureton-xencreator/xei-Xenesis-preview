# Xen mastered narration gate

The recipient-facing documentary must never use browser or operating-system speech synthesis.

## Voice approval sequence

1. Add `OPENAI_API_KEY` as a GitHub Actions repository secret.
2. Run **Generate Xen voice audition** from the Actions tab.
3. Review `assets/narration/xen-voice-audition-v1.mp3` on iPhone, Android, tablet, and desktop.
4. Approve or revise the voice direction.
5. Only after approval, generate the complete versioned narration family and connect it to the deterministic audio runtime.

The full run is intentionally blocked until the audition is approved. This prevents unnecessary API cost and prevents an unapproved narrator from entering a recipient build.
