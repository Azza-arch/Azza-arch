# Phase 0 baseline snapshot

Date: 2026-11-12 (Asia/Kuala_Lumpur)

## Preservation

- Pre-Phase-0 archive: `snapshots/before-phase0.zip`.
- Pre-Phase-0 source hashes: `baseline-hashes.json`.
- Pre-Phase-0 worktree inventory: `logs/git-status-before.txt`.
- The archive and hash inventory predate the V11 Phase 1 implementation. V9 and V10 remain separate fallbacks; no V9/V10 source or save key was edited by this batch.
- V11 runs from `v11.html` and `src/v11/`; its world data and save key are independent from V10.

## Engineering baseline read

The working baseline is Phaser 3.90 with Arcade Physics. Movement comes from the existing game: horizontal speed 280 px/s, acceleration 2100, braking 2500, jump impulse 520, gravity 1400, climb speed 150, body 28×60 px. Existing animation art, audio, responsive camera, keyboard/touch controls, checkpoints and menu shell were retained for V11.

The Phase 1 bootstrap began before the usage limit and was incomplete: `game.js` imported a missing `mechanisms.js`, and several V11-specific handlers were absent. This batch completed those V11 modules without copying the work back into V10.

## Worktree note

The initial worktree already contained unrelated modified and untracked Add Math, Tense Tales and demo files. They were present before this batch and were left untouched. The full initial list is preserved in `logs/git-status-before.txt`.
