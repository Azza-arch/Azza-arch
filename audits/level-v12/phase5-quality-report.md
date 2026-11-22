# DENAI V12 Phase 5 — Missions B and D

## Scope

Implemented the Zone B lift experiment first, then the Zone D number-block machine, in the isolated V12 runtime. No new world area or artwork was added. The B and D terrain, gate coordinates, global movement constants, Zone E implementation, and V11/V10/V9 source remain intact. The only shared behavior adjustment is choosing the nearest eligible terminal so adjacent number blocks select independently; the E regression suite passes with it.

A rollback copy of each edited runtime file is in `audits/level-v12/phase5-baseline-*.js`.

## Zone B: lift setpoints

The console offers input values 0–4 and calculates `f(x)=2x+1`. Output values are explicitly treated as machine stop codes, not distances. The existing lift artwork moves to the authored preset y-coordinate below. Non-target presets are visual-only: no platform collider is created and the span stays closed. Input 3 produces code 7; only after that lift animation settles at y=1080 does the game add the crossing collider.

| Input | Calculation | Stop code | Lift top y | Collision |
|---:|---|---:|---:|---|
| 0 | f(0)=1 | 1 | 1272 | Off |
| 1 | f(1)=3 | 3 | 1230 | Off |
| 2 | f(2)=5 | 5 | 1188 | Off |
| 3 | f(3)=7 | 7 | 1080 | On after settle |
| 4 | f(4)=9 | 9 | 1146 | Off |

The console offers a hint and a worked explanation. The computed code and lift status remain visible in the world after the panel closes and after Continue. Interrupted unsolved tests do not persist a partial stop; Continue returns to a safe checkpoint. A solved lift restores its deck art, collider, and readout.

## Zone D: physical input blocks

The existing blocks 2, 3, and 4 remain on the rack at x=3102, 3156, and 3210 (top y=918; 54px tiles). Their interaction centers are x=3129, 3183, and 3237 at feet y=972. Selecting a block moves that Kenney block to the existing socket at x=3372; the machine computes `g(x)=3x−2` and displays the input and result beside the socket.

- Block 2 gives `g(2)=4`; block 3 gives `g(3)=7`. Each returns to its rack slot and can be retried.
- Block 4 gives `g(4)=10`. The bridge animates to y=972; collision is created only after it reaches the safe position.
- The D console provides an optional formula hint and worked solution without taking or checking an answer.
- The output readout is visible during play and restored after Continue.

A retry bug was fixed while testing: input was disabled during block animation, which could lose the E key-up and ignore the next block interaction. Input state now resets after the mechanism settles.

## Screenshots

All captures below are real local Chromium screenshots. `before-*` were captured from the unmodified V12 runtime before edits.

- B before: [before-b.png](screenshots/before-b.png)
- B console: [b-console-before-test.png](screenshots/b-console-before-test.png)
- B non-target motion and presets: [b-nontarget-moving.png](screenshots/b-nontarget-moving.png), [code 1](screenshots/b-nontarget-code-1.png), [code 3](screenshots/b-nontarget-code-3.png), [code 5](screenshots/b-nontarget-code-5.png), [code 9](screenshots/b-nontarget-code-9.png)
- B target motion, safe deck and Continue: [b-target-moving.png](screenshots/b-target-moving.png), [b-safe-crossing.png](screenshots/b-safe-crossing.png), [b-continue-safe.png](screenshots/b-continue-safe.png)
- D before and explanation: [before-d.png](screenshots/before-d.png), [d-machine-explanation.png](screenshots/d-machine-explanation.png)
- D retries and target: [g(2)=4](screenshots/d-input-2-output-4.png), [g(3)=7](screenshots/d-input-3-output-7.png), [g(4)=10 and crossing](screenshots/d-input-4-safe-crossing.png), [D Continue](screenshots/d-continue-safe.png)
- Mobile reduced-motion captures: [B target](screenshots/mobile-b-target.png), [D retry](screenshots/mobile-d-retry.png), [D safe crossing](screenshots/mobile-d-safe.png)
- Integrated route captures: [A start](screenshots/natural-a-start.png), [B arrival](screenshots/natural-b-arrival.png), [B safe](screenshots/natural-b-safe.png), [D safe](screenshots/natural-d-safe.png), [E safe crossing](screenshots/natural-e-crossing-safe.png), [E far-bank checkpoint](screenshots/natural-a-to-e-checkpoint.png)

## Verification

- Desktop Chromium: all B inputs 0–4 produced outputs 1, 3, 5, 7, 9. Non-target stops showed the correct readout and had no collider. B target, pause/resume, reload/Continue, D wrong/correct inputs, block return, hint, output readout, collision timing, and Continue passed.
- Mobile touch with reduced motion: B input 3 opened the lift; D block 2 retried and block 4 opened the crossing.
- Natural keyboard A→E traversal: main A route, B lift, D rack and bridge, then E. Optional crate bonus, C, and D service branch were skipped. E was selected G then F by inspecting G, using the E-entry checkpoint return, and selecting F; output 19 activated the crossing and the player crossed to the far-bank checkpoint.
- Separate E browser regression passed both function orders, non-target retry, pause/resume, reload recovery, safe collision, and crossing traversal.
- Existing Node E/platform suites: 9/9 passed. V12 runtime syntax checks passed. Browser runs reported no page errors, console errors, or failed network requests.

Results: [B/D browser QA](phase5-browser-qa.json), [touch QA](phase5-touch-qa.json), [natural A→E traversal](a-to-e-regression.json), and [Zone E regression](../screenshots/desktop-browser-qa.json).

## Remaining limits

Automated traversal confirms the mechanics and route. Human playtesting is still needed to judge whether the stop-code mapping feels intuitive, whether players notice the D rack interaction promptly, and whether the amount of explanation is right. No production deployment or production-readiness claim is part of this phase.
