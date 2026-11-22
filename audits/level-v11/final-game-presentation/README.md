# V11.1 Phase 5 — final game presentation

**Status: local release candidate implemented. Suitable for supervised human beta playtesting after the local build is opened. Not production-ready.** The A–G runtime is implemented and the Phase 5 browser, touch, and regression checks pass. The production V11 URL returned HTTP 404 during this review, so no live deployment is available to verify. Physical-device and human playtesting are still outstanding.

## Runtime changes

- Full viewport Phaser canvas with responsive scale, safe-area handling, no active-play page scrolling, and pixel-art rendering preserved.
- Kenney and Chill Boy title screen with Pengembaraan, valid-save Continue, level selection, help, settings, keyboard focus, and reduced-motion behavior.
- Compact collectible/pause HUD, short tutorial hints, proximity-based object interaction, and touch interaction controls.
- Educational math interaction retains calculated output, target, hints, worked solution, wrong-answer feedback, retries, and keyboard focus handling.
- Pause remembers and restores the previous gameplay state, including puzzle and mechanism-transition states.
- Existing A–G geometry, collision, physics, save code, and shared V9/V10 styles are preserved. Phase 4 hashes are checked by release QA.

## Verification

- Natural input browser run: **PASS**, A–G from a clean save, including entering and exiting the optional C and F branches, F inverse reward, wrong/correct inputs, checkpoints, finale bridge, goal, and completed Continue. `logs/phase5-natural-input.json` records 86.53 seconds of automation, not human play time; it reports zero page errors, console errors, or failed requests.
- Presentation browser QA: **PASS** at 1440×900, 1365×633, 390×844, and 844×390. Captures title, Continue, HUD, contextual prompt, math, worked solution, pause, and safe bridge states; resize and document-scroll assertions passed. Fresh rerun results are in `presentation-qa.json`.
- Release QA: **PASS** for touch cancellation, focus loss, pause focus return, save/Continue, 320×568 and 844×390 reachability, ≥44px touch targets, reduced motion, authored text/button contrast ≥4.5:1, preserved geometry/save hashes, and local resource/performance checks. Fresh metrics are in `release-qa.json`.
- Node regression suites: **12/12 PASS** (`v11_math`, `v11_phase3`, `v11_phase4`).
- Runtime package: `v11-phase5-runtime-candidate.zip`, rebuilt from a 69-file allowlist. `runtime-package-manifest.json` records per-file hashes and archive hash. It excludes tests, audits, docs, and environment files. No deployment was performed.
- Real browser screenshots (not generated artwork): `screenshots/baseline/`, `screenshots/final/`, and `screenshots/phase5/`. The Phase 5 contact sheet is `screenshots/phase5/phase5-A-G-contact-sheet.png`; the final completion and restored completion captures are `phase5-G-R16-completion.png` and `phase5-G-continue-completed.png`.

## Release blockers and limits

1. The production route checked for V11 returned HTTP 404 (`live-headers.txt`). Confirm the intended public route and publish through the normal release process before calling this production-ready. No deployment or route switch was made.
2. Run the supplied human playtest checklist with new players. Automated input does not establish discoverability, pacing, enjoyment, or a credible completion-time estimate.
3. Test on physical iOS/Android devices and current Safari/Firefox. Current mobile browser evidence uses Chromium emulation; the 390px portrait camera exposes less of the river, and the existing route strip clips horizontally.
4. No automated screen-reader audit or physical-device audio assessment is included.

## Playtest preparation

Use [human-playtest-checklist.md](human-playtest-checklist.md) and record observations verbatim. Do not treat automated traversal duration as a player result.

## Evidence map

- Baseline: desktop, portrait, and landscape title/game screenshots in `screenshots/baseline/`.
- Final UI: desktop, laptop, portrait, and landscape captures in `screenshots/final/`.
- Full natural-input route, optional branches, wrong/correct math, bridge sequence, completion, and save restoration: `screenshots/phase5/` plus `logs/phase5-natural-input.json`.
- Layout and focused mechanism assertions: `presentation_qa.py`; fresh summary in `presentation-qa.json`.
- Touch, focus, contrast, motion, resource, and hash assertions: `release_qa.py`; fresh summary in `release-qa.json`.
- Release URL response evidence: `live-headers.txt` and `live-response.html`.
