# Level V6 Topology — Feasibility Review

**Mode: review only. No source files modified, no assets generated, no implementation.**
Inputs reviewed: `C:\Users\syhaz\Downloads\level-v6-blueprint.md` and `level-v6-proposed-topology.png` (the `docs/level-v6/` path mentioned in the request doesn't exist in the repo — files were read from their actual Downloads location, not copied into the repo, consistent with "no source modifications"). Cross-checked against `audits/level-v5/level-v5-audit.md` and the current, unmodified `src/level.js`/`src/game.js`.

Per instruction, **PNG pixel positions were not used as source coordinates** — only the blueprint's own stated numeric spans/targets were used for the math below. The PNG was used only to confirm sequencing, relative composition, and to flag any visual implication (e.g. "three awnings across a 950px zone") worth a numeric sanity check.

---

## 1. Jump feasibility — the governing math

From `level-v5-audit.md` §2: configured `MOTION.jump=520`, `MOTION.gravity=1400`, `MOTION.speed=280`; measured natural-input max flat jump = **217px** horizontal / **92px** rise (empirically, with continued mid-air acceleration — slightly above the constant-speed theoretical 208px). Computed just now from the same constants, for a jump landing on a platform **raised by `dy`** above the takeoff point (theoretical, constant-max-speed basis — the conservative figure to design against):

| Rise (dy) | Earliest possible landing distance | Latest possible landing distance |
|---|---|---|
| 0px (flat) | — | 208px |
| 32px | 19px | 189px |
| 64px | 44px | 164px |
| 96px (≈max rise) | 96px | 112px |

**Max achievable rise is 96.6px**, full stop — no jump in V6 may require more than that, ever, without a ladder.

**Verdict on the blueprint's own stated target** ("practical first-pass gaps ≤140–155px at equal heights"): **sound and appropriately conservative** — well inside the 208px theoretical / 217px measured envelope, leaving real margin for imperfect player run-up. This review's corrections below are stated as adjustments to *this* target when a rise is also involved, not a rejection of it.

**Finding on the PNG's own illustration:** Zone B's three awning platforms and Zone E's four chained platforms (E1–E4) are drawn with what reads as wider, less-uniform spacing than the 140–155px target the blueprint text sets for itself. This is exactly the discrepancy the task asked me to check for — **the blueprint text, not the PNG's visual spacing, must govern implementation.** Flagged explicitly in the zone verdicts below rather than silently corrected, since exact per-platform x-coordinates aren't given in the Markdown (the blueprint itself says so: "not exact usable source coordinates").

---

## 2. Moving platform — current architecture check

Confirmed by source inspection (`src/game.js`, full file, this session and the prior V5 audit): **no entity in the current scene has a velocity-driven or tweened position** — `DECKS`/`GATES`/`LADDERS` are all static bodies (`physics.add.existing(body, true)`), and there is no update-loop code moving any platform. **A moving platform is not supported by the current architecture** and would require new engine code (position tweening + carrying the player, or velocity-matched collision), which is explicitly out of scope for "no physics changes."

The blueprint already anticipates this exact finding (§"Design rules", bullet 4; decision gate 3) and proposes the correct fallback itself. This review's answer: **adopt the blueprint's own fallback — a fixed intermediate platform — for this pass.** The PNG's own "Platform bergerak (cadangan)" label already marks it as tentative/proposal-only, consistent with this conclusion.

---

## 3. Cave cutout feasibility

Confirmed from V5 audit §7 (asset inventory): the Kenney New Platformer Pack has no cave-mouth or tunnel-ceiling sprite. The blueprint correctly anticipates this too ("actual cave needs collision cutout, not a tunnel through solid fill"). The existing implementation's `gua-alcove` (a small elevated ledge, muted tint, explicit "Gua (pilihan)" label, reached by its own ladder) is the realistic ceiling for what this asset pack can represent — **not** a literal tunnel through the ground. V6's Zone F should reuse that exact pattern rather than attempt a true cutout-tunnel, which would read as a floating gap in the ground with no visual cave framing around it (same failure mode as the "random stacked blocks" problem already fixed in prior passes, just inverted).

---

## 4. Zone-by-zone verdicts

### A — Taman Perumahan (0–850): **APPROVE**
120px flat gap, generous landing, matches the existing `FIRST_GAP` (currently 120px at x=420) almost exactly. Well inside the measured-safe envelope (208-217px). No changes needed to this zone's concept.

### B — Lorong Pekan (850–1800): **REVISE**
Concept (3 awnings, optional, no mandatory ladder, rejoin ground) is sound and directly addresses the V5 finding that the old B/E upper routes were identical two-platform sequences — 3 platforms in B now reads as structurally distinct from E. **Required correction before implementation:** the zone is 950px wide for 3 platforms + gaps + ground rejoin; if divided naively that implies ~230-280px average gap, which **exceeds even the flat-ground 208px theoretical max**, let alone an elevated one. Each B1→B2→B3 gap must be individually sized to the ≤140–155px target (or smaller if any vertical rise is involved — if B2 is meaningfully higher than B1/B3 as the PNG suggests, use the dy=32 or dy=64 row above, not the flat-ground number). Recommend: if a short ladder (not a direct jump) connects each awning as the PNG's orange support lines suggest, that resolves the risk entirely — ladders have no horizontal-distance constraint. **This must be confirmed as "ladder access," not "direct elevated jump," before implementation** — the blueprint text doesn't state which, and the two have very different risk profiles.

### C — Café Atas Angin (1800–2600): **APPROVE**
CP1 position, optional roof, easy return — directly matches the existing, already-proven `cafe-roof`/`cp1-cafe` pattern (V5 Zone C verdict: KEEP). Also directly addresses V5's finding that the café had "no distinguishing geometry" (V6 keeps it simple but gives it the roof + explicit "Halangan"/landmark framing). No feasibility concerns.

### D — Bengkel Fungsi (2600–3650): **APPROVE**
M1 at ~3030, ~430px approach from the zone start (2600→3030) — this is the single most important fix relative to V5's findings: the old 870px dead approach is roughly halved. Gate width 350px (3170–3520) is safely un-jumpable (133px margin over the measured 217px max, matching the smallest of the three *current* gates exactly — proven safe by the existing test suite's own jumpability check). No feasibility concerns; this directly resolves V5's largest single flagged problem.

### E — Deretan Bumbung (3650–5450): **REVISE**
Two issues:
1. **Moving platform (beat 10):** not supported by current architecture (see §2). **Must be replaced with a fixed intermediate platform for this pass** — the blueprint's own fallback, adopted here as the required correction, not optional.
2. **Chained E1→E2→E3→E4 with varying elevation:** this is exactly the right idea to fix V5's finding that Zone E's old upper route was a flat-height repeat of Zone B's — but every individual rise+gap pair in this chain needs the dy-adjusted range check from §1 before finalizing, not just the flat-ground target. Concretely: **no single jump in this chain should require more than ~60-70px of rise** (leaving real margin below the 96.6px theoretical ceiling, which only gives a ~16px-wide safe horizontal window at the limit — impractical for natural play) — if the diagram implies a rise close to or exceeding that for any step, use a short ladder for that step instead of a direct jump, same principle as the Zone B correction above. M2 gate (350px, 5090-5440) is safely un-jumpable, same reasoning as D — no concern there.

### F — Bukit Tanjung & Gua (5450–6550): **APPROVE**
CP2 at zone start, optional cave route, CP3 before the final obstruction — this is structurally almost identical to the *current* Zone F, which V5 already verdicted as the best-executed zone in the level (real optional branch, clear single purpose, no feasibility issues). Cave should use the existing ledge-based representation, not a literal cutout tunnel (§3). No other concerns.

### G — Jambatan Sungai (6550–7400): **APPROVE**
M3 at ~6650, gate 6810-7190 (380px, safely un-jumpable), goal at 7310 — matches the current, already-verified-correct G pattern (gate immediately precedes goal, no filler after). No feasibility concerns.

---

## 5. Does V6 solve the V5 findings?

| V5 finding | V6 response | Assessment |
|---|---|---|
| Zone B and Zone E upper routes were structurally identical | B now has 3 simple same-tier-ish awnings; E now has 4 platforms with varying elevation and (pending §2's correction) a fixed intermediate platform standing in for the moving-platform idea | **Resolved in concept**, pending the per-jump dy corrections in §4 |
| Zone D's 870px dead approach | Shortened to ~430px | **Resolved** |
| Café had no distinguishing geometry | Keeps the existing roof+checkpoint pattern (already adequate per V5) | **Unchanged / already adequate** |
| Camera's large empty-sky appearance (V5 §6, root cause: `+60` follow offset + content concentrated near y=824-1000) | **Not addressed** — V6's platform y-values remain in the same ~824-950 band as the current build; camera config isn't part of this blueprint | **Not resolved — flagged as a residual, separate issue**, same conclusion as V5's risk register (would need its own pass if still unsatisfactory after V6's geometry lands) |

---

## 6. Asset feasibility (Kenney pack)

No new finding beyond V5 §7: terrain/ladder/lever/sign/flag/bridge are all proven and sufficient for every mechanic V6 proposes (including the now-rejected moving platform's fallback — a fixed deck tile is the same asset already in use). "Awnings" (Zone B) have no dedicated sprite, same limitation as "café"/"house" in V5 — represent with the existing deck+ladder pattern, not new art, consistent with every prior pass's asset policy.

---

## 7. What needs approval before implementation

1. **Zone B**: confirm each B1→B2→B3 connection is ladder-based (not a direct elevated jump) — or, if jump-based, confirm exact per-gap distances ≤155px with any rise ≤32px (per §1's table).
2. **Zone E**: confirm the moving platform is deferred (fixed platform substitute) for this pass — this review recommends yes, per the blueprint's own fallback.
3. **Zone E**: confirm each E1→E2→E3→E4 rise is ≤60-70px, or substitute a ladder for any step exceeding that — needs a concrete per-step decision before coordinates are finalized, since the current blueprint doesn't give exact per-platform x/y.
4. **Camera**: explicit decision on whether the residual "empty sky" issue (unresolved by V6's geometry alone) is in scope for this pass or deferred — V6's text doesn't address it, so this needs a yes/no before implementation claims to have "fixed" the visual-emptiness complaint in full.
5. **Cave**: confirm Zone F's cave stays as an elevated-ledge representation (matching the current, already-built pattern), not a literal ground cutout-tunnel.

**Overall verdict: 5 of 7 zones APPROVE as-is (A, C, D, F, G); 2 need REVISE (B, E) — both revisions are narrow, numeric (gap/rise sizing) or a single substitution (moving→fixed platform), not structural rejections.** This is a materially stronger blueprint than a from-scratch proposal would be, specifically because it already incorporates the right caveats (its own §"decision gates" already names 5 of the 6 concerns this review independently confirmed) — the main value this review adds is the precise dy-adjusted range numbers in §1, which the blueprint asked for but didn't have the means to compute itself.

Stopping here per the review-only scope. No source modified; `git status` on `app/addmath/rooftop/` shows the directory still untracked with no new changes from this review (same state as before it began).
