# Phase 6.5B2-G — Final river bridge, world-first interaction — final report

## 1. Starting point

Zone G had exactly one terminal (`river-final`) that opened the generic `#mechanism` modal for both locks — the last zone still using the old quiz-panel pattern (B, C, E were already redesigned in prior phases). The underlying math (`h(x)=4x-3`, `f(x)=2x+1`, `g(x)=3x-2`, target 17/13, the lever's two hinge angles, the bridge tween, the non-collider-until-safe timing) was already correct and is **unchanged**. The sign and lever art were *already placed* in the world (`tile(85,7336,918,11)` and the hinged lever container at pivot x≈7423) but were never wired as separate interactables — both locks ran through one combined terminal at x=7390, sitting on top of both sprites.

## 2. What changed

| File | Change |
|---|---|
| `src/v12/level.js` | `TERMINALS`: single `river-final` → `river-select` (x=7363, matching the existing sign sprite) + `river-lever` (x=7423, matching the existing lever pivot) |
| `src/v12/g-control.js` / `g-control.css` | **new** — compact world aside (`#g-control`), same Timber Edge pattern as B/C/E, showing "Pengunci 1/2 → 2/2 → Jambatan terbuka!", the current dial/order, and the last tested result |
| `src/v12/environment.js` | init `riverInputSel`, `riverLastInputTrial`, `riverOrderSel`, `riverLastOrderTrial` — no new sprites, no sprite repositioning |
| `src/v12/mechanisms.js` | new `cycleRiverSelect()` (reuses the one sign for both locks — digit 0-9 before lock 1, F/G order after), `activateRiverLever()`, `runRiverLock1()`, `runRiverLock2()` (world-first versions of the existing `testRiverInput`/`chooseRiverOrder`, same lever angles/bridge/collider logic), `openRiverHelp()`; `nearestTerminal()` extended (see §4 for the radius fix); save/restore paths extended for the four new fields |
| `src/v12/game.js` | `syncGControl` wired in; prompt text + camera-clamp for `river-select`/`river-lever`; interact dispatch; `river-help` added to the help-modal `KeyH` toggle |
| `src/v12/save.js` | four new sanitized fields (`riverInputSel`, `riverLastInputTrial`, `riverOrderSel`, `riverLastOrderTrial`) — schema otherwise unchanged; old saves simply get `null`/empty values for these (see §7) |
| `src/v12/presentation.js` | `explain()`'s key resolution: `river-final` → `river-help` |
| `src/v12/dialogue.js` | `found:river-final` → `found:river-select`, added `found:river-lever`; `origins` map updated |

Old `openPuzzle()`/`testRiverInput()`/`chooseOrder()`/`chooseRiverOrder()` branches tied to `kind==='river-final'` are now unreachable (no terminal has that kind) — same leftover-dead-code category already flagged in the B1, B2-C, and B2-E reports. Not removed, out of scope.

## 3. World interaction sequence

Walk to the sign → E/Guna cycles 0–9 (starts unselected, never reveals 5) → walk ~60px to the lever → E/Guna tests it → wrong input retells the real `h(x)` output and stays retestable, correct input (5) rotates the lever halfway, saves, and shows "Pengunci 1/2 → 2/2" → walk back to the *same* sign, now cycling F/G order instead (first press lands on the wrong order, never the right one) → walk to the lever → test → wrong order shows the real intermediate/output and retries freely, correct order (F then G) raises the bridge, adds the collider only once it settles, and opens physical crossing. No modal appears anywhere in this loop; Bantuan is reachable throughout and never changes progress.

## 4. A real design issue found and fixed: terminal spacing

The existing sign (x=7363) and lever (x=7423) are only 60px apart — an artifact of the old single-terminal design, not something built with two independent interactables in mind. A 48px radius (used elsewhere) would overlap by 36px. Verified in-engine (not assumed): with 48px, ordinary movement overshoot made the player's own walk occasionally register the wrong terminal — pressing E at the sign would sometimes activate the lever instead, mid-sequence.

Per the brief's own instruction ("if a proposed arrangement cannot be implemented safely, choose the simplest feasible alternative and document why"), the fix was to **tighten the interaction radius to 25px for these two terminals specifically**, not move the existing art. This removes the overlap (small ~10px dead zone between them instead) at the cost of needing slightly more precise standing — acceptable for a final-puzzle control, and still well within what a player adjusts for by watching the on-screen prompt change. This is disclosed as a visual-tightness tradeoff in §9, not hidden.

## 5. Mathematical output verification (checked at runtime, not just read from source)

- Lock 1 non-target: input 3 → `h(3)=4(3)-3=9` (confirmed via `s.riverLastInputTrial`)
- Lock 1 target: input 5 → `h(5)=4(5)-3=17` (confirmed; gate `river-input` set, lever at -24°)
- Lock 2 non-target (GF): `g(2)=4`, `f(4)=9` → confirmed `{order:'gf',intermediate:4,output:9}`, matching the brief's "2 → 4 → 9" exactly
- Lock 2 target (FG): `f(2)=5`, `g(5)=13` → confirmed `{order:'fg',intermediate:5,output:13}`, matching "2 → 5 → 13" exactly
- Collider absent while `CROSSING_ACTIVATING`-equivalent tween runs, present only once `river-crossing` is solved — confirmed by polling `gateBodies['river-crossing']` at both points, not just before/after

## 6. State / collision verification

Confirmed by direct automated playthrough (not assumption): unsolved state (nothing selected, `#g-control` shows "Pengunci 1/2"); lock-1-solved-only state via reload (`riverLever.angle===-24` restored, lock 2 untouched); lock-2 non-target retry (immediate, no cooldown, doesn't reset the selected order to null); both-locks-solved reload (bridge at rest position, collider present, `riverLever.angle===-52`); pause mid-second-lock-activation (`riverBridge[0].y` frozen while paused, resumes to the same result); completed-save reload (re-shows the completion screen rather than gameplay — this is existing, correct behavior for a finished run, not a bug, and the test was adjusted to expect it rather than assuming `mode==='playing'`).

## 7. Save compatibility

No existing field was removed or repurposed. Four new fields were added, all defensively sanitized (`validRiverInput`/`validRiverOrder` range-check the selection; `sanitizeRiverInputTrial`/`sanitizeRiverOrderTrial` **recompute** the trial's output from the real math rather than trusting a stored value, so a hand-edited localStorage entry can't forge a result). An old save with no knowledge of these fields gets `null` for all four — purely cosmetic (what's currently dialed on the sign), and has zero effect on `solvedGateIds`, which is what actually gates progress and was not touched.

## 8. Traversal — keyboard, touch, and the one disclosed automation gap

**Both `river-select` and `river-lever` interactions themselves were exercised via real touch taps** on the portrait run (`Locator.tap()` on the same `[data-action="interact"]` button a player uses), in addition to full keyboard coverage on desktop — this is genuine touch coverage of the actual Zone G mechanism, not skipped.

**Jump traversal to/from Zone G** (crossing the bridge gap on the way out, and the step up to the goal shelf) used keyboard on both runs. This is the same disclosed, previously-documented limitation from Phase 6.5B2-E: CDP's multi-point touch dispatch does not reliably synthesize the second simultaneous `pointerdown` a two-thumb jump needs, and hand-built `PointerEvent`s fail the game's own `setPointerCapture` call for untrusted synthetic pointers. This is pre-existing cross-zone platforming, not a Zone G change. **Minimum follow-up**: a manual device/emulator pass confirming two-thumb jump timing across the river gap and the goal-shelf step — not attempted this session.

**At least one natural-input crossing to the real goal was completed and verified**: full keyboard walk from the solved bridge to `GOAL.x=8316`, a real jump up the goal-shelf step, and a real `E` press at the door — confirmed via `s.levelCompleted===true` and `s.mode==='complete'`, not a fixture reset. Landscape viewport was not separately tested (portrait covered touch; desktop covered keyboard and the widest layout) — not attempted given the disclosed jump-automation ceiling would apply identically there.

## 9. Tests run

- `audits/denai-v12/phase6-5b2-g/browser-qa.py` (desktop keyboard 1440×900, portrait touch 390×844, plus a third pause/partial-continue pass) — run **twice in a row, both clean**: `desktop`, `portrait`, `pause-and-partial-continue` all passed, zero console/page/network errors.
- One regression pass on shared files (`mechanisms.js`, `game.js`, `presentation.js`, `dialogue.js`, `save.js` were all touched): `audits/denai-v12/phase6-5b1/natural-a-e.py` — passed, zero errors. Not repeated beyond this single confirming run, per the instruction not to run full-game regressions without evidence of an issue.
- `audits/denai-v12/phase6-5b1/state.test.mjs` (Node) — 2/2 pass, confirming Zone B's own save-shape tests are unaffected.

## 10. Screenshots

`audits/denai-v12/phase6-5b2-g/screenshots/`: `{desktop,portrait}-g-locked`, `-first-selector`, `-first-non-target`, `-first-activated`, `-order-selection`, `-second-non-target`, `-final-activation`, `-bridge-moving`, `-safe-bridge`, `-real-goal` (20 files). Reviewed: the `#g-control` panel never overlaps the player or the sign/lever; the same sign visibly relabels its prompt from "E · Tukar input 0–9" to "E · Tukar susunan F/G" at the identical screen position across the two locks (the "same sign, two roles" design reads correctly); the bridge opening and the real destination door are both clearly visible and uncluttered.

## 11. Remaining risks

- **Sign/lever visual crowding**: because the existing art is reused at its original 60px spacing, the player sprite visually overlaps both the sign and the lever simultaneously while standing between them (visible in the selector/activation screenshots). Functionally unambiguous (the tightened 25px radius plus the prompt text make it clear which one is active), but tighter-looking than B's 110px-spaced equivalent. Not fixed — would require moving the existing lever/sign art, out of this phase's "no new machine sprites, reuse existing" scope.
- **Jump-based traversal untested by automation** — §8.
- **Landscape viewport untested** — §8.
- Dead `river-final`-keyed branches remain in `openPuzzle()`/`testRiverInput()`/`chooseOrder()`/`chooseRiverOrder()`, same leftover category as prior phases, not touched.
- The transient achievement-style top banner occasionally sits close to (not overlapping, but near) the top edge of `#g-control` in narrow portrait height — cosmetic only, same pattern seen in other zones' notice/aside proximity.

## Verdict: PASS

Zone G now runs the full Inspect → configure → activate → observe → retry → cross loop through the world (one reused sign driving both locks, one reused lever, no modal in the loop), with both locks' math verified correct at runtime, collision safety verified (no early collider, confirmed both before and after settle), and a genuine natural-input crossing to the real goal completed and confirmed — not a fixture teleport. One real design issue (terminal-spacing overlap) was found through testing and fixed with a documented, minimal-footprint change rather than moving existing art.

Not started this phase: Phase 6.5C world redesign, Phase 6.5D UI redesign, Phase 7, any V9/V10/V11 edit, any commit/push/deploy.
