# Regression results

All results below were rerun against the final local V11.2 source. The page was served from the existing local test server at `http://127.0.0.1:8765/app/addmath/rooftop/v11.html`; no production deployment was made.

| Check | Result | Evidence |
|---|---|---|
| A-G natural input, optional visit | PASS, 89.62 sec automation; C mapping, F cave/reward, wrong/correct inputs, mechanisms, completion and completed Continue; 0 page errors, console errors or failed requests. | [`natural-input-visit.json`](natural-input-visit.json), [`visit screenshots`](screenshots/natural-input-visit/phase5-A-G-contact-sheet.png) |
| A-G natural input, optional skip | PASS, 70.18 sec automation; skips both C and F cave, finishes the mandatory route and restores save; 0 page errors, console errors or failed requests. | [`natural-input-skip.json`](natural-input-skip.json), [`skip screenshots`](screenshots/natural-input-skip/phase5-A-G-contact-sheet.png) |
| Math, save and geometry unit regression | PASS, 12/12: D arithmetic and support, E pipe joins/composition/checkpoint, G formula/order/collider, save migration and completion gate. | Original suites: `audits/level-v11/full-world-implementation/v11_math.test.mjs`, `v11_phase3.test.mjs`, `v11_phase4.test.mjs` |
| Baseline archive | PASS: complete V11.1 rooftop snapshot; atlas and all 103 manifest paths present; restored V11.1 environment/mechanisms files match original snapshot. | [`regression/baseline-archive-check.json`](regression/baseline-archive-check.json) |
| Lever lifecycle | PASS: locked/wrong/moving/safe, no early collider, pause/resume, reload mid-transition, reduced motion. | [`regression/lever-animation.json`](regression/lever-animation.json) |
| Presentation | PASS at 1440x900, 1365x633, 390x844 and 844x390; title/help/settings, math panel, pause, bridge, resize and no-scroll checks. | [`presentation-qa.json`](presentation-qa.json) |
| Touch, focus, save, reduced motion | PASS at 320x568 and 844x390 emulation; touch cancellation, focus-loss pause, focus return, Continue and 44 px targets. Text/button contrast >=4.5:1. | [`release-qa.json`](release-qa.json) |
| Browser diagnostics | PASS on both full routes and targeted lever cases: 0 page errors, 0 console errors, 0 failed requests. | JSON route and lever results |
| Local resource/performance sample | 77 resources, 3,136,335 transferred bytes; emulated portrait median RAF 16.7 ms, 0 frames above 50 ms. | [`release-qa.json`](release-qa.json) |
| Impeccable detector | Ran; DEGRADED fallback because parser modules are unavailable. It reports pre-existing Arial / `#49311e` water labels in `environment.js` lines 81 and 89. These are unrelated to the V11.2 edits, and the detector explicitly cannot evaluate computed styles/contrast in fallback mode. | Command run against the V11 HTML and two changed source files. |

Human play is not simulated by these automation timings. The viewports are Chromium emulations, not physical devices.
