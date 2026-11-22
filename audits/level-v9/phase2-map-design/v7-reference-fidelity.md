# V9.2 — V7 Master-Map Fidelity Comparison

Comparing `docs/level-reference/v7-master-map.png` (the approved visual
target) against the actual live implementation (`src/level.js`, rendered
in `proposed-full-tilemap.png` and the earlier
`audits/level-v9/phase1-layout-repair/reference-vs-current-layout.png`).
The reference is treated as a visual target, not a collision diagram —
its drawn platform pixel-positions are not compared 1:1, only its
*spatial intent*.

| # | Criterion | Reference shows | Actual implementation | Deviation? |
|---|---|---|---|---|
| A | Overall silhouette | A rising-then-falling arc: ground start (A) → elevated town (B/C) → workshop (D) → rooftop peak (E) → descending hill (F) → river finish (G) | Matches: ground y=1100 (A) → tier2 y=980 (B/D) → tier3 y=820 (C) → tier4 y=660-740 (E, the highest point) → stepped descent to y=900→1100 (F) → ground (G) | **None** — confirmed by direct tier-height comparison. |
| B | Actual world topology | Seven connected zones, A–G left to right | Exactly seven zones, `ZONES` array, x0→4300 left to right | **None.** |
| C | Mandatory traversal route | Solid green arrow: A→B→(ladder)→D→(ladder)→E→(ladder)→F→G | Matches: `GROUND_RANGES`+`DECKS`+`LADDERS` connect in exactly this order; confirmed by `probe.py`'s own traversal | **None.** |
| D | Optional routes | Dashed line: B→C (café) and a short F cave branch | Matches: café (`cafe-deck`, reached via the B→C ladder, `yMax` disambiguated) and `cave-alcove` (reached via an optional ladder, explicitly "not on the main route" per its own code comment) | **None.** |
| E | Vertical tier changes | 4 implied tiers (ground/town/café-high/rooftop) | Exactly 4 tiers: y=1100/980/820/660-740 | **None** — V7's original implementation derivation already matched this reference precisely (documented in `src/level.js`'s own V7 comment block). |
| F | Machine/gate relationships | M1 beside a gate in D, M2 in E opening the path to F, M3 beside the final gate in G | Matches: `TERMINALS`/`GATES` pairing — `p1`→`workshop-gate` (D), `p2`→`rooftop-gate` (E→F), `p3`→`final-gate` (G) | **None.** |
| G | Checkpoint placement | A flag icon near each major waypoint: café, post-rooftop, pre-bridge | Matches: `CHECKPOINTS` = café dead-end, post-rooftop-gate, pre-final-gate | **None.** |
| H | Gap/jump difficulty | One clearly-drawn gap near the start (A), implied harder gaps near the rooftop | Matches: `FIRST_GAP` (A, 120px, the one tutorial gap) and the tighter real-jump test in B (confirmed in `probe.py`); every jump validated against the 96.6px rise ceiling | **None.** |
| I | Crate puzzle & optional ledge | **Not present** — the reference predates V9's crate mechanic entirely | New in V9, placed in Zone A per V9.1's own placement rationale | **Addition, not a deviation** — the reference never claimed to show it; V9.1 already confirmed it sits in a safe, non-mandatory pocket of Zone A. |
| J | Visible gameplay composition | Warm, illustrated, "finished game" look (full house/café/workshop/rooftop/cave/bridge illustrations) | Currently a mix of generic Kenney "New Platformer Pack" terrain + a few production sprites (machines/checkpoints/door), after V8.7 removed the Phase 8.5 architectural pass | **Significant, confirmed deviation** — this is the actual subject of V9.2: the reference's illustrated richness was never matched by Kenney-tile-only scenery, and the user's own request is to pursue a *consistent* Pixel Platformer look instead of trying to re-approach the reference's bespoke illustration style. |

## Conclusion

Topologically and mechanically, the live implementation already matches
the approved V7 reference closely — zones, tiers, route, optional
branches, machine/gate/checkpoint relationships, and jump difficulty all
line up with no confirmed deviation. The ONE real, confirmed gap is
**visual composition** (criterion J): the reference's illustrated
richness isn't present, and after V8.7's rollback of the architectural
scenery pass, the honest path forward — per this phase's own brief — is a
coherent Kenney Pixel Platformer identity, not an attempt to recreate the
reference's bespoke house/café/workshop illustrations with a different
asset family.
