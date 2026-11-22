# V8 Phase 5 — Puzzle Interaction Tests

## 1. Unit tests — `node --test`

11/11 pass, 0 failures. Covers world geometry, zone/gate reachability
invariants, and asset integrity. Unaffected by Phase 5 (no geometry/asset
changes this phase); re-run clean as a regression check.

## 2. Full browser regression — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`. Covers:

- Desktop: full A→G traversal, first-gap jump, ladder climbs, failed-jump
  recovery, checkpoint 1/2/3, all three puzzle solves via the new
  wrong→hint→correct→Teruskan flow, bypass-attempt blocks for all three
  gates (workshop/rooftop M2/final), checkpoint-recovery preserving solved
  gates, full completion.
- Mobile (390×844, touch): run/jump/interact, device rotation, puzzle solve
  via tap + Teruskan tap, pause/resume.
- Missing-asset path: visible failure with asset key, no broken start.
- Unrelated Add Math shell (home, MULA, Tingkatan 4 map) preserved
  untouched.

**Changes required to the test script itself** (not a game bug — the test
assumed the old auto-close timing):
- `solve()` helper: previously asserted `mode==='playing'` immediately after
  clicking submit on a correct answer. Since the dialog no longer
  auto-closes, this now waits for `#puzzle-continue` to become visible,
  asserts the feedback text contains "Betul!" (the worked reasoning is
  actually shown), clicks Teruskan, and only then waits for
  `mode==='playing'`.
- Mobile inline puzzle-solve block: same fix — waits for
  `#puzzle-continue:not([hidden])` and taps it before continuing.

## 3. Phase 5 UX diagnostic — `tests/v8_phase5_ux_diag.py` (new this phase)

Live, instrumented Playwright script, 7 checks, all passing on the final
run:

1. **No answer leak**: p1 wrong answer (99) — feedback text does not
   contain `"= 7"`/`"=7"`; `solvedGates.size === 0` (gate correctly not
   opened on a wrong answer).
2. **Hint nudge present**: wrong-answer feedback includes "hint di bawah"
   while hints remain.
3. **Hint content correctness**: all 3 p1 hint stages read from the live
   `PUZZLES` data and confirmed present and mathematically correct.
4. **Nudge disappears once hints exhausted**: after requesting all 3 hints,
   a further wrong answer's feedback no longer includes the nudge, and
   `#hint-btn` is hidden.
5. **Correct-answer success state**: dialog stays open (`#puzzle.open ===
   true`), `mode` is still `'puzzle'` while `solvedGates.has('workshop-gate')
   === true` (world state already updated even though the dialog hasn't
   closed), feedback shows the worked reasoning, `.answer-row` is hidden,
   `#puzzle-continue` is visible.
6. **Keyboard-only operation**: focus lands on `#puzzle-continue`
   automatically; pressing Enter closes the dialog and returns
   `mode === 'playing'`, with no mouse interaction anywhere in the flow.
7. **Clean reopen after a different puzzle was left solved**: opening M2
   (unsolved) after M1's dialog had shown its solved/Teruskan state shows
   `.answer-row` visible again, `#puzzle-continue` hidden again, and fresh
   prompt text with no leftover "Betul!" — confirms `openPuzzle()`'s new
   reset lines work per-puzzle, not just globally.

(One self-inflicted bug in this test script, not the game: an early version
of check 7 manually injected a solved-gate flag as a shortcut to reach M2,
which made `nearestTerminal()` correctly skip the already-solved terminal,
so 'e' found nothing. Fixed by resetting the player near M2 directly instead
of simulating a gate solve.)

## 4. Evidence captures — `tests/v8_phase5_capture.py` (new this phase)

4 screenshots, copied to `screenshots/` in this folder:
- `1-wrong-answer-no-leak.png` — desktop, p1 wrong answer (99), fixed
  message + hint nudge visible, no answer leak.
- `2-hint-stage-1.png` — desktop, after requesting hint 1.
- `3-correct-answer-dialog-open.png` — desktop, correct answer (7), dialog
  still open showing "Betul! f(3) = 2(3) + 1 = 7." and the focused Teruskan
  button, answer form hidden.
- `4-mobile-correct-answer.png` — same success state at 390×844, confirming
  the new button/layout fits the small viewport without overflow.

## 5. Other checks covered by the above

- **Audio integration**: unaffected by Phase 5 — `SFX.correct`/`SFX.incorrect`
  calls are unchanged, still fire at the same points; covered implicitly by
  probe.py's clean pass (no console/audio errors) and by Phase 4's own
  audio-lifecycle tests (not re-run here, since nothing in the audio path
  changed).
- **Replay / checkpoint recovery**: `probe.py`'s "checkpoint recovery
  preserves solved gates" step confirms solved-puzzle state survives a
  respawn, unaffected by the dialog-flow change.
- **Reopening a solved puzzle's gate is impossible** (by design, unchanged):
  `nearestTerminal()` excludes terminals whose gate is already solved, so
  there is no "re-solve" path to test — confirmed via the check-7 bug above.

## Cleanup

`tests/v8_phase5_ux_diag.py` and `tests/v8_phase5_capture.py` are kept
(diagnostic + evidence-capture scripts, following the convention of prior
phases of retaining capture/diagnostic scripts). No purely-throwaway debug
scripts were created this phase that needed removal.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).
