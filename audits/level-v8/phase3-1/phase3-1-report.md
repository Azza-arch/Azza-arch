# Lorong Atas Bumbung — V8 Phase 3.1: Game Feel Final Fixes — Report

**Status: implemented.** Scope: two targeted fixes in `src/game.js`, nothing else. No new effects, no new assets, no audio, no gameplay/physics/camera/layout/puzzle/checkpoint changes. Nothing committed.

---

## Fix 1 — Victory effect visibility

**Problem:** `finish()` called `$('complete').showModal()` in the same synchronous tick as the goal sparkle bursts, so the dialog's own pre-existing semi-transparent backdrop (`#151914a6`) covered the canvas almost immediately, muting the celebration.

**Fix:** restructured `finish()` so the celebration plays on the open, undimmed canvas first; the dialog now opens via `this.time.delayedCall(420, showDialog)` — 420ms, matching the longer sparkle burst's own lifespan, so the dialog opens right as the burst finishes rather than mid-animation. Under `prefers-reduced-motion`, the delay is skipped entirely (`showDialog()` called immediately, since there's no effect to wait for) — no new timing system, just this method's own existing `this.time` (the same Clock every other effect's cleanup already runs on).

**Still fires exactly once:** unchanged guarantee — `finish()` itself is only ever called once per playthrough (`update()`'s first line returns immediately once `mode !== 'playing'`), and `showDialog` is a local closure referenced nowhere else, so it cannot double-run.

**Verified live (not assumed from reading the code):**
- Captured the frame where `mode==='complete'` but the dialog is still closed (`screenshots/victory-00-mode_complete-dialog_False.png`) — the sparkle burst is clearly visible around the goal flag on a fully undimmed canvas, confirmed by direct visual inspection.
- Reduced-motion: dialog opened in 23ms (essentially the very next update tick) — confirms no artificial wait is imposed when there's no effect to show.
- Full `tests/probe.py` regression (which waits on `#complete[open]`) still passes — the slightly later dialog-open timing doesn't break anything downstream.

## Fix 2 — Pause-aware effects

**Problem:** `pauseRun()` paused `physics.world` but never paused Phaser's own `TweenManager`/`Clock` — every tween (squash/stretch, the bridge-reveal fade, the existing coin-bob animation, and every Phase 3 effect's own tween/cleanup timer) kept running in real time while the game was "paused" by the player-visible mode flag.

**Fix:** two lines, reusing Phaser's own native pause/resume APIs (explicitly not a second effect-tracking system, per the brief's own restriction):
- `pauseRun()`: `this.tweens.pauseAll(); this.time.paused = true;`
- `resumeRun()`: `this.tweens.resumeAll(); this.time.paused = false;`

This pauses every tween and every `delayedCall` in the scene at once — including the cleanup timers that destroy one-shot dust/sparkle emitters, which is exactly what prevents a particle from silently fading out "behind" the pause screen.

**Deliberately scoped to the real pause only:** `openPuzzle()`/`closePuzzle()` were not touched, so a machine-solved pop/pulse keeps playing normally while the player reads the correct-answer message — matching the brief's explicit "do not interrupt normal puzzle interactions unless the gameplay is genuinely paused."

**Verified live (engine introspection, not just screenshots):**
1. Triggered a jump (2 particle emitters, 8 active tweens — see below), paused immediately mid-effect.
2. While paused: `time.paused === true`, emitter count unchanged, player position frozen.
3. **Waited 700ms while still paused — well past the dust effect's normal ~480ms self-cleanup window — and the emitter count was still unchanged (2).** This is the specific bug the fix targets: without it, the cleanup timer would have fired mid-pause and the particle's fade-out would have visibly animated in real time behind the pause screen.
4. Resumed: `time.paused === false`.
5. 700ms after resuming: emitter count dropped to 0 — the frozen cleanup timer correctly resumed and completed.

**Side benefit, not separately requested but verified as correct:** the 8 active tweens detected mid-effect include the existing collectible coin-bob animations (each a `repeat:-1` tween, present since before this phase) — these are now also correctly paused/resumed by the same fix, closing a small pre-existing inconsistency (coins kept bobbing during the pause menu before this change) as a natural consequence of reusing Phaser's own `pauseAll`/`resumeAll`, not a separately engineered fix.

## Files modified

Only `src/game.js`: `finish()` restructured (celebration-then-dialog sequencing), `pauseRun()`/`resumeRun()` (two new lines each, native Phaser APIs). Nothing else — `src/level.js`, Phase 1's scenery, and Phase 2's animation-state logic are untouched, confirmed by the full regression suite reusing the exact same geometry and passing unchanged.

## Tests run

- **`node --test`: 11/11 pass.**
- **`tests/probe.py` (full natural-input regression): pass, 0 page/console/network errors.** Full A→G traversal, all three machines, all three checkpoints, the existing pause/resume check (player position frozen while paused — now additionally correct for effects too), checkpoint recovery, and replay (full state reset) all re-confirmed.
- **Dedicated live diagnostics (this session, not part of the standard suite):** victory-visibility frame capture, reduced-motion victory timing, and the pause/resume emitter-freeze test described above.

## What was NOT changed

No new effects were added. No artwork, no audio. Physics, collision, camera, world layout, puzzle formulas, gate logic, and checkpoint coordinates are all untouched. The completion dialog's own markup/styling/backdrop (`index.html`/`style.css`) was not touched — the fix is purely a sequencing change in when it opens, not how it looks.

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — unchanged, still entirely untracked. No commit was made.

**Stopping here. Not starting Phase 4.**
