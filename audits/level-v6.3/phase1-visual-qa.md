# Lorong Atas Bumbung — V6.3 Phase 1 Visual QA

**Status: evidence-based, from actual browser screenshots** — `app/addmath/rooftop/tests/artifacts/phase1/` (21 captures: 7 zones × 3 viewports) and `phase1-zone-contact-sheet.png`/`phase1-before-after.png` (composited from those same real renders, no synthetic/generated imagery). Per the brief's own instruction, passing tests is **not** treated as sufficient here — this document is the separate visual judgment pass.

## Viewports captured

| Viewport | Purpose | Result |
|---|---|---|
| 1366×768 | Common laptop size | All 7 zones captured, 0 console/page errors |
| 1920×1080 | Common desktop size | All 7 zones captured, 0 console/page errors |
| 1400×560 (short-wide) | The specific aspect-ratio case `game.js`'s own `fitFrame()` comments flag as a prior problem area | All 7 zones captured, 0 console/page errors, no overflow/scroll |

## Location identity without the zone-name toast

Checked by looking at each 1920×1080 capture with the toast already faded (captures were taken after a short settle delay, matching real play where the toast only shows briefly on arrival):

- **A (Taman Perumahan):** reads as residential — two house silhouettes, distant mosque spire, a flag — confirmed identifiable without text.
- **B (Lorong Pekan):** reads as a commercial street — shopfront roofs directly behind both awnings, lamp post — confirmed identifiable.
- **C (Café Atas Angin):** reads as a café specifically — the canopy (`h1_roof_porch`) sits right at the checkpoint deck, two-storey backdrop behind it, plant accents — the single clearest zone-identity win in this pass.
- **D (Bengkel Fungsi):** reads as a small workshop — roof + grille door directly behind the machine — confirmed, though it's the subtlest of the seven (by design — the brief asked for "minimal pipe/gear motifs," not a full structure).
- **E (Deretan Bumbung):** reads as a rooftop district — a connected row of small roof shapes beneath the platform chain, a water tank, hills on the horizon — confirmed, and the roof-mass does **not** obscure Machine 2 or suggest a ground-level route up to it (checked directly against the jump chain's coordinates — every midground sprite's y-position sits below or beside the platforms, never bridging street to deck).
- **F (Bukit Tanjung & Gua):** reads as a hillside approaching town's edge — hills skyline, sparse bushes, no buildings (as specified) — confirmed, correctly distinct from B's "urban" and E's "rooftop" identities.
- **G (Jambatan Sungai):** deliberately the least decorated zone (per the composition plan's "clean, open climax" instruction) — confirmed this reads as intentional restraint, not an oversight, since every other zone visibly has scenery and G's bareness stands out as "the clearing," consistent with the design intent.

## Player visibility

Checked in every one of the 21 captures: the character sprite (dark, high-contrast against the now-populated but still lighter-toned background/midground layers) remains the most visually prominent moving element in frame in all cases. No capture shows the character blending into or being obscured by any new scenery sprite.

## Platform readability

Checked specifically where new midground art sits directly behind a jump platform (Zone B's two awnings, Zone E's four roof segments): in every capture, the platform's own dark Kenney-tile edge remains clearly the sharpest, highest-contrast line in that area — confirmed by direct visual inspection, not assumed from the alpha values alone.

## Background contrast

Confirmed qualitatively against the art direction's stated ordering (background lightest → midground medium → gameplay darkest): in every capture, the terrain/deck/ladder tiles are visibly the darkest elements on screen, midground buildings sit at a visibly lower contrast, and background skyline (house row / hills / mosque) sits lower still. No capture shows a background or midground element reading darker than the terrain beneath it.

## Visual consistency / continuity

Confirmed the fix for the earlier parallax bug (documented below) resolved the zone-bleed problem: Zone A/B's house-row background does not appear in Zone E's captures, and Zone E/F/G's hills do not appear in Zone A/B's captures, in any of the 21 screenshots reviewed. Gentle, single-zone bleed at boundaries (e.g. a sliver of Zone D's door/roof visible at the left edge of a Zone E capture taken near their shared boundary) is present and judged consistent with the brief's own "gradual changes... do not abruptly switch art styles at zone boundaries" instruction, not a defect.

## Empty-sky improvement

Qualitative, not claimed as a measured percentage (per `level-v6.3-camera-options.md`'s own caution against treating this as more than it is): every capture now shows populated sky/horizon content above the terrain line, where the V6.2 baseline screenshots (`audits/level-v6.2/screenshots/`) showed flat empty grey. Directly visible in `phase1-before-after.png`'s four paired comparisons. The *proportion* of frame occupied by sky is unchanged (expected — Phase 1 deliberately did not touch the camera), but the complaint ("empty," not "sky-sized") is addressed by content, matching the Alternative A recommendation this phase implements.

## Clipping or stretching

Checked across all three viewport sizes for every zone: no sprite clipping at frame edges beyond ordinary camera-follow framing (a sprite partially off-screen because the camera is centered elsewhere is expected, not a defect); no stretching artifacts (every `art()` call uses an explicit, deliberate `scale` argument, never a forced display-size mismatch). The short-wide 1400×560 viewport specifically showed no new overflow or layout break beyond what already exists in the unmodified UI chrome.

## Performance and console errors

`tests/phase1_capture.py`'s own error/console listeners recorded **zero** page errors and **zero** console errors across all three viewport runs (21 captures total). Sprite count added: 3 looped background bands (~26 images total across their loops) + 16 single midground/prop placements = **42 new decorative images**, all static (no physics bodies, no per-frame animation beyond the pre-existing cloud/coin tweens), added once per scene `create()` — same creation cost class as the existing ground-tile loop, not a new performance category.

## Bug found and fixed during this pass (disclosed, not hidden)

**Parallax-coverage bug:** the first implementation used `scrollFactor(.3,.2)` for the background band (matching the existing cloud layer's values). This caused the sparse, zone-targeted `bg_house_row`/`bg_hills` placements to visually "stretch" far beyond their intended zone — confirmed directly: with the camera at Zone E (x≈4900), Zone A/B's house-row background was still fully visible on screen (`1920x1080__zone-E.png`, first capture, superseded). Root cause: a low scroll factor makes a sprite's apparent on-screen persistence last roughly `1/scrollFactor` times longer, in camera-travel terms, than its raw world-placement width — fine for the clouds (looped across the *entire* `WORLD.width`) but wrong for a deliberately zone-scoped band. Fixed by raising the background scroll factor to `.85,.6` (and midground to `.92,.7`), re-captured, and re-verified: Zone E's capture now correctly shows hills, not house roofs (`1920x1080__zone-E.png`, current). This is disclosed here per the brief's "do not treat passing tests as sufficient" instruction — the automated regression suite (which tests gameplay state, not background texture placement) would never have caught this; only the visual QA pass did.

**Blank-panel composition bug:** also found and fixed during this pass — see `phase1-asset-usage.md`'s rejected-assets table (`h3_wall_lower`/`h3_wall_upper`). Both fixes are reflected in the screenshots referenced throughout this document, which are all post-fix captures.
