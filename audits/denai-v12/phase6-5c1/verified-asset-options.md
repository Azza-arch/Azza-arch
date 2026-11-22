# Verified asset options (zero downloads — everything here is already on disk and already registered)

Source: `assets/manifest.json` cross-referenced against `src/v12/game.js` preload/create (registers every `kpp_`-prefixed key from the registry's `assets` map) and a full grep of `src/v12` for each key's actual usage.

## Headline finding: a purpose-built background tile is loaded and 100% unused

`kpp_bg_hill` → `assets/kenney-pixel-platformer/Tiles/Backgrounds/tile_0015.png` — this is the *only* asset in the entire manifest that lives in a `Tiles/Backgrounds/` subfolder, i.e. it is the pack's own dedicated background art. It is registered (loaded into the texture cache every session) but has **zero** references anywhere in `src/v12/*.js`. This is the single most direct, lowest-risk fix available for the "sky regions too empty" complaint — the asset already exists, is already fetched, and was evidently intended for exactly this role by whoever assembled the original asset manifest.

## Other currently-unused, already-loaded `kpp_` keys

| Key | Source tile | Used anywhere? | Notes |
|---|---|---|---|
| `kpp_bg_hill` | `Tiles/Backgrounds/tile_0015.png` | **No** | See above — primary depth-layer candidate |
| `kpp_tree` | `Tiles/tile_0126.png` | **No** | Single-tile tree silhouette, lighter-weight than the existing 9-tile `sceneryTree()` (3 trunk + 6 canopy pieces); good for background/midground placement where a full foreground tree would be too heavy/collide-adjacent |
| `kpp_gate_barricade` | `Tiles/tile_0105.png` | **No** | Could mark an optional-route entrance (C, F-cave) without new art — currently those routes have no distinct "this is optional" visual cue beyond the ladder itself |
| `kpp_ladder_wood` | `Tiles/tile_0051.png` | **No** | Alternate ladder skin — not needed; current ladders (frame 71, `kpp_ladder`) are consistent and fine, listed only for completeness |
| `kpp_dirt_isolated` | `Tiles/tile_0006.png` | **No** | Small decorative dirt-patch tile; minor ground-texture variation option for the flat stretches logged in coordinate-issues.md |
| `kpp_plant_tuft` | `Tiles/tile_0124.png` | No (redundant) | Identical source pixels to atlas frame 124, which *is* already used extensively (A/B/E bush accents). This individual-image key is a duplicate load of art already in use via the atlas — not a new visual option |
| `kpp_bridge_left/mid/right` | `Tiles/tile_0048/49/50.png` | No (redundant) | Identical source pixels to the atlas frames 48/49/50, which `deck()` already uses for every gate/platform deck in the game (lift, number-span, water-crossing, river-crossing). Already in active use via the atlas path |
| `kpp_ladder` | `Tiles/tile_0071.png` | No (redundant) | Same art as atlas frame 71, used for every `LADDERS` entry already |

## Already-in-active-use assets (for reference — these are the established visual language, reuse rather than introduce variants)

- `kpp_terrain_atlas` (the 18px tilemap spritesheet) — ground, decks, signs, lever, river water, door/flag; nearly everything in `environment.js` draws from this one sheet via frame index.
- `kpp_trunk` / `kpp_canopy_{17,18,19,37,38,39,57,58,59}` — the one multi-tile tree landmark (`sceneryTree()`, used once, at Zone A x=120).
- `kpp_coin` — all 9 collectibles.
- `kpp_crate` — the Zone A crate puzzle.

## Recommendation for Phase 6.5C2 scope

Any depth/composition work should draw from `kpp_bg_hill` + `kpp_tree` first (true background-layer candidates, zero asset risk, zero download) before reaching for repeated atlas-frame decoration (bushes/tile-124), which is already slightly over-relied-on per visual-audit.md's cross-zone pattern #2. `kpp_gate_barricade` and `kpp_dirt_isolated` are optional P2 polish, not required for the core sky/depth fix.
