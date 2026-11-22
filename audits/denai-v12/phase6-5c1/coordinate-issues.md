# Coordinate-level issues

Exact world coordinates, read from `src/v12/level.js` and `src/v12/environment.js`. Each entry names the specific tiles/props involved, not a general zone impression.

## Sign/post crowding (≤54–60px apart)

| Location | Props | Spacing | Status |
|---|---|---|---|
| Zone G, x=7363/7423 | `river-select` sign, `river-lever` | 60px | **Already fixed** in Phase 6.5B2-G (interaction radius tightened to 25px; visual spacing itself untouched, flagged there as a remaining risk — see that phase's final-report.md §11) |
| Zone D, x=3372/3420 | `tile(9,...)` prop + `tile(85,...)` control-sign | 48px | **Not yet flagged anywhere.** Same visual-merge risk as the G pair, before any radius fix was needed (D's two props aren't both interactables, so no functional conflict — this is a visual-only entry, not a gameplay bug) |
| Zone C, x=1473/1583/1693 | three clue/apply signs (frame 85) | 110px apart | Fine — matches B's spacing precedent, not flagged |

## Flat/empty stretches (no decoration across >150px of ground)

| Zone | Range | Width | Note |
|---|---|---|---|
| A | x=1080–1370 (between gap and first bush) | ~290px | `A-crate`/`A-landing` straddle a gap at 1080–1188; decoration resumes at 1370 |
| B | x=2484–2808 (`B-bank`→`B-terrace`→`B-overlook`) | 324px | Zero vegetation across three stacked shelves |
| D | x=3024–3102 (`D-approach` start to first number-block tile) | ~78px | Short but it's the player's first view of D, same "first impression" logic as Zone A |
| E | x=4482–5022 (straight pipe run) | ~540px | 10 consecutive identical pipe tiles, no vegetation possible here (pipe is overhead at y=783-846, not ground-level) — this is a prop-repetition issue, not an empty-ground issue; see visual-audit.md |

## Confirmed-intentional geometry (checked directly, not flagged as issues)

- **D-service ladder** (x=3330, top=738, bottom=972): runs visibly off the top of the normally-framed camera view at ground level — this is correct; it leads to the optional `D-service` one-way platform at y=738, confirmed present in `level.js:42`. Verified via live zoom screenshot (`d-service-ladder-zoom.png`). Not a rendering defect.
- **E's pipe segments doubling as a walkway** (x=4482–5184, y=783): confirmed walkable live (player stood on top of it in `e-pipe-walkway-top.jpg`/`e-pipe-elbow-block.jpg`). This is a *visual-identity* mismatch (nothing distinguishes "this pipe segment is walkable" from the others), not a collision bug — logged under P1 in implementation-order.md, not P0.

## River fill depth (Zone G)

`environment.js:125`: `for(let x=7506;x<7830;x+=54){tile(33,x,1080,8,54,54); for(let y=1134;y<1512;y+=54) tile(73,x,y,8,...)}` — produces 7 full rows (1134→1512) of identical frame-73 tile beneath the single frame-33 surface row at y=1080. 378px of uninterrupted repeating water tile, directly below the player's crossing path. Not visible during normal crossing (camera framing sits above it per the G phase's own screenshots), so this is **low priority** — listed as P2 in implementation-order.md.
