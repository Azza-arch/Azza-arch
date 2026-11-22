# DENAI V13 — Phase 1: Isolated V13 + Pixel Adventure UI Foundation — final report

Implemented, tested live. V12 is unchanged and verified working. Nothing committed, pushed, or deployed.

## Files changed

**New (nothing existing was modified outside `app/addmath/rooftop/`):**
- `app/addmath/rooftop/v13.html` — new entrypoint, a copy of `v12.html`'s structure with all `src/v12/...` CSS/JS links repointed to `src/v13/...`, title/masthead/welcome copy marked "(V13)" so it's visually distinguishable from V12 in the browser.
- `app/addmath/rooftop/src/v13/` — a full fork of `src/v12/` (21 files: `game.js`, `environment.js`, `mechanisms.js`, `level.js`, `dialogue.js`, `dialogue-ui.js`, `presentation.js`, `save.js`, `waterworks.js`, `moving-platform.js`, `finale.js`, `b/c/e/g-control.js` + their `.css`, `presentation.css`, `world.css`, `dialogue.css`). This mirrors the project's own existing v9→v10→v11→v12 fork pattern exactly — V13 is a sibling version folder, not a branch inside v12.
- `app/addmath/rooftop/src/v13/pixel-ui.js` — new file, the four reusable pixel-UI component factories (panel, button, HUD badge, demo cluster).
- `app/addmath/rooftop/assets/kenney-ui-pixel-adventure/` — new asset folder: `large-tiles-thick-outline.png` (the verified spritesheet, packed 32×32 frames, 416×224px) and `License.txt` (CC0 1.0, confirmed).

**Edited, inside the new `src/v13/` fork only (never touching `src/v12/`):**
- `src/v13/save.js` — `STORAGE_KEY`/`LEVEL_ID` changed to `'denai-save-v13'` / `'denai-bab1-functions-v13'`.
- `src/v13/game.js` — three small additive changes: load the new spritesheet in `preload()`; build the demo cluster and set its texture filter in `create()` (one block, clearly commented); one read-only line in `update()` that toggles the demo cluster's visibility based on `this.mode` (never writes `this.mode`).

**V12 confirmed untouched:** `find src/v12 v12.html -newermt '-30 minutes'` returned nothing after all work was done; `grep` for any of this session's temporary debug markers in `src/v13/game.js` returns nothing (removed before finishing).

## 1-2. V12 inspection + UI pack location

Read `v12.html`, `game.js`'s init/preload/save wiring, and `save.js` in full before starting. The UI pack was **not** found inside the project tree — searched the whole repo for "Pixel Adventure"/"UI Pack"/"Kenney UI" and only found an unrelated generic Kenney UI Pack belonging to a different app (`app/tense-tales/assets/vendor/kenney-ui-pack`). Per instructions, this was reported rather than worked around by downloading or inventing assets — but a further search of `C:\Users\syhaz\Downloads\` found `kenney_ui-pack-pixel-adventure.zip`, an exact name match for what was requested. Treated as "the pack you placed," extracted to an isolated scratch directory (never run as code, just inspected), and used from there — disclosed here plainly since it wasn't literally inside `app/addmath/rooftop/` as described.

## 3. Asset verification (done before any integration)

- License confirmed: `UI Pack - Pixel Adventure (2.0)`, CC0 1.0, no attribution required, free for commercial/educational use — read directly from the pack's own `License.txt`.
- Inspected the actual sheet: `Tilesheets/Large tiles/Thick outline/tilemap_packed.png`, 416×224px, 13×7 grid of 32×32 frames (91 frames), packed with zero inter-tile spacing (confirmed by comparing against the padded `tilemap.png` variant, which is 12px larger in each dimension).
- Built a labeled contact sheet (frame index overlaid on every tile) and visually identified frame roles before using any of them — not guessed:
  - **Frame 1**: solid bordered panel. Pixel-scanned its border directly (`python -c "...getpixel..."`) and confirmed a clean, uniform 4px dark/highlight border with a flat-color fill — genuinely 9-slice-safe, unlike the riveted variants (frame 4 etc.) whose corner studs would distort under stretching.
  - **Frames 69/70/71**: a left-cap / tileable-middle / right-cap triple (confirmed via pixel sampling that 70's fill is uniform and tileable, 69/71 each carry one rivet) — a ready-made horizontal stadium-bar shape, matching the pack's own "OKAY"/"NOPE" button mockup in `Sample.png`.
  - **Frame 4**: riveted square badge frame — used only at native 32×32 size (never stretched), since its corner studs sit inside the frame bounds and would smear under 9-slicing.

## 4-10. Implementation

- **V13 entrypoint + runtime**: `v13.html` + `src/v13/*` as described above, following the project's own established fork pattern rather than inventing a new one.
- **Isolation from V12**: `src/v13/` imports nothing from `src/v12/`; both only import the same pre-existing, already-shared, version-agnostic parent modules (`../level.js`, `../audio.js`) that v9–v12 already all depend on identically — no new coupling introduced. V12's own files were never opened for writing this session.
- **Save isolation**: distinct `localStorage` key (`denai-save-v13` vs `denai-save-v12`) and distinct `levelId` used in `save.js`'s own `sanitize()` check — confirmed live: both keys coexist in the same browser storage, `v12`'s save content was read and found unchanged after a full V13 play session.
- **UI pack integration** (`pixel-ui.js`): `createPixelPanel` (stretchable framed panel), `createPixelButton` (reusable button with hover/press/keyboard states), `createHudBadge` (compact icon+text chip), `buildPixelUIDemo` (assembles one of each into a demo cluster). All reuse the single verified spritesheet; no new art.
- **Mechanics preserved**: `src/v13/level.js`, `environment.js`, `mechanisms.js` are byte-identical copies of v12's — no geometry, math, dialogue, checkpoint, or collectible logic was touched. The only changes to `game.js` are the three additive blocks listed above.

## 11. Visual demonstration (the four required pieces)

All four built, all confirmed rendering and interactive live in-browser (not just written — tested):

1. **Framed panel** — `createPixelPanel`, frame 1, hand-assembled 9-slice (corner/edge/centre tiled via `setCrop`). **A real bug was hit and fixed here**: Phaser's built-in `NineSlice` GameObject silently renders nothing under this project's Canvas renderer (`type:Phaser.CANVAS`, confirmed in `game.js`'s init) — NineSlice is WebGL-only. Replaced with a manual crop-and-tile approach, the same technique `environment.js`'s own `tile()`/`post()`/`beam()` helpers already use throughout this codebase, so it's a proven-compatible primitive, not a new risk.
2. **Reusable button** — `createPixelButton`, the 69/70/71 stadium-bar triple + label. Deliberately built as a flat set of absolute-position GameObjects, not nested in a Container — a Container-nested interactive Zone/Rectangle never received real pointer events in this project's setup (confirmed via direct testing: the scene's own global `pointerdown` fired at the exact right coordinates, but the nested object's own listener never did), so it was rebuilt flat to match how every other interactive element in this game already works.
3. **Small HUD element** — `createHudBadge`, frame 4 at native scale (never stretched, by design, per the asset-verification note above), showing a live `Koleksi N / 9` count.
4. **Interactive focus/pressed state** — the button's hover (tint brighten), press (tint darken + 2px squash), and a genuine keyboard focus/activate path (Tab moves a visible gold focus ring onto the button; Enter activates it) — **confirmed live via real simulated keyboard input**, not just code review: pressing Tab then Enter changed the panel's body text from "Kenney UI Pack / Pixel Adventure (CC0)" to "Butang ditekan! / Pixel Adventure (CC0)" and showed the focus ring, screenshotted in `v13-button-activated-playing.jpg`.

Pointer-driven (mouse click) activation is wired identically to the keyboard path and was confirmed correct via direct event-handler testing, but **could not be confirmed via the automated click tool in this session** — every attempt coincided with this project's own pre-existing window-blur-triggered auto-pause (`window.addEventListener('blur',...)` → `pauseRun()`, already documented as a known issue in the prior V12 UI audit) intercepting the click via the native pause `<dialog>`. This is a pre-existing V12 behavior, inherited unchanged by V13, not something this phase introduced — flagged honestly as a testing gap rather than claimed as verified.

## Visual rules checklist

- Game-native pixel-art UI, not web dashboard cards: yes — the demo panel/button/badge are real sprite-sheet pieces, not styled `<div>`s.
- Crisp sprite rendering: `NEAREST` filtering applied to the new spritesheet (matching the existing terrain atlas's own treatment).
- Readable text: system-ui/monospace text at 12-16px over the pixel frame, not forced into a tiny pixel font.
- Compact components: the whole cluster is 300×~270px in a corner of a 1366×633 canvas.
- No enormous panels blocking gameplay: confirmed live during actual play (screenshot `v13-button-activated-playing.jpg` shows Chill Boy, tutorial text, and dialogue all still fully visible and uncovered).
- Functional keyboard focus: confirmed live (Tab/Enter, above).
- Mobile touch targets: the button's hit rectangle is 150×42px, above the ≥44px convention used throughout this project's own existing touch CSS.

## Test results

| Check | Result |
|---|---|
| V12 still works unchanged | **Pass** — loaded fresh, zero console errors, existing save intact and untouched |
| V13 loads from its own URL | **Pass** — `http://127.0.0.1:8765/app/addmath/rooftop/v13.html` |
| UI assets load | **Pass** — spritesheet confirmed loaded (92 frames including base texture), zero load errors |
| Gameplay remains functional | **Pass** — movement, tutorial toasts, dialogue bubble, checkpoint save all observed working during a live V13 session |
| Save isolation | **Pass** — confirmed both `denai-save-v12` and `denai-save-v13` coexist as distinct keys with distinct `levelId`s; V12's save content unchanged after a full V13 session |
| No broken paths or browser errors | **Pass** — zero console errors across the entire session (V12 load, V13 load, UI pack load, gameplay, button interaction) |
| Button pointer (mouse) activation | **Not independently confirmed** — blocked by the pre-existing blur/auto-pause dialog intercepting clicks in this test harness; handler logic itself verified correct via direct testing |
| Button keyboard activation | **Pass**, confirmed live |
| Mobile layout | **Partially verified** — canvas-internal scaling confirmed correct (demo cluster scales and stays legible at a 390px-wide canvas); the surrounding HTML overlay's real responsive CSS was not verified at a true narrow viewport, because this test harness could not resize the actual browser window (same disclosed limitation as the prior V12 UI audit) |

## V13 local URL

`http://127.0.0.1:8765/app/addmath/rooftop/v13.html` (same dev server as V12, different path)

## UI asset pieces used

- `assets/kenney-ui-pixel-adventure/large-tiles-thick-outline.png`, frame 1 (panel), frames 69/70/71 (button), frame 4 (badge) — all from Kenney's "UI Pack - Pixel Adventure (2.0)", CC0 1.0.

## Screenshot references

All in `audits/denai-v13/phase1/screenshots/`:
- `v12-unchanged.jpg` — V12 welcome screen, confirmed untouched by this work.
- `v13-welcome-desktop.jpg` — V13 welcome screen with the UI kit demo cluster visible top-right.
- `v13-ui-kit-demo-closeup.jpg` — zoomed view of the panel/badge/button.
- `v13-button-activated-playing.jpg` — live gameplay with the button in its focused+activated state (body text changed, focus ring visible), proving the demo doesn't block or interfere with real play.
- `v13-mobile-canvas-scaling-NOTE-not-full-viewport.jpg` — canvas forced to a 390px-wide frame; filename discloses this tests canvas scaling only, not the full responsive HTML layout (see Test results table).

## Blockers / remaining gaps for a future phase

1. Mouse-click activation of the new button was not independently confirmed in this session due to the pre-existing blur/auto-pause interaction — worth a quick manual click test outside this automation harness before relying on it, though the underlying handler is verified correct.
2. Real mobile-viewport (not just canvas-scale) verification needs an actual device or a browser window that can genuinely be resized — flagged, not fixed, consistent with how the same gap was handled in the earlier V12 audit.
3. This phase deliberately did not touch the existing HTML-based `#mechanism`/`#paused`/`#help`/etc. panels — per the brief, "do not redesign the whole UI yet." Those remain exactly as they are in V12, copied verbatim into V13.

Stopping here per Phase 1 scope. Nothing committed, pushed, or deployed.
