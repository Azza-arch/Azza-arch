# DENAI V12 — Phase 0 Implementation Readiness

**Scope:** source and asset audit only. No V12 runtime, V11, V10, or V9 files were changed. No commit, push, or deployment was made.

## Readiness summary

V11 is a substantial, working candidate foundation: current source defines a continuous 8400 × 1600 world, 16 rooms, A–G progression, optional C and F branches, seven required mechanism states/latches, checkpoints, save/continue, keyboard and touch controls, and completion. The current local page returned HTTP 200 with all seven sampled HTML, CSS, JavaScript, Phaser, and terrain-atlas paths returning 200. The three existing V11 Node suites passed 12/12 tests when run individually.

V12 should be an isolated game entrypoint and source tree. This audit does **not** authorize V12 gameplay implementation; the brief explicitly gates each phase behind a separate prompt and approval.

## Current V11 source of truth

- Entry: `app/addmath/rooftop/v11.html`, loading `src/v11/game.js`, `src/v11/world.css`, `src/v11/presentation.css`, `style.css`, and `vendor/phaser-3.90.0.min.js`.
- Coordinates and math: `app/addmath/rooftop/src/v11/level.js`. It imports only `MOTION` and the original approved baseline questions from `src/level.js`; V11 overrides its own world geometry and current puzzle set.
- Runtime: `src/v11/game.js`, `environment.js`, and `mechanisms.js`; presentation and persistence live in `presentation.js` and `save.js`.
- Persistence namespace: `lorong-save-v11`, level id `lorong-atas-bumbung-v11`; V11 sanitizer accepts layouts 111/112 then writes 112. V9 legacy import is explicitly disabled.
- Existing reports and screenshots: `audits/level-v11/full-world-implementation/phase4-F-G-report.md`, `remaining-issues.md`, `audits/level-v11/final-game-presentation/README.md`, and `audits/level-v11/quality-polish/`.

### V11 baseline verification in this audit

- Node tests run individually: math/Zone D 4/4, waterworks 4/4, Phase 4/F–G 4/4; total **12/12 passed**.
- Local GET `http://127.0.0.1:8765/app/addmath/rooftop/v11.html`: **200**. Sampled `style.css`, V11 CSS and JavaScript modules, Phaser 3.90.0, and `assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png`: **200**.
- An additional Playwright smoke attempt could not launch Chromium because the sandbox denied subprocess creation (`WinError 5`). It is not counted as a game failure. Full Chromium traversal evidence remains in the V11.1/V11.2 reports; it was not rerun during Phase 0.
- The multi-file `node --test` invocation also hit sandbox `spawn EPERM`; running each test file directly succeeded. This is a test-runner process limitation, not a reported source regression.

## A–G coordinate boundaries

Source: `src/v11/level.js` `ZONES` and `ROOMS`; boundaries use world X coordinates. C is a vertical optional branch overlapping B in X.

| Zone | X span | Rooms and role |
|---|---:|---|
| A | 0–1458 | R01 (0–432) start; R02 (432–972) optional crate/plate; R03 (972–1458) gap/checkpoint |
| B | 1458–3024 | R04 (1458–1944) input exploration; R05 (1944–2484) lift; R07 (2484–3024) approach |
| C | 1458–1944 | R06 upper mapping bonus, optional, y-tier 864 |
| D | 3024–4104 | R08 number rack/crossing (3024–3564); R09 service branch (3100–3456, optional); R10 composition (3834–4104) |
| E | 4104–5650 | R11 pipes/approach (4104–4860); R12 reservoir/composition/crossing (4860–5650) |
| F | 5650–7250 | R13 ridge/river overlook (5650–7250); R14 inverse alcove (6136–6568, optional) |
| G | 7250–8400 | R15 river and two latches (7250–8046); R16 destination (8046–8400); goal x=8316, feet=972 |

World bounds are 8400 × 1600; spawn is x=90, feet=1296. All collision surfaces, ladders, gates, checkpoints, collectibles, terminals and room ranges are authored as data in `src/v11/level.js`; the actual world has more vertical variation than the brief's shorthand description of its topology implies.

## Existing mechanics and reuse map

| Feature | Actual V11 behavior | Reuse note for V12 |
|---|---|---|
| Chill Boy / movement | Existing sprite frames and Phaser Arcade movement, jump, coyote/buffer, ladder climb, camera; constants imported from `src/level.js`. | Preserve sprites and constants per brief; avoid editing shared physics to solve local geometry. |
| A crate / plate | Push crate onto plate; bonus ledge appears and becomes usable. Crate can be reset. | Existing platform puzzle, not a crate-carry quest. |
| B lift | `f(x)=2x+1`; target 7/input 3; bridge art moves and collision is added at safe y=1080. | Working input/output model. |
| C bonus | Four `f` input/output mappings and optional collectible; can return to B. | Optional branch, not needed for completion. |
| D number block | `g(x)=3x-2`; target 10/input 4; block response and safe span at y=972. | Existing interactive block/safe-state pattern. |
| D composition | R10 compares input 2: `g(f(2))=13`, `f(g(2))=9`. | Existing review is real and part of route; brief should retain or explicitly replace only with later approval. |
| E waterworks | Input 3, F then G yields 19; G then F yields 15; flow/fill/bridge animation and collider after settle. | Strongest current applied-math mechanism prototype; current 3.4s-ish sequence is a human pacing question. |
| F optional inverse | Given `f(x)=2x+1` and domain `{0,1,2,3}`, output 7 maps back to input 3; optional gem. | Correctly domain-bounded and optional. |
| G finale | Latch 1: `h(x)=4x-3`, target 17/input 5. Latch 2: input 2 compares `g(f(2))=13` and `f(g(2))=9`; correct order moves bridge; collision only after settle. | Current final mechanism is two stages in one dialog/state machine, not two disconnected quiz pages. |
| Save/checkpoints | Sanitized V11 localStorage state, required-gate dependencies, unlimited retries, checkpoint respawn, Continue and completion persistence. | Must use a new V12 key/id; never reinterpret V11 coordinates as V12 saves. |
| Input/UI | Keyboard, coarse-pointer touch controls, contextual proximity prompts, menu/help/settings/pause/math panels, reduced-motion handling. | Reusable behavior exists, but dialogue bubbles/objective tracking/mission replay are not implemented. |
| F moving platform | No deterministic horizontal moving platform with rider-carry logic was found in V11. Current bridge/lift motion is scripted gate animation, not a general moving-platform system. | Phase 3 must build and independently test a new system; do not label the existing lift as proof of moving-platform requirements. |

## Verified artwork inventory

Project source and catalog files are under `app/addmath/rooftop/assets/`:

- Kenney Pixel Platformer source: `kenney-pixel-platformer/Tilemap/tilemap_packed.png`, unpacked tile images under `Tiles/`, `Tilesheet (Tiles).txt`, `Preview.png`, and `KENNEY-PIXEL-PLATFORMER-LICENSE.txt`.
- The checked-in tile catalog states 18 × 18 px tiles, 1 px spacing, 20 columns × 9 rows, 180 source tiles. Current Phaser load treats the packed atlas as 18 × 18 frames. Current source references numeric atlas frames 33, 48–50, 64 (lever source crop), 67, 111–112 and 148–149; those are existing uses, not approval to reuse an ID without visually checking it against the source atlas.
- Chill Boy has 24 existing raster frames: 12 idle, 10 run, one jump, one fall. `assets/manifest.json` maps them to `assets/chill-boy/`.
- The project also contains a separately licensed Kenney New Platformer pack in `assets/kenney/`, plus production art in `assets/production/`. The brief says to use the original verified Pixel Platformer set and existing runtime art; do not treat the two Kenney packs as interchangeable.
- V11 runtime uses the Pixel Platformer packed atlas and named `kpp_*` entries from `assets/manifest.json`. Preserve provenance; no new, generated, or expansion-pack artwork is needed for the listed first prototypes.

Before any V12 art change, consult the actual tile image / atlas and provenance, record the filename and frame, and distinguish decorative art from collision geometry. Numeric atlas indexes alone are not sufficient verification.

## Brief/runtime inconsistencies to resolve before phase-specific implementation

1. **Title and naming:** current V11 HTML, save id, dialogs, and page metadata still say “Lorong Atas Bumbung”; “DENAI — Bab 1: Misi Fungsi” does not exist in runtime yet. Isolate branding in V12; do not rename V11 or its save namespace.
2. **Directory URL:** `app/addmath/rooftop/index.html` is the older game and imports `src/game.js`; V11 is the explicit `v11.html` and imports `src/v11/game.js`. The root project index is also not a DENAI/V11 route. Do not point V12 users at either index without a later migration plan.
3. **Waterworks design is not yet the proposed mission flow:** V11 presents the order comparison in one mechanism panel and automatically starts flow on the correct order. “Inspect, change order, activate, observe intermediate and final output, adjust if target is not achieved” is more player agency than current runtime provides; it needs a scoped design/prototype prompt.
4. **Final composition answer set differs:** V12 brief's progression lists `g(f(3))=19` and `f(g(3))=15`, but V11 E already uses that pair and yields 19/15. V11 G uses **input 2**, yielding 13/9, to retain a distinct finale composition after its h-latch. The brief's finale says preserve approved review where confirmed; it does not state whether G should retain input 2 or repeat input 3. Keep current math unchanged until a phase prompt resolves this.
5. **F optional inverse:** the brief mentions a valid invertible function and stated domain but gives no final rule; current V11 uses `f(x)=2x+1`, domain `{0,1,2,3}`, `f⁻¹(7)=3`. This is a verified existing solution and can be used as baseline.
6. **Story and dialogue:** V11 has short tutorial/toast/status announcements but no contextual Chill Boy dialogue system, supply-delivery objective, or rereadable mission journal. Existing text should not be presented as implementation of that story/dialogue requirement.
7. **Platforming:** current V11 contains fixed jumps, ladders, gates and animated bridge/lift planks. The requested independently testable horizontal F platform, rider carry, turnaround and save behavior are new functionality, not current behavior. No enemy patrol is present or authorized.
8. **Rewards:** current pickups/secrets and completion totals exist; no local points/score system was found. Points are “consider” only in the brief, not a required feature.
9. **Test hooks / release:** `src/v11/game.js` exposes `window.rooftop` whenever the URL has `?test`, including scene and constants. This is currently a QA hook, not a production-safe V12 interface; V12 production must not ship a public test shortcut. Prior V11 release report also documents an incomplete runtime ZIP and a production 404; neither was fixed or rechecked by this Phase 0 audit.
10. **No actual V12 exists:** no `v12.html` or `src/v12/` source was found. This is expected at the gated first-response stage, not a defect in V11.

## Recommended V12 isolation

1. Add a dedicated `app/addmath/rooftop/v12.html` and `src/v12/` modules. Keep `v11.html`, `src/v11/`, old `index.html`, shared V9/V10 files, and existing V11 save untouched.
2. Give DENAI its own save storage key and level id (for example, `denai-save-v12` and `denai-bab1-functions-v12`) with a V12 schema/version. Do not import or migrate V11 state automatically.
3. Reuse only immutable runtime dependencies (Phaser vendor build and verified art files) by relative paths. Keep V12-specific level data, mechanism flow, dialogue, moving-platform code, UI state and QA behind V12 modules. If shared source is needed, extract only after a separate review and prove V11 unchanged.
4. Make test access opt-in for local/test builds only and do not expose a production `?test` object. Keep the default directory and root indexes unchanged until a documented migration is separately approved.
5. Add V12-specific tests and screenshots under `audits/level-v12/`; preserve existing V11 test fixtures and reports. Before later implementation, establish clean-save desktop/mobile screenshots and hash/check the V11 files that must remain isolated.

## Phase 0 exit decision

**Phase 0 is complete; ready only for the separately gated Phase 1 design blueprint.** This report does not start Phase 1 or authorize gameplay implementation. The blueprint should resolve the composition input discrepancy and specify the player agency expected in the waterworks prototype. Human discoverability, enjoyment, physical device/browser testing, public routing and production-package repair remain outside this source-only audit.
