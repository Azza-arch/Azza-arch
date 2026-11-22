# V9.4 — Asset Recovery Report

## What happened

Five files under `app/addmath/rooftop/assets/background-legacy/`
(`bg_hills.png`, `bg_cloud.png`, `bg_house_row.png`, `bg_palm.png`,
`bg_mosque.png`) were missing from disk, while `assets/manifest.json` and
`src/game.js`'s `buildScenery()` still actively referenced three of them
(`bg_house_row`, `bg_mosque`, `bg_hills`). The game's `preload()` loads
every manifest entry and calls `fail()` on the first `loaderror` — so a
single missing file anywhere in the manifest blocked the entire game from
starting (confirmed: before this fix, `#welcome` never appeared, and the
console showed repeated 404s).

**Per the user's explicit clarification, these five files were
intentionally deleted — rejected visual assets.** They were not restored,
not searched for in any backup/Recycle Bin, and not regenerated.

## What was fixed

1. **`src/game.js`** — removed the three `bg('bg_house_row', ...)` /
   `bg('bg_mosque', ...)` / `bg('bg_hills', ...)` calls in
   `buildScenery()`, and the now-unused `bg()` helper closure. Replaced
   with an in-code comment explaining the removal and that the
   background role is deferred to the camera's own solid background
   color plus the still-present Kenney cloud layer, until an approved
   Kenney Pixel Platformer background tile is available (see
   `tile-grid-spec.md`).
2. **`assets/manifest.json`** — removed all 5 `bg_*` entries (including
   `bg_cloud`/`bg_palm`, which were already unused in code but still
   manifest-listed, so still capable of blocking `preload()`).
3. **`assets/provenance.json`** — removed the matching 5 entries, so the
   project's own asset-integrity unit test no longer expects files that
   no longer exist.
4. **`tests/level.test.mjs`** — updated the hardcoded manifest-size
   assertion (90 → 85) to match the new, smaller manifest, with a comment
   explaining why.

## Verification

- `node --test`: 11/11 pass (was 10/11 immediately after the files went
  missing — the asset-integrity test caught the exact defect).
- `tests/probe.py` (full natural-input A→G traversal): clean pass,
  `errors: []`, including the missing-asset-handling check (confirms
  the game still fails gracefully and visibly for a GENUINELY missing
  required asset, per the brief's "preserve gameplay error handling for
  genuinely missing required assets").
- `tests/v8_phase6_persistence.py`, `tests/v8_phase7_secrets.py`,
  `tests/v8_phase8_menu.py`, `tests/v8_7_level_exit.py`,
  `tests/v9_phase1_crate.py`: all pass clean.
- Direct browser load check: `#welcome` appears, zero console/page
  errors, screenshot captured
  (`before-after-screenshots/post-recovery-zone-a.png`).

## Files modified

- `app/addmath/rooftop/src/game.js`
- `app/addmath/rooftop/assets/manifest.json`
- `app/addmath/rooftop/assets/provenance.json`
- `app/addmath/rooftop/tests/level.test.mjs`

## Backup

A full pre-change copy of `src/`, `index.html`, `style.css`, `DESIGN.md`
was taken before any edit this release pass, at
`audits/level-v9/release-candidate/backup-before/` (from the prior V9
Release Candidate turn, before the missing-asset issue was discovered).
