# Phase 6.5B2-E — Waterworks experience polish — final report

## 1. Starting point (read before changing anything)

Zone E's core mechanism was already built and already matched most of this phase's brief: two configurable stages (`water-stage-f`/`water-stage-g`), a separate lever (`water-activate`), a world-mounted flow-dot animation along a fixed left-to-right pipe path (`eWaterPath`), dynamic stage-role labels (`renderWaterworksState()` already wrote "Pertama · F"/"Kemudian · G" depending on chosen order), correct math (`f(x)=2x+1`, `g(x)=3x-2`, FG→19, GF→15, both routes passing through intermediate 7 for different reasons), a non-collider-until-safe bridge, and the same world-first `interactWaterworks()` dispatch (no modal) already used by Zones B/C. Choosing an order never auto-submitted. None of this needed rebuilding.

Two real gaps against the brief:
1. **No optional Bantuan.** A `lessons['water-composition']` entry existed in `presentation.js` with correct content, but no terminal ever had `kind==='water-composition'` — it was unreachable dead code, same category as other leftover branches from earlier phases. There was no way to actually open it.
2. **Four world-space text labels (`waterStage1`, `waterStage2`, `waterTag`, `waterResultLabel`) were permanently visible** the instant the player entered Zone E's camera view, with no hide/show gating — unlike every other zone's redesigned readout (B's `liftReadout`, D's `numberReadout`, C's `cReadout`), which stay hidden until something actually happens. This is exactly the "permanently visible … label" risk the brief calls out.

## 2. What changed

- **`src/v12/e-control.js` / `e-control.css`** (new) — a compact, always-optional world aside (`#e-control`), structurally identical to the already-approved `#b-control`/`#c-control` pattern (same Timber Edge palette, reused not reinvented). Shows the current order ("Susunan: F → G" / "G → F" / "Belum pilih susunan") and a one-line status ("Periksa mesin F dan G…" → "Input 3 · Sasaran 19" → "Output 15 · Cuba susunan lain" → "Output 19 · Aliran pulih!") plus a `Bantuan` button. Visible only while `x∈[4104,5650)` (Zone E's own bounds) and `mode` is `playing`/`mechanism-transition`.
- **`openWaterHelp()`** (new, in `mechanisms.js`, mirrors `openBHelp`/`openCHelp`) — opens the existing `#mechanism` modal with the real rule, the current order, and the input/target. Reachable from `#e-help` and, once open, from the same `KeyH` worked-solution toggle already wired for `lift-help`/`c-help`.
- **`lessons['water-composition']` → `lessons['water-help']`** (`presentation.js`) — kept the existing correct numbers, made explicit the brief's emphasis that both orders reach intermediate 7 for different reasons: *"F dahulu: f(3)=7, kemudian g(7)=19. G dahulu: g(3)=7, kemudian f(7)=15. Kedua-dua susunan memberi nilai pertengahan 7, tetapi atas sebab berbeza."* Pipe direction is stated as fixed; only the machine assignment changes — matches the actual geometry (`eWaterPath` never varies by order).
- **`eReadoutShown`/`eOutputShown` flags** (`environment.js` init, set in `interactWaterworks`/`restoreWaterworks`/`restoreWaterExperiment`) + **`presentation.js`** hide-list extended to the four water labels — they now stay hidden until the player has actually chosen an order (mirrors `bReadoutShown`'s pattern exactly), instead of being visible on sight. The in-context spatial labels (machine-anchored "F(3)=7" etc. during/after the experiment) are preserved — only their *default-on* behavior changed.
- **`game.js`** — `syncEControl` wired into `update()`; `KeyH` handler array extended to include `'water-help'`.
- **`v12.html`** — `e-control.css` link + `#e-control` aside markup.

No change to `waterworks.js` (the pure FG/GF math), to `eWaterPath` geometry, to the bridge/collider logic, or to any terminal position. Zones B, C, D, F, G untouched. V9/V10/V11 untouched.

## 3. Player interaction sequence (unchanged from before, now with help available)

Walk to the F or G station → E/Guna picks that function to run first (order is set, nothing auto-runs) → walk to the lever → E/Guna activates → a dot visibly travels the fixed pipe path, each stage's label updating with the real intermediate/final value as the dot passes it → non-target output retells the player and leaves the machine immediately retestable → target output (19) lowers the bridge, creates its collider only once settled, and the crossing opens. `Bantuan` is reachable from the compact aside at any point in `playing` mode and never changes `waterOrder` or game state.

## 4. Math verified at runtime (not just read from source)

- FG: `f(3)=7`, `g(7)=19` — confirmed via `s.lastWaterResult` after a real keyboard playthrough.
- GF: `g(3)=7`, `f(7)=15` — confirmed the same way, including that this leaves `waterworksState==='NON_TARGET_RESULT'` and `water-crossing` unsolved.
- Both intermediate values are 7, produced by different functions (`f` vs `g`) depending on order — confirmed both numerically and that the pipe path (`eWaterPath`) is identical in both cases (direction never reverses; only the text assigned to each stage changes).

## 5. Tests run

### Playwright `browser-qa.py` (desktop keyboard 1440×900; portrait 390×844 for the interaction itself — see §6 for the touch-jump scope note), run **twice in a row, both clean**:
```
desktop:            passed, 0 errors
portrait:            passed, 0 errors
gf-retry-and-pause:  passed, 0 errors
```
Covers: FG=19 end-to-end with correct intermediate; choosing an order never auto-submits (`mode` stays `playing`, `waterworksState` only reaches `CONFIGURED`); Bantuan opens/closes without touching `waterOrder` or any progress state; no early collider (`gateBodies['water-crossing']` absent while `CROSSING_ACTIVATING`, present only once `CROSSING_SAFE`); safe crossing is physically walkable; completed-state reload restores `CROSSING_SAFE` and the collider; GF=15 non-target retry (immediate re-activation allowed, no cooldown, order never reset); an experiment paused mid-animation does not advance (`waterFlowDot.x` frozen while paused, resumes correctly, same result on completion); zero console/page/network errors across all three sub-suites.

### Regression on shared files (`presentation.js`, `mechanisms.js`, `game.js` were all touched)
`audits/denai-v12/phase6-5b1/natural-a-e.py` (full keyboard A→B→D→E route) — re-run once, **passed, zero errors**. This is the real evidence that Zone E's changes didn't disturb B/D, and that the full natural FG route (this regression always chooses FG) still works end-to-end through the normal play loop rather than my own test's helper functions.

### Node unit tests
`audits/denai-v12/phase6-5b1/state.test.mjs` — 2/2 pass, confirming Zone B's own save-shape tests are unaffected (no Zone E save-schema change was made — see §7).

## 6. Disclosed test-scope limitation: touch jump

Reaching the F/G stations requires two keyboard jumps over a stepped platform (pre-existing geometry, unrelated to this phase). A genuine two-thumb touch jump needs two *simultaneous* pointers. Two approaches were tried and both failed for a real reason, not flakiness:
- **CDP multi-point `Input.dispatchTouchEvent`** — the direction hold worked (same method already proven in the B1/C QA scripts), but the second simultaneous point did not reliably generate the compatibility `pointerdown` the game's own `[data-hold]/[data-action]` handlers listen for; the player repeatedly stalled at the same wall (x≈4252, short of the step at x=4266) without ever leaving the ground.
- **Hand-built `PointerEvent` dispatch** — the game calls `button.setPointerCapture(event.pointerId)` in its `pointerdown` handler, which throws for an untrusted synthetic pointer not backed by a real input session, silently aborting the handler before `controls.jump` is ever set.

Given jumping is pre-existing cross-platform platforming, not a Zone E interaction, and further multi-touch test-infrastructure work wasn't a proportionate use of this phase's scope, **the portrait run uses keyboard for traversal to the stations/lever, and touch taps for the actual Zone E interactions** (configuring an order, activating the lever, opening Bantuan — all via `use(p,touch)` → `Locator.tap()` on the same `#game-guna`/`#e-help` elements a real player would tap). This proves touch parity for the mechanism itself; it does not prove a real player can touch-jump across this specific platform gap. No position was teleported or reset to mask this — it's a disclosed, documented scope choice, matching this phase's explicit instruction not to mask traversal issues with undocumented workarounds.

**Minimum follow-up** if full touch-jump coverage is wanted: a manual device/emulator pass (not headless CDP) confirming the existing jump button reaches the F-station platform with two real fingers — this is validating the pre-existing jump control generally, not anything introduced this phase.

## 7. Save/state

No save schema changes. `waterOrder`/`waterworksState` fields are exactly as before. The two new scene-local flags (`eReadoutShown`, `eOutputShown`) are presentation-only (control whether Phaser text objects render) and are re-derived from `waterOrder`/`waterworksState` on every `continueFromSave()`/`restoreWaterworks()` call — they are not persisted and don't need to be, since they're a pure function of state the save already carries.

## 8. Screenshots

`audits/denai-v12/phase6-5b2-e/screenshots/`: `{desktop,portrait}-before-e`, `-stage-config-fg`, `-stage-config-gf`, `-fg-correct-output`, `-water-response-safe`, `-safe-crossing`, plus `desktop-gf-non-target-output` (12 files). Reviewed against the brief's checklist: the `#e-control` panel never overlaps the player, the lever, or a landing surface in any captured state; the machine-anchored "F(7)=15"/"G(7)=19"-style labels sit at head height near their actual machine, legible and distinct from the aside's summary line; the stage/function distinction ("Susunan: F → G" vs the individual "Pertama · F"/"Kemudian · G" machine labels) reads clearly in both desktop and portrait.

## 9. Remaining concerns

- Touch-jump traversal to Zone E's stations is untested by automation — see §6's disclosed gap and suggested manual follow-up.
- The machine-anchored world labels (`waterStage1`/`waterStage2`/`waterTag`/`waterResultLabel`) still use raw Phaser text with the pre-existing `stageStyle` (not yet styled to the Timber Edge direction) — in scope was keeping them hidden-by-default, not restyling them, per "apply only local, compact presentation improvements" and "no global reskin." Worth revisiting once Phase 6.5D's global UI pass happens.
- The dead `isWater`/`'water-composition'` branches inside `openPuzzle()`/`chooseToken()`/`testDial()` remain (unreachable, same category as prior phases' leftover dead code) — not touched, out of this phase's scope.

## Verdict: PASS

Zone E's loop was already Inspect → configure → activate → observe → retry/cross with no required popup before this phase; this phase closed the one functional gap (no reachable Bantuan) and the one presentation gap (permanently-visible labels) the brief specifically called out, verified the existing FG/GF math and collision-safety behavior end-to-end rather than assuming it still worked, and confirmed zero regression on the shared files it touched.

Not started this phase: Zone G, world/UI redesign, any commit/push/deploy.
