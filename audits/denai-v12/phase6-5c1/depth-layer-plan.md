# Depth-layer plan

Goal: give the world a background without faking collidable depth, without touching physics/collision, and without new sprite frames.

## Layer model (depths below every gameplay layer — ground=9, decks=10, machines/signs=11, ladders=13)

| Layer | Depth | Asset | scrollFactor | Alpha | Role |
|---|---|---|---|---|---|
| Background | 0.5 | `kpp_bg_hill` (verified unused, see verified-asset-options.md) | ~0.3 x / 0.2 y (slow parallax) | ~0.45 | Distant hill silhouette band, fills the flat-color sky |
| Midground | 1.5 | `kpp_tree` (verified unused), tiled sparsely | ~0.55 x / 0.4 y | ~0.7 | A few silhouette trees behind the playable terrain, giving posts/decks something to visually sit in front of |
| None (ground-level props) | — | existing atlas frame 124 bushes, already in use | 1:1 (no parallax) | existing (full) | Already implemented — no change, just fill the gaps logged in coordinate-issues.md |

This three-tier structure (background / midground / ground props) is *described in a dead comment already in `game.js:261-278`* from a prior, now-removed implementation — the numbers above are new recommendations, not a resurrection of unknown old values, since the old code is gone and its specific placements can't be verified. Treat the comment as historical context only, not a source of truth.

## Placement principle: non-colliding, behind everything, never blocks a read

- All background/midground tiles are `this.add.image(...)` with no physics body — same pattern already used for `secretMarkers` and the cave-entrance blocks (so this isn't a new primitive, just a new *use* of an existing one).
- Depth 0.5 and 1.5 are both well below `AB_TERRAIN`'s rendering depth (9) and the lowest interactive element (10), so a background tile can never visually sit in front of a platform, sign, ladder, or collectible, and can never be mistaken for a collidable surface. The existing collision silhouette (what's actually solid) is entirely driven by `s.solids`/Arcade bodies in `environment.js`'s terrain loop and `platform()`/`deck()` calls — none of which this layer touches.
- Horizontal coverage: tile `kpp_bg_hill` across the full `WORLD.width` (8400px) at a fixed low y-band (e.g. y≈600–750, above the highest real platform at y=660 per the camera-bounds comment in game.js:159-169, but still inside camera framing at normal zoom) using the same tiling pattern the terrain loop already uses (`for(x=...;x<...;x+=tileWidth)`).
- Vertical placement must stay clear of the highest-reaching real geometry per zone: B's overlook (y=972), G's river/gate area (y=972), and F's step2 (y=864) are the tallest points; a background band around y=650-750 clears all of them with margin.

## What this explicitly does NOT do

- No new terrain, platforms, or collision — per spec §5/§7.
- No parallax values borrowed from a resurrected old system — recomputed fresh against the current `WORLD`/camera bounds, same caution the existing camera-bounds comment (`game.js:159-169`) already models for this exact codebase (it explicitly warns against reusing a removed version's numbers in the new world size).
- No vertical screen-filling background per zone — one continuous band across the whole level keeps a single coherent "sky," rather than giving each zone a different sky color/texture (not asked for, and would fight the "coherent" requirement in the brief's Objective).

## Sequencing dependency

This layer should land before the zone-specific "lack of memorable identity" work in zone-improvement-plan.md, since per-zone identity (P2) is additive polish on top of a consistent base depth treatment (P1), not a replacement for it.
