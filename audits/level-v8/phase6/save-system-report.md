# V8 Phase 6 — Local Save, Continue & Progress Persistence

## Objective

Let a player close or refresh the browser and later continue Level 1 from
their latest activated checkpoint, with previously solved machines, opened
gates/bridges, and collected coins staying consistent. localStorage only —
no accounts, no cloud, no external API.

## Inspected before implementing (reused, not duplicated)

- **Checkpoint activation**: `update()`'s checkpoint block
  (`game.js:720-733`) — single-fire by construction (`checkpointIndex++`
  changes which `CHECKPOINTS` entry `nextCheckpoint` resolves to next
  frame). Reused as the save trigger site.
- **Solved puzzle/machine state**: `this.solvedGates` (a `Set` of gate ids),
  already the single source of truth `nearestTerminal()` and the goal check
  both read. Reused directly — the save schema stores exactly this set's
  contents, not a duplicate.
- **Gate and bridge state**: `GATES`/`gateArt()`/`platform()` in `game.js`
  already fully describe a gate's open collision body and visible planks.
  Reused by calling the exact same two calls on restore, just without the
  alpha-fade tween/SFX.
- **Coin collection**: `this.collectibles` (live Phaser sprites) +
  `coin.active` (false once destroyed) + `this.coinsFound` (a count).
  `this.coinsFound` already existed; a parallel `collectedCoinIds` Set was
  added (ids, not just a count) since restoring needs to know *which* coins
  to remove, not just how many.
- **Level completion**: `finish()`, single-fire (only reachable once
  `mode==='playing'`, and `update()` returns immediately once
  `mode!=='playing'`).
- **Scene restart and replay**: `restart()` (`game.registry.set('replay',
  true); scene.restart()`), and `create()`'s own `if
  (this.game.registry.get('replay')) { ...; this.startRun(); }` auto-start
  check. Reused as-is for both "Restart Current Run" and "Replay Completed
  Level" — a shared confirmation was added in front of the existing
  function, nothing about the restart mechanism itself changed.
- **Menu/start flow**: the `#welcome` section and its single `#start`
  button. Extended with two new buttons rather than replaced.

## What was built

### `src/save.js` (new)

A small `SaveManager` object: `load()`, `save(snapshot)`, `clear()`. See
`save-schema.md` for the exact schema and validation rules. Storage key
`lorong-save-v1` — deliberately separate from audio.js's own
`lorong-audio-settings-v1` key (gameplay progress and audio preferences are
unrelated concerns; a corrupt/reset gameplay save must never touch audio
settings and vice versa, and audio settings already persisted correctly
before this phase and continue to do so, untouched).

### `src/game.js` changes

- `init()`: added `this.collectedCoinIds = new Set()`, `this.levelCompleted
  = false`, `this.pendingSave = null`.
- `create()`: calls the new `this.refreshMenu()` before showing the welcome
  screen.
- New method `refreshMenu()`: reads `SaveManager.load()`, toggles
  `#start`/`#continue-btn`/`#new-adventure`/`#save-status` accordingly.
- New method `writeSave()`: builds a complete snapshot from the scene's own
  live state (`checkpointIndex`, `solvedGates`, `collectedCoinIds`,
  `levelCompleted`) and calls `SaveManager.save()`. Called from exactly four
  sites (the autosave triggers, see below) — never on every frame.
- New method `continueFromSave()`: silently restores checkpoint position,
  solved gates (lever textures + gate collision/art, no tween/SFX), and
  collected coins (destroyed, no sparkle/SFX), then reuses the existing
  `respawn()` to place the player safely and `startRun()` to begin play.
- `answer()`: one line added after `this.solvedGates.add(puzzle.gate)` —
  `this.writeSave()`.
- The coin-collection loop in `update()`: captures the coin's id before
  `destroy()`, adds it to `collectedCoinIds`, calls `this.writeSave()`.
- The checkpoint-reached block in `update()`: one line added —
  `this.writeSave()`.
- `finish()`: `this.levelCompleted=true;this.writeSave();` added as the
  first two statements, before any animation/dialog logic.
- `restart()` (shared by the pause menu's "Mula semula" / Restart Current
  Run and the complete dialog's "Main semula" / Replay Completed Level):
  now asks `confirm()` first. The confirm message correctly states the
  saved checkpoint is unaffected, since `restart()` never calls
  `SaveManager.clear()` — it only resets the in-memory scene.
- Two new button handlers: `#continue-btn` (calls `continueFromSave()`) and
  `#new-adventure` (asks `confirm()` only when a save currently exists,
  then `SaveManager.clear()` + normal `startRun()`).

### `index.html` / `style.css`

- Added `#continue-btn` (primary), `#new-adventure` (secondary), and
  `#save-status` (small text) inside the existing `#welcome` section, all
  `hidden` by default — `refreshMenu()` toggles them.
- Two small CSS rules for spacing/full-width on the new buttons, placed
  alongside the existing Phase 5 puzzle-dialog rules.

## The four distinct actions (brief §6)

| Action | Entry point | Touches the save file? | Confirmation? |
|---|---|---|---|
| Continue | `#continue-btn` (welcome) | reads only | no |
| Start New Adventure | `#new-adventure` (welcome) | clears it | yes, if one exists |
| Restart Current Run | `#restart` (pause menu, existing) | untouched | yes |
| Replay Completed Level | `#replay` (complete dialog, existing) | untouched (next autosave trigger naturally overwrites it with the new run's progress) | yes |

## Audio/animation/effects integration (brief §9)

Restoring a save never fires `SFX.*`, never spawns `dustBurst`/
`sparkleBurst`/`pulseRing`, never plays a lever's scale-pop tween, never
fades in gate planks, and never reopens a puzzle dialog —
`continueFromSave()` sets final textures/collision/art directly, the same
calls `answer()` already used, just without the one-shot feedback calls
that sit beside them. Phase 3.1's pause behavior and Phase 5's
correct-answer explanation dialog are both completely unmodified — neither
file section was touched.

## Files modified

- `src/save.js` (new)
- `src/game.js`
- `index.html`
- `style.css`
- `tests/probe.py` (added a `page.on('dialog', ...)` auto-accept handler —
  Restart/Replay now show a native `confirm()`)

## Not touched

World topology, movement physics, collision geometry, camera, mathematics
formulas, scenery composition, audio synthesis (`src/audio.js` untouched) —
confirmed unchanged by the full regression suite.

## Not committed / not deployed

Per the brief, no commit or deploy was made. `app/addmath/rooftop/` remains
entirely untracked in git.

## Known limitations (documented per brief §6/§7, not fixed this phase)

- **No schema migration path**: an older or newer `schemaVersion` is
  discarded wholesale rather than partially upgraded. Acceptable for a
  first save-system phase; a migration function can be added later if the
  schema changes.
- **No separate achievements/collectibles record**: "has completed before"
  currently lives only inside the single save object's `completed` flag.
  Starting a New Adventure after completion clears that flag along with
  everything else — there is no persistent "best run" or achievement
  ledger independent of the current save. Per the brief, this phase does
  not invent one; a future phase could add a second, append-only storage
  key for that.
- **Mid-attempt puzzle state is not saved**: an unsolved puzzle's wrong
  attempts/hint level are not persisted — a reload before solving returns
  the player to the last checkpoint with the puzzle unsolved and hints
  reset to zero. This matches "do not persist transient effects" in
  spirit (an in-progress attempt isn't a confirmed, meaningful state change)
  and was confirmed acceptable via test scenario 8.
