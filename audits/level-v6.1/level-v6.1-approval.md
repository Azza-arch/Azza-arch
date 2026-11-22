# Lorong Atas Bumbung — V6.1 Approval & Completion Report

**Status: design-only. No source file modified; no implementation performed.** Verified at the end of this document via `git status --porcelain app/addmath/rooftop/`.

---

## 1. Current vs V6 vs V6.1 topology comparison

| Aspect | Current (`src/level.js`) | V6 (external proposal) | V6.1 (this pass) |
|---|---|---|---|
| Zone B upper route | `town-upper-1`/`town-upper-2`, 2 platforms, same height as Zone E's pair — the exact "structurally identical" problem V5 flagged | 3 awnings, no exact gap sizing given (implied ~230–280px, exceeds safe envelope) | 3 awnings, **explicit** same-height (y=900) flat jumps, 130px gaps each (verified safe, 78px margin below the 208px max), 1 ladder up + 1 ladder down only |
| Zone E upper route | `roof-e1`/`roof-e2`, 2 platforms, same shape as Zone B's pair | 4 chained platforms (E1–E4) + 1 moving platform (architecturally unsupported), no per-step rise given | 4 fixed platforms, **explicit** varied rises (40/64/96 via ladder/140 drop/60 drop), moving platform dropped entirely, every step individually verified against the kinematic window table |
| Zone D approach | 870px dead flat stretch before M1 | Shortened to ~430px (M1 near 3030) | **Unchanged from V6** — already APPROVE in the feasibility review, out of scope for this pass |
| Camera | `offsetY=60`, `bounds.top=220` — large empty sky, confirmed but never addressed in V5 or V6 | Not addressed at all | **Proposed correction**: `offsetY=10`, `bounds.top=650` (not implemented) |
| Moving platform | n/a (never existed) | Proposed, flagged tentative by V6's own PNG label | **Rejected for V6.1** — confirmed unsupported by `game.js` (no tweened/velocity bodies exist); fixed platforms substituted, per the V6 feasibility review's own recommendation |

## 2. How Zone B and Zone E now play differently

Zone B is a **flat, repeated-shape** detour: three identical-height jumps, zero elevation change, zero ladders mid-sequence, purely a "coin side-path" with a single up/down ladder pair bookending it. Zone E is a **varied, directional** sequence: every single step changes elevation (two rises of different size, one ladder for the step too large to jump, then two descents of different size), and it ends by feeding directly into the M2 puzzle rather than looping back to where it started. The two routes no longer share a shape, height profile, or ladder pattern — directly resolving the V5/V6 "repetitive" finding instead of just asserting it's resolved.

## 3. How previously empty stretches have been reduced

- Zone B's lower street is unchanged and still open, but the upper route now gives a player a reason to leave it (3 collectibles + a short, safe platforming beat) across the full 850–1800 span instead of 2 flat platforms with large unused gaps between them.
- Zone E's chain now occupies continuous, deliberate geometry from x=3850 to x=4910 (1060px of the 1800px zone), with the street beneath it fully walkable too — removing the "flat filler before the gate" pattern V6 left unresolved (V6 gave no per-platform spacing, which risked leaving large unused gaps between E1–E4 if implemented literally from the PNG).
- Zone D's shortened 430px approach (from V6) is preserved unchanged — already the single biggest fix for "empty" from the original V5 finding, not revisited here since it was already APPROVE.

## 4. Platforms and ladders to remove or replace (relative to current `level.js`)

| Current entry | Action under V6.1 | Replacement |
|---|---|---|
| `town-upper-1` (Zone B deck) | **Remove** | B1 (x=1000–1120, y=900) |
| `town-upper-2` (Zone B deck) | **Remove** | B2 (x=1250–1370, y=900) + B3 (x=1500–1620, y=900) — one old platform becomes two new ones |
| Zone B ladder(s) tied to `town-upper-1/2` | **Remove, reposition** | Ladder up at x=950 (900↔1000), ladder down at x=1580 (900↔1000) |
| `roof-e1` (Zone E deck) | **Remove** | E1 (x=3950–4090, y=960) |
| `roof-e2` (Zone E deck) | **Remove** | E2 (x=4200–4360, y=896) + E3 (x=4300–4460, y=800) + E4 (x=4610–4760, y=940) — one old platform becomes three new ones |
| Zone E ladder tied to `roof-e2` | **Remove, reposition** | Single ladder at x=4300 (800↔896), serving only the E2→E3 rise |
| "Moving platform" (never implemented, V6 proposal only) | **Drop entirely** | Not needed — V6.1 uses fixed platforms only |

No checkpoint, gate, terminal, `FIRST_GAP`, or ground-range boundary changes — none of V6.1's changes touch the x-positions the V5 risk register flagged as checkpoint-adjacent (`CHECKPOINTS[i].feet`), so that P0 risk class does not apply to this pass.

## 5. Remaining risks

| Risk | Severity | Note |
|---|---|---|
| `LADDERS` entries are matched to `DECKS` by exact `y` equality in the current collision/climb logic (per the V5 risk register, P0) | P0 if implemented carelessly | Both new ladders (B: 900↔1000, E: 800↔896) must have their `top`/`bottom` set to exactly match the new deck `y` values listed above — same mitigation class already proven by the existing test suite |
| `GROUND_RANGES`/`GATES` pairing (V5 risk register, P0) | P0 if implemented carelessly | Not touched by this pass — no gate or ground-range boundary moves in V6.1 — but must stay true if a future pass combines this with any Zone D change |
| Camera proposal is illustrative, not measured from a running build | P1 | The before/after sky-share percentages in `level-v6.1-camera-review.png` are computed proportionally from the stated offset/bounds numbers against the new V6.1 geometry, not captured from an actual modified camera — real screenshots can only be taken once (if) the offset/bounds change is implemented |
| Zone E's E2/E3 ladder-adjacency (E2 at x=4200–4360, E3 at x=4300–4460, overlapping in x by design since the ladder sits at their shared edge x=4300) needs careful collision-box placement | P1 | Not a physics problem (the kinematics never assume simultaneous occupancy), but the implementer must ensure the ladder's overlap-trigger zone doesn't conflict with either platform's one-way-collision body — flagged for implementation-time attention, not a design flaw |
| Awning/rooftop-chain visual representation still has no dedicated Kenney sprite (same limitation V5 and V6 both already accepted) | P2 | Unchanged from prior passes — represent with the existing deck+ladder tile pattern, no new art, consistent with every previous pass's asset policy |

## 6. The five V6 feasibility-review approval points — recommendation on each

1. **Zone B: ladder-based vs direct jump, confirm exact gaps.** → **Resolved in this pass.** V6.1 uses direct flat jumps (dy=0, the safest case), each gap fixed at 130px — well inside the 0–208px window, with ladders reserved only for the up/down bookends, not for inter-platform travel. Recommend **approve for implementation** once reviewed.
2. **Zone E: confirm moving platform deferred, fixed substitute adopted.** → **Confirmed, adopted.** V6.1 drops the moving platform entirely (not "deferred to a later pass" — simply not part of this design) and uses 4 fixed platforms instead. Recommend **approve**.
3. **Zone E: confirm each rise ≤60–70px or substitute a ladder.** → **Followed, with one necessary exception.** Rises of 40px and 64px (E0→E1, E1→E2) are jumps, both within the recommended ≤60–70px guidance. The 96px rise (E2→E3) **exceeds** that guidance by design — per the feasibility review's own fallback ("substitute a ladder for any step exceeding that"), it is a ladder, not a jump. Recommend **approve** — this is exactly the substitution the feasibility review anticipated, not a deviation from it.
4. **Camera: in scope or deferred for this pass?** → **In scope as a proposal, not an implementation.** This pass produces concrete numbers (`offsetY: 60→10`, `bounds.top: 220→650`) and a before/after diagram, but per the brief's explicit instruction ("do not change camera code yet"), nothing is implemented. Recommend: **approve the proposed numbers for a future implementation pass**; this design pass cannot itself close out the "is it fixed" question since no code changed.
5. **Cave (Zone F): confirm elevated-ledge representation, not a literal cutout tunnel.** → **Unchanged, confirmed.** Zone F is out of scope for V6.1 (it was already APPROVE in the V6 feasibility review and the brief's corrections target only B, E, and camera). Recommend **approve, no change** — continue using the existing `gua-alcove` ledge pattern.

---

## 7. Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
No output beyond the pre-existing untracked state noted at the start of this task — confirms zero source, physics, asset, or UI files were modified during this design pass. All four V6.1 deliverables live under `audits/level-v6.1/`, parallel to but outside the live game source, consistent with the V5/V6 pattern.

**Stopping here per the explicit "strictly design-only... stop after producing the V6.1 design review" instruction.**
