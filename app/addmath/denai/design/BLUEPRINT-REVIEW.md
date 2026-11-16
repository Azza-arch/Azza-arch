# Final blueprint review (before → after), V2

For the owner's review before implementation is approved. No game code has been changed.
Images: `blueprints/w1-l1.png`, `w1-l2.png`, `w1-l3.png` (top panel = current geometry from code, bottom panel = proposal),
`w1-transitions.png`, `w2-l1.png`, `world-map-pixel.png` (final world map, pixel art), `world-select.png` (UI + phone card list).

## 1. Summary by level
| | 1-1 before | 1-1 after | 1-2 before | 1-2 after | 1-3 before | 1-3 after |
|---|---|---|---|---|---|---|
| Width | 110 tiles | 110 (unchanged) | 90 | 90 (unchanged) | 104 × 39 | 104 × 39 (unchanged) |
| Silhouette | flat blocks, one dip | hill, stone arch over a tunnel, log pile, island | flat blocks + water slots | descending ridge, island + cave, dam | flat blocks + wooden scaffolding | stone stair tower, aqueduct, chamber + cave |
| Optional routes | 3 | 5 (P1–P5) | 2 | 4 (P1–P4) | 2 | 5 (P1–P5) |
| Return loops | 0 | 3 (G1–G3) | 0 | 2 (G1–G2) | 0 | 2 (G1–G2) |
| Ladders | 2 | 4 (each in a different context) | 3 | 4 | **5 side by side** | **2** |
| Secrets | 2 | 3 (+1 bonus) | 2 | 3 (+1 bonus) | 3 | 5 (+2 bonus) |
| Maths (main / optional) | 1 / 0 | 1 / 1 sawmill | 2 / 0 | 2 / 1 ticket | 1 / 0 | 1 / 1 thermometer |
| Non-maths interactions | crate, probe | + crane, veranda note, rope bridge | — | waterwheel, floodgate, rope bridge, marker | — | valve, aqueduct, 2 pits, gate |
| Checkpoints | 6 | 6 (same IDs, same positions) | 6 | 6 (`entry` moves to the ridge) | 5 | 5 (same IDs) |
| Target duration (est.) | ≈ 5–8 min | 9–12 min | ≈ 6–9 | 12–16 | ≈ 7–10 | 15–20 |

Durations are **estimates** (not measured with players). Extra time comes from activities (loops, optional maths, caves), not from width.

## 2. Route connections (checked against the design data)
- Main routes for all 4 maps: every jump rises ≤ 1.5 tiles and spans ≤ 3 tiles (`route-check.json`). This is a design check, not a real physics test.
- Every optional route **comes back** to the main route (the end point of each P# sits on a main-route surface or on a G# loop).
- 1-3: the main route now **has to** go up the tower (valve), so vertical exploration is meaningful; the lower courtyard is the return route.
- 1-1 P4 and 1-3 P3/P4 use already-existing pits/gaps, so no new hazard is introduced on the main route.

## 3. Implementation risks (ranked)
| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | Collision changes (1-3 stairs, 1-1 arch, 1-2 ridge, branch wall) | puzzles/secrets/coins not reachable | real browser test per area; snapshot comparison of collision bodies (tool already exists in `tests/w1-env-check.cjs`) |
| 2 | Old 1-1 leaderboard times not comparable | unfair ranking | `denai_l1_time_v2` + "Klasik v1" tab; never delete |
| 3 | Old saves at checkpoints whose position changes | player spawns in the wrong place | same ID, new position, restore validated; 1-3 "valve" defaults to open for old saves |
| 4 | Collectible totals and achievements | old achievements change | new secrets marked "bonus", outside the old totals |
| 5 | Cameras for spaces below (1-3 rows 33–35, 1-2 cave) | camera reveals secrets early / cuts the view | separate camera bounds per area; phone check |
| 6 | Wrong turns (R# in each blueprint) | players get lost | signs, water arrows, visible ladders; already listed per level |
| 7 | Karst/cave/ice art not available | World 2 & snow incomplete | see `ASSET-BIOME-MATRIX.md`; commission before 2-2 |
| 8 | Wild Adventure references not in the repo | design principles only, no geometry analysis | upload them again if analysis is needed |

## 4. World 2-1
Kept as a **blueprint only** (`w2-l1.png`). No full map will be built until Station A has been assessed for maths, collision and game feel by the owner.
