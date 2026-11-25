# World 2 · Lembah Batu Kapur: visual and geometry direction (design only)

> **25 Nov 2026:** see the owner decisions at the top of `WORLD-2-BLUEPRINT.md`. §5 option (2) is chosen: existing green background set + Kenney stone blocks in front; no new karst art.

This document adds to `WORLD-2-BLUEPRINT.md`, which stays the source for puzzles and the DSKP mapping. Draft layout of 2-1: `design/blueprints/w2-l1.svg`. **Status: BLUEPRINT ONLY.** No full map is built until Station A has been assessed for maths, collision and game feel (owner's decision, 16 Nov).
The owner's decisions already recorded: unlocked after 1-1; 1 maths unit = 1 tile; fixed challenge set first.

## 1. Identity
A **limestone valley** inspired by Malaysian karst (Kinta Valley, Gunung Lang, Langkawi): steep grey hills with green on top, cliff faces, cave mouths, a river at the bottom, water jets. Different from World 1:
| | World 1 | World 2 |
|---|---|---|
| Silhouette | gentle rolling ground | **steep cliffs, overhangs, karst pillars** |
| Main material | grass + dirt, timber | **stone** (base 40–43, `kenney/tiles` stone) + grass on top |
| Route | horizontal | **up and down**: into the valley (2-1), up the cliff (2-2), across the river (2-3) |
| Mechanisms | wooden machines, planks | **water jets, cables, stepping stones along a curve** |

## 2. Lessons from the Station A slice (already measured in a real browser)
- The player's jump is **very generous** (peak 1.71 tiles, running reach ≈ 3.9). With stones every ½ unit, the wrong curves (a = −1, −2) could also be crossed, so the maths did not matter.
- Solution: **one stone per whole x**, plus a **pillar under the vertex** that blocks a "jump across underneath". Result: only a = −½ crosses, with clear physical margins.
- Rule for all of World 2: **every parabola platform must be checked against the jump envelope.** A wrong configuration must fail physically (too high, too far, blocked), not because the game says "wrong".

## 3. Parabola-specific platforms
| Platform | Model | Honest about | Assets |
|---|---|---|---|
| **Stepping stones along a curve** (A) | y = a(x − h)² + k, a stone at each whole x | a stylised game platform | base stone block (frame 47 in the slice) |
| **Water jet** (2-2 D, E) | trajectory y = x·tanθ − g x² / (2v² cos²θ) | **simplified: no air resistance**, the game's gravity is scaled | waterfall tiles 33/53/73, pipes 95/115/135 |
| **Suspension cable** (2-1 C) | parabola: the cable of a bridge carrying a uniform load per horizontal length | not a free-hanging chain (that is a catenary); stated in the note | poles 69/89/109 + planks 48–50 |
| **Fence pen** (2-2) | A(x) = x(6 − x), perimeter 12 | a 4-sided rectangle | farm-pack fences 38–41, crates |
| **Pontoon chain** (2-3) | y = x² − 6x + c, roots and discriminant | a curved chain over water, stylised | chains from the industrial pack 8/24/40 + water |

## 4. Geometry per level
- **2-1 Jejak Lengkung** (pattern A + C): descends from the ridge (row 21) into the valley (row 26). Station A (the slice, as is) → Station B over a pond under a **limestone overhang** (the ceiling limits high jumps, so the curve must be right) → Station C suspension bridge over the river → climbs two steps to the stone arch → 2-2. A cave under the bank (secret) via a ladder; a third gold ring on a high deck (secret). Main route checked: all hops within limits (route-check).
- **2-2 Lembah Puncak** (pattern B + A): **vertical**. Climbs a cliff face (stone ledges, one ladder), catches the jet at the vertex (D), the bell at the top (E), the fence pen on the plateau. The return loop goes down through a crack in the cliff.
- **2-3 Gerbang Parabola** (pattern A + C): a wide river, pontoons at the roots, a chain at three levels (discriminant), a lane of falling rocks under the curve shield (inequality), and the parabola gate (three seals).

## 5. Visual depth
- Sky: a gradient as in World 1 (the same code, a different palette, provided it stays readable).
- **Distant karst silhouettes: no asset available.** Options: (1) commission/draw a "karst" background strip in the Kenney style (24 px tiles, flat palette), or (2) use the green set + large stone foreground blocks only. Recommendation: (1) before 2-2.
- Middle layer: grassy stone hills (stone tops 40–43 + grass 20–23).
- Play layer: stone, rope, wood; the water mechanisms in blue.

## 6. Applied maths (summary; details in `WORLD-2-BLUEPRINT.md`)
| Mechanism | Real-world inspiration | Variables / units | Domain | Objective |
|---|---|---|---|---|
| Curve jet A/B | shaping a water jet | a (opening, no unit), h, k (tiles = m in the game) | the a list, h and k whole numbers | the effect of a, h and k (SP 2.3.4) |
| Catching at the vertex D | the peak height of a jet | x, y in m; y = −x² + 6x − 5 | 1 ≤ x ≤ 5 | the vertex as the maximum (2.3.5, 2.3.6) |
| Fence pen | maximum area for a limited fence | x m, A m², perimeter 12 m | 0 < x < 6 | maximum area at x = 3 (2.3.6) |
| Pontoons / chain | where the cable touches the water | x m; c a height parameter | whole-number c | roots, discriminant (2.1–2.2) |
| Falling rocks | a safe zone under a shield | x m | — | quadratic inequality (2.1.3) |

## 7. Risks
- Karst and cave art does not exist yet (see the matrix).
- Graph readability on a phone at zoom ⅔: in the slice the labels and both rings were visible. Every new station must be checked again.
- Vertical stations (2-2) need taller camera bounds. Do not change the global zoom just to make a graph bigger (the owner's decision).
