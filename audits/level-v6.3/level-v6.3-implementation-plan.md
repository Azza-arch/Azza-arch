# Lorong Atas Bumbung — V6.3 Phased Implementation Plan

**Status: design-only. This plan describes a future implementation; no step below has been executed.**

---

## Phase 1 — Background layering

Add Layer 1 sprites (`bg_house_row`, `bg_hills`, `bg_mosque` ×1) at scroll factors <1, modeled directly on the existing `kenney_bg_clouds` call pattern (`this.art(key,x,y,scale,depth,alpha).setScrollFactor(sx,sy)`). Zero new Phaser body types, zero collision, zero gameplay-coordinate changes. Lowest risk phase — can be done, reviewed, and reverted independently of every later phase.

**Verification:** visual-only (screenshot diff against `audits/level-v6.2/screenshots/`); `node --test` and `tests/probe.py` should be unaffected and are re-run anyway as a safety check (no logic path touches background art).

## Phase 2 — Foreground collision readability

If Option A (art direction §0) is approved: swap `kenney_deck_*`/`kenney_block_center` for `production/Ground` and `production/Traversal`'s `platform_wood_*`/`platform_post` in `deck()`. This changes **only** which texture keys `deck()` draws — the function's output geometry (same `data.x`/`data.width`/`data.y` loop) and the separately-created physics body in `platform()` are untouched. No `DECKS` coordinate changes.

**Verification:** `node --test` must still pass unchanged (it tests `DECKS`/`LADDERS` coordinates, never texture keys); `tests/probe.py`'s full traversal must still pass unchanged (collision shapes identical, only the drawn texture differs).

## Phase 3 — Landmark composition

Add Layer 2 midground sprites (houses, `h3_roof_hut`, `h1_roof_porch`, workshop parts, Zone E roof-mass) per `level-v6.3-zone-composition.md`, at a scroll factor between background and 1:1. All are plain `this.add.image(...)` calls with no physics body — same primitive already used for the cave-entrance `kenney_block_blue` markers, so this phase introduces no new Phaser API usage.

**Verification:** visual-only + explicit z-order check (every midground sprite's depth must sit below Layer 3's depth values, confirmed by reading the `depth` arguments passed, not by eyeballing); confirm no midground sprite's bounding box overlaps a jump arc from `level-v6.2-jump-validation.csv` (manual check against the coordinates in `level-v6.3-zone-composition.md`'s "visual risks" columns).

## Phase 4 — Interactive-object clarity

If Option A is approved: swap `kenney_lever`/`kenney_lever_left` → `function_machine_idle`/`function_machine_active`, and `kenney_sign`/`kenney_flag_a` → `checkpoint_post_idle`/`checkpoint_post_active`, in the two `TERMINALS.forEach`/`CHECKPOINTS.forEach` loops and the matching `setTexture(...)` calls in `answer()`/the checkpoint-reached branch of `update()`. Positions (`t.x`, `t.feet`, `cp.x`, `cp.feet`) are untouched — texture keys only.

**Verification:** `tests/probe.py`'s existing puzzle-solve assertions (`solvedGates.has(...)`) and checkpoint assertions (`checkpointIndex`) depend on state, not texture — must still pass unchanged. Add one visual check: screenshot each terminal/checkpoint before and after the swap, confirm the idle→active transition still fires on the correct trigger (same code path, different texture key).

## Phase 5 — Camera adjustments, only if necessary

Per `level-v6.3-camera-options.md`'s recommendation, **Alternative A requires no camera change** — this phase is expected to be skipped entirely. It is listed here, last, only in case a future decision (separate from this pass) chooses Alternative B; if so, it would require re-deriving `bounds.top` from a new viewport height, re-verifying every platform's visibility per `level-v6.2-jump-validation.csv`, and re-testing the camera A/B methodology V6.1 already established (`level-v6.1-implementation-report.md` Step 4) before shipping.

## Phase 6 — Cross-resolution QA

Re-run `tests/probe.py`'s existing desktop (1440×1000) and mobile (390×844, plus 844×390 landscape) viewport checks after every phase above, plus a manual check at a short-wide desktop window (the specific case `game.js`'s own `fitFrame()` comments say the layout was built to protect) to confirm no new background/midground sprite causes horizontal scroll or layout overflow (`document.documentElement.scrollWidth<=clientWidth` — already an existing assertion in `tests/probe.py`, reusable as-is for this purpose).

## Dependency summary

| Phase | Depends on | Blocks |
|---|---|---|
| 1. Background | Art direction Option A/B decision (asset choice only, not gameplay) | None |
| 2. Foreground terrain texture | Option A approval specifically (Option B needs no Phase 2) | None |
| 3. Landmark composition | Phase 1 (shares scroll-factor/z-order conventions) | None |
| 4. Interactive objects | Option A approval specifically | None |
| 5. Camera | A separate, explicit decision (not assumed) | Nothing in this plan — Alternative A path skips it |
| 6. QA | All prior phases completed | Sign-off |

Phases 1, 3, and 6 require no asset-family decision at all and can proceed under either Option A or B. Phases 2 and 4 are gated on the art-direction decision in `level-v6.3-approval.md`.
