# V9.2 — Tile Grid & Scale Specification (proposed, not implemented)

This spec assumes the Kenney Pixel Platformer base pack is added to
`assets/` before implementation (see `kenney-asset-compatibility.md` —
currently not present). All numbers below are a proposal to review, not
code that has been written.

## Native tile size

Pixel Platformer's published native tile size is **18×18px**. This spec
treats that as the authoritative source grid.

## Target render scale

**Proposed: 2× integer scale → 36×36px rendered tiles**, as the primary
recommendation.

| Option | Rendered size | Pros | Cons |
|---|---|---|---|
| 2× (36px) | 36×36 | Clean integer scale (no sub-pixel blur); matches the chunky-but-legible read Kenney's own showcases typically use at this zoom | Visually smaller per-tile than the current 64px assets — needs more tiles to cover the same span (acceptable, see "decoupled tiling" below) |
| 3× (54px) | 54×54 | Closer to the current 64px tile footprint, less visual size change | Slightly less common in Kenney's own reference screenshots; still an integer scale, a reasonable alternative |
| 4× (72px) | 72×72 | Largest, most readable at a glance | Noticeably bigger than the current look; more tiles would overlap/need fewer repeats per span, changing the terrain's visual rhythm more than necessary |

**Recommendation: start with 2× (36px) and validate on a real screenshot
at the game's existing responsive camera zoom (1.0 on desktop, 1.3 on
short-wide/mobile — see V8.7's `applyResponsiveZoom()`) before
finalizing** — do not commit to a scale number without seeing it rendered
at both zoom levels, consistent with this project's established
"verify, don't assume" practice.

## Why NOT stretch to match the existing 64px grid exactly

64 ÷ 18 = 3.555..., not an integer. Stretching each 18px tile to exactly
64px would distort every pixel (the brief explicitly forbids this: "do
not stretch individual pixel tiles arbitrarily"). The correct approach,
and the one this project ALREADY uses elsewhere, is to **decouple visual
tile pitch from collision pitch**:

- `deck()`'s existing surface art already tiles a 64px-native Kenney
  texture at 0.5 scale (32px visual tiles) across an arbitrary-width
  collision span — the visual tile count has never needed to divide
  evenly into the collision width.
- The same pattern applies directly to Pixel Platformer tiles: lay 36px
  (or 54px) tiles edge-to-edge across each deck's existing collision span
  (from `DECKS`, unchanged), with a partial tile clipped at the span's
  own edge if the width isn't an exact multiple — visually unnoticeable
  at normal gameplay zoom, and exactly how most Kenney-tile platformers
  (including Kenney's own tilemap demos) handle non-grid-aligned level
  geometry.

## Edge and corner rules

- Ground/platform runs: left-cap tile, repeating middle tile(s), right-cap
  tile — the same 3-piece pattern `deck()` and the ground-rendering loop
  already use for the current Kenney set, just swapped to the new tile
  family's own left/middle/right variants.
- Corners (where a platform's top meets a side, e.g. the step-down decks
  in Zone F): use the pack's own corner tile variant if one exists in the
  real pack (Pixel Platformer ships corner tiles in its base set per its
  public documentation) rather than overlapping a flat edge tile at an
  angle.

## Ground fill rules

- Below the visible top edge, fill with the pack's own "dirt/fill" tile
  repeated vertically — mirrors the current `supportPiers()`/ground
  rendering's own repeat-until-floor pattern (V8.7), just swapping the
  tile key.
- Keep `supportPiers()`'s V8.7 principle: fill is a plain, uniform
  repeat, never a second "architecture" system (no walls/windows/roofs
  reintroduced — V8.7's own explicit rollback stays in force).

## Platforms and bridges

- One-way deck platforms: same 3-piece left/middle/right tiling, Pixel
  Platformer's own platform tile family (thinner, flatter silhouette than
  the current 64px stone blocks — appropriate, since one-way platforms
  should read as visually distinct from solid ground, a rule this project
  already follows).
- Gate bridges (`gateArt()`): Pixel Platformer's own bridge/plank tile if
  present in the real pack; otherwise keep the current approach unchanged
  until a suitable tile is confirmed present.

## Background layering

Keep the existing 3-layer discipline established since Phase 1/V6.3 and
reaffirmed in V8.7 and V9.1:
- Distant background: low-contrast, parallax `scrollFactor` (~0.85),
  Pixel Platformer's own background/sky tile if the pack includes one;
  otherwise keep the current `bg_hills`/`bg_house_row` as a placeholder
  (already low-contrast, already not visually offensive).
- Foreground/gameplay layer: zero parallax (`scrollFactor` default 1,1),
  exactly as the existing `supportPiers()`/`rockMass()`/`riverBand()`
  helpers already enforce — this spec changes NOTHING about that
  discipline, only the tile art drawn within it.

## Sprite filtering

Pixel Platformer art is flat-shaded pixel art; Phaser's current render
config already sets `antialias:true` globally (`game.js`'s `new
Phaser.Game({...render:{antialias:true,...}})`). For crisp, non-blurred
pixel art at integer scale, the recommendation is to add a **per-texture**
override (`texture.setFilter(Phaser.Textures.FilterMode.NEAREST)` on the
newly-added Pixel Platformer textures specifically) rather than a global
antialias change — Chill Boy's own illustrated sprite (not pixel art)
should keep its existing antialiased/smooth rendering untouched. This is
a proposal only; no render config has been changed this phase.

## Camera behavior

No change proposed. V8.7's `applyResponsiveZoom()` (zoom 1.0 desktop /
1.3 short-wide & mobile) stays exactly as implemented — the tile re-skin
is independent of camera zoom logic, and the rendered tile scale (2×/3×)
should be validated AT both existing zoom levels, not used as a reason to
change the zoom system itself.

## Chill Boy scale compatibility

Chill Boy's native sprite is 659×626px, displayed at `BASE_SCALE=.158` →
~104×99px on screen (reverified directly from `src/game.js` this phase).
At a 36px tile grid, Chill Boy would stand roughly **2.75 tiles tall** —
a normal, readable platformer-character-to-tile ratio (comparable to
Kenney's own example character sprites, which are typically sized
2.5-3 tiles tall against their own Pixel Platformer tile grid). At 54px
tiles, roughly 1.85 tiles tall — also reasonable, slightly more
"oversized hero" in feel. **No change to Chill Boy's own sprite, scale,
or animation is proposed or required** — this is a compatibility check
confirming the existing character reads fine against either candidate
tile scale, not a call to resize anything.
