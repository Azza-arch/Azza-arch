# V8 Phase 6 — Save Schema

## Storage key

`lorong-save-v1` (localStorage), defined and used only in `src/save.js`.
Deliberately separate from audio.js's own `lorong-audio-settings-v1` key —
audio preferences are not gameplay progress and must not share one blob.

## Shape (as written to storage)

```json
{
  "schemaVersion": 1,
  "levelId": "lorong-atas-bumbung-1",
  "checkpointId": "cp1-cafe",
  "solvedGateIds": ["workshop-gate"],
  "collectedCoinIds": ["coin-a", "coin-b"],
  "completed": false,
  "updatedAt": 1732300000000
}
```

## Field reference

| Field | Type | Meaning |
|---|---|---|
| `schemaVersion` | `number` | Always `1` currently. Any other value on load → save discarded wholesale (no migration path yet). |
| `levelId` | `string` | `"lorong-atas-bumbung-1"`. A mismatch (e.g. a save from a future/different level sharing the same storage origin) → discarded. |
| `checkpointId` | `string \| null` | One of `CHECKPOINTS[].id` from `src/level.js` (`cp1-cafe`, `cp2-rooftop-exit`, `cp3-bridge`), or `null` meaning "no checkpoint reached yet — spawn". Chosen over a numeric index per the brief's "prefer stable IDs" — a future level-geometry edit that reorders/removes a checkpoint can't silently point a saved index at the wrong one. |
| `solvedGateIds` | `string[]` | Subset of `GATES[].id` (`workshop-gate`, `rooftop-gate`, `final-gate`). Same id space `this.solvedGates` already uses at runtime — the save is a direct snapshot of that Set, not a parallel representation. |
| `collectedCoinIds` | `string[]` | Subset of `COLLECTIBLES[].id` (`coin-a`…`coin-g`). |
| `completed` | `boolean` | `true` once `finish()` has run for this save. Drives the welcome screen's "Main semula" (Replay) label/copy instead of "Sambung permainan" (Continue). |
| `updatedAt` | `number` | `Date.now()` at the moment of the write. Not currently read for any logic (no multi-save/slot comparison exists) — kept for diagnostic/future use, per the brief's suggested fields. |

## Why stable IDs, not array indices

Every id field cross-references the level's own current tables
(`GATES`/`CHECKPOINTS`/`COLLECTIBLES` in `src/level.js`) at load time. A
numeric index would silently break if a future level revision reorders or
removes an entry (e.g. inserting a new checkpoint between CP1 and CP2 would
shift every later index); a stable id instead simply fails validation and
is dropped if it no longer exists, never silently misapplied to the wrong
entity.

## Explicitly NOT persisted

Transient effects, animation tweens, audio nodes/AudioContext state, or
camera position/zoom — none of these are gameplay state, and persisting
any of them would either be meaningless after a reload (a tween has no
continuation) or actively wrong (replaying a stale camera position/zoom on
a resized viewport). Audio *preferences* (mute/volume) already persist
separately via `src/audio.js`'s own, pre-existing storage key — untouched
by this phase.

## Validation (in `src/save.js`'s `sanitize()`)

Every field is individually type-checked and, for id fields, filtered
against a `Set` built from the level's own current id tables — never
trusted as-is, never inserted into the DOM. Concretely:

- `raw` must be a non-null object (typeof check) — otherwise `null`.
- `schemaVersion !== 1` → `null` (unsupported version, discarded wholesale).
- `levelId !== "lorong-atas-bumbung-1"` → `null`.
- `checkpointId`: kept only if it's a member of the live `CHECKPOINTS` id
  set; otherwise coerced to `null` (treated as "no checkpoint").
- `solvedGateIds` / `collectedCoinIds`: must be arrays; every entry is
  filtered against the live `GATES`/`COLLECTIBLES` id sets and deduplicated
  via `Set`. A non-array value (e.g. `undefined` from an older/partial save,
  or a corrupted string) becomes `[]`, never thrown.
- `completed`: coerced with `=== true` — anything else (including a
  truthy-but-wrong-typed value like `"yes"`) becomes `false`.
- `updatedAt`: kept only if `Number.isFinite`; otherwise `0`.

This means an "impossible" combination — e.g. a `solvedGateIds` entry
naming a gate that doesn't exist, or a `checkpointId` for a removed
checkpoint — can never reach the scene; it is silently dropped at the
sanitize step, never causes a crash or an inconsistent restored state.

## Corrupted/unsupported input handling

- Missing key → `load()` returns `null` (no save).
- Invalid JSON (`JSON.parse` throws) → caught, `null`.
- `localStorage` itself throwing (blocked/disabled, private-mode edge
  cases) → caught at the outermost `try`, `null`.
- Any of the above → the welcome screen falls back to the plain "Mula
  meneroka" (Start) button, exactly as if no save had ever existed — never
  a broken/stuck menu.

## Writes

`SaveManager.save(snapshot)` always writes a **complete** object — the
scene's `writeSave()` method rebuilds the whole snapshot from its own live
state every time, never a partial merge onto the previous save. A failed
write (quota exceeded, storage blocked) is caught and simply returns
`false`; it never partially overwrites a previously valid save with
broken/truncated data, since `localStorage.setItem` is a single atomic
string write that either fully succeeds or throws.
