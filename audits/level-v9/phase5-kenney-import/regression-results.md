# V9.5 — Regression Results

All suites run against the post-archive state (manifest 85→73 entries,
12 Phase-8.5 production files moved to
`audits/level-v9/rejected-art-archive/`). No gameplay/geometry/mechanic
code was changed this phase — only asset bookkeeping.

| Suite | Result |
|---|---|
| `node --test` (`tests/level.test.mjs`, 11 tests incl. asset-integrity) | 11/11 pass |
| `tests/probe.py` (full natural-input A→G traversal, desktop+mobile, missing-asset handling) | clean, `errors: []` |
| `tests/v8_phase6_persistence.py` | pass |
| `tests/v8_phase7_secrets.py` | pass |
| `tests/v8_phase8_menu.py` | pass |
| `tests/v8_7_level_exit.py` | pass |
| `tests/v9_phase1_crate.py` (crate push/switch/reset/auto-recovery/softlock-free/no-save-pollution) | pass |
| `tests/v9_5_zone_ab_capture.py` (new, this phase) | zone-a-before.png / zone-b-before.png captured clean, no console/page errors |
| `tests/v9_5_timing.py` (new, this phase) | mandatory-route traversal completed cleanly, no errors |

No console errors, page errors, or failed network requests were observed
in any run. The asset-integrity test (`all runtime assets are real
unchanged source PNGs`) is the specific regression guard that would catch
any future dangling manifest/provenance reference — it caught the exact
class of defect this archiving work was designed to avoid repeating (the
V9.4 missing-background-file incident).
