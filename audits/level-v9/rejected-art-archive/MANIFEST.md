# Rejected Art Archive — Manifest

V9.5 cleanup. These 12 files were archived out of the deployed game directory
because they are (a) zero-reference in `src/game.js` (confirmed by grepping
every basename), (b) tied to the Phase 8.5 "architectural scenery" direction
that V8.7 explicitly rolled back in code, and (c) not needed by any active
mechanic (checkpoints, machines, Chill Boy, crate puzzle). Nothing here was
deleted — only moved, with `manifest.json`/`provenance.json` entries removed
to match.

| Key | Original path | Archived to |
|---|---|---|
| h1_roof_porch | assets/production/HouseParts/h1_roof_porch.png | production/HouseParts/h1_roof_porch.png |
| h3_door_grille | assets/production/HouseParts/h3_door_grille.png | production/HouseParts/h3_door_grille.png |
| h3_parapet | assets/production/HouseParts/h3_parapet.png | production/HouseParts/h3_parapet.png |
| h3_roof_hut | assets/production/HouseParts/h3_roof_hut.png | production/HouseParts/h3_roof_hut.png |
| h3_wall_lower | assets/production/HouseParts/h3_wall_lower.png | production/HouseParts/h3_wall_lower.png |
| h3_wall_upper | assets/production/HouseParts/h3_wall_upper.png | production/HouseParts/h3_wall_upper.png |
| h3_window_casement | assets/production/HouseParts/h3_window_casement.png | production/HouseParts/h3_window_casement.png |
| house_1_full | assets/production/Houses/house_1_full.png | production/Houses/house_1_full.png |
| house_2_full | assets/production/Houses/house_2_full.png | production/Houses/house_2_full.png |
| house_3_full | assets/production/Houses/house_3_full.png | production/Houses/house_3_full.png |
| lamp_wall | assets/production/Props/lamp_wall.png | production/Props/lamp_wall.png |
| laundry_line | assets/production/Props/laundry_line.png | production/Props/laundry_line.png |

All paths are relative to `app/addmath/rooftop/` (original) and this
archive folder (new).

## Deliberately left untouched this pass

Zero-reference but ambiguous provenance (not clearly tied to a documented
rejected direction, so not removed per the "do not delete by folder name
alone" instruction): `assets/production/Ground/ground_left.png`,
`ground_center.png`, `ground_right.png`, `ground_center_alt01.png`; several
unused `assets/production/Traversal/*` files (`ladder_bottom`, `ladder_middle`,
`ladder_top`, `platform_post`, `platform_wood_center`, `walkway_railing`);
`assets/production/Props/plant_hanging.png`. These remain in
`manifest.json`/`provenance.json` and on disk, unchanged.

## Verification

- `node --test`: manifest size assertion updated 85→73, all tests pass.
- Confirmed via grep that none of the 12 archived keys appear anywhere in
  `src/game.js` before or after the move.
