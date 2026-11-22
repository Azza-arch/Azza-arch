# Lorong Atas Bumbung — V6.1 Visual & Gameplay Acceptance Review

**Mode: review only. No source, physics, or asset changes made in this pass.** Based on direct inspection of `audits/level-v6.1/screenshots/*.png`, `level-v6.1-contact-sheet.png`, `v61-upper-route-results.json`, the current `src/level.js`/`src/game.js`, and the implementation/blueprint reports. Passing automated tests is treated as necessary, not sufficient — every finding below is from the actual rendered screenshots, not from the geometry tables.

---

## 1. Visual inspection — Zone B, Zone E, camera

**Zone B (`zoneB-overview-before/after.png`):** the "after" composition is **not meaningfully different in silhouette** from "before." Both are flat, same-height block towers with a ladder bookending each end; V6.1 just adds a third identical-looking tower in the middle. Visually this reads as *more* repetition, not less — three near-identical square pillars in a row is a stronger "stamped-out" pattern than two. The underlying jump math is sound (verified safe, two 130px flat gaps instead of one 128px gap), but **the screenshot does not communicate "redesigned," it communicates "the same idea, one more time."** This is exactly the kind of gap between passing geometry checks and actual player-facing quality the brief asked to catch.

**Zone E (`zoneE-overview-before/after.png`, `zoneE-04-e3-to-e4.png`):** this one **does** read as genuinely different — a real ascending-then-descending staircase silhouette (low → low-mid → tall → low-mid), clearly distinct from Zone B's flat row and from Zone E's own old two-tower layout. This is the one place V6.1 delivers on "meaningfully different." Two caveats visible directly in the screenshots, not in the data:
- The ladder icon at `roof-e2` (visible in `zoneE-03-ladder-e2-to-e3.png` and `zoneE-04-e3-to-e4.png`) visually resembles the function-machine lever icon used for the puzzle terminals (same small rectangular Kenney sprite silhouette at this scale). A player glancing at the screenshot could plausibly mistake "there's a ladder here" for "there's a second machine here" before getting close enough to read the W/S prompt. Minor, but real.
- `roof-e1` and `roof-e4` end up at very similar screen heights (960 and 940 — only 20px apart, imperceptible in `zoneE-04-e3-to-e4.png`), so the overall shape in a single static frame reads as "low – TALL – low" rather than a fully varied four-step staircase. The data differentiates them (ascending vs. descending jump), but the silhouette doesn't make that distinction obvious without actually playing the sequence.

**Camera (`camera-*-before/after.png` pairs):** confirmed directly in the renders, not just computed — the sky reduction is **real but modest**. At Zone E's highest point, the ground line moves from ~87% down the frame to ~73% down the frame (visually: roughly one extra platform-height of headroom reclaimed, not a transformation). At `near-goal` the shift is smaller still. The "excessive empty sky" complaint from V5/V6 is **reduced, not resolved** — more than half the frame is still empty sky in every after-shot reviewed.

**Character scale:** Chill Boy reads clearly and consistently at this zoom in every screenshot checked — no scale regression anywhere in Zone B or Zone E.

---

## 2. Gameplay rhythm across A–G

| Zone | Observation |
|---|---|
| A | Single clean intro jump (FIRST_GAP), fine. Unchanged, out of scope. |
| B | **Repeated platform pattern** (see §1) — three same-height, same-width towers in a row is itself a "repeated pattern," just with one more repetition than before. The two coins are the only reason to detour here; without them, the upper route has no purpose distinct from "a slightly longer way to walk the same distance." This matches the brief's "collectibles placed only to justify detours" concern directly — coin-b1/coin-b2 are doing exactly that job and nothing else. |
| C | Café roof + CP1, simple and distinct from B/E — fine, unchanged. |
| D | Workshop approach + M1 — unchanged, already the best-fixed zone from V5. |
| E | The one genuinely varied sequence in the level (see §1) — this is where "gameplay identity" actually shows up. |
| F | Cave detour + hill climb — unchanged, already the best-executed optional content per every prior audit. |
| G | Final gate + goal, correctly climactic, no filler. |

**Machines feeling disconnected:** M1 and M3 sit directly on the main path with short, deliberate approaches — fine. **M2 is the interesting case**: it now sits right where the Zone E descent chain lands (`zoneE-06-at-m2.png` confirms this visually — the terminal prompt is immediately readable on arrival), which is a genuine improvement over a machine that's merely "nearby" — the descent chain *delivers* the player to the machine rather than the machine just happening to be in the same area. This is a real rhythm win worth keeping.

**Unnecessary ladders:** none found — every ladder in B and E does real work (up/down for B's bookends, the one unavoidable 96px rise in E). No "climb and instantly descend" pattern remains.

**Jumps adding no meaningful challenge:** Zone B's three flat dy=0 jumps are the weakest in the level from a challenge standpoint — they're the safest possible jump type by design (per the blueprint's own "conservative margins" instruction), which is correct for an *optional* route but means Zone B currently offers close to zero platforming challenge, just repetition.

---

## 3. V6 design-goal progression check

Target: *Introduction → movement practice → optional traversal → café rest → function puzzle → rooftop challenge → hill/cave exploration → final bridge → completion.*

- Introduction/movement practice (A): **succeeds**, unchanged from prior passes.
- Optional traversal (B): **partially succeeds**. It is optional and it does traverse — but as "practice," it practices the same single skill (a flat jump) three times instead of once, which doesn't add new learning the way a varied sequence would.
- Café rest (C): **succeeds**, unchanged.
- Function puzzle (D, M1): **succeeds**, unchanged.
- Rooftop challenge (E): **succeeds** — this is the strongest realization of "challenge" in the level now, with real elevation variety and a genuine descent.
- Hill/cave exploration (F): **succeeds**, unchanged, already well-executed.
- Final bridge/completion (G): **succeeds**, unchanged.

Net: the progression's *shape* is intact end-to-end; the one soft spot is that "optional traversal" (B) doesn't yet pull its weight as a distinct beat from "rooftop challenge" (E) the way the progression implies it should — right now E does all the work.

---

## 4. Camera composition

- **Empty sky reduced:** yes, confirmed in the screenshots, but modestly (see §1 numbers). Not what a player would describe as "fixed," more "slightly better."
- **Upcoming obstacles visible:** `offsetX=-85` was left unchanged and still works — in every "after" shot, the next platform or gate is visible before the player reaches it (e.g. `zoneE-04-e3-to-e4.png` shows the player, M2's label, and the gate opening all in one frame).
- **Player positioning:** Chill Boy sits noticeably higher in-frame in the "after" shots at elevated sections (good — less wasted sky above the actual point of interest), unchanged at ground level (confirmed — `camera-low-ground-*` pair is visually identical, matching the implementation report's note that ground-level framing is deliberately untouched by this correction).
- **Different desktop aspect ratios:** not independently re-verified with new screenshots in this review pass (the implementation report's A/B test used a single 1366×768 viewport); this is a gap, not a failure — flagged in §6 below.
- **Readable without fullscreen:** yes — every screenshot reviewed here was captured in the normal (non-fullscreen) `.game-frame`, and all text/prompts/labels are legible at that size.

---

## 5. Final verdict by zone

| Zone | Verdict | Why |
|---|---|---|
| A | **ACCEPT** | Unchanged, already solid, out of this pass's scope. |
| B | **MAJOR REVISION** | Functionally safe (verified jumps, safe recovery) but visually and rhythmically the weakest content in the level: three near-identical flat towers read as *more* repetitive than the two they replaced, and the only reason to take the route is two repositioned coins. This doesn't meet "meaningfully different" — it's the same idea with an extra repetition, confirmed directly from `zoneB-overview-after.png` against `zoneB-overview-before.png`. |
| C | **ACCEPT** | Unchanged, already distinct and purposeful. |
| D | **ACCEPT** | Unchanged, already the best-fixed zone from prior passes. |
| E | **MINOR REVISION** | The one real success of this pass — genuinely varied silhouette, a meaningful descent, and the chain now delivers the player straight to M2. Two small, concrete issues keep it from full ACCEPT: the ladder icon's visual confusability with the machine-lever icon, and `roof-e1`/`roof-e4` sitting at nearly indistinguishable heights on screen. |
| F | **ACCEPT** | Unchanged, already the best-executed optional content in the level per every prior audit. |
| G | **ACCEPT** | Unchanged, correctly climactic. |

Camera: treat as **MINOR REVISION**, not fully resolved — the correction is real and regression-free but only closes a fraction of the original "excessive empty sky" gap, and cross-aspect-ratio verification is still outstanding.

---

## 6. Prioritized remaining design problems (top 5)

1. **Zone B's three-tower repetition reads worse visually than it measures numerically.** Highest priority — this is the zone the original V5/V6 "repetitive" complaint was most directly about, and the screenshots show it's still true at the visual level even though the underlying math improved. A future pass should vary B's platform *heights or widths* (not just add more same-shape platforms), not just verify more jumps are individually safe.
2. **Zone B's collectibles are the only reason to take the detour.** Once a player has both coins, there's no remaining incentive to use the upper route over the street. Worth a genuine reward or shortcut rationale, not just coins.
3. **The ladder-vs-machine icon ambiguity in Zone E** (same small lever-like sprite silhouette used for both climbable ladders and puzzle terminals) is a small but real readability problem, visible directly in `zoneE-03`/`zoneE-04` screenshots.
4. **Camera improvement is real but small** — more than half the frame is still empty sky in the worst-case shots reviewed. If "excessive empty sky" is meant to be actually solved (not just reduced), a larger structural change (e.g. a shorter logical viewport height, or content placed higher in the world) would be needed, not just an offset/bounds tweak.
5. **No cross-aspect-ratio camera verification yet.** The A/B test that justified the current camera values used a single 1366×768 viewport; the original V5 audit specifically called out 1366×768 and 1920×1080 as the two reference sizes, and the second hasn't been re-checked since the V6.1 camera change.

---

## Source-modification check

```
git status --porcelain app/addmath/rooftop/
```
Only the pre-existing untracked directory — no source, physics, asset, or UI files were touched during this review. New files produced by this pass live entirely in `audits/level-v6.1/`.

**Stopping here per the explicit "strict review only... stop after the acceptance review" instruction.**
