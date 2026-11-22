# 16 — Redesign masterplan

## Three directions, compared honestly

### A. Minimal correction
**Scope:** Fix the confirmed technical/UI bugs (ISSUE-03, 04, 11) and the cheapest, lowest-risk content fixes (ISSUE-05 C's apply-sign check, ISSUE-07 moving-platform tint, ISSUE-08 narrative lines, ISSUE-13 completion text) — roughly issues 3/4/5/7/8/11/12/13 from file 15. Leave world geometry (ISSUE-02, 10), challenge progression (ISSUE-01), and UI visual reskin (file 11's 8C) untouched.

- **Expected player-experience gains:** Fixes the one reproducible bug, closes the one place the game's framing oversells itself (C's fake pattern-check), adds a real narrative thread at near-zero cost, and fixes the clearest small-prop legibility gap (moving platform). Does **not** touch the two things this audit found to matter most (structural repetition, flat challenge curve).
- **Implementation effort:** Low — every item in scope is S or S-M complexity, all source-verified, all with exact file/function targets already identified in file 15.
- **Asset requirements:** None — every fix reuses existing assets/techniques already proven elsewhere in the codebase.
- **Save compatibility:** Fully preserved — none of these items touch `schemaVersion`/`layoutVersion` or require new save fields beyond what `DialogueQueue`'s existing additive-id pattern already supports.
- **Gameplay risks:** Minimal — C's apply-sign fix is the only one that changes puzzle logic, and it's a small, well-scoped addition (require a prediction) to an already-existing UI pattern.
- **Testing workload:** Low — each fix has a clear, narrow acceptance criterion (file 15).
- **Potential regressions:** Low risk across the board.
- **Suitability for a solo developer with limited AI coding budget:** **High.** This is a realistic single-session or two-session scope.

### B. Targeted redesign
**Scope:** Everything in A, plus: vary the structural module proportions zone-by-zone (ISSUE-02, 10), give the moving platform and D's console their resolved roles (ISSUE-06, 07), rework G's finale to genuinely combine rather than concatenate its two locks (ISSUE-01, partial), and pursue the UI visual-direction research flagged in file 11 (8C) as a genuine next step (NOT a specific asset pack purchase/import yet — the research step first, since this audit explicitly declined to recommend a pack sight-unseen).

- **Expected player-experience gains:** Directly addresses the two biggest findings of this entire audit (zone identity, challenge flatness) without touching room layout, collision, or the core puzzle math. Would meaningfully move scorecard categories 1, 2, 5, 9, 13 (file 14) from 2-3 toward 4.
- **Implementation effort:** Medium — the structural-variation work (ISSUE-02/10) is the largest single piece, touching `environment.js`'s per-zone sections repeatedly but not its terrain-generation core logic; G's finale rework (ISSUE-01) requires care in `mechanisms.js`/`save.js` to keep the sanitize-on-load robustness intact.
- **Asset requirements:** None for the geometry/mission work (reuses existing frames at different proportions/spans, same technique already used throughout). The UI-skin research step may surface an asset requirement later, but that's explicitly a *follow-up decision*, not a requirement of this direction itself.
- **Save compatibility:** Preserved for the geometry work (no save-schema touch). G's finale rework would need `save.js`'s `sanitize()` updated carefully if lock-interdependency changes what a "valid" solved-state combination looks like — doable (the file already has this exact kind of cascading-invalidation logic for the existing river locks) but requires real care, flagged honestly as the one place in this direction with non-trivial save-logic risk.
- **Gameplay risks:** Low-medium — the finale rework is the one piece that changes established puzzle logic for a zone some players may already be mid-playing on an existing save; needs the same kind of backward-compatible sanitize logic already proven elsewhere in this codebase.
- **Testing workload:** Medium — needs the file 13 playtest to validate the finale rework specifically (a code read alone can't confirm "does this feel like synthesis now").
- **Potential regressions:** Medium — any geometry change near collision-adjacent decks needs the same "art-only, collision-untouched" discipline Phase 6.5C2A/6.5C2B already demonstrated is achievable in this codebase.
- **Suitability for a solo developer with limited AI coding budget:** **Good, with phasing.** This is realistically 3-5 scoped sessions (one per zone's geometry pass, one for G's finale, one for UI research), each independently shippable and testable — matching the exact incremental pattern this project has already successfully used across Phases 6.5C2A/B.

### C. Larger level redesign
**Scope:** Reconsider room flow and encounter design substantially — e.g., restructure which puzzle types appear in which order, add genuinely new platforming challenge (file 07A's finding that there's essentially one jump in the whole game), rebuild zone identity through actual terrain-shape changes (not just proportion variation) per zone.

- **Expected player-experience gains:** Potentially the largest, but **unproven** — this audit found no evidence that DENAI's core problem is "not enough platforming" or "wrong room order," only that the *execution* of the existing, sound structure is repetitive. A larger redesign risks solving problems that weren't found (file 08's explicit warning against adding systems without evidence applies here too, by the same logic) while reintroducing the exact things the brief explicitly says to avoid (rebuilding the map, moving platforms, changing physics).
- **Implementation effort:** High.
- **Asset requirements:** Likely, depending on scope — new terrain shapes beyond what the current module vocabulary supports.
- **Save compatibility:** High risk — any room-flow change likely requires a `layoutVersion` bump, which (per `save.js`'s own sanitize logic) means **every existing player's save becomes invalid** — a real, concrete cost this audit can confirm from source, not a vague risk.
- **Gameplay risks:** High — touches the mathematically-correct, already-validated puzzle logic across every zone simultaneously.
- **Testing workload:** High — a full regression pass across all 16 rooms, not a scoped few.
- **Potential regressions:** High.
- **Suitability for a solo developer with limited AI coding budget:** **Poor.** This is explicitly the direction the brief's own framing ("do not recommend a total rebuild automatically") and this project's own successful history (incremental, narrowly-scoped phases, each independently verified) both argue against.

## Recommendation: Direction B (Targeted redesign), phased

**Justification:** Direction A alone leaves this audit's two most important, most evidenced findings (structural repetition, flat challenge curve) unaddressed — fixing only the cheap items would mean the owner's core stated dissatisfaction (world composition, zone identity) remains exactly as it is today. Direction C is not supported by evidence found in this audit — nothing here suggests DENAI's *content* or *room count* is wrong, only its *execution variety*, and C's save-compatibility cost is real and avoidable. Direction B is the only one that directly targets what this audit actually found, at a cost and risk level consistent with how this project has successfully shipped improvements before (the Phase 6.5C1→6.5C2A→6.5C2B sequence is itself a working example of exactly this "targeted, phased, independently-verified" approach, already proven on this exact codebase).

**Recommended phase order, each independently shippable and independently testable, matching the project's own established pattern:**
1. Direction A's full scope (bugs + cheap wins) — lowest risk, immediate, no dependencies.
2. Structural proportion variation, one zone at a time, starting with Zone B's R04 climb (ISSUE-02, the single clearest documented instance) as the pilot — validates the technique before applying it elsewhere.
3. Zone identity pass for A/D/F (ISSUE-10), using whatever proportion-variation technique phase 2 validates.
4. G's finale rework (ISSUE-01) last, specifically because it's the one item touching save-schema logic — do it once the lower-risk phases have already shipped and been verified stable.
5. UI visual-direction research (file 11, 8C) as a parallel, independent track that can start anytime — it doesn't depend on or block any of the above.

This phasing lets the owner see and approve progress incrementally (matching how this audit itself was commissioned as a review-before-authorize step) rather than committing to one large, high-risk, all-at-once redesign.
