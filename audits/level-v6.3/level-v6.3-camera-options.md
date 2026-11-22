# Lorong Atas Bumbung — V6.3 Camera Composition Review

**Status: design-only. No camera code modified.** Live values verified directly in `src/game.js`: `cameras.main.setBounds(0, 480, WORLD.width, WORLD.height - 480)` (line 77), `startFollow(player, true, reducedMotion?1:.14, reducedMotion?1:.16, -85, 10)` (line 78) — i.e. `bounds.top=480`, `offsetY=10`, confirmed matching the brief's reported values. `WORLD.height=1152` (`src/level.js:4`). Logical viewport height is fixed at `648` (`src/game.js:493`, `dimensions()`).

---

## Root-cause analysis (the three causes, investigated separately)

### 1. Canvas aspect ratio / viewport sizing

`dimensions()` computes `{width: round(648 * frame.clientWidth/frame.clientHeight), height: 648}` — the **logical height is hard-coded to 648px regardless of the frame's real pixel size**; only width adapts to the frame's aspect ratio. This is a deliberate, documented choice (`game.js`'s own comment: "no fixed 16:9/3:4 ratio forcing it to shrink on a short-but-wide window"). It is not itself the cause of excess sky, but it is the input that fixes the ceiling for cause #2 below.

### 2. World camera framing

Phaser requires `bounds.height >= viewport.height`. With `viewport.height=648` fixed, the maximum legal `bounds.top` is `WORLD.height - 648 = 504`. The live value, `480`, already sits only 24px below that ceiling (confirmed in `level-v6.1-implementation-report.md` Step 4, which found `bounds.top=650` breaks vertical follow entirely because it violates this exact constraint). **The camera's total vertical scroll range is therefore 504-480=24px** — confirmed empirically in this session's own `tests/probe.py` run: every logged `camera.y` was either `504` (any ground position, y=1000) or `480` (on `roof-e3`, y=800). The camera is vertically static for the large majority of play. This is the direct, structural cause of "large parts of the camera show empty sky" — not a tunable bias, a hard ceiling given the current `WORLD.height`/viewport-height pair.

### 3. Missing environmental depth

Confirmed in `level-v6.3-visual-audit.md` #9/#10: the space the camera is structurally forced to show (world-y ~480 to ~1130 at ground level, i.e. roughly 650px of vertical world-space) is **currently filled with nothing but flat background color and one thin cloud layer**. This is the one lever not yet used at all, and the only one that requires zero camera or geometry change.

---

## Alternative A — Preserve current camera, fix via composition (RECOMMENDED)

Keep `bounds.top=480`, `offsetY=10` exactly as shipped. Fill the structurally-necessary visible sky with Layer 1/2 art per `level-v6.3-art-direction.md`: background silhouettes (`bg_house_row`, `bg_hills`, `bg_mosque`) and midground landmarks (`house_*`, `h3_roof_hut`, roof-mass behind Zone E) occupying the vertical band between the ground line and the top of the frame.

- **Player screen location:** unchanged — confirmed still centered per the existing `startFollow` offsets; this alternative touches zero camera code.
- **Visible jump distances:** unchanged — every jump in `level-v6.2-jump-validation.csv` remains visible exactly as it is today (no risk of hiding a platform, since nothing about what's visible changes, only what's drawn in the already-visible empty area).
- **Ground-to-sky balance:** improves *perceptually*, not *proportionally* — the ~76.5% of the frame currently above the ground line (see calculation below) still exists, but is no longer empty. This directly matches the brief's own instruction: "do not recommend a camera change solely because it reduces visible grey sky" — Alternative A reduces the *complaint* without reducing the *sky*.
- **Frame coverage / readability:** background sprites at scroll factor <1 and the lightest tonal step cannot compete with Layer 3/4 contrast — platforms, machines, and the character stay the most legible elements in frame by construction (per the art direction's contrast ranking).
- **Desktop and short-wide viewports:** no change in behavior across aspect ratios, since `dimensions()`'s width-adapts/height-fixed logic is untouched — this alternative is aspect-ratio-neutral by definition.
- **Trade-off:** does not reduce the *raw* empty-sky area — a future pass could still look "sky-heavy" in a bare screenshot before any art is placed. Mitigated entirely by the art direction plan, not by this alternative alone.

## Alternative B — Revise framing (reduce logical viewport height)

Reduce the fixed logical height in `dimensions()` from `648` to a smaller value — concretely, **~450px** — which raises the legal `bounds.top` ceiling to `WORLD.height - 450 = 702`. Using the same 24px-margin convention already established in V6.1, `bounds.top` could move from `480` to `~678`, leaving ~122px of headroom above `roof-e3` (y=800, the tallest platform in the level) for jump-arc visibility.

**Calculated effect at ground level** (y=1000, the dominant gameplay state):

| | Current (H=648, bounds.top=480) | Alternative B (H=450, bounds.top=678) |
|---|---|---|
| Clamped scrollY at ground | 504 | 702 |
| World-span visible above the ground line | 1000-504 = 496px | 1000-702 = 298px |
| Fraction of frame that is "above ground" | 496/648 ≈ **76.5%** | 298/450 ≈ **66.2%** |
| Character (60px world-height) as fraction of frame height | 60/648 ≈ **9.3%** | 60/450 ≈ **13.3%** |

- **Player screen location:** shifts proportionally lower/larger in frame (character fraction rises from 9.3% to 13.3%) — a real, measurable change, not dramatic, but directly trades against the brief's explicit "do not make the player excessively large."
- **Visible jump distances:** the 122px headroom above `roof-e3` is enough to keep that platform in view before a jump begins (confirmed: `roof-e3` at y800 is 122px above the new `bounds.top`=678 ceiling, well within the visible frame at any scroll position near it) — but this must be re-verified against every other platform's approach angle before implementation, not assumed from this one worst-case check alone.
- **Ground-to-sky balance:** genuine improvement (76.5%→66.2%, roughly 10 percentage points), but **smaller than it may sound** — the structural excess (`WORLD.height` vastly exceeding the level's actual vertical action range, ~96.6px max jump rise plus the 200px Zone E chain) persists regardless of viewport height, so shrinking the viewport rescales the problem rather than removing it.
- **Frame coverage / readability:** a smaller logical viewport at the same CSS pixel frame size means Phaser's `Scale.FIT` renders everything at a higher effective zoom — UI elements positioned in world-space (zone toast, prompts, labels) would need re-verification at the new scale, which is explicitly a code change, not covered by this design pass.
- **Desktop and short-wide viewports:** on an already-short-wide window (the exact case `game.js`'s own comments say the current `dimensions()` logic was built to protect), a smaller logical height compounds with an already-constrained frame — higher risk of the frame feeling cramped specifically on the viewport shape this project has already identified as a problem case.
- **Trade-off:** requires a camera/scale code change (explicitly out of scope for "do not change camera" unless separately authorized), a larger relative character size, and new verification work across every jump and every UI element's position — for a sky reduction that is real but partial.

## Recommendation

**Alternative A.** It requires zero camera code changes (full compliance with the brief's "do not change camera" default), carries zero risk to jump visibility or character scale, and directly targets the root cause identified in investigation #3 (missing environmental depth) rather than the structurally-limited lever in #2. Alternative B is documented in full with real numbers so the trade-off is available for a future pass if the user decides the sky reduction is worth the character-scale and re-verification cost — but it is not recommended as part of this pass.
