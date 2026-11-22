# V11.1 asset frame map — Phase 1 polish and Zone D

Source of truth: audits/level-v11/asset-first-review/catalog-180.csv, catalog-180.json, asset-lock.json, and app/addmath/rooftop/assets/manifest.json. Atlas frames remain the only source for tile artwork; collision comes from code.

| Frame / source | Catalog role | V11 use | Collision / notes |
|---|---|---|---|
| 4, 20–23, 120–121, 141–143 / atlas | Dirt, grass top and exposed/bottom edges | A–D solid terrain | Separate static Arcade rectangles; gap edges use exposed terrain edge frames |
| 9 / kpp_crate PNG and atlas | Crate | A pushable crate; D number-block rack; D input socket | A crate has dynamic 48×48 body; D rack blocks are selectable digit overlays; socket is decorative |
| 48–50 / atlas | Wood platform left, middle, right | C deck, A reward ledge, B lift, D number span, D rack/service decks | One-way bodies are separate; B/D animated spans get collision only at safe final height |
| 64 / atlas | Lever | B lift control | Visual only; existing terminal selects f(3)=7 |
| 67 / atlas | Blue gem | C optional mapping discovery | Marker only; no new gear meaning |
| 71 / atlas | Ladder segment | C entry/return and D optional service route | Sensor ladder links D floor y972 to deck y738 |
| 84–85 / atlas | Direction / blank sign | A direction marker; C and D readout boards | No permanent instructional labels; live output is short and proximity-scoped |
| 89–92 / atlas | Timber posts and connectors | C supports; shortened B lift supports; D rack/service supports | Decorative only. Four B post tiles and eighteen guide-rail tiles removed; no floating support was added |
| 107 / atlas | Button marker | Seven B actuator steps only | D uses no actuator markers; frame107 remains reserved for B |
| 111–112 / atlas | Checkpoint flag states | A–D checkpoint visuals | Sensor state is saved separately |
| 124 / atlas | Small plant | Sparse A–D ground foliage | Decorative only |
| 148–149 / atlas | Pressure plate states | A crate puzzle | Existing activation and reward logic unchanged |
| 160–164 / atlas | Digit tiles 0–4 | D rack blocks 2, 3, 4 | Prior R07 preview instances moved into the real R08 rack; 164 is digit 4 |
| 136 and canopy 17–19, 37–39, 57–59 / individual PNGs | Tree trunk/canopy | A start landmark | Original asset set |
| kpp_coin PNG | Coin | Existing A/B/C plus D optional service reward | Pickup sensor and save IDs |
| Existing Chill Boy idle/run/jump/fall PNG sequences | Character animation | Main menu backdrop and gameplay | Existing animations; reduced-motion behavior remains active |

No source-pack sprite files or atlas cells were added or modified. No gear, hazard, enemy, cloud, or building façade was created. D uses a simple supported rack, input socket, display, and timber span instead of a fabricated workshop façade.

## Visual instance delta for this pass

- B removed 4 frame89 fixed-post tiles and all 18 frame89 guide-rail tiles. Remaining frame89 B posts (4) and the frame48–50 header stay rooted on the two real banks. The moving bridge uses wood frames48–50 and keeps its existing animation/collision timing.
- D uses frame9 for three digit-block bases and one input socket; digit frames162, 163 and 164 show 2, 3 and 4. These replace the old R07 preview instances; no source frame was introduced.
- D adds 13 wood deck tiles from frames48–50, five ladder segments from frame71, two boards from frame85, four rooted post tiles from frame89, two checkpoint flags from frames111–112, two plants from frame124, and one existing kpp_coin pickup. Five D actuator-mark instances are not present in the final build.
- No atlas PNG or individual Kenney source file was added, removed or edited.



## Current E correction and Phase 4 F/G

Current E inlet elbow is frame94 at5022,783; its vertical riser frames95/115/115/135 share x5022 through y999. Outlet x5130 uses frame135 and elbow93; the lever remains5238,918. Earlier reservoir-cradle coordinate descriptions are superseded by `../waterworks-reconstruction/latest-connection-review.md` and actual source.

F/G reuse the verified180-frame Kenney catalog: grass tops20–23, dirt4/5 and exposed sides120/121, base141–143; timber48–50 and posts89; ladders71; sign85; plants124; water surface33 and interior73; lever64; checkpoint111/112; destination door130/150 and flag110; optional gem67. Tree uses the existing verified sceneryTree helper. No atlas image or character artwork was edited, and no fake house/gear/cave arch was added.
