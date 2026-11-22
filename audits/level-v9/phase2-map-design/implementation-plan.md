# V9.2 — Implementation Plan (for future authorization — nothing here is built)

## Headline finding this phase must not let get lost

**The Kenney Pixel Platformer pack is not present in this repository.**
Nothing in this plan can begin until it is added to `assets/` (by the
user — this pass does not download anything). Every step below assumes
that has happened first.

## Phase order (proposed, mirrors this project's own established
"small batches, verify each one" discipline from V8/V8.5/V8.7)

### Step 0 — Pack verification (must happen before any rendering code)
- Confirm the real pack's native tile size (expected 18×18, per public
  documentation — verify against the actual files once present).
- Confirm whether it ships as a single packed tilemap or individual
  sprite files, and update `assets/manifest.json` accordingly (new keys
  only — no existing key renamed or removed, preserving every current
  reference per the brief's "do not delete unused assets" instruction).
- Re-run the asset-compatibility check in `kenney-asset-compatibility.md`
  against the real files; update that document rather than assuming this
  phase's speculative Industrial/Farm notes were correct.

### Step 1 — Ground & platform re-skin only (lowest risk)
- Swap the Kenney texture keys used by `deck()`'s surface tiling and the
  ground-rendering loop in `buildEnvironment()` to the new tile family, at
  the scale chosen in `tile-grid-and-scale-spec.md` (proposed 2×/36px,
  to be confirmed on a real screenshot first).
- **Zero coordinate changes** — every `DECKS`/`GROUND_RANGES` entry stays
  byte-for-byte identical; only the `this.add.image(...)` texture key and
  per-tile scale/step change.
- Verify: full `probe.py` regression (must still pass unmodified — if it
  doesn't, the re-skin introduced a visual/collision mismatch and must be
  fixed before proceeding, not worked around).

### Step 2 — Ladders, doors, switch, crate re-skin
- Same texture-key-only swap for `LADDERS` rendering, the goal's door art
  (`kenney_door_closed`/`_top`), the V9.1 crate (`kenney_block_center`
  tinted) and pressure plate (`kenney_block_blue` flattened) — replaced by
  the real pack's own crate/switch tiles if confirmed present and
  compatible.
- Verify: `tests/v9_phase1_crate.py` (V9.1's own suite) must still pass
  unmodified — the crate/switch *mechanism* code does not change, only
  texture keys.

### Step 3 — Background layering + per-zone visual clarity passes
- Zone C's "this branch is optional and different" cue (visual-only, see
  `geometry-change-proposals.csv` row 1).
- Zone E's roof-silhouette re-skin (visual-only, row 2) — explicitly NOT
  a return to Phase 8.5's architectural facades; a flatter, Pixel-
  Platformer-appropriate treatment consistent with V8.7's own rollback
  decision.
- Verify: full visual regression (before/after screenshots at the same
  camera positions this project has used in every prior visual phase).

### Step 4 — Industrial/Farm expansion evaluation (only if Step 0 confirms
them genuinely compatible)
- Zone D workshop accent, Zone G river tile (rows 4-5 in
  `geometry-change-proposals.csv`) — both explicitly contingent on pack
  availability and a real compatibility check, not assumed usable from
  this phase's speculative notes.

### Step 5 (optional, separately authorized) — Crate ledge reward
- Only if a future phase explicitly authorizes it: a small reward prop on
  the existing ledge, per `geometry-change-proposals.csv` row 3. No
  existing collectible/secret would be moved.

## What stays completely out of scope at every step

- `WORLD`, `MOTION`, `SPAWN`, `GOAL`, `GROUND_RANGES`, `DECKS` coordinates,
  `LADDERS`, `GATES`, `TERMINALS`, `CHECKPOINTS`, `COLLECTIBLES`,
  `SECRETS`, `PUZZLES`, `CRATE_PUZZLE` coordinates, the save schema,
  camera bounds/zoom logic, Chill Boy's sprite/animation/scale, and the
  crate/switch/platform *mechanism* code — none of these change at any
  step above. Every step is a rendering-layer (texture key / tile
  scale / background layering) change only.

## Regression discipline for every future step

Re-run, unmodified and expecting a clean pass at every step: `node --test`,
`tests/probe.py`, `tests/v8_phase6_persistence.py`,
`tests/v8_phase7_secrets.py`, `tests/v8_phase8_menu.py`,
`tests/v8_7_level_exit.py`, `tests/v9_phase1_crate.py`. A step that
breaks any of these must be fixed before the next step begins, exactly
the discipline already established across every prior visual phase in
this project (V8.5, V8.7, V9.1).

## This phase's own deliverables, for reference during future implementation

- `current-map-stability-review.md` — what's already fine (KEEP) vs. what
  needs visual work.
- `v7-reference-fidelity.md` — confirms topology/mechanics already match
  the approved reference; only visual composition deviates.
- `kenney-asset-compatibility.md` — the pack-missing finding and fallback
  assessment.
- `tile-grid-and-scale-spec.md` — the proposed rendering system.
- `proposed-full-tilemap.png` / `proposed-seven-zone-layouts.png` —
  schematic blueprints (not real art) of the complete route and each
  zone, from live coordinate data.
- `kenney-asset-contact-sheet.png` — every real local asset, by role, plus
  the missing-pack banner.
- `geometry-change-proposals.csv` — every proposed change, none
  implemented, with risk levels.

## STOP

Per the brief: implementation does not begin until this blueprint is
reviewed and a specific step above is explicitly authorized.
