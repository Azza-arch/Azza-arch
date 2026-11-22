# V9.5 — Verified Asset Manifest (post-archive)

73 entries remain in `assets/manifest.json` (down from 85; the 12 archived
keys are listed in `rejected-art-inventory.md`). Every entry below was
cross-checked this phase by `tests/level.test.mjs`'s own integrity test:
each `provenance.json` record's file exists on disk, its sha256 matches,
and its manifest path matches. `node --test`: 11/11 pass.

## Chill Boy (player character — grayscale/antialiased, untouched)
`idle-00`…`idle-11`, `run-00`…`run-09`, `jump-00`, `fall-00` — 24 frames,
`assets/chill-boy/`.

## Kenney "New Platformer Pack" (64px native, colorful since V9.4)
`kenney_ground_left/center/right`, `kenney_deck_left/center/right`,
`kenney_deck_overhang_left/right`, `kenney_block_left/center/right`,
`kenney_block_blue`, `kenney_coin`, `kenney_hud_coin`,
`kenney_ladder_top/middle/bottom`, `kenney_bridge`, `kenney_lever`,
`kenney_lever_left`, `kenney_sign`, `kenney_flag_a/b`, `kenney_bg_clouds`,
`kenney_door_closed`, `kenney_door_closed_top` — 26 entries,
`assets/kenney/`. **This is explicitly NOT the Pixel Platformer family —
still the only tile pack actually present on disk (see
asset-import-report.md).**

## Production assets (still in active use — 23 entries)
- `Ground/`: `ground_left`, `ground_center`, `ground_right`,
  `ground_center_alt01` (currently zero-referenced in `game.js`, left in
  place — ambiguous provenance, not archived this pass).
- `Traversal/`: `ladder_bottom/middle/top`, `platform_post`,
  `platform_wood_center/left/right`, `walkway_railing` (left/right
  referenced; the rest currently zero-referenced, left in place).
- `Props/`: `water_tank_stand`, `plant_pot_leafy`, `plant_pot_tall`,
  `plant_hanging` (zero-ref, left in place), `plant_bush`, `flag_malaysia`.
- `Puzzle/`: `function_machine_idle/active`, `checkpoint_post_idle/active`,
  `answer_sign`.

Total: 24 + 26 + 23 = 73.
