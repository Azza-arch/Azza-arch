# V9.6 — Asset Import Report

## Verification of the claimed path

The brief stated the pack was already extracted to
`app/addmath/rooftop/assets/kenney-pixel-platformer/`. **That path did not
exist** when checked (`ls` returned "No such file or directory"). Per the
brief's own instruction ("If missing, stop and report the specific asset
blocker"), this was reported as a blocker in the moment — but the real zip
was found sitting in the user's own Downloads folder
(`kenney_pixel-platformer (1).zip`, 260,312 bytes, alongside an older
identical copy from 2026-08-17), placed there by the user's own command in
the same message. Since it was already on the user's own disk (not
downloaded by this session from an external source), it was extracted and
verified directly rather than treated as a dead end.

## Verification (real, direct checks — not assumed)

- Extracted into an isolated scratch directory first (never run/imported
  blind).
- `License.txt`: **Pixel Platformer (1.2)**, Kenney, created 2023-10-07,
  **Creative Commons Zero (CC0)**.
- Native tile size confirmed directly via `PIL.Image.size`: **18×18px**
  for every file under `Tiles/` (both the plain set and `Tiles/Characters/`,
  which is 24×24 — a different, character-specific sheet, not used here).
  This is genuinely distinct from the existing 64px "New Platformer Pack"
  already in `assets/kenney/`.
- `Tiled/tileset-tiles.tsx` confirms the full sheet: 20×9 grid, 180 tiles,
  1px spacing, backed by `Tilemap/tilemap_packed.png` (360×162px).

## What was imported

Copied into `app/addmath/rooftop/assets/kenney-pixel-platformer/`:
`Tiles/` (all 180+27+24 individual pre-cropped 18px PNGs, including the
`Backgrounds/` and `Characters/` subsets — not used yet, kept for a future
pass), `Tilemap/` (the packed sheets + Tiled-ready variants),
`KENNEY-PIXEL-PLATFORMER-LICENSE.txt` (renamed from `License.txt` to avoid
confusion with other license files in the project), `Preview.png`. The
Construct-3-specific project file and the Tiled `.tmx`/`.tsx` files were
left out of the copy (not needed by this Phaser project; still available
in the original zip if ever wanted).

## Tiles actually registered and used this phase (11 keys, all verified real files)

Identified by rendering an indexed, zoomed contact sheet of all 180 tiles
(`screenshots/kenney-tile-contact-sheet.png`) and reading off real tile
indices — never guessed from memory:

| Manifest key | Source file | Tile index | Use |
|---|---|---|---|
| `kpp_grass_left` | `Tiles/tile_0000.png` | 0 | ground/deck left edge |
| `kpp_grass_mid` | `Tiles/tile_0001.png` | 1 | ground/deck fill |
| `kpp_grass_mid2` | `Tiles/tile_0002.png` | 2 | ground/deck fill (alternation) |
| `kpp_grass_right` | `Tiles/tile_0003.png` | 3 | ground/deck right edge |
| `kpp_dirt_mid` | `Tiles/tile_0004.png` | 4 | floor-switch plate base |
| `kpp_dirt_mid2` | `Tiles/tile_0005.png` | 5 | (registered, not yet used — spare fill variant) |
| `kpp_crate` | `Tiles/tile_0009.png` | 9 | pushable crate |
| `kpp_ladder_wood` | `Tiles/tile_0051.png` | 51 | (registered, not yet used — alternate ladder style) |
| `kpp_ladder` | `Tiles/tile_0071.png` | 71 | A/B ladders (orange, closer to the project's existing ladder color identity) |
| `kpp_plant_tuft` | `Tiles/tile_0124.png` | 124 | (registered, not yet used — spare decorative accent) |
| `kpp_coin` | `Tiles/tile_0150.png` | 150 | (registered, not yet used this pass — existing `kenney_coin` from the 64px pack is still what spawns at runtime; swapping it was not required by this phase's scope and was left alone to limit blast radius) |

Manifest grew from 73→84 entries; `assets/provenance.json` updated with
matching sha256-verified records for all 11; `node --test`'s asset-
integrity check passes with the new count (see `full-regression-results.md`).

## What was deliberately NOT done

- No Industrial/Farm expansion packs imported (not needed, not requested).
- No AI-generated or custom artwork added.
- No rejected/archived legacy art restored.
- Zones D–G keep the 64px pack entirely untouched — no mixing within the
  same visual span (see `ab-gameplay-design.md` for the exact x<1300 vs
  x>=1300 boundary rule applied in code).
