# Lorong Atas Bumbung — V6.2 Route Options (Zone B & Zone E)

**Status: proposal only. No source modified.** All jump kinematics reuse the already-verified, already-playtested constants from `audits/level-v6.1/level-v6.1-blueprint.md` and the natural-input results in `audits/level-v6.1/level-v6.1-implementation-report.md` (Step 6) — this pass changes **ground topology** (where the safety-net street does and doesn't reach) and **route purpose**, not jump physics.

```
v0 = 520 (MOTION.jump), g = 1400 (WORLD.gravity), speed = 280 (MOTION.speed)
range_window(dy) = (t1*speed, t2*speed), t1,t2 = (v0 ∓ sqrt(v0² - 2*g*dy)) / g
max rise = v0² / (2g) = 96.6px   |   measured natural-input flat jump: 217px
```

| Rise dy | Safe window | Rise dy | Safe window |
|---|---|---|---|
| 0px | 0–208px | 64px | 43.6–164.4px |
| 40px | 24.4–183.6px | 96px | ladder only (exceeds max rise) |

| Drop | Max descent range |
|---|---|
| 60px | ~235px (interpolated) | 140px | ~265px (interpolated) |

---

## ZONE B — two alternatives

### B1 — Rooftop shortcut (RECOMMENDED)

**Concept:** the lower street gains a single, small, **non-hazardous** obstacle (a Kenney crate/prop stack, no gap, no damage) between x≈1320 and x≈1420 — the player must hop it, costing a short deceleration-and-rejump beat. The upper route (unchanged jump geometry: `awning-b1/b2/b3`, dy=0, 130px gaps, already verified) runs straight over the top of that same stretch with no obstacle at all. The two routes now cover the **same horizontal span** (ladder-up x=1280 to ladder-down x=1850, 570px) but at different cost:

| Route | Actions | Time cost (estimate, design-level) |
|---|---|---|
| Lower (street) | walk 570px + 1 hop-obstacle (brief deceleration + jump-and-land, ~0.35s overhead, no horizontal distance saved by the hop) | ~570/280 + 0.35 ≈ **2.4s** |
| Upper (awnings) | ladder up (100px climb @ `MOTION.climb=150px/s` ≈ 0.67s) + B1→B2 jump (130px @ run speed ≈ 0.46s) + B2→B3 jump (130px ≈ 0.46s) + ladder down (100px ≈ 0.67s) | ≈ **2.26s** |

The upper route is faster by a modest, honest margin (~0.15–0.4s depending on acceleration ramps, which are identical in both routes and mostly cancel) **and** carries zero obstacle-interaction risk. This is a real, if small, shortcut — not a "shortcut" in name only. It is deliberately modest: Zone B is the player's *first* route choice in the level (Part 4.2, INTRODUCE step), so the reward for finding the upper path should be legible, not decisive.

- **Route length:** lower 570px + 1 obstacle; upper 570px equivalent (100+130+130+100+climb-down 100... climb counted separately above) — same horizontal span, different vertical profile.
- **Difficulty:** trivial (two dy=0 jumps already playtested in V6.1 at 78px margin below the 208px max; the new lower-street obstacle is a simple hop, not a jump check).
- **Recovery:** missing a B1→B2/B2→B3 jump drops the player 100px onto the unchanged continuous street (`[540,3850]` stays intact) — safe, no respawn, matches V6.1's already-verified behavior exactly.
- **Reason to choose it:** genuinely faster, plus still carries the two repositioned coins (`coin-b1`, `coin-b2`) — reward and time both favor it, instead of reward alone.
- **Asset needs:** one Kenney crate/prop (static, non-colliding-with-ladder-logic obstacle, same category already used for level dressing) placed on the existing street tile — no new art category, no physics change (the obstacle is a simple solid prop the player jumps over using existing jump input, not a new mechanic).
- **Implementation cost:** low. No `DECKS`/`LADDERS`/`GATES` coordinate changes at all — Zone B's upper route geometry is **unchanged** from the already-shipped V6.1 numbers. The only new data is one static prop placement on the ground layer.

### B2 — Optional discovery (alternative, not recommended)

**Concept:** leave the lower street exactly as it is today (flat, fast, zero obstacles) and instead make the upper route's reward a one-time discovery beat — e.g. a short vista/lore prop on `awning-b2` in addition to the coins, with no timing advantage at all.

- **Route length / time:** identical to the live V6.1 numbers — lower street is strictly faster, upper route is strictly slower (ladder + 2 jumps + ladder vs. a flat walk).
- **Difficulty / recovery:** identical to B1's upper-route figures.
- **Reason to choose it:** exploration-only; a time-cost-averse or speed-focused player has zero incentive to ever take it.
- **Asset needs:** one new decorative/lore prop on `awning-b2` (a Kenney sign or similar static dressing).
- **Implementation cost:** lowest of the two (no street-side prop needed), but **does not resolve the Part 4.1 failure case** — it is the same "coin-only, return to the same street" pattern already present today, just with an extra non-coin collectible added on top. Rejected as the primary fix for exactly this reason.

**Recommendation: B1.** It is cheaper to reason about (no new mechanic, only a static prop and an honest time accounting) and it is the only one of the two that actually answers "why would the player choose this route?" with something other than "a coin."

---

## ZONE E — two alternatives

Both alternatives reuse the **exact** already-playtested jump chain from V6.1 (Street→`roof-e1` rise 40px / `roof-e1`→`roof-e2` rise 64px / ladder `roof-e2`→`roof-e3` rise 96px / `roof-e3`→`roof-e4` drop 140px / `roof-e4`→landing drop 60px — see `level-v6.2-jump-validation.csv`). Neither alternative changes a single jump number. Both solve the same problem — the continuous `[4300,5650]` ground range currently lets the player bypass the whole chain — by changing **where the ground does and doesn't reach**, not by changing physics.

### E1 — Elevated Machine 2

**Concept:** extend `roof-e4` itself (5200–5350 → 5200–5650, 450px) into a terminal deck. Relocate `p2`'s terminal onto this deck (e.g. x=5570, feet=940 — matching the deck's own height, not street height). `rooftop-gate`'s opening is likewise raised to sit at the same y=940 band; after solving, the player descends a short ladder (new, ~60px, well under one page of climb time) from the terminal deck to ground level on the far side of the now-open gate to continue into Zone F.

- **Reachability:** the terminal is physically unreachable without being on the extended `roof-e4` deck — there is no ground-level approach to x=5570 at y=940 at all.
- **Recovery:** the street beneath the whole chain (`[4300,5450]`, trimmed from the live `5650` endpoint) stays continuous for every fall between `roof-e1` and `roof-e4` — missing any jump drops the player back to the familiar recovery street, not into a void.
- **Bypass prevention:** no ground-level path reaches y=940 at x>5350 under this design — there is nothing to walk into.
- **Implementation risk:** **medium**. Requires moving `TERMINALS.p2`'s `feet` value off the ground datum every other terminal in the file uses (`p1.feet=1000`, `p3.feet=824` — both are ground-plane values for their respective zones, so an elevated `feet=940` terminal is not unprecedented in kind, but it is a new height for terminal-interaction code to be exercised at, which the brief's own Part 13 flags as something to verify, not assume).

### E2 — Rooftop-to-terminal access (RECOMMENDED)

**Concept:** keep `p2`'s terminal exactly where it is today — ground plane, `feet=1000` — but relocate it inside an enclosed landing pocket. Trim the continuous ground range from `[4300,5650]` to `[4300,5450]` (recovery street) + `[5450,5650]` (terminal pocket), and insert a short, solid raised terrain lip (a Kenney rock/building-corner tile group, ~100px wide at x≈5350–5450, collision height ~200px — deliberately far above the 96.6px max jump rise) between them. The recovery street and the pocket are both ordinary ground at y=1000; only the lip separates them horizontally. The chain's final descending jump (`roof-e4`→landing, drop 60px, already verified) arcs from y=940 down into the pocket, clearing the lip's ~800-ish top height from above — the same jump already playtested in V6.1, just landing in a now-enclosed space instead of an open one.

- **Reachability:** a player walking east along the recovery street hits the lip and is physically blocked (visible solid terrain, not an invisible wall, per Part 13's explicit requirement) — the only way into the pocket is the final jump off `roof-e4`.
- **Recovery:** identical safety property to E1 — every jump in the chain still has continuous ground directly beneath it on the west side; a short-fallen final jump lands back on the recovery street (adjacent to, not past, the lip), never in a void.
- **Bypass prevention:** the lip's height (~200px) is more than double the 96.6px theoretical max jump rise — confirmed un-jumpable from a standing start on the street side, with no need for an un-walkable gap or any new "unless solved" gate logic.
- **Implementation risk:** **low**. `p2`'s `feet` value is untouched (still 1000, consistent with `p1` and the original design), no new ladder, no elevated-terminal interaction case to verify — the only new elements are a `GROUND_RANGES` split and one static raised-terrain prop, both are existing data shapes the engine already handles (`GROUND_RANGES` is already an array of disjoint segments; `FIRST_GAP` already proves a deliberate ground discontinuity works end-to-end).

### Comparison table

| | E1 (Elevated M2) | E2 (Pocket access) |
|---|---|---|
| Purpose achieved | Rooftop traversal gates M2 | Rooftop traversal gates M2 |
| Difficulty | Same reused jump chain | Same reused jump chain |
| Route length | Chain unchanged (4550→5650, ~1100px) | Chain unchanged (4550→5650, ~1100px) |
| Expected traversal time | ~8–9s full chain (ladder + 4 jumps, design estimate) | ~8–9s full chain (same) |
| Risk | New elevated terminal height, new short ladder down | None beyond the existing chain |
| Recoverability | Full-chain recovery street preserved | Full-chain recovery street preserved |
| Asset needs | Deck extension, elevated gate visual, 1 short ladder | 1 raised-terrain lip prop (visual only) |
| Implementation cost | Medium | Low |

**Recommendation: E2.** It achieves the identical gameplay outcome — Machine 2 is unreachable without completing the rooftop chain — with a smaller, lower-risk change: no terminal-height precedent is introduced, no new ladder, and the fix is legible as "a rock blocks the street, the roof doesn't."
