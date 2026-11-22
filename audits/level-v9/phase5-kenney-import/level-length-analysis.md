# V9.5 — Level Length / Pacing Analysis

**Recommendation: do not increase `WORLD.width` (4300px).** Current length
is appropriate; see data below.

## Method

A real, natural-input traversal (`tests/v9_5_timing.py`) drove the game
through the mandatory-only route (skipping the two optional detours: the
café checkpoint-only branch in B/C, and the cave-alcove coin in F) using
held movement keys at the game's own `MOTION.speed`, exactly like a human
player — not scripted teleports. Wall-clock `time.time()` was recorded at
each milestone. Puzzle answers were entered correctly on the first try
(no wrong-answer retries), so this is a **fastest-competent-run floor**,
not an average session.

## Results (seconds from start)

| Milestone | Elapsed |
|---|---|
| A: first gap cleared | 2.3s |
| A→B: reached Machine 1 | 5.2s |
| M1 solved | 6.2s |
| D→E: climbed to roof-entry | 10.1s |
| E: reached Machine 2 | 13.0s |
| M2 solved | 13.8s |
| E→F: checkpoint 2 | 16.3s |
| F→G: checkpoint 3 | 20.7s |
| M3 solved | 21.4s |
| **Total (mandatory route only)** | **24.0s** |

## Interpretation

- Pure movement/mandatory-route time is ~24s — short, but this excludes
  the time a real student spends reading each zone's intro banner, working
  out the actual math (not just typing a pre-known answer), and the two
  optional detours (café checkpoint, cave coin). A realistic full session
  — reading prompts, actually solving 3 function machines, visiting both
  optional branches — is reasonably estimated at 3–6 minutes, consistent
  with this being a single, short Form 4 "Fungsi" practice level, not a
  full game level.
- No empty/dead-travel stretches were found: every zone transition in the
  mandatory route involves a ladder, jump, or puzzle within a few seconds
  of the previous one. The two existing optional branches (café, cave) are
  each small, clearly-flagged side trips, not navigational dead ends.
- Given the above, extending `WORLD.width` would add travel time without
  adding content density, diluting pacing rather than improving it.
  **No width change is recommended or made.**
