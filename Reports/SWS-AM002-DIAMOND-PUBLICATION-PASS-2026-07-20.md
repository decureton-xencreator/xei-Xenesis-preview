# AM-002 Diamond Publication Pass

Date: 2026-07-20
Scope: Checkmate bespoke executive premiere and rollout kit

## Verified implementation

- The exact supplied Checkmate Holding Group logo-and-name lockup is byte-locked at SHA-256 `f387c09879ef3257727d0361e435b4546751b4bd6dc4c3fb86f8cc06272e2b86`.
- Brand artwork was not redrawn, recoloured, reshaped, cropped, substituted, stylised, retyped, or reproportioned.
- Logo presentation uses centred `contain` geometry on a dedicated white gallery plate, preserving the complete blue/green mark and the CHECKMATE HOLDING GROUP name beneath it.
- Pages 2 and 6 use true 50% / 50% centre geometry with symmetric orbital labels.
- The desktop cinematic frame no longer receives an incompatible two-column layout.
- Text, controls, borders, and shimmer use a content-plane hierarchy that prevents decorative lines from crossing language.
- The executive rollout kit renders as six A4 pages: cover, Ed, Kim, Ahmer, cadence, and Warden truth boundary.
- Each recipient heading, link, and email stays together on one page; no recipient package is split across pages.

## Evidence completed

- `npm run validate`: PASS
- `git diff --check`: PASS
- Phone render: 390 × 844, pages 2, 6, and 7 inspected
- Desktop render: 1440 × 900, pages 2, 6, and 7 inspected
- PDF render: six A4 pages rendered to PNG and inspected as a contact sheet
- Approved lockup natural size: 1024 × 718; rendered without clipping, cropping, or substitution

## Brand-integrity boundary

The current repository asset is protected by `governance/AM-002-BRAND-INTEGRITY.json` and a deterministic hash assertion in `tests/validate.mjs`. No standing transformation authorization exists. Any future change requires a new, explicit approval naming the exact logo asset and exact transformation.

The original uploaded raster source is now the protected canonical asset. The former repository-made substitute SVG remains historical only and is prohibited from active premiere use by deterministic validation.
