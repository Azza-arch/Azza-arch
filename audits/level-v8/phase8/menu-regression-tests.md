# V8 Phase 8 — Menu Regression Tests

## 1. Unit tests — `node --test`

11/11 pass, 0 failures. Unaffected by Phase 8.

## 2. Full browser regression — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`. Full
desktop A→G traversal, mobile touch run, missing-asset path, unrelated Add
Math shell — all still pass, confirming the menu/dialog restructuring
didn't disturb gameplay, the puzzle flow, or the Restart/Replay confirm
flow it already exercises.

## 3. Phase 6 persistence tests — `tests/v8_phase6_persistence.py`

All 16 scenarios re-run clean (Continue, New Adventure confirmation,
Restart/Replay confirmation, corrupted JSON, unsupported version, blocked
storage, no duplication across reload cycles) — unaffected by moving the
audio controls into their own `#settings` dialog (same element ids, same
wiring).

## 4. Phase 7 secrets/replay tests — `tests/v8_phase7_secrets.py`

All scenarios re-run clean after two small, disclosed test-script updates
(not game bugs — the tests referenced UI that Phase 8 relocated):

- The "muted audio" scenario now opens `#settings` via the pause menu's
  new "Tetapan" button before interacting with `#audio-mute` (previously
  that checkbox lived directly inside `#paused`).
- The "collection UI" scenario now opens `#collection` via the pause
  menu's new "Koleksi" button before reading `#secrets-count`/
  `#secrets-list` (previously that list lived directly inside `#paused`).

All secret-discovery, permanence-across-Replay/Restart, and
wiped-by-New-Adventure behaviors are confirmed unchanged.

## 5. New: menu navigation tests — `tests/v8_phase8_menu.py`

| Scenario | Result |
|---|---|
| Fresh main menu shows the correct option set, no duplicates | `#start` visible, `#continue-btn`/`#new-adventure` hidden; Pilih Level/Koleksi/Tetapan all present exactly once. **Pass.** |
| Level Select: Level 1 card, correct initial status, no fake Level 2 | Status "Belum mula", action "Mula", exactly 1 `.level-card` in the DOM. **Pass.** |
| Level Select's action button is a real, working action | Clicking "Mula" starts the game (`mode==='playing'`) and closes the dialog. **Pass.** |
| Main menu + Level Select reflect real saved progress | After reaching CP1 and reloading: `#continue-btn` reads "Teruskan →"; Level Select shows "Dalam perjalanan"/"Teruskan" and an accurate `n/3 mesin · n/7 koleksi · n/3 rahsia` summary; clicking the card's action correctly restores `checkpointIndex`. **Pass.** |
| Collection reachable pre-game from the main menu | Opens directly (physics already paused at boot); shows "0/3", no undiscovered secret reveals a location string. **Pass.** |
| Settings reachable pre-game from the main menu | Opens directly; toggling mute persists to the (unchanged) audio storage key. **Pass.** |
| Keyboard-only navigation | Focusing "Pilih Level" and pressing Enter opens it exactly like a click; Escape closes it; focus is not trapped afterward (`document.activeElement !== document.body`). **Pass.** |
| Completion screen: accurate values, celebration-before-dialog preserved | The dialog is confirmed still closed during the ~420ms sparkle-celebration window from Phase 3.1, before `#complete[open]` is ever waited on; `#completion-secrets` reads "1/3" after discovering Si Oyen, machines/coins both read correctly from live state. **Pass.** |
| Completion → Pilih Level | Opens Level Select showing "Selesai" for Level 1. **Pass.** |
| Completion → Menu Utama does not touch the save | `#welcome` reappears, `mode==='welcome'`, the persisted save's `completed` flag is still `true` afterward, `#continue-btn` correctly reads "Main semula →". **Pass.** |
| Mobile (390×844): main menu + Level Select fit and are usable | Both captured cleanly via `page.tap()`; no layout overflow. **Pass.** |
| Corrupted/unavailable storage: menu still fully usable | A hand-corrupted save still yields a working `#start` button and a cleanly-rendered Level Select ("Belum mula"), no exception thrown. **Pass.** |

## 6. A real bug found and fixed during this phase

The additional main-menu buttons (Pilih Level/Koleksi/Tetapan) made the
`#welcome` panel's content taller than it used to be. The panel's old
`top:50%; transform:translateY(-47%)` centering had no height limit, and
at viewport heights where the resulting box exceeded the game-frame's
actual height, the bottom buttons were clipped by `.game-frame`'s
`overflow:hidden` — a real, reproducible layout bug, not a cosmetic
nitpick (the "Tetapan" button was genuinely unreachable in that state).
Caught via screenshot review, confirmed with a direct
`getBoundingClientRect()`/computed-style check, and fixed by anchoring the
panel with `top:5%; bottom:5%; overflow-y:auto` instead — verified via a
second screenshot pass showing all six main-menu buttons fully visible.

## 7. Console/network checks

No console errors or failed network requests were logged in any of the
above runs (`probe.py` asserts this explicitly; the Phase 8 script's own
contexts showed no uncaught page errors across all 12 scenarios).

## Cleanup

`tests/v8_phase8_menu.py` is kept (diagnostic/evidence script, consistent
with every prior phase's convention). No other scripts were added.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).
