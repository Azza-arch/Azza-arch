# V8 Phase 7 — Collection & Persistence Tests

All tests run against the actual game in a real Chromium browser via
Playwright, using genuine `page.reload()` calls.

## 1. Unit tests — `node --test`

11/11 pass, 0 failures. Unaffected by Phase 7.

## 2. Full browser regression — `tests/probe.py`

Clean pass, `errors: []`, `consoleErrors: []`, `failedRequests: []`. Full
desktop A→G traversal, mobile touch run, missing-asset path, unrelated Add
Math shell — all still pass. This is also what caught the Secret B
placement conflict described in `secrets-implementation-report.md` (the
existing "M2 unreachable from workshop-approach" bypass check at x:1700).

## 3. All Phase 6 persistence tests — `tests/v8_phase6_persistence.py`

All 16 scenarios from Phase 6 re-run clean against the now-v2 schema,
including the schema-version-visible scenarios (#2's raw save now reads
`"schemaVersion":2` with a `"discoveredSecretIds":[]` field) — confirming
the v1→v2 migration didn't disturb any Phase 6 guarantee (Continue, New
Adventure confirmation, Restart/Replay confirmation, corrupted JSON,
unsupported version, blocked storage, no duplication across repeated
reload cycles).

## 4. Natural-input discovery tests, all three secrets — `tests/v8_phase7_secrets.py` (new)

| Scenario | Result |
|---|---|
| Main adventure completable with **zero** secrets found | `mode==='complete'` reached with `discoveredSecrets.size===0`. **Pass.** |
| Secret A (Si Oyen): direct 'E' interact | No dialog opens (`mode` stays `'playing'`); `discoveredSecrets.has('secret-oyen')===true`; status toast reads "Jumpa Si Oyen!". **Pass.** |
| Secret A: pressing 'E' again right after | `discoveredSecrets.size` stays `1` — no duplicate award. **Pass.** |
| Secret B (Nota Fungsi Misteri): 'E' opens a dialog | `mode==='note'`; dialog text read back and confirmed to **not** contain any mandatory answer (`"= 7."`, `"x = 4"`, `"x = 5"`); `discoveredSecrets` updated the moment the note opens; closing returns `mode==='playing'`. **Pass.** |
| Secret C (Khazanah Gua): direct 'E' interact | `discoveredSecrets.has('secret-cave-treasure')===true`. **Pass.** |
| Collection UI (pause menu) | `#secrets-count` reads "1/3"; the one found slot shows title + description; the two undiscovered slots both read only "Rahsia belum ditemui." — no title, no position, no hint revealed. **Pass.** |
| Reload after discovery | Discovering Si Oyen, then `page.reload()` + Continue: `discoveredSecrets.has('secret-oyen')` still `true`. **Pass.** |
| Reduced motion | `prefers-reduced-motion: reduce` emulated via `page.emulate_media`; discovery still registers (`discoveredSecrets.has===true`) — only the particle/bob tweens no-op internally, exactly like every other Phase 3 effect under this flag. **Pass.** |
| Muted audio | Mute toggled via the existing pause-menu control before discovering; discovery still registers — `SFX.*` calls already no-op silently when muted (pre-existing `AudioManager` behavior, unchanged). **Pass.** |
| No duplicate progress across repeated attempts | 5 consecutive 'E' presses on the same undiscovered secret: `discoveredSecrets.size` stays `1`; the persisted `discoveredSecretIds` array has exactly one entry, never more. **Pass.** |

## 5. Existing save migration/compatibility

A hand-crafted **v1** save (pre-Phase-7 shape: no `discoveredSecretIds`
field at all) was written directly to `localStorage`, then loaded through
the real menu flow:

- `#continue-btn` is shown (the v1 save is recognised, not discarded).
- Clicking Continue restores its `solvedGateIds`/`checkpointId` exactly as
  before — Phase 6 progress is fully intact.
- `discoveredSecrets.size === 0` — the missing field defaults safely to
  "nothing found yet", no crash, no exception.
- Discovering a new secret afterward writes a save with
  `schemaVersion: 2` and the new secret in `discoveredSecretIds` — the
  upgrade is transparent and happens on the very next autosave, with
  nothing about the player's prior checkpoint/gate/coin progress altered.

## 6. Browser console/network checks

No console errors or failed requests were logged across any of the above
runs (unit tests use Node's own test runner; both Playwright scripts
assert `errors: []`/watch `page.on('console')` where applicable — see
`probe.py`'s own output, unaffected by Phase 7).

## Cleanup

`tests/v8_phase7_secrets.py` is kept (diagnostic/evidence script, same
convention as every prior phase's capture/diagnostic scripts). The
temporary `tests/make_secret_map.py` helper used once to generate
`secret-placement-map.png` from `src/level.js`'s live data was deleted
after producing that deliverable — it had no further use.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).
