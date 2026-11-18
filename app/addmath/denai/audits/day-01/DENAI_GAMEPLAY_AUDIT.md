# DENAI — Gameplay Audit (Day 01)

Method: code reading (`core/player-motion.js`, `src/level.js MOTION`, level data), today's keyboard playthroughs of 1-1/1-2/1-3, the journey script on 4 viewports, and frame-by-frame captures made for the trailer (same build). Coordinates are world units (1 tile = 54).

## A. Character
| Item | Finding | Verdict |
|---|---|---|
| Movement | `speed 280`, `acceleration 2100` (top speed in ≈0.13 s), `braking 2500` (stop in ≈0.11 s) | Responsive, platformer-grade |
| Jump | `jump 520`, gravity 1400 → apex ≈ 97 units (1.8 tiles); `coyote 110 ms`, `buffer 130 ms` | Good fundamentals |
| Collision | Bridge decks sampled every frame in playthroughs: feet 1242/1242 (1-1), stones 1701/1701 (1-3) — no snagging | OK |
| Interaction | Single context key E / "Guna" touch button, prompt shown in world (`setWorldPrompt`) | OK, consistent |
| Input lock | `scene.uiLocks` blocks movement during dialogue/Journal/store (V4) | OK |
| **Animations** | Frames available: idle 12, run 10, **jump 1, fall 1**; **no climb, land, push, interact, celebrate, hurt** frames (`assets/chill-boy/`) | **Weak (P2)** — climbing ladders reuses idle/run; landing has particles only |
| Bot evidence | In 1-3 the start route (creek, x≈450–750, y 1728→1512) killed a "run + jump when blocked" bot repeatedly; a human can pass, but the first hazard of 1-3 arrives within 2 s of spawn with no telegraph | P1 to review |

## B. Camera
| Item | Finding |
|---|---|
| Zoom | `applyResponsiveZoom()` (`game.js`) snaps to 1/3 steps (1/6 on frames < 420 px). Measured today: desktop 1280×720 → 1.333 (player 80 px); iPhone landscape 342 px → 0.667 (40 px); Android with URL bar 262 px → 0.5 (30 px, was 20 px before PR #16); iPhone portrait 664 px → 1.0 (60 px) |
| Follow | Player held low in frame (`followOffsetY = 16 %` of view), look-ahead −85 x |
| Portrait | Visible world only ≈ 324 units wide at 540×960 CSS: in 1-3 the meter reading (9 / 13) and the lever are often not on screen at the same time; feedback relies on the "Bacaan 13 ✓" bubble (trailer captures) — **P1** |
| Short landscape | Character fixed (PR #16), but world text (machine plates, meter digits, signs) renders ≈ 10 px — **P1** |
| Bounds | No camera escapes observed in 3 full playthroughs |

## C. Level design (summary — details in DENAI_LEVEL_INVENTORY.md)
1. **1-1 mission found late.** The objective is revealed only at the broken bridge (x ≈ 2470) — 2 400 units (≈ 45 % of the level's critical path) of walking before the player knows why they are there. The key detour (root ladder x 1215 → hut x 1435) is movement-only.
2. **Long post-puzzle tails.** After the maths is solved, 1-1 still has Tebing Berliku (5 hops, x 3090→4290) and Pokok Tinjau to x 5745; 1-2 runs to x 4690; 1-3 to x 5292. These are traversal without new ideas (repeated ladder-and-hop pattern) — **P1 pacing**.
3. **Repeated ladders.** Every level uses ladders as the main vertical tool (1-1 root ladder, tree ladder, Pokok Tinjau; 1-2 secret-bank ladder to the swap lever; 1-3 ruins ladder). Climbing has no animation, which makes repetition more visible.
4. **1-2 swap lever placement.** The order lever sits on the upper deck reached through the secret-bank ladder (x ≈ 3024 → 3214); the playthrough bot needed a scripted route and failed the swap 1 in 3 runs while recording. Navigation to the lever is not obvious — **P1**.
5. **Checkpoints.** Present and sensible (1-1: 5, 1-2: 6, 1-3: 5). Respawn keeps purchases/puzzle state (tested by deliberate falls in playthroughs).
6. **Start/end.** Clear start banner; end = automatic finish zone (`inFinishZone`, ±84 units) then victory card. Works.

## D. Gameplay feedback
| Event | What happens | Verdict |
|---|---|---|
| Interaction available | World prompt "E · …" + touch "Guna" | Good |
| Wrong answer | 1-1: store refuses with reason ("short"/"budget"), no cost; 1-2: "Hasil 6 — belum cukup 8."; 1-3: "Aliran masih rendah." / "Tekanan terlalu tinggi!" + gate falls back | Good, non-punitive, specific |
| Correct answer | Bubble ("Bacaan 13 ✓"), bridge/stones animate, short dialogue, gold "Misi selesai" stamp, `SFX.correct` | Functional but understated — no character reaction, no reward reveal |
| Checkpoint | Toast "Checkpoint disimpan" + flag + `SFX.checkpoint` | OK |
| Level complete | Victory card with coin/secret tally, time, record, leaderboard form, next-level teaser | Informative but long (see UI audit) |
| Respawn | Fall → fade → nearest unlocked checkpoint, quest kept | OK |

## Top gameplay problems
1. Late objective reveal in 1-1 (P1).
2. Traversal tails after the puzzle in all three levels (P1).
3. Portrait/short-screen world text and machine readouts too small or off-screen (P1).
4. 1-2 lever route unclear (P1).
5. Missing character animations: climb, land, celebrate (P2).
