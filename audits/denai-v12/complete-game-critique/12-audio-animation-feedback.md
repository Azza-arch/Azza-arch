# 12 — Audio, animation, and polish

## What exists, confirmed via source (not independently heard — this audit did not play audio through speakers/verify waveforms)

- **SFX call sites confirmed present:** `SFX.jump`, `SFX.land(audio,impact)` (impact-scaled), `SFX.coin`, `SFX.correct`, `SFX.incorrect`, `SFX.bridge`, `SFX.checkpoint`, `SFX.machine`, `SFX.victory`, `SFX.ui` — all imported from `../audio.js` and called at the exact moments you'd expect (jump input, landing, coin pickup, puzzle success/failure, bridge-raise tweens, checkpoint trigger, crate-switch activation, level completion, menu clicks). This is a complete, sensibly-mapped feedback-to-event table; the *coverage* is good. Whether the actual sound files are present, loaded without error, and sound appropriate was **not verified** in this audit (no console errors were seen across the entire testing session, which is at least consistent with the audio files loading successfully, but is not proof of audio *quality*).
- **Music:** `audio.unlock()`/`audio.isPaused()` and a volume/mute settings panel (`#settings`, confirmed present and functional in source) exist, implying a persistent music/audio system, but music-specific playback was not checked.
- **Particle/animation feedback confirmed present:** `dustBurst` (landing, scaled by fall speed), `sparkleBurst` (coin pickup, secret discovery, crate-ledge discovery, goal arrival), `pulseRing` (switch activation, goal arrival), `floatingText` ("+1" on coin pickup) — all confirmed called at matching gameplay moments via direct source read.
- **Animation anticipation:** Confirmed present on the two biggest "world changes" (lift raise, river bridge lock-in) via delayed tween starts before the main motion plays — a small but real beat of anticipation before the payoff.

## Per the brief's specific feedback-moment checklist

| Moment | Feedback present? | Evidence |
|---|---|---|
| Character movement | Yes — full idle/run/jump/fall animation set with a documented bugfix for a known apex/ledge-flash issue (file 07D) | Source-confirmed |
| Jump/landing | Yes — squash/stretch scale tween + impact-scaled dust + `SFX.land` | Source-confirmed |
| Moving lift | Yes — lever angle tween, bridge-raise tween with `SFX.bridge` delayed to land on the visual payoff | Source-confirmed |
| Number blocks | Yes — tween to socket, alpha-highlight of selected block, return-tween on failure | Source-confirmed |
| Lever | Yes — angle tween on every activation (lift lever, river lever both) | Source-confirmed |
| Water flow | Yes — the strongest feedback sequence in the game (file 09): a visible flow-dot tweening through real waypoints, pausing to update stage-readout text at each leg, `SFX.correct`/`SFX.incorrect` on result | Source-confirmed |
| Bridge | Yes — every gate uses the same raise-tween + physics-body-added-on-complete pattern, with a `SFX.bridge` cue | Source-confirmed |
| Collectibles | Yes — sparkle + floating "+1" + `SFX.coin`, single-fire guaranteed by `coin.active` flip (confirmed no double-trigger possible) | Source-confirmed |
| Victory | Yes — sparkle burst + pulse ring at the goal, `SFX.victory` gated to fire exactly once (`completionSoundPlayed` flag) | Source-confirmed |

**Finding: feedback coverage is not the game's weak point.** Every single moment the brief asks about already has a real, specifically-tuned response in source. This is worth stating plainly to the owner since "the game feels unfinished" (one of the brief's own stated owner concerns) is **not explained by missing feedback systems** — those are comprehensively built. If the game *feels* under-polished in play, the more likely causes (per files 05-07/11) are the structural/visual repetition and the flat challenge curve, not an absence of juice.

## Recommended additions (reuse vs. new, explicitly separated per the brief's requirement)

- **Reuse of existing assets/techniques (no new asset needed):**
  - The moving platform (file 05/07) could get a `setTint()` using the exact technique already proven on E's walkway — zero new assets.
  - A short, low-key ambient audio cue when entering Zone E (water) vs. Zone G (river) — *if* the existing `audio.js` system already supports per-zone ambient layering (not confirmed either way in this audit; would need direct inspection of `audio.js`, not read in this pass since it lives outside `src/v12/`).
- **Procedural effects possible with the current engine (no new asset, new code only):**
  - A one-line "journey summary" on the completion screen generated from already-tracked state (`solvedGates`, `discoveredSecrets`, `elapsed`) — a pure code addition, directly serves both file 09's and file 10's independent "weak emotional payoff" findings.
  - A brief visual "threshold" cue at zone boundaries (file 05's recommendation #3) using existing `kpp_tree` placed more densely for a short stretch — procedural placement, no new art.
- **Would require new, currently-unverified assets (explicitly flagged, not assumed authorized):**
  - Any pixel-art UI chrome (file 11) — flagged there as needing actual asset inspection before recommending.
  - A distinct ambient music sting per zone, if the current audio system doesn't already support it — not confirmed either way.

## Explicitly not recommended

Per the brief's own caution: no screen shake is recommended anywhere (none currently exists, and given the calm, low-pressure tone confirmed throughout files 08-10, adding it would work against the game's established feel, not enhance it). No new large set-piece animation (cutscene-style reveal, camera-pan flourish) is recommended without human playtest evidence that the existing tween-based feedback is actually read by players as insufficient — this audit found no source-level evidence that it is.
