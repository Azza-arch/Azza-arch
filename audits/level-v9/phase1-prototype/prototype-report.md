# V9 Phase 1 — Gameplay Variety Prototype: Pushable Crate + Floor Switch

## Objective

Validate ONE new interaction loop — push → switch → mechanism — as a
small, reversible, optional addition to Zone A, without touching any
existing system (machines, gates, checkpoints, secrets, save, menu).
V9.0–V9.2 only: no keys, lifts, moving platforms, or collapsing platforms
yet.

## What was built

### `src/level.js` — `CRATE_PUZZLE` (new export)

A single data block, deliberately kept **separate from `DECKS`/`GATES`**
(same "separate scenery composition from collision data" discipline
established in V8.7), so this whole feature can be reverted by deleting
one export and its two call sites in `game.js`:

```js
export const CRATE_PUZZLE = {
  crate: { id: 'crate-1', x: 260, feet: 1100 },
  floorSwitch: { id: 'switch-1', x: 350, feet: 1100, radius: 40 },
  platform: { id: 'crate-platform-1', x: 250, y: 1025, width: 130 },
};
```

**Placement, verified before choosing numbers, not assumed:**
- Read `GROUND_RANGES` directly — `[0, FIRST_GAP.x]` = `[0, 420]` is a
  genuine continuous ground segment, confirmed before placing anything
  on it.
- All three elements sit at x:220–390 (crate's reachable range), well
  clear of `FIRST_GAP` (420–540) and the A→B ladder (610) — confirmed
  against the live `LADDERS`/`FIRST_GAP` tables, not old coordinates.
- The platform's rise (1100→1025 = 75px) was checked against the
  project's own documented jump-rise ceiling (~96.6px, derived from
  `MOTION.jump`/`WORLD.gravity` and already used to validate every other
  jump in this level) — confirmed reachable by an ordinary jump, with
  margin, via a direct physics test (see `test-results.md`).

### `src/game.js`

- **`buildCratePuzzle()`**: creates the crate (a real dynamic Arcade body
  + a separate visual sprite — the same "art never determines collision"
  split the player itself uses), the floor switch (reuses `kenney_lever`/
  `kenney_lever_left`, freed up since Phase 8.5 moved machines to their
  own production sprite — no new asset), and the platform's art (drawn
  immediately at low alpha, body added only once active).
- **A player↔crate collider** (`this.physics.add.collider(this.player,
  this.crate)`) — this is what makes pushing *reliable regardless of
  approach speed*: Arcade resolves the overlap every physics step, so the
  crate can never be walked through, only pushed. (This was missing in
  the first implementation pass — see "Bugs found and fixed" below.)
- **Contact-based push** (in `update()`): when the crate is grounded and
  the player is pressed against it (`body.touching.right`/`left`, set
  automatically by the collider above) while holding the key pointing
  into it, the crate gets a direct, capped horizontal velocity. Works
  identically from both sides — verified directly (see
  `test-results.md`).
- **Switch activation**: requires the crate to be **both** grounded *and*
  within the switch's x-radius — a flat pressure-plate design, not a
  raised pedestal, specifically so "resting on top" and "touching from
  the side" can never be ambiguous. Verified: a crate placed just outside
  the radius while grounded does **not** activate it.
- **Platform**: a one-way platform (`this.platform()`, the exact same
  function every deck in this game already uses) whose *collision body*
  is created/destroyed live as the switch activates/deactivates — a real,
  reversible mechanism, not a decorative animation. Verified: the player
  can stand on it once active, and it loses its body (player would fall
  through) the instant the crate is pulled back off the switch.
- **Automatic recovery**: if the crate falls below y:1160 (the exact
  threshold the player's own fall-recovery already uses — confirmed as
  the correct value for *this* crate's placement, since it sits on the
  same ground tier the player's threshold already targets, not assumed
  from a different tier), it's silently reset to its start position with
  a small dust cue.
- **Explicit "Reset Kotak"** (`C` key): resets ONLY the crate's position/
  velocity and the switch/platform state. Verified: does not touch solved
  gates, checkpoint index, or any other system.
- **Feedback, entirely reused, no new systems**: `pulseRing`/
  `sparkleBurst`-family effects, `SFX.machine`/`SFX.bridge`/`SFX.ui` for
  activation/reset, lever texture swap for idle/active — all pre-existing
  Phase 3/4 systems, respecting `prefers-reduced-motion` the same way
  every other effect in this file already does.

### Visual labels

Two small world-space text labels ("Tolak kotak ke suis →", "C · Reset
kotak") mark the puzzle — the same static-label pattern already used for
"Gua (pilihan)" and the gate signs, not a new UI system.

## Bugs found and fixed during implementation (disclosed, not hidden)

1. **Missing player↔crate collider.** The first pass added a crate body
   and a crate↔ground collider, but no collider between the player and
   the crate — the two dynamic bodies simply passed through each other.
   Caught immediately by a real-browser test (the crate barely moved
   after 2.5s of holding a movement key, and the player walked straight
   through the puzzle zone into the real gap and respawned). Fixed by
   adding the missing collider.
2. **Test-methodology artifact, not a game bug**: an early verification
   of "can the player stand on the activated platform" teleported the
   player via `body.reset()` immediately before pressing jump, which
   doesn't reliably prime the grounded-jump timers (`groundedAt`) real
   play always has. Letting the player settle naturally on the ground for
   one frame before jumping (matching how input always arrives after a
   real player is already grounded) confirmed the platform's collision
   works correctly.

## Not touched

`DECKS`, `GATES`, `GROUND_RANGES`, `TERMINALS`, `CHECKPOINTS`,
`COLLECTIBLES`, `SECRETS`, `PUZZLES`, player physics constants, the save
schema, the menu system, Phase 2–8 code — confirmed unchanged by the full
regression suite (see `test-results.md`).

## Not committed / not deployed

No commit or deploy was made. `app/addmath/rooftop/` remains entirely
untracked.
