# 05 — Environment art and depth

Builds on file 03's world-level findings and file 02's reference principles (cited as A1/B1/C1/D1 etc.). This file answers the brief's Part 3D questions directly, each backed by evidence already gathered (screenshots + source), not re-guessed.

## Does the forest look like a wallpaper strip?

**Yes, partially — and this is evidence-based, not assumed.** The background band (`kpp_bg_hill`, added Phase 6.5C2A) is a single 24×24px tile repeated via `add.image` loop at `scrollFactor(.3,.2)`, confirmed seamless at tile boundaries (Phase 6.5C2B verified this directly). But it is literally one repeating strip at one fixed height band (y≈430) for the *entire* 8400px world — every one of the five overview strips in file 03 shows the identical band at the identical height with the identical content. There is no variation in density, color, or silhouette shape from Zone A to Zone G. This is the textbook "wallpaper strip" the brief's question is asking about: technically non-repeating at the seam level, but functionally identical everywhere, so it reads as *decor* rather than *place*.

Contrast with C1 (Hollow Knight: start from the physical space, let small-scale design follow) and D1 (Ori: hand-placed, non-uniform art) — DENAI's background was added as a uniform system-wide layer rather than as part of each zone's own identity. That was the right call for the *narrow* problem it solved (6.5C1's "empty sky" complaint, which was real and is now fixed), but it does not by itself give any zone a distinct *place* feeling, and was never claimed to.

## Is the sky too empty?

**Less than before, still largely empty above the band.** Every screenshot in this audit (all 16 room shots, all 5 strips) shows a large flat-color region above the forest band — roughly the top third to half of the frame in most captures. This is a known, previously-documented, *deliberate* choice (depth-layer-plan.md explicitly chose one low band over filling the whole sky), re-confirmed still true in this independent pass. Whether it's a *problem* depends on what the sky is for: in Celeste/Mario, the sky above a level is rarely filled either — the design attention goes to the playable silhouette, not empty air. DENAI's playable silhouette (file 06) is the bigger problem than its sky.

## Are trees positioned at believable relative heights?

**Yes, with two caveats found and already fixed, one residual.** The midground tree loop places trees at a fixed world-y regardless of the terrain beneath them. In most captures this reads fine because the terrain's own highest points stay below the tree line with margin. Two specific placements were found, live, to be problematic in the prior phase (6.5C2B): one tree landed almost exactly behind the Zone G destination door (confirmed fixed and re-verified in this audit's R16 capture) and several others land in front of or behind dense machinery where they add nothing (E's pipe elbow area — confirmed in this audit that a tree there is now fully hidden behind opaque pipe art, i.e., present but invisible, a wasted draw call rather than a visible error).

## Are there enough distinct depth planes?

**No — there are effectively two (background band, foreground terrain), not three.** A true "midground" plane in the sense file 02's Ori/Hollow Knight principles describe (silhouetted mid-distance shapes the player's own terrain reads *against*) doesn't exist; the midground trees are sparse, small, and share the same scroll factor logic as decoration rather than functioning as a layer the eye can use to judge depth or position. This is the single most concrete, fixable gap identified in this file.

## Do distant objects appear too large?

**No measurable issue found.** The background tile is scaled consistently (×3, matching the game's universal tile scale) and the midground trees are the same native scale as the one foreground landmark tree in Zone A, just placed further back with a slower scroll factor — proportion is internally consistent, confirmed by direct pixel comparison across captures.

## Does parallax behave correctly across camera boundaries?

**Yes, re-verified independently.** Both world extremes (x≈0 and x≈8400) were checked directly in Phase 6.5C2B and spot-checked again in this audit's strip captures — no gap, no cutoff, no visible seam at either boundary, despite the background's `scrollFactor<1` lag relative to the camera.

## Does repetition become obvious?

**Yes, but the repetition that actually hurts the game is in the foreground structure (file 06), not the background.** The background's repetition is a known, accepted trade-off (one coherent sky vs. per-zone skies, a deliberate choice per depth-layer-plan.md). The foreground's repetition (the same post+ladder+deck module used for every single supported structure in the game) is not a deliberate stylistic choice stated anywhere in the source comments — it is simply the only module that exists, confirmed by grep: every `post()`/`beam()`/`s.deck()` call in `environment.js` draws from the identical three atlas frames (48/49/50 for deck, 89 for post) regardless of zone or role.

## Are areas visually flat despite having multiple layers?

**Yes — R04 (file 04) is the clearest case.** Three layers exist there (background band, midground tree, foreground ladder/deck stack) but because the foreground stack is itself two near-identical copies of the same shape, the *net* visual read is flat repetition, not depth. Layering alone doesn't create depth if the foreground doesn't vary.

## Does background art compete with playable terrain?

**No instance found.** Depth ordering is correct everywhere checked (background 0.5, midground 1.5, ground 9, decks 10, signs 11, ladders 13 — confirmed via source, re-verified visually: no background/midground element was ever seen rendering in front of a real surface in any of the 28 screenshots captured for this audit).

## Does the overall environment convey a coherent place?

**Partially.** The game conveys a coherent *material logic* (one set of Kenney tiles, one consistent lighting/color temperature, one consistent prop vocabulary) — nothing clashes. What it does not convey is a sense of *specific* place per zone: strip-by-strip comparison (file 03) shows that if the HUD text were hidden, a player could not tell which zone they were looking at from silhouette alone in A, B, D, or F — only E (blue pipes) and G (river + bespoke lever) are identifiable without reading a sign.

## Smallest asset-supported improvement plan (per the brief's explicit request — no new art)

Ranked by leverage, using only already-loaded, already-used assets:

1. **Vary the post+ladder+deck module's proportions per zone**, not its texture. The atlas already contains the pieces to build a shorter/wider or taller/narrower frame (same post tile at different run lengths, same deck tiles at different spans) — this is a composition change, not an asset change, and is the single highest-leverage fix for the "repeated rectangular geometry" complaint (confirmed as the #1 pattern across all five strips in file 03).
2. **Give the moving platform (F) a tint**, exactly the technique already proven safe in Phase 6.5C2A on E's walkway — zero new assets, fixes a confirmed (not assumed) legibility gap (file 04, R13).
3. **A second, denser midground band restricted to zone *transitions* only** (the ~100-200px either side of a zone boundary), reusing `kpp_tree` at a closer scroll factor, so crossing from one zone to another has a brief visual "threshold" moment — cheap, reuses existing assets, and directly targets the "no zone identity" finding without re-doing the whole world.
4. **Do not** add more background tile variety or more scattered decoration — file 03/04 both show decoration density is already adequate to good in most rooms (R01, R03, R07, R14 all score well); the deficit is in *architectural shape variety*, not prop count, and the brief explicitly warns against "add more detail" as a non-fix.
