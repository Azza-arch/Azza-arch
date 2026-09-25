# Asset attribution & licensing (Phase 1.7 — final Kenney inventory)

This replaces the earlier pixel-art-family version of this file. That
direction (Kenney Pixel Platformer + astronaut mascot) was rejected; its
vendor files have been deleted from the repo.

## Primary family (in use)

All three packs below are 2D flat vector, front-facing/icon perspective,
CC0 1.0, and confirmed visually compatible with each other (same outline
weight and colour saturation, checked side by side before adoption).

### Toon Characters
- **Source:** https://kenney.nl/assets/toon-characters
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/kenney-toon-characters/` — `Male adventurer/Poses/`, `Female adventurer/Poses/`
- **Notes:** Despite the folder name "adventurer," these two characters read as an ordinary boy and girl in everyday clothes (not fantasy warriors) — confirmed by direct visual inspection. Used as `characterKidMale` / `characterKidFemale`. 45 poses exist per character; only the poses with a clear grammar-verb use are catalogued in `assetCatalog.js`, but every pose file is present in the repo for future use. No "sit" pose exists in this pack.

### Generic Items
- **Source:** https://kenney.nl/assets/generic-items
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/kenney-generic-items/Colored/` (163 files)
- **Notes:** Full inventory manually reviewed (contact-sheet method, all 163 items). Confirmed present: books, folder, backpack, briefcase, phone, tablet, laptop, wallet, money, keys, pencil, generic bowl/mug. Confirmed **absent**: ball/sports equipment, umbrella, and any breakfast-specific food (no cereal, toast, or egg sprite — only a generic bowl and mug).

### Background Elements
- **Source:** https://kenney.nl/assets/background-elements
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/kenney-background-elements/PNG/` — house, tree, cloud, grass, hills, sky, sun files
- **Notes:** Released 2015, but flat-vector style is compatible with the newer Toon Characters/Generic Items. Contains front-view house sprites (`house_beige_front.png`, `house_grey_front.png`, plus grey/beige side variants not yet copied in) — this resolved what was earlier reported as a "no house exists anywhere" gap. Trees (35 variants), clouds (9), hills, and a plain sky tile are also here, used as real asset files rather than CSS-drawn shapes per the current asset-only-scenes rule.

### Background Elements Remastered
- **Source:** https://kenney.nl/assets/background-elements-remastered
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/kenney-background-elements-remastered/`
- **Selected files:** `bush1.png`, `bush2.png`, `bushAlt2.png`, `cloud2.png`, `cloud6.png`, `fence.png`, `house1.png`, `houseSmallAlt2.png`, `tree.png`, `treeSmall_green2.png`.
- **Notes:** Only the environment accents used by the authored locations are retained.

### Glitch Furniture SVG
- **Source:** https://opengameart.org/content/glitch-furniture-svg
- **Original creator:** Tiny Speck
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/glitch-furniture/`
- **Selected original files:** `furniture_desk.svg`, `furniture_chair_basic_padded_chair.svg`, `furniture_bookcase.svg`, `furniture_largewindow.svg`, `furniture_floorlamp_powdered_blue_floor_lamp.svg`.
- **Notes:** This selected front/side-view subset is used only for the indoor study room. Pixel, top-down, isometric and fantasy-shaped items were rejected.

### UI Pack
- **Source:** https://kenney.nl/assets/ui-pack
- **License:** CC0 1.0 Universal
- **Folder used:** `assets/vendor/kenney-ui-pack/PNG/Blue/` (one sample button copied in)
- **Notes:** Optional. CSS buttons/panels remain compliant on their own (interface elements are explicitly allowed as CSS), so this pack is only needed if a Kenney-sprite button look is specifically wanted later.

## Evaluated and rejected (this phase)

- **Racing Pack**, **Car Kit**, **Pixel Vehicle Pack** — every vehicle option found is top-down or 3D; none match Toon Characters' front-facing perspective. No vehicle asset is in the current catalog.
- **Furniture Kit**, **Building Kit**, **Modular Buildings** — isometric 3D; great home/building content but wrong camera angle for this family.
- **RPG Urban Pack** — internally consistent top-down pixel city, but pixel + top-down conflicts with the flat + front-facing primary family.
- **Tiny Town** — medieval/fantasy village, thematically wrong for an everyday-life story regardless of style.
- **Foliage Pack** — considered for trees, but Background Elements already provides 35 named tree variants in the same style, making this pack redundant. Not copied in.

## Previously used, now removed

- **Kenney Pixel Platformer**, **Pixel Platformer: Food Expansion**, **Pixel Vehicle Pack** (the astronaut-mascot direction) — vendor files deleted from `assets/vendor/` after rejection. Their license terms no longer apply to anything in this repo.

## Confirmed-unavailable categories (do not force a substitute)

- **SCHOOL** — no school-tagged or school-building asset exists in any Kenney pack audited. `kenney.nl/assets/tag:school` returns zero results.
- **TRANSPORT** (bus/car/bicycle) — no vehicle in the primary family's perspective. See "rejected" above.
- **HOME interior** (bed, sofa, kitchen furniture) — only isometric-3D packs have this content.
- **SPORT** (ball, sports equipment) — not present in Generic Items; no dedicated sport pack sourced.
- **ANIMALS** — no animal pack sourced in this phase.
- **Breakfast-specific food** (cereal, toast, egg) — Generic Items has only a generic bowl and mug.

Per the "do not force missing categories" rule, no story in this project should depend on any of the above until a compatible asset is actually sourced and added here first.

## Level 4–5 selection audit

- **Getting Ready:** uses the existing CC0 Toon Characters, Generic Items backpack/keys, and Background Elements front-facing house. All belong to the approved flat/front-facing family.
- **Doing Homework:** uses the existing CC0 female Toon Character plus the real laptop, open book, pencil, and folder assets from Generic Items. It replaces the rejected garden sequence, which incorrectly used a mug as a watering can and grass/tree assets as a flower.
- **Environment presets:** Level 1 uses `forest`, Level 2 `park`, Level 3 `neighborhood`, Level 4 `homeExterior`, and Level 5 `studyRoom`. Each story keeps a stable environment across all four panels and Word Order reuses its referenced panel.
