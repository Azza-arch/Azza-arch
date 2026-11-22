# Actual asset use by zone

All indices below reference the unchanged 360×162 Base-pack packed atlas: 20 columns, 18px frames, nearest filtering, normally enlarged to 54px. See the [verified contact sheet](../master-architecture/evidence/verified-atlas-contact-sheet.png). Sprite poses are static assets; all interactions, flow, collision and transitions are programmed in V10.

| Zone | Actual frames / architecture |
|---|---|
| A garden | Grass 21/22/23 with 22 interiors, dirt 4/5 and exposed side pieces; tree canopy 17–19/37–39/57–59 and trunks 136/137; small plants 124/128; crate 47; low switch states; timber optional ledge 48/49/50. |
| B mill | Timber 48–50, posts 89 and shaft 91; lever 64/65/66; hub 157 with rotated 68 segments forms the programmed wheel. Signs 84/85; checkpoint 111/112. No claim of a native animated gear sprite. |
| C café | Red canopy/platform pieces 12/13/15, timber posts and deck, sign/readout, tree and coin 151. Original Chill Boy remains the player. Oyen is a preserved discovery represented by a sign, not a fabricated cat sprite. |
| D workshop | Timber frame 89/90/92 and 48–50; housing 130/150; token box 9 with actual digits 162/163/164; note marker 86/84; actual ladder 71. Primer uses the same connected fittings as E. |
| E waterworks | Upper elbows 93/94, horizontal manifold 133, vertical fittings 95/115/135; bounded water 34/35/74/75, active outlet 73; timber service decks, supports, ladder 71 and plants. Numbers travelling through stages are code text; water activation is code alpha/state, not a fabricated native animation. |
| F hill/cave | Connected grass/dirt surfaces; trees, plant 124; timber cave supports and ladder 71; gems 67 and crate 47; inverse sign 86. Recessed background repeats real borderless earth 4 at low alpha over a dark lighting plane. This layer has no collision and no grass lip. No gray-rock tiles are invented. |
| G river/home | River surface 33 once, interior 73 below; winch hub 157 and shaft 91; latch states 107/108; posts 69 and timber deployed span; checkpoint 111/112; door 130/150; red roof pieces 12/13/15. |

Ground geometry supplies collision separately from sprites. Trees, timber supports, machine housings, pipe fittings and background cave shading never become hidden obstacles. Ladders have explicit shafts/endpoints. Gate planks gain collision only when deployment ends. Existing Kenney outlines remain; continuous grass uses interior frame 22 rather than repeated corner frames.
