# V9.2 — Kenney Pixel Platformer Asset Compatibility

## Primary finding (checked first, before anything else in this phase)

**The Kenney Pixel Platformer pack — base, Industrial Expansion, or Farm
Expansion — is NOT present anywhere in this repository.**

Verified directly:

```
$ find assets -iname "*pixel*"          # no results
$ find . -iname "*pixel*"               # no results anywhere in the project
$ cat assets/kenney/KENNEY-LICENSE.txt
    New Platformer Pack (1.1)
    Created/distributed by Kenney (www.kenney.nl)
```

The `assets/kenney/` directory already in this project is a **different**
Kenney release — **"New Platformer Pack"** — not Pixel Platformer. Its
tiles are 64×64px natively (confirmed: `terrain_stone_*`, `block_blue`,
`lever*`, `ladder_*`, `door_closed*`, `bridge*`, `coin_gold`, `flag_*`,
`sign` — every file checked is 64×64). Pixel Platformer's native tile
size is 18×18px, an entirely different grid. **No file in this repo was
downloaded, renamed, or claimed to be part of Pixel Platformer** — this
finding is reported honestly per the brief's own explicit instruction.

## What this means for this phase's deliverables

- `kenney-asset-contact-sheet.png` shows only what is **actually present**
  locally (New Platformer Pack tiles + the existing `production/` set),
  each labeled with its real filename — never an invented Pixel
  Platformer filename.
- The tile-grid spec (`tile-grid-and-scale-spec.md`) describes the
  PROPOSED system assuming Pixel Platformer's well-documented 18×18px
  native format (a widely published fact about the pack, not something
  requiring the files themselves to state), but cannot reference specific
  sprite filenames from that pack, because none exist in this project to
  verify against.
- The zone blueprints (`proposed-full-tilemap.png`,
  `proposed-seven-zone-layouts.png`) are **schematic** — colored
  rectangles standing in for tile *roles* (ground/platform/ladder/
  machine/gate), explicitly captioned as such, never claiming to be real
  Pixel Platformer artwork.

## Compatibility assessment of the CURRENT local asset family (as a fallback reference point)

| Role | Current asset | Native size | Usable as Pixel-Platformer-style fallback? |
|---|---|---|---|
| Ground/platform surface | `kenney/terrain_stone_*` | 64×64 | Visually "chunky cartoon platformer", not pixel-art — not a drop-in substitute for Pixel Platformer's flatter, smaller-grid look. Would need to be fully replaced, not reused, once the real pack is added. |
| Ladder | `kenney/ladder_*` | 64×64 | Same — different art style, would be replaced. |
| Door | `kenney/door_closed*` | 64×64 | Same. |
| Lever/switch | `kenney/lever*` | 64×64 | Currently reused (flattened) as the V9.1 pressure plate — would be replaced by a real Pixel Platformer switch/plate tile once available. |
| Crate | `kenney/terrain_stone_block_center` (tinted) | 64×64 | Currently a tinted terrain block standing in for a crate — Pixel Platformer's own crate/box tile would replace this directly. |
| Machine/checkpoint | `production/Puzzle/function_machine_*`, `checkpoint_post_*` | varies | **Out of scope for replacement** — these are the game's own bespoke math-puzzle sprites (Phase 8.5), not generic terrain; the brief's restriction list does not ask for these to change, and they should stay regardless of the terrain re-skin. |
| Background | `kenney/backgrounds/background_clouds`, `background-legacy/bg_hills` | varies | Different families already (New Platformer Pack cloud + a separate legacy hill asset) — both would be candidates for replacement by Pixel Platformer's own background tiles if/when added, but are visually inoffensive as-is (low contrast, already not the subject of this complaint). |

## Industrial / Farm expansion compatibility

Cannot be assessed — neither expansion pack is present, and the brief
explicitly forbids downloading them this phase. Based on Kenney's own
public pack descriptions (general knowledge, not verified against local
files): the Industrial Expansion extends the same 18×18 base grid with
pipes/machinery/conveyor-style tiles (a plausible fit for Zone D's
workshop and Zone G's mechanism, *if* visually compatible once actually
inspected locally), and the Farm Expansion extends it with crates,
fences, and foliage (a plausible fit for Zone A/F's natural/rustic
elements). **Both are speculative until the files are actually present
and inspected** — not claimed as confirmed compatible.

## Recommendation

1. The real Kenney Pixel Platformer base pack should be added to
   `assets/` (by the user/a future authorized step — not downloaded by
   this pass) before any re-skin implementation begins.
2. Once present, re-run this same compatibility check against the real
   files (dimensions, included tile variants, whether a packed
   `tilemap_packed.png` or individual sprite files are provided) before
   writing any rendering code — the same "verify, don't assume" discipline
   already used throughout this project's asset history.
3. Do **not** attempt a partial re-skin using the current New Platformer
   Pack as a Pixel-Platformer substitute — the visual styles are
   different enough (64px chunky-cartoon vs. 18px flat-pixel) that mixing
   them would recreate exactly the "inconsistent" look the user is trying
   to move away from.
