# Lorong Atas Bumbung — V6.3 Asset Inventory & Capability Audit

**Status: evidence only.** Every entry below is read directly from `assets/manifest.json` and `assets/provenance.json` (dimensions, paths, source zip) — no filename or dimension is assumed. `status: "temporary"` in `provenance.json` marks every Kenney-sourced asset explicitly as a placeholder choice made by a prior pass, not a final art decision.

**Major finding: a second, currently-unused asset family exists.** Beyond the Kenney New Platformer Pack (already wired into `game.js`), the repo also contains an approved, already-imported **`assets/production/` set** (Ground, Houses, HouseParts, Props, Puzzle, Traversal) and an **`assets/background-legacy/` set** (hills, cloud, house row, palm, mosque) — both fully present in `manifest.json` with provenance/sha256 tracking identical in rigor to the Kenney entries, but **grepping `src/game.js` for every key in both sets returns zero matches except the chill-boy sprite**. These are not new imports (they are already in the repository, already in the asset manifest, already loaded by `preload()`) — they are simply unwired. This is the single largest available lever for this pass's zone-identity problems (§5–8 of the visual audit) and is treated as such throughout the rest of this document.

---

## A. Kenney New Platformer Pack (`assets/kenney/`) — currently wired into `game.js`

| Category | Key(s) | Path | Dimensions | Usage today | Needs collision | Tiles seamlessly | Zones | Limitations |
|---|---|---|---|---|---|---|---|---|
| Terrain (ground) | `kenney_ground_left/center/right` | `kenney/tiles/terrain_stone_horizontal_{left,middle,right}.png` | 64×64 each | Street ground surface, all `GROUND_RANGES` | Yes (via `platform()`) | Yes, center tile repeats | All (street) | Fixed stone texture — cannot read as asphalt/dirt/grass without recoloring (moot under `filter:grayscale(1)`) |
| Platform tops | `kenney_deck_left/center/right` | `kenney/tiles/terrain_stone_block_top{,_left,_right}.png` | 64×64 each | Every elevated `DECKS` entry (awnings, café roof, all 4 Zone E decks, hill plateau, cave alcove) | Yes | Yes | All (elevated) | Same stone-block tile used for a shop awning and a hillside plateau — zero shape differentiation (root cause of audit #3) |
| Deck underside lip | `kenney_deck_overhang_left/right` | `kenney/tiles/terrain_stone_horizontal_overhang_{left,right}.png` | 64×64 each | **Not currently used anywhere** | No (decorative) | Ends only, not a repeat tile | Any deck underside | Unused — could visually finish a deck's underside instead of the current flat vertical pillar stack |
| Filler block | `kenney_block_center/left/right` | `kenney/tiles/terrain_stone_block_{center,left,right}.png` | 64×64 each | Vertical "support pillar" under every deck (`deck()`'s `supports` branch) | No (decorative, purely visual stacking) | Yes (center) | All (elevated) | This is the asset directly responsible for audit #2/#4 ("arbitrary tile pillars") — using it as a load-bearing-looking pillar under every deck is a style choice, not a constraint |
| Collectible | `kenney_coin` / `kenney_hud_coin` | `kenney/tiles/coin_gold.png` / `hud_coin.png` | 64×64 each | All 9 `COLLECTIBLES` / HUD coin counter | No | n/a | All | Fine as-is, out of scope for this pass |
| Ladders | `kenney_ladder_top/middle/bottom` | `kenney/tiles/ladder_{top,middle,bottom}.png` | 64×64 each | All 6 `LADDERS` | No (climb zone is a separate invisible `add.zone`) | Yes (middle) | All | Reads clearly as a ladder already (confirmed visually) — the problem is what it's attached to, not the ladder art itself |
| Bridge | `kenney_bridge` | `kenney/tiles/bridge.png` | 64×64 | All 3 solved-gate bridges | Yes | Yes | D, E, G (at each gate) | Already visually distinct (log-plank texture vs. stone ground) — working as intended, no change needed |
| Machine states | `kenney_lever` / `kenney_lever_left` | `kenney/tiles/lever{,_left}.png` | 64×64 each | All 3 `TERMINALS` (idle/solved) | No | n/a | D, E, G | Reads as "a lever," not specifically as "a function machine" — functional but generic |
| Checkpoint | `kenney_sign` / reuses `kenney_flag_a` | `kenney/tiles/sign.png` | 64×64 | All 3 `CHECKPOINTS` (idle/active) | No | n/a | C, E/F boundary, F | Plain sign post — works, unthemed |
| Goal flag | `kenney_flag_a/b` | `kenney/tiles/flag_green_{a,b}.png` | 64×64 each | `GOAL` | No | n/a | G | Fine as-is |
| Cave marker | `kenney_block_blue` | `kenney/tiles/block_blue.png` | 64×64 | Zone F cave entrance (2 instances, alpha .85) | No | No (single flat color block) | F | Only non-terrain decorative use of any Kenney asset in the whole game today — proves the pattern already works, just needs to be extended |
| Doors | `kenney_door_closed` / `kenney_door_closed_top` | `kenney/tiles/door_closed{,_top}.png` | 64×64 each | **Not currently used anywhere** | No | n/a | Any building facade | Available but unused — a plausible small detail for the café/workshop facades if a building silhouette is built from Kenney blocks |
| Background | `kenney_bg_clouds` | `kenney/backgrounds/background_clouds.png` | 256×256 | Single sky layer, all zones | No | Yes (tiled) | All | Only existing background element in the game — thin, low-coverage |

## B. `assets/production/` — imported, provenance-tracked, **currently unused**

### Ground

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `ground_left/center/right` | `production/Ground/ground_{left,center,right}.png` | 64×64 each | Direct drop-in replacement for `kenney_ground_*` if a softer, flatter street silhouette is wanted (sampled: a simple rounded two-tone block, visually simpler than Kenney's textured stone) | Yes if adopted | Yes (center) | All (street) | Visually simpler than Kenney's ground tile — a style decision, not a technical blocker |
| `ground_center_alt01` | `production/Ground/ground_center_alt01.png` | 64×64 | Variation tile to break up long flat street repetition (e.g. Zone D's approach, Zone E's recovery street) without new geometry | Yes if adopted | Yes | All (street) | Only one alt variant exists — enough for occasional variation, not a full texture set |

### Houses (full prebuilt building sprites)

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `house_1_full` | `production/Houses/house_1_full.png` | 448×381 | Residential silhouette, Zone A background/midground | No (background only) | No (single composed sprite) | A | **Style risk** — hand-drawn outline/hatching illustration (visible roof-tile hatching, shutter linework), not the flat-geometric Kenney style. Sampled directly: see §C below for the style-cohesion finding |
| `house_2_full` | `production/Houses/house_2_full.png` | 448×371 | Residential/town-row silhouette, Zones A–B | No | No | A, B | Same style risk as `house_1_full` |
| `house_3_full` | `production/Houses/house_3_full.png` | 468×519 | Two-storey building, could anchor Zone B's "shopfronts behind the upper route" or Zone C's café backdrop | No | No | B, C | Same style risk; tallest of the three, best candidate for a two-storey café/shophouse silhouette if the style risk is accepted |

### HouseParts (modular building pieces — more flexible than the full houses)

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `h3_roof_hut` | `production/HouseParts/h3_roof_hut.png` | 130×90 | Small shopfront/hut roof — sampled directly, reads cleanly even at small scale (confirmed: simple hatched-roof + window silhouette, legible as "a small shop" at a glance) | No | No | B, C, D | Same hand-drawn style as Houses, but small and iconic enough that the style risk is much lower here than for a full house |
| `h3_wall_upper` / `h3_wall_lower` | `production/HouseParts/h3_wall_{upper,lower}.png` | 224×168 / 228×159 | Modular wall sections to build a custom-height building (e.g. café, workshop) without using a giant terrain-block stack | No | Partial (designed to stack with roof/window/door parts, not to tile infinitely) | B, C, D | Larger, more detailed than `h3_roof_hut` — higher style-risk if used prominently in the foreground |
| `h3_window_casement` | `production/HouseParts/h3_window_casement.png` | 80×88 | Detail accent on a wall section | No | No | B, C, D | Small detail piece, low risk either way |
| `h3_door_grille` | `production/HouseParts/h3_door_grille.png` | 116×130 | Workshop door detail — matches Zone D's "mechanical workshop" identity better than a plain Kenney door | No | No | D | Reads as an industrial/grille door, good fit for Bengkel Fungsi specifically |
| `h1_roof_porch` | `production/HouseParts/h1_roof_porch.png` | 213×65 | Café canopy/porch roof — directly usable as Zone C's "awning/canopy silhouette" | No | No | C | Best single-asset match in the whole inventory for the brief's explicit Zone C ask ("recognizable café-front shape") |
| `h3_parapet` | `production/HouseParts/h3_parapet.png` | 246×48 | Rooftop edge trim for Zone E's roof silhouettes | No | No | E | Could visually finish the top edge of a background roof mass behind `roof-e1`–`roof-e4` without affecting collision |

### Props

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `water_tank_stand` | `production/Props/water_tank_stand.png` | 128×198 | Rooftop silhouette prop, Zone E | No | No | E | Reinforces "this is a rooftop," directly answers the brief's Zone E ask |
| `plant_pot_leafy` | `production/Props/plant_pot_leafy.png` | 59×57 | Small foreground/street-level prop — sampled directly: bold flat silhouette icon, **lowest style-risk prop in the whole production set**, closer to clean-icon than illustration | No | No | A, B, C | Safe to use broadly |
| `plant_pot_tall` | `production/Props/plant_pot_tall.png` | 64×96 | Same role, taller variant for variety | No | No | A, B, C | Same low risk as above |
| `plant_hanging` | `production/Props/plant_hanging.png` | 48×65 | Café/shopfront overhead detail | No | No | B, C | Low risk, small accent only |
| `plant_bush` | `production/Props/plant_bush.png` | 117×52 | Ground-level greenery, Zone A/F | No | No | A, F | Low risk |
| `laundry_line` | `production/Props/laundry_line.png` | 196×130 | Residential/town backdrop detail (reinforces "lived-in" neighborhood read) | No | No | A, B | Moderate detail level — background-only use recommended |
| `flag_malaysia` | `production/Props/flag_malaysia.png` | 104×56 | Small civic/residential accent (the brief's "subtle Terengganu influence," used sparingly) | No | No | A | Use once, not repeated — a single flag reads as place; several reads as decoration clutter |
| `lamp_wall` | `production/Props/lamp_wall.png` | 64×64 | Street lamp accent, Zone B town street | No | No | B | Low risk, small |

### Puzzle (interactive-object set — a direct, purpose-built alternative to the generic Kenney lever/sign)

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `function_machine_idle` / `function_machine_active` | `production/Puzzle/function_machine_idle.png` / `_active.png` | 169×186 each | Direct replacement for `kenney_lever`/`kenney_lever_left` at all 3 `TERMINALS` | No | n/a | D, E, G | Sampled directly: this is a **purpose-built function-machine icon** (shows `f(x)=2x+1`, a lever, a readout) — far stronger Layer 4 contrast/clarity than the generic Kenney lever, and already has matching idle/active states, same mechanism V6.2 already relies on. Style is illustrated/outlined (not flat-geometric), but per Layer 4's own purpose ("interactive elements must not visually blend with background objects"), a distinct illustration style for interactive objects specifically is arguably a feature, not a clash — see art direction doc |
| `checkpoint_post_idle` / `checkpoint_post_active` | `production/Puzzle/checkpoint_post_idle.png` / `_active.png` | 32×99 / 34×100 | Direct replacement for `kenney_sign`/`kenney_flag_a` at all 3 `CHECKPOINTS` | No | n/a | C, E/F, F | Sampled directly: simple flag-post silhouette, lower style-risk than the Houses set — close enough to the Kenney sign's simplicity to swap in safely |
| `answer_sign` | `production/Puzzle/answer_sign.png` | 32×45 | Small UI/world accent near a terminal (not currently used for anything equivalent) | No | n/a | D, E, G | Optional — no current gap it fills that `function_machine_*` doesn't already cover |

### Traversal

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `ladder_top/middle/bottom` | `production/Traversal/ladder_{top,middle,bottom}.png` | 64×64 each | Alternative ladder art to `kenney_ladder_*` | No | Yes (middle) | All (ladders) | Redundant with the already-working Kenney ladder — only relevant if full style migration away from Kenney is chosen |
| `platform_wood_center/left/right` | `production/Traversal/platform_wood_{center,left,right}.png` | 64×64 each | **Direct answer to the Zone B/E "awning/roof top" problem** — sampled directly: a simple flat plank silhouette, visually reads as a wooden awning top or boardwalk, cleaner and more specific than Kenney's generic stone-block-top | Yes if adopted (replaces `kenney_deck_*`) | Yes (center) | B (awnings), C (café roof), E (roof decks) | Best single candidate in the entire inventory for fixing audit #2/#3 directly |
| `platform_post` | `production/Traversal/platform_post.png` | 64×64 | Alternative to `kenney_block_center` for the vertical support under a deck — a proper post/strut shape instead of a stacked filler block | No | Yes | B, C, E | Would fix audit #4 ("ladders attached to arbitrary pillars") if paired with `platform_wood_*` |
| `walkway_railing` | `production/Traversal/walkway_railing.png` | 64×64 | Optional safety-rail decoration along a deck's edge (non-gameplay side) | No | Yes | B, C, E | Purely decorative, low risk, reinforces "this is a walkway" |

## C. `assets/background-legacy/` — imported, provenance-tracked, **currently unused**

| Key | Path | Dimensions | Recommended usage | Collision | Tiles | Zones | Limitations |
|---|---|---|---|---|---|---|---|
| `bg_hills` | `background-legacy/bg_hills.png` | 512×128 | Distant background silhouette, Zone F (and visible from E/G as a far horizon layer) | No | Horizontal repeat (512px tile) | F, G (distant) | Low-detail silhouette shape — good low-contrast background-layer candidate |
| `bg_cloud` | `background-legacy/bg_cloud.png` | 192×80 | Alternative/additional cloud shape to `kenney_bg_clouds`, for background-layer variety | No | No (single sprite, scattered) | All | Redundant with the already-used Kenney cloud unless variety is specifically wanted |
| `bg_house_row` | `background-legacy/bg_house_row.png` | 256×160 | Sampled directly: simple two-house silhouette, line-art but very minimal (thin outline, no hatching) — **lowest style-risk building asset found in this entire audit**, good Zone A/B distant-background candidate | No | Horizontal repeat (two houses per tile) | A, B (distant) | Best candidate for Layer 1 (background atmosphere) specifically, given its already-low detail level |
| `bg_palm` | `background-legacy/bg_palm.png` | 96×192 | Occasional tropical accent, reinforces "Malaysian town" setting without a specific zone requiring it | No | No (scattered single sprites) | Any, sparingly | Use very sparingly — several palms side by side risks reading as clutter |
| `bg_mosque` | `background-legacy/bg_mosque.png` | 176×224 | A single, distant, far-background civic landmark silhouette (never gameplay-adjacent) | No | No (single sprite) | Best placed once, distantly, in A or F — establishes "this is a real town" without claiming to be any specific zone's identity | Using it near gameplay risks implying a mosque-adjacent zone that doesn't match the brief's named locations (café/workshop/rooftop) — background-only, one instance |

## D. Chill Boy (character, unchanged, out of scope for this pass)

24 frames (`idle-00`…`idle-11`, `run-00`…`run-09`, `jump-00`, `fall-00`), all 659×626, `assets/chill-boy/`. No visual change proposed or needed — already has strong contrast against the flat background in every screenshot reviewed (see visual audit, "what's already working").

## E. Known limitations (what the pack genuinely cannot do)

- **No dedicated "awning" or "rooftop deck" sprite exists in the Kenney set** — confirmed again in this pass, unchanged from V5/V6/V6.1's own findings. The `production/Traversal/platform_wood_*` set is the closest available fix and does not require any new asset pack.
- **No asset in either set can represent a "café" or "workshop" as a single recognizable sprite** the way `function_machine_idle` recognizably represents a function machine — the closest available pieces (`h1_roof_porch` for café, `h3_door_grille` for workshop) are modular accents, not complete buildings, and must be composed rather than dropped in whole.
- **The production set's illustration style (outlines, hatching) does not match the Kenney set's flat-geometric style.** This is the central tension this pass must resolve deliberately — see `level-v6.3-art-direction.md`. No asset swap can be "safe to implement immediately" without an explicit decision on how (or whether) the two families coexist.
