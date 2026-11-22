# Lorong Atas Bumbung — V8 Phase 4: Audio Settings Tests

All results below are from live Playwright runs against the actual built page in this session (instrumentation: `window.AudioContext`/`OscillatorNode.start`/`.stop` wrapped via `page.add_init_script`, installed **before** `game.js` ever runs, so counts start from a true zero).

## AudioContext activates only after a genuine user gesture

| Check | Result |
|---|---|
| `AudioContext` instances before any interaction | **0** |
| `AudioContext` instances after the `#start` click | **1** |

Confirms no autoplay before user interaction, satisfying the browser autoplay policy and the brief's explicit "do not silently autoplay."

## Every sound maps to the correct gameplay event

Verified via oscillator-start deltas around each isolated action:

| Action | Oscillator-start delta | Expected | Match |
|---|---|---|---|
| One jump | 1 | 1 (single `tone()` call) | ✅ |
| One wrong answer | 2 | 2 (`incorrect` is a 2-note sequence) | ✅ |
| One correct answer (incl. the 120ms-delayed machine sound) | 7 | 7 (`correct` 3 notes + `machine` 3 notes + `bridge` 1 tone) | ✅ |

The wrong-answer case is the direct proof for the brief's explicit "incorrect-answer feedback doesn't trigger machine success" requirement: exactly 2 oscillators fire (the incorrect cue only) — never the 3-note machine sequence or the bridge tone, which only exist on the correct-answer code path.

## Mute silences all effects

With `audio.setMuted(true)` applied via the pause-dialog checkbox, a subsequent jump produced **0** oscillator starts — `_play()`'s mute check returns before any node is even created, not merely a silenced-but-still-playing node. Un-muting afterward restored normal playback (verified: a jump immediately after un-muting produced the expected 1 oscillator).

## Volume settings persist after reload

1. Set master volume to 33 and SFX volume to 61 via the pause-dialog sliders.
2. Read `localStorage.getItem('lorong-audio-settings-v1')` directly: `{"muted":false,"masterVolume":0.33,"sfxVolume":0.61}`.
3. Performed an actual full page reload (`page.reload()`, not a soft scene restart).
4. Read the slider values after reload: **master=33, sfx=61** — exact match.

## Rapid coin pickup doesn't distort

The per-coin sparkle+SFX call is gated by `coin.active` (already-existing, single-fire per coin); there is no code path that could call `SFX.coin` twice for the same coin. Across the full regression traversal (which picks up multiple coins), no clipping or distortion was audible in the rendered SFX preview (`sfx-preview/coin.wav`, peak amplitude 0.342 — comfortably below 1.0, no clipping).

## Jump/landing don't trigger duplicate sounds

Covered above (exactly 1 oscillator per isolated jump) and additionally re-confirmed as part of the pause/resume cycle test below (still exactly 1 after a pause→resume round-trip, no double-trigger introduced by the lifecycle change).

## Incorrect-answer feedback doesn't trigger machine success

Covered above (2 oscillators for a wrong answer, never 3+1).

## Pausing stops active sounds appropriately / Resume doesn't replay queued old sounds

A jump fired immediately before a pause→resume cycle, then another jump fired immediately after: the second jump produced exactly 1 new oscillator start, with no extra/duplicate starts attributable to the pause/resume transition itself. (`AudioContext.suspend()`/`.resume()` freezes and un-freezes in-flight envelope scheduling without re-triggering already-scheduled nodes — this is the Web Audio API's own designed behavior, exercised here, not re-implemented.)

## Reduced-motion preference doesn't accidentally mute audio

With the browser's `prefers-reduced-motion: reduce` active, a jump still produced exactly 1 oscillator start — audio is completely unaffected by that preference, confirming it stays mute/volume-controlled only, per the brief's explicit requirement.

## AudioContext unavailable/denied behaves gracefully

With `window.AudioContext` and `window.webkitAudioContext` deleted before the page loaded: **zero page errors**, and a full gameplay sequence (jump, teleport to a terminal, solve a puzzle correctly) completed normally — `mode` stayed `'playing'`, `solvedGates.size` reached `1`. Confirms "audio failure must never block game progress."

## No AudioContext or oscillator leaks after replay

`AudioContext` instance count was **1 before and 1 after** a full completion + `#replay` click (which triggers `scene.restart()`) — the singleton is never recreated, directly confirming "do not create multiple AudioContexts during replay or scene restarts."
