# Lorong Atas Bumbung — V8 Phase 4: Audio Event Mapping

Exact code locations (file: `src/game.js` unless noted).

| Event | Single-fire guarantee (reused, not reinvented) | SFX call |
|---|---|---|
| Jump (ground) | `jumpAt` reset to `-1000` immediately after the impulse — can't fire twice for one jump | `SFX.jump(audio)` right after `body.setVelocityY(-MOTION.jump)` |
| Jump (off a ladder) | Same pattern | `SFX.jump(audio)` right after the ladder-jump `body.setVelocity(...)` |
| Landing | Phase 2/3's `grounded && !lastGrounded && !climbing` edge | `SFX.land(audio, impact)` — `impact` is the exact 0–1 value already computed for scaling the landing dust burst, reused unchanged |
| Coin collection | `coin.active` flips false the instant `destroy()` runs | `SFX.coin(audio)` right after the sparkle/+1 text calls |
| Checkpoint activation | `checkpointIndex++` changes which entry `nextCheckpoint` resolves to on every later frame | `SFX.checkpoint(audio)` right after `pulseRing(...)` |
| Correct answer | `answer()`'s correct branch is reached once per puzzle (`solvedGates.add` + `openPuzzle()`'s own gate check prevent re-entry) | `SFX.correct(audio)` — first line of the correct branch |
| Incorrect answer | The `!result.correct` branch, mutually exclusive with the correct branch — **never** reaches the `SFX.machine`/`SFX.bridge` calls below it | `SFX.incorrect(audio)` right before the early `return` |
| Machine activation | Same correct-branch guarantee as "Correct answer" | `setTimeout(() => { if (!audio.isPaused()) SFX.machine(audio); }, 120)` — staggered 120ms after the correct chime; the `isPaused()` guard additionally protects against the sound firing audibly late if the player pauses in that brief window |
| Bridge unlock | Same correct-branch guarantee | `SFX.bridge(audio)` at the exact line the gate's collision body (`this.gateBodies[gate.id]=this.platform(gate)`) and plank art are created |
| Victory | `finish()` itself only runs once per playthrough (`update()` returns immediately once `mode !== 'playing'`; a replay fully restarts the scene) | `SFX.victory(audio)` — called unconditionally (not gated by `reducedMotion`), at the same point the Phase 3.1 sparkle celebration begins |
| UI — start | N/A (one-time page action) | `SFX.ui(audio)` in the `#start` click handler, alongside `audio.unlock()` |
| UI — replay | N/A (one-time per completion) | `SFX.ui(audio)` in the `#replay` click handler |
| UI — SFX slider preview | N/A (user-driven, naturally rate-limited by human slider dragging + the `ui` category's own 80ms cooldown) | `SFX.ui(audio)` on the `#audio-sfx` range input's `input` event, so the player can hear the level they're setting |

## Pause/resume (not a gameplay event, but part of the required lifecycle)

| Hook | Call |
|---|---|
| `pauseRun()` | `audio.pause()` — `AudioContext.suspend()` |
| `resumeRun()` | `audio.resume()` — `AudioContext.resume()` |

## Explicitly NOT wired to any audio

- `openPuzzle()` / `closePuzzle()` / `requestHint()` — no sound, per the brief's own emphasis on restraint and because a hint request isn't a "success/failure" event worth a chime.
- `#resume`, `#restart`, `#pause`, `#hint-btn`, `#close-puzzle`, `#fullscreen` — no UI click sound, deliberately, to keep the "optional, restrained" UI sound from becoming a sound-on-every-click pattern.
- The machine-readiness glow (Phase 3) and its per-frame toggle — a continuous visual state, not a discrete event; giving it a looping drone or a repeated tick was considered and rejected as exactly the kind of "distracting" feedback the brief's §1 goal explicitly warns against.
