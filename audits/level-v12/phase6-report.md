# DENAI V12 — Phase 6 optional routes and finale

13 November 2026. Isolated V12 implementation at `http://127.0.0.1:8765/app/addmath/rooftop/v12.html`.

## Changes

**C remains optional.** The existing upper route and its ladders are unchanged. Testing the four distinct inputs 0–3 records `0→1, 1→3, 2→5, 3→7`; completion explains the +2 output pattern and unlocks the existing `c-return` collectible. Repeating an input does not add a new pair. Partial mapping progress survives Continue. The mapping secret can no longer be awarded merely by pressing E near its discovery marker. Existing already-collected items in older saves are retained.

**F's cave remains optional.** The existing inverse challenge, lower floor, two ladders and collectible remain. On domain `{0,1,2,3}`, `f(x)=2x+1` is one-to-one with image `{1,3,5,7}`; recovering the input for output 7 gives 3, not `1/7`. Input 2 visibly produces 5 and allows retry. A correct experiment enables the existing cave gem. The generalized reward unlock also restores unlocked, uncollected C/F rewards after Continue. Optional discoveries never enter the mandatory gate list.

**G is one bridge mission at one console.** Actual V11 source confirms `h(x)=4x−3`, target 17/input 5, followed by input 2 through the approved composition: `g(f(2))=13`, while `f(g(2))=9`. Those requirements are unchanged. Both stages now use the title **Misi jambatan sungai**, with a shared explanation of the two bridge locks.

| State | Visible response | Collision and persistence |
|---|---|---|
| Locked | Existing lever at 0°; status says two locks are needed | Bridge parked at y=1242, no crossing collider |
| First lock correct | Panel closes; lever rotates to −24° over 460 ms; notice directs the player back to the same console | First lock saved; bridge remains parked and non-colliding |
| Second order non-target | Real intermediate/result `2→4→9` shown, retry available | First lock retained; bridge stays locked |
| Both locks correct | Lever progresses from −24° to −52°; existing bridge rises to y=972 over 760 ms | `river-crossing` is awarded only when the bridge settles and collision is installed |
| Interrupted activation + Continue | Both verified locks recover to the settled safe bridge | Player stays at the last earned checkpoint; no automatic teleport across the river |
| Actual destination | Existing completion results appear | Position, grounded contact and mandatory gates are checked before completion |

Reduced motion skips the interpolation. First-lock and second-lock progress each change the existing mechanism rather than adding unrelated answer popups. Reopening the second stage no longer prints the correct sequence before the player tries it; explicitly requested hints/worked solutions remain available.

The old automatic east-bank checkpoint grant on bridge activation was removed. The player now earns it by crossing. Completion also earns the destination restore point after verified arrival, covering a player who jumped past its approach flag. Save validation rejects a completed flag without the required gates and destination checkpoint.

**Rewards:** retain the nine existing collectibles and two local discoveries. No extra points ledger, currency, shop, accounts or online system was added. Completion counters derive from the saved unique collectible/secret identifiers. Collection entries now use the existing secret `name` when `title` is absent, avoiding an undefined heading.

**Dialogue integration:** full-route screenshots exposed old B/C reactions arriving much later in F/G. Reactions from previous zones, and failure reactions superseded by a solved mechanism, now move to the rereadable journey notes instead of appearing as contradictory bubbles. Current-zone reactions retain the existing queue/cooldown behavior.

## Geometry and asset preservation

No terrain, platform, ladder, camera or global movement constant was changed.

| Element | Existing coordinates retained |
|---|---|
| C upper route | x=1458–1944, top=864 |
| C entry / return ladders | x=1512 / 1890; 1188→864 / 864→1080 |
| C mapping console / reward | x=1692, feet=864 / x=1836, y=804 |
| F cave floor | x=6136–6568, top=1134 |
| F cave entry / exit ladders | x=6226 / 6478; top=918, bottom=1134 |
| F inverse console / gem | x=6400, feet=1134 / x=6360, y=1080 |
| G console / lever | x=7390, feet=972; existing hinge at (7423,951) |
| G bridge | x=7506–7830; parked top=1242, safe top=972 |
| G west / east checkpoints | (7296,972) / (7890,972) |
| Destination | x=8316, feet=972; safe restore checkpoint (8170,1026) |

Existing timber deck atlas frames 48–50, existing coins/gem and the existing lever crop are reused. The lever already samples the verified terrain atlas at x=72, y=54, with separate base/handle crops. Only its angle/state changed. The new status is Phaser text using the incumbent label helper. No art file, new sprite frame, cave pack, enemy or world area was introduced.

## Runtime evidence and tests

- **Natural keyboard A–G, optional routes skipped:** passed from a fresh start through the actual goal. Results **3/9 collectibles, 0/2 secrets**; unchanged after completed Continue. [Results](phase6/skip/full-progression.json).
- **Natural keyboard A–G, both optional routes visited:** passed, including C partial-pattern reload, pattern reward pickup, F incorrect/correct inverse input, cave gem pickup and ladder exit. Results **6/9 collectibles, 2/2 secrets**, retained after completed Continue. [Results](phase6/visit/full-progression.json).
- Both runs exercised real B/D/E mechanisms, F traversal, first G lock reload, incorrect composition, bridge motion with no collider, actual crossing and actual destination interaction. No teleports, injected gates, altered speed or physics overrides are used by these full-route tests. The existing A–E harness's R-key checkpoint recovery is retained.
- **Touch finale:** portrait 390×844 and landscape 844×390 passed wrong/correct inputs, first-lock Continue, physical crossing and rejection of early completion. Portrait also paused during bridge movement and reloaded safely at the west bank; landscape used reduced motion. These independent G tests begin with a documented checkpoint fixture. [Results](phase6/touch/results.json).
- **Completion edge case fixture:** remote finish rejected; arriving at the actual goal after missing its approach flag still saved valid completion and restored results through Continue. This is a controlled state test, not a traversal claim. [Results](phase6/completion-recovery.json).
- **18 Node checks passed:** finale/state 3, contextual dialogue 6, waterworks 6, moving platform 3. Runtime syntax checks passed. Final full-route browser runs recorded no page errors, console errors or failed requests; touch/edge-case runs recorded no runtime errors.

The first harness attempts exposed checkpoint/console overshoot under browser load. The test now uses normal keyboard alignment at C/G landmarks; runtime movement/geometry was not changed to accommodate the test.

### Actual screenshots

- [C completed pattern](phase6/visit/screenshots/c-pattern-complete.png) · [C reward pickup](phase6/visit/screenshots/c-reward.png)
- [F inverse retry](phase6/visit/screenshots/f-inverse-retry.png) · [F reward](phase6/visit/screenshots/f-inverse-reward.png) · [F safe exit](phase6/visit/screenshots/f-safe-exit.png)
- [G first lock, portrait](phase6/touch/portrait-latch-one.png) · [G non-target composition, landscape](phase6/touch/landscape-order-retry.png)
- [G moving bridge](phase6/visit/screenshots/g-bridge-moving.png) · [safe bridge](phase6/touch/portrait-safe-bridge.png) · [touch crossing](phase6/touch/portrait-crossed.png)
- [Actual goal](phase6/visit/screenshots/g-goal.png) · [completion with optional rewards](phase6/visit/screenshots/g-results.png) · [completed Continue](phase6/visit/screenshots/g-completed-continue.png)

## Files and review

Runtime changes: `finale.js` (new math/status helpers), `mechanisms.js`, `environment.js`, `level.js` (reward conditions only), `game.js`, `save.js`, `dialogue.js`, `dialogue-ui.js`, plus the journey-notes accessibility label in `v12.html`. [Runtime diff](phase6/runtime-changes.diff), [baseline modules](phase6/baseline/).

Tests: [full natural traversal](phase6-natural.py), [touch finale](phase6-touch.py), [completion recovery](phase6-completion-recovery.py), [state unit tests](phase6-state.test.mjs). The earlier Phase 4 test fixtures were updated to respect the actual-goal guard and current-zone queue rules.

## Remaining limits / stop

- Physical Android/iOS devices and non-Chromium engines were not tested. Mobile evidence uses browser touch emulation.
- Full-route runs are not 100% collectible sweeps: optional crate reward and D service reward are not covered here. Human playtesting is still needed for pacing, discoverability and reading comfort.
- The design detector flagged pre-existing Arial/palette declarations against stale design metadata. The established game fonts/colors were deliberately preserved; no design-system migration was made.
- No V11/V10/V9 migration, root route replacement, commit, push or deployment was performed. Existing release blockers are not claimed resolved.

Phase 6 stops after full progression and state verification. No enemies or later phase were started.
