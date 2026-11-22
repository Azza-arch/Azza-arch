# V8 Phase 8.5 — Whole-World Environmental Art & Level Presentation

## Objective

Transform the existing playable greybox V7/V8 world into a coherent,
recognizable Malaysian/Terengganu-inspired platformer world — visual
rendering only, geometry fully locked.

## Source-of-truth verification (done before any change)

Read directly from the live repository before writing any code:

- `src/level.js` — confirmed WORLD (4300×1300, gravity 1400), MOTION
  (speed 280, jump 520), the seven `ZONES`, `GROUND_RANGES`, `DECKS`,
  `LADDERS`, `GATES`, `TERMINALS`, `CHECKPOINTS`, `COLLECTIBLES`,
  `SECRETS` exactly as the brief described — no historical V6.3 values
  found or used anywhere.
- `assets/manifest.json` + `assets/provenance.json` — read every
  production asset's **actual pixel dimensions and alpha bounds**, not
  assumed from filenames (e.g. confirmed `function_machine_idle`/`active`
  are 169×186 with content touching the image's own bottom edge,
  `checkpoint_post_idle`/`active` are ~32×99, `h3_wall_upper`/`h3_wall_lower`
  are ~224–228×159–168, etc.) — these measurements directly drove every
  scale/offset decision in `buildingFacade()`, the machine/checkpoint
  swap, and the shopfront composition.
- `src/game.js` — confirmed the exact pre-existing rendering functions
  (`deck()`, `gateArt()`, `buildScenery()`, `buildEnvironment()`) and
  exactly which parts were collision (`platform()`, entirely separate)
  vs. purely decorative (`this.add.image`/`this.add.graphics`, no physics
  body) before touching anything.
- Confirmed C (Café Atas Angin) is still the elevated, optional detour
  above B it has always been — `ZONES`' `yMax:900` disambiguation and
  `CHECKPOINTS[0]` sitting at the detour's dead end were both read
  directly from the live file, not assumed; nothing in this phase touches
  that relationship.

## What was implemented (visual rendering only)

### New reusable decorative helpers (`src/game.js`)

- **`buildingFacade(x, width, surfaceY, floorY)`** — replaces the old
  "two thin stone-block columns" look under a deck with ONE coherent wall
  mass (`h3_wall_upper` + repeated `h3_wall_lower`) spanning the deck's
  full width. Used for every ground-supported deck (town-walk-1/2,
  cafe-deck, workshop-approach) and, separately, for all three "floating"
  rooftop decks in Zone E (roof-entry/roof-laundry/roof-m2), hung down to
  the town tier (y=980) even though they have no real collision floor —
  purely to give them a plausible building to visually belong to.
- **`shopfront(x, surfaceY, roofKey)`** — a small wall+window+canopy
  combo (the canopy actually resting on the wall, not floating alone)
  used for B's two shopfronts and C's café, with a different roof piece
  per call so neighboring shopfronts don't repeat the same silhouette.
- **`rockMass(x, width, surfaceY, floorY)`** — a restrained Graphics-drawn
  jagged rock/hillside silhouette, replacing the old thin stone pillars
  under F's three step decks (f-step1/cave-alcove/f-step2). Documented as
  a deliberate code-drawn choice (see `remaining-art-gaps.md`) since no
  rock/cliff production asset exists.
- **`caveMouth(x, y)`** — a simple dark archway behind the existing
  cave-alcove deck/label, so the optional cave finally has a visible
  opening instead of only a text sign.
- **`riverBand(x, width, y)`** — a flat grayscale band with a simple wave
  pattern, filling the final-gate's gap below the walkable ground level —
  the "river" the brief asked for, documented as code-drawn since no
  water asset exists.
- **`buildGateStubs()`** — a pair of broken, angled plank fragments
  (`platform_wood_left`/`right`, both previously unused in the manifest)
  marking every **unsolved** gate, so a crossing now visibly "looks
  blocked or incomplete" instead of just an empty, unmarked gap. Destroyed
  the instant that gate's real bridge is drawn — in `answer()`'s live-solve
  path and in `continueFromSave()`'s restore path alike — so a
  complete-looking bridge and the broken-stub markers can never both be
  on screen at once.

### Interactive object texture swap

`checkpoint_post_idle/active` and `function_machine_idle/active` —
production assets that had sat unused in the manifest since Phase 0 —
now replace the generic `kenney_sign`/`kenney_lever` placeholders.
Positions and interaction ranges are completely untouched (only the
texture + a centered origin/scale that keeps the previous footprint
intact changed); the machine's own scale-pop tween was updated to be
relative to its new base scale (`MACHINE_SCALE = .55`) rather than an
absolute `1`/`1.3`, so the "pop" is still a ~30% bump, not a jump to the
old absolute size. The goal's own `kenney_flag_a`/`b` animation is
untouched — a different concept (destination), not a checkpoint.

### `buildScenery()` — rewritten zone-by-zone

Every placement documents, in-code, exactly which ladder/machine/gap x it
stays clear of (re-derived from the live `DECKS`/`LADDERS`/`TERMINALS`
tables, not reused from history). Summary per zone is in
`asset-usage-and-composition.md`.

## Batches, as implemented (brief §10)

1. **Batch A (A, B, C)** — residential street (two different full houses,
   not a repeat), two linked shopfronts in B, one café facade in C.
   Screenshots captured, inspected, iterated (see below).
2. **Batch B (D, E)** — one compact workshop facade in D; E's three
   floating roof decks each given their own hung building facade plus a
   themed roofline accent (hut roof / laundry line — matching the deck's
   own name / water tank). This was visually re-checked and is the
   zone with the most before→after change (see `v8-5-before-after.png`).
3. **Batch C (F, G)** — hillside rock silhouette + cave mouth in F; river
   band + bank greenery in G.

**A real correction was made mid-implementation, not just at the end**:
the first pass of `buildGateStubs()` used small, barely-visible plank
stubs (confirmed too subtle via screenshot review — see
`v8-5-before-after.png`'s "Workshop gate (locked)" pair for the final,
corrected version). Re-scaled and re-angled, re-captured, and re-verified
before moving on — exactly the "inspect → change → capture → compare →
correct" loop the brief required, not a single uninspected pass.

## Geometry lock — verified unchanged

`WORLD`, `GROUND_RANGES`, `DECKS`, `LADDERS`, `GATES`, `TERMINALS`,
`CHECKPOINTS`, `SPAWN`, `GOAL`, `COLLECTIBLES`, `SECRETS`, `MOTION`,
camera bounds/follow behavior, and every math puzzle/formula are
byte-for-byte unchanged in `src/level.js`/the relevant `game.js` methods —
confirmed by diff review and by the full regression suite passing
unmodified (see `regression-results.md`). Every new decorative call is a
`this.add.image`/`this.add.graphics` call with no `physics.add.existing`
anywhere — zero new physics bodies.

## Files changed

- `src/game.js` — `deck()` (pillar rendering delegated to the new
  helpers), checkpoint/machine creation and every texture-swap site,
  `buildScenery()` (fully rewritten), five new decorative helper methods,
  `buildGateStubs()` + its two cleanup call sites.
- `src/level.js`, `src/save.js`, `src/audio.js`, `index.html`, `style.css`
  — **untouched**.

## Not committed / not deployed

Per the brief, no commit or deploy was made; `git clean`/`git reset` were
never run. `app/addmath/rooftop/` remains entirely untracked (confirmed
again at the end of this phase).
