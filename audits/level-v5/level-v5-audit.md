# Lorong Atas Bumbung — Level 1 Technical Audit (V5)

**Mode: read-only audit.** No source files were modified to produce this report. All coordinates below are transcribed directly from `app/addmath/rooftop/src/level.js` as read during this session; all measurements are from either (a) natural-keyboard-input Playwright probes, or (b) the game's own exported `MOTION` constants (labeled explicitly where used instead of (a)). Nothing here was inferred from concept art.

---

## 1. Architecture

| System | Location | Status |
|---|---|---|
| Entry point | `app/addmath/rooftop/index.html` → `src/game.js` (ES module) | Single Phaser scene (`Rooftop`), no scene manager/chaining |
| Engine | Phaser 3.90.0 (vendored, `vendor/phaser-3.90.0.min.js`) | — |
| World/level data | `src/level.js` — pure exported constants (`WORLD`, `MOTION`, `SPAWN`, `GOAL`, `ZONES`, `GROUND_RANGES`, `FIRST_GAP`, `DECKS`, `LADDERS`, `GATES`, `TERMINALS`, `CHECKPOINTS`, `COLLECTIBLES`, `PUZZLES`) | Cleanly decoupled from rendering — **reusable without modification** by a new layout as long as the same shape (arrays of `{x,y,width,...}`) is kept |
| Rendering/collision | `src/game.js` `buildEnvironment()` — generic loops over the above arrays (`DECKS.forEach`, `LADDERS.forEach`, etc.) | **Reusable without modification** — it does not hardcode positions, only iterates whatever `level.js` exports |
| Player controller | `src/game.js` `update()` | Single-file, physics tied to `MOTION` constants, not to specific coordinates — reusable |
| Collision | Phaser Arcade Physics; one static group (`this.solids`), one-way platforms via a custom `oneWay` collider callback (`game.js:58-63`) | Reusable |
| Camera | `game.js:70-73` — bounds `(0, 220, WORLD.width, WORLD.height-220)`, follow with lerp `.14/.16`, offset `(-85, 60)` | Tied to `WORLD.height` only, not hardcoded coordinates — reusable, but the offset/bounds *values* are a design choice worth revisiting (§7) |
| Puzzle system | `PUZZLES` array (data) + `openPuzzle/answer/requestHint` (generic engine) in `game.js` | Fully data-driven — **confirmed reusable**, adding/changing a puzzle requires no engine changes, only a new `PUZZLES` entry + matching `TERMINALS`/`GATES` entry |
| Checkpoint system | `CHECKPOINTS` array + `checkpointIndex` + proximity check in `update()` | Data-driven, order-dependent (checkpoints must stay in ascending x — enforced by a test) |
| HUD/UI | `index.html` HUD/dialogs + `game.js` DOM writes (`$('...')`) | Minimal: objective text, checkpoint text, a transient zone-toast, puzzle/pause/complete dialogs |
| Completion flow | `finish()` in `game.js` → `#complete` dialog | Reports real `coinsFound`/`solvedGates.size`, not hardcoded |

**Tightly coupled to hardcoded coordinates:** none of the *systems* are — every system reads from `level.js`. The coordinates themselves (in `level.js`) are, by design, hardcoded numbers (this is a hand-placed platformer, not procedurally generated), which is normal and not a defect in itself.

---

## 2. Player Movement — Measured

Source of truth for configured values: `MOTION` constant, `level.js:5-6`.

| Metric | Configured (source) | Empirically measured (natural keyboard input) | Confidence |
|---|---|---|---|
| Max horizontal speed | 280 px/s | **280 px/s** (plateaued exactly, see `movement-measurements.json`) | High — direct measurement |
| Acceleration | 2100 px/s² | Time-to-98%-plateau from standstill: **~478ms** (sample noise from automation timing ±40ms per sample; order-of-magnitude consistent with 2100 px/s², not independently solved for the exact constant) | Medium — consistent with source, not a precise re-derivation |
| Braking | 2500 px/s² | Observed velocity drop ~40px per ~40ms tick after release, consistent with a faster deceleration than acceleration (matches `braking > acceleration` in source) | Medium |
| Gravity | 1400 px/s² | Not independently measured (would require isolating vertical free-fall); taken from source | Source-only |
| Jump impulse | 520 px/s (initial upward velocity) | — | Source-only |
| Jump peak rise | Nominal `jump²/(2·gravity) ≈ 96.6px` | **Measured 92.2px** (natural jump, running start) — within 5% of nominal, difference explained by forward momentum trading into horizontal distance | High — direct measurement |
| Max horizontal jump distance | Nominal `2·jump/gravity·speed ≈ 208px` | **Measured 217px** (natural jump: ran for 150ms to build speed, then jumped) | High — direct measurement, natural input, not `body.reset()` |
| Player collider | 28×60px | From source (`bodyWidth`/`bodyHeight`) | Source-only |
| Ladder climb speed | 150 px/s (`climb` constant, multiplies vertical input) | Attempted empirical measurement did not successfully trigger the climbing state in this probe run (methodology gap — the reset position used for isolated measurement did not land inside the ladder's overlap zone); **not independently re-verified**, reported from source only | **Source-only — flagged as unverified** |
| Coyote time | 110ms | From source | Source-only |
| Jump buffer | 130ms | From source | Source-only |

**Confirmed implemented:** one-way platforms (deck collider callback), ladder climbing (gravity disabled while climbing, re-enabled on exit), checkpoint-based respawn, fall recovery via continuous ground (not every fall = respawn — see §10), coyote time and jump buffer (both read from `MOTION` and applied in `update()`, `game.js:361-363`).

**Not implemented (confirmed absent from source):** variable jump height (jump impulse is a fixed `-MOTION.jump`, no hold-to-jump-higher logic), drop-through platforms (one-way colliders only block from above, there's no "press down to fall through" input handling), moving platforms (no entity in `level.js`/`game.js` has velocity assigned to a platform body).

**Practical safe jump margin, for design purposes:** with a measured max natural jump distance of 217px, every *mandatory* same-tier jump in the current map (all 128px, see §4) carries an **89px safety margin** — generous. `FIRST_GAP` (120px) carries a **97px margin**. All three gates (450/500/350px) are 133–283px *beyond* the 217px natural max, confirmed un-jumpable by design, not just by the nominal-formula test.

---

## 3. World Geometry — Coordinate Inventory

Full table: **`level-v5-geometry-inventory.csv`** (39 rows, every ground segment, deck, ladder, gate, terminal, checkpoint, collectible, spawn, goal, and the two implicit hazard conditions, with exact x/y/width and collision status).

Technical map (generated from this same data, not concept art): **`level-v5-current-map.png`**.

### Platforms/ladders without a clear, singular gameplay purpose

- **None are purely decorative-with-collision** (confirmed: every `DECKS`/`LADDERS` entry connects two real traversal points, verified by the existing test `every ladder lands on a real deck or ground range at both ends`).
- `cafe-roof` + its ladder (`ladder-2720`) is the one genuinely **optional** deck+ladder pair whose only payoff is a single collectible — this is intentional (matches the "short optional detour" design goal) but is also the single smallest, lowest-stakes piece of content in the whole map, and reads as low-effort on inspection (§5.C, Zone C).
- `gua-alcove` is likewise optional-only, but has two collectibles and a distinct "cave" visual treatment (muted tint), reading more intentionally than `cafe-roof`.

---

## 4. Zone-by-Zone Analysis (A–G)

### Zone A — Taman Perumahan (x: 0–1100)

**Geometry:** Ground `[0,420]`, `FIRST_GAP` (120px, ungated), ground resumes `[540,1100+]`. No ladders, no decks. One collectible (565, 940) just past the gap.

**Player behavior:** Spawn → walk → one mandatory jump (120px, 97px margin) → continue walking into Zone B (zone boundary at 1100 is arbitrary relative to geometry — nothing changes at x=1100 itself, Zone B's first feature is at x=1300).

**Design quality:** Forward route is clear (one straight line, one jump). Introduces exactly one new thing (jumping). No pointless ladders (there are none). **Gap: ~560px of flat, featureless ground between the jump (landing ~660) and Zone B's first deck (1300)** — this is the first "long uninterrupted flat stretch" instance.

**Verdict:** `FIRST_GAP` — **KEEP** (measured-safe, serves its stated purpose, clean). The 540-990px dead stretch after it — **MODIFY** (needs *something*, even a single low-effort landmark or second small collectible, to avoid being pure empty runway).

### Zone B — Lorong Pekan (x: 1100–2200)

**Geometry:** Continuous ground. Upper route: `town-upper-1` (1300-1500, y824) —128px jump— `town-upper-2` (1628-1848, y824), ladder up at 1350, ladder down at 1800. Two collectibles on the upper decks.

**Player behavior:** Player can walk the entire zone at ground level and never touch the upper route (confirmed: ground is continuous underneath, per `GROUND_RANGES[1]=[540,3850]`). Taking the upper route costs one ladder-up, one jump, one ladder-down, for 2 coins.

**Design quality:** The upper/lower choice is real (not a fake choice — ground truly is a complete alternate path). However, the upper route's *own* internal rhythm is a direct "ladder → short walk → jump → short walk → ladder" sequence with both decks at the identical y=824 — this is the "two identical rectangular platforms in a row" pattern (brief 1's Problem A) made concrete: `town-upper-1` and `town-upper-2` are same width-class, same height, same deck composition, differing only in the id string. **Zone B does not introduce anything mechanically new versus the eventual Zone E upper route**, which repeats the exact same pattern (`roof-e1`→128px jump→`roof-e2`, also both y=824) — i.e., the only two "upper route" sequences in the whole level are structurally identical to each other.

**Verdict:** Ground route — KEEP. `town-upper-1`/`town-upper-2` — **MODIFY** (vary height or width between the two decks so Zone B's upper route reads differently from Zone E's, rather than being the same shape twice in one level).

### Zone C — Café Atas Angin (x: 2200–3100)

**Geometry:** Continuous ground. `cp1-cafe` checkpoint at 2750. Optional `cafe-roof` (2700-2880, y824) via ladder at 2720, one collectible.

**Player behavior:** Walk to checkpoint (auto-triggers on proximity), optionally detour up a 176px ladder for one coin, continue.

**Design quality:** This zone's entire *identity* is currently "a sign and a checkpoint." There is no geometry distinguishing "arriving at a landmark" from "walking down an empty street" except the checkpoint trigger itself and a text toast that fades after 2.6 seconds. Per the prior pass's explicit instruction ("keep Café as simple landmark, no fake building"), this was a deliberate simplification — but the audit's job is to report that the *result* is that Café Atas Angin currently has no distinguishing geometry at all, only a label.

**Verdict:** Checkpoint position — KEEP (matches planning map). Zone identity — **INVESTIGATE**: the "no fake buildings" constraint is correct, but the zone needs *some* geometric distinguishing feature (even a single raised curb, bench-height platform, or distinct ground texture run) to read as a landmark rather than a mid-street waypoint. This needs a design decision, not just more blocks.

### Zone D — Bengkel Fungsi (x: 3100–4300)

**Geometry:** Continuous ground 3100→3850. `p1-terminal` (machine) at 3750. `workshop-gate` 3850-4300 (closed until solved).

**Player behavior:** Walk ~650px of flat ground from the zone boundary, reach the machine, solve Puzzle 1, cross the now-open gate.

**Design quality:** This is the **largest confirmed "empty stretch"** in the level by a clear margin: **from the last Zone C content (`cafe-roof` end at x=2880) to the machine (x=3750) is 870px of plain, unbroken, flat ground with nothing on it** — no collectible, no platform, no visual event. The technical map (`level-v5-current-map.png`) makes this directly visible as the widest gap between any two markers on the entire diagram.

**Verdict:** Machine + gate position — KEEP (verified correctly gated, not bypassable: gate width 450px vs 217px measured max jump, confirmed). The 870px approach corridor — **REMOVE/MODIFY**: this is the single most repetitive, purely-filler stretch in the level and the strongest concrete evidence for the "terrain feels patched/empty" complaint.

### Zone E — Deretan Bumbung (x: 4300–6150)

**Geometry:** Ground `[4300,5650]` (lower route). Upper route: `roof-e1` (4750-5000, y824) —128px jump— `roof-e2` (5128-5378, y824), ladder up at 4800, ladder down at 5350. `p2-terminal` at 5570. `rooftop-gate` 5650-6150.

**Player behavior:** Same shape as Zone B's upper route (see above — structurally identical). Lower route walks straight under it. Machine sits past the upper route's ladder-down, gate follows immediately.

**Design quality:** This is the **widest zone by x-range** (1850px, vs. 1100-1200px for most others) but contains only two decks total — by far the lowest content-density-per-pixel of any zone. Combined with being a structural repeat of Zone B's upper route, this is the zone most responsible for the "repetitive, empty" impression, despite being labeled the "main platforming" zone in both the planning map and prior briefs.

**Verdict:** Gate/machine — KEEP (correctly gated, verified). `roof-e1`/`roof-e2` pair — **MODIFY** (needs to differ from Zone B's pair — different height tier, a third element, or a genuinely different traversal verb, e.g. the "moving-platform candidate" suggested in this brief's own §12). The 1850px zone width itself — **INVESTIGATE**: either the zone is too wide for its current content density, or it needs roughly 2-3x the current platform count to justify being the level's advertised "main platforming" section.

### Zone F — Bukit Tanjung & Gua (x: 6150–6800)

**Geometry:** Ground `[6150,6800]`. Optional `gua-alcove` (6400-6550, y824) via ladder at 6460 (same ladder both directions). `cp2-bumbung` at 6200. Main route: ladder at 6720 up to `hill-plateau` (6700-7400, y824, continues into Zone G). `cp3-bukit` at 6780 (on the plateau).

**Player behavior:** Checkpoint, optional cave detour (2 coins), climb the one mandatory ladder onto the plateau, second checkpoint.

**Design quality:** This is the best-composed zone in the level: a genuine optional branch (cave) that doesn't block the main route, visually distinguished (muted tint, explicit "Gua (pilihan)" label), with its own reward, immediately followed by the one mandatory vertical traversal moment in the back half of the level.

**Verdict:** All geometry — **KEEP**. This zone should be the template for what Zones C and D need (a real optional branch + a clear single purpose), not the other way around.

### Zone G — Jambatan Sungai & Destinasi (x: 6800–7400)

**Geometry:** `hill-plateau` continues through this zone (shared with F). `p3-terminal` at 6820. `final-gate` 6900-7250. `GOAL` at 7330. One collectible near the goal.

**Player behavior:** Solve Puzzle 3, cross the bridge, reach the flag.

**Design quality:** Short, clear, and correctly climactic — the gate crossing immediately precedes the goal with no filler after it. The "bridge over a river" framing from the planning map is not visually represented (no water asset exists in the Kenney pack — confirmed in §8), so mechanically this reads identically to the other two gates.

**Verdict:** KEEP (functionally correct, clear ending). Visual distinction from the other two gates — **INVESTIGATE** (asset-limited, see §8).

---

## 5. Gameplay Rhythm Audit

| Sequence | Zone | Player Action | Mechanic | Approx. Duration (natural play, est. from measured speed) | Engagement Purpose |
|---|---|---|---|---|---|
| 1 | A | Walk + jump `FIRST_GAP` | Jump | ~3s | INTRODUCE (movement, jumping) |
| 2 | A | Walk ~560px to Zone B | None | ~2s | *(dead time — no new content)* |
| 3 | B | Ladder up / jump / ladder down (upper route, optional) OR walk straight through (lower route) | Ladder, jump, route choice | ~4-6s if upper taken | PRACTICE (ladders) / CHOICE |
| 4 | C | Walk to checkpoint, optional roof detour | Checkpoint | ~3-5s | REST (per the brief's own target rhythm) |
| 5 | D | Walk ~870px to machine | None | ~3s | *(dead time — longest in the level)* |
| 6 | D | Solve Puzzle 1 | Math (output-from-input) | ~15-30s (reading/typing) | MATH PUZZLE |
| 7 | D→E | Cross opened gate | Bridge crossing | ~2s | REWARD (visible world change) |
| 8 | E | Ladder up / jump / ladder down (upper route) OR walk under (lower route) | Ladder, jump — **same shape as step 3** | ~4-6s | *(intended as VARIATION, reads as REPEAT of step 3)* |
| 9 | E | Solve Puzzle 2 | Math (input-from-output) | ~15-30s | MATH PUZZLE |
| 10 | E→F | Cross opened gate | Bridge crossing | ~2s | REWARD |
| 11 | F | Optional cave detour | Ladder, 2 collectibles | ~4-6s | EXPLORATION (the best-executed instance of this beat) |
| 12 | F | Climb to plateau | Ladder | ~2s | CHALLENGE (mild) |
| 13 | G | Solve Puzzle 3 | Math (input-from-output) | ~15-30s | FINAL CHALLENGE |
| 14 | G | Cross final gate, reach flag | Bridge crossing, goal | ~3s | COMPLETION |

**Comparison to the target rhythm (INTRODUCE → PRACTICE → CHALLENGE → REST → MATH PUZZLE → REWARD → VARIATION → EXPLORATION → FINAL CHALLENGE → COMPLETION):**

- INTRODUCE, PRACTICE, REST, MATH PUZZLE ×3, REWARD ×3, EXPLORATION, FINAL CHALLENGE, COMPLETION — all present and identifiable.
- **CHALLENGE is weak**: nothing in the level asks for more skill than "one 128px jump" or "one ladder," repeated. There's no moment that's harder than the first jump in Zone A.
- **VARIATION is the clearest structural miss**: step 8 is supposed to be the "varied" platforming beat (per both this brief and the prior planning map's "Deretan Bumbung = platforming utama"), but it is geometrically identical in shape to step 3. A player who takes the upper route in both B and E experiences the same four inputs (up-ladder, jump, down-ladder, walk) twice with no new verb introduced between them.
- Two "dead time" stretches identified with coordinates (step 2: ~560px, step 5: ~870px) — these are moments where the player cannot anticipate anything because there is nothing to anticipate; they are also the two moments most likely to be perceived as "empty."

---

## 6. Camera & Viewport Audit

Measured via Playwright at three sizes (`camera-viewport-measurements.json`):

| Viewport | Game-frame size | Phaser logical viewport (w×648, h fixed) | Scroll overflow |
|---|---|---|---|
| 1366×768 | 1318×589px | 1453×648 | 0 / 0 |
| 1920×1080 | 1752×901px | 1261×648 | 0 / 0 |
| 1365×633 (short-wide) | 1317×454px | 1885×648 | 0 / 0 |

No page scrolling at any size (confirmed, both directions, 0px overflow). The frame now fills the entire `.game-stage` box at every size (prior pass's fix, re-confirmed here).

**Why the upper viewport can appear empty, confirmed from source + screenshots (not guessed):**

1. `cameras.main.startFollow(player, true, .14, .16, -85, 60)` — the `+60` vertical offset means the camera centers **60px below the player**, which biases the frame to show more space *above* the player than below (deliberate — this is a common "see more of what's ahead/above for jumps" pattern, source-confirmed, not accidental).
2. World content is concentrated in a narrow vertical band: ground at y=1000, decks at y=824 or y=650 at most, nothing above y≈650 anywhere in the map except label text. Camera bounds top is y=220 (`cameras.main.setBounds(0, 220, ...)`), meaning the camera is *permitted* to show space from y=220 upward — 430px above the highest real platform — if the follow math puts it there.
3. At ground level (player.y≈970-1000, the majority of playtime, per the rhythm audit above — most zones are ground-level corridors), the followed camera center sits around y≈1030-1060, with the 648-unit-tall logical viewport extending roughly 324 units each way from that center — i.e., comfortably covering from ~y706 to ~y1354. Since nothing exists above y≈650 in most zones, a large fraction of that visible band (above the player, up to the visible top) is necessarily empty sky, confirmed directly in multiple zone screenshots (e.g. `zone-D-bengkel-fungsi-before-solve.png`, `zone-E-deretan-bumbung.png` — both show roughly the top 60% of the frame as plain background).

This is **not a camera bug** — it's a direct, measurable consequence of (a) the follow offset and (b) the world's own vertical content being concentrated near the bottom third of the camera's bounds. Fixing the *visual* symptom without changing geometry would mean reducing the follow offset or raising `GROUND_RANGES`' typical y — both are geometry/camera trade-offs for Blueprint V5 to decide, not implemented here.

---

## 7. Kenney Asset Inventory

Actually loaded and in active use (confirmed via `grep` against `game.js`, cross-checked against `assets/manifest.json`):

| Category | Keys in use | File |
|---|---|---|
| Ground/terrain | `kenney_ground_left/center/right`, `kenney_deck_left/center/right`, `kenney_block_center` | `Sprites/Tiles/Default/terrain_stone_*.png` |
| Ladders | `kenney_ladder_top/middle/bottom` | `ladder_*.png` |
| Bridge (gate-solved surface) | `kenney_bridge` | `bridge.png` |
| Interactive: machine | `kenney_lever`, `kenney_lever_left` | `lever.png`, `lever_left.png` |
| Interactive: checkpoint | `kenney_sign` | `sign.png` |
| Interactive: goal | `kenney_flag_a`, `kenney_flag_b` | `flag_green_a/b.png` |
| Collectible | `kenney_coin` | `coin_gold.png` |
| Decoration | `kenney_bg_clouds`, `kenney_block_blue` (cave accent only) | `background_clouds.png`, `block_blue.png` |

**Loaded in `manifest.json` but confirmed UNUSED in `game.js`** (dead weight, minor P2 cleanup item): `kenney_door_closed`, `kenney_door_closed_top` (left over from the removed fake-building code), `kenney_deck_overhang_left/right`, `kenney_block_left/right`, `kenney_hud_coin`.

**Can the pack represent each zone's identity?**

| Zone need | Kenney New Platformer Pack support | Verdict |
|---|---|---|
| Residential (A) | No house sprites exist in this pack. | **Cannot** represent architecturally; terrain-only is the realistic ceiling. |
| Small-town awnings (B) | No awning/shop sprites. | **Cannot.** |
| Café landmark (C) | No café/sign-with-text sprites (the generic `sign.png` is a blank directional post, not a café sign). | **Cannot** represent as a recognizable café; can only mark a *location*. |
| Function workshop (D) | `lever.png`/`lever_left.png` cover the interactive part well; no "workshop building" sprite. | **Partial** — mechanism yes, architecture no. |
| Rooftop traversal (E) | Terrain blocks + ladders fully cover this — it's literally what the pack is designed for. | **Full support.** |
| Hill/cave (F) | No cave-mouth or rock-face sprite; `terrain_stone` blocks can suggest a ledge but not a cave opening. | **Partial** — current cave is a tinted ledge, not a visually distinct cave. |
| Final bridge (G) | `bridge.png` exists and is in use; no water/river tile exists anywhere in the pack. | **Partial** — bridge yes, river/water no. |

**Conclusion, stated plainly:** the New Platformer Pack is a generic terrain/mechanism kit. It can fully support Zone E's stated purpose (rooftop platforming) and reasonably supports D and G's *mechanisms* (lever, bridge), but it cannot represent "a café," "a house," "a small town," or "a cave" as recognizable architecture under any composition — this was already correctly concluded in the prior pass (removing the block-tower "buildings") and this audit confirms that conclusion with a direct category-by-category pass rather than re-asserting it.

---

## 8. Mathematics System Audit

| | Puzzle 1 | Puzzle 2 | Puzzle 3 |
|---|---|---|---|
| Formula | f(x)=2x+1 | f(x)=3x−2 | f(x)=4x−3 |
| Task | Find f(3) | Given f(x)=10, find x | Given f(x)=17, find x |
| Correct answer | 7 | 4 | 5 |
| Trigger position | (3750, 1000) | (5570, 1000) | (6820, 824) |
| Interaction range | `|x-t.x|<115 && |body.bottom-t.feet|<48` (identical formula for all three, confirmed in `nearestTerminal()`) | same | same |
| Answer validation | Regex-based numeric parser (`parseNum`), rejects empty/NaN/non-numeric; confirmed via test (`each puzzle accepts only its correct answer`) | same | same |
| Hints | 3-level, puzzle-specific text, independently tracked per puzzle id (`hintLevels[puzzle.id]`) | same structure | same structure |
| Feedback | Shows the actual wrong computed value (`wrongMessage`), not a generic "wrong" | same | same |
| Gate/bridge activation | `solvedGates.add(gate)` → `gateArt()` + `platform()` called only on correct answer (confirmed: never called on wrong/invalid input, by code inspection of `answer()`) | same | same |
| Camera visibility of mechanism | Machine and its gate are within ~100-450px of each other in all three cases — both visible in the same camera frame at ground level (confirmed in zone screenshots) | same | same |
| Persistence after respawn | `solvedGates` is a `Set` on the scene instance, never cleared by `respawn()` — confirmed by code inspection (`respawn()` touches only player position/camera/controls) | same | same |
| Accessible from intended route | All three terminals sit directly on the continuous ground/plateau that the main route already walks through — no detour required to reach any machine | same | same |
| Single-dialog guarantee | `openPuzzle()` returns early if `this.mode!=='playing'` or no terminal in range — a second `E` press while a dialog is already open cannot trigger a second `showModal()` (native `<dialog>` + mode check) | same | same |

**All three puzzles are correctly, identically, and safely integrated.** The only asymmetry is *type*: Puzzle 1 asks for an output given an input; Puzzles 2 and 3 both ask for an input given an output — i.e., two of the three puzzles are the same cognitive task with different numbers. This is a content-variety note for Blueprint V5, not a bug.

---

## 9. Checkpoint & Recovery Audit

| | CP1 | CP2 | CP3 |
|---|---|---|---|
| Position | (2750, 1000) — Café | (6200, 1000) — start of Zone F | (6780, 824) — on the hill-plateau |
| Activation | Proximity (`|x-cp.x|<70 && |bottom-cp.feet|<5 && blocked.down`), **only the next unreached checkpoint in order is ever checked** (`CHECKPOINTS[checkpointIndex+1]`) — cannot be skipped or re-triggered out of order | same mechanism | same mechanism |
| Solved-puzzle persistence | Confirmed — `solvedGates` and `coinsFound`/collected coin sprites are scene-level state untouched by `respawn()` | — | — |
| Respawn behavior | `CHECKPOINTS[checkpointIndex] \|\| SPAWN` — always resolves to *somewhere* safe, never undefined | — | — |
| Manual reset (`R`) | Same `respawn()` function as automatic fall-triggered respawn — confirmed identical code path | — | — |

**Unnecessary-respawn check (the specific thing this brief asks to verify, not fix):**

Current hazard condition (`game.js:384-385`):
```js
const inOpenGate = GATES.some(g => !this.solvedGates.has(g.id) && this.player.x>g.x && this.player.x<g.x+g.width);
if(this.player.y>1060 || (inOpenGate && body.bottom>900)) {this.respawn();return;}
```
This was rewritten in a prior pass specifically to fix a prior bug (a blanket `x>1160` trip-wire that misfired on ordinary ground). Under the **current** geometry, I traced every `GROUND_RANGES`/`DECKS` combination against this condition and found no case where standing on real, intended terrain satisfies `inOpenGate`. The only way to trigger a respawn is (a) falling past `y=1060` (below all world geometry — always a genuine fall), or (b) being between an *unsolved* gate's x-bounds with `body.bottom>900` (i.e., inside the gate's own gap, falling through it). **No unnecessary-respawn case was found in the current build** — this appears resolved from the version that prompted the original complaint.

---

## 10. Technical World Overview

- **`level-v5-current-map.png`** — full-level technical schematic, generated programmatically from the exact coordinate arrays above (script: non-repo, scratchpad-only, output saved here). Non-uniform scale (x:0.21, y:0.36) stated in the image itself, with a coordinate axis and a full legend distinguishing solid ground, decks, ladders, closed gates, machines, checkpoints, collectibles, spawn/goal.
- **`level-v5-proposed-map.png`** — same current geometry, with additive red-circle annotations marking where Blueprint V5 (§12 below) recommends change vs. keep. **No geometry was moved to produce this image** — it is the current map plus proposal notes, exactly as instructed ("clearly marked as not implemented").
- **Zone screenshots** (`screenshots/zone-A.png` through `zone-G-completion.png`): 9 gameplay-sized (1440×900 viewport) screenshots captured via real natural keyboard input (the same walk/jump/climb/solve helpers as the project's own `probe.py`, not `body.reset()` teleportation, except where explicitly noted as isolated-measurement setup in §2). These are not zoomed-out composition shots — they show what a player's screen actually looks like at each beat.

---

## 11. Current Build Findings (Summary)

**What is wrong, and why, grounded in evidence above:**

1. Two confirmed "dead" stretches with exact coordinates: Zone A post-jump (≈540-990px of plain ground) and Zone D's machine approach (≈2880-3750px, 870px, the single largest empty stretch in the level) — §4, directly visible in `level-v5-current-map.png`.
2. Zone B's and Zone E's "upper routes" are structurally identical (same height, same jump distance, same ladder pattern) — the level's only two platforming sequences repeat each other rather than varying — §4, §5.
3. Café (C) has no distinguishing geometry, only a checkpoint trigger and a fading text toast — §4.
4. The asset pack genuinely cannot represent café/house/cave architecture (confirmed category-by-category, §8) — any future attempt to "build" these from terrain blocks will reproduce the tower-silhouette problem a prior pass already removed.
5. Camera's large empty-sky appearance is explained, not mysterious: it's the direct, confirmable result of a `+60` vertical follow offset combined with all real content sitting in a narrow band near the bottom of the camera's permitted vertical range — §6.
6. No unnecessary-respawn case currently exists in the traced hazard logic — this specific complaint appears already resolved — §9.

---

## Deliverable file index

- `level-v5-audit.md` — this file.
- `level-v5-geometry-inventory.csv` — full coordinate table.
- `level-v5-current-map.png` — technical map, current geometry.
- `level-v5-proposed-map.png` — technical map, current geometry + proposal annotations.
- `level-v5-blueprint.md` — proposed Level Design Blueprint V5 (not implemented).
- `level-v5-risk-register.md` — risks and implementation order, P0/P1/P2.
- `movement-measurements.json` — raw natural-input movement probe data.
- `camera-viewport-measurements.json` — raw camera/viewport probe data.
- `screenshots/` — 9 real-playthrough gameplay screenshots, one+ per zone.
