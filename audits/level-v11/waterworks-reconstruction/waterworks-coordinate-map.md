# Zone E coordinate and collision map

World units are pixels. Surface `y` is the standing height. Decorative pipes never provide player collision.

| Element | x | y / feet | width | Collision / role |
|---|---:|---:|---:|---|
| R11 entry and checkpoint | 4104 | 972 | 162 | Solid; checkpoint center 4122 |
| Natural step | 4266 | 918 | 108 | Solid; 54 px rise |
| Source terrace | 4374 | 864 | 216 | Solid; source supported here |
| Cave walkway | 4590 | 972 | 270 | One-way; climb-through from ladder |
| Lower recovery floor | 4590 | 1188 | 270 | Solid; reward at (4644,1158) |
| West pool bank | 4860 | 972 | 162 | Solid |
| Recessed pool floor | 5022 | 1026 | 162 | Solid; 54 px below banks |
| Control bank | 5184 | 972 | 108 | Solid; terminal center x=5238 |
| Water crossing | 5292 | 972 | 216 | Collider installed only after bridge stops |
| Far bank | 5508 | 972 | 142 | Solid; checkpoint x=5598 after solve |

The low pipe rack is at y=783 with a frame-94 elbow at (5022,783). The elbow's bottom-center outlet aligns with the inlet riser at tile x=5022; the riser centerline is x=5049 and spans y=837-1053. The basin has three frame-33 water tiles at x=5022, 5076, and 5130, initially at y=999 and rising to y=972 when solved. The outlet riser at (5130,972) is within the basin and meets frame 93 at (5130,918); frame 93 turns toward frame 134 at (5184,918), then the frame-64 control at x=5238.

The low support beam spans x=4482-5022 at y=846. Rooted posts stand at x=4536, 4752, and 4968 from y=864 to 972. The cave ladder center is x=4806 from y=972 to 1188. The crossing remains a separate animated one-way platform at x=5292, parked y=1188 and active y=972.
