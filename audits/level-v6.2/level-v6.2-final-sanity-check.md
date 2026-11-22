# Lorong Atas Bumbung — V6.2 Final Design Sanity Check

**Status: review only. No source, physics, camera, asset, or test file modified.** This pass re-examines the two recommendations from `level-v6.2-route-options.md` (B1 and E2) against the live implementation architecture (`src/game.js`, `src/level.js`) and finds that **E2 is not implementable as proposed** — a genuine physics contradiction, not a style concern — and that **B1's shortcut framing is too weak to justify the obstacle it adds**. Both findings below are corrected with revised, lower-risk alternatives. `level-v6.2-approval.md` is updated to carry the new recommendation; `level-v6.2-route-options.md`, `-jump-validation.csv`, and the Zone B/E detail PNGs are **not** regenerated in this pass (flagged as stale, listed in Part 4) since the brief scopes this pass to review, not re-delivery.

---

## Part 1 — Zone B: is the B1 shortcut meaningfully beneficial?

### The problem with B1 as proposed

`level-v6.2-route-options.md` quantified B1's advantage at **~0.15–0.4s**, achieved by adding a street-level crate obstacle purely to make the upper route compare favorably. Re-examined on its own terms:

- **0.15–0.4s is below the threshold a player can perceive or plan around.** It is not a "shortcut" in any meaningful sense — a player cannot form the belief "the roof is faster" from a margin this small, especially given the comparison also depends on acceleration ramps that mostly cancel between the two routes (i.e. the true in-game margin could easily read as zero or even reverse under real input noise).
- **The crate obstacle exists for no reason other than to manufacture that number.** It has no other gameplay purpose (it is not introduced as a general level-dressing element elsewhere in Zone A/B), which fails Part 4.1's own test: *"If a platform [or obstacle] adds no distinct purpose, remove or redesign it."* The obstacle's only purpose is self-referential — making the time comparison come out positive.
- **The three-awning silhouette is untouched.** B1 kept all three `awning-b1/b2/b3` at identical height/width — the single biggest visual complaint (`level-v6.2-current-problems.md` §1: *"reads as one repeated shape"*) is not actually addressed by adding a crate to the street below it.

### Revised recommendation: two-platform, varied-height Zone B (no manufactured obstacle)

Drop the street-level crate entirely. Cut the upper route from three same-height awnings to **two platforms at different heights**, and justify the route by what it teaches, not by a fabricated time saving.

| Element | Live/B1 value | Revised value | Why |
|---|---|---|---|
| `awning-b1` | x1250–1370, y900 | **unchanged** (x1250–1370, y900) | Keep the already-playtested ladder-up landing |
| `awning-b2` (was b3) | x1750–1870, y900 (same height as b1) | **x1550–1700, y960** (150px wide, 60px lower than b1) | First *varied-height* jump in the whole level — see below |
| `awning-b3` | x1500–1620, y900 | **removed** | Was the redundant middle element producing the "three identical towers" read |
| Ladder up | x1280 (900↔1000) | unchanged | |
| Ladder down | x1850 (900↔1000) | **x1700 (960↔1000, 40px climb)** | Shorter than the ladder up (100px) — the two ladders are no longer identical either, which was its own small repetition the live geometry never addressed |
| Jump B1→B2 | n/a (was two dy=0 jumps) | one jump, gap 150px, drop 60px | window ~235px (interpolated, matches the drop-60 case already validated for `roof-e4→street` in V6.1), margin 85px (64% utilized) — comfortably safe |
| Street obstacle | crate (B1 proposal) | **removed** | No longer needed; this version does not claim a time advantage |

**Why this is a stronger design than either B1 or B2:**

Every jump currently in the live level before Zone E is **dy=0** (`FIRST_GAP`, and all three live awning-to-awning jumps). The first jump anywhere in the game with a non-zero height change is `street→roof-e1` in Zone E (rise 40px) — a **mandatory** jump the player meets with zero prior practice at judging a jump with vertical change. The revised Zone B route's single B1→B2 jump (drop 60px) becomes the PRACTICE step the Part 4.2 ladder (INTRODUCE→PRACTICE→COMBINE→VARY→APPLY) was always missing before Zone E's COMBINE/VARY steps. This is a real, structural justification — not a fabricated clock number — and it simultaneously fixes the repetition complaint by construction (two platforms, two different heights, two different-length ladders, one jump instead of two identical ones).

The lower street remains exactly as it is live today (no obstacle added) — honestly optional, not dishonestly "faster." The reason to choose the upper route is: 2 coins (unchanged `coin-b1`/`coin-b2`, repositioned onto the new b1/b2) + the only chance in the level to practice a height-varied jump before it becomes mandatory in Zone E.

### Final decision — Zone B

| | B1 (as proposed: 3 awnings + obstacle) | Revised (2 platforms, varied height, no obstacle) |
|---|---|---|
| Gameplay purpose | Manufactured time-saving (imperceptible) | Teaches the level's first non-flat jump before Zone E requires it |
| Player readability | 3 identical shapes, reward unclear vs. cost | 2 distinct shapes/heights, reward is clearly "coins + practice" |
| Visual composition | Unchanged 3-tower repetition | Repetition removed by construction (fewer, varied elements) |
| Implementation complexity | New street prop + no deck changes | One deck removed, one deck's y/width/ladder changed, no street prop |
| Failure recovery | Fall to street, unchanged | Fall to street, unchanged (same recovery property, now also validated against the drop-60 case already proven safe in V6.1) |
| **Recommended** | — | **Yes — supersedes B1** |

---

## Part 2 — Zone E: is the raised terrain lip (E2) valid?

### Physically checking the lip against the live kinematics

The E2 proposal required the chain's final jump (`roof-e4` y=940 → pocket y=1000, drop 60px) to arc **over** a ~200px lip whose top sits at y≈780–800, while also requiring that same lip to be tall enough (top ≤ y≈903, i.e. >96.6px rise above the y=1000 street) to block a standing jump from the ground. Checking both constraints against `MOTION.jump=520`, `WORLD.gravity=1400`:

```
max_rise = v0² / (2g) = 520² / 2800 = 96.6px
Highest point reachable during the roof-e4→pocket jump (launched at y=940):
  peak_y = 940 - 96.6 = 843.4  (the player can never get numerically below/higher than y≈843)
Lip top as proposed: y≈780 (i.e. more elevated than 843.4)
  → the player's best-case height (843.4) never reaches the lip's top (780): the jump CANNOT clear it.
Tallest a wall can be and still block a street-level (y=1000) standing jump: y ≤ 903.4
  → but the e4 launch point itself is at y=940, already below (903.4), so ANY wall tall enough
    to block the street is, by construction, also taller than the platform the "clearing" jump
    launches from. No wall height satisfies both requirements simultaneously.
```

**This is a hard contradiction, not a tuning problem.** E2 as proposed is **not implementable** — the final descending jump would collide with the lip's face rather than clear it. This supersedes the "implementation risk: low" rating E2 was given in `level-v6.2-route-options.md`; that rating assumed the lip could be placed without re-checking it against the chain's own launch height, which this pass corrects.

### Re-examining the brief's six checks for E2 as proposed

- **Physically justified?** No — independent of the physics break above, a lone ~200px gray slab sitting beside flat street on both sides reads as a placed wall, not a building. (The project's asset set does include `assets/production/Houses` and `HouseParts` — a building-corner representation is available in principle, but doesn't rescue the geometry, which is the actual defect.)
- **Readable as "why rooftop is required"?** Only if a player assumes an impassable collision box is intentional, since nothing shows *why* it's there without dedicated art.
- **Safe retry after falling?** For the chain's first four jumps, yes (unaffected by the lip). For the final jump specifically, no retry is even reachable — the jump as designed cannot succeed at all, by any input, since it's a physics impossibility, not a skill check.
- **Accidental softlock/bypass?** The lip's full-height solid face (y780–1000) would itself be landable-on from `roof-e3`/`roof-e4` (both near that height), risking the opposite problem: a player could jump **onto the lip's top** and potentially skip part of the intended pocket entry, or get stranded on it with no ladder down.
- **Terminal reachable after solving?** Moot — the terminal is reachable today in E2 only via a jump that cannot physically land where designed.
- **Creates another block-tower silhouette?** Yes, and worse than Zone B's: to make the lip simultaneously tall enough to block the street (needs top ≤ y903) AND short enough for the chain to clear it (needs top ≥ y940, per the math above) is impossible — any attempt to "fix" this by making the lip taller still (to definitely block the street) only makes the silhouette problem worse, in the exact direction Part 14 warns against.

### Revised recommendation: relocate the terminal onto `roof-e3`, not a new wall/pocket (this is the brief's "E1" direction, refined)

Checked against the **live** proximity-detection code (`game.js:240-242`):

```js
nearestTerminal() {
  return TERMINALS.find(t => !this.solvedGates.has(t.gate)
    && Math.abs(this.player.x-t.x)<115 && Math.abs(this.player.body.bottom-t.feet)<48);
}
```

Interaction requires both `|x-t.x|<115` **and** `|body.bottom-t.feet|<48` — a tight *vertical* window, not an x-only check. This means simply moving `TERMINALS.p2`'s `feet` value off the street is sufficient on its own, with no wall, no pocket, and no `GROUND_RANGES` split required at all.

**Where to put it — checked for bypass, not just reachability:** placing the terminal on `roof-e4` (y=940, only 60px above the street) was the brief's literal "E1" suggestion, but re-checking against the kinematics shows it does **not** prevent bypass: a 60px rise with a ~100px horizontal gap (street directly below `roof-e4`'s west edge) sits well inside the safe jump window (~165–180px max for that rise), so a player could jump directly from the open street onto `roof-e4` and reach a terminal placed there, skipping `roof-e1`/`roof-e2`/the ladder/`roof-e3` entirely — reintroducing the exact "long jump bypass" the brief's Part 9 explicitly forbids.

`roof-e3` (x4880–5040, y=800) does not have this problem: it is a **200px rise** above the street, nearly **2.1× the 96.6px theoretical max jump rise** — a direct street jump to it is categorically impossible, not just impractical. It is also already the chain's sole ladder-gated chokepoint (`LADDERS`: x=4900, top=800, bottom=896) — the one step V6.1 already built as "too big to jump," so this reuses an existing, already-validated chokepoint instead of inventing a new one.

| Change | Current (live) | Revised |
|---|---|---|
| `TERMINALS.p2` | x=5570, feet=1000 (open street) | **x=5020, feet=800** (on `roof-e3`, near its east/forward edge) |
| `GROUND_RANGES` | `[4300,5650]` | **unchanged** |
| New geometry | — | **none** — no wall, no pocket, no new ladder |
| Chain flow | street→e1→e2→ladder→e3→e4→street (e4 optional for reaching M2 once terminal moves) | street→e1→e2→**ladder (mandatory chokepoint)**→e3 (**solve M2 here**)→e4→street (e4 becomes the labeled *optional descent branch*, matching Part 9's required mandatory/optional split) |
| `rooftop-gate` | x=5650, opens on solve, ground-level | unchanged |
| Reaching the gate after solving | n/a | climb back down the ladder (e3→e2→e1→street) **or** continue forward via the already-playtested `e3→e4→street` descent — both reach the same open gate; no new mechanism |

This also resolves a gap the original E2 design didn't: Part 9 asks for an explicit separation between a **mandatory rooftop path** and an **optional rooftop branch**. Moving the terminal to `roof-e3` makes that split fall out naturally — `street→e1→e2→ladder→e3` is strictly mandatory (the only way to reach M2), and `e3→e4→street` becomes a genuinely optional "meaningful descent" branch (still available, still rewarding `coin-e2`, but no longer load-bearing for puzzle access).

### Final decision table — Zone E

| | E2 (raised lip + pocket, as proposed) | E1-refined (terminal relocated to `roof-e3`) |
|---|---|---|
| Gameplay purpose | Block street access to M2 | Block street access to M2 |
| Player readability | Ambiguous gray wall, no clear signal of purpose | Terminal visibly sits on the chain's highest reachable deck — same visual language as the other two terminals (`p1` beside its gate, `p3` on the hill plateau) |
| Visual composition | Forces a block-tower silhouette contradiction (see physics check) | No new geometry at all — zero silhouette risk |
| Implementation complexity | **Not implementable as specified** (physics contradiction) | **Lowest possible** — one data value (`TERMINALS.p2.feet`, `.x`) changes; `DECKS`/`LADDERS`/`GATES`/`GROUND_RANGES` all untouched |
| Failure recovery | Final jump cannot succeed by design; earlier jumps unaffected | Unaffected — all five chain jumps keep the exact already-playtested V6.1 recovery behavior (fall to continuous street) |
| Bypass prevention | Broken (see above) | Confirmed: 200px rise vs. 96.6px max jump rise — categorically unbypassable, unlike the originally-suggested `roof-e4` placement which was checked and found bypassable |
| **Recommended** | — | **Yes — supersedes E2** |

---

## Part 3 — Updated recommendation summary

1. **Zone B:** revised two-platform, varied-height layout (no street obstacle) — supersedes B1 and B2.
2. **Zone E:** terminal relocation to `roof-e3` (feet=800) — supersedes both E2 (broken) and the brief's literal E1 suggestion of placing it on `roof-e4` (bypassable).
3. Both revisions are **lower implementation risk** than what they replace: Zone B now needs one deck removed + one deck's coordinates/ladder changed (no new prop); Zone E now needs a single terminal coordinate change and nothing else.

`level-v6.2-approval.md` is updated accordingly in this same pass.

## Part 4 — Stale artifacts from the prior pass (flagged, not regenerated here)

- `level-v6.2-route-options.md` — Zone B and Zone E sections now superseded by Parts 1–2 above; left in place as the record of what was first proposed and why it was revised, per the project's existing audit-trail convention (V6.1's own documents are never edited after the fact, only superseded by the next pass).
- `level-v6.2-jump-validation.csv` — the `lower-street-obstacle` and `lip-barrier` rows are now obsolete; a future pass should replace them with the B1-revised jump (gap150/drop60) and remove the lip-barrier row entirely (no lip exists in the final design).
- `level-v6.2-proposed-topology.png`, `level-v6.2-zone-b-detail.png`, `level-v6.2-zone-e-detail.png` — all three render the superseded geometry and should be regenerated in the implementation-adjacent pass, not in this review-only pass.

**Stopping here per the explicit "review only... stop after the design review" instruction. No source, physics, camera, asset, or test file was modified.**
