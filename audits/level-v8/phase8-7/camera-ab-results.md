# V8.7 Phase C — Camera Zoom A/B Results

Real-browser measurement (`tests/v8_7_camera_ab.py`), three viewport
presets × three zoom levels, three gameplay moments each. Raw data in
`screenshots/camera-ab/metrics.json`; visual comparison in
`v8-7-camera-ab-comparison.png`.

## Measurements

| Viewport | Zoom | Player screen height (CSS px) | World px visible across canvas width |
|---|---|---|---|
| desktop (1440×900) | 1.0 | **102** | 1353 |
| desktop | 1.2 | 122 | 1128 |
| desktop | 1.3 | 132 | 1041 |
| short-wide-laptop (1366×660) | 1.0 | **68** | 1923 |
| short-wide-laptop | 1.2 | 81 | 1603 |
| short-wide-laptop | 1.3 | **88** | 1479 |
| mobile-landscape (844×390) | 1.0 | **49** | 1655 |
| mobile-landscape | 1.2 | 59 | 1379 |
| mobile-landscape | 1.3 | **64** | 1273 |

HUD bottom-offset was constant across every zoom level at a given
viewport (DOM-positioned, independent of camera zoom) — no HUD overlap
was introduced by any tested zoom.

## Why short-wide-laptop and mobile-landscape start so much smaller

The game's logical canvas height is fixed at 700px; `Phaser.Scale.FIT`
scales that uniformly to fit the actual CSS frame size. Desktop's frame is
already ≥700px tall in every viewport tested (no shrink). The other two
presets have frames well under 700px tall, so the whole render — including
an already-zoomed character — gets shrunk again by the CSS fit factor,
compounding the readability loss.

## Decision (implemented as `applyResponsiveZoom()` in `src/game.js`)

- **Desktop**: zoom **1.0**. Already comfortably readable; keeps maximum
  jump lookahead (1353 world px visible) and was not blindly zoomed just
  because the other categories needed it.
- **Short-wide-laptop & mobile-landscape**: zoom **1.3** — the only tested
  level that meaningfully closed the gap (68→88px, 49→64px). The smallest
  larger zoom (1.2) was considered but rejected: it closed less of the gap
  for a similar lookahead cost, so 1.3 was the better trade on the
  measured data, not an arbitrary maximum pick.

Both chosen zooms still show MORE world width than desktop's own 1.0
baseline (1479/1273 vs. 1353) — no jump's lookahead distance was impaired
by this change on any tested viewport. Verified directly: a full
first-gap jump sequence at mobile-landscape's zoom 1.3 landed cleanly past
the gap with zero page errors (see `full-regression-results.md`).

## Implementation detail

`applyResponsiveZoom()` reads `.game-frame`'s live CSS height (the same
element the existing `ResizeObserver`-driven `fitFrame()`/`dimensions()`
logic already measures) and applies the rule above. It runs once at
`create()` and again inside the existing `ResizeObserver` callback, so
rotating a device or resizing a window re-evaluates it live — verified
via the responsive-zoom check in `full-regression-results.md`.

## Visual confirmation

`v8-7-camera-ab-comparison.png` shows all 9 combinations side by side at
the same gameplay moment (Machine 1's approach) — no platform clipping,
no viewport overflow, and no frame-rate issue was observed in any of the
captured screenshots at any zoom.
