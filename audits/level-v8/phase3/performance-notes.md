# Lorong Atas Bumbung — V8 Phase 3: Performance Notes

## Particle budget

| Effect | Particle count | Lifespan | Peak concurrent (worst realistic case) |
|---|---|---|---|
| Takeoff dust | 4–5 | 380ms | 1 emitter (jumps can't overlap each other) |
| Landing dust | 2–8 (speed-scaled) | 380ms | 1 emitter |
| Coin sparkle | 7 | 420ms | 1 emitter (one coin picked up at a time) |
| Goal celebration | 16 + 8 (staggered) | 420ms | 2 emitters, 140ms apart, both short-lived |

Worst-case realistic overlap: a landing immediately followed by a jump (coyote-time double-input) could have two dust emitters alive simultaneously for a few hundred ms — at most ~13 particles on screen at once. No scenario in this game produces more than two effect emitters concurrently, since every trigger is tied to a single-player, single-event action (one jump, one landing, one coin, one checkpoint, one machine, one goal).

## Object lifecycle

Every one-shot effect (`dustBurst`, `sparkleBurst`, `pulseRing`, `floatingText`) creates exactly one Phaser object, performs one synchronous `.explode()` or one tween, and destroys itself via either a tween's `onComplete` or a `this.time.delayedCall` scheduled for shortly after its own lifespan. Confirmed empirically (see `effect-test-results.md`'s object-leak check): the scene's `children.list.length` returns to baseline after each effect completes, including after 5 rapid repeated jumps — no steady-state growth.

The one **persistent** object this phase adds is `this.machineGlow`, a single reused `Circle` shape toggled visible/positioned every frame rather than recreated — the standard, lowest-cost pattern for a continuous (not one-shot) indicator, matching how `this.prompt` (the existing interaction-prompt text) already works.

## Texture footprint

One new 8×8px texture (`fx-dot`), generated once from a `Graphics` object at scene creation and reused via per-emitter `tint` for every dust/sparkle effect. No new image files loaded, no additional HTTP requests, no change to `assets/manifest.json`'s 90-key count (confirmed by `node --test`'s asset-integrity test still passing unchanged).

## Mobile

`tests/probe.py`'s mobile pass (390×844 touch, 844×390 landscape rotation) completed with 0 errors with every effect active. No effect is gated differently for mobile vs. desktop — the same small particle counts apply on both, which given the low absolute counts (§ above) was judged not to need separate mobile scaling. If a future pass finds mobile-specific frame-rate pressure, the first lever to pull would be lowering the `count` arguments at each call site (already centralized, one number per call) rather than restructuring the effect system.

## What was deliberately kept out, for performance reasons

- No continuously-emitting particle systems (ambient dust, idle sparkle) — every particle effect is a bounded one-shot burst.
- No per-frame `Graphics` redraws for the pulse ring or machine glow — both use native `Circle` game objects with tweened/computed scalar properties (`radius`, `alpha`), which Phaser renders cheaply without a redraw call each frame.
- No screen-space post-processing (bloom, blur) for any effect — plain sprite/particle compositing only, consistent with the project's existing `type: Phaser.CANVAS` renderer (not WebGL), which the game is already configured to use throughout.

## Known non-issue, disclosed for completeness

Tweens and particle emitters are not explicitly paused when the game itself is paused (`pauseRun()` pauses `physics.world` but not `this.tweens`/`this.time`) — this is **pre-existing behavior**, not introduced this phase (the Phase 1 bridge-reveal fade and the existing coin-bob tween already behave this way). A one-shot effect that happens to be mid-animation at the exact moment the player pauses will finish its ~400ms animation during the pause rather than freezing — a negligible, purely cosmetic edge case, not a performance or correctness issue, and consistent with existing precedent rather than a new gap this phase introduced.
