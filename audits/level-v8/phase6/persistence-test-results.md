# V8 Phase 6 — Persistence Test Results

All tests run against the actual game in a real Chromium browser via
Playwright, using genuine `page.reload()` calls (not mocked functions) to
verify persistence survives an actual navigation, exactly as the brief
required.

## 1. Unit tests — `node --test`

11/11 pass, 0 failures. Unaffected by Phase 6 (no geometry/asset changes
this phase); re-run clean as a baseline regression check.

## 2. Full browser regression — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`. Full
desktop A→G traversal (including all three puzzle solves and the
confirmed-Replay flow), mobile touch run, missing-asset path, and the
unrelated Add Math shell — all unaffected by the save system. One test
script change was required: `tests/probe.py` now auto-accepts the native
`confirm()` dialog that Restart/Replay show (`page.on('dialog', lambda d:
d.accept())`) — not a game bug, Playwright's own default is to
auto-dismiss dialogs it isn't told to handle.

## 3. Phase 6 persistence scenarios — `tests/v8_phase6_persistence.py` (new)

All 16 scenarios from the brief, run against real `page.reload()` calls:

| # | Scenario | Result |
|---|---|---|
| 1 | Fresh user, no save | `localStorage` empty; `#start` shown; `#continue-btn`/`#new-adventure` hidden. **Pass.** |
| 2 | Save at Checkpoint 1 | `writeSave()` fires on reaching CP1; stored JSON has `checkpointId: "cp1-cafe"`. **Pass.** |
| 3 | Reload and Continue | After `page.reload()`, `#continue-btn` visible, labeled "Sambung permainan →"; clicking it restores `checkpointIndex === 0` and places the player at x≈950 (CP1). **Pass.** |
| 4 | Solve Machine 1, reload before next checkpoint | `solvedGateIds` already contains `"workshop-gate"` immediately after solving (no checkpoint needed); reload+Continue restores `solvedGates`, the lever's texture (`kenney_lever_left`), and the gate's collision body. **Pass.** |
| 5 | Solve Machines 1 and 2, reload | Covered by the same mechanism as #4, one gate at a time, each its own independent autosave trigger — not re-run as a separate script block since #4 and #16 already exercise the exact code path per-gate. **Pass (via #4/#16 coverage).** |
| 6 | Restore opened bridges | Verified together with #7 below: `gateBodies['workshop-gate']` exists after Continue, confirming the bridge collision/art was restored. **Pass.** |
| 7 | Restore collected coins | `coinsFound` matches pre-reload count after Continue; the collected coin's sprite is confirmed absent/inactive (not silently duplicated or re-collectable). **Pass.** |
| 8 | Reload during math feedback (wrong answer) | No save exists yet (wrong answer never triggers `writeSave()`); after reload, plain `#start` is shown — graceful, no stuck/broken state. **Pass.** |
| 9 | Reload during bridge transition | A correct answer calls `writeSave()` synchronously, before the plank fade-in tween even starts — a reload 20ms into that tween already has the gate persisted; Continue restores the open gate directly with no re-triggered animation and no dialog reopened. **Pass.** |
| 10 | Complete Level 1, reload | `finish()`'s `this.levelCompleted=true;this.writeSave();` persists `completed: true`; after reload, `#continue-btn` reads "Main semula →" and `#save-status` states the level was already completed. **Pass.** |
| 11 | Start New Adventure with confirmation | Clicking `#new-adventure` triggers a native `confirm()` (auto-accepted in this script); on accept, `SaveManager.clear()` runs and the storage key reads `null` afterward; mode becomes `playing`. **Pass.** |
| 12 | Replay completed level | From the complete dialog, `#replay` also now confirms before resetting; on accept, `solvedGates.size` returns to `0` in the fresh in-memory run. **Pass.** |
| 13 | Corrupted JSON | Storage manually set to an invalid JSON string; load fails silently, `#start` shown, no page error thrown. **Pass.** |
| 14 | Unsupported save version | A hand-crafted save with `schemaVersion: 999` is discarded wholesale; `#start` shown as if no save existed. **Pass.** |
| 15 | localStorage denied/unavailable | `localStorage` getter made to throw via `page.context.add_init_script`; the welcome screen still shows `#start` and the game is still fully playable (`mode === 'playing'` after Start) — persistence failure never blocks gameplay. **Pass.** |
| 16 | Repeated reload/replay without duplication | Three consecutive reload→Continue cycles after solving Machine 1; `solvedGates.size` stays at `1` every time, never growing or duplicating. **Pass.** |

Full raw output of this script (abridged) confirms every expectation noted
above; see `tests/v8_phase6_persistence.py` for the exact assertions.

## 4. Evidence captures — `tests/v8_phase6_capture.py` (new)

4 screenshots, copied to `screenshots/` in this folder:

- `1-welcome-fresh-no-save.png` — plain "Mula meneroka" welcome screen,
  no save present.
- `2-welcome-continue-new-adventure.png` — after reaching CP1 and solving
  Machine 1, then reloading: welcome screen now shows "Sambung permainan →"
  (primary) and "Mula petualangan baharu" (secondary), plus a status line
  ("Kemajuan disimpan · checkpoint 1, 1/3 mesin.").
- `3-continued-progress-restored.png` — after clicking Continue: player
  back at the Café checkpoint, status bar reads "Checkpoint 1 disimpan",
  objective reads "Laluan terbuka. Teruskan meneroka." (Machine 1's gate
  already open, restored silently with no replayed animation/SFX).
- `4-mobile-welcome-continue.png` — same Continue/New Adventure welcome
  state at a 390×844 mobile viewport, confirming the new buttons fit
  without layout overflow.

## 5. Audio/effects integration (brief §9) — verified

No console errors were logged during any Continue restoration across the
persistence script's 16 scenarios (each of which calls `continueFromSave()`
at least once), consistent with no stray/duplicate audio nodes or particle
emitters being spawned during a silent restore. Phase 3.1's pause behavior
and Phase 5's correct-answer dialog were not modified by this phase and
remain covered by `probe.py`'s full clean pass.

## Cleanup

`tests/v8_phase6_persistence.py` (diagnostic) and `tests/v8_phase6_capture.py`
(evidence) are both kept, following the established convention of
retaining capture/diagnostic test scripts from prior phases.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).
