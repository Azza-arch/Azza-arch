# V9.6 Terrain-Grammar Fix — Tile Adjacency Rules

## The rule, as implemented in `src/game.js`

A deterministic, documented algorithm (not an improvised per-call choice)
governs every x<1300 (A/B/C) solid surface:

```
top row (y = surfaceY):      left-edge tile at x=0, right-edge tile at
                              the last column, every other column
                              alternates two visually-distinct "mid" tiles
                              (kpp_grass_mid / kpp_grass_mid2) so the
                              fill never looks like one sprite copy-pasted
                              in a visibly repeating pattern

fill rows (surfaceY+54 ...   every column, every row, alternates
  floorY, step 54):           kpp_dirt_mid / kpp_dirt_mid2 using
                              (column_index + row_index) % 2, so neighbor
                              tiles both horizontally AND vertically never
                              show the same variant twice in a row —
                              this is the actual checkerboard rule that
                              avoids "simply repeating top-middle sprites"
```

This single rule (`deck()`'s top-row loop + the new `kppLandMassFill()`
helper) is applied identically to:
- every ground span (`GROUND_RANGES`, for `left<1300`)
- every solid land-mass deck (`town-walk-1`, `town-walk-2`, `cafe-deck`)
- the crate-platform ledge (top row + one isolated-bordered fill row)

## Example cases (see `terrain-roles-contact-sheet.png` for the source
## tiles; the actual rendered result for every case below is visible
## directly in `zone-a-before-after.png` / `zone-b-before-after.png`)

| Case | How it's built |
|---|---|
| **Flat ground** | top row (left/mid/mid-alt/.../right) + fill rows down 160px past the surface (visible-world depth, matches "continue the fill... to the visible world" rule) |
| **Raised terrain (a deck)** | top row at the deck's own y, then `kppLandMassFill()` fills every row from `y+54` down to the real ground (1100) — a genuinely continuous, connected mass, not a floating strip on pillars |
| **Exposed side** | not present this phase (every A/B mass is filled wall-to-wall under a full top row — see the documented gap in `verified-tile-dictionary.md` for why no dedicated side tile was needed or used) |
| **Inner/outer corner** | not present in this 180-tile pack (documented gap) — no A/B shape needs one; every mass is a plain rectangle |
| **One-way platform** | A/B's decks keep `oneWay:true` collision (untouched) while being drawn as full land masses visually — see `collision-vs-rendering-review.md` for why this is the correct call for THESE specific decks, not a contradiction of the rule |
| **Gap** | `FIRST_GAP` (x420-540) has **no** tiles drawn across it at all — the ground loop simply skips from one `GROUND_RANGES` span to the next, leaving a genuine visual hole that matches the real collision hole. Confirmed by inspection: no tile touches x421-539 at ground level in either screenshot |
| **Bridge** | unchanged this phase — A/B has none; the existing `kenney_bridge` (64px pack) still renders the final-gate's open state in zone G only |
| **Floating bonus platform** | the crate-platform ledge: a top row + exactly one fill row using the fully-bordered isolated tile, NOT a continuous fill to any floor (since it touches nothing) — reads as a small chunk, not a fake connected land mass. Alpha stays 0.3 until the switch activates (unchanged behavior) |

## Non-54px-multiple widths

Every A/B element this phase happens to have a width that is close to but
not an exact multiple of 54 (`town-walk-1` width=320 → 5.93 tiles;
`town-walk-2` width=260 → 4.81 tiles; `cafe-deck` width=380 → 7.04 tiles;
ground span `[540,1300]` width=760 → 14.07 tiles). The loop's own
right-edge condition (`x + 54 >= data.width`) handles this by letting the
**last** tile's left edge sit at the true rightmost position that still
fits a full 54px step, so the final right-edge tile slightly overlaps the
second-to-last tile rather than leaving a sub-tile gap or stretching a
tile to a non-integer size — the same clipping-by-overlap convention the
project's existing 64px rendering already used for its own non-exact
widths, now applied consistently to the new tile family. No tile is ever
stretched to a non-18:1-ratio size; every tile keeps its fixed 54×54
display size, confirmed by `setDisplaySize(54,54)` on every placement
call in the edited code.
