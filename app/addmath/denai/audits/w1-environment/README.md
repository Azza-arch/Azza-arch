# World 1: environment overhaul (Phase A)

Branch `claude/denai-w1-environment`, based on `claude/denai-w2-slice` (not merged to `main`).
Visual changes only. Collision, physics, puzzles, saves, PlayFab, unlock order and World 2 are unchanged.

## Audit: defects found (before)
| # | Level | World position | Defect | Responsible code |
|---|---|---|---|---|
| 1 | 1-1, 1-2, 1-3 | every T4 tree; T7 (1-1 x 4455, 1-2 x 3024) | Branch beside a trunk tile with no stub on that side (detached branch). T7's branch deck at row 3 hung beside frame 96 (leaf tufts) | `environment.js` TRUNKS/BRANCHES |
| 2 | all | trees T5 and T7 | Frame 96 tufts read as loose leaf squares beside the trunk | `environment.js` TRUNKS |
| 3 | 1-1 | x 999 / 1107 (T4 × T3) | Overlapping crowns, two outlines crossing | `environment.js` buildWorld trees |
| 4 | 1-1 | x 4900 (fg T3) × x 4806 (T8) | Overlapping crowns | same |
| 5 | 1-1, 1-3 | T4 crown mask `##. / ### / .##` | Diagonal mask read as two half-crowns | `environment.js` CROWNS |
| 6 | 1-1 | treehouse x 4266–4700, y 918–1134 | Fence tiles stacked vertically on the wall colliders read as loose ladders; a crown tile (16) capped a post | `level.js` WALLS art |
| 7 | 1-3 | pipe x 2646–3240, y 1404–1566 | Vertical run drawn with end-flange tile 135 on every cell (caps every 54 units); first elbow was frame 94 rotated −90° drawn over a left-cap tile 132; intake overlapped the spring surface | `inverse-scene.js` placePipePath |
| 8 | 1-3 | creek x 378–486 | Waterfall columns, a floating crate block (frame 6) and open gaps under the creek | `inverse-scene.js` creek |
| 9 | 1-3 | chasm pool x 3240–3456 | Water body stopped at y 2088, leaving an open band above the floor (2106) | same |
| 10 | 1-2 | all water gaps | Second row drawn with surface frame 53, so two wave lines were stacked | `twin-scene.js` water |
| 11 | 1-2 | goal x 4698 | Finish was two floating colour bars, with no support | `twin-scene.js` |
| 12 | all | background | Far layer used Kenney's **snow** set (white/pale blue) above the **green** set band; two palettes 150 units apart did not relate. After removing it, only one flat band was left | `environment.js` parallax |
| 13 | 1-2, 1-3 | tree lists | One tree per area at regular intervals; identical T3 pair at 1-3 x 324/594 | scene tree lists |
| 14 | 1-3 | ruins x 702–2538 | "Stepped ruins" were plain rope-post scaffolding; weak identity | `inverse-scene.js` deck supports |
| 15 | 1-1 | goal x 5751 | Flag on a plinth with no gate (brief asked for a final gate) | `environment.js` buildWorld |

## What was corrected
- **Trees:** trunk frames re-mapped from the actual pixels (116 stub left, 138 stub right, 117 both, 136 plain, 137 root). T4 is now `[137,138,116]`, T7 is `[137,136,116,138,136,136]`, so its branch-deck row joins a right stub. Frame 96 is no longer used. T4 has a dome crown. New `treeJoinErrors()` checks every branch against its trunk stub: 0 errors. Crowns were respaced (1-1 x 963/1134, fg tree 4950). The browser check finds 0 crown overlaps in all three levels.
- **Groves:** 1-2 and 1-3 now have clusters of mixed sizes (pairs and an oak + pine), not one tree per area.
- **Pipe (1-3):** rebuilt from the real tiles: 115/133 bodies, 135 intake and outlet flanges, and the quarters of the round junction as true elbows (93 = right+down, 94 = left+down, 113 = up+right, 114 = up+left). Nothing is rotated or drawn twice. Route: spring surface (y 1566) → up → elbow 93 → 10 horizontal → elbow 94 → outlet 135 → waterfall → pool. The check shows 15 cells, 0 gaps.
- **Water:** each pool has one surface row plus a body (frame 73) down past the floor: 1-2 gaps, 1-3 creek and chasm.
- **Treehouse (1-1):** each wall collider is shown as one full-height post plus a single railing at deck level. Colliders are unchanged.
- **Landmarks:** 1-1 finish gate (posts on the plinth, plank lintel, pennants). 1-2 finish arch with "TAMAT" on the lintel. 1-3 exit gate with battlements and two banners. 1-3 ruin galleries stand on stone piers.
- **Background (green):** soft sky gradient. The bottom colour matches the band tiles' own pale-green sky after haze (#b0f0d2), so the far layer has no edge. Then a distant forest (same green set, haze 58 %, scroll 0.2) and the mid forest (scroll 0.5). `bgTheme: 'snow'` keeps the previous single pale band unchanged.

## Verification
- Collision bodies: **identical** to before in all three levels (27 / 14 / 16 bodies; `tests/w1-env-check.cjs` snapshot compare).
- Ladders: every top and bottom lands on a surface. Crown overlaps: 0. Tree joins: 0 errors. Pipe gaps: 0.
- Traversal (`tests/w1-traversal-check.cjs`): the player dropped on every checkpoint (6 + 6 + 5) lands on the expected surface. Save keys are unchanged: `denai-campaign-v1`, `denai-l3-campaign-v1`, `denai-profile-v1`, `denai-save-v14`. 0 page errors.
- Unit tests (inverse, twins, workshop, quadratic): pass.
- Parallax during real movement (D key, camera follow, 1-2): terrain moved 201 px, mid 100.5 px, far 40.2 px (ratios 1 / 0.5 / 0.2). The layers cover the view at both world ends.
- Desktop 1280×760 (zoom 4/3) and iPhone 13 landscape (zoom 2/3): screenshots in this folder. Before/after pairs use the same camera positions.

## Not fixed (unresolved)
1. 1-1 canopy walk (x 1242–1728): two identical deck-and-post frames side by side; still repetitive.
2. 1-3 ruins: three ladders close together (x 918, 1188, 1674). They are gameplay routes and were left as they are.
3. 1-2 x 3024: the canopy ladder runs up the front of the giant tree's trunk. It works, but reads as "ladder on trunk".
4. 1-3 area signs sit inside the soil band (existing style); not changed.
5. Large dirt cliffs (1-3 machine yard, 1-2 banks) are still plain dirt faces. There is no cave or ruin wall art in the packs to break them up without inventing tiles.
6. The mid forest band keeps Kenney's pale-green strip above its tree line (it is part of the tile); it reads as haze, not as an edge.
7. The 1-3 gate battlements are cut off at the top of the frame on a phone at the gate court (camera framing, not changed).
8. The old Python smoke tests (`tests/*-smoke.py`) were not run: Python Playwright is not installed here, and they target another local URL.
