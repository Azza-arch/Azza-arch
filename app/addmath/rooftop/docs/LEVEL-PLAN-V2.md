# Lorong Atas Bumbung — Level Plan V2 (extended, six areas)

Status: Areas 1–3 implemented this pass. Areas 4–6 are planned (coordinates/beats
specified below) but not yet built — see `AREAS` in `src/level.js`, where each
entry carries a `status: 'built' | 'planned'` field so the scene can render a
"planned" area as a locked/absent zone without guessing at missing geometry.

Target first-time duration for the full six areas: 15–20 minutes, to be
confirmed by playtest once Areas 4–6 exist — not claimed as achieved yet.
Areas 1–3 alone (built this pass) measure roughly 1–3 minutes for a scripted
full-route pass (see test run in the implementation report); a first-time
human player exploring, reading hints, and finding the optional coin will
take longer, but that's still well under the full six-area target by itself.

## Pacing map

| Area | Beat | Purpose | Mandatory? |
|---|---|---|---|
| 1. Lorong Permulaan | Calm exploration + movement intro | Teach A/D, Space; optional detour | No puzzle |
| 2. Bumbung Pertama | Short movement challenge | Ladders, one approachable jump, checkpoint | No puzzle |
| 3. Mesin Fungsi | Environmental puzzle | f(x)=2x+1, target 7, opens bridge | **Required** |
| 4. Laluan Terbuka | New route opens + 2nd small puzzle | Cross bridge, second function application, 2nd checkpoint | **Required** |
| 5. Bumbung Rahsia | Optional detour / discovery | Hidden collectible, safe return path | Optional |
| 6. Taman Atas Bumbung | Final traversal + completion | Last application of the concept, reach pergola | **Required** |

## Area 1 — Lorong Permulaan (built)

World x 0–896. Spawn `(156,1000)`. Safe ground-level street. One optional
`kenney_coin` collectible at `(420,940)`, reachable with a small hop — framed
as a detour, not on the direct line to the ladder, so skipping it costs
nothing. First ladder at x=640 (unchanged from V1). Contextual prompts only
("A/D — Bergerak" fades after ~64px of movement, "Space — Lompat" near the
first open ground, "W/↑ — Naik tangga" on the approach to the ladder).

## Area 2 — Bumbung Pertama (built)

World x 896–1664. Roof-to-roof movement: climb to the water-tank deck,
cross the one approachable jump (128px gap, well inside the ~208px nominal
run-up range per `tests/level.test.mjs`), land on the machine-roof deck.
Checkpoint at `(1380,650)` — same position as V1, which already sits exactly
where this area's spec calls for it: safe, past the jump, before the puzzle.

## Area 3 — Mesin Fungsi (built)

World x 1664 boundary (bridge trigger) sits at the end of this area's own
machine-roof deck (x:1280–1664). `f(x)=2x+1`, target output 7, correct input
`x=3`. Puzzle required for main-route progress — no alternate path around the
machine-roof deck exists (solid street gap on both sides, confirmed by
`tests/level.test.mjs` test 2). Three-level progressive hint button replaces
the old single auto-hint. Solving spawns the visible bridge across the
544px chasm (still un-jumpable by the physics constants, per the same test).

## Area 4 — Laluan Terbuka (planned, not yet built)

Proposed world x 2208–2592 (today's "landing" cluster). Cross the opened
bridge, follow the connected rooftop route already modelled in `house_3_full`
at x=2220. Add one short second function application (different input/output
than Area 3, same difficulty: e.g. `f(x)=3x-2`, target 16, `x=6`) gating a
second mechanism (proposed: a lowered ladder rather than a second bridge, for
traversal variety). Second checkpoint after that mechanism resolves.

## Area 5 — Bumbung Rahsia (planned, not yet built)

Proposed short side branch off Area 4's rooftop, reachable only once the
Area 4 mechanism opens it (so it can never trap a player who hasn't reached
that point) with a clearly visible safe return to the main route. One hidden
`kenney_coin` and a small visual discovery (reusing existing unused Figma
house parts, e.g. `h1_roof_porch`) — not required for completion.

## Area 6 — Taman Atas Bumbung (planned, not yet built)

Proposed world x 2592–2912 (today's goal-roof cluster, already dressed with
the two added wall/window storeys and the `h3_roof_hut` pergola cap from the
prior cleanup pass). One short final traversal, no new puzzle beyond a final
callback to the same function concept (e.g. a sign showing the full chain
`3 → ×2 → +1 → 7` as a recap, not a new graded question), reaching the
existing `h3_roof_hut` pergola and the current completion dialog.

## What did not change

`SPAWN`, `CHECKPOINT`, `TERMINAL`, `BRIDGE`, `GOAL`, and the three `LADDERS`
entries keep the exact coordinates from the previous pass — Areas 1–3 already
matched this plan's beats closely enough that no collider needed to move.
Only decoration (ground/deck tile art, the one collectible) and the puzzle's
hint UI changed in gameplay-relevant code.
