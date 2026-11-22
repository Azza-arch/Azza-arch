# Lorong Atas Bumbung — V8 Phase 4: Audio Lifecycle Tests

## Core regression (unaffected by audio)

- **`node --test`: 11/11 pass**, unchanged — `src/level.js` was not touched this phase.
- **`tests/probe.py` (full natural-input regression): pass, 0 page errors, 0 console errors, 0 failed requests.** Full A→B→C→D→E→F→G→GOAL traversal, every jump/landing, the optional cave coin, all three checkpoints, all three machines (including a live gate-bypass attempt), checkpoint recovery, pause/resume, and replay all re-confirmed with the full audio system active — none of it broke, slowed, or altered any existing assertion.

## Pause/resume lifecycle

- `pauseRun()`/`resumeRun()` extended with `audio.pause()`/`audio.resume()` **alongside**, not replacing, Phase 3.1's `tweens.pauseAll()`/`time.paused` lines — confirmed by direct code review: neither existing line was removed or reordered.
- `AudioContext.suspend()` (in `pause()`) and `.resume()` (in `resume()`) are the Web Audio API's own native pause mechanism — chosen specifically because it is architecturally identical to the tween/time pause already in place (freezing in-flight time progression, not merely muting), satisfying the brief's explicit "do not create a second effect-management system."
- Verified live: a jump fired immediately before pausing, then another jump fired immediately after resuming — the post-resume jump produced exactly one new oscillator start, with no stray/duplicate/delayed sound attributable to the pause transition.

## Replay / scene restart

- `audio` is a module-scope singleton (`export const audio = new AudioManager()` in `src/audio.js`), constructed once when the module is first imported by the page — **not** a property of the Phaser `Scene` class. `scene.restart()` (the mechanism behind the replay button) tears down and recreates the Scene instance but never re-imports `audio.js`, so the same `AudioManager` — and the same single `AudioContext` — persists across every replay by construction, not by a runtime guard that could be bypassed.
- Verified live: `AudioContext` instance count was identical (1) immediately before and immediately after a full level completion followed by clicking `#replay`.
- Settings (`muted`/`masterVolume`/`sfxVolume`) are read from `localStorage` once at `AudioManager` construction and held in memory thereafter — a replay does not reset or reload them, so a player's volume preference correctly survives a replay (it would only be re-read from storage on an actual page reload, which is the intended, standard behavior for a persisted setting).

## Browser tab changes / window blur

- The existing `window.addEventListener('blur', ...)` and `document.addEventListener('visibilitychange', ...)` listeners already route through `pauseRun()` (unmodified this phase) — since `pauseRun()` now also calls `audio.pause()`, tab-switch-triggered pausing correctly suspends audio for free, with no separate blur/visibility handling needed for audio specifically.

## AudioContext-unavailable path

- With `window.AudioContext`/`webkitAudioContext` deleted before page load: `AudioManager.unlock()`'s `new Ctx()` call is guarded (`if (!Ctx) return;` before construction is even attempted when the globals are absent), `this.ctx` stays `null`, and every subsequent `_play()` call no-ops via its own `if (!this.ctx) return;` guard. Confirmed zero page errors and full gameplay functionality (see `audio-settings-tests.md`'s dedicated section) in this state.

## Node/leak check

- Every one-shot SFX's oscillator/gain nodes are explicitly `.disconnect()`-ed inside a `setTimeout`-scheduled cleanup, timed to fire slightly after the sound's own last scheduled `stop()` — mirroring Phase 3's particle-cleanup pattern exactly. Combined with the AudioContext-singleton behavior above, there is no code path in this implementation that accumulates AudioContexts, oscillators, or gain nodes across repeated play, pause/resume, or replay.
- This was not separately stress-tested with hundreds of rapid triggers in this session (the brief's explicit test list does not ask for a load/stress test, and the game's own gameplay pacing never produces more than a handful of SFX triggers per second even in the fastest realistic traversal) — flagged here as the boundary of what was verified, not claimed beyond it.

## What was NOT touched

`src/level.js`, world layout, player physics, collision, camera, scenery (Phase 1), the animation state machine (Phase 2), puzzle formulas, machine/gate/checkpoint positions, and the unrelated Add Math pages — all confirmed unchanged by the full regression suite passing with the exact same assertions as every prior phase.
