# DENAI: world map masterplan V2 (design only)

Written on 16 Nov 2026 on branch `claude/denai-map-masterplan-v2` (not merged). This document extends `MASTER-PLAN.md` and replaces its "Senarai World" section once approved.
Related files: `WORLD-1-MAP-REDESIGN.md`, `WORLD-2-VISUAL-DIRECTION.md`, `ASSET-BIOME-MATRIX.md`, `design/blueprints/`.

## 1. Principles
- **One topic = one World; one World = one region of the "Tanah DENAI" peninsula (fictional, inspired by Malaysian landscapes).** Levels within a World are connected geographically (see the continuity rules in `WORLD-1-MAP-REDESIGN.md` §2).
- **Maths changes the world, not quiz screens.** Every major mechanism solves a recognisable problem (production, conversion, trajectory, area, allocation). If a model is fictional, say so.
- **Length comes from content, not width.** Targets for a first play (estimates, not measured): intro level 8–12 minutes, intermediate 12–18, finale 15–22.
- **Movement and physics stay as they are** (peak 1.71 tiles, reach ≈ 3.9 tiles). Geometry adapts to them.

## 2. Five geometry patterns (Phase 3)
| | A. Tropical valley | B. Ruins & towers | C. Cave network | D. Compact industry | E. Snowy highlands (fantasy) |
|---|---|---|---|---|---|
| Terrain | rolling hills, river at the bottom, natural arches, low cliffs | stone blocks, stairs, broken columns, inner rooms | tunnels inside one big rock mass, overhangs, shafts | layered floors, gantries, wall-to-wall rooms | slopes, frozen lakes, steep cliffs, cloud bridges |
| Main direction | horizontal with dips and climbs | **vertical** (up, then across at the top) | horizontal + down, then up through a shaft | short zig-zags between floors | uphill, diagonal |
| Verticality | 3–6 rows | 8–14 rows | 6–10 rows (underground) | 4–8 rows per room | 6–12 rows |
| Platforms | ground, arches, rope bridges, stepping stones | stone stairs, galleries on piers, aqueducts | stone ledges, blocks, ladders in shafts | girders, metal ladders, conveyors, lifts | snow ground, cloud platforms, ice blocks (needs new art) |
| Main / optional routes | ground / canopy and arch | facade stairs / inner tower | upper tunnel / underground river | factory floor / pipe ducts | ridge / lake cave |
| Landmark | giant tree, bridge, water wheel | tower with cistern, gate | underground lake, crystals (needs art) | chimney, mining dredge | snow peak, observatory |
| Kenney assets | base: grass, trees, water, poles, planks | base stone 40–43, `kenney/tiles` stone, poles | stone + dirt 120–143; **no dark cave tiles** | the entire industrial pack | base snow 80–83/100–103, snow background set, snowman, cloud platforms 153–156 |
| Maths interactions | produce materials, bridges, water channels | valves, meters, gates with seals | shining a light along a line/vector, ropes | two machines, allocation, conveyors | measuring angles and distances (triangles) |

Rule: **no level uses only one pattern.** Each level mixes a dominant pattern with one secondary (example: 1-3 = B + a little C; 2-2 = A + B).

## 3. Geography and World order (mapped to the curriculum)
The KSSM Add Maths chapters (codes and titles only): T4 — 1 Functions, 2 Quadratic Functions, 3 Systems of Equations, 4 Indices, Surds and Logarithms, 5 Progressions, 6 Linear Law, 7 Coordinate Geometry, 8 Vectors, 9 Solution of Triangles, 10 Index Numbers. T5 — 1 Circular Measure, 2 Differentiation, 3 Integration, 4 Permutations and Combinations, 5 Probability Distribution, 6 Trigonometric Functions, 7 Linear Programming, 8 Kinematics of Linear Motion.

| World | Region (Malaysian inspiration) | Topic | Authentic applied maths | Status |
|---|---|---|---|---|
| 1 | **Tropical forest & riverworks** (kampung, river) | T4 B1 Functions | material production, conversion, two-stage processes, recovering an input | 3 levels playable |
| 2 | **Limestone valley** (Kinta Valley, Langkawi) | T4 B2 Quadratic Functions | trajectory (simplified), suspension-bridge cable (parabola under uniform load), maximum area of a fence | 2-1 Station A slice |
| 3 | **Factory & tin mine** (tin-mining heritage, the dredge) | T4 B3 Systems of Equations | allocating two/three resources, calibrating two connected machines, line + curve intersection | planned |
| 4 | **Highland farms & greenhouses** (Cameron Highlands) | T4 B4 Indices, Surds & Logarithms | compound growth, soil pH = −log[H⁺], dilution scale | planned |
| 5? | **Coast & mangrove** | T4 B5 Progressions | mangrove planting rows (arithmetic), bounce height / halving (geometric), savings | proposal |
| 6? | **Rainforest canopy** | T4 B7 Coordinate Geometry or B8 Vectors | canopy walkway mapping (coordinates, gradients), river current + boat (vectors) | proposal |
| 7? | **Limestone caves & underground ruins** | T4 B6 Linear Law | measuring stalactite growth → fitting a straight line (Y against X) | proposal |
| 8? | **Fantasy snowy highlands** (**fictional**, not Malaysia's climate) | T4 B9 Solution of Triangles | surveying peaks and an ice bridge with the sine/cosine rules | proposal; needs new art |
| 9? | **Mechanical city** | T5 B1 Circular Measure / B8 Kinematics | gears and arc length; motion of a train (needs differentiation/integration first) | proposal |

Notes:
- The "?" entries are theme proposals and **not final**. Their order must follow the order students learn the chapters (T4 before T5), and the calculus Worlds (T5 B2, B3, B8) must come after the World that teaches them.
- The snow World is presented as **fantasy geography in a story** ("Puncak Fantasi"), not as Malaysia's climate.
- Topics without a theme yet: T4 B10 Index Numbers (a fit: a market town / pasar), T5 B4 Permutations and Combinations, B5 Probability Distribution, B6 Trigonometric Functions (a fit: tides / a Ferris wheel), B7 Linear Programming (a fit: a farm, which could be a second highland World).

## 4. Visual depth versus gameplay depth (separate plans)
**Visual depth** (only makes things look better):
- World 1 (done in Phase A): sky gradient → hazy distant forest (0.2) → middle forest (0.5) → play layer.
- World 2: a karst background **needs new art** (the base pack only has green/desert/snow sets). For now: green set + `kenney/tiles` stone in the foreground.
- World 3: dark sky, chimney silhouettes, made from the industrial pack (metal pipes / girders as the far layer, washed out).
- World 4: the green set + farm-pack trees as the middle layer.
- Snow: the base pack's snow set (0–3, 8–11, 16–19), which already exists, **without recolouring a forest**.

**Gameplay depth** (changes how you play):
- At least **one loop** per level that rejoins the main route by a different way.
- Upper/lower routes with real differences (speed versus collecting).
- **Valid alternative solutions:** for example a 1-1 optional jetty that bypasses two hops; in World 2, several (a, h, k) that pass through two rings (Station B secret).
- Mechanisms with more than two outcomes: a wrong output still builds something you can see (a short bridge, extra planks, a misplaced deck).
- Revisiting: travel between checkpoints (future), explore mode (already exists in 1-1).

## 5. Replay (no grinding)
- **Variants after completion:** different targets (already 12 variations in 1-1); a different price in Gerai Jeti; a different thermometer reading.
- **Missed secrets and coins**: shown per level on the world map.
- **Personal improvement**: best time (already exists; the PlayFab leaderboard for 1-1).
- **Lasting world changes**: a built jetty, a flowing aqueduct, a lit seal; they stay after the level is finished.
- **No** lives, daily streaks or arbitrary difficulty. A wrong maths experiment can always be recovered from.

## 6. World map / World selection (Phase 8)
Layout sketch: `design/blueprints/world-select.svg` (+ PNG).
- **Desktop:** one peninsula; each World is a region with its own shape and colour (forest + river, karst peaks, mine, terraced highlands, mangrove coast, canopy, fantasy snow peak, mechanical city). A dotted path connects the nodes. Clicking a node opens a level panel: Play / Continue / Replay / Explore mode, with ✓, coins and secrets per level.
- **Phone:** a vertical list of World cards (colour + status + progress bar + Continue). Tapping a card opens a level sheet. In landscape: a small map on the left and the cards on the right.
- **Status:** World 1 "playable"; World 2 "in development" (preview only, behind a local flag until ready); the rest "coming soon" (greyed out, no map revealed).
- **Progress:** **read** from the existing keys (`denai-save-v14`, `denai-profile-v1`, `denai-campaign-v1`, `denai-l3-campaign-v1`), with no migration. World 2 later uses `denai-w2-campaign-v1` (as the blueprint already decided). The map stores no new progress; only UI preferences, if needed.
- The existing "World Map" dialog (list of World 1 levels) is extended, not replaced, so the existing access flows stay the same.

## 7. Implementation risks (known)
1. **Collision changes** (stairs in 1-3, the arch in 1-1, the 1-2 ridge) mean every puzzle, secret and coin must be revalidated with real physics.
2. **Saves:** checkpoint IDs stay, but some positions move (1-2 `entry`). Old saves must restore to a safe place.
3. **Coins and achievements:** the 15/15/20 totals and the "15 syiling" achievement must stay the same, or migrate carefully.
4. **PlayFab leaderboard:** if the 1-1 route changes, old best times are no longer comparable. A new leaderboard version/season is needed. **The secret key is never in the client.**
5. **Camera:** new caves below (1-3 rows 33–35, 1-2 bank cave) need lower camera bounds; check on phones.
6. **Missing assets:** karst, dark cave tiles, ice. Without new art, World 2 and the snow World stay partial (see `ASSET-BIOME-MATRIX.md`).
7. **Level length:** the targets are estimates; they must be measured with real students before being claimed.
8. **Reference maps:** the Wild Adventure files are not in the repo, so this design uses principles from my earlier written interpretation, not a geometry analysis.
