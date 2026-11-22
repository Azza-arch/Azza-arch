# 13 — Player perspectives and playtest plan

**Everything in this file's heuristic-evaluation section is a predicted risk/hypothesis grounded in this audit's confirmed findings (files 03-12), explicitly NOT observed human playtest data.** No user feedback is fabricated anywhere below.

## Heuristic evaluation, by perspective

### 1. New player, never seen DENAI
- **Likely confusion:** The redundant D interaction paths (direct block press vs. console modal, file 04/09) — a new player may try the console first, get a modal with hidden token options, and not understand why pressing blocks directly also worked, or vice versa.
- **Potential frustration:** Low — free retry everywhere (file 08) means no punishing failure state to be frustrated by.
- **Enjoyment opportunities:** The waterworks flow animation (file 12) and the split-hinge lever (file 06) are the two moments most likely to land as genuinely delightful to a first-time player, based on their objectively higher production value relative to everything around them.
- **Reading burden:** Low-moderate — rule text (file 11) is the densest text in the game but is well-separated from flavor dialogue.
- **Control problems:** None predicted — coyote time/jump buffering (file 07D) should make the one real jump forgiving.
- **Mission clarity:** Weak (file 10) — a first-time player has no concrete sense of *why* beyond "deliver supplies."
- **Difficulty fit:** Likely too easy throughout (file 07B's flat curve), though this may be appropriate for the intended student audience — needs playtest, not asserted as definitively wrong.
- **Motivation to continue:** Moderate — optional secrets/coins provide light pull; the flat challenge curve (file 07) is the main risk to sustained engagement.

### 2. Student weak in functions
- **Likely confusion:** Zone C's auto-confirming apply sign (file 09) is the biggest risk *specifically for this player* — a student who hasn't actually grasped the pattern will be told "corak disahkan" (pattern confirmed) regardless, which could reinforce a false sense of understanding.
- **Potential frustration:** Low, by design (free retry) — a genuine strength for this specific player type.
- **Enjoyment opportunities:** The worked-solution toggle (file 11, opt-in, always available) is well-suited to this player — they can self-pace into more support without being forced through it.
- **Reading burden:** The rule text (file 11's flagged example) may be the single biggest friction point for this player specifically — dense, equation-plus-instruction text in one block.
- **Control problems:** None predicted.
- **Mission clarity:** The always-correct, always-current `missionObjective()` (file 07/11) is a genuine strength for this player — they're never lost on *what* to do next even if *why* is unclear.
- **Difficulty fit:** The brute-forceable candidate sets (file 09) may actually help this player build intuition through trial — not necessarily bad for this specific audience, contrary to how it reads for an advanced player (#3 below).
- **Motivation to continue:** Needs playtest — depends heavily on whether the lack of escalation (file 07B) reads as "approachable" or "unrewarding" to this specific player.

### 3. Student already confident with functions
- **Likely confusion:** None predicted.
- **Potential frustration:** **Highest risk of any persona** — the brute-forceable puzzles (B, D, both locks of G, file 09) give this player no reason to actually compute anything; a confident student can solve the entire mandatory path by trying every candidate without doing algebra once, which directly undercuts the stated educational goal for exactly the player who could handle more.
- **Enjoyment opportunities:** The optional inverse-cave (F, file 09) is the one puzzle in the game that would genuinely interest this player — and it's entirely skippable.
- **Reading burden:** Low for this player.
- **Control problems:** None predicted.
- **Mission clarity:** Same as above.
- **Difficulty fit:** **Confirmed-risk: too easy**, per file 07B's flat curve finding — this is the player type most likely to disengage.
- **Motivation to continue:** Low-moderate — needs playtest, but the structural finding (flat escalation, brute-forceable puzzles) makes this the persona most at risk of boredom, not a guess.

### 4. Experienced 2D platformer player
- **Likely confusion:** None predicted.
- **Potential frustration:** Likely frustrated by the near-absence of platforming challenge (file 07A's "one real jump in the whole game" finding) if they came in expecting a platformer rather than a puzzle-adventure.
- **Enjoyment opportunities:** The movement feel itself (coyote time, buffering, animation polish, file 07D) would likely read well to this player even with little to apply it to.
- **Reading burden:** N/A for this persona's specific concerns.
- **Control problems:** None predicted — the movement system is competently built.
- **Mission clarity:** N/A.
- **Difficulty fit:** Likely reads as too easy platforming-wise, confirmed by file 07A's measured finding, not a guess about this persona's taste.
- **Motivation to continue:** Depends entirely on whether they re-frame their expectation from "platformer" to "puzzle game with light platforming" (file 07A's recommended framing) — a genuine risk if marketing/framing doesn't set that expectation first.

### 5. Casual mobile player
- **Likely confusion:** Possible — touch-control responsiveness was not independently verified in this audit (file 07D), a real unknown, not a predicted-safe assumption.
- **Potential frustration:** The `#mechanism` panel's width (`min(420px,43vw)` desktop, full-width mobile per CSS, file 11) should scale down reasonably per source, but true mobile layout wasn't screenshot-verified (file 11's disclosed limitation) — flag as unknown, not safe.
- **Enjoyment opportunities:** The short per-zone puzzle structure (file 04) suits short mobile play sessions well, structurally.
- **Reading burden:** Potentially higher on a small screen even with CSS scaling — unverified.
- **Control problems:** Touch targets are confirmed ≥44px everywhere (file 07D/11, Accessibility reference) — a good sign, but not the same as confirmed-comfortable on an actual device.
- **Mission clarity:** Same as persona 1.
- **Difficulty fit:** Same as persona 1/2.
- **Motivation to continue:** Unknown — needs real-device playtest specifically, listed below.

### 6. Keyboard-only player
- **Likely confusion:** None predicted — full keyboard mapping confirmed (A/D, arrows, Space, W/S, E, R, Esc, Tab-trap in dialogs).
- **Potential frustration:** None predicted from source; Tab-focus scoping (file 11) was reasoned from code, not live-tested with actual repeated Tab presses — a real gap in verification, not a confirmed problem.
- **Enjoyment opportunities:** The dense keyboard shortcut set (H for hint, arrows for dial adjustment inside mechanism panels, confirmed in `game.js`'s keydown handler) is well-suited to this player.
- **Reading burden:** N/A.
- **Control problems:** Lowest-risk persona based on source evidence — this game was clearly built keyboard-first.
- **Mission clarity:** Same as persona 1.
- **Difficulty fit:** Same as persona 1.
- **Motivation to continue:** Likely the best-served persona of the seven, based on how thoroughly keyboard interaction is covered in source.

### 7. Player who prefers low-pressure exploration
- **Likely confusion:** None predicted.
- **Potential frustration:** Very low — this is arguably the persona DENAI is *best* built for: no damage, no timers, no combat, generous optional-route rewards (file 08).
- **Enjoyment opportunities:** The three optional routes (C, crate ledge, F-cave) are well-suited and well-rewarded (file 07A/09).
- **Reading burden:** N/A.
- **Control problems:** None predicted.
- **Mission clarity:** Low narrative payoff (file 10) may matter less to this persona, who is motivated by exploration itself rather than plot.
- **Difficulty fit:** Good fit — the flat, forgiving curve (file 07B) that risks boring persona 3 is likely a genuine strength for this persona.
- **Motivation to continue:** Likely the second-best-served persona, for the same structural reasons as persona 7's low-pressure fit.

## Small real human playtest plan

**Participants:** 4-6 Form 4 students (the actual target audience), ideally spanning a self-reported range from "struggles with functions" to "confident with functions" — matching personas 2 and 3 specifically, since those are where this audit's own findings diverge most (file 09's brute-force concern matters differently to each). Add 1-2 adults/older students as a rough stand-in for personas 4-6 if genuine platformer-experienced or keyboard-only testers aren't available among the student group.

**Method:** Individual, think-aloud sessions, 15-25 minutes each (the game's own measured median-ish playtime per the completion screen's time tracking, file 09), screen-recorded with consent, moderator silent except for the checkpoints below.

**Tasks (in order, no hints given unless the student is fully stuck for >2 minutes):**
1. Start a new game and play from the welcome screen with no instruction beyond "find your way across."
2. At Zone B (first mechanism): observe whether the student computes 2x+1=7 or tries inputs 0-4 in order — this directly tests file 09's brute-force concern.
3. At Zone C: after seeing both clues, ask the student *before* they press the apply sign: "what do you think the output will be?" — tests whether the pattern was actually internalized (file 09's core concern) independent of what the game itself confirms.
4. At Zone G: after solving lock 1, ask "does this feel different from the lift/blocks earlier, or does it feel like the same kind of puzzle?" — directly tests file 09's finale-repetition finding.
5. At the completion screen: ask "what were the supplies, and who were they for?" — directly tests file 10's narrative-thinness finding.
6. Post-session: ask the student to rate (1-5) how much platforming vs. puzzle-solving the game felt like it was about — tests file 07A's "framing" finding.

**Observation questions for the moderator to log, not ask aloud:**
- Did the student ever stop to actually compute an equation, or only test-and-check? (file 09)
- Did the student notice/use the worked-solution toggle, the hint button, neither, or did they not need either? (file 11)
- Did the student explore any optional route unprompted? (file 07A)
- Any moment of visible confusion, backtracking, or "wait, where do I go" — log the exact room (cross-reference against file 04's room list).
- Any moment of visible delight/surprise — log the exact room (cross-reference against file 12's feedback-moment table to see if it correlates with the richer-feedback moments identified there).

**Completion indicators:** Reached the destination within the session, regardless of % collectibles/secrets found (those are optional by design, file 08).

**Success criteria for this specific playtest round:**
- At least 3 of 4-6 students correctly predict Zone C's output *before* confirming (tests whether file 09's proposed fix, if later implemented, would actually need to happen, or whether real students already reason it out even though the game doesn't require them to).
- At least half of students solve at least one mandatory puzzle (B, D, or G-lock-1) via visible computation rather than pure trial-and-error, logged by the moderator watching for pencil/scratch-work or verbal math versus silent clicking through 0-4/0-9.
- No student reports being stuck for >3 minutes without eventually self-recovering (tests whether the always-forward-visible next-landmark pattern, file 07A, actually works as guidance in practice, not just in screenshot review).

This plan is sized to be practical for a solo developer/teacher to run informally (no lab, no eye-tracking, no large recruitment) while still directly answering the specific open questions this audit could not resolve from code/screenshots alone.
