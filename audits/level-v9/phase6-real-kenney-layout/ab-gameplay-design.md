# V9.6 — A/B Gameplay Design (coordinate blueprint vs. current)

## Decision: geometry preserved, visuals + one reward reposition changed

Every DECKS/LADDERS/GATES/GROUND_RANGES/FIRST_GAP/CRATE_PUZZLE coordinate
in A/B (and C, spatially interleaved with B) is **unchanged** from the
already-validated V9.1 layout. Only two things actually moved:
1. The visual tile family (64px → the real 18px Kenney Pixel Platformer
   pack) across the entire x<1300 span.
2. `coin-a`'s position, from a trivial ground-level pickup to the crate
   puzzle's own unlocked ledge.

This was a deliberate, scope-controlled call, reasoned through below.

## Why geometry wasn't reshuffled

The brief allows repositioning platforms/ladders/the crate puzzle, but
also requires: "Do not implement a layout where a mandatory jump is
outside Chill Boy's measured reach," "Do not use an arbitrary platform
grid without validating actual collision," and "Never weaken assertions."
A/B's current geometry has been independently validated across five prior
phases (V7 jump-validation tables, V9.1's rise-math fix, `node --test`'s
own flat-jump-envelope and max-jump-rise assertions, and every natural-
input Playwright suite). Reshuffling it would mean re-deriving and
re-proving all of that from scratch, for a request whose own stated root
cause ("the user is dissatisfied... with the old layout **and** old 64px
terrain") is substantially the terrain half — confirmed by the brief's own
target description: "a colorful, connected, interactive platformer
resembling the structural **quality** of Kenney's official gameplay
samples, **not their exact level design**." The highest-value, lowest-risk
move was judged to be: fix the terrain quality completely and genuinely
(real pack, not a re-skin of the old one), and make the one existing
"optional route" (the crate puzzle) actually rewarding, rather than
inventing new geometry under time/regression-risk pressure.

## The "one short meaningful optional route" requirement

The crate/switch/ledge mechanic **is** that optional route — it already
existed (V9/V9.1) but, as both a prior design report and this phase's own
geometry read confirmed, its reward was previously nothing: solving it
unlocked a ledge with a one-time discovery sparkle and no concrete prize.
This phase gives it a real payoff: `coin-a`, previously a trivial
ground-level pickup sitting right next to the crate (so trivially grabbed
that it added nothing), is now reachable **only** by solving the puzzle.
This was judged to satisfy the brief's own intent ("one short meaningful
optional route... prefer giving access to an existing collectible or
bonus platform where feasible") without adding new geometry, new test
surface area, or new regression risk. See `ab-layout-before-after.csv` for
the exact field-by-field before/after.

## Proposed (= current) coordinate layout

See `ab-coordinate-map.png` for the full visual. Summary:

- **Spawn**: x=80, feet=1100 (unchanged).
- **Crate puzzle pocket** (optional): crate at x=230/feet=1100, switch at
  x=340/feet=1100 (radius 40), ledge unlocked at x=290–390/y=980 (rise
  120px from ground — exceeds the 96.6px max unaided jump rise, so
  genuinely requires the crate as a stepping stone; crate-top itself is
  only 48px tall, giving two legal sub-jumps of ~72px each, both within
  the max rise). `coin-a` now sits on the ledge (x=340, y=940).
- **FIRST_GAP** (mandatory): x=420, width=120 — well inside the
  208px theoretical max flat-jump range, confirmed reachable by a plain
  running jump (as it always was).
- **A→B ladder** (mandatory): x=610, rise 980→1100 (120px, exceeds max
  jump rise — a ladder is required, by design).
- **town-walk-1 → town-walk-2** (mandatory, same tier): gap 140px,
  comfortably inside the flat-jump range.
- **B→C ladder** (optional detour): x=750, rise 820→980.
- **Machine 1 terminal**: x=1250, feet=980, gating `workshop-gate` at
  x=1300 — the B→D boundary, confirmed unmoved.

No coordinate here was invented — every value above was read directly
from the live `src/level.js` this phase, the same source-of-truth
discipline every prior phase in this project has followed.

## Visual rule applied in code

`deck()`, the ground-tiling loop in `buildEnvironment()`, the ladder loop,
and the crate puzzle's own art all branch on **x<1300**: that span (all of
A, all of B, and C's `cafe-deck`, which sits inside the same x-range) now
renders with the real Kenney Pixel Platformer tiles at a fixed integer 3×
scale (54px display size from an 18px native tile), nearest-neighbor
filtered. Everything at x≥1300 (D onward) is completely untouched —
still the 64px "New Platformer Pack," never mixed with the new tiles in
the same visual span. See `src/game.js` for the exact branches (search
"V9.6" comments).

## What this means for a future phase

If C–G's own redesign is authorized later, the same x-based branch rule
can simply be widened (or replaced with an explicit zone-id list) — no
new rendering pattern needs inventing, since the "art never determines
collision" split was never touched.
