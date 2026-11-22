# Lorong Atas Bumbung

One standalone Phaser **3.90.0** / JavaScript level at `/app/addmath/rooftop/`.
Open through an HTTP server, not `file://`. No build, npm install, backend,
Unity project, account, or CDN connection is needed to play. Phaser is vendored
with its MIT license. From the website root:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Visit http://127.0.0.1:8765/app/addmath/rooftop/ . The existing Add Math home
also has a secondary link; its MULA button, hash routes, lessons, practice data
and learner storage remain unchanged. This prototype has no persistent saves.

## Play

- A/D or left/right: run. Space: jump (110 ms coyote time, 130 ms jump buffer).
- W/S or up/down: climb when aligned with a ladder. Space exits a ladder.
- E: use the function machine when nearby. Enter submits the answer form.
- Esc: pause/resume, or close the machine. R: return to the current checkpoint.
- Coarse-pointer devices receive directional, ladder, jump and interact buttons.
- Falling returns to the start or checkpoint, with no lives/penalty. A solved
  bridge survives checkpoint returns. Restart/replay clears the whole run.

Follow the street to the first ladder, climb two decks, jump the 128 px gap,
pass the checkpoint and use the machine. Solve `f(x) = 2x + 1`, output `7`,
then cross the new bridge and climb to the rooftop hut marked DESTINASI.
Incorrect, empty and malformed answers cannot create the bridge. An optional
hint appears after two incorrect numeric answers. Menus pause physics.

## Source inventory and decisions

Inspected all seven distinct user-supplied ZIPs (the repeated `(1)` path was
deduplicated), 414 PNG entries including @4x copies and reference images.
`tests/artifacts/source-inventory.json` records dimensions, alpha extrema,
alpha bounds, archive timestamps and hashes. `asset-review.jpg` compares sets.

| Source | Findings / use |
| --- | --- |
| `Untitled (6).zip` | Latest supplied production export (2026-11-09): smooth grayscale houses, 64×64 ground/traversal tiles, tank, props and function machine. Primary foreground source. |
| `Untitled (1).zip` | Older sketch/hatching artwork and @4x duplicates. Foreground excluded. Five background-only PNGs retained in a distinct `background-legacy/` folder, subdued as distant scenery. |
| `Untitled (2).zip` | FINAL composition reference plus explicitly SUPERSEDED blockout. References only; never flattened into gameplay. |
| `Untitled (3).zip` | Asset consistency review board, not individual gameplay assets. |
| `Untitled (4).zip` | Additional doors/windows/fences; not needed for this level. |
| `Untitled (5).zip` | Older ground variants and terrace pieces; v6 ground takes precedence. |
| `6b468… (1).zip` | Chill Boy source PNGs, no controller. 12 idle, 10 run, one jump and one fall frame reused. No climb animation provided. |

PNG dimensions include transparent margins: production house 1 is 448×381
(visible bounds 24,6–356,379), ground is 64×64, tank 128×198, machine 169×186.
Chill Boy frames are 659×626 with much smaller visible bounds. The visual
origin follows his feet; a separate 28×60 physics body prevents animation
padding from changing collision behavior. No outline-generated colliders.

No separate pergola was present in the supplied individual exports. The
existing `h3_roof_hut` and railing form the recognizable final destination.
Climbing holds the existing idle pose; no substitute animation was drawn.
Foreground PNGs are copied byte-for-byte. Canvas grayscale presentation keeps
Chill Boy within the monochrome environment without modifying source artwork.

64 reusable PNGs are listed in `assets/manifest.json`. `assets/provenance.json`
maps each file to its original archive entry, dimensions, visible bounds and
SHA-256. `tools/import_assets.py` reproduces the selection from Downloads.
No runtime references to Downloads, missing filenames, or external art.
Chill Boy is by **Segel2D**; the supplied pack's original attribution is
preserved in `assets/chill-boy/SOURCE-README.txt`.

## Implementation

- `src/level.js`: manual world geometry, movement constants, puzzle evaluator.
- `src/game.js`: Phaser scene, one-way decks, solid street, ladder trigger zones,
  animation playback, bounded camera, checkpoints and DOM menu coordination.
- `index.html` / `style.css`: Malay UI, keyboard-focusable controls, native
  dialogs, live feedback and responsive touch controls. No lesson style leakage.
- World: 3072×1152. Desktop viewport: approximately 1152×648 (16:9).
  Portrait narrows the camera viewport without distorting sprites.
- 280 px/s run, 520 px/s jump, gravity 1400 px/s²: nominal 96.6 px rise,
  208 px same-height jump range. Required gap 128 px; puzzle gap 544 px.
- Decoration, background roofs and railings have no collision. The wooden
  deck surfaces are the intended walking route, supported by existing posts.
- Background tab / window blur pauses play and clears held input.
- `?test` exposes scene inspection for browser tests only; normal URLs do not.

## Checks

```powershell
node --test app/addmath/rooftop/tests/level.test.mjs
python app/addmath/rooftop/tests/probe.py
python app/addmath/rooftop/tests/probe.py --edges
```

Browser checks require Python Playwright and its Chromium browser installed,
and the HTTP server above running. The browser playthrough uses real keyboard
events to climb, jump, solve and finish; it does not teleport past the route.
Screenshots and results are stored under `tests/artifacts/`.

Verified in local headless Chromium: the complete keyboard route (no teleport),
both initial ladder exits, the rooftop jump, invalid and wrong input rejection,
fall recovery at the checkpoint, bridge collision, final climb/goal, replay,
Escape pause/resume and R recovery. Normal play produced zero JavaScript or
console errors and zero failed requests. Emulated touch checks covered movement,
jump, rotation, puzzle input and pause; a deliberately blocked PNG produced the
loading failure message. The Add Math home/MULA/Tingkatan 4 map regression passed.
Real-device touch testing and learner-duration testing remain manual follow-ups.
The focused edge checks also passed downward ladder exit, jumping off ladders,
multiple idle-animation frames and the touch-specific instruction text.

The level is intentionally short. A 3–5 minute first-time learning duration
needs human playtesting; automated route traversal does not validate that
target. There is no timer pressure, audio, extra levels or generated artwork.

API references: [Phaser 3 static bodies](https://docs.phaser.io/api-documentation/3.88.2/class/physics-arcade-staticbody),
[Phaser cameras](https://docs.phaser.io/phaser/concepts/cameras).
