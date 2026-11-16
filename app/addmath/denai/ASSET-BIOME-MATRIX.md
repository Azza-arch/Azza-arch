# Asset & biome matrix (checked against the actual tilesheets, 16 Nov 2026)

All packs are 18 px tiles drawn at ×3 (54 units). Indices are frame numbers in each pack's `tilemap_packed.png`.
Rule: no tile is stretched, rotated or recoloured in a way that breaks a join. Any category marked "none" needs new art.

## 1. Inventory
**Kenney Pixel Platformer (base)**: `assets/kenney-pixel-platformer/` (20 × 9 tiles + a background sheet of 8 × 3 tiles)
- Terrain: grass (0–3 floating slab, 20–23 top), sand/stone top (40–43, 60–63), **snow top (80–83, 100–103)**, dirt fill (4, 5, 24, 25, 104, 120–143).
- Water: surface 33/53, body 73, waterfall 34/35/54/55/74/75.
- Trees: crown 16–19, 36–39, 56–59, 76–79; trunk 96, 97, 116, 117, 136–138; branches 98, 99, 118, 119; pine 126; cactus 127.
- Structures: rope poles 69/89/109, bridge planks 48–50, ladders 71/51, fences 105/106, crates 6/26/29, brick blocks 9–11/28/29, door 130/150, signs 84–88, levers 64–66, flags 111/112, small platforms 146/147.
- Pipes: body 115/133, ends 95/135/132/134, elbows (junction quarters) 93/94/113/114.
- Others: mushroom platforms 12–15, mushrooms 108/128/129, plants 124/125, gem 67, spikes 68, coins 151/152, keys/locks 27/28, **snowman 145**, **cloud/snow platforms 153–156**, buttons 148/149.
- Background (`tilemap-backgrounds_packed`): **green set** (sky 6/7, band 14/15, fill 22/23), **desert set** (4/5, 12/13 pyramids and palms, 20/21), **snow set** (0–3, 8–11, 16–19).

**Kenney Farm Expansion**: `assets/kenney-pixel-platformer-farm/` (16 × 7, 112 tiles)
- Farm soil with an orange top (0–3, 16–19, 32–35, 48–51); crops (carrot, tomato, wheat, maize 56–59, 72–75, 88–91, 104–107); sprouts 42/43/54/55; sunflower 20/36.
- Greenhouse (roof 22/23, 52/53; walls and windows 64–71, 80–87, 96–103); fence with plants 38–41.
- Hay bales 6–8, rolls 9–11, mound 24/25; tools: shovel 21/37, watering can 26, bucket 27; pumpkins 4/5.
- Autumn trees (orange crown 12–15, 28–31, 44–47, 60–63, 77) and birch trees (pale trunk 76, 92–95, 108–111).

**Kenney Industrial Expansion**: `assets/kenney-pixel-platformer-industrial/` (16 × 7, 112 tiles)
- Ground with a metal edge (0–3, 16–19) + dirt (32–35, 48–51); orange girders (4–6, 20–22, 38).
- Scaffolding/frames 36, 37, 52–54, 68–70; truss pieces 80–82, 96–98; metal ladder 11/27/43.
- Chains 8/24/40/56/72, rope with hook 7/23/39/55/71; barrels 9/10; hazard crates 25/62/63; striped hazard blocks 87–90, 103–106.
- Grey pipes: vertical 59/75/91/107, horizontal 108–111, junction 76/77/92/93; green outlets 78/79.
- **Green toxic liquid** 13–15, 29–31, 45–47, 94/95; conveyor belt 84–86, 100–102; gears/wheels 83/99.
- Lamps 58/74, alarm lights 64/65, signs 41/42/57/73, door 12/28/44, blue panels/machines 60/61, metal roof 66/67.

**Others in the repo**: `assets/kenney/tiles/` (stone blocks with top, edge and overhang pieces; log bridge; lever; door; green flag), `assets/kenney/backgrounds/background_clouds.png`, `assets/production/` (Malaysian flag, potted plants, water tank on a stand, function machine, checkpoint post), `assets/chill-boy/` (player), `assets/kenney-ui-pixel-adventure/` (UI).

## 2. Matrix: proposed environment × assets
| Environment | Available | Reusable from another pack | Missing | Feasible without new art? |
|---|---|---|---|---|
| **W1 Tropical forest & river** | grass, trees, water, poles, planks, pipes, green background | `kenney/tiles` stone (ruins), farm logs | kampung houses (can be built from planks + poles + crates, but no attap roof) | **Yes** (already playable) |
| **W2 Limestone valley** | stone tops 40–43, `kenney/tiles` stone + overhangs, water, poles | industrial chains (pontoons), farm fences (pen) | **karst background**, cliff faces with texture, cave mouths, stalactites | **Partly**: the play layer is OK, the background and cliffs need art |
| **W3 Factory & mining** | the entire industrial pack | base water, ladders | rails/minecart, dredge, ore | **Yes** (the dredge can be built from girders + truss) |
| **W4 Highland farms** | the entire farm pack, greenhouse | base grass, ladders | tea bushes (Cameron), terraced slopes | **Mostly yes** (terraces made from stepped soil) |
| **Coast & mangrove** | water, sand tops 40–43, palm in the desert background (background only) | — | mangrove roots, boats, sea background, crabs | **No** (needs a mangrove/sea set) |
| **Caves & underground ruins** | stone, dirt fill 120–143, `kenney/tiles` stone | industrial lamps (light) | **dark cave tiles and background**, crystals | **Partly**: possible with dark dirt, but there is no cave background |
| **Rainforest canopy** | trees, rope poles, planks, ladders, green background | farm birch trees | thick canopy, hanging vines | **Mostly yes** |
| **Fantasy snowy highlands** | **snow tops 80–83/100–103, snow background set, snowman 145, cloud/snow platforms 153–156** | metal from the industrial pack (observatory) | **ice blocks, icicles, frozen lake surface, snowy pine trees** | **Partly**: snowy ground exists; **there is no ice tileset** |
| **Mechanical city** | industrial pack (gears, conveyors, pipes, girders) | base doors, signs | buildings/facades, rail tracks | **Partly** |

## 3. Notes
- Do not recolour the green pine (126) into a "snowy pine" just by changing colours. That is not the art style and it breaks the outline. Real snowy trees need new art.
- Mixing packs is safe in size (all 18 px), but each pack's palette is slightly different (industrial is more saturated). Use one pack as the dominant one per World.
- Licences: the three Kenney packs are CC0 (LICENSE.txt in each folder). Chill Boy: see SOURCE-README.
