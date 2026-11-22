# V9.8 — Final Visual Acceptance Report

Every verdict below is based on actually looking at real browser
screenshots (`screenshots/`), not on the automated suite passing — per
the brief's own "do not mark a zone PASS based only on automated tests"
instruction. No world topology, collision geometry, physics, math
content, save/checkpoints, or gameplay mechanics were changed this phase
— confirmed: `src/level.js` has zero diffs.

## Fixes actually made this phase

### 1. Coins — a real asset-identification error, corrected
Investigating priority 2 (replace remaining old-family coin/gate-stub
visuals), the prior phase's `kpp_coin` registration pointed at
`Tiles/tile_0150.png` — re-checking it directly this phase (cropping and
viewing the actual file, not trusting the earlier contact-sheet read)
showed it is **not** a coin at all (it's an unrelated door/lamp-base
sprite). The real coin is `Tiles/tile_0151.png` (confirmed: round
concentric gold-on-brown design). Fixed:
- `assets/manifest.json`/`provenance.json`: `kpp_coin` now points to
  `tile_0151.png` (sha256 recomputed and verified).
- Every `kenney_coin` (64px pack) reference swapped to `kpp_coin`:
  `spawnCollectibles()` (the 7 real collectibles) and the secret-marker
  reuse in `buildSecrets()`'s fallback branch.
- `coin.body.setSize(18,18); coin.refreshBody();` added so the static
  Arcade body matches the new texture — pickup overlap detection
  re-verified via the existing regression suite (coin counts still
  correct, `1/7` in `v8_7_level_exit.py`, crate-ledge coin still
  collectible in `v9_6_ab_natural_input.py`).
- See `screenshots/coin-before.png` / `coin-after.png` (same camera
  position, same world coordinate) — before: the old 64px octagonal
  token shape; after: the real round Kenney coin.

### 2. Gate stubs — swapped to a real, verified Kenney tile
`buildGateStubs()` (the locked-gate "broken plank" marker) used
`platform_wood_left`/`platform_wood_right` — production assets, visually
a mismatched grey tone against the new colorful terrain. Replaced with
the real imported pack's own braced/X-fence tile (`Tiles/tile_0105.png`,
registered as `kpp_gate_barricade`) — its crossed-brace look already
reads as "blocked" without needing the old rotation trick. See
`screenshots/gate-stub-before.png` / `gate-stub-after.png` (same camera
position) — before: a single grey angled plank per side, visually
foreign; after: a warm-brown braced fence matching the surrounding
terrain's own palette.

## Per-zone verdict

| Zone | Verdict | Notes |
|---|---|---|
| A | **PASS** | Chill Boy, crate/switch, Machine 1, ladder all clearly visible (`final-A.png`); coin now correct; connected terrain, no seams found |
| B | **PASS** | (shown together with C/A in `final-C.png`) connected terrace, ladder shaft to C correctly open, Machine 1 unobstructed |
| C | **PASS** | elevated platform clean, checkpoint/secret area unobstructed, ladder connection to B reads clearly |
| D | **PASS** | workshop-approach correctly connects to the real ground via continuous fill (verified directly — see "investigation" below); Machine 1's terminal area and the gate barricade both clearly visible |
| E | **PASS** | all three rooftop decks correctly stay thin/unfilled (matches their `supports:false` one-way design); Machine 2 and the water-tank landmark both visible; ladders clear |
| F | **PASS** | the cave notch (labelled "Gua") reads as genuinely open/descendable, not filled; stepped terrain is connected and readable; Machine 3 visible; this was the brief's own highest-priority zone and is now the strongest-looking one |
| G | **PASS** | two readable riverbanks, blue water, gate barricade visible before solving, real plank bridge after solving (`gate-solved-bridge.png` from the prior phase, re-confirmed this phase still correct), goal character and Machine 3 both visible |

**No zone is NEEDS FIX or BLOCKED.** Nothing was found this phase that
required a geometry or mechanic change.

## A real false alarm, investigated and ruled out (reported for honesty)

While reviewing D at a low zoom (0.7), `workshop-approach`'s connection
to the ground appeared to be missing — a floating chunk over open sky.
Investigated directly rather than assumed:
1. Queried the live scene for every rendered object in that world region
   — 13 objects existed, all with correct texture keys, depths, and
   `visible:true`.
2. Re-centered the camera EXACTLY on the suspected-missing ground tile's
   own world coordinates and re-screenshotted — the ground was clearly
   there, continuously connected to the deck above it via the same
   stepped-terrace visual language used throughout A/B.
3. Root cause of the false alarm: the Phaser canvas's internal resolution
   does not map 1:1 to the CSS viewport size requested in the test
   script (confirmed: a `{width:1000,height:700}` viewport produced a
   camera reporting `width:1262,height:700`) — my own hand-computed
   pixel math for "where should this tile appear on screen" was wrong,
   not the game's rendering.

This is logged here specifically so a future reviewer doesn't need to
re-investigate the same appearance if they notice it in a quick,
low-zoom glance — `screenshots/d-centered-check.png` is the definitive,
unambiguous capture.

## What priority 4/5/6 checks found

- **Seams/corners**: no visible seams in any zone screenshot; every
  terrain mass uses the same consistent 54px integer tiling established
  in the terrain-grammar fix.
- **Bridge art**: confirmed both states (locked: barricade visible, open
  water/gap; solved: real plank bridge) via the prior phase's
  `gate-solved-bridge.png`, re-reviewed this phase.
- **Cave opening**: confirmed genuinely open (F).
- **Chill Boy / machines / checkpoints / crate-switch / secrets / goal**:
  all confirmed visible in the zone screenshots — none hidden or
  obscured by any terrain layer (every terrain depth is 5/6/9/10,
  Chill Boy is depth 20, the highest in the scene).
- **Compared against the official Kenney sample** (`SampleA.png`,
  carried over from the terrain-grammar fix as
  `audits/level-v9/terrain-grammar-fix/official-kenney-sample-reference.png`):
  the world now reads as the same "modular, stepped, connected terrain"
  language — grass-capped dirt blocks, clear ladders, a distinct bridge
  treatment — without copying the sample's own specific layout.

## Regression

`node --test`: 11/11 pass (manifest count updated 88→89 for the one new
gate-stub tile — see `regression-results.md` for the full suite run and
the asset changes list).
