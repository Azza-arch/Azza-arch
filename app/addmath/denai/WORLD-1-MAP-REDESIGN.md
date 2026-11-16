# World 1: map redesign V2 (design only, no game code)

Updated 16 Nov 2026 on branch `claude/denai-map-masterplan-v2` (based on `claude/denai-w1-environment` @ `ec2aa69`; **not merged to `main`**).
Status: **general direction approved by the owner; game code implementation NOT yet approved.**

Blueprints (top = CURRENT geometry read directly from code, bottom = V2 PROPOSAL + list of purposes):
`design/blueprints/w1-l1.svg`, `w1-l2.svg`, `w1-l3.svg`, `w1-transitions.svg` (PNG next to each one).
Each blueprint marks: main route (green), optional routes **P#** (dashed teal), return loops **G#** (dotted pink),
checkpoints (red flags), secrets (★), **∑ maths mechanisms** (purple), **non-maths interactions** (green squares),
**⚠ R#** places where a player could get stuck or take a wrong turn. Below each proposal panel, every P/G/R is listed with its purpose.
Proposal data: `design/proposals.mjs`; generator: `node design/blueprint.mjs`.
The main-route check in the design data (rise ≤ 1.5 tiles, gap ≤ 3 tiles) passes for all levels (`route-check.json`).
This is a geometry check of the design only, **not** a gameplay test.

Fixed engine: speed 280, jump peak 92.3 u (1.71 tiles), running reach ≈ 210 u (3.9 tiles), 1 tile = 54 u. The map is **not** made wider: every level keeps its current width.

## 0. Owner decisions (16 Nov)
| Item | Decision |
|---|---|
| 1-1 | Approved: garden hill, stone arch over the root path, construction area, jetty. The sawmill stays optional. |
| 1-2 | Approved: ridge, waterwheel, bank cave, canopy, dam. The boat ticket challenge stays optional. |
| 1-3 | Approved: stone stairs, aqueduct, cistern, cave behind the waterfall. The thermometer stays optional, with its own context. |
| 2-1 | Blueprint only until Station A has been assessed (maths, collision, game feel). |
| Length | Do not widen maps to reach a play time. Prioritise meaningful activities. |

## 1. Study of the current maps (summary; see the top panels of the blueprints)
Repeated structures: flat rectangles down to the floor at almost the same height; "deck on two posts + ladder" appears 8 times; water as a slot between two rectangles; optional routes go up and come back down the same way; nothing passes underneath except the 1-1 root path.
Already validated and kept: every puzzle, bridge, checkpoint ID, coin ID, secret, the treehouse, the stone gate and the three-seal gate.
Reference maps (Wild Adventure): the files are **not** in the repo or this session; only principles from my earlier written interpretation in `MASTER-PLAN.md` were used. No geometry was copied.

## 2. Continuity specification 1-1 → 1-2 → 1-3
Blueprint: `design/blueprints/w1-transitions.svg` (the last 18 tiles of the previous level beside the first 16–20 tiles of the next level).

**Geographic logic:** World 1 = forest edge (1-1, a raised kampung plateau) → **down** into the river valley (1-2) → **up the river** to the ruins at the source (1-3). The water flows from the ruins (cistern → aqueduct → waterfall) down to the valley river, so the direction of travel is believable.

| | Exit | Entry | Matching rule |
|---|---|---|---|
| 1-1 → 1-2 | Taman Gate on the stone plinth (row 22, x 105–108), "Lembah Sungai →" sign at x 109, land drops away to the right, the river visible below | 1-2 starts on a ridge at **the same height (row 22)**; the 1-1 gate is visible small on the left (decoration, no collision); three 1-tile steps down to the river bank | same height at the seam; same oak/pine trees; same timber gate; river seen from above before reaching it |
| 1-2 → 1-3 | After the final bridge: old stone stairs up to the flag platform (row 22) + a **stone marker**; the river narrows to the right into a stream | 1-3 starts beside **the same stream** with **the same stone marker**; the ruins appear on the right | ruin stone (l3-stone) first appears on the 1-2 dam; same water feature; same forest trees |

Note: rows are numbered per level. 1-3 is a taller world (floor 2106), so its starting ground is at row 32. In screen terms, both seams start "on the bank by the water", so the camera shows the same scene.
Each level stays a separate scene with separate progress. The transition is visual only (the exit decoration in one level + the entry decoration in the next), with no shared loading.

## 3. Level 1-1 · Jejak Taman Fungsi (intro, target 8–12 min)
Blueprint `w1-l1.svg`. Width unchanged (110 tiles).

**Main route:** kampung → garden hill (crest at row 22) → drop into the root tunnel → yard (step over the log stack) → bridge machine f(x)=2x+1 → five hops at Tebing Berliku → treehouse ground → root dip → gate.
**Optional routes (each one has a purpose and rejoins the main route):**
| | Purpose | Back to the main route |
|---|---|---|
| P1 house veranda | starting note (controls) + 1 coin | step down to the field |
| P2 crate ledge | 3 coins, reward for the crate puzzle | drop back into the field |
| P3 over the stone arch | the 3 canopy coins (**same position: the arch top is at y 1080, the same as the old deck**) + an early view of the crane and the gap | land in the construction yard |
| P4 jetty → island | Jetty Chest (new secret) + a shortcut past two hops; **needs the sawmill** | ladder up to the rest cliff (main route) |
| P5 treehouse → rope bridge | Function Note + 3 coins | drop into the east forest |

**Return loops:** G1 root loop (yard → tunnel → ladder → over the arch → yard); G2 jetty loop (far bank → jetty → island → rest cliff → jump back); G3 treehouse loop.
**Interactions:** maths: the bridge machine (main), the sawmill g(b)=3b−1 (optional). Non-maths: push the crate onto the plate, probe, **crane** (lift a plank bundle to the bridge mouth: a short physical step before the machine), veranda note, rope bridge.
**Risks ⚠:** R1 crate stuck (C already resets it); R2 falling into the tunnel: the ladder at x 22.5 must be visible from below; R3 jumping the gap before the bridge exists (gap > reach, respawn; already the case); R4 jetty ladder before the jetty is built: hide it or put up a sign; R5 the island mistaken for the main route: "Pulau (pilihan)" sign; R6 the rope bridge needs an opening in the branch wall (collision change).
**Applied maths:** see §6 (bridge decking 2n+1; sawmill 3b−1).

## 4. Level 1-2 · Jambatan Berkembar (intermediate, target 12–16 min)
Blueprint `w1-l2.svg`. Width unchanged (90 tiles).

**Area continuity:** ridge (looking down at the river) → stepped garden → **twin pump station + waterwheel** (on the river bank) → twin bridge over the river → islands in the middle of the river (+ boat stall) → bank and **bank cave** (under the island) → **canopy giant** → **stone dam** (final station) → final bridge → old stone stairs. Each area sees the next one: the river runs the whole length, and the dam holds back the river leading upstream.

**Route variety:**
| Kind | Where |
|---|---|
| Horizontal | the river terraces, islands (low hops), the dam |
| Vertical | P1 upper twin deck (ladder up, other ladder down); P2 canopy giant up to the lookout, then the descending rope bridge |
| Underground | P3 bank cave: the **floodgate lever** lowers the water level, revealing the ledge and the cave mouth; exit via the ladder at x 57.5 to the bank |

**Optional routes:** P1 upper twin deck (observing that f∘g ≠ g∘f + coins); P2 canopy → rope bridge (canopy observation, lands in the dam yard); P3 bank cave (secret); P4 boat stall (**optional** ticket challenge, reward: a raft shortcut to the cave; not required).
**Loops:** G1 underground (island → cave → bank → jump back to the island); G2 canopy (dam yard → back to the giant tree → up → rope bridge → dam).
**Interactions:** maths: twin pump station (main), dam station (main), boat ticket (optional). Non-maths: waterwheel lever (starts the station), floodgate lever, descending rope bridge, stone marker (story board), valley view.
**Risks ⚠:** R1 ridge descent (1-tile steps, can be climbed back up); R2 the cave is flooded before the floodgate is opened (show the water level clearly); R3 falling between islands (respawn; already the case); R4 the stall must not block the path; R5 the rope bridge lands near the dam panel (avoid opening it by accident).

## 5. Level 1-3 · Gerbang Songsang (World 1 finale, target 15–20 min)
Blueprint `w1-l3.svg`. Size unchanged (104 × 39).

**Clear gameplay relationship:** the **inverse machine's meter only works once water is flowing.** The water comes from the **cistern at the top of the tower**, through the **aqueduct**, to the machine yard. So the main route **climbs the tower** (stone stairs → gallery → stone ledge → lookout), opens the **cistern valve**, crosses the **aqueduct** (upper route), and drops into the machine yard. The old ground route through the courtyard becomes the **return / alternative** route (P1, G1).
The waterfall comes out of the same water channel, falls into the gorge, and the seal bridge crosses it. The cave under the bank (P4) shows the waterfall from inside.

**Ladders: 5 → 2.** The stone stairs replace the ladders at x 17, 22 and 31; a stone ledge (x 35–36.5, row 23) replaces the tower ladder at x 35. Remaining: the gate ladder (x 85) and the cave ladder (x 68.5), and they are not next to each other.
**Existing pits as entrances:** the 1-tile pits between the ruins and the courtyard (x 24–25) and between the bank and the gate approach (x 75–76) already exist and currently lead nowhere. In V2, they are shafts into the hidden chamber and the cave, giving a consistent visual language ("the ruin floor has collapsed").

**Optional routes:** P1 lower courtyard (return route + coins); P2 root balcony (ruin inscription); P3 hidden chamber (**old thermometer**: *context*: a gauge from an old waterworks technician's workshop that uses Fahrenheit; set the warm pool temperature to open a chest; optional, not required for the seals); P4 cave under the bank (secret); P5 walk over the gate (inverse tablet).
**Loops:** G1 tower (stairs → cistern → aqueduct → machine yard → lower courtyard → back to the foot of the stairs); G2 cave (collapsed pit → cave → ladder → bank).
**Interactions:** maths: the inverse machine (main, seals 13/7/15), the thermometer (optional). Non-maths: the cistern valve, the flowing aqueduct, the two collapsed pits, the seal gate.
**Risks ⚠:** R1 falling into the pit (it now lands in the chamber and there is a way out); R2 reaching the machine before the valve is open: the machine shows "tiada aliran" and the dry aqueduct is visible; R3 missing the valve at the top: water arrow + sound; R4 the second pit now leads to the cave; R5 gorge (respawn; already the case).

## 6. Applied maths (details)
| Level | Mechanism | Inspiration | Model / variables / units | Domain & assumptions | Feedback | Objective |
|---|---|---|---|---|---|---|
| 1-1 main | bridge machine | bridge decking | P(n)=2n+1; n spans (count), P planks | n∈{0..6}; 2 planks per span + 1 end plank; **simplified fictional model** | n=2→5 "short by 2"; n=4→9 "2 extra" | evaluate, find the input (SP 1.1) |
| 1-1 optional | sawmill | sawmill | g(b)=3b−1; b logs, g usable planks | b∈{1..6}; 3 planks per log, 1 offcut lost | b=3→8 jetty falls short; b=5→14 extra planks on the bank | the same skill, as a production rate |
| 1-2 main | twin pump | two calibration stages | f(x)=2x+1, g(x)=x²; **explicitly fictional machines** | x∈{0..6} | the deck stops short / the lamp does not lock | composition, order matters (SP 1.2) |
| 1-2 optional | boat ticket | RM5 voucher + 10% service charge | p RM; v(p)=p−5, s(p)=1.1p; s(v(p))=1.1p−5.5, v(s(p))=1.1p−5 | p≥5; the 10% rate is **an example**, real rules vary | p=20: RM16.50 vs RM17.00 | composition models a sequential process |
| 1-3 main | inverse machine | valve meter | y=2x+3; x valve turns, y reading (**fictional unit**) | x∈{0..6}; image {3,…,15} | wrong x moves the deck to the wrong place | inverse, domain/image (SP 1.3) |
| 1-3 optional | thermometer | real °F gauge | F=1.8C+32; C=(F−32)/1.8 | C∈[20,45], 1 d.p., tolerance 0.1; 95→35, 86→30, 104→40 | the door stays shut; hint "F − 32 first" | the inverse of a real formula |

## 7. Migration plan: checkpoints, collectibles, progress and records
Principle: **IDs never change; only positions move. Old saves must load safely and are never deleted.**

| Data | Current key | Plan |
|---|---|---|
| 1-1 progress | `denai-save-v14`, `denai-profile-v1`, `denai-records-v14` (read-through in `campaign-store.js`) | Unchanged. The old checkpoint `cp-*` restores to the same ID; positions are revalidated. The crate, coins and canopy coins keep their IDs (the arch top is at the same height as the old deck, so the canopy coin positions stay). |
| 1-2 progress | `denai-campaign-v1` (schema 1) | Checkpoint `entry` moves to the ridge (same ID). The two coins in the entry area keep their IDs, new positions. `sanitizeRun` already filters by ID, so this is safe. |
| 1-3 progress | `denai-l3-campaign-v1` | The `ruins` and `machine` checkpoints keep their IDs; gallery coins are revalidated against the stairs. New state "valve open" is added to the run (default **open** for old saves that have already reached the machine, so no one loses progress). |
| New secrets (Jetty Chest, bank cave, chamber, cave) | — | New IDs, marked **bonus**: not counted in the old totals (15 coins + 2 secrets for 1-1), so existing achievements are unaffected. They are shown separately ("Bonus 0/2"). |
| Level version | — | Add `version` to the registry (`w1-l1@2`, …). Every new run records the version; a run in progress from v1 continues from the same checkpoint ID but is **marked v1**. |
| Local best time | `level.bestMs` (1-2), `denai-records-v14` (1-1) | Keep the old values as **"Klasik (v1)"**; the new version starts a new record. Nothing is deleted. |
| PlayFab leaderboard 1-1 | statistic + leaderboard `denai_l1_time` | **Keep** `denai_l1_time` as the "Klasik (v1)" board. Create `denai_l1_time_v2` (new statistic + leaderboard, Min, Ascending) for the new geometry. The UI shows a tab "Versi semasa / Klasik v1". A v1 run is only submitted to the v1 board. Review `minPlausibleMs` (20 s) against the new route. **The secret key is never in the client.** |

## 8. Ranking
| Priority | Change |
|---|---|
| Essential | 1-3 stairs + cistern + aqueduct (valve relationship); 1-1 stone arch; the 1-1→1-2 and 1-2→1-3 transitions; versioned migration and leaderboard |
| Desirable | 1-1 jetty + sawmill; 1-2 bank cave + floodgate; 1-2 descending rope bridge; 1-3 thermometer chamber and cave; boat ticket |
| Future | checkpoint travel; 1-1 kampung NPCs; live karst/cave art |

## 9. Level design template
1. Topic + SP (DSKP code). 2. Geography + continuity (entry/exit, height at the seam). 3. Geometry pattern (A–E) + blueprint from data.
4. Main route + ≥ 2 optional routes (each with a purpose and a way back) + ≥ 1 return loop. 5. Interaction table (why, how, change, maths?, route, wrong/incomplete).
6. Applied maths spec (inspiration, model, variables + units, domain, assumptions, control, effect, reasoning, feedback, objective; state if it is fictional).
7. Pacing (traversal, exploration, maths, problem-solving, secrets, final). 8. Replay (variants, secrets, versioned records; no lives).
9. ⚠ Places where a player could get stuck or take a wrong turn + mitigation. 10. Migration of IDs/saves/records. 11. Real browser test after implementation.
