# Lorong Atas Bumbung — V8 Phase 3: Test Results

## Unit tests (`node --test tests/level.test.mjs`)

**11/11 pass**, unchanged — expected, since `src/level.js` was not touched at all this phase.

## Browser regression (`tests/probe.py`, full natural-input run)

**Pass. 0 page errors, 0 console errors, 0 failed requests.** Full A→B→C→D→E→F→G→GOAL traversal re-confirmed with every effect active: every jump (takeoff dust), every landing (landing dust), the optional cave coin (sparkle+text), all three checkpoints (pulse), all three machines solved (lever pop + pulse), goal reached (celebration burst). Gate-bypass and Machine-2-bypass checks still correctly blocked. Checkpoint recovery still preserves solved gates. Replay still fully resets. Mobile (touch run/jump/interact, rotate, puzzle, pause), the missing-asset failure path, and the unrelated Add Math shell all still pass unchanged.

## Jump and landing edge cases (dedicated live diagnostics, this session)

| Case | Result |
|---|---|
| Takeoff dust fires exactly once per jump (not once per frame while rising) | Confirmed — `jumpAt` reset prevents re-trigger; object-count check (below) shows no accumulation across 5 rapid jumps |
| Landing dust scales with impact speed | Confirmed — `lastVy` correctly captures the pre-landing falling speed (read before being overwritten), count formula `2+impact*6` verified to vary with drop height |
| No dust spawns at scene start (player already grounded) | Confirmed — `lastGrounded` starts `true`, so frame 1 never reads as a landing edge |
| No squash/stretch or dust interference with each other | Confirmed — both reuse the exact same detection edges Phase 2 already validated; this phase added a sibling call inside the existing `if` blocks, not a new parallel check |

## Coin pickup

Confirmed live: sparkle burst (7 particles) and the "+1" floating text both spawn at the coin's exact position, both fade/destroy within ~650ms, and `coin.active` correctly prevents any double-trigger (re-overlapping a destroyed coin's former position is a no-op, same as before this phase).

## Checkpoint activation

Confirmed live: the pulse ring fires exactly on the frame `checkpointIndex` increments, for all three checkpoints in the full traversal. Standing at a checkpoint's position for multiple frames does not re-trigger it (same pre-existing guard, unmodified).

## Machine interaction

- **Readiness cue:** confirmed the ring becomes visible exactly when `nearestTerminal()` returns non-null and disappears the frame the player moves out of range, for all three terminals.
- **Solved response:** confirmed the lever scale-pop and pulse ring both fire exactly once per puzzle, immediately following the existing `kenney_lever_left` texture swap, for all three puzzles (`f(3)=7`, `3x-2=10⇒x=4`, `4x-3=17⇒x=5` — none of the three answers or their validation logic were touched).

## Completion and replay

Confirmed `finish()`'s goal-celebration bursts fire exactly once (engine introspection: exactly 2 `ParticleEmitter` objects created at the goal-reached frame, not reproducible on replay without a fresh full completion, since `scene.restart()` returns to `mode:'welcome'` and the full mandatory route — including the three now-still-solved-only-until-restart gates — must be re-crossed). The existing completion dialog's text/stats fields are unmodified and still populate correctly.

## Reduced-motion checks

Live Playwright run with `reduced_motion: 'reduce'`: Phaser's scene display-list object count was **identical before and after a full jump cycle** (278 objects both times) — confirms zero particles, zero extra tweens are created under reduced motion. The machine-readiness ring still appears (it's a state indicator, not motion) but holds a fixed alpha instead of pulsing, per the design in `effect-event-mapping.md`.

## Object-leak / accumulation check

Live Playwright run, non-reduced-motion: baseline object count 279 → mid-effect (emitter alive) 280 → after cleanup delay 279 (back to baseline) → after 5 more rapid jumps with cleanup waits, 278 (still at baseline, small variance from an incidental coin pickup during movement, not a leak). Confirms the `delayedCall`-based cleanup works correctly and effects do not accumulate over repeated triggering.

## Mobile and desktop performance

See `performance-notes.md` for the full breakdown. Summary: `tests/probe.py`'s existing mobile viewport pass (390×844 touch + 844×390 landscape) completed with 0 errors with all effects active; no frame-rate regression was observed or expected, given the small, short-lived particle counts involved.

## Browser console/network errors

**Zero**, across every run in this session — `node --test`, the full `tests/probe.py` suite (desktop/mobile/missing-asset/shell), and every dedicated diagnostic script.
