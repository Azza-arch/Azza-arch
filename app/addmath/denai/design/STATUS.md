# DENAI status (16 Nov 2026)

| Category | World / level | Where | Notes |
|---|---|---|---|
| **Playable (live)** | World 1: 1-1 Jejak Taman Fungsi, 1-2 Jambatan Berkembar, 1-3 Gerbang Songsang | `main` (merged, 9cf38f9); haziqbuilds.com/denai | separate progress, saves and puzzles; PlayFab leaderboard for 1-1 |
| **Playable, branch not merged** | World 1 Phase A environment pass (trees, pipes, water, background, finish gates) | branch `claude/denai-w1-environment` @ ec2aa69 | visual only; collision identical; not live |
| **Prototype** | World 2 · 2-1 Station A (Pancur Lengkung, parameter a) | branch `claude/denai-w2-slice`, page `lab-w2.html` (noindex, no menu link) | test room; awaiting the owner's review of the maths, collision and game feel |
| **Blueprint only** | World 1 V2 redesign (1-1, 1-2, 1-3); full 2-1 map; transitions; world map (pixel art + phone cards) | branch `claude/denai-map-masterplan-v2` (`design/`) | approved as the design basis; game-code implementation **not approved** |
| **Design document only** | World 2 · 2-2 Lembah Puncak, 2-3 Gerbang Parabola | `WORLD-2-BLUEPRINT.md` | no blueprint geometry yet |
| **Not built (planned)** | World 3 Kilang & Lombong (Systems of Equations), World 4 Highland Farms (Indices, Surds & Logarithms) | `WORLD-MAP-MASTERPLAN.md` | do not implement yet |
| **Proposed theme (not final)** | Coast & mangrove, canopy, caves, fantasy snowy highlands, mechanical city | `WORLD-MAP-MASTERPLAN.md` §3 | chapter mapping not final; snow/coast/cave need new art |

Branch chain (none merged into `main` beyond the playable World 1): `main` → `claude/denai-master-plan` → `claude/denai-w2-slice` → `claude/denai-w1-environment` → `claude/denai-map-masterplan-v2`.

World map V2.2 (`blueprints/world-map-pixel.png`): layered layout inspired by the Kenney samples (overhanging cliffs, a spring into a pool, a slime pool with a pipe and a girder bridge, a crane, a greenhouse, a mushroom platform). V2.1: the dashed diagram line has been replaced by a route that follows the ground (Kenney dots on top of surfaces, plank bridges, ladders, a girder walkway). The ground uses the surface pieces (not the floating-slab row), and an outline is drawn only on the exposed outer sides, with no lines inside the ground; the walkway is continuous; scaffold legs and chimneys stand on the ground. Comparison: `blueprints/world-map-before-after.jpg`, `blueprints/world-map-fix-crop.jpg`.
