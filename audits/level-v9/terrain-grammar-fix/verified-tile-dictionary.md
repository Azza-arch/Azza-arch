# V9.6 Terrain-Grammar Fix — Verified Tile Dictionary

Every entry below was identified by rendering an indexed, zoomed contact
sheet of all 180 tiles in the real imported
`assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png` and reading
off real indices by eye — never guessed or assumed from memory or from
another Kenney pack's layout. See `terrain-roles-contact-sheet.png` for
the actual crops. Source file for every tile: the individually pre-cropped
`assets/kenney-pixel-platformer/Tiles/tile_NNNN.png` (same pixels as the
packed sheet, confirmed identical).

| Role | Key | File | Native size | Rendered size | Collision | Allowed neighbors | Example usage |
|---|---|---|---|---|---|---|---|
| Ground top-left | `kpp_grass_left` | `tile_0000.png` | 18×18 | 54×54 (3×) | Yes — top surface of `platform()`'s thin rectangle | right: top-mid; below: dirt-fill | left end of every A/B ground span and deck top row |
| Ground top-mid | `kpp_grass_mid` | `tile_0001.png` | 18×18 | 54×54 | same row as above | left/right: top-left/mid/right; below: dirt-fill | repeated across the middle of any top row |
| Ground top-mid-alt | `kpp_grass_mid2` | `tile_0002.png` | 18×18 | 54×54 | same | alternated with top-mid for texture variety, never adjacent to itself twice in the current code | same as top-mid |
| Ground top-right | `kpp_grass_right` | `tile_0003.png` | 18×18 | 54×54 | same | left: top-mid; below: dirt-fill | right end of every A/B ground span and deck top row |
| Dirt interior/fill | `kpp_dirt_mid` | `tile_0004.png` | 18×18 | 54×54 | No (purely visual, drawn under/behind the real collision rectangle) | seamless on all sides — tiles both horizontally and vertically with itself and `kpp_dirt_mid2` | every row beneath a grass-top row, down to the floor, in `kppLandMassFill()` |
| Dirt interior-alt | `kpp_dirt_mid2` | `tile_0005.png` | 18×18 | 54×54 | No | same as above | alternated with dirt-fill for texture variety |
| Isolated/bordered dirt | `kpp_dirt_isolated` | `tile_0006.png` | 18×18 | 54×54 | No | bordered on all 4 sides — only used where a mass's edge is genuinely exposed on every side (a small floating chunk), never adjacent to more fill | the crate-platform ledge's exposed underside (it is a true floating island, touching nothing else) |
| Ladder | `kpp_ladder` | `tile_0071.png` | 18×18 | 54×54 (height clipped per segment) | No (ladder climbing uses a separate zone, not this art) | repeats vertically; top/bottom not visually distinguished in this tile (the pack has no separate cap sprite — documented gap below) | both A/B ladders (x=610, x=750) |
| Crate | `kpp_crate` | `tile_0009.png` | 18×18 | 48×48 | Yes — the crate's own dynamic Arcade body (separate rectangle, "art never determines collision") | n/a (a standalone prop, not a tiled surface) | the pushable crate in the A/B puzzle |
| Coin | `kpp_coin` | `tile_0150.png` | 18×18 | registered, **not yet used** — see gap below | n/a | n/a | not wired into `spawnCollectibles()` this pass |

## Roles requested but genuinely absent from this pack — documented gaps, not guessed

- **Exposed left/right side (tall cliff face)**: no dedicated vertical-
  side-only tile was found distinct from the top-row corner tiles. Not
  needed this pass — every A/B mass in `kppLandMassFill()` is filled wall-
  to-wall with the interior tile under a full-width top row, so there is
  no case with an exposed vertical side wall this phase.
- **Bottom edge (non-isolated)**: no tile distinct from `kpp_dirt_isolated`
  (which is bordered on *all* sides, not bottom-only) was found. Not
  needed this pass — every A/B/C land mass (`town-walk-1/2`, `cafe-deck`,
  the ground spans) is filled continuously down to the real ground
  surface, so nothing in this pass has an exposed bottom that isn't
  simply "where it meets more ground."
- **Outside/inside corners** (for an L-shaped or notched mass): not
  present as separate sprites in this 180-tile set — Kenney's Pixel
  Platformer is a deliberately minimal set (confirmed by the official
  sample images, `SampleA.png`/`SampleB.png`, which show only straight
  terraced blocks, never notched corners). No A/B shape this phase needs
  one.
- **One-way platform (distinct thin-plank sprite)**: not present. A/B's
  decks ARE one-way-collision (`platform()` defaults `oneWay:true`) but
  are visually built as full land masses per the official sample's own
  convention for raised, ground-connected terraces — see
  `collision-vs-rendering-review.md` for the reasoning.
- **Bridge**: a dedicated bridge tile exists in this pack's background/
  prop region (not inventoried this pass — A/B has no bridge; the
  world's one bridge is the final-gate crossing in zone G, out of scope).
  A/B still uses the existing 64px `kenney_bridge` for the gate-open
  state, unchanged.
- **Pressure plate**: no dedicated flat-plate sprite exists in this pack.
  The existing code-driven approach (a stretched/tinted tile,
  `kpp_dirt_mid` squashed to 72×16 with a tint swap for pressed/
  unpressed) is kept — this is an honest limitation, not invented art.
- **Door / key**: not used this phase (A/B has neither — the goal door is
  in zone G, out of scope; no key mechanic exists yet, per the brief's own
  "no new mechanics" restriction).
- **Decorative background tile**: the pack's `Tiles/Backgrounds/` subset
  (24 tiles) was imported but not used this phase — A/B's background
  stays the existing flat sky-blue color from V9.4, per scope control
  (not asked for this phase, and changing it risks drifting beyond "focused
  terrain-construction correction").
