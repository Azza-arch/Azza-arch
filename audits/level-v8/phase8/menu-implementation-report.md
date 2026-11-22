# V8 Phase 8 — Main Menu, Level Selection & Progression

## Objective

Build a lightweight, Malay-first navigation experience — main menu, level
selection, collection, settings, completion presentation — on top of the
existing game, reusing Phase 6 (save), Phase 7 (secrets) and the existing
dialog/pause patterns exactly as they already work.

## What was built

### Main menu (`#welcome`, re-purposed)

The existing welcome overlay is now the main menu. Options, exactly per
the brief:

- **Mula Pengembaraan** (`#start`) — shown when no save exists.
- **Teruskan** (`#continue-btn`) — shown when a save exists; relabels to
  **Main semula** when the save is `completed` (pre-existing Phase 6
  behavior, renamed this phase from "Sambung permainan"/"Main semula →").
- **Mula Baharu** (`#new-adventure`, renamed from "Mula petualangan
  baharu") — shown alongside Teruskan, confirmation-gated (unchanged
  Phase 6 logic).
- **Pilih Level** (`#level-select-btn`, new).
- **Koleksi** (`#collection-btn`, new).
- **Tetapan** (`#settings-btn`, new).

No duplicate buttons with the same behavior: Pilih Level's own action
button *delegates* to whichever of Teruskan/Mula Pengembaraan is currently
the real, already-wired primary action (`($('continue-btn').hidden ?
$('start') : $('continue-btn')).click()`) — there is exactly one copy of
that decision logic, not two.

### Level Select (`#level-select`, new dialog)

One real card: **Level 1 — Lorong Atas Bumbung**, Tingkatan 4 · Fungsi,
with a status derived live from `SaveManager.load()`:

| Save state | Status shown | Action label |
|---|---|---|
| none | Belum mula | Mula |
| exists, not completed | Dalam perjalanan | Teruskan |
| exists, completed | Selesai | Main semula |

A progress summary line (machines/coins/secrets, real saved counts) shows
whenever a save exists. **No fake Level 2 card, no locked-card widget** —
future levels are represented only by a small `<p class="small">` note
("Lebih level akan ditambah pada masa hadapan.") and, in code, nothing
more than a place to add a second `LEVELS`-style entry later (this phase
intentionally does not introduce a `LEVELS` array, since there is still
only one real level and the brief explicitly says not to invent unlock
conditions or placeholder structure beyond what's needed — `renderLevelSelect()`
reads Phase 6/7's existing `PUZZLES`/`COLLECTIBLES`/`SECRETS` tables
directly, which is already the natural "level metadata" for Level 1).

### Collection (`#collection`, new dialog)

The exact Phase 7 collection UI (`#secrets-count`, `#secrets-list`,
`renderSecretsUI()`) — **moved**, not rebuilt, out of the pause dialog into
its own standalone dialog, reachable from both the main menu and the pause
menu (`openCollection()`, one shared function, two trigger buttons).

### Settings (`#settings`, new dialog)

The exact Phase 4 audio controls (`#audio-mute`, `#audio-master`,
`#audio-sfx`, same ids, same wiring) — **moved**, not rebuilt, out of the
pause dialog into its own standalone dialog, reachable from both the main
menu and the pause menu (`openSettings()`).

### Pause menu (`#paused`)

Simplified to: Sambung (resume), Tetapan, Koleksi, Mula semula (restart),
link back — the audio/collection content that used to live inline here now
lives in the two shared dialogs above.

### Completion screen (`#complete`)

Added `#completion-secrets` ("Rahsia dijumpai: n/3") alongside the existing
machines/coins/time lines — all four values read directly from the scene's
own live state (`this.discoveredSecrets.size`, `this.solvedGates.size`,
`this.coinsFound`, `this.elapsed`), never invented. Added two new actions:
**Pilih Level** (`#complete-level-select`) and **Menu Utama** (`#menu-btn`,
new `returnToMenu()` scene method), alongside the existing Main semula and
"Kembali ke peta Add Math" link. The Phase 3.1 celebration-before-dialog
timing (`finish()`'s `showDialog` deferred via `delayedCall`) is completely
unchanged — verified by test (see `menu-regression-tests.md`).

## Files changed

- `index.html` — main-menu buttons relabeled/added; `#level-select`,
  `#collection`, `#settings` dialogs added; `#paused` simplified;
  `#complete` extended with secrets count + two new action buttons.
- `style.css` — `.menu-section`, `.level-list`/`.level-card` (+ mobile
  stacking), and a fix to `.welcome`'s own sizing (see Known Limitations).
- `src/game.js` — `renderLevelSelect()`, `returnToMenu()`, the
  `openSettings`/`openCollection`/`closeOverlay` helpers and their button
  wiring, the Escape-key handler extended to the three new overlays,
  `finish()` extended with the secrets line, label text updates in
  `refreshMenu()`.
- `src/level.js`, `src/save.js`, `src/audio.js` — **untouched**.

## Known limitations / disclosed decisions

- **No `LEVELS` metadata array was added.** `renderLevelSelect()` hardcodes
  Level 1's identity directly against `PUZZLES`/`COLLECTIBLES`/`SECRETS`.
  This was a deliberate choice: the brief explicitly forbids inventing
  unlock conditions or fake levels, and a one-entry array would add a layer
  of indirection with no present benefit. When a real Level 2 is built, the
  natural extension point is `renderLevelSelect()`'s existing if/else
  status logic plus a second `<li class="level-card">` — not a redesign.
- **A real layout bug was found and fixed during this phase**: the
  additional main-menu buttons made `.welcome`'s content taller than its
  old vertically-centered box in shorter viewports, visibly clipping the
  bottom buttons against `.game-frame`'s `overflow:hidden`. Fixed by
  anchoring the panel with `top:5%;bottom:5%` (previously
  `top:50%;transform:translateY(-47%)`) plus `overflow-y:auto`, so it now
  either fits or scrolls internally regardless of content height. Confirmed
  fixed via a direct geometry check (`getBoundingClientRect`) and re-shot
  screenshots. Mobile's own portrait-specific `.welcome` override (already
  vertically centered, already fits at phone aspect ratios) was left as-is
  since the phone-sized screenshot never showed the problem.
- **"Teruskan" on a completed save still resumes near the end, not a true
  fresh run** — this is pre-existing Phase 6 behavior (`continueFromSave()`
  restores the last real checkpoint, which for a finished run is the one
  just before the goal), unchanged by this phase. The complete dialog's own
  "Main semula" / Level Select's "Main semula" for a completed save both
  still map to this same Continue-style resume (not a full
  `scene.restart()`), matching what the main menu already did before Phase
  8 — a full fresh restart remains available via the pause menu's "Mula
  semula" or the complete dialog's original Replay flow (both routed
  through the shared, confirmation-gated `restart()`).

## Not touched

Physics, player movement, world dimensions, terrain geometry, camera,
machines, gate logic, math formulas, checkpoints, secret placements,
background/world scenery, unrelated Add Math pages — confirmed unchanged by
the full regression suite.

## Not committed / not deployed

Per the brief, no commit or deploy was made. `app/addmath/rooftop/` remains
entirely untracked.
