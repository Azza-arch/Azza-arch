# V8 Phase 5 — Educational UX & Mathematics Feedback

## Scope

Phase 5 targeted usability of the three existing math puzzles (f(3)=7 at the
workshop gate; 3x−2=10→x=4 and 4x−3=17→x=5 at the later gates). No new
puzzles, no new mechanics, no change to the puzzle formulas or answers. The
brief was explicit that this is a UX/feedback pass, not a redesign.

## Inspection findings (what already worked correctly)

- **Formula readability**: `.equation` is already rendered at
  `clamp(25px,5vw,32px)` serif, centered, with generous padding — no change
  needed.
- **Staged hints**: all three puzzles already had exactly 3 staged hints each
  (conceptual → calculation step → worked solution) in `src/level.js`. This
  matches Phase 5's requested structure exactly, so the existing hint system
  (`renderHints()`, `requestHint()`, `#hint-list`) was reused as-is — no
  second hint system was built.
- **Non-revealing wrong-answer messages**: p2 and p3's `wrongMessage`
  functions already echoed the student's own computed value back against the
  target (e.g. `3(${n2}) − 2 = ${3*n2-2}, bukan 10. Cuba lagi.`) without
  stating the correct answer — this was the correct pattern.
- **Keyboard operability**: the answer form, hint button, and dialog were
  already fully keyboard-operable (native `<form>`/`<button>`/`<dialog>`
  elements, no custom focus trapping needed).
- **Mobile layout**: `dialog` and `.equation` already had mobile breakpoints
  in `style.css`; no layout changes were needed for the new UI to fit at
  390×844.

## Confirmed bugs found and fixed

1. **Answer leak in p1's wrong-answer message** (`src/level.js`). Unlike p2/p3,
   p1's `wrongMessage` stated the full correct answer
   (`f(3) = 2(3) + 1 = 7`) on *every* wrong attempt, directly contradicting
   the brief's "never reveal the full answer on a wrong attempt" requirement
   and making the hint system pointless after one try. Fixed to follow the
   same non-revealing pattern as p2/p3 — it now points back at the formula
   without stating the target value. See `screenshots/1-wrong-answer-no-leak.png`.

2. **Correct-answer reasoning was easy to miss**. On a correct answer, the
   puzzle dialog previously closed immediately (`closePuzzle()` ran in the
   same instant as world-state changes), so the worked reasoning
   (`solvedMessage`) was only ever visible in the small bottom-of-page status
   line, right as the canvas behind it became busy with gate/bridge
   animation. Fixed by keeping the dialog open on a correct answer, showing
   the reasoning in place (`"Betul! f(3) = 2(3) + 1 = 7."`), hiding the
   answer form, and adding a focused "Teruskan →" button the student clicks
   (or presses Enter on) to close the dialog and continue. World-state
   changes (gate solve, lever, audio, bridge animation) still happen at the
   exact same moment as before — only the dialog's own close timing moved to
   under the student's control. See `screenshots/3-correct-answer-dialog-open.png`
   and `screenshots/4-mobile-correct-answer.png`.

3. **Minor nudge added**: once a wrong answer is submitted and hints remain
   unused, the feedback now appends a short pointer ("Perlukan bantuan? Cuba
   hint di bawah.") toward the existing hint button. No new hint content, no
   answer reveal — just a pointer to what was already there. See
   `screenshots/2-hint-stage-1.png`.

## Files changed

- `src/level.js` — p1's `wrongMessage` only (see `hint-content.md` for full
  before/after).
- `src/game.js` — `openPuzzle()` (reset success-state UI when reopening any
  puzzle), `answer()` (hint nudge on wrong answer; correct-answer branch
  restructured to show reasoning in-dialog and defer `closePuzzle()` to the
  new Teruskan button), one new event listener for `#puzzle-continue`.
- `index.html` — added `#puzzle-continue` button inside the existing
  `#puzzle` dialog.
- `style.css` — two small rules for the new button and the `.correct`
  feedback state, placed with the existing puzzle-dialog rules.
- `tests/probe.py` — updated to match the new dialog-close timing (see
  `puzzle-interaction-tests.md`).

## Explicitly not touched

Physics, collision, camera, world geometry/map, checkpoints/gates, puzzle
formulas/answers, the Phase 3 particle/game-feel system, the Phase 4 audio
synthesis engine, and unrelated Add Math pages — all confirmed unchanged by
the full regression suite (see `puzzle-interaction-tests.md`).

## Not committed / not deployed

Per the brief, no commit or deploy was made. `app/addmath/rooftop/` remains
entirely untracked in git, same as every prior phase.
