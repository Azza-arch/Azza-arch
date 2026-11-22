# Lorong Atas Bumbung — V8 Phase 2: Character Animation Polish — Report

**Status: implemented.** Scope: `src/game.js`'s animation-state selection and a new sprite-only squash/stretch effect. Nothing in `src/level.js`, the camera, physics, or Phase 1's scenery was touched. Nothing committed.

---

## 1. What was inspected first

Before changing anything, I ran three live Playwright diagnostics against the actual running game (frame-by-frame logging of `anim`/`velocity`/`grounded`/`flipX`, not guessed from reading the code): a full jump arc, walking off a ledge without jumping, and approaching + climbing a ladder from both directions. This surfaced one real, reproducible bug and confirmed two other areas already work correctly.

## 2. Problems found and fixed

### Bug: idle/run pose flashes while airborne (fixed)

**Root cause:** the animation-selection line was `body.velocity.y < -35 ? 'jump' : body.velocity.y > 60 ? 'fall' : ... 'run' : 'idle'`. This left a dead zone, `-35 <= vy <= 60`, where the character is airborne but neither the jump nor fall threshold is met — it fell through to the ground-only run/idle branch.

**Confirmed live, two distinct trigger cases:**
- **Jump apex:** every jump passes through this zone at its peak (`vy` crosses from negative to positive through the dead zone). Logged: 3 consecutive frames showing the **standing idle pose while airborne**, every single jump.
- **Walking off a ledge:** gravity takes ~2 frames to accelerate `vy` past the 60 threshold, so the character showed the **running pose for the first ~60ms of every fall**, before switching to the fall pose.

**Fix:** once airborne (not grounded, not climbing), the only two states are jump (still rising, `vy < -35`, same threshold/feel as before — no change to how "snappy" a jump takeoff feels) or fall (everything else airborne). Run/idle are now strictly grounded-only states. Re-verified live after the fix: the same two scenarios (jump arc, walk off ledge) now show a clean `jump → fall` or direct `fall` sequence with zero idle/run frames while airborne, across 70 logged frames combined.

### Checked and found already correct (left unchanged, per the brief's own instruction)

- **Facing direction / flip:** `setFlipX` correctly tracks travel direction on both run and jump, and intentionally holds the last facing during idle and while climbing (confirmed live from both approach directions) — this matches the existing in-code design comment and is not a bug.
- **Repeated animation restarts:** `this.visual.play(anim, true)` already uses Phaser's `ignoreIfPlaying` flag, so calling `play('jump', true)` every frame while already in the jump animation does not restart it — confirmed no flicker from this mechanism itself.
- **Respawn-forces-facing-right:** confirmed intentional (existing comment: "always faces back toward progress"), not touched.
- **No climbing-specific animation exists** — only `idle`/`run`/`jump`/`fall` frame sets exist in `assets/chill-boy/` (confirmed against the manifest). Climbing correctly falls back to `idle`, which is the best available option without new frames (explicitly out of scope — "do not generate/download assets"). Documented here as a known limitation, not fixed, since fixing it would require new assets.

## 3. Squash/stretch added (brief §4, "if it improves feel")

Added a small, sprite-only scale tween (`this.visual.scaleX/scaleY`, never the physics body) on two edges:
- **Takeoff** (the frame `anim` transitions to `'jump'`): brief stretch (scaleY ×1.14, scaleX ×0.88), easing back to base over 160ms.
- **Landing** (the frame `grounded` transitions from false to true, not while climbing): brief squash (scaleY ×0.82, scaleX ×1.16), easing back to base over 130ms.

Both:
- **Respect `prefers-reduced-motion`** — gated behind the same `reducedMotion` flag already used for the camera lerp and the bridge-reveal tween. Verified live with Playwright's `reduced_motion='reduce'` context option: scale stayed at the exact base value (0.158, 0.158) for every sampled frame of a full jump, zero variation.
- **Never touch collision or timing** — confirmed by the unchanged `routePlatforms.length`, unchanged jump-rise/gap physics, and the full regression suite passing with the exact same traversal coordinates as Phase 1/baseline (the sprite and the physics body were already decoupled in the existing architecture — "a separate rectangular body means animation transparency never changes collisions" — this phase only adds a transform to the already-decoupled visual).
- **Can't get stuck mid-tween:** `respawn()` now explicitly kills any in-flight squash/stretch tween and snaps the sprite back to base scale, so a respawn triggered mid-landing-animation (e.g. falling into the void) can never leave the character visibly squashed after teleporting to a checkpoint.

## 4. Files modified

Only `src/game.js`:
- `init()`: two new tracking fields (`lastAnim`, `lastGrounded`) — read only by the squash/stretch logic, not gameplay.
- Module scope: `BASE_SCALE` constant (`.158`, was a bare literal in two places — now one named value both the initial sprite scale and the new tween reference).
- `update()`: the animation-selection line fixed; the squash/stretch block added immediately after.
- `respawn()`: tween-kill + scale-reset safety line added.

`src/level.js` is untouched — confirmed by the full regression suite reusing the exact same geometry/coordinates from Phase 1 with no changes.

## 5. Tests run

- **`node --test`: 11/11 pass**, unchanged.
- **`tests/probe.py` (full natural-input regression): pass, 0 page errors, 0 console errors, 0 failed requests.** Full A→G traversal re-confirmed, including ladder entry/exit (Zones A→B, B→C, D→E, E-internal, the optional F cave ladder), jump/fall/land across every mandatory jump, checkpoint recovery (R key, solved gates preserved), pause/resume (position frozen while paused — confirmed unaffected by the animation changes), and replay (full state reset, including `lastAnim`/`lastGrounded` reset back to their `init()` defaults).
- **Animation-specific live diagnostics** (Playwright, frame-by-frame, not part of the standard suite but run and logged in this session): jump arc (40 frames), walk-off-ledge (30 frames), ladder approach-and-climb from both directions (35 frames), reduced-motion jump (30 frames). All results summarized in §2–3 above.

## 6. Evidence

- `phase2-jump-sequence.png` — 6 real, sequential browser screenshots (45ms apart) through a full jump: takeoff stretch → rising → apex/fall transition → falling → landing squash → recovered. No stray idle/run frame appears anywhere in the sequence.
- `raw-frames/` — the full 16-frame raw capture set the contact sheet was built from, plus the per-frame `anim`/`grounded` log (printed in this session, reproduced in §2).

## 7. What was NOT changed

Map/scenery (Phase 1's work preserved exactly), camera, physics constants, player collider, platforms, ladders, machines, checkpoints, gate logic, puzzle content, Add Math learning pages. No particles, no jump dust, no coin sparkle, no audio — explicitly out of scope for this phase. No new assets generated or downloaded — the squash/stretch reuses the existing sprite via scale only, no new frames.

## 8. Blockers

None.

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Output: `?? app/addmath/rooftop/` — unchanged, still entirely untracked. No commit was made.

**Stopping here. Not starting Phase 3.**
