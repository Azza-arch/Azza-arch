# V8 Phase 8 — Navigation Flow

## Screen map

```
                         ┌─────────────────────┐
                         │   Main Menu          │  (#welcome)
                         │  Mula Pengembaraan /  │
                         │  Teruskan             │
                         │  Mula Baharu          │──(confirm)──> clears save, starts fresh
                         │  Pilih Level ─────────┼──┐
                         │  Koleksi ─────────────┼──┼──┐
                         │  Tetapan ─────────────┼──┼──┼──┐
                         └──────────┬────────────┘  │  │  │
                                    │ start/continue │  │  │
                                    ▼                │  │  │
                         ┌─────────────────────┐    │  │  │
                         │   Gameplay           │    │  │  │
                         │  (Phaser scene,       │    │  │  │
                         │   mode: 'playing')    │    │  │  │
                         └──────────┬────────────┘    │  │  │
                        Esc │                          │  │  │
                            ▼                          │  │  │
                 ┌─────────────────────┐               │  │  │
                 │  Pause (#paused)      │              │  │  │
                 │  Sambung              │              │  │  │
                 │  Tetapan ─────────────┼──────────────┼──┼──┘
                 │  Koleksi ─────────────┼──────────────┼──┘
                 │  Mula semula (confirm)│              │
                 └─────────────────────┘               │
                                                         │
                         ┌─────────────────────┐        │
                         │ Level Select          │<──────┘
                         │ (#level-select)       │
                         │ Level 1 card:          │
                         │  Mula / Teruskan /     │
                         │  Main semula           │──(click action)──> Gameplay
                         └─────────────────────┘

                 ┌─────────────────────┐   ┌─────────────────────┐
                 │ Koleksi (#collection) │   │ Tetapan (#settings)   │
                 │ 3 slots, found/locked │   │ Mute/master/sfx       │
                 └─────────────────────┘   └─────────────────────┘

                         ┌─────────────────────┐
                         │ Completion            │  (#complete, shown only
                         │ (#complete)           │   AFTER the Phase 3.1
                         │ Machines/Coins/        │   sparkle celebration)
                         │ Secrets/Time           │
                         │ Main semula            │──(confirm)──> Gameplay (fresh run)
                         │ Pilih Level ───────────┼──> Level Select
                         │ Menu Utama ────────────┼──> Main Menu (save untouched)
                         │ Kembali ke peta         │──> leaves the game entirely
                         └─────────────────────┘
```

## Entry/exit points, concretely

- **Main Menu → Gameplay**: `#start` or `#continue-btn` click (unchanged
  Phase 6 logic) — audio unlock, `startRun()`/`continueFromSave()`.
- **Main Menu → Level Select → Gameplay**: `#level-select-btn` opens the
  dialog; `#level1-action` refreshes the menu state, closes Level Select,
  then clicks whichever of `#start`/`#continue-btn` is correct — zero
  duplicated decision logic.
- **Main Menu → Koleksi / Tetapan**: direct overlay, no gameplay side
  effects (physics is already paused in `'welcome'` mode).
- **Pause → Koleksi / Tetapan**: same two dialogs, same functions, a second
  trigger button each (`#pause-collection-btn`/`#pause-settings-btn`).
- **Completion → Pilih Level**: closes `#complete`, opens `#level-select`
  (now showing "Selesai"/"Main semula" for Level 1, with the real
  machines/coins/secrets summary).
- **Completion → Menu Utama**: `returnToMenu()` — closes `#complete`, sets
  `mode = 'welcome'`, re-shows `#welcome`, refreshes its buttons and the
  collection UI. The save is **not** touched (it was already written by
  `finish()` before this is reachable).
- **Completion → Main semula**: the pre-existing, confirmation-gated shared
  `restart()` (unchanged).

## Escape / back behavior

A single document-level `keydown` listener (unchanged ownership pattern
from every prior phase) checks, in order: Level Select open → close it;
Collection open → close it; Settings open → close it; otherwise falls
through to the existing scene-mode logic (`playing`→pause,
`paused`→resume, `puzzle`→close puzzle, `note`→close secret note). Exactly
one owner, no double-handling, no dialog left stuck on top of another.

## Focus handling

All menu/level-select/collection/settings dialogs are native `<dialog>`
elements opened via `showModal()`/closed via `close()` — the browser's own
focus-trap-while-open and focus-restore-on-close behavior is relied on
throughout (the same mechanism the puzzle/pause/complete dialogs already
used in every prior phase). No custom focus management was added, and
none was needed: closing any Phase 8 overlay returns focus to whatever
triggered it, never traps it, confirmed by test (see
`menu-regression-tests.md`).

## Keyboard-only path (verified)

`Tab`/`Shift+Tab` cycles through the currently-open dialog's buttons
(native), `Enter`/`Space` activates the focused button (native `<button>`
semantics, no custom handlers needed), `Escape` backs out via the shared
handler above. No mouse interaction is required anywhere in this flow.
