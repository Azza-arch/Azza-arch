# V9.7 — Terrain Role Inventory (World-Wide)

Builds directly on `audits/level-v9/terrain-grammar-fix/verified-tile-dictionary.md`
(still the authoritative per-tile source list — not reproduced here). This
file records which role each terrain STRUCTURE plays, zone by zone, now
that the same renderer covers all of A–G.

| Zone | Structure | Role | Treatment |
|---|---|---|---|
| A/B/C | ground spans `[0,420]`, `[540,1300]` | Solid ground | Full `kppLandMassFill()`, opaque (`passThrough=false`) |
| A/B/C | `town-walk-1/2`, `cafe-deck` | Solid land mass (one-way collision, visually a connected terrace) | Full fill, dimmed (`passThrough=true`) + marker line at the true surface |
| A | crate-platform ledge | Floating bonus platform | Top row + 1 fill row using the isolated-bordered tile, dimmed while inactive |
| D | ground span `[1600,1800]` | Solid ground | Same as A/B/C |
| D | `workshop-approach` | Solid land mass | Same as A/B/C decks |
| D | `workshop-gate` | Bridge (locked/unlocked) | Locked: broken-plank stubs (`platform_wood_left/right`, unchanged — see `remaining-visual-issues.md`); unlocked: `kpp_bridge_left/mid/right` |
| E | `roof-entry`, `roof-laundry`, `roof-m2` | Suspended / one-way platform (`supports:false`) | Top row ONLY, no fill — correctly thin and floating |
| E | `rooftop-gate` | Bridge | Same bridge tiles as D |
| F | `f-step1`, `f-step2` | Solid land mass (stepped descent) | Full fill, dimmed, WITH per-column clipping against `cave-alcove` |
| F | `cave-alcove` | Cave/alcove (a land mass itself, but recessed — reached by descending past the two decks above) | Full fill down to the real floor (1100) — nothing sits below it to clip against |
| F | the ladder shaft between `f-step1`/`f-step2` and `cave-alcove` | Open/passable — deliberately NOT filled | See the clipping mechanism in `world-implementation-report.md` |
| G | ground spans `[2880,3700]`, `[4000,4300]` | Solid ground | Same as A/B/C |
| G | the gap between them (the river) | Water | `riverBand()` — unchanged, already blue since V9.4 |
| G | `final-gate` | Bridge | Same bridge tiles as D/E |
| all zones | ladders | Vertical connector | `kpp_ladder` (tile 71), tiled at 54px steps |
| decorative, all zones | `caveMouth()`, small ground props (`plant_bush`, `water_tank_stand`, etc.) | Decorative non-collision | Unchanged from V8.7/V9.4 — still `this.add.image` only, no physics body |

## Bridge role — newly verified

`kpp_bridge_left`/`kpp_bridge_mid`/`kpp_bridge_right` (tiles 47/48/50,
identified from the same contact sheet used for every other role — see
`audits/level-v9/terrain-grammar-fix/terrain-roles-contact-sheet.png`)
replace the old 64px `kenney_bridge` in `gateArt()`, at the consistent
54px integer scale. Confirmed via `gate-solved-bridge.png`: the bridge
only appears once a gate is actually solved (tested via the legitimate
save/continue path, not a shortcut) — before that, the gap is open water/
air with no visible crossing, matching "the bridge must not look walkable
before it is activated."

## Gaps carried forward (not re-litigated here — see the terrain-grammar
## fix's own dictionary for full detail)

No bridge/cave/water tile roles needed inventing new sprites this phase —
every role above reuses tiles already registered in V9.6/the terrain-
grammar fix, or the 3 new bridge tiles registered this phase (88 manifest
entries total now, up from 85).
