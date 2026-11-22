# Final presentation acceptance and QA matrix

**Gate summary:** local implementation and automated release candidate checks pass. Human playtesting, physical-device/browser coverage, and production availability remain unverified or blocked. See [README.md](README.md) for the evidence and release blockers.

| Area | Result | Evidence and limit |
|---|---|---|
| Full viewport shell | Pass | Real browser captures and resize/no-scroll assertions at desktop, laptop, portrait, landscape; safe viewport treatment is implemented. |
| Title and menu | Pass | Title, animated Chill Boy, Play, valid-save Continue, level selection, help, settings, keyboard focus and reduced motion. |
| HUD and prompts | Pass | Compact HUD and proximity prompt captured; natural-input route traverses the world. |
| Math panels | Pass | Formula/output, target, wrong and correct input, hint, worked solution, keyboard focus, cancel and touch layouts covered in presentation QA and route evidence. |
| Mechanisms and completion | Pass | Browser route verifies E/G transitions, safe bridge collision, real goal, completed state and Continue restoration. |
| Pause and input lifecycle | Pass | Prior gameplay state restoration, focus return, touch cancellation, and window blur checks pass. |
| Mobile emulation | Pass with limits | 320×568 and 390×844 portrait, 844×390 landscape; ≥44px touch targets and emulated touch actions. Physical devices remain untested. |
| Save and Continue | Pass | Full route records completed Continue; focused QA verifies valid-save menu and resume behavior. |
| Regression | Pass | 12/12 Level V11 math, Phase 3, and Phase 4 Node tests; Phase 4 hashes protect geometry, environment, save sanitizer and shared V9/V10 style. |
| Accessibility and performance | Partial pass | Keyboard focus, authored color contrast, reduced motion, touch target, and local resource/RAF metrics pass. No screen-reader audit or physical audio review. |
| Natural-input route | Pass | 86.53s automated Chromium session, zero page/console/request failures. Automation duration is not a player-time estimate. |
| Production release | Blocked | Checked V11 production URL returned HTTP 404. No deployment was performed. |
| Human playtest | Pending | Checklist prepared; no player responses are claimed. |

## Required real-browser evidence

Baseline, final UI, and Phase 5 route captures are under `screenshots/`. Images are browser screenshots, not generated art. Viewport and state are encoded in filenames; QA summaries and route log are linked from the README.

## Stop conditions

- Do not publish or switch the production route until its intended URL is confirmed and serves the candidate successfully.
- Keep geometry changes out of the presentation pass unless a separately reviewed defect requires them; the existing authored world was hash-checked.
- Do not call emulated mobile runs physical-device validation or automated traversal human playtesting.
