# Actual Kenney asset architecture

Inspected local source: `app/addmath/rooftop/assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png`, **360×162**,20 columns×9 rows of18×18 cells. File indices match `Tiles/tile_0000.png` through `tile_0179.png`. Frame i is `(18×(i mod20),18×floor(i/20),18,18)`. All180 cells were compared with individual PNGs by alpha and visible RGB; some transparent pixels retain differing invisible RGB, which is not a rendering defect. See [numbered contact sheet](evidence/verified-atlas-contact-sheet.png).

The imported licence identifies Kenney Pixel Platformer1.2, CC0. Keep original licence/provenance with any future implementation. Existing original Chill Boy remains a separate asset family; no Kenney character replaces him.

| Role | Actual frame indices | Proposed use / important distinction |
|---|---|---|
| Grass terrain |20 standalone sides,21 left,22 middle,23 right | Continuous solid top;22 for interiors. Do not repeat20 across a floor. |
| Dirt |4/5 plain interior;24/25 inner upper corner details;120–123 side variants;140–143 bottoms | Fill only tabled solid volumes. Side/corner choices follow the actual exposed edge. |
| Timber |48 left,49 middle,50 right | Thin one-way decks; collision is separately programmed. |
| Trees |17–19,37–39,57–59 canopy grid;136/137 trunk;96/97/98/99 branches/leaves | Assemble connected tree forms, background only. Existing trees are preserved in the live game. |
| Vegetation |124/125 cactus-like plants,126 small conifer,127 cactus,128 mushroom | Sparse ground accents; do not call every small sprite a flower. |
| Signs |84–88,129 | Wayfinding and interaction anchors; text supplied by UI. |
| Water |33 surface;53 alternate open-bottom surface;73 interior;34/35,54/55,74/75 bounded column pieces | River surface once,73 below; repeated wave rows are unintended interior repetition. No swimming physics supplied. |
| Pipes |93/94 upper elbows,113/114 lower elbows;95/115/135 vertical fittings;132/133/134 horizontal fittings | Build fixed manifolds; numbers/flow and function order require code.131 is a narrow vertical bar, not a horizontal pipe. |
| Ladders |51 short segment,71 repeat segment | Visual only; shaft snap/velocity and endpoints remain code. |
| Crates / key |9 gold box,26 diagonal wooden box,47 wooden crate,27 key | A crate uses existing physics; number tokens are selected objects. No new mandatory key gate. |
| Doors |130 upper,150 lower | Machine housing/exit reference; no native open/close animation assumed. |
| Levers / switches |64/65/66 three lever poses;107/108 button-like states;148/149 low switch-like art | Static pose selection can communicate state; interaction and transitions must be programmed. |
| Checkpoints |110 post base,111/112 flag poses | Stable checkpoint state is game logic; flags alone do nothing. |
| Gear-like assembly |68 spike-like segment,157 small hub,91 shaft | No dedicated complete gear found. Rotated sprite assembly is a concept, explicitly labelled in maps. |
| Collectibles / hazards |151 coin,152 edge pose,67 gem;68 spikes,145 flame-like art | Static sprites are available; collision, collection and animation timing are not. Proposed level adds no enemy/combat mechanics. |
| Digits |160–169 outlined0–9,170–179 alternate0–9 | Token labels. Equations require readable text/operators beyond these sprites. |
| Background |`Tiles/Backgrounds/tile_0015.png`,24×24 | Distant low-contrast scenery; never collision. |

## Pixel and seam policy

World pitch is54px, an integer3× enlargement of18px art. Nearest-neighbour scaling, integer camera rounding and atlas coordinates prevent texture bleeding. Where a candidate ledge ends off-grid, crop the final tile to the actual surface width; never stretch a partial tile to imply more collision. Thin timber uses an18px visual band; inspect this stylisation at native scale before implementing.

The native dark top border and grass teeth are intended Kenney outlines. A repeated dark vertical line can instead come from using an edge tile as an interior. The generator uses22 on continuous grass interiors and dirt interiors below. Do not erase outlines with flat rectangles or invent replacement tiles. For implementation, inspect a native-scale camera capture and the actual source pixels before treating any dark line as a GPU seam.

## SampleA / SampleB composition comparison

Local references: `audits/level-v9/world-composition-v9-9/SampleA.png` and `SampleB.png`. Their useful composition principles are connected irregular banks, differentiated timber spans, trees assembled from consistent tile families, uncluttered sky and visible affordances. The proposed A/B stair silhouette and F hillside adopt those principles. E deliberately uses thin roof/service platforms with visible ladders rather than rectangular dirt towers. The river and mill share a waterworks theme; the café awning marks a safe detour.

The blueprint is less densely dressed than a final scene so collision and route remain reviewable. Roof fascia, small props and background density may be tuned later without changing the tabled surfaces. Decorative support posts may only terminate on an actual support; they must not suggest an accessible platform or cover a gate's void. The wheel assembly needs art review, but no new art pack or generated sprite is assumed.
