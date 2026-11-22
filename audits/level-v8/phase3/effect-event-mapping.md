# Lorong Atas Bumbung — V8 Phase 3: Effect → Event Mapping

Exact code locations, for traceability (file: `src/game.js`).

| Event | Guard / single-fire mechanism | Effect call | Reduced-motion |
|---|---|---|---|
| Jump takeoff (ground) | `jumpAt` reset to `-1000` immediately after the impulse is applied — this line physically cannot run twice for the same jump | `this.dustBurst(player.x, body.bottom, 5)` right after `body.setVelocityY(-MOTION.jump)` | Skipped (helper returns early) |
| Jump takeoff (off a ladder) | same pattern, `jumpAt=-1000` | `this.dustBurst(player.x, body.bottom, 4)` right after the ladder-jump `body.setVelocity(...)` | Skipped |
| Landing | Phase 2's existing `grounded && !lastGrounded && !climbing` edge (already proven single-fire — it's the same condition the squash/stretch uses) | `this.dustBurst(player.x, body.bottom, 2 + impact*6)` where `impact = min(1, lastVy/700)` | Skipped |
| Coin collection | `coin.active` flips false the instant `destroy()` runs; the overlap loop can't re-match a destroyed sprite | `this.sparkleBurst(cx, cy, 7)` + `this.floatingText(cx, cy-14, '+1')` | Skipped |
| Checkpoint activation | `checkpointIndex++` changes which `CHECKPOINTS` entry `nextCheckpoint` resolves to on every subsequent frame — the block cannot re-enter for the same checkpoint even while standing on it | `this.pulseRing(art.x, art.y-44, 0x1b5e20)` | Skipped |
| Machine readiness | Re-evaluated every frame directly from the existing `nearestTerminal()` result — not a one-shot effect, a continuous state toggle | `machineGlow.setVisible(true/false)`, alpha driven by `time` when motion allowed | Ring still shown (state, not motion) but alpha held at a fixed value instead of pulsing |
| Machine solved | `answer()` only reaches the correct-answer branch once per puzzle — `solvedGates.add(...)` plus `openPuzzle()`'s own gate check prevent re-entry | `lever.setScale(1.3,1.3)` + tween back to 1 + `this.pulseRing(terminalPos.x, terminalPos.feet-40, 0xc9a227)` | Pulse skipped; lever pop skipped (both gated) |
| Goal celebration | `finish()` only runs once per playthrough — `update()`'s first line returns immediately once `mode !== 'playing'`, and a replay fully restarts the scene rather than re-entering `'complete'` | Two staggered `this.sparkleBurst(...)` calls, 140ms apart | Skipped |

## Cleanup mechanism (all one-shot effects)

Every `dustBurst`/`sparkleBurst` call creates one `ParticleEmitter`, immediately calls `.explode(count)` on it (synchronous one-shot, `emitting:false` so it never continues emitting on its own), then schedules `this.time.delayedCall(lifespan+100, () => emitter.destroy())`. Every `pulseRing`/`floatingText` call creates one shape/text object with a single tween whose `onComplete` destroys it. Nothing persists beyond its own effect duration except the one reused `machineGlow` ring (toggled, never recreated).
