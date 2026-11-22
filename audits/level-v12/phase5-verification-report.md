# DENAI V12 — Phase 5 B + D verification and fixes

13 November 2026. Tested at `http://127.0.0.1:8765/app/addmath/rooftop/v12.html`.

## Scope and starting state

The working tree already contained the B lift experiments and D physical block machine described in the earlier `phase5-quality-report.md`. This pass retained that implementation, captured fresh baseline screenshots, fixed observed presentation gaps, and verified the current runtime together with Phase 4 dialogue. It does not claim the pre-existing mechanism code was newly authored in this pass.

Work order: capture B baseline → fix B → pass independent B desktop/touch tests → capture D baseline → fix D → pass independent D desktop/touch tests → natural-input A–E regression and separate E regression.

No new world area, geometry, artwork, physics constant or G behavior was added. Zone E's mechanism implementation was compared against the captured turn baseline and is unchanged. V11/V10/V9 and `index.html` were not edited. No commit, push or deployment.

## Current gameplay

**B:** the player approaches the existing lift console, chooses a machine input, runs an experiment, observes the preset stop and then crosses the actual deck once it settles safely. The console is an input controller and explanation surface; it does not accept a standalone quiz answer. Output is a **stop code**, not a physical distance or scientific law.

| Input | f(x)=2x+1 | Authored deck top y | Crossing collision |
|---:|---:|---:|---|
| 0 | 1 | 1272 | Off |
| 1 | 3 | 1230 | Off |
| 2 | 5 | 1188 | Off |
| 3 | 7 | 1080 | On only after settling |
| 4 | 9 | 1146 | Off |

The crossing remains x=2160–2484, y=1080. Non-target positions are visible test settings; they do not provide a walkable shortcut. The target creates the existing route collider. Tests actually walk across it at normal speed using keyboard and touch.

**D:** the player walks to existing rack blocks and presses E/Guna near the desired block. Blocks 2, 3 and 4 start at x=3102, 3156 and 3210, y=918, with interaction centers x=3129, 3183 and 3237. The selected block moves into the socket at x=3372, y=900 and the machine evaluates `g(x)=3x−2`.

- `g(2)=4` and `g(3)=7`: the block returns to its own rack position; the route stays closed and the player can retry.
- `g(4)=10`: the existing span settles at x=3564–3834, y=972, then receives collision. The player still crosses to the landing.
- The D console provides optional Hint and Langkah kerja, with no numeric answer input or selectable quiz choices. Actual input selection happens at the rack.

Art remains the existing Kenney terrain atlas at `assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png`: the existing deck renderer uses timber frames 48–50; D's existing number tiles are frames 162–164, with existing frame 9 sockets. No image or frame was introduced or replaced.

## Fixes made in this pass

1. **B stale explanation:** closing and reopening the lift console now hides the previous worked solution and resets `aria-expanded`. A prior explanation no longer stays open by accident.
2. **B controls and wording:** hide legacy minus/plus/preview buttons that duplicate the explicit input controls. Replace developer-facing collider wording with readable instructions to observe the stop and wait for the deck to reach the bank.
3. **B accurate inverse hint:** explicitly say to subtract 1 from the output, then divide by 2. The worked solution still verifies `f(3)=7`.
4. **B/D mobile results:** non-target results now use the existing screen-safe notice after returning to playing mode. Previously the world readout could be offscreen on portrait phones, while an announcement during mechanism mode updated only the hidden status text. The world labels remain; the visible notice repeats the computed result and retry status.

The E interaction/state architecture was reused as already implemented: configure/select → run visible mechanism → observe actual output → retry or traverse. There was no need to modify E.

Only `src/v12/mechanisms.js` and `src/v12/presentation.js` were changed at runtime in this pass. [Exact runtime diff](phase5-verification/runtime-changes.diff) and [turn baseline](phase5-verification/baseline/) are retained.

## Fresh before/after screenshots

These are real Chromium captures of the current working tree, not generated mockups. “Before” is the starting state of this pass, which already had B/D mechanics. “After” captures the fixed UI or the activated mechanism; D's world geometry intentionally stays the same.

| View | Before | After / evidence |
|---|---|---|
| B desktop | [Baseline](phase5-verification/B-desktop-before.png) | [Safe deck](phase5-verification/B-desktop-after.png), [player crossed](phase5-verification/B-desktop-crossed.png) |
| B portrait console | [Prior controls/copy](phase5-verification/B-touch-before-console.png) | [Hint/worked solution](phase5-verification/B-touch-explanation.png) |
| B portrait non-target | [Baseline](phase5-verification/B-touch-before.png) | [Visible f(0)=1 result](phase5-verification/B-touch-output-1.png) |
| D desktop | [Baseline rack](phase5-verification/D-desktop-before.png) | [Block 4 in socket / open span](phase5-verification/D-desktop-after.png), [player crossed](phase5-verification/D-desktop-crossed.png) |
| D portrait | [Baseline](phase5-verification/D-touch-before.png) | [Visible g(2)=4 retry](phase5-verification/D-touch-output-4.png), [g(4)=10](phase5-verification/D-touch-output-10.png) |
| D explanation | [Console](phase5-verification/D-touch-before-console.png) | [Accessible Hint and Langkah kerja](phase5-verification/D-touch-explanation.png) |

## Verification

- **B independently passed** at desktop 1440×900 and portrait touch 390×844: all inputs 0–4, exact non-target output/setpoint mapping, target collision and safe position, retry, visible result feedback, hint/worked explanation, reopening without stale solution, pause/resume during the experiment, natural crossing, solved Continue and reload during an unsolved experiment. [B results](phase5-verification/B-results.json).
- **D independently passed** on the same devices: physical selection sequence 2→3→2→4, correct computed outputs, each unsuccessful block returning home, repeated retry, visible result feedback, optional explanation, no standalone answer controls, target span/collision, pause/resume, natural crossing, solved Continue and interrupted unsolved reload. [D results](phase5-verification/D-results.json).
- **A–E natural keyboard regression passed** from a fresh start: normal jumps, B experiments/crossing, D rack/crossing, E stage selection, water activation and the far-bank checkpoint. No teleport or physics override was used for this traversal. [Route results](phase5-verification/regression-a-e/a-to-e-regression.json).
- **Separate E regression passed:** locked/configured/running/non-target/target/crossing states, retry, pause/resume, reload and traversal. The V11 save sentinel remained intact. [E browser QA](phase5-verification/regression-e/desktop-browser-qa.json).
- **14/14 existing Node checks passed:** dialogue 5, waterworks 6, moving platform 3. Changed runtime syntax checks passed. The design detector found no matches in the changed JS; actual desktop/mobile screenshots were also inspected.

Independent B/D tests use saved checkpoint fixtures to start each zone, then normal keyboard or real emulated touch events for controls and crossing. A temporary test-only Phaser observer reads state; no runtime debug hook was added. Final browser runs reported no page errors, console errors or failed requests.

Test sources: [independent B/D](phase5-verify.py), [current regression wrapper](phase5-regression-current.py). Prior phase evidence is preserved; this pass writes into `phase5-verification/`.

## Remaining limits

- Mobile testing used Chromium touch emulation, not physical phones. Human playtesting is still needed to judge timing and whether the lift's authored stop-code mapping is intuitive.
- Non-target experiments are not persisted as partial moving configurations. Continue restores a safe checkpoint and solved mechanisms; interrupted unsolved experiments can be retried.
- The main A–E traversal skips optional C, crate bonus and D service routes. G was neither changed nor started.
- Existing production tracking/routing/deployment concerns remain outside this phase. This is a local implementation/verification result, not a release.

Stop after B/D and their regression checks. No next phase is authorized by this report.
