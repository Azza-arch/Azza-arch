# V8.7 — Asset Removal / Retention Inventory

## Removed (no longer generated anywhere)

| Asset | Was used for | Why removed |
|---|---|---|
| `h3_wall_upper`, `h3_wall_lower` (as facades) | Phase 8.5's `buildingFacade()` wall mass | The specific "detailed architectural scenery" the user asked to roll back. |
| `h3_window_casement` | Phase 8.5's `shopfront()` window | Part of the shopfront combo, removed with it. |
| `h3_door_grille` (as workshop scenery) | Phase 8.5's Zone D workshop facade | Removed — the machine's own sprite already identifies the workshop. |
| `h3_parapet` | Phase 8.5's Zone D roofline trim | Removed with the facade it trimmed. |
| `h1_roof_porch`, `h3_roof_hut` (as shopfront/facade canopies) | Phase 8.5's B/C/E canopies | Removed — "do not create more houses, shops or building facades." |
| `house_2_full` | Phase 8.5's second Zone A house | Reverted to the original single-house Phase 1 landmark. |
| `laundry_line` | Phase 8.5's roof-laundry prop | Removed along with that deck's facade (no facade to hang it on). |

## Retained (unchanged from Phase 8.5)

| Asset | Used for | Why kept |
|---|---|---|
| `rockMass()` (Graphics, not an asset) | F's three step decks | Brief: "retain hill ... identity with simple recognizable shapes." |
| `caveMouth()` (Graphics) | Cave entrance | Same instruction — cave identity explicitly retained. |
| `riverBand()` (Graphics) | Final-gate gap | Same instruction — river identity explicitly retained. |
| `buildGateStubs()` (`platform_wood_left`/`right`) | Locked-gate markers | Gameplay-clarity feature (Phase B's "clearly distinguish ... locked gates"), not "architecture." |
| `checkpoint_post_idle`/`active` | Checkpoints | An interactive-object sprite, not scenery — kept from Phase 8.5. |
| `function_machine_idle`/`active` | Machines | Same — interactive object, kept. |
| `house_1_full` | Zone A's one landmark | The original, single, Phase-1-era landmark — not new architecture. |
| `water_tank_stand` | Zone E's one landmark at Machine 2 | "Keep necessary environmental landmarks only when they improve navigation" — this one genuinely helps recognize M2's deck. |
| `flag_malaysia`, `plant_pot_leafy`, `plant_pot_tall`, `plant_bush` | Small ground props | Lightweight single-prop accents, not architecture. |
| `bg_house_row`, `bg_mosque`, `bg_hills`, `kenney_bg_clouds` | Distant parallax background | Low-contrast atmosphere, not foreground scenery — removing it would produce an empty grey sky. |

## New in this phase

| Asset | Used for |
|---|---|
| `kenney_block_left`/`kenney_block_right` (as `supportPiers()`) | Unified deck support, replacing the architectural facades. Same Kenney family already used everywhere else — no new visual language introduced. |
| `kenney_door_closed`/`kenney_door_closed_top` | The goal's new exit/door cue (previously unused in the manifest). |

## No new assets, no new dependencies

Every asset referenced above already existed in `assets/manifest.json`
before this phase. Nothing was downloaded or generated.
