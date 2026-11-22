# Phase 6.5B1 — Zone B world-interaction prototype — final report

Resumed after the prior session's usage-limit interruption. No files were reverted or restarted; the existing implementation was recovered, verified, and the blocked browser QA was run to completion.

## 1. Work recovered

The interrupted session had already finished the implementation (not just started it):
- Rejected Option A (5 physical blocks) — too crowded against ladder/checkpoint/lever at this bank width; documented reasoning was sound on inspection.
- Implemented Option B — world-mounted selector sign, separate from the lever.
- Preserved `f(x)=2x+1`, all 5 presets, lift stop coordinates, save schema.
- Left `openPuzzle()`'s old quiz-panel branch for `kind==='lift'` as dead code (short-circuited at `mechanisms.js:173` by a redirect to `openBHelp()`) — unreachable, harmless, not in scope to remove.

Nothing was reverted or rewritten from scratch.

## 2. Files changed (verified via diff against `baseline/`)

| File | Change |
|---|---|
| `src/v12/b-control.js` | **new** — selector constants, `nextBInput`, `validBInput`, `sanitizeBTrial`, `B_STOPS`, `syncBControl` (world-anchored label + screen-safe readout panel) |
| `src/v12/b-control.css` | **new** — Timber Edge panel styling, 48px touch targets, focus ring |
| `src/v12/environment.js` | adds `bSelector` sprite + floating `?`/digit label at x=1933; init `bInput=null`/`bLastTrial=null` |
| `src/v12/game.js` | wires `syncBControl` into `update()`; interaction prompt branches for `b-selector`/`lift`; `KeyE` now calls `cycleBInput()` on the selector and `runLiftExperiment()` directly on the lever (no panel open) |
| `src/v12/mechanisms.js` | `cycleBInput()`, `openBHelp()` (optional help dialog only), `runLiftExperiment()` (the real mechanism: non-target → unsafe retry, target 7 → safe collider + checkpoint) |
| `src/v12/save.js` | sanitizes/restores `bInput`/`bLastTrial`, rejects out-of-range or forged values |
| `v12.html` | new `#b-control` aside (world-adjacent compact readout) + stylesheet link |

## 3. Interaction as implemented

1. Walk to selector (x=1960) → `E`/`Guna` cycles 0→1→2→3→4→0 (starts unselected, never pre-set to 3).
2. Walk to lever (x=2070, separate interactable, ~110px away) → `E`/`Guna` runs the real `f(x)=2x+1` on whatever is currently selected.
3. Non-target output: lift planks tween to that output's preset Y, **no collider created**, retry is immediate (no cooldown, no modal).
4. Output 7: planks tween to the crossing level, collider is created only `onComplete`, checkpoint `b-lift` saved, lever resets.
5. World panel shows rule, target, selected input, last tested input→code, and lift status at all times — no modal required for normal play.
6. `Bantuan` opens the existing optional help/worked-solution dialog; closing it restores focus to `#game` and does not clear `bInput`.

## 4. Input/output verification (automated, `browser-qa.py`, Playwright)

All 5 inputs tested end-to-end in **desktop (1440×900, keyboard)**, **portrait (390×844, touch)**, and **landscape (844×390, touch)**:

| Input | Output | Preset Y | Collider | Matches spec |
|---|---|---|---|---|
| 0 | 1 | 1272 | none | ✓ |
| 1 | 3 | 1230 | none | ✓ |
| 2 | 5 | 1188 | none | ✓ |
| 4 | 9 | 1146 | none | ✓ |
| 3 | **7** | 1080 | **created** | ✓ |

Also confirmed: lever is a no-op with a message, not a crash or silent fail, when nothing is selected yet (`bLastTrial` stays `null`, no gate body).

`state.test.mjs` (Node unit tests on `save.js`/`b-control.js` in isolation): 2/2 pass — old saves resume unselected, forged/out-of-range trial values are rejected and never grant the gate, all 5 presets match the approved non-proportional Y mapping.

## 5. Collision safety

- Non-target stops: `gateBodies.lift` absent — player falls through, confirmed in all 3 viewports.
- Target stop: collider created only after the tween settles (`onComplete`), confirmed `collider:true` only on input 3, in all 3 runs.
- No unsafe-looking trial stop was flagged in screenshot review (`desktop-trial-0/1/2/4.png`).

## 6. Keyboard / touch QA

- Keyboard (`KeyE`) and touch (`Guna`/tap on `[data-action="interact"]`) both drive the same `cycleBInput`/`runLiftExperiment` path — verified in the desktop run (keyboard) and portrait/landscape runs (touch, via CDP touch dispatch).
- Only one interactable highlighted at a time — `nearestTerminal()` distance-gates selector vs. lever (48px radius each, ~110px apart); confirmed terminal id flips cleanly between `b-selector` and `lift` as the player walks between them.
- No duplicate "Guna · Guna" wording: `game.js` special-cases `isB` terminals to show the bare action text on touch instead of prefixing `Guna · `.
- Help dialog (`Bantuan`) open/close verified mid-sequence (input 1): opens the existing worked-solution panel, closes cleanly, focus returns to `#game`, `bInput` is untouched.

## 7. Save / reload QA

- Pause mid-lift-animation (input 2): plank Y is frozen while paused, resumes correctly, no stranded state.
- Reload after help close (input 1): `bInput` and `bLastTrial` both persist correctly.
- Reload after a non-target trial (input 4): `bInput`, plank position, and absent collider all persist.
- Reload after solving (input 3): collider and plank position at 1080 both persist; checkpoint `b-lift` holds.
- Full route reload at the end: player still spawns before the lift, gate solved, planks parked at the crossing level — confirmed.

## 8. Screenshots

All captured in `screenshots/`: `before-b`, `{desktop,portrait,landscape}-unselected`, `-trial-{0,1,2,4}`, `-moving`, `-target`, `-crossed`. Spot-reviewed desktop-unselected, desktop-target, and portrait-crossed — world stays visible, panel doesn't obscure ladder/lever/player, no overlapping prompts, numbers legible at both panel positions (top-center desktop, full-width top-of-screen portrait per the `@media(max-height:500px)` rule).

Mobile landscape set was missing from the interrupted run; it is now complete alongside the other two.

Separately, `natural/a-to-e-regression.json` (recorded earlier, not re-run this session) shows the full natural A→E route — including B — still completes with no page/console/request errors, confirming B's change didn't regress the rest of the route.

## 9. Browser health

Zero `pageerror`/console-error/failed-request entries across all three `browser-qa.py` runs (`errors: []` in `browser-results.json` for desktop, portrait, landscape).

## 10. Remaining issues

- `openPuzzle()` in `mechanisms.js` still carries unreachable `kind==='lift'` branches (lines ~190–204, 215–219, 234) from before the redesign. They cannot execute (short-circuited at line 173) but are dead weight — worth a follow-up cleanup pass, not a functional bug.
- The first `browser-qa.py` attempt this session hit one flaky `nearestTerminal()` timing race (resolved on immediate re-run, deterministic since); not reproducible in two subsequent full runs or a manual step-by-step repro. Noting it in case it recurs under different load.

## Verdict: **PASS**

Zone B is complete. The lever cannot be operated without a world-based selector interaction, no modal panel is required for the core loop, mathematics drives an observable physical consequence (lift position + collision), and all QA categories A–F ran and passed in all three target viewports.

## Handoff

- Chill Boy operates the lift entirely through world interactions (selector sign + lever); the old quiz-grid panel is no longer reachable from the lift/selector terminals.
- It reads as a physical mechanism: walk to the sign, dial a number, walk to the lever, pull it, watch the deck move to a labeled stop code, and either retry or cross.
- All other mechanics (A, C–G) and saves are untouched and unaffected — confirmed via the unchanged `a-to-e-regression.json` route and file diffs limited to the 7 files above.
- Recommended order for the next zones: **C → E → G**. C is the next-smallest surface (single optional pattern challenge, no physical machine to redesign) and will validate the "compact challenge, no required panel" pattern on a second, simpler case before tackling E's multi-stage waterworks composition. G (two-latch finale) should come last since it's the highest-stakes/most load-bearing interaction and benefits from whatever pattern conventions C and E settle.
