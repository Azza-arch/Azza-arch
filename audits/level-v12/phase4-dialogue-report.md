# DENAI V12 — Phase 4 contextual dialogue

Completed and tested locally on 13 November 2026. Scope follows the supplied Master Brief sections C, H, K and L and the separate Phase 4 authorization. Only the isolated V12 entrypoint/runtime was edited. No later phase, publication, commit or push was performed.

## Implemented

- Short Malay Chill Boy reactions for first entry into A–G, mechanism discovery, first unsuccessful experiment per mechanism, activation, secret discovery and destination arrival.
- One non-modal bubble at a time, a 5.6-second readable lifetime and a 1.6-second gap after dismissal/expiry. Normal reactions do not change movement, input, physics or camera state.
- A keyboard-focusable/touchable **Tutup** control. Closing returns focus to the game. Touch targets are at least 44 px.
- A compact current-objective button. It opens the existing Jeda menu at **Misi & catatan Chill Boy**. The same section is available by opening Jeda normally; it contains the supply mission, current objective and previously displayed reactions.
- The objective advances from the existing mandatory solved-gate state. Optional C/F discoveries do not become completion requirements.
- The existing completion panel contains Chill Boy's destination line. No extra cutscene, modal or forced reading delay is introduced at the destination.

The dialogue catalog contains no numeric answers, equations, correct input values or prescribed machine order. It encourages observation and retries. It does not rewrite the existing mathematics panels or explicit hint/worked-solution system.

## Trigger mapping

| Event | Source |
|---|---|
| First zone entry | Existing `currentZoneIndex()` and ZONES, including the upper C tier |
| Mechanism discovery | Existing terminal proximity; nearby crate/plate in A |
| Failed experiment | Actual non-target branches in lift, number block, waterworks, inverse and river mechanisms |
| Activation | Newly solved gates, plus the crate switch; transition modes suppress display until play resumes |
| Secret | Existing `discoverSecret()` after a valid first award |
| Destination | Existing gated `finish()` / completion UI |

Repeated inputs and failed jumps do not create dialogue. Number-rack controls share one discovery identifier; water stages and the lever share another. River latch failures share one first-failure identifier.

## Presentation, persistence and recovery

The UI reuses V12's existing cream/green CSS palette and system sans-serif stack. Chill Boy's artwork and animations are unchanged. No new image, atlas frame, voice, NPC, enemy or decorative world object was added.

Bubble placement maps player/world coordinates through the current Phaser camera and canvas size into CSS pixels. Candidates beside/above Chill Boy are preferred, followed by screen-safe fallback positions. Placement excludes the character, HUD, current objective, visible notices/tutorial, touch buttons, interaction prompt, known platform tops and the moving F deck. With no suitable space, the bubble and its reading timer wait. The objective temporarily yields to zone/feedback notices rather than stacking over them. Narrow landscape may use a safe area farther from Chill Boy.

Pause, menus, mechanism panels/transitions and hidden tabs hide the bubble and freeze its lifetime/cooldown. Scene shutdown hides the UI; scene initialization creates a fresh queue. Menu/Continue reconstructs it from the saved state without an old timer or handler continuing to drive it. Live-region text changes only when the line changes.

`denai-save-v12` now includes validated `dialogue.seen` and `dialogue.pending` identifier arrays. Only catalog identifiers are accepted; arbitrary saved text is never rendered. Displayed lines do not repeat after reload. Queued, undisplayed reactions survive reload. Old V12 saves without dialogue remain valid. Restored solved gates do not emit new activation reactions. The existing checkpoint-based player restoration is unchanged.

There are no geometry, speed, gravity, jump, collider, platform-motion or camera-rule changes. V11/V10/V9 and the root game entrypoint were not edited.

## Tests and real runtime evidence

Local Chromium URL: `http://127.0.0.1:8765/app/addmath/rooftop/v12.html`.

| Test | Result |
|---|---|
| New dialogue Node suite | **5/5 passed**: ordering/dedup, cooldown, paused/unsafe timing, reload/pending delivery, save validation, objective progression and no numeric answer leaks |
| Existing waterworks Node suite | **6/6 passed** |
| Existing moving-platform Node suite | **3/3 passed** |
| JavaScript syntax checks | Passed for changed runtime modules |
| Desktop 1440×900 | First trigger, dismissal, natural keyboard movement during dialogue, revisit, multiple triggers, pause/resume, reload, notes and Menu/Continue passed |
| Portrait 390×844 and landscape 844×390 | Same checks passed using actual emulated touch movement; live orientation changes also passed |
| Layout checks | Bubble stays in viewport and does not overlap visible HUD, notices, objective or touch controls in tested states |
| Event wiring fixtures | All A–G zone entry identifiers, real lift failure/success methods, secret award and gated completion passed |
| Natural A–E regression | Fresh start, normal keyboard jumps, B non-target/target experiments, D blocks, E ordering/crossing and checkpoint passed |
| Waterworks regression | Locked/configured/running/non-target/target/crossing states, pause/reload and crossing passed; V11 save sentinel preserved |
| F desktop regression | Natural boarding, carry, turn, exit, missed-jump recovery, pause/resume and Continue passed |
| F touch regression | Natural touch boarding, carry and real east landing passed |

Browser runs reported no page/console errors; traversal regressions also reported no failed requests. Scene instrumentation exists only in test scripts, not runtime. Event fixtures intentionally position the player or establish prerequisites to test trigger wiring; they are not claimed as natural traversal. Separate regression scripts perform the natural traversal.

- [Browser results](phase4/results.json) and [browser test source](phase4-browser-qa.py)
- [Desktop bubble and objective](phase4/desktop-objective.png)
- [Portrait bubble and objective](phase4/portrait-objective.png)
- [Landscape safe fallback](phase4/landscape-objective.png)
- [Reread mission in Jeda](phase4/portrait-mission-notes.png)
- [Queued reaction](phase4/desktop-queued-reaction.png)
- [Destination reaction](phase4/destination.png)
- [A–E natural-input results](phase4/regression-a-e/a-to-e-regression.json)
- [E regression results](phase4/regression-e/desktop-browser-qa.json)
- [F desktop results](phase4/regression-f-desktop/desktop-qa.json)
- [F touch results](phase4/regression-f-touch/touch-qa.json)
- [Touch moving-platform screenshot with dialogue](phase4/regression-f-touch/mobile-touch-platform-boarded.png)

Regression wrappers redirect evidence into Phase 4 folders, preserving earlier reports and screenshots. The A–E wrapper reads the existing script with UTF-8 BOM handling.

## Changed runtime files

- `app/addmath/rooftop/v12.html`: bubble, compact objective, mission notes and destination text containers.
- `src/v12/dialogue.js`: Malay catalog, objective selection, save validation and pure queue.
- `src/v12/dialogue-ui.js`: placement, proximity triggers, state-aware display and reread controls.
- `src/v12/dialogue.css`: existing-theme text UI, responsive bounds and accessible control sizes.
- `src/v12/game.js`: queue lifecycle, dialogue update, secret trigger and pause notes refresh.
- `src/v12/mechanisms.js`: real outcome triggers and persistence/completion integration.
- `src/v12/save.js`: backward-compatible dialogue field sanitization.

## Remaining issues and limits

- No failing Phase 4 functional checks remain. Human playtesting should assess Malay tone, reading duration and how much dialogue feels comfortable during exploration.
- Tests use Chromium and emulated mobile touch; physical iOS/Android devices and other browser engines were not tested.
- C/F optional puzzle routes and the complete G traversal were not replayed through natural input in this phase. Their dialogue wiring and destination state were tested with controlled fixtures; A–E and the F shuttle were traversed naturally.
- When space is constrained, a reaction waits or uses a fallback position. Mission information remains available in Jeda. This is intentional rather than covering a jump surface.
- Existing production tracking/routing/deployment blockers from the Master Brief remain outside this phase. No release is claimed.
- The Impeccable detector ran in degraded regex mode because parser dependencies were unavailable; its empty finding list is not a computed contrast/accessibility certification. Runtime screenshots and bounding-box checks were inspected separately. Its existing design sidecar is stale; the `document` workflow can refresh it on request. Impeccable v4.8.2 is available; no skill update was performed.

Stop condition met: Phase 4 implemented and tested. Await a separate phase request before additional gameplay or narrative work.
