# V11.1 targeted visual and regression results

## Browser traversal and captures

Command: python audits/level-v11/full-world-implementation/phase1_natural_input.py

Result: PASS. The natural desktop keyboard route was 42.88 seconds in automation. It covered A crate→plate→ledge, the mandatory gap/checkpoint, C mapping/reward and return, B incorrect/correct lever input and lift, the optional D service ladder/coin, R08 incorrect input 2→output 4 and correct input 4→output 10, the animated bridge and safe collision, then both R10 composition orders. It reloaded Continue at checkpoint d-crossing and restored the solved D span. The V10 save sentinel remained unchanged.

The run captured desktop states for crate/plate/ledge/gap, B lift locked/wrong-input/moving/locked-safe, C panel/reward, D rack/input/wrong-input/service/span moving/span safe/R10/Continue restoration, plus keyboard-focused menu, mobile menu/gameplay and a separate D Continue-restored screenshot. Mobile used touch right+jump with prefers-reduced-motion enabled; the Chill Boy idle frame stays still in that mode. Menu Play focus, its visible keyboard-focus capture, return focus to the game, and R08 dialog focus were asserted.

Browser diagnostics: 0 page errors, 0 console errors, 0 failed requests. An initial D trial exposed a missing panel-close/save step after the bridge animation; the callback was fixed, and the first-trial diagnostic is preserved at logs/phase1-initial-failed-transition.png. Subsequent full routes pass. Automated traversal duration is not a human playtime estimate.

Menu comparison images named menu-before-reconstructed-* recreate the earlier full-height welcome-card layout from its prior markup/copy and base CSS. The original individual menu screenshots had been overwritten before this request. The earlier phase1-before-polish-contact-sheet.png preserves the actual desktop menu and A/B/C states at thumbnail resolution; the full-resolution menu-before-reconstructed-* images recreate the old card from prior markup/copy and base CSS and are not archived screenshots. menu-after-* are actual browser captures.

## Existing regressions

Direct execution of the unchanged Node test files passed:

- tests/level.test.mjs: 12/12
- tests/v10.test.mjs: 6/6
- tests/v10_full.test.mjs: 13/13
- v11_math.test.mjs: 4/4

JavaScript syntax checks passed for all V11 modules. V9/V10 files and V10 save key were not modified.

## Math/state assertions

The V11 test covers R08 rack choices 2,3,4 produce 4,7,10; input4 is the unique available choice giving10, and input2 gives4. R10 gives g(f(2))=13 and f(g(2))=9. It also validates the R08/R09 geometry and rejects d-crossing when number-span has not been earned.


## Zone E rerun after pipe-connection correction

`phase3_natural_input.py` passes for R01-R12: 64.89 seconds automated desktop route; mobile touch ladder/jump; zero page errors, zero console errors, zero failed requests. Current pipe-network, math-order, water-flow, open-crossing and Continue captures are in `screenshots/phase3/`.

Direct Node suites pass: legacy level 12/12, V10 6/6, full-world V10 13/13, V11 math 4/4 and V11 Phase 3 3/3. Syntax checks pass for the changed V11 JavaScript modules.
