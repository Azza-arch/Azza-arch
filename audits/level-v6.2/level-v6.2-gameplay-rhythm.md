# Lorong Atas Bumbung — V6.2 Gameplay Rhythm Map

**Status: design estimates, not measurements.** Durations below are design-level pacing estimates derived from `MOTION.speed=280px/s` and the live geometry; they are not captured playtest timings (no implementation has happened in this pass).

| Beat | Zone | Player Action | Reason | Mandatory/Optional | Expected Duration | Failure Recovery |
|---|---|---|---|---|---|---|
| 1 | A | Walk from spawn (x156) to FIRST_GAP (x420) | Read controls, learn movement | Mandatory | ~1s | n/a — flat ground |
| 2 | A | Jump FIRST_GAP (120px, dy=0) | INTRODUCE: first jump | Mandatory | ~0.5s | Fall is shallow street-level; no hazard below (confirmed: `GROUND_RANGES` has no gap-adjacent void) |
| 3 | A→B | Walk to Zone B ladder-up (x950) | TRAVERSAL | Mandatory | ~2s | n/a |
| 4 | B | ROUTE CHOICE: lower street (hop 1 obstacle) vs. upper awning chain (ladder+2 jumps+ladder) | PRACTICE: first real route choice, first genuine time-reward tradeoff (V6.2 B1) | Optional (upper); lower street itself is mandatory to pass through | ~2.3–2.4s either way | Upper-route miss: fall 100px to street, no respawn |
| 5 | B→C | Walk to café (x2700ish) | REST approach | Mandatory | ~5s (longest flat stretch remaining, unchanged from live geometry — no obstacle added here per Part 7's "no long climb for a single coin" rule) | n/a |
| 6 | C | REST: checkpoint 1 at café (x2750), optional roof ladder for 1 coin | REST + DISCOVERY (optional) | Checkpoint mandatory; roof optional | ~1s rest, ~3s if roof taken | Roof miss: fall to street |
| 7 | C→D | Walk to workshop approach (x3750) | TRAVERSAL | Mandatory | ~4s | n/a |
| 8 | D | FUNCTION PUZZLE: see `workshop-gate` blocking the way, approach M1 terminal, solve `f(x)=2x+1`, find `f(3)=7` | WORLD TRANSFORMATION: gate opens | Mandatory | ~15–30s (puzzle-solving, player-paced) | Wrong answer: hint ladder per `PUZZLES[0].hints`, retry at same terminal, no position loss |
| 9 | D→E | Cross opened `workshop-gate` (450px bridge) | REWARD (world changed) | Mandatory | ~2s | n/a — bridge is solid once open |
| 10 | E | TRAVERSAL + JUMP CHALLENGE: street-to-e1 (rise 40), e1-to-e2 (rise 64) | PRACTICE→COMBINE: two jumps of increasing rise, back to back | Mandatory (V6.2 — street bypass removed) | ~2s | Miss: fall to recovery street `[4300,5450]`, walk back to retry, no respawn |
| 11 | E | CLIMB: ladder e2-to-e3 (rise 96, too big to jump) | VARY: the chain's one ladder, deliberately different from the two jumps around it | Mandatory | ~1s | Climb back down, retry |
| 12 | E | JUMP CHALLENGE (descent): e3-to-e4 (drop 140), e4-to-pocket (drop 60) | APPLY: the chain's payoff is going *down* into the terminal pocket, not just up | Mandatory | ~1.5s | Miss: fall to recovery street (adjacent to, not past, the new lip) |
| 13 | E | FUNCTION PUZZLE: M2 terminal inside the pocket (only reachable via step 12), solve `3x-2=10`, find `x=4` | WORLD TRANSFORMATION: `rooftop-gate` opens — now visibly earned by the traversal just completed | Mandatory | ~15–30s | Wrong answer: hint ladder per `PUZZLES[1].hints`, retry at same terminal |
| 14 | E→F | Checkpoint 2 at x6200, cross opened `rooftop-gate` (500px) | REWARD + checkpoint | Mandatory | ~2s | n/a |
| 15 | F | DISCOVERY: optional cave alcove (x6400, 2 coins) vs. direct hill climb (x6700 plateau) | VARY: environmental discovery, distinct from Zone B's urban route choice | Optional (cave) | ~3s cave detour, rejoins same ladder | Miss on either: fall to ground, no hazard |
| 16 | F | Checkpoint 3 at x6780 (hill plateau) | REST before finale | Mandatory | ~1s | n/a |
| 17 | F→G | Walk to final gate approach (x6900) | TRAVERSAL | Mandatory | ~2s | n/a |
| 18 | G | FUNCTION PUZZLE: `final-gate` blocks the river bridge, M3 terminal visible beside it, solve `4x-3=17`, find `x=5` | WORLD TRANSFORMATION: final gate opens, bridge appears | Mandatory | ~15–30s | Wrong answer: hint ladder per `PUZZLES[2].hints`, retry at same terminal |
| 19 | G | Cross bridge to GOAL (x7330) | COMPLETION | Mandatory | ~2s | n/a |
| 20 | G | Completion screen (coins found / total) | COMPLETION / REWARD summary | Mandatory | n/a | Replay resets full state, per existing `game.js` replay logic |

## Pacing read-out

- **Walks-too-long flag:** the B→C stretch (beat 5, ~5s) remains the single longest uninterrupted flat walk in the revised level. It is *not* re-flagged as a defect here: Part 7 explicitly forbids adding mandatory climbs for café-area coins, and the V6.1/V6 passes already resolved the worse D-approach stretch. No action proposed.
- **Repeated-movement flag:** beats 10–12 (three jumps + one ladder, alternating rise direction) are the most mechanically dense stretch in the level — this is intentional (COMBINE→VARY→APPLY) and is the direct fix for the "purposeless platforming" complaint, not a repetition problem, because no two consecutive steps share the same rise/drop value (40, 64, 96-climb, 140, 60 — five distinct values in a row).
- **Unclear-progression flag:** none identified. Every mandatory beat is preceded by a visible obstacle (gate, lip, or gap) and every optional beat (Zone B upper route, café roof, Zone F cave) rejoins the main route at a single, visible point with no forced backtracking.
- **Forced-backtracking flag:** none identified — every optional branch in this design rejoins forward, never requiring the player to retrace already-covered ground to continue (confirmed per-branch in the Zone B and Zone E sections of `level-v6.2-route-options.md`).
