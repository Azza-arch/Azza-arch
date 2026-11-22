# V9.5 — Tile-Grid Spec

## Status: Pixel Platformer (18px) grid not applicable this phase

The pack this document was meant to spec (Kenney Pixel Platformer, native
18×18px tiles) was never actually obtained — see `asset-import-report.md`.
No 18px source files exist on disk, so no real tile-grid decision (2×/36px
vs 3×/54px, nearest-neighbor filtering, data-driven mapping table, verified
sprite filenames) can be made from real files without inventing data. That
work is deferred until the pack is actually present.

## What IS real and verified: the current (64px Kenney "New Platformer
Pack") grid, unchanged since V8.7

- Native tile size: 64×64px (confirmed via the pack's own
  `KENNEY-LICENSE.txt` and direct image-size checks in a prior phase).
- Rendering scale in `game.js`: visual tiles are drawn at **0.5 scale**
  (32px visual pitch) via the existing `deck()`/scenery helpers, decoupled
  from collision geometry (`DECKS`/`GATES`/etc. in `src/level.js` use their
  own independent x/y/width values; visual tiling just repeats across
  whatever span those declare — this is the established "art never
  determines collision" pattern, confirmed still in force this phase by
  the unchanged `node --test` geometry assertions).
- Filtering: Phaser's default (bilinear) remains in effect for these
  64px tiles; Chill Boy's own antialiased/smooth rendering is untouched.
  Nearest-neighbor filtering was a Pixel-Platformer-specific requirement
  (smaller native tiles stretched more) — moot until that pack exists.
- Terrain-mapping categories currently covered by real, verified
  `assets/kenney/` filenames: ground horizontal (left/middle/right), deck
  tops (left/center/right + overhangs), block fill (left/center/right +
  blue variant), ladder (top/middle/bottom), bridge, lever (+ left
  variant), sign, flag (a/b), door (closed + closed-top), coin (gold +
  HUD), background clouds. Categories with **no** verified sprite in any
  pack on disk: a dedicated crate/pressure-plate texture (currently reused
  from `kenney_block_center` with a tint, per V9.1/V9.4), water.

## Gap, honestly reported

No new tile-grid spec can be written for the Pixel Platformer family until
the pack is actually imported. This file will need a follow-up pass once
that happens.
