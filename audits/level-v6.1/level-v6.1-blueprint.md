# Lorong Atas Bumbung — V6.1 Design Corrections Blueprint

**Status: proposal only. No source file modified. No implementation.**
Inputs: `audits/level-v5/*` (audit, blueprint, risk register), `C:\Users\syhaz\Downloads\level-v6-blueprint.md` + `level-v6-proposed-topology.png` (external V6 reference), `audits/level-v6/level-v6-feasibility-review.md`. Current, unmodified `app/addmath/rooftop/src/level.js` is the geometry baseline every "remove/replace" claim below is checked against.

All coordinates in this document are **unimplemented proposals**. Every number was checked against the game's actual, locked kinematics (not eyeballed, not copied from any reference PNG):

```
v0 = 520 (jump impulse), g = 1400 (gravity), speed = 280 (run speed)
range_window(dy) = (t1*speed, t2*speed), where t1,t2 = (v0 ∓ sqrt(v0² - 2*g*dy)) / g
max rise = v0² / (2g) = 96.6px
```

| Rise dy | Safe horizontal window |
|---|---|
| 0px (flat) | 0 – 208px (measured natural-input max: 217px) |
| 24px | 13.8 – 194.2px |
| 40px | 24.4 – 183.6px |
| 48px | 30.2 – 177.8px |
| 56px | 36.6 – 171.4px |
| 64px | 43.6 – 164.4px |
| 72px | 51.5 – 156.5px |
| 80px | 60.9 – 147.1px |
| 88px | 73.0 – 135.0px |

| Drop | Max descent range |
|---|---|
| 40px | 227.7px |
| 80px | 244.6px |
| 120px | 259.7px |
| 150px | 270.2px |

Every mandatory jump below is placed well inside its window (never at an edge), per the brief's "conservative safety margins" requirement.

---

## 1. Zone B — Lorong Pekan (850–1800), REVISED

**Concept kept:** three awnings, optional upper route, lower street stays fully continuous. **What changes from V6:** V6 left the per-gap sizing undefined (950px zone ÷ 3 platforms implied ~230–280px gaps, which the V6 feasibility review flagged as exceeding even the flat-ground 208px theoretical max). V6.1 fixes this with explicit, verified numbers.

All three awnings sit at the **same height** (y=900, i.e. 100px above the y=1000 street) — flat jumps only, dy=0, the safest and most forgiving case in the whole level. One ladder up, one ladder down; **no ladder between awnings** (avoids "repetitive ladders just to solve reachability").

| Jump | Launch | Landing | Horizontal gap | Vertical rise | Window | Margin used | Recovery |
|---|---|---|---|---|---|---|---|
| Ladder up | x=950, climbs y=1000→900 | — | — | −100px (climb, not jump) | n/a | n/a | fall back to street below, no respawn |
| B1→B2 | (1120, 900) | (1250, 900) | 130px | 0px | 0–208px | 78px below max (62% utilized) | miss → fall 100px to continuous street, safe |
| B2→B3 | (1370, 900) | (1500, 900) | 130px | 0px | 0–208px | 78px below max | miss → fall to street, safe |
| Ladder down | x=1580, climbs y=900→1000 | — | — | n/a | n/a | n/a | — |

Platforms: B1 x=1000–1120 (120px wide), B2 x=1250–1370, B3 x=1500–1620. Street (y=1000) runs continuously under the entire span 850–1800 — a missed B1/B2 jump is always a safe fall, never a hazard.

**Why a player would choose the upper route:** the lower street is faster (no climb) but flat and empty; the upper route is the only place in Zone B with collectibles (3 coins, one per awning) and a brief, low-risk platforming beat before the café's rest point — it's a "detour for reward," not a shortcut and not a gate. This matches the V6 blueprint's own design rule ("at least two distinct solutions… but a single understandable main progression") without inventing a new mechanic.

---

## 2. Zone E — Deretan Bumbung (3650–5450), REDESIGNED

**Structurally distinct from Zone B:** Zone B is flat/repeated (3 same-height jumps). Zone E is a **varied-height chain**: 2 jumps up, 1 ladder (the single bigger rise), then 2 jumps back down — ending at street level right at M2. Moving platforms are deferred per the V6 feasibility review's confirmed architecture limit (no tweened/velocity-driven bodies exist in `game.js`); **fixed platforms only** for V6.1.

Street (y=1000) runs continuously beneath the **entire** jump chain (x=3650–5090, right up to the M2 gate), so any missed jump is a safe fall-and-retry, never a respawn — satisfying "lower-route recovery" for the whole sequence, not just one spot.

| Step | Launch | Landing | Horizontal gap | Vertical change | Window | Margin used | Recovery |
|---|---|---|---|---|---|---|---|
| E0→E1 (jump) | (3850, 1000) | (3950, 960) | 100px | rise 40px | 24.4–183.6px | 75.6px below max | fall to street, safe |
| E1→E2 (jump) | (4090, 960) | (4200, 896) | 110px | rise 64px (24px from ground) | 43.6–164.4px | 54.4px below max | fall to street, safe |
| E2→E3 (ladder) | x=4300, climbs 896→800 | — | — | rise 96px (ladder, not jump — this is the chain's "one bigger rise") | n/a | n/a | climb down again, no respawn |
| E3→E4 (jump, **descent**) | (4460, 800) | (4610, 940) | 150px | **drop 140px** | max range 265px (interpolated) | ~115px below max | fall to street, safe |
| E4→street (jump, descent) | (4760, 940) | (4910, 1000) | 150px | drop 60px | max range ~235px (interpolated) | ~85px below max | lands directly on street |

Platform spans: E1 x=3950–4090 (140px), E2 x=4200–4360 (160px), E3 x=4300–4460 (160px, reached only via the ladder at x=4300), E4 x=4610–4760 (150px). Ladder: x=4300, top=800, bottom=896.

**The meaningful descent:** E3→E4→street is a genuine lower-route recovery beat, not a repeat of the climb — it's the one place in the level where going *down* is the intended next move rather than a failure state, directly answering the brief's "include at least one meaningful descent."

**Puzzle 2 / route mechanism:** M2 terminal sits at (4910, 1000) — exactly where the E4→street descent lands — and the M2 gate (5090–5440, 350px wide, confirmed un-jumpable by the V6 feasibility review) opens immediately after. The descent chain **feeds directly into the puzzle**, giving Puzzle 2 a visible, walkable route mechanism rather than an isolated terminal.

**Why this differs from Zone B, concretely:** Zone B never changes height (dy=0 throughout) and has no ladder mid-sequence; Zone E changes height on every single step (rises of 40/64/96, then drops of 140/60), uses exactly one ladder for the one rise too big to jump, and ends with a descent instead of a landing on a flat run. No mirrored ladders, no repeated platform widths (140/160/160/150 vs B's uniform 120/120/120).

---

## 3. Camera composition — proposal (code NOT changed)

**Current:** `cameras.main.startFollow(player, true, .14, .16, -85, 60)`, bounds top = 220. Established in the V5 audit: `offsetY=+60` biases the frame to show more sky **above** the player than ground **below** — the direct cause of the "excessive empty sky" complaint, worsened by `bounds.top=220` permitting the camera to scroll hundreds of pixels into a region nothing in the level (current or V6.1) ever occupies (the highest point in either Zone B or Zone E is y=800).

**Proposed correction (not implemented):**
- `offsetY`: 60 → **10**. Keeps a small upward look-ahead (so an upcoming jump's landing platform is still visible before the player leaves the ground) without dedicating most of the frame to sky.
- `bounds.top`: 220 → **650**. Nothing in the level — current, V6, or V6.1 — ever reaches above y=800 (V6.1's highest point, Zone E's E3 ladder-top); 650 leaves ~150px of headroom above that for jump arcs while eliminating the few-hundred extra px of pure-sky scroll room that exists today.
- `offsetX` stays **unchanged** (−85) — it already does its job (shows upcoming obstacles in the direction of travel); no complaint was raised about horizontal framing, so it's left alone per "minimizes unnecessary... change."
- Monochrome Kenney style and viewport size are untouched — this is purely a follow-offset/bounds numeric change, requiring **zero new art**.

See `level-v6.1-camera-review.png` for the before/after diagram, drawn at the game's actual logical viewport (648px tall, ~1258px wide — derived from the measured 1920×1080 frame aspect ratio 1.942:1 recorded during the V5 camera audit), using Zone E's E2/E3 as the illustrated excerpt (the tallest point in the new geometry, i.e. the worst case for empty sky). The diagram estimates the before/after share of the frame occupied by empty sky at this point — it is a proportional illustration from the stated offset/bounds numbers, not a captured screenshot, since no camera code has been changed to capture one from.

---

## 4. What stays exactly as approved

Seven zones A–G (names/order unchanged) · three function puzzles with unchanged formulas/answers (`f(3)=7`, `3x−2=10 ⇒ x=4`, `4x−3=17 ⇒ x=5`) · three checkpoints · `MOTION` physics constants (`jump=520`, `gravity=1400`, `speed=280`) unchanged · Kenney New Platformer Pack only, no new art · solo gameplay · final bridge + completion screen. Zones A, C, D, F, G are **unchanged from the V6 proposal** (all were APPROVE verdicts in the feasibility review; this pass only revises B and E and proposes the camera numbers, per the brief's explicit scope).
