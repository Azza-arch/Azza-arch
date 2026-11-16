# DENAI · Kenney Pixel Platformer asset audit (Game Feel V2)

Source checked: `assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png` (360×162 px,
**18 px frames, 20 columns × 9 rows = 180 frames**, loaded as `kpp_terrain_atlas`, NEAREST
filtering), `tilemap-characters_packed.png` (216×72 px, 24 px, 9×3 = 27 frames, **not loaded**),
`tilemap-backgrounds_packed.png` (24 px, `kpp_bg_atlas`) and 33 single tiles in `assets/manifest.json`.
Frame index = row × 20 + column (row/column from 0). Pixel coordinates = (column × 18, row × 18).

"Used" was verified two ways on 2026-11-16: a runtime hook recorded every texture/frame set on
an Image/Sprite/TileSprite and every animation frame while 1-1, 1-2 and 1-3 were built (81
atlas frames), plus frames referenced only on interaction paths in source (lever 66, pressed
button 149) and the manifest single tiles. Total in use before this pass: **89 of 180**.

## Animation-capable sets (real frames only)

| Set | Frames | Real frames | Notes |
|---|---|---|---|
| Coin | 151 face, 152 edge | 2 | The sheet has no full rotation. Face↔edge reads as a turn/glint. |
| Checkpoint flag | 111 down, 112 up | 2 | State pair, not a loop. |
| Lever | 64 left, 65 middle, 66 right | 3 | Real 3-step throw. |
| Button / plate | 148 up, 149 pressed | 2 | State pair. |
| Spring | 107 compressed, 108 extended | 2 | State pair. |
| Water surface | 33 / 53 | 2 | Already alternated every 520 ms in 1-1/1-2. |
| Hearts | 44 full, 45 half, 46 empty | 3 | HUD states, not animation. |
| Question / coin blocks | 10, 11 (gold), 30, 31 (used) | — | Bump-block states. |
| Door | 130 top + 150 bottom (closed) | 1 state | **No open-door frame exists.** |

## Matrix

| Asset | Frame(s) (col,row) | Use before V2 | Frames | Proposed use | Benefit | Cost | When |
|---|---|---|---|---|---|---|---|
| Coin face | 151 (11,7) | `kpp_coin` single image, all levels | 2 with 152 | Idle turn | Coins feel alive, read as collectible | Low | **Now (done)** |
| Coin edge | 152 (12,7) | unused | — | Turn frame + pickup ghost | Same | Low | **Now (done)** |
| Flag | 111/112 (11–12,5) | checkpoints (spring+sparks in 1-1 only) | 2 | Same spring/sparks/chime in 1-2, 1-3 | Clear save moment everywhere | Low | **Now (done)** |
| Plank deck | 48/49/50 (8–10,2) | bridges | 1 | Planks drop in on open (1-2, 1-3) | Bridge "construction" readable | Low | **Now (done)** |
| Sign blank | 86 (6,4) | 1-1 house, 1-1 exit | 1 | 1-2 entry + secret route boards | Replaces floating text boxes | Low | **Now (done)** |
| Sign arrows | 84 ← (4,4), 85 → (5,4) | 85 at 1-1 exit | 1 | 84 for return paths after detours | Wayfinding | Low | Later, per level redesign |
| Big arrow boards | 87 ←, 88 → (7–8,4) | unused | 1 | World-to-world exits | Strong landmark | Low | Later |
| Digits small | 160–169 (0–9,8) | unused | — | Checkpoint numbers, small counters | Pixel-consistent numbers | Medium | Later |
| Digits large | 170–179 (10–19,8) | unused | — | Seal labels 13/7/15 (1-3), machine output readouts | Replaces Arial labels on machines | Medium | Next pass |
| Symbols | 157 `.`, 158 `x`, 159 `%` | unused | — | Decimals / multiplier badges | — | — | Only with digits |
| — | no `+ − = ( ) /` glyphs | — | — | **Equations stay as readable text** | Mathematical clarity | — | Rule |
| Hearts | 44/45/46 (4–6,2) | unused | 3 | None now (see Health) | — | — | Not planned |
| Key | 27 (7,1) | unused | 1 | Optional key → locked block 28 for an existing optional detour | Exploration reward | Medium | Later, only where a route already exists |
| Locked block | 28 (8,1) | unused | 1 | Pairs with key 27 | — | Medium | Later |
| Question/coin block | 10, 11 (10–11,0) | unused | 1 each | Bonus coin blocks in future worlds | Reward | Medium | Later (new worlds) |
| Brown blocks | 30 (10,1); 31 used | 30 unused | 1 | Spent-block state after 10/11 | — | Low | With 10/11 |
| Lever | 64/65/66 (4–6,3) | sawmill jumps 64→66 (skips 65); river lever rotates one image | 3 | Real 64→65→66 throw | Crisper pixel motion | Low | Next pass |
| Button | 148/149 (8–9,7) | crate plate | 2 | — | already used | — | — |
| Spring | 107/108 (7–8,5) | unused | 2 | Only if a level needs a bounce pad | Movement verb | High (physics) | Not now |
| Spikes | 68 (8,3) | unused | 1 | None (no damage system) | — | — | Not planned |
| Gem | 67 (7,3) | 1-1 gem collectible | 1 | — | — | — | — |
| Snow ground | 80–83, 100–103, 153–156 | unused | 1 | Snow world | Biome | Low | Future snow world |
| Snowman / snow plant | 145, 144 | unused | 1 | Snow world props | — | Low | Future |
| Cactus | 127 (7,6) | unused | 1 | Desert biome | — | Low | Future |
| Mushroom tops (red) | 12–15 (12–15,0) | unused | 1 | Bounce caps / props | — | Low | Future |
| Water deep / falls | 34, 35, 54, 55, 74, 75 | unused (33/53/73 used) | 1 | Waterfalls in later worlds | — | Low | Future |
| Pipes | 113, 114, 132, 134, 95 | partly (93/94/115/133/135 used) | 1 | Industrial world | — | Low | Future (World 3) |
| Platforms | 146, 147 | unused | 1 | Thin platforms | — | Low | Future |
| Fence | 105/106 | used | — | — | — | — | — |
| Characters sheet | 0–26 (24 px) | not loaded | aliens 2 frames each, enemies 2–3 | No enemies in this phase | — | — | Not now |

Remaining unused frames (outside the rows above, mostly duplicate terrain/edge variants):
0, 20, 24, 25, 32, 40, 52, 60, 70, 72, 96, 104, 109, 110, 118, 120, 122, 131, 139, 140.

## Health / hearts feasibility

DENAI has no damage: falling into water or off the world calls `respawn()` back to the last
checkpoint immediately, with no lives, invulnerability frames or penalty. There are no enemies or
spikes. Wrong mathematical answers only give soft feedback and can be retried. A heart system
would add punishment without a meaningful physical hazard, so **no health system is proposed**.
Hearts 44–46 stay available if a future world introduces real hazards; they must never be
deducted for maths.

## Doors and exits

Exits already complete automatically once their mission is done (RC1): 1-1 plinth, 1-2 finish
arch, 1-3 sealed gate. The sheet's door (130 + 150) has **no open frame**, so a door-opening
animation would have to be faked; it is not used for exits. 1-3's gate shows locked → ready via
its three seals (now with a pop as each one lights) and opens via the exit bridge (planks drop in).
