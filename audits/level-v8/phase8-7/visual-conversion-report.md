# V8.7 — Minimal Platformer Visual Conversion & Game Navigation

## Context

Reference: Kenney's **Pixepal** (https://kenney.itch.io/pixepal) — used
purely as inspiration for readability/conciseness/interaction clarity,
never copied (no layout, graphics, code, or mechanics were taken from it).

After reviewing Phase 8.5's live result, the user decided the detailed
house/shop/workshop architecture was too much — the target shifted to a
**clean, lightweight, grayscale puzzle-platformer built primarily on the
existing Kenney tiles**, keeping the current V7/V8 world map exactly as
is.

## Reversible snapshot

Before any change, the full pre-8.7 `src/`, `index.html`, `style.css` were
copied to `audits/level-v8/phase8-7/snapshot-before/` — a complete,
restorable copy of the Phase 8.5 end state.

## Phase A — Visual simplification

- `buildingFacade()` (Phase 8.5's wall/window/roof stacking) and
  `shopfront()` (the café/shop combo) were **removed entirely** — no
  houses/shops/workshop facades are generated anywhere now.
- Every ground-supported deck (town-walk-1/2, cafe-deck,
  workshop-approach) now uses a new **`supportPiers()`** helper: two
  simple piers built from `kenney_block_left`/`kenney_block_right` — the
  exact same Kenney tile family already used for every deck/ground edge
  in the game, so a "support" reads as part of the same simple kit rather
  than a separate architecture system (directly satisfies "unify platform
  surfaces, edges, ladders and supports").
- Zone A keeps exactly one house (`house_1_full`) as its original Phase-1
  landmark; the Phase 8.5-added second house was removed.
- Zone E's three "floating" roof decks go back to simple platforms (no
  hanging facade) — only the single `water_tank_stand` landmark remains,
  since it genuinely helps recognize Machine 2's deck at a glance.
- **Hill, cave, river and gate identity were explicitly retained**, per
  the brief's own instruction — `rockMass()`, `caveMouth()`,
  `riverBand()`, and `buildGateStubs()` are completely unchanged from
  Phase 8.5.
- The distant parallax background band (`bg_house_row`/`bg_mosque`/
  `bg_hills`) was kept — removing it would leave an empty grey sky, the
  "visually empty greybox" the brief explicitly warns against; it is
  low-contrast atmosphere, not foreground architecture.

## Phase B — Gameplay readability

- The machine/checkpoint readiness glow (`machineGlow`, previously
  machines only) now also highlights a nearby undiscovered secret — one
  consistent highlight treatment for every interactable object, instead
  of machines getting a visual cue and secrets getting none.
- No object anywhere suggests draggability; nothing changed in this phase
  introduces or implies one.
- No tutorial text was added; the existing 4-item keyboard legend on the
  main menu was left exactly as it already was (already minimal).

## Phase C — Camera zoom A/B (see `camera-ab-results.md` for full data)

Real-browser measurement across desktop / short-wide-laptop / mobile-
landscape at zoom 1.0 / 1.2 / 1.3 found character on-screen size dropping
sharply on short viewports (Scale.FIT shrinks the whole render when the
frame is shorter than the fixed logical 700px canvas height). Decision,
implemented as `applyResponsiveZoom()`:

- **Desktop** (frame ≥650px tall): zoom **1.0** — already comfortably
  readable (~102px player height), keeps maximum jump lookahead.
- **Short-wide laptop / mobile landscape** (frame <650px tall): zoom
  **1.3** — the only tested level that meaningfully closed the readability
  gap, while still showing MORE world width than desktop's own 1.0
  baseline (no jump lookahead was impaired).

Not a single zoom applied everywhere — a real per-viewport decision from
measured data.

## Phase D — Menu simplification

Refined, not rebuilt (Phase 8's save/state logic, dialogs, and IDs are
completely untouched): "Pilih Level" / "Koleksi" / "Tetapan" changed from
three full-width stacked buttons (equal visual weight to the primary
action) to a compact underlined text-link row beneath it — the ONE
primary action (Mula Pengembaraan / Teruskan) is now unambiguously
dominant, with the secondary destinations clearly secondary. See
`screenshots/menu/`.

## Phase E — Level exit

The goal now requires an explicit **'E' · Keluar** interaction — the
exact same affordance language as every machine/secret in the game —
instead of auto-completing the instant the player stood there. Gated by
the identical condition that previously auto-triggered completion (every
gate solved, at the goal, grounded), so nothing about WHEN completion can
happen changed, only that it now needs one real keypress. A simple
`kenney_door_closed`/`kenney_door_closed_top` door (previously unused
assets) was added behind the existing destination flag as the visual
"this is the way out" cue. See `screenshots/exit/` and
`level-exit-tests.md`.

## Files changed

- `src/game.js` — `deck()`, new `supportPiers()`, `buildScenery()`
  (rewritten, much shorter), removed `buildingFacade()`/`shopfront()`,
  `applyResponsiveZoom()` (new), goal exit/prompt/interact logic, door
  art.
- `index.html` — menu-section buttons reclassed to `.link-btn`.
- `style.css` — `.menu-section`/`.link-btn` restyled.
- `tests/probe.py`, `tests/v8_phase6_persistence.py`,
  `tests/v8_phase7_secrets.py`, `tests/v8_phase8_menu.py` — updated to
  press 'E' at the goal (the one behavior change these suites needed to
  account for; not weakened, just updated to match the new, intentional
  interaction).

## Not touched

`src/level.js` (world topology/collision), `src/save.js` (schema),
`src/audio.js`, Phase 2 animations, Phase 3 particle/game-feel helpers,
Phase 5 puzzle/hint UI, Phase 6 persistence logic, Phase 7 secret
placement/discovery logic — all confirmed unchanged by the full
regression suite (see `full-regression-results.md`).

## Not committed / not deployed

No commit or deploy was made; `git clean`/`git reset` were never run.
`app/addmath/rooftop/` remains entirely untracked.
