# V8.7 Phase E — Level Exit Tests

All tests run against the real game in a Chromium browser via
`tests/v8_7_level_exit.py`. Full output below (abridged to the pass/fail
lines).

| Scenario | Result |
|---|---|
| Exit is NOT available before all three gates are solved | At the goal with 0 gates solved: `solvedGates.size===0`, `mode` stays `'playing'` after pressing 'E', and no exit prompt is shown at all (`prompt.visible===false`). **Pass.** |
| Exit prompt appears once solved, but only completes on explicit 'E' | With all three gates solved, standing at the goal: the prompt becomes visible, reads **"E · Keluar"**, and `mode` stays `'playing'` until 'E' is actually pressed — confirming no auto-trigger survived the change. Pressing 'E' then correctly sets `mode==='complete'`. **Pass.** |
| Completion summary reflects real gameplay data | After collecting 1 coin, discovering 1 secret (Si Oyen), and solving all 3 machines, then exiting: the dialog reads "Koleksi dijumpai: 1/7", "Rahsia dijumpai: 1/3", "Mesin fungsi diselesaikan: 3/3" — all accurate, none hardcoded. **Pass.** |
| Return to Level Select from completion works | Clicking "Pilih Level" from the completion dialog (reached via the exit interaction) opens Level Select showing "Selesai" for Level 1. **Pass.** |
| Save/Continue preserved: exit-triggered completion persists | After exiting via 'E' and reloading the page, the main menu's Continue button correctly reads "Main semula →" (the existing completed-save label) — confirming `finish()`'s existing `writeSave()` call still runs exactly as before; the exit interaction didn't bypass or duplicate it. **Pass.** |

## What did NOT change

- `finish()` itself — completely untouched. The exit interaction only
  gates WHEN it's called (on 'E' press instead of automatically), never
  duplicates it, never creates a second completion path, and never
  invents a nonexistent "Level 2" destination.
- The completion condition (`solvedGates.size>=PUZZLES.length` at the
  goal's position, grounded) — byte-for-byte the same boolean expression
  that used to directly call `finish()`; it now gates a prompt + an
  `interact` check instead.
- Secrets/coins/save behavior — unaffected; `finish()`'s own `writeSave()`
  call and every Phase 6/7 guarantee around it are untouched.

## Visual evidence

- `screenshots/exit/goal-prompt-before-interact.png` — the goal with all
  gates solved, door visible, "E · Keluar" prompt showing, dialog NOT yet
  open.
- `screenshots/exit/goal-completion-after-interact.png` — the same moment
  one keypress later, completion dialog open with the accurate summary.

## Regression impact (disclosed, not hidden)

Five existing test scripts (`tests/probe.py`,
`tests/v8_phase6_persistence.py`, `tests/v8_phase7_secrets.py` ×2,
`tests/v8_phase8_menu.py` ×2) previously simulated reaching the goal by
teleporting the player there and waiting for `mode==='complete'`
automatically. Each was updated to press 'E' after the teleport, matching
the new, intentional interaction — this is a required update to match
new, deliberate game behavior, not a weakening of what those tests verify
(every one of them still asserts the exact same post-completion state it
did before).
