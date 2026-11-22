# Kenney frame verification

Reference: the approved 180-frame catalog and original `tilemap_packed.png` (360 ? 162 px; 18 ? 18 px frames). No new artwork was added.

| Frame | Count / use in Zone E |
|---:|---|
| 33 | Three shallow-basin water tiles; the animated marker also uses frame 33 |
| 34, 35, 74, 75 | One each; source cistern only |
| 48, 49, 50 | Two caps, ten middles, two ends across the supported low rack and crossing |
| 64 | One composition output lever on the control bank |
| 71 | Ladder tiles generated from the E cave and recovery ladders |
| 85 | Two compact F/G station boards |
| 89 | Three rooted two-tile support posts |
| 93 | One outlet elbow, joining the basin riser to the rightward control run |
| 94 | One inlet elbow, turning the elevated run down into the basin |
| 95, 115, 135 | One inlet top, two inlet middle segments, two capped riser ends (inlet and outlet) |
| 133, 134 | Nine straight source/inlet pieces and two run ends/control pieces |
| 9, 124 | One crate and six plants for small route decoration |
| 111, 112 | Existing checkpoint posts; checkpoint IDs and behavior are unchanged |

The inlet elbow at tile origin x=5022 exits downward on centerline x=5049. Its vertical riser begins at x=5022, so the sprites meet exactly. The basin water spans x=5022?5184 and links that inlet to the opposite outlet riser at x=5130. Counts and placements are itemized in `asset-frame-inventory.csv`.
