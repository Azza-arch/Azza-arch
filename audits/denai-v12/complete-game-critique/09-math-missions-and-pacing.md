# 09 — Math education and mission design

Every zone evaluated against the brief's own checklist, using `mechanisms.js`/`level.js`/`dialogue.js` as ground truth for what the player actually does and what feedback they get. Mathematical correctness of the content itself is not disputed anywhere in this audit — the actual arithmetic (f(x)=2x+1, g(x)=3x−2, their compositions and inverses) is correct throughout, confirmed by direct calculation against every target value cited in source.

## A — Initial function intuition (the "probe" terminal, x=1692)
- **Physically does:** Picks input 0-3 at a free-standing terminal, presses "Lihat output," reads f(x)=2x+1 result. No gate, no target to hit.
- **Math:** Direct function evaluation.
- **Choice requiring reasoning:** None — every input is equally valid, nothing to solve for.
- **Brute-forceable:** Trivially — there is nothing to force, it's a free sandbox.
- **Changes the world:** No.
- **Feedback:** Clear, immediate.
- **Fun / too easy / repetitive:** This terminal exists purely as an ungated, zero-stakes *first contact* with the notation — appropriate for that narrow role, not intended to be a "puzzle." Confirmed via its complete absence of a gate/target in source. Not a defect; it's correctly scoped as an intro, not a test.

## B — Lift code (B-selector + lever, target output 7)
- **Physically does:** Cycles input 0-4 at the selector (separate from the lever, both in-world, no modal needed), walks to the lever, tests.
- **Math:** f(x)=2x+1=7 → solve for x=3.
- **Choice requiring reasoning:** Yes, genuinely — only one of five inputs (0-4) hits the target, and nothing in the world states the answer; the player must either compute 2x+1=7 or brute-force by testing (confirmed: all 5 inputs are selectable with no restriction).
- **Brute-forceable:** Yes — 5 inputs, free retry, no penalty. A player can solve this by trying all five without ever doing algebra. This is a real, confirmed weakness if the goal is to exercise solving 2x+1=7 rather than evaluating f at five values and noticing which matches — **but it is also the correct design for a first mechanism**, matching B1/B2's "teach through safe experimentation before testing" pattern. The brute-force path is a feature at this stage, not a bug.
- **Changes the world:** Yes — raises a real bridge, visible, persistent (gate-solved state saved).
- **Feedback:** Strong — readout text, lift motor sound/tween, a visible physical consequence.
- **Fun / too easy / repetitive:** Good as a first mechanism. Not repetitive in isolation.

## C — Optional pattern discovery (two clue signs + apply sign)
**The brief specifically flags this zone for scrutiny, and the scrutiny is warranted — checked directly against source, not assumed:**
- **Physically does:** Presses E at clue sign A (shows f(0)=1), presses E at clue sign B (shows f(1)=3), then presses E at the apply sign.
- **What the apply sign actually does, per `applyCPattern()` (confirmed from source):** `if(this.cClues.size<2){announce('Perhatikan dua papan...');return;} const output=2*terminal.value+1; announce(...); this.discoverSecret('bonus-mapping');` — **the apply action succeeds unconditionally once both clues have been seen. There is no test, no input the player selects, no chance to be wrong.** The "corak disahkan" (pattern confirmed) message fires regardless of whether the player actually inferred the +2-per-+1 pattern or simply walked to three signs in sequence and pressed E each time.
- **Does the player have to infer or select anything meaningful?** **No — confirmed, not a judgment call.** This is exactly the risk the brief named in advance ("may still be a press-E sequence rather than genuine problem-solving"). It is confirmed true by direct source reading: `applyCPattern` takes a `terminal` parameter but never reads player input, never branches on a wrong answer, and the chill-bubble line that *sounds* like a discovery ("Eh, setiap kali input naik satu, hasilnya naik dua!") is a **scripted line that fires automatically** (`this.say('found:c-pattern')`) once both clues are seen — the game states the pattern to the player in dialogue, it does not wait for the player to state it.
- **Verdict:** C is, as implemented, a three-beat **press-E sequence with scripted flavor text**, not a pattern-recognition puzzle, despite its framing suggesting otherwise. This does not make it *bad* (it's a calm, optional, low-stakes discovery beat, and the brief's own role for C is "elevated optional discovery path," which it does deliver atmospherically) — but it should not be counted as a place where students practice inductive reasoning, because the game does the inducting for them.
- **Recommendation (design direction, not implemented):** The smallest fix that preserves C's calm tone: require the player to *select* a predicted output value (even from 2-3 options) at the apply sign before confirming, rather than auto-confirming on arrival. This would cost no new assets (reuses the existing token-button UI already built for every other terminal) and would convert C from "walk past three signs" into "guess, then check" — genuinely closing the gap the brief asked about.

## D — Number-block workshop (target g(x)=3x−2=10)
- **Physically does:** Either presses E directly on a numbered block (2/3/4) for an instant test, or interacts with the console sign for a modal that does the same thing via a dial (file 04, R08's redundancy finding).
- **Math:** 3x−2=10 → x=4.
- **Choice requiring reasoning:** Only 3 candidates, same brute-forceable structure as B.
- **Changes the world:** Yes, bridge opens.
- **Feedback:** Clear; wrong blocks physically return to the rack with a tween, a nice small piece of "the world responds" feedback.
- **Fun / repetitive:** Structurally identical in shape to B (pick a candidate, test, get a bridge) — the "workshop" framing and physical block objects are a genuinely different *presentation* even though the underlying decision shape repeats.
- **Prepares for later challenges?** Not meaningfully — it's the same shape as B, just a different equation, so it doesn't build toward anything D-specific that G later needs.

## E — Waterworks composition (order F-then-G vs G-then-F, target 19)
- **Physically does:** Reads two stage signs, picks an order, activates, watches an animated flow traverse the pipe with intermediate values shown at each stage.
- **Math:** Function composition — f(3)=7, then g(7)=19 (correct order) vs g(3)=7, then f(7)=15 (wrong order) — note both orders happen to produce the same *intermediate* value (7) via different functions, which is a genuinely interesting, non-obvious wrinkle (confirmed via `evaluateWaterOrder`'s math, not asserted) that a flat multiple-choice couldn't communicate as well as watching the two paths animate differently.
- **Choice requiring reasoning:** Yes — exactly 2 options, so "brute-forceable" in the trivial binary sense, but the animated feedback (seeing F(3)=7 then G(7)=19 play out step by step) is the best *pedagogical visualization* in the entire game — this is DENAI's strongest single teaching moment, confirmed by direct comparison against every other puzzle's feedback richness.
- **Changes the world:** Yes, strongly — reservoir fills, bridge lowers.
- **Repetitive relative to D's composition console (R10):** Yes, confirmed in file 04/07 — same decision (which order), same functions (f/g), same input family, encountered roughly 500px apart in sequence. E's presentation (the animated flow) is meaningfully richer than D's console (a static readout), so E earns its place; D's version, directly adjacent, adds little the player hasn't already seen moments later.

## F — Moving platform + optional inverse cave
- **Physically does (main route):** Pure traversal, no math.
- **Physically does (cave, optional):** Given f(x)=7, select the input that produces it — i.e., invert f(x)=2x+1.
- **Math:** The only *inverse*-direction reasoning in the entire game.
- **Choice requiring reasoning:** Yes, genuinely — this is structurally different from every forward-solve puzzle elsewhere (B/D/E/G's first lock), because the player must reason backward from an output rather than forward from an input, confirmed by direct comparison of `testInverseInput()`'s logic against every other puzzle's forward-evaluate-and-compare logic.
- **Prepares for later challenges:** **No, and this is a missed opportunity, confirmed structurally:** the inverse skill is optional, appears exactly once, and nothing afterward (including G's finale) asks for it again. A player who skips F-cave never encounters inverse reasoning at all in the entire game.

## G — Final river bridge (two sequential locks)
**The brief specifically asks whether this builds on earlier mechanics or merely repeats them with bigger numbers — checked directly:**
- **Lock 1:** h(x)=4x-3=17, solve for x=5. Same decision shape as B/D (pick from 0-9, test, read result) — **this is confirmed to be exactly B/D's pattern with a new linear function and a larger candidate pool (0-9 instead of 0-4), i.e., "bigger numbers," not a new skill.**
- **Lock 2:** Compare f(2) then g(5)=13 vs g(2) then f(4)=9, pick the order giving 13. Same decision shape as E's waterworks (pick an order, test) — **confirmed to be E's exact mechanic reused with different target numbers.**
- **Does the finale build on earlier mechanics, or merely repeat them with bigger numbers?** **The brief's suspicion is confirmed: it is the latter.** Both locks are directly traceable, move-for-move, to earlier puzzles (B/D for lock 1's shape, E for lock 2's shape). The split-hinge lever and two-stage reveal *present* this well (file 06's finding that the lever is the most bespoke prop in the game stands), but mechanically, G's finale asks nothing of the player that D and E didn't already ask, just with the two decision types chained together and larger numbers.
- **Is this necessarily bad?** Not automatically — a finale that *combines* two previously-separate mechanics into one sequence is a legitimate "conclusion" beat in the kishōtenketsu sense (B1), IF the combination itself is the twist. Here, though, the two locks are fully independent and sequential (lock 2 cannot even be attempted until lock 1 is solved, confirmed via `cycleRiverSelect`'s branching on `solvedGates.has('river-input')`) — they are concatenated, not combined, so the "twist" the structure implies isn't actually present.

## Cross-cutting findings

- **Mandatory puzzles that feel like exams:** None of the *required* puzzles (B, D, E, G) use a text-input answer field or a "submit" form — all are world-embedded, free-retry, no-penalty selections. This is a genuine strength; the brief's exam-feel concern is **not substantiated** for the mandatory path. (The dead `#puzzle` dialog, which *does* have an exam-style text-input form with a hint-request button, is never actually shown to players — see file 11 — so it cannot be contributing to this feeling in practice, though its presence in the codebase is worth cleaning up regardless.)
- **Puzzles with no meaningful decision:** Confirmed — Zone C's apply sign (above) and, more mildly, the brute-forceable small-candidate-set puzzles in B/D (acceptable per their "first mechanism" role, not acceptable if G's finale were meant to be the hard test and still offers no more rigor than B).
- **Repetitive actions:** Confirmed at the decision-shape level across B/D (forward solve) and D-console/E/G-lock2 (order comparison) — four of seven zones' core puzzle verb is one of exactly two underlying shapes.
- **Weak emotional payoff:** The completion screen (file 11) is clean but generic ("LEVEL 1 SELESAI," a time/coin/secret tally) — it does not reference the specific mathematical journey (e.g., doesn't say anything like "you solved 2 linear functions, 1 composition, 1 inverse, and a 2-step bridge" even though that's exactly what happened and would cost nothing to add, reusing data already tracked).
