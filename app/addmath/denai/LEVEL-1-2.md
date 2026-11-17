# Jambatan Berkembar — prototype implementation record

## Audit and blueprint

Active entry is `index.html → src/v14/game.js` (Phaser 3.90), not rooftop. The
legacy-named `Rooftop` class is scene `Lorong`. Its lifecycle loads the manifest,
builds static geometry, creates an independent 28×60 player body and sprite,
then pauses at the menu. L1 terrain lives in `v14/level.js`, rendering in
`environment.js`, and mechanisms in the mechanism/lift-panel factories.

Movement is acceleration-based (280 units/s, jump 520, gravity 1400), with
110ms coyote time, 130ms buffering, one-way decks and climbable ladder zones.
Camera follow, adaptive vertical framing and idle/run/jump/fall animations are
shared unchanged. Kenney terrain is 18px at 3×, backgrounds 24px at 3×.

L1 selects validated seeded lift variants, then animates a physical bridge.
`denai-save-v14` stores the current L1 run (schema/layout 2); `denai-profile-v1`
stores permanent L1 records and migrates older records. Its sanitizer only
retains L1, so L2 must not write into it. PlayFab is an opt-in leaderboard
adapter, title 1FD1D5, statistic `denai_l1_time`; L2 never submits to that board.

The new level uses four connected sections on the same 54-unit terrain grid:

1. Jejak Masuk: a garden approach, a raised bank and a small stream jump.
2. Dua Mesin: route a number through f and g in both orders. Two receivers
   physically extend the twin bridges. Input 2 yields 9 and 25.
3. Laluan Rahsia: main-route stepping banks and an optional ladder/canopy route.
4. Jambatan Akhir: transfer the idea to input 3, producing 19 and 49, then
   cross the activated bridge to the exit.

Each machine has physical input, order and send controls. Experiments show
the intermediate value and animate a packet through the machines. Wrong
outputs are useful observations, not lost lives. No quiz modal or unlock-by-MCQ.

## Architecture boundary

Shared terrain and player motion are extracted from L1, with original values
and collision rules retained. Level scenes own presentation; pure composition
commands own mathematical state; the campaign store owns solo persistence.
Stable IDs are w1-l1, w1-l2, w1-l3. L3 is metadata only, never a playable scene.

Future co-op can send composition commands to an authoritative room reducer,
publish revisioned snapshots, and rebuild scene presentation after reconnect.
Room state must use a separate store from solo checkpoints. PlayFab identity
can attach to that adapter without becoming a dependency of the reducer or
player controller. No networking is introduced here.

## Implemented

- Continuous 4,860-unit world, two physical bridge systems, three ladders,
  optional upper/canopy paths, 15 coins, two mathematical discovery notes,
  six checkpoints and an explicit exit interaction.
- Input/order/send levers use E in the world. The nearby nonmodal panel offers
  the same controls for touch and shows inner/outer functions, intermediate
  values, receiver targets and useful feedback for unsuccessful experiments.
- Both bridge routes share a lower-bank checkpoint, so falling after the
  optional upper route does not send the player back to the first machine.
- L1 victory continues into L2; the world map resumes L2. Completion is
  idempotent per run, replay resets only the current L2 run, and lifetime
  L2 coins/secrets/completions survive. L3 has a title and teaser only.
- Local hosts (`localhost`, `127.0.0.1`, `azza-arch.test`) can preview L2
  directly without forging an L1 completion. Other hosts require an existing
  L1 completion before the L2 action is available.

Reused: Phaser boot/assets/audio, actual Kenney terrain geometry, tree masks,
parallax, deck/ladder rendering, player body and animations, movement values,
camera zoom/follow behavior, effects and global keyboard/touch input.

New: level registry, composition reducer, L2 world data and scene, isolated
campaign store, contextual controls, compact pause/victory UI and tests.
The scene still subclasses the legacy-named L1 class to reuse safe helpers;
this is intentionally an incremental extraction, not a wholesale engine rewrite.

## Save compatibility

`denai-campaign-v1` schema 1 is the new namespace. The store reads legacy
profile/run/record completion when calculating L1 availability, but never
writes any of those three keys. Existing L1 best times, achievements,
collectibles, secrets and variant history remain in their original stores.

L2 stores a stable run ID, checkpoint ID, collected coin/secret IDs, both
puzzle states (input, order, receiver latches, last trace, revision), elapsed
time and completion. Sanitization filters unknown collectibles/checkpoints,
rejects impossible later progress without the first bridge, and recomputes
saved traces. Invalid JSON starts an empty campaign view; storage failures
report that saving is unavailable. A newer unknown schema is not overwritten.
Completion IDs prevent replaying a completed save from incrementing records.

No L2 score is submitted to the L1 PlayFab board. This build adds no online
service calls, multiplayer room state or infrastructure.

## Validation — 2026-11-15

Commands (Node 22 and Python Playwright):

```text
node --experimental-default-type=module app/addmath/denai/tests/twins.test.mjs
node app/addmath/denai/tests/l2-playthrough.cjs <outdir>   # World 1 V3 workshop (replaces twins-smoke.py)
node app/addmath/denai/tests/l2-check.cjs <outdir>
git diff --check
```

All passed. The pure tests cover all original L1 mission variants; both
composition orders for inputs 0–4; incorrect experiments; receiver activation;
legacy byte preservation; exactly-once completion; replay; corrupt/quota/newer
schema handling; ready/locked levels; and terrain/ladder/checkpoint geometry.
An extraction comparison also verified that shared player creation and motion
match the original L1 code, apart from the explicit respawn return contract.

The full Chromium smoke used real keyboard movement/jumps to traverse the
level, climb both secret routes, activate both bridges, intentionally fall,
resume after reload, pause during a packet animation, finish, replay, return
to the world map and start/move in L1. It collected 13/15 coins and both secrets;
collecting every optional coin is not required for completion. Legacy run and
profile bytes were unchanged by the L2 run. No page errors were observed.

Phone checks covered portrait 390×844, small portrait 320×740 and landscape
844×390 with reduced motion. Each touch button was checked individually for
viewport bounds; jump, pause/resume and both machine orders were tapped.
The focused phone rendering regression uses test-only scene positioning;
the full smoke's traversal and original phone approach use movement input.
Test hooks are injected by Playwright, never exposed by the production game.

Two defects found during testing were fixed: scene shutdown previously tried
to stop an already destroyed player body; the existing large touch buttons
clipped Jump in portrait. The latter fix is scoped to L2.

Evidence:

- [Machine and bridge, desktop](tests/artifacts/twins/02-twin-machines-desktop.png)
- [Upper route secret](tests/artifacts/twins/03-upper-secret-desktop.png)
- [Canopy secret](tests/artifacts/twins/04-canopy-secret-desktop.png)
- [Victory](tests/artifacts/twins/06-victory-desktop.png)
- [Phone portrait](tests/artifacts/twins/07-machines-phone-portrait.png)
- [Phone landscape](tests/artifacts/twins/08-machines-phone-landscape.png)
- [Full smoke result](tests/artifacts/twins/smoke-result.json)
- [Phone regression result](tests/artifacts/twins/phone-result.json)

## Local play and remaining scope

Open `http://localhost/Azza-arch/app/addmath/denai/?level=w1-l2` through Laragon.
The normal entry is `http://localhost/Azza-arch/app/addmath/denai/`; open
Settings → Pilih Level, or continue directly from L1 victory.

Keyboard: A/D or arrows, Space to jump, W/S or arrows for ladders, E at a lever,
note or exit, R for checkpoint, Escape to pause. Touch controls are provided.

This is a playable prototype, not a deployed release. Browser testing is
Chromium desktop and emulated phone, not physical iOS/Android testing or a
student comprehension study. L2 cloud saves/leaderboards and real-time co-op
are intentionally absent. L3 remains unavailable. No notes-platform or
rooftop files were changed.

Recommended next step: review L2 with students, then prototype Gerbang Songsang
as a reverse-flow machine using the same command/store/scene boundaries.
Explicitly teach domain/range and the one-to-one condition before introducing
an inverse; do not treat f⁻¹ as 1/f or simply reverse every possible machine.
