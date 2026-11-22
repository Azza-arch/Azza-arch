# Level Design Blueprint V5 — PROPOSAL ONLY, NOT IMPLEMENTED

This document proposes changes. **No source file has been modified to produce it.** Every coordinate below is a proposal, explicitly derived from the measured movement envelope in `level-v5-audit.md` §2 (max natural jump 217px, safe design margin ~40px below that → recommend proposed jump gaps stay ≤150px unless a ladder is used instead), not copied from any reference image.

## What this blueprint preserves (per the brief's own lock list)

- Seven zones (A–G), same names, same approximate x-order.
- Three required function puzzles, same formulas/answers (f(3)=7, 3x−2=10→x=4, 4x−3=17→x=5) — **values unchanged**.
- Three checkpoints — positions may move, count stays 3.
- Chill Boy, existing `MOTION` physics constants — **unchanged**.
- Approved Kenney New Platformer Pack only — **no new assets**.
- Solo gameplay, existing completion flow (`finish()`, `#complete` dialog) — **unchanged**.

## Proposed gameplay flow table

| Beat | Zone | Proposed Mechanic | Start X | End X | Height Variation | Purpose | Asset Requirements |
|---|---|---|---|---|---|---|---|
| 1 | A | Keep `FIRST_GAP` (120px, measured-safe) as-is | 0 | ~700 | 1000→1000 (one jump) | INTRODUCE | existing ground tiles |
| 2 | A | **NEW**: a single raised 2-tile step (no ladder — a jumpable 1-tile-high ledge, rise ~64px, within the measured ~92px jump rise) between the gap and Zone B, breaking up the current ~560px dead stretch | ~700 | 1100 | 1000→936 (step, no ladder) | PRACTICE (jump height, not just distance) | existing deck tiles, 1 short run |
| 3 | B | Keep lower route continuous. **MODIFY** upper route: raise `town-upper-2` to y=700 instead of y=824 (a ladder-reachable rise, not a same-tier jump), so Zone B's upper route ends with a climb instead of a flat landing — differentiates it from Zone E's pair | 1300 | 1900 | 1000→824→700 | PRACTICE (ladder + jump combined, once) | existing deck/ladder tiles |
| 4 | C | **NEW**: give the café a single small geometric distinguishing feature — e.g. a short raised platform (one tile, ~64px) directly at the checkpoint, so standing at CP1 is visually a half-step above the street, not flush with it. Keep "no fake building." | 2700 | 2950 | 1000→936 | REST / landmark | existing deck tile ×1 |
| 5 | D | **MODIFY**: shrink the current 870px dead approach to ~400px by moving `p1-terminal`/`workshop-gate` closer to Zone C (proposed: machine at x≈3300, gate at x≈3400-3850), and fill the remaining distance with 1-2 short rises (same technique as beat 2) instead of flat ground | 2950 | 3850 | varied, 1-2 short steps | reduce dead time, add CHALLENGE texture before the puzzle | existing deck tiles |
| 6 | D→E | Keep gate mechanic exactly as-is (verified correct) | 3850 | 4300 | — | MATH PUZZLE / REWARD | unchanged |
| 7 | E | **MODIFY**: keep `roof-e1` at y=824, but raise `roof-e2` to y=650 (ladder-reachable, not jump-reachable) — this makes Zone E's upper route end HIGHER than Zone B's (differentiation), and is the natural place for the "one moving-platform candidate" this brief's §12 suggests, IF a moving-platform system is built later (not required now — a static ladder-reachable `roof-e2` at y=650 is the safe fallback proposal that needs zero new engine code) | 4750 | 5650 | 1000→824→650 | VARIATION (now genuinely different from Zone B) | existing deck/ladder tiles |
| 8 | E | Keep `p2-terminal`/`rooftop-gate` position (verified correctly placed relative to the upper route) | 5570 | 6150 | — | MATH PUZZLE / REWARD | unchanged |
| 9 | F | Keep cave detour exactly as-is (already the best-executed optional content in the level) | 6150 | 6550 | — | EXPLORATION | unchanged |
| 10 | F | Keep the plateau climb and CP3 | 6700 | 6800 | — | CHALLENGE (mild) | unchanged |
| 11 | G | Keep `p3-terminal`/`final-gate`/`GOAL` exactly as-is (correctly climactic, no filler after) | 6800 | 7400 | — | FINAL CHALLENGE / COMPLETION | unchanged |

## Required geometry decisions (explicit)

- **Keep as-is:** `FIRST_GAP`, all three gates, all three terminals (x-positions), the cave detour (`gua-alcove` + its ladder + coins), the hill-plateau climb, CP1 and CP3 positions, `GOAL`.
- **Modify (reposition/resize), not remove:** `town-upper-2` (raise to y=700), `roof-e2` (raise to y=650), `p1-terminal`/`workshop-gate` (shift ~450-550px earlier to shorten Zone D's approach).
- **New, small additions (not full rebuild):** one short step in Zone A's dead stretch, one short step/short rise sequence filling Zone D's shortened approach, one small raised feature at CP1.
- **Nothing proposed to REMOVE** — every current piece of geometry was already verdicted KEEP or MODIFY in the audit; none were found purposeless.
- **Ladders to remove:** none.
- **Checkpoints to reconsider:** none — CP1/CP2/CP3 positions already verified to match the planning map's intent (§4 of the audit); only the geometry *around* them changes in this proposal, not their trigger coordinates (except where a zone's geometry shift moves the natural "safe ground" under a checkpoint, which does not apply to any of the three here).

## Why this should play better (reasoning, not assertion)

- Zones B and E stop being the same shape repeated — the only two platforming sequences in the level now have different end-heights (700 vs 650) and B's pair is purely jump-based while E's pair mixes a jump with a ladder-climb, giving E a legitimate claim to being the "varied/main" platforming zone the design brief for it describes.
- The two longest dead stretches (identified with exact coordinates in the audit) shrink from ~560px/~870px to ~400px/~250px, filled with low-cost single-tile rises that cost zero new mechanics (reuse the existing deck+ladder pattern already proven safe) rather than more flat ground.
- All proposed new jump/rise distances stay within the empirically measured natural jump envelope (217px horizontal, ~92px vertical) with margin, so none of this requires new physics tuning.
