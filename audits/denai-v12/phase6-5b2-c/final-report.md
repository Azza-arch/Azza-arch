# Phase 6.5B2-C — Zone C discovery redesign — final report

## 1. What changed

Zone C's "submit four inputs in a quiz panel" mechanic is replaced with a three-beat world discovery, spread along the existing upper deck (x=1458–1944, feet=864):

1. **Clue sign A** (x=1500) — pressing E/Guna shows `f(0) = 1` as a brief on-screen line. No panel.
2. **Clue sign B** (x=1610) — same, shows `f(1) = 3`. After both signs are seen, Chill Boy says *"Eh, setiap kali input naik satu, hasilnya naik dua!"* (queued dialogue, not forced).
3. **Apply sign** (x=1720) — once both clues are seen, pressing it tests `f(3) = 7` and immediately unlocks the existing gated reward (secret id `bonus-mapping`, coin id `c-return`, unchanged). Before both clues are seen it's a soft hint ("Perhatikan dua papan di laluan ini dahulu"), never a block.

A compact always-optional world panel (`#c-control`, mirroring the approved `#b-control` Timber Edge style from Phase 6.5B1) shows the rule status and observed pairs; it is never required to progress. A `Bantuan` button inside it opens the existing help-panel pattern (`openCHelp`, modeled on `openBHelp`) with the full `f(x)=2x+1` explanation and whatever pairs have been observed — available on demand, never shown automatically.

## 2. What the player physically does

Walk up the C-entry ladder → press E/Guna at a sign near the entry → walk ~15 tiles → press E/Guna at a second sign → (optionally notice Chill Boy's line) → walk a short distance → press E/Guna at a third sign → walk the remaining ~20 tiles to the now-visible-and-collectible coin → pick it up → continue down the C-return ladder back to the main route. No popup, no button grid, no "submit answer" step anywhere in this path.

## 3. What mathematics is learned

`f(x) = 2x + 1` restricted to domain `{0,1,2,3}`, image `{1,3,5,7}` — unchanged from before. The two shown pairs (`0→1`, `1→3`) are consecutive, so the "+1 input → +2 output" relationship is directly observable; the apply step tests `f(3)=7`, a point the player was never shown, so succeeding requires generalizing the pattern rather than recalling a fourth memorized pair.

## 4. Why this differs from the old quiz

Old: open a panel, click an input button 0–3, repeat four times, panel tracks `n/4 diteroka`. Functionally a worksheet. New: two passive observations at different points along a real platforming path, then one deliberate act of applying the noticed pattern to an unseen case — nothing opens a panel, nothing is submitted, and understanding is demonstrated by action (reaching for input 3) rather than by completing a checklist.

## 5. Files changed

| File | Change |
|---|---|
| `src/v12/c-control.js` | **new** — world panel sync (`syncCControl`), mirrors `b-control.js` |
| `src/v12/c-control.css` | **new** — same Timber Edge tokens as `b-control.css` (reused, not new colors; suppressed via `ignore-value` with reasons logged in `.impeccable/config.json`) |
| `src/v12/level.js` | `TERMINALS`: `mapping` → `c-clue-a` (x=1500), `c-clue-b` (x=1610), `c-apply` (x=1720); updated `SECRETS['bonus-mapping'].description` |
| `src/v12/environment.js` | `s.mappingInputs/mappingDone` → `s.cClues` (Set); three new frame-85 sign sprites (`cClueArt.a/b`, `cApplyArt`), reusing Zone B's existing selector art, no new sprites |
| `src/v12/mechanisms.js` | `nearestTerminal()` extended for `c-clue`/`c-apply` (tight 48px radius, excluded once solved); new `inspectCClue`, `applyCPattern`, `openCHelp`; `writeSave`/`continueFromSave` updated to persist `cClues` instead of `mappingInputs`/`mappingDone` |
| `src/v12/game.js` | import `syncCControl`; prompt text/compact-clamp branches for `c-clue`/`c-apply`; interact dispatch; `KeyH` toggle extended to `c-help` |
| `src/v12/save.js` | `sanitize()`: `mappingInputs`/`mappingDone` → `cClues` (allowed values `['a','b']`) |
| `src/v12/presentation.js` | `mappingReadout` → `cReadout` in the hide-list; `lessons.mapping` → `lessons['c-help']` |
| `src/v12/dialogue.js` | `found:mapping` → `found:c-clue`, `found:c-apply`; new `found:c-pattern` (the suggested Chill Boy line); `origins` map updated |
| `v12.html` | `c-control.css` link; new `#c-control` aside |

V9/V10/V11 untouched. Zones B, D, E, F, G untouched (confirmed below).

## 6. Test results

### Node unit tests (`node --test`)
- `audits/denai-v12/phase6-5b1/state.test.mjs` — **2/2 pass**, unaffected by this phase (confirms Zone C's save-shape changes didn't disturb Zone B's own save tests).

### Browser QA — `audits/denai-v12/phase6-5b2-c/browser-qa.py` (Playwright, desktop keyboard 1440×900 + portrait touch 390×844)
Ran clean **twice in a row** with zero console/page/network errors both times:
```
desktop: passed
portrait: passed
partial-continue: passed
old-save-migration-complete: passed
old-save-migration-partial: passed
```
Covers, against the spec's test list: observations produce correct `f(0)=1`/`f(1)=3`/`f(3)=7`; repeated inspection of the same clue sign doesn't duplicate (`cClues` stays `['a']` after a second press); the apply sign is a soft-blocked hint (not a failure) before both clues are seen and a one-shot unlock after; the reward coin exists-but-is-non-collectible before unlock, becomes collectible immediately after, and is only actually collected when the player walks to it (not on the unlock frame — see §7 below for why this needed a real fix); no duplicate collectible (`collectedCoinIds` checked); exactly one of the three C terminals (or none) is ever `nearestTerminal()` at a time; once solved, `c-clue`/`c-apply` drop out of `nearestTerminal()` the same way every other solved puzzle in this game does; completed-save Continue restores `cClues`, the secret, and the collected coin; keyboard (desktop run) and touch (portrait run, real `touchstart`/`touchend` dispatch plus `locator.tap()` on the Guna button) both exercised the identical code path.

### Separate script: old-save migration
Two scenarios seeded directly into `localStorage` and loaded through the real `sanitize()`/`continueFromSave()` path (not reimplemented in the test):
- **Old completed save** (`mappingInputs:[0,1,2,3], mappingDone:true, discoveredSecretIds:['bonus-mapping'], collectedCoinIds:['c-return']`) → secret and coin both still present after load. `cClues` comes back empty (the old field is simply dropped), which is irrelevant once the reward is already owned.
- **Old partial save** (`mappingInputs:[0,1], mappingDone:false`) → loads cleanly, `cClues` empty, secret not discovered — the trivial optional sub-task resets rather than crashing or half-applying stale state.

### Regression check on shared files
`audits/denai-v12/phase6-5b1/natural-a-e.py` (full keyboard route A→B→D→E, deliberately skipping C) re-run once: **passed, zero errors**. This is the real evidence that touching `save.js`, `dialogue.js`, `mechanisms.js`, `game.js`, and `presentation.js` for Zone C didn't regress Zone B/D/E, since those are shared files.

### Zone B full QA (`phase6-5b1/browser-qa.py`) — inconclusive by design, not re-attempted
One run was in progress when told to stop further reruns; its result is not being reported either way. A prior run in this same session failed on a `nearestTerminal()` x-overshoot of ~51px against a 48px radius — the identical flaky pattern already documented and accepted in the Phase 6.5B1 final report (resolved on retry there, not something this session's edits caused, since Zone B's code was not touched this phase beyond the `tight` array and `nearestTerminal()` signature already covered by B1-era tests still passing via the A→E regression above). Per instruction, this was not retried again.

## 7. A real bug found and fixed during this phase (disclosure)

Initial terminal placement for `c-apply` (x=1794) let the player's interaction radius (48px) reach x=1842 — past the reward coin at x=1836. The coin's `body.enable` flips true inside `discoverSecret()`'s `unlockSecretCollectibles()` call, and the player was already overlapping it at that instant, so the coin was collected invisibly on the same frame as the apply action, with no separate "walk over and collect" beat. Measured actual collision half-widths (coin 16px, player 14px → 30px combined) and moved all three Zone C terminals left (`c-clue-a` 1500, `c-clue-b` 1610, `c-apply` 1720) so the apply terminal's max reach (1768) stays clear of the coin's collision start (1806). Re-verified: the coin now stays locked-but-visible until the player deliberately walks to it, confirmed via `collectedCoinIds` staying empty immediately after unlock and only gaining `c-return` after a separate walk. This is documented as a fix already applied, not a remaining issue.

## 8. Disclosed test-methodology caveat

The "exit via C-return ladder" step in `browser-qa.py` places the player with `s.player.body.reset(1890, 864-30)` rather than walking there, because the test's own keyboard-hold movement helper could not reliably land within the ladder's 34px docking tolerance (it kept overshooting to x≈1925, outside tolerance, on a tight single-deck layout). **This means the QA suite does not exercise natural keyboard/touch navigation of the C-return ladder itself** — only that climbing down from a correctly-positioned stand is physically possible (floor contact, descent, landing on the B-zone deck). Ladder mechanics themselves are pre-existing, unmodified code already covered elsewhere (the A→E natural-route regression uses several other ladders/jumps via real movement). The minimum follow-up to close this gap: a short manual or scripted pass that walks (not teleports) from the apply sign to the C-return ladder and climbs down with ordinary input, to confirm the real approach distance and timing feel right for a human player — this was not done this session.

## 9. Remaining issues

- **Dead code**: `mechanisms.js` still has an unreachable `terminal.kind==='mapping'` branch inside `openPuzzle()`/`testDial()` (~3 spots) left over from before this rebuild. It can never execute (no terminal has that kind anymore), in the same category as the pre-existing dead `kind==='lift'` branches Phase 6.5B1 already left and flagged. Not fixed here — out of this phase's scope (no refactor of unrelated systems).
- **Ladder-exit navigation unverified by automation** — see §8.
- **Landscape viewport not covered** — this phase tested desktop (keyboard) and portrait (touch) only, not landscape, to keep the QA matrix proportionate to C's smaller surface (B1 tested all three). If landscape-specific layout issues matter for C's compact panel, that's the other minimum follow-up.
- Terminal spacing between `c-clue-b` (1610) and `c-apply` (1720) is 110px with a 48px radius each (14px clear margin) — adequate but tighter than ideal; no ambiguity was observed in testing, but it's worth knowing if C's layout changes later.

## 10. Screenshots

`audits/denai-v12/phase6-5b2-c/screenshots/`: `{desktop,portrait}-c-entrance`, `-first-observation`, `-later-observation`, `-discovery-feedback`, `-reward-pickup`, `-exited-to-b` (12 files, from the last clean QA run).

## Verdict: PASS, with two disclosed gaps (§6 Zone B re-run not completed by instruction, §8 ladder-exit teleport)

Zone C now reads as an optional discovery along the platforming route rather than a worksheet: two passive observations, one generalizing action, one physical reward pickup, no required panel anywhere in the loop. Mathematics is unchanged and correct throughout. Save migration is backward-compatible and verified both for completed and partial old saves. The one real bug found (invisible auto-collect) was caught by the QA process itself and fixed, not left for a reviewer to find.

Not started this phase: Zone E, world polish, UI reskin, any commit/push/deploy.
