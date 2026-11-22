# 15 — Prioritized issue register

Severity reflects player-experience impact, not ease of fixing — per the brief, "add another bush" does not outrank "players cannot recognize the intended route" regardless of which is easier to implement. **No P0 issues were found anywhere in this audit** (nothing breaks the game or blocks completion) — stated plainly since that's itself a significant, evidence-based finding (file 14, category 19).

---

### ISSUE-01 — Flat challenge progression; G's finale repeats earlier decision shapes
- **Severity:** P1
- **Category:** Mission/level design
- **Zone/Room:** Cross-cutting (B, D, E, G specifically — R05, R08, R10, R11-12, R15)
- **World coordinate:** N/A (structural, not a location)
- **Screenshot reference:** N/A (behavioral finding, not visual)
- **Evidence type:** Source-verified (direct comparison of `mechanisms.js` decision logic across `runLiftExperiment`, `selectNumberBlock`, waterworks order choice, `runRiverLock1`/`chooseRiverOrder`)
- **Current behavior:** Every mandatory puzzle in the game is one of two decision shapes (pick-from-a-small-set-and-test, or pick-an-order-and-test); G's two locks are confirmed to be these exact same two shapes with larger numbers, not a new skill or a genuine combination.
- **Why it harms player experience:** Confirmed-risk of disengaging the exact confident-student persona the game should be stretching (file 13, persona 3); the finale does not read as "hardest version of a journey," it reads as "same thing again" per direct mechanical comparison.
- **Root cause:** Each zone's puzzle was authored independently around its own equation rather than around an escalating skill ladder.
- **Exact recommended change:** Not implemented here (read-only audit). Direction: make F's inverse-reasoning skill non-optional in some minimal form earlier in the game, and/or make G's two locks interdependent (e.g., lock 2's target value depends on lock 1's chosen input) rather than sequential-but-independent.
- **Expected improvement:** A finale that genuinely synthesizes prior skills; better fit for confident-student persona.
- **Source files likely affected:** `mechanisms.js` (`runRiverLock1`/`runRiverLock2`/`chooseRiverOrder`), `level.js` (`TERMINALS`, `GATES` for G).
- **Existing assets usable:** Yes — no new art needed, math-logic-only change.
- **Risk to collision/save:** Low if scoped carefully — `save.js`'s `sanitize()` already independently re-derives valid gate combinations and would need its interdependency logic updated to match any new rule, but the pattern for doing so safely already exists in the file.
- **Acceptance criterion:** A playtest (file 13) shows students describing G's finale as meaningfully different from B/D/E, not merely "bigger numbers."
- **Complexity:** M
- **Confidence:** High

### ISSUE-02 — Repeated structural module at point-blank range (Zone B climb)
- **Severity:** P1
- **Category:** Environment art/composition
- **Zone/Room:** B, R04
- **World coordinate:** x≈1458–1944
- **Screenshot reference:** `r04-mendaki-dan-mencuba-input.jpg`
- **Evidence type:** Direct screenshot (two full identical post+ladder+deck assemblies visible in one frame)
- **Current behavior:** Two consecutive climb tiers use the exact same module shape, same width proportions, same frame choice.
- **Why it harms player experience:** Directly manifests the owner's own stated "repeated rectangular geometry" complaint at its clearest, most concentrated point in the game.
- **Root cause:** `post()`/`beam()`/`s.deck()` is the only structural-module vocabulary in `environment.js`; no variant exists.
- **Exact recommended change:** Not implemented here. Direction: vary one of the two decks' width/post-spacing, or drop one deck's full post-pair in favor of a single-side rail, so the climb's silhouette changes shape between tiers.
- **Expected improvement:** The climb reads as ascending through different spaces rather than the same frame copy-pasted.
- **Source files likely affected:** `environment.js` (B's climb section, lines ~81-93 per the version read in this audit).
- **Existing assets usable:** Yes, same atlas frames, different spans/spacing only.
- **Risk to collision/save:** Low — purely a decoration/geometry proportions change on non-interactive support structures, not on the lever/selector/lift gate itself.
- **Acceptance criterion:** A fresh screenshot of R04 no longer shows two visually identical assemblies in one frame.
- **Complexity:** S-M
- **Confidence:** High

### ISSUE-03 — Pause dialog stacks on top of an open mechanism panel (window blur)
- **Severity:** P2
- **Category:** UI collision (technical)
- **Zone/Room:** Any zone with `#mechanism` open (confirmed reproduced at D, R08)
- **World coordinate:** N/A
- **Screenshot reference:** `BUG-pause-over-mechanism-stacking.jpg`
- **Evidence type:** Live-reproduced + source-traced (`window.addEventListener('blur',...)` → `pauseRun()`, which explicitly permits firing while `mode==='mechanism'`)
- **Current behavior:** Losing window focus while `#mechanism` is open shows the native pause `<dialog>` stacked on top of the still-visible, still-open mechanism panel underneath.
- **Why it harms player experience:** Confusing, jarring double-dialog visual; any real alt-tab or OS-notification focus loss mid-puzzle triggers it. Confirmed non-corrupting (resumes cleanly) but confirmed visually broken in the moment.
- **Root cause:** `pauseRun()`'s mode guard allows `'mechanism'` without first hiding `#mechanism`.
- **Exact recommended change:** Not implemented here. Direction: either hide `#mechanism` (visually, not functionally — keep `activePuzzle`/`resumeMode` state intact) while `#paused` is open, or narrow `pauseRun()`'s blur-triggered path specifically to not double-stack visible panels.
- **Expected improvement:** No visual double-stack; cleaner pause behavior during puzzle interaction.
- **Source files likely affected:** `game.js` (`pauseRun()`), possibly `presentation.css` (z-index/visibility rule).
- **Existing assets usable:** N/A, code-only fix.
- **Risk to collision/save:** None — this is purely visual; `resumeMode`/`activePuzzle` state already proven to survive correctly (confirmed live).
- **Acceptance criterion:** Triggering window blur while `#mechanism` is open no longer shows both panels simultaneously.
- **Complexity:** S
- **Confidence:** High

### ISSUE-04 — e-control.css / g-control.css missing the notice/toast suppression rule b-control.css and c-control.css have
- **Severity:** P2
- **Category:** UI collision (technical)
- **Zone/Room:** E (R11-R12), G (R15)
- **World coordinate:** N/A
- **Screenshot reference:** N/A (source-diff evidence; live repro attempted and blocked by this audit's own test-harness camera-state issue, disclosed honestly in file 11 rather than faked)
- **Evidence type:** Source-verified (direct line-by-line diff of all four `*-control.css` files)
- **Current behavior:** `b-control.css`/`c-control.css` both hide `#notice`/`#zone-toast`/`#mission-indicator` while their panel is visible (b-control also hides `#chill-bubble`); `e-control.css`/`g-control.css` have no equivalent rule at all.
- **Why it harms player experience:** A zone toast, notice, mission-indicator button, or dialogue bubble can appear directly over/behind the E or G world-aside panel with no mitigation, inconsistent with the same panel pattern working correctly two zones earlier.
- **Root cause:** The suppression rule was added to B/C's CSS but never copied to E/G's when those panels were built (confirmed by the files' near-identical structure otherwise — this reads as a straightforward omission, not an intentional difference).
- **Exact recommended change:** Not implemented here. Direction: add the same one-line CSS rule to `e-control.css` and `g-control.css`, and decide whether `#chill-bubble` suppression (currently B-only) should be standardized across all four.
- **Expected improvement:** Consistent UI-layering behavior across all four world-aside panels.
- **Source files likely affected:** `e-control.css`, `g-control.css`.
- **Existing assets usable:** N/A, CSS-only.
- **Risk to collision/save:** None.
- **Acceptance criterion:** All four `*-control.css` files contain matching suppression rules.
- **Complexity:** S
- **Confidence:** High

### ISSUE-05 — Zone C's "apply" sign confirms the pattern unconditionally, without testing the player's understanding
- **Severity:** P2
- **Category:** Math/mission design
- **Zone/Room:** C, R06
- **World coordinate:** x=1720 (apply sign)
- **Screenshot reference:** `r06-bonus-atas.jpg`
- **Evidence type:** Source-verified (`applyCPattern()` reads no player input and never branches on a wrong answer)
- **Current behavior:** Once both clue signs are seen, the apply sign succeeds unconditionally and the game states the pattern to the player in a scripted dialogue line.
- **Why it harms player experience:** The brief's own named concern, confirmed true: this is a press-E sequence, not a test of inductive reasoning, despite its framing.
- **Root cause:** `applyCPattern()` was built as a confirmation step, not a quiz step.
- **Exact recommended change:** Not implemented here. Direction: require the player to select a predicted output (reusing the existing token-button UI already built for every other terminal) before confirming.
- **Expected improvement:** C becomes a genuine "guess, then check" moment rather than "walk past three signs."
- **Source files likely affected:** `mechanisms.js` (`applyCPattern`), `v12.html` (reuse `#token-options`), `level.js` (TERMINALS entry).
- **Existing assets usable:** Yes, fully — reuses the existing token-button mechanism UI pattern.
- **Risk to collision/save:** Low — `discoverSecret('bonus-mapping')` call site would move behind a correctness check; `save.js` already handles secret-id sanitization robustly.
- **Acceptance criterion:** A wrong predicted output does not grant the secret; a correct one does.
- **Complexity:** S-M
- **Confidence:** High

### ISSUE-06 — D's console terminal is functionally redundant with direct block interaction
- **Severity:** P2
- **Category:** Math/mission design
- **Zone/Room:** D, R08
- **World coordinate:** console at x=3420; blocks at x=3129/3183/3237
- **Screenshot reference:** `r08-blok-nombor.jpg`
- **Evidence type:** Source-verified (`TERMINALS` 'number' vs 'number-input-*', both routing to equivalent test logic)
- **Current behavior:** Pressing E on any numbered block tests it immediately; the console sign's modal does the same test via a different UI, with no distinct content or role.
- **Why it harms player experience:** A full interactive prop (the console) adds visual weight and player attention cost for zero unique function — potential source of the exact D-sign-crowding issue (ISSUE-09) since it sits right next to another sign.
- **Root cause:** Two interaction surfaces were built for the same underlying mechanic without differentiating their purpose.
- **Exact recommended change:** Not implemented here. Direction: either give the console a distinct role (e.g., the only place the rule g(x)=3x−2 is spelled out in full) or fold it into the rack cluster visually so it reads as one object, not two competing interactables.
- **Expected improvement:** Clearer, less redundant D-zone interaction model.
- **Source files likely affected:** `mechanisms.js`, `level.js` (TERMINALS), `environment.js` (D section).
- **Existing assets usable:** Yes.
- **Risk to collision/save:** None if scoped to UI/role only.
- **Acceptance criterion:** The console's role is either distinct from the blocks or visually merged with them.
- **Complexity:** S
- **Confidence:** Medium (design judgment, not a hard defect)

### ISSUE-07 — Moving platform has no visual distinction from a static deck
- **Severity:** P2
- **Category:** Environment art / gameplay readability
- **Zone/Room:** F, R13
- **World coordinate:** x=6150–6440 (F_MOVING_PLATFORM range)
- **Screenshot reference:** `strip-04-x5200-7400.jpg`, `r14-gua-songsang.jpg`
- **Evidence type:** Source-verified (`s.deck()` call for the moving platform uses identical frames to every static deck) + visual (zoomed-out strips show it easy to lose against the background)
- **Current behavior:** The platform is rendered with the same brown-plank frames as every stationary deck; only its motion distinguishes it.
- **Why it harms player experience:** A player who first sees it motionless (at either travel extreme) has no color/outline cue that it's a moving hazard-adjacent object rather than a static platform.
- **Root cause:** No tint/outline was applied when the moving platform was built, unlike the precedent already set for E's walkway.
- **Exact recommended change:** Not implemented here. Direction: apply the same `setTint()` technique already proven safe on E's walkway (Phase 6.5C2A) to the moving platform's deck art only.
- **Expected improvement:** Immediate visual legibility of "this one moves," zero collision risk (pure art-layer change, same precedent already shipped elsewhere in this codebase).
- **Source files likely affected:** `environment.js` (F's moving-platform section).
- **Existing assets usable:** Yes, identical technique to an already-shipped fix.
- **Risk to collision/save:** None — tint is visual only, confirmed by the E-walkway precedent not touching `s.platform()`.
- **Acceptance criterion:** The moving platform is visually distinguishable from static decks in a screenshot at rest.
- **Complexity:** S
- **Confidence:** High

### ISSUE-08 — Mission premise and mechanism purpose never elaborated beyond one sentence
- **Severity:** P2
- **Category:** Story/worldbuilding
- **Zone/Room:** Cross-cutting
- **World coordinate:** N/A
- **Screenshot reference:** N/A
- **Evidence type:** Source-verified (exhaustive read of all 37 `LINES` entries)
- **Current behavior:** "Deliver supplies across the river" is never elaborated — what the supplies are, who's waiting, and why each mechanism (lift/workshop/waterworks/bridge) exists are all unanswered in every one of the game's dialogue lines.
- **Why it harms player experience:** Weak sense of destination and payoff (file 10); mechanisms read as puzzle set-pieces first, world objects second.
- **Root cause:** Narrative content was never written beyond the functional minimum needed to state objectives.
- **Exact recommended change:** Not implemented here. Direction: two new dialogue lines (supplies detail at start, destination detail at end) plus one line per major mechanism explaining its in-fiction purpose — all reusing the existing, already-working `DialogueQueue`/`LINES` system.
- **Expected improvement:** Directly closes file 10's "weak sense of destination" and file 09's "weak emotional payoff" findings simultaneously.
- **Source files likely affected:** `dialogue.js` (`LINES` additions only).
- **Existing assets usable:** Yes, fully — no new system needed.
- **Risk to collision/save:** None — `sanitizeDialogue()` already filters unknown ids safely, new ids are additive.
- **Acceptance criterion:** A player can answer "what are the supplies and who are they for" after playing, per file 13's playtest task 5.
- **Complexity:** S
- **Confidence:** High

### ISSUE-09 — Destination door lacks visual "arrival" emphasis
- **Severity:** P2
- **Category:** Environment art / composition
- **Zone/Room:** G, R16
- **World coordinate:** door at x=8262
- **Screenshot reference:** `r16-pintu-destinasi.jpg`
- **Evidence type:** Direct visual comparison (door prop is not larger/more elevated/more framed than any mid-game checkpoint flag)
- **Current behavior:** The door sits directly on ground level with standard post framing, same visual weight as any other sign cluster.
- **Why it harms player experience:** An 8400px journey's ending doesn't read as more significant than its midpoint, visually.
- **Root cause:** No special composition treatment was applied to the final room.
- **Exact recommended change:** Not implemented here (and the Phase 6.5C2B tree-removal fix already did part of this job by clearing the sky behind it). Direction: a slightly raised shelf or a two-post frame around the door, reusing existing frames.
- **Expected improvement:** A stronger "this is the end" visual beat.
- **Source files likely affected:** `environment.js` (G's door section), `level.js` (if elevation changes, would need SURFACES/GOAL coordination — flagged as higher-risk than the other P2 items specifically because it's the one item here that could touch collision-adjacent coordinates).
- **Existing assets usable:** Yes.
- **Risk to collision/save:** Low-Medium if elevation is changed (GOAL coordinates would need matching updates) — Low if only framing posts are added without moving the door/GOAL itself.
- **Acceptance criterion:** The door reads as visually distinct from a mid-game checkpoint in a side-by-side comparison.
- **Complexity:** S (framing only) to M (if elevation changes)
- **Confidence:** Medium (composition judgment)

### ISSUE-10 — Zones A, B, D, F are not identifiable by silhouette alone
- **Severity:** P2
- **Category:** Environment art / zone identity
- **Zone/Room:** A, B, D, F (cross-cutting)
- **World coordinate:** N/A
- **Screenshot reference:** All five strip overviews (file 03)
- **Evidence type:** Direct visual comparison across all 5 strips
- **Current behavior:** Only E (blue pipes) and G (river + bespoke lever) are recognizable without reading a sign; A/B/D/F share the identical brown/green structural vocabulary.
- **Why it harms player experience:** Directly the owner's stated "lack of identity between zones" concern, confirmed not assumed.
- **Root cause:** No zone besides E/G has a material or structural differentiator, only prop-level ones.
- **Exact recommended change:** Not implemented here — see file 05's "smallest asset-supported improvement plan" and file 16's masterplan for a scoped direction (structural proportion variation per zone, not new assets).
- **Expected improvement:** A player could identify roughly which zone they're in from a cropped screenshot with no UI/signs visible.
- **Source files likely affected:** `environment.js` (per-zone sections).
- **Existing assets usable:** Yes, per file 05.
- **Risk to collision/save:** Low if scoped to decoration/proportion only, as file 05/16 both specify.
- **Acceptance criterion:** A blind side-by-side comparison test (show 4 cropped, sign-free screenshots, ask which zone) scores above chance.
- **Complexity:** M-L (cross-cutting, touches every zone)
- **Confidence:** High

### ISSUE-11 — Dead `#puzzle` dialog markup and a broken `requestHint()` handler
- **Severity:** P3
- **Category:** Technical/codebase health
- **Zone/Room:** N/A (global markup)
- **World coordinate:** N/A
- **Screenshot reference:** N/A
- **Evidence type:** Source-verified (`$('puzzle').showModal()` has zero call sites anywhere in `src/v12/`; `requestHint` is not defined anywhere in `v12/mechanisms.js` or `v12/game.js`, only in older `src/game.js`/`src/v10/game.js`)
- **Current behavior:** A full legacy quiz-dialog UI (`#puzzle`, with a text-input answer form and a hint button) exists in `v12.html` and has working-looking event listeners wired to it, but is never shown to any player and one of its handlers would throw if ever triggered.
- **Why it harms player experience:** None currently (confirmed unreachable) — flagged for codebase health, not player impact.
- **Root cause:** Left over from V9/V10's quiz-based puzzle UI, never removed when V12 switched to the `#mechanism` panel system.
- **Exact recommended change:** Not implemented here. Direction: remove `#puzzle` and its dedicated event listeners from `v12.html`/`game.js` entirely.
- **Expected improvement:** Cleaner codebase, one less thing a future contributor could mistake for live code.
- **Source files likely affected:** `v12.html`, `game.js` (listener removal).
- **Existing assets usable:** N/A, deletion only.
- **Risk to collision/save:** None.
- **Acceptance criterion:** Grep for `#puzzle`/`requestHint` in `v12/` returns nothing.
- **Complexity:** S
- **Confidence:** High

### ISSUE-12 — D's two signs remain visually crowded (48px apart)
- **Severity:** P3
- **Category:** Environment art
- **Zone/Room:** D, R08
- **World coordinate:** x=3372/3420
- **Screenshot reference:** `r08-blok-nombor.jpg`
- **Evidence type:** Inherited from Phase 6.5C1's coordinate-issues.md, re-confirmed present and unfixed in this independent pass
- **Current behavior:** Two distinct sign props sit 48px apart, visually merging at normal zoom.
- **Why it harms player experience:** Minor — cosmetic only, no functional conflict (confirmed, these aren't both required interactables at once the way G's pair once was).
- **Root cause:** Original placement, never revisited.
- **Exact recommended change:** Not implemented here. Direction: see ISSUE-06 — likely resolved together if the console/block redundancy is addressed.
- **Expected improvement:** Cleaner D-zone read.
- **Source files likely affected:** `environment.js`.
- **Existing assets usable:** Yes.
- **Risk to collision/save:** None if purely cosmetic nudge.
- **Acceptance criterion:** Visual gap between the two signs reads as intentional, not merged.
- **Complexity:** S
- **Confidence:** Medium

### ISSUE-13 — Completion screen doesn't reference the specific journey
- **Severity:** P3
- **Category:** Feedback/story
- **Zone/Room:** N/A (end-of-game screen)
- **World coordinate:** N/A
- **Screenshot reference:** `ui-completion-screen.jpg`
- **Evidence type:** Direct visual + source (`showCompletion()`'s static text)
- **Current behavior:** Generic closing text; no reference to the specific mechanisms solved.
- **Why it harms player experience:** Minor — a missed opportunity for a stronger emotional payoff (files 09/10/12 all independently flag this).
- **Root cause:** Text was authored once, generically, not data-driven.
- **Exact recommended change:** Not implemented here. Direction: generate one summary line from already-tracked `solvedGates`/`discoveredSecrets` state.
- **Expected improvement:** A more personalized, specific-feeling ending.
- **Source files likely affected:** `mechanisms.js` (`showCompletion()`).
- **Existing assets usable:** Yes, fully data-driven from existing state.
- **Risk to collision/save:** None.
- **Acceptance criterion:** Completion text varies based on what was actually solved/found.
- **Complexity:** S
- **Confidence:** High

### ISSUE-14 (QA follow-up, not a confirmed defect) — Mobile viewport layout not screenshot-verified
- **Severity:** P3 (verification gap, not a known defect)
- **Category:** Technical QA
- **Zone/Room:** N/A
- **World coordinate:** N/A
- **Screenshot reference:** N/A
- **Evidence type:** Disclosed testing limitation (file 11) — `resize_window` calls in this audit's browser-automation environment did not change the real reported viewport width
- **Current behavior:** Unknown whether the actual responsive CSS layout (not just Phaser canvas scaling) renders correctly at real mobile widths.
- **Why it harms player experience:** Unknown — could be fine (the CSS rules read correctly in source) or could have an undiscovered issue.
- **Root cause:** Audit tooling limitation, not a code issue.
- **Exact recommended change:** Verify on an actual device or a properly-resized real browser window before relying on this audit's "mobile UX: 3/5, low-medium confidence" score as final.
- **Expected improvement:** A confirmed, not reasoned-about, mobile UX score.
- **Source files likely affected:** None — testing-only.
- **Existing assets usable:** N/A.
- **Risk to collision/save:** None.
- **Acceptance criterion:** A real-device or real-resized-browser screenshot pass exists.
- **Complexity:** S (just needs the right test environment)
- **Confidence:** N/A (this is a gap flag, not a finding)
