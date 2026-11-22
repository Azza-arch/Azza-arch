# Lorong Atas Bumbung — V6.3 Phase 1 Asset Usage

**Status: implemented.** All assets below are already-imported, provenance-tracked files from `assets/production/` and `assets/background-legacy/` (see `assets/provenance.json`) — no new asset pack, no download, no generation. Every key used here was already present in `assets/manifest.json` before this pass (confirmed: `preload()` loads every manifest key unconditionally, so nothing needed to be added there).

## Used

| Asset key | Path | Layer | Placement (world x, y) | Zone(s) |
|---|---|---|---|---|
| `bg_house_row` | `background-legacy/bg_house_row.png` | Background | Looped, x=-150…2306, y=640 | A, B (bleeds gently into C) |
| `bg_hills` | `background-legacy/bg_hills.png` | Background | Looped, x=4200…7372, y=660 | E, F, G (bleeds gently into D) |
| `bg_mosque` | `background-legacy/bg_mosque.png` | Background | x=850, y=700 (single instance) | A |
| `house_1_full` | `production/Houses/house_1_full.png` | Midground | x=60, y=1000, scale .9 | A |
| `house_2_full` | `production/Houses/house_2_full.png` | Midground | x=650, y=1000, scale .9 | A |
| `house_3_full` | `production/Houses/house_3_full.png` | Midground | x=2600, y=1000, scale .85 | C |
| `h3_roof_hut` | `production/HouseParts/h3_roof_hut.png` | Midground | x=1255/y900, x=1515/y960 (B); x=4555/y960, x=4805/y896, x=4885/y800, x=5205/y940 (E); x=3690/y880, scale 1.1 (D) | B, D, E |
| `h1_roof_porch` | `production/HouseParts/h1_roof_porch.png` | Midground | x=2700, y=824 | C |
| `h3_door_grille` | `production/HouseParts/h3_door_grille.png` | Midground | x=3730, y=1000, scale .9 | D |
| `h3_parapet` | `production/HouseParts/h3_parapet.png` | Midground | x=4500/4850/5150, y=985 (3 tiles) | E |
| `water_tank_stand` | `production/Props/water_tank_stand.png` | Prop | x=5100, y=940, scale .7 | E |
| `plant_pot_leafy` | `production/Props/plant_pot_leafy.png` | Prop | x=1420, y=1000 | B |
| `plant_pot_tall` | `production/Props/plant_pot_tall.png` | Prop | x=2650, y=1000 | C |
| `plant_hanging` | `production/Props/plant_hanging.png` | Prop | x=2740, y=824, scale .8 | C |
| `plant_bush` | `production/Props/plant_bush.png` | Prop | x=550 (A); x=6780, x=7050 (F) | A, F |
| `laundry_line` | — | — | **not used in Phase 1** | — |
| `flag_malaysia` | `production/Props/flag_malaysia.png` | Prop | x=250, y=1000, scale .8 | A |
| `lamp_wall` | `production/Props/lamp_wall.png` | Prop | x=1200, y=1000, scale .8 | B |

## Rejected (tried, then removed or never used)

| Asset key | Reason rejected |
|---|---|
| `h3_wall_lower` / `h3_wall_upper` | **Tried and reverted during this pass.** These are blank modular fill panels designed to sit behind a roof+window+door composition, not to stand alone. Used alone (initial Zone D attempt) they rendered as plain blank rectangles — confirmed directly via screenshot (`1920x1080__zone-D.png`, first capture, superseded). Replaced with `h3_roof_hut` + `h3_door_grille`, which read correctly without them. |
| `h3_window_casement` | Not used — no composition in this pass needed a standalone window detail; `h1_roof_porch` and `h3_roof_hut` already carry enough window/roof detail on their own for a small accent at gameplay scale. Available for a future pass if a building needs more articulation. |
| `laundry_line` | Not used — zone-composition plan allowed it as an optional Zone A/B "lived-in" accent, but Phase 1 kept Zone A/B's prop count deliberately minimal (one flag, one bush/pot, one lamp) per the brief's "do not fill every empty space" rule; adding it would have been decoration for its own sake rather than identity-establishing. |
| `answer_sign` | Not used — no gap exists that it fills beyond what the function-machine label/prompt already covers; explicitly out of scope per Phase 1's "no machine/checkpoint sprite replacement yet" restriction, since pairing it with the terminal would start to read as a terminal-adjacent sprite change. |
| `ground_left/center/right`, `ground_center_alt01` | Not used — Phase 1 is scenery-only; terrain texture swap is Phase 2 in `level-v6.3-implementation-plan.md` and was not authorized in this pass ("no terrain replacement" per the brief's restrictions). |
| `platform_wood_*`, `platform_post`, `walkway_railing` | Same reason — reserved for the (not-yet-authorized) foreground-terrain phase. |
| `function_machine_idle/active`, `checkpoint_post_idle/active` | Explicitly out of scope — "no machine/checkpoint sprite replacement yet" per the brief. `kenney_lever`/`kenney_lever_left` and `kenney_sign`/`kenney_flag_a` are unchanged. |
| `bg_cloud` | Not used — `kenney_bg_clouds` (unchanged, pre-existing) already covers the sky layer; adding a second cloud asset would be decoration without a distinct purpose. |
| `h3_wall_lower`/`h3_wall_upper` (second mention, B/E) | Also considered and rejected for Zone B/E's awning/roof backing, for the same blank-panel reason — `h3_roof_hut` was used there instead from the start, not retrofitted. |

## Not touched at all (explicitly preserved, per Phase 1 restrictions)

- All Kenney terrain/collision assets (`kenney_ground_*`, `kenney_deck_*`, `kenney_block_center`, `kenney_bridge`) — unchanged.
- `kenney_ladder_*` — unchanged.
- `kenney_lever`, `kenney_lever_left`, `kenney_sign`, `kenney_flag_{a,b}` — unchanged (Machine/checkpoint sprites deferred).
- `kenney_coin`, `kenney_hud_coin` — unchanged.
- `kenney_block_blue` (cave entrance markers) — unchanged, left exactly as-is.
- All `chill-boy/*` frames — unchanged.
