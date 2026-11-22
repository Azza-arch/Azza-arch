# Lorong Atas Bumbung — V6.3 Art Direction

**Status: design-only proposal.** Grounded in `level-v6.3-asset-inventory.md`'s findings; no source file modified.

---

## 0. The one decision everything else depends on: two asset families, one game

The asset inventory found two distinct illustration styles already sitting in the repo:

- **Flat-geometric** (Kenney tiles; `production/Ground`; `production/Traversal`'s `platform_wood_*`/`platform_post`/`walkway_railing`; `production/Props`' `plant_pot_*`; `production/Puzzle`'s `checkpoint_post_*`) — simple shapes, no outline stroke, no hatching. Sampled directly in the inventory pass; these are low style-risk anywhere.
- **Illustrated/outlined** (`production/Houses`, `production/HouseParts`, `production/Puzzle`'s `function_machine_*`, `background-legacy`'s `bg_mosque`/`bg_house_row`/`bg_hills`) — hand-drawn outline strokes, roof hatching, window linework. Sampled directly; these clash with the flat-geometric family if placed at full size, full contrast, in the gameplay-adjacent foreground.

**Resolution proposed for this pass:** split by visual layer, not by asset folder.

- **Layers 1–2 (background/midground):** illustrated-family assets are the right fit here specifically *because* distance and lower contrast (per §5.1's own rule — background must stay lower-contrast than gameplay objects) soften outline/hatching detail into a silhouette read. `bg_house_row`, `bg_mosque`, `h1_roof_porch`, `h3_roof_hut`, `house_1/2/3_full` all belong here, not in the foreground.
- **Layer 3 (gameplay geometry):** stays flat-geometric. Either keep the current Kenney deck/ground tiles, or swap to `production/Ground` and `production/Traversal`'s `platform_wood_*`/`platform_post` — both are flat-geometric, so neither choice reintroduces the clash. This is a visual refinement with zero collision-shape change either way.
- **Layer 4 (interactive):** this is the one deliberate exception. `function_machine_idle/active` is illustrated-style, but Layer 4's own stated purpose ("must not visually blend with background objects") is *served* by that contrast, not undermined by it — a function machine that looks different from the terrain is doing its job. `checkpoint_post_*` (flat-geometric, low detail) can be swapped in alongside it without clashing, since it's simple enough to sit near either family.
- **Props (Layer 2, foreground accents):** `plant_pot_*` (flat-geometric, low risk) usable anywhere; `laundry_line`/`flag_malaysia`/`water_tank_stand` (moderate detail) reserved for background placement, used sparingly (once or twice per zone, not repeated).

This is a **recommendation requiring explicit approval**, not a default — see `level-v6.3-approval.md`. The alternative (reject the illustrated family entirely, stay 100% Kenney-flat-geometric everywhere) is also viable and is listed as Option B below.

## 1. Visual hierarchy (Layers 1–5, restated with asset assignments)

| Layer | Purpose | Assets (if Option A — mixed family) | Assets (if Option B — Kenney-only) |
|---|---|---|---|
| 1. Background atmosphere | Location, depth, no void | `bg_house_row`, `bg_mosque` (once), `bg_hills`, `kenney_bg_clouds` (kept) | `kenney_bg_clouds` only, more copies at varied scroll factors |
| 2. Midground environment | Recognizable landmarks | `house_1/2/3_full`, `h1_roof_porch`, `h3_roof_hut`, `h3_parapet`, sparse `plant_*`/`laundry_line` | `kenney_block_blue` silhouettes (already proven at the cave entrance), no building forms |
| 3. Gameplay geometry | Where to stand/jump/climb | Kenney deck/ground tiles (unchanged) or `production/Ground` + `platform_wood_*`/`platform_post` | Kenney deck/ground tiles (unchanged) |
| 4. Interactive elements | Draw attention | `function_machine_idle/active`, `checkpoint_post_idle/active` | `kenney_lever{,_left}`, `kenney_sign`/`kenney_flag_a` (unchanged) |
| 5. Interface | Objectives/controls | Unchanged — out of scope, see §12 note below | Unchanged |

Option A gives every zone a genuinely distinct landmark (the brief's core ask); Option B is the lower-risk, lower-identity fallback if the style mix is rejected. Both are compatible with the implementation plan's phased order (background/midground first, so the decision can be evaluated with zero collision-code risk before touching Layer 3/4).

## 2. Palette

The entire canvas renders through `#game{filter:grayscale(1)}` (`style.css`) — **every color choice below becomes a lightness value only, never a hue**, in the live game. The roles are therefore specified as **tonal steps**, with example hex values given only as a reference starting point for whoever eventually draws/selects within each step:

| Role | Tonal step (post-grayscale) | Reference hex | Used for |
|---|---|---|---|
| Interface warm off-white | Lightest | `#f3f2ee` (already `--paper` in `style.css`) | HUD, dialogs — unchanged, out of scope |
| Distant atmosphere | Light grey, low contrast | ~`#d8d9d3` | Layer 1 background silhouettes |
| Midground structures | Medium grey | ~`#aaada3` | Layer 2 building/landmark silhouettes |
| Gameplay surfaces | Dark charcoal, highest contrast against background | ~`#4b4e47` (close to existing `--ink`) | Layer 3 terrain/decks/ladders |
| Interactable accent | Restrained, slightly lighter than gameplay surfaces so it pops forward | ~`#6b6b6b`-ish mid-dark | Layer 4 machines/checkpoints/collectibles |

The ordering (background lightest → gameplay darkest) is the mechanism that keeps Layer 3 "the clearest edges" per §5.1, regardless of which asset family is chosen — contrast ranking matters more than any specific hex value, since grayscale filtering collapses hue entirely.

## 3. Terrain treatment

No change to collision shape or tile size (64×64 throughout, confirmed in the inventory). Visual refinement only: if Option A is approved, swap `kenney_ground_*`/`kenney_deck_*` for `production/Ground`'s flatter, simpler tiles and `production/Traversal`'s `platform_wood_*` for awning/roof tops specifically — both read as more "finished" without any new collision geometry, since both are already 64×64 and already drop-in compatible with the existing `deck()`/ground-tiling loop structure.

## 4. Background style

Single, restrained layer per zone cluster (not per zone — see §8 continuity), at a scroll factor below 1 (consistent with the existing `kenney_bg_clouds` pattern, `scrollFactor(.3,.2)`), always at the palette's lightest tonal step, never introducing new collision bodies (every background sprite in this plan is a plain `this.add.image(...)`, the same call already used for clouds — no new Phaser body type needed).

## 5. Midground style

A second parallax layer at a scroll factor between the background and 1:1 foreground (e.g. `.55,.4`, roughly midway — a specific value is a tuning detail for the implementation phase, not a design-pass decision), carrying the building/landmark silhouettes. Midground sprites must be placed with a documented, deliberate x-range per zone (see `level-v6.3-zone-composition.md`), not scattered — this is what gives each zone a "landmark," not generic texture.

## 6. Building silhouettes

Built from the modular `HouseParts` pieces where available (café → `h1_roof_porch`; workshop → `h3_door_grille` + a wall section; Zone B shopfronts → `h3_roof_hut` repeated/varied), falling back to a full `house_*_full` sprite only where a modular composition isn't warranted (Zone A residential background). This directly satisfies the brief's explicit "do not solve a missing-building-asset problem by stacking terrain squares into a giant fake building" instruction — these are real building-shaped sprites, not stacked blocks, and they are midground-only (never collidable), so they cannot be confused with gameplay geometry.

## 7. Props

Used as single accents, not fields — one `flag_malaysia`, one `bg_mosque`, two or three `plant_pot_*` per zone at most. The brief's "goal is not to fill every empty space with decoration" is treated as a hard cap: every prop placement in `level-v6.3-zone-composition.md` is justified by "this establishes location identity," never by "this fills empty space."

## 8. Interaction readability

Unchanged mechanism, refined asset: the existing idle/active two-state swap (`machines[t.id].setTexture(...)` in `game.js:answer()`) already works and is preserved exactly — only the sprite keys change (to `function_machine_idle`/`function_machine_active` if Option A is approved). No new code path, no new state.

## Avoid-list (restated as a checklist against this plan)

- ✅ No messy scribble lines — the illustrated family's outline weight is sampled as clean/consistent (confirmed in the inventory pass), not hand-wobbled.
- ✅ No excessive textures — terrain tiles stay flat-geometric regardless of which option is chosen.
- ✅ No busy decorative backgrounds — capped at one background layer + one midground layer, both low-detail/low-contrast.
- ✅ No random floating objects — every prop placement is zone-justified in `level-v6.3-zone-composition.md`.
- ✅ No clashing sprite styles — resolved explicitly by the Layer 1-2-4 vs. Layer 3 split in §0, not left ambiguous.
- ✅ Not an ancient/traditional kampung, not sci-fi, not a block-tower collection — illustrated-family buildings read as contemporary shophouse/residential forms (confirmed visually in the inventory sampling), and the plan explicitly keeps them midground-only so they never become the collidable "block towers" the brief warns against.
