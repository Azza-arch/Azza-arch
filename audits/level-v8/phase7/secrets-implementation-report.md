# V8 Phase 7 — Easter Eggs, Secrets & Replayability

## Objective

Reward exploration with exactly three small optional discoveries, without
touching the mandatory A→G adventure, its puzzles, or the Phase 6 save
system's existing guarantees.

## The three secrets

| id | Title | Zone | Position (x, feet) | Interaction |
|---|---|---|---|---|
| `secret-oyen` | Si Oyen | B/C · Café Atas Angin | 680, 820 | direct 'E' press, no dialog |
| `secret-function-note` | Nota Fungsi Misteri | D · Bengkel Fungsi | 1615, 980 | 'E' opens a readable note dialog |
| `secret-cave-treasure` | Khazanah Gua | F · Bukit Tanjung & Gua | 3090, 880 | direct 'E' press, no dialog |

See `secret-placement-map.png` for a schematic of all three against the
live V7 geometry (zones, decks, gates, machines, checkpoints), generated
directly from `src/level.js`'s own exported tables — not hand-measured —
so it can't silently drift from the real level data.

## Placement rationale (brief §5)

- **Si Oyen**: `cafe-deck` spans x:650–1030. The B→C ladder lands the
  player at x:750; CP1 and its sign sit further right at x:950. Walking
  **left** instead, toward the deck's own dead end, is the one genuine
  detour this deck offers — the mandatory route never goes there.
- **Nota Fungsi Misteri**: `workshop-approach` (x:1600–1800, also
  `GROUND_RANGES`' own floor there) is the one deck past `workshop-gate`.
  Placed at its very left edge (x:1615), deliberately narrow-radius (40px)
  and well clear of x:1700 — reserved by `tests/probe.py`'s own
  "M2 unreachable from workshop-approach" bypass check, which resets the
  player to exactly that spot and presses 'E' expecting nothing to answer
  it (see Errors Found below).
- **Khazanah Gua**: inside the existing, already-optional `cave-alcove`
  deck (x:2970–3120, reached via the already-optional ladder at x:3000) —
  the far side of the *same* detour `coin-cave` already rewards, not a new
  area, new ladder, or new platforming challenge.

All three: reachable by existing physics only (no new jump distances, no
teleporting), never overlap a machine/ladder/checkpoint/gate's own
interaction zone, and add no gate bypass (`nearestSecret()` only ever sets
an optional on-screen prompt — it cannot open a gate or advance
`checkpointIndex`).

## What was built

### `src/level.js`
Added `export const SECRETS` — three entries with `id`, `zone`, `x`,
`feet`, `radius`, `title`, `foundText`, `description`, and (Secret B only)
`note: true` + `noteText`.

### `src/save.js`
Schema bumped `1 → 2` to add `discoveredSecretIds`. See `save-schema.md`
(updated) for the exact migration — a v1 save loads cleanly, defaults to
zero secrets found, and is transparently re-saved as v2 on the next write.
**No new storage key** — same `lorong-save-v1`.

### `src/game.js`
- `discoveredSecrets` (a `Set`) is loaded **unconditionally** in `create()`,
  before `buildEnvironment()` draws markers — unlike `solvedGates`/
  `collectedCoinIds`/`checkpointIndex`, which only populate when the player
  explicitly clicks Continue. This is the mechanism that keeps secrets
  permanent across Restart/Replay (see Replayability below).
- `buildSecrets()`: draws one marker per secret (see Assets below), with a
  gentle idle bob (skipped under `prefers-reduced-motion`, matching every
  other motion effect in this file) only while still undiscovered.
- `nearestSecret()`: same spatial-range pattern as the existing
  `nearestTerminal()`.
- `discoverSecret(id)`: awards exactly once (`discoveredSecrets.has()`
  guard), autosaves, reuses Phase 3's `pulseRing`/`sparkleBurst`/
  `floatingText` and Phase 4's `SFX.checkpoint`/`SFX.coin` — no new effect
  or audio system.
- `openSecretNote()` / `closeSecretNote()`: Secret B's note dialog, built
  on the exact same `showModal()`/keyboard-disable/physics-pause pattern
  the puzzle and pause dialogs already use. A new scene `mode` value,
  `'note'`, makes `update()` no-op exactly like `'puzzle'`/`'paused'`
  already do (its only check is `mode !== 'playing'`).
- `renderSecretsUI()`: the pause-menu collection list.
- `update()`: the interact ('E') handler now checks `nearestSecret()`
  alongside `nearestTerminal()`, with a generic "E · Teroka" prompt that
  never names which secret is nearby.
- The welcome-screen "Mula petualangan baharu" (Start New Adventure)
  handler now also resets `discoveredSecrets` in memory (see Errors Found).

### `index.html` / `style.css`
- New `#secret-note` dialog (reuses the existing generic `dialog{}` rule,
  `.small` text style — no new dialog chrome).
- New `.secrets-section` inside the existing `#paused` dialog: a heading
  with a live count and a `<ul id="secrets-list">` reusing the existing
  `.hint-list` styling verbatim.
- Two small CSS rules (`.secrets-section`, `.secrets-heading`,
  `.secrets-list li.locked`, `#secret-note-body` line-wrapping).

## Visual assets — what's real, what's a placeholder

- **Si Oyen**: **placeholder**. No cat/animal asset exists anywhere in
  `assets/manifest.json` (checked `assets/kenney`, `assets/production`,
  `assets/chill-boy`, `assets/background-legacy`). A small procedural
  silhouette is generated once via `Graphics` — the exact same technique
  `fx-dot` (V8 Phase 3) already established in this codebase, not a new
  mechanism — and documented inline in `game.js`'s `buildSecrets()` as a
  temporary stand-in pending real art.
- **Nota Fungsi Misteri**: real, existing asset. Reuses
  `assets/production/Puzzle/answer_sign.png` (`answer_sign` in the
  manifest), previously loaded but unused anywhere in the game.
- **Khazanah Gua**: real, existing asset, reused with a distinct tint.
  The existing `kenney_coin` texture, tinted gold-brown (`0xcf8a2b`) and
  drawn slightly larger than an ordinary collectible coin, so it reads as
  "a special find" rather than one more of the seven `COLLECTIBLES`.

## Errors found and fixed during this phase

1. **Secret B's original placement (x:1680, radius 75) collided with an
   existing regression test.** `tests/probe.py` resets the player to
   exactly x:1700 on the workshop-approach deck and presses 'E', asserting
   Machine 2 is *not* reachable from there. The note's interaction radius
   covered that exact spot, so the note dialog opened instead, failing the
   assertion. Fixed by moving the note to the deck's own left edge
   (x:1615) with a tighter radius (40px, well clear of x:1700) — caught
   immediately by the existing regression suite, not discovered after the
   fact.
2. **"Mula petualangan baharu" (Start New Adventure) didn't actually clear
   in-memory secrets.** `discoveredSecrets` is loaded unconditionally at
   `create()`-time (by design, so it's permanent), but the New Adventure
   handler only cleared the *storage* key — the already-created scene's
   in-memory `Set` still held old discoveries until a hard reload. Fixed
   by explicitly resetting `activeScene.discoveredSecrets` (and
   re-rendering the collection UI) inside that handler. Caught by the new
   `tests/v8_phase7_secrets.py` script, not shipped silently.

## Files changed

- `src/level.js` (new `SECRETS` export)
- `src/save.js` (schema v1→v2 migration, new field)
- `src/game.js` (secrets system, note dialog, collection UI, New Adventure
  fix)
- `index.html` (`#secret-note` dialog, pause-menu collection section)
- `style.css` (secrets-section/list styling)

## Not touched

World topology, movement physics, collision geometry, camera, mathematics
formulas/puzzles, audio synthesis internals (only existing `SFX.*` calls
reused, no new sounds authored) — confirmed unchanged by the full
regression suite.

## Not committed / not deployed

Per the brief, no commit or deploy was made. `app/addmath/rooftop/` remains
entirely untracked.
