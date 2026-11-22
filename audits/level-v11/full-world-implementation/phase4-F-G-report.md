# V11 Phase 4 — F/G and Level 1 completion

Implemented all 16 rooms in the existing continuous 8400×1600 world. BUILD_STAGE=4 and BATCH_END=8400. Main route A→B→D→E→F→G ends at the actual door, x8316 / feet972. No Phase 5, multiplayer, leaderboard, other level, commit, push or deployment.

Baseline and backup: `backups/before-phase4/`, `backups/pre-phase4-git-status.txt`. R01–R12 and the corrected Zone E inlet/riser geometry are retained. Earlier working files were already untracked/dirty; unrelated work was preserved.

R13 has two 54px rises to a small wooded ridge, then descending terraces, an optional branch and river overlook checkpoint. R14 is a shallow sheltered passage, 432px wide and 216px below its timber roof, with two permanently usable ladders. It is deliberately an open alcove, not a fabricated cave arch or black rectangle. Its optional inverse puzzle unlocks a real collectible.

R15 has a 324px river gap, separate decorative water, h(x)=4x−3 target17, and the blueprint's exact composition input2→5→13. Both latches persist. Success feedback closes the panel, moves the lever and bridge, and only then creates collision at y972. Total normal transition is about 1.89s (450ms feedback + 680ms lever + 760ms bridge); reduced motion skips the visual travel. Mid-animation reload restores the safe end state.

R16 uses existing door/flag frames on a raised shelf. Interaction completes once, freezes elapsed time, saves completion and shows actual collection/discovery totals, practiced concepts, replay and menu. No fake next level.

Runtime defects caught and repaired during continuation: missing SURFACES import prevented startup; river-final was missing from the composition dispatcher allowlist; F/G Hint controls were hidden; river selection and pressed token disagreed; completion copy still described Phase 1. Source-level tests alone did not detect these runtime failures.

## Evidence

- Node suites `v11_math.test.mjs`, `v11_phase3.test.mjs`, `v11_phase4.test.mjs`: 12/12 passed.
- `phase4_natural_input.py`: PASS; 88.86s for the entire automated desktop/mobile session, not a human completion estimate. Keyboard movement from fresh A through every main zone, C visit/return, F entry/inverse/reward/exit, wrong/correct finale, bridge movement/crossing, actual door, completed Continue, timer freeze and reward non-duplication.
- `phase4_state_checks.py`: 6 focused browser scenarios passed. Explicit save fixtures are used for these isolated scenarios; they are not represented as a fresh full traversal.
- Narrow Chromium viewport 390×844: real emulated touch movement, jump, interaction, final puzzle and reduced-motion bridge. Desktop 1440×900.
- Full route reports zero page errors, console errors and failed requests. V10 save sentinel unchanged.
- Actual browser captures and `screenshots/phase4/phase4-A-G-contact-sheet.png` provide A–G evidence.

See `remaining-issues.md` for the limits of this verification. No physical-device or human enjoyment claim is made.
