# V10 master architecture — visual review blueprint

**Design only.** The playable V9.9 game is preserved. This proposal expands the world from the verified **4,300 × 1,300** to **8,400 × 1,600** world pixels without changing Chill Boy's movement constants. All V10 coordinates are candidates, not installed geometry. Source-derived kinematic checks pass; this is not a claim of Phaser playtesting.

## Review the three maps

1. [World topology](master-world-topology.png): progression, optional branches, landmarks and gate order; schematic distances.
2. [Gameplay blockout](master-gameplay-blockout.png): exact candidate terrain, surface IDs, ladders, mechanisms, checkpoints and routes. Inside the ruler, one image pixel equals one world pixel.
3. [Kenney composition](master-kenney-composition.png): the same geometry composed with imported tiles, original Chill Boy and real sprite assemblies. Dashed bridges show **solved states only**, not always-present floors.

For easier inspection: [A/B/C](review/composition-AB-C.png), [D/E](review/composition-D-E.png), [F/G](review/composition-F-G.png). The full-width PNGs are 8,640 × 2,220 including annotations; inspect at native scale for coordinates and pixel seams.

## Architectural story

A hillside neighbourhood depends on a mill, workshop and rooftop waterworks. The player restores the route through these connected places and reaches the river crossing. Terrain rises from garden to mill, changes to supported service decks, opens into an exposed rooftop route, then descends along a hill containing an accessible archive. The final river is visible before its controls. There are no mandatory moving-platform rides or new locomotion rules.

| Zone / candidate extent | Landmark and reason to exist | Route and recovery |
|---|---|---|
| A, x0–1404 | Garden tree and roomy crate courtyard; safe place to learn movement | Ground at y1296, one 108px gap, then 54px steps. Optional crate ledge. Missed gap returns to spawn until cp-a. |
| B, x1404–2916 | Gear mill beside a real ravine; transforms a function output into visible movement | Terraced banks y1134→972. Gate G1 is 324px. cp-b before controls. |
| C, upper x1512–1944, surface y810 | Sheltered café overlooking the mill; voluntary mapping practice and Oyen secret | Two ladders into/out of B, both before G1. Never required for any gate or main checkpoint. |
| D, x2916–4104 | Number-block workshop; material inputs make the machine's operation tangible | Broad bank, 324px G2, upper service-note ledge, safe composition rehearsal after the gate. |
| E, x4104–5670 | Roof pipe manifold; the workshop's service ladder reaches the waterworks | Timber surfaces y756/810/648, visible recovery shelf and ladder, 324px G3. No false dirt beneath upper decks. |
| F, x5670–7290 | Large tree on hill crest, archive shaft under timber walkway | 54px descending terrain steps, optional 324px ladder into cave, same ladder returns. cp-f at crest. |
| G, x7290–8400 | River and home door; destination pays off the repeated water motif | Safe near bank, cp-g, 378px G4; final two familiar operations extend bridge to exit x8316. |

The main route is **A → B → D → E → F → G**. C is spatially above B, not an eighth horizontal segment. Main gate sequence: gear → block → pipe → final. The crate branch, C, D's note ledge and F's cave cannot bypass these gates. Forty-one surfaces and seven ladders are specified in [proposed-world.json](proposed-world.json).

## Pacing and mechanic development

[Eighteen beats](gameplay-beats.md) include fourteen main moments and four optional ones. Main active-activity targets total **455–725 seconds (7:35–12:05)**; optional activities add **175–285 seconds (2:55–4:45)**. Travel, reading and retries add time. These are first-pass hypotheses requiring player testing, not measured completion times. Simply doubling running distance would add little: 8,400/280 is only 30 seconds at full speed.

The four-step structure spans the level: introduce a visible mapping at B; develop it with the gear and missing-input workshop; twist the established rule through pipe order and optional reversal; resolve it with the final bridge. Each interaction leaves evidence in the world. Safe cafés, the workshop demonstration and the hill overlook separate demanding tasks. [Mechanism specifications](mechanism-designs.md) describe controls, feedback and exact equations.

## Asset and geometry decisions

The composition uses the actual imported Kenney pack, not generated replacement art. [Asset architecture](asset-architecture.md) maps exact frame indices and separates sprites from required programming. SampleA/SampleB inform connected land masses, asymmetric tree clusters, thin timber surfaces and open sky; this does not copy their maps. The proposal intentionally has substantial hillside dirt where collision is solid, and sky beneath one-way service decks. The cave is a real open shaft, not a painted door on solid terrain.

The mill wheel is explicitly a **concept assembled from existing spike-like sprites**, not a claimed native gear asset. It needs a visual review before implementation. The maps are annotated plans, not fabricated game screenshots.

## Review package and limits

- [Technical verification and save migration](technical-verification.md), with source facts, calculations and future acceptance tests.
- Exact tables: [surfaces](proposed-surfaces.csv), [ladders](proposed-ladders.csv), [checkpoints](proposed-checkpoints.csv), [mechanisms](proposed-mechanisms.csv).
- [Research and curriculum scope](research-notes.md); original three machine questions remain intact.
- [Kinematic evidence](evidence/kinematic-checks.json), [atlas inspection](evidence/verified-atlas-contact-sheet.png), [generation summary](evidence/generation-summary.json).
- [Integrity verification](evidence/working-game-unchanged.json): all325 tracked source/asset/page files match their pre-planning hashes; no game files added. All local document links resolve.

Open implementation risks: engine collision timing, actual player learning time, narrow-screen pipe readability, assembled wheel appearance, checkpoint graph migration, and final bridge state persistence. These are explicitly future acceptance gates. No gameplay code, collision geometry, save data, assets or deployments are changed by this blueprint. Stop here for visual review.
