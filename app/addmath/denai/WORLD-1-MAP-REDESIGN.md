# World 1: map redesign (design only, no code)

Written 16 Nov 2026 on branch `claude/denai-map-masterplan-v2` (from `claude/denai-w1-environment` @ `ec2aa69`; **not merged to `main`**).
Nothing in this document has been implemented. All geometry below is a proposal for review.

Blueprints (each one shows CURRENT geometry read straight from the code, with the PROPOSAL underneath):
`design/blueprints/w1-l1.svg`, `w1-l2.svg`, `w1-l3.svg` (PNG next to them). Proposal data: `design/proposals.mjs`.
Generator: `node design/blueprint.mjs`. It also checks every main-route hop in the design data
(rise ≤ 1.5 tiles, gap ≤ 3 tiles). Result: all four main routes pass (`design/blueprints/route-check.json`).
This is a geometry check of the design, **not** a gameplay test.

Fixed engine constraints (not to be changed): run 280 u/s, jump peak 92.3 u (1.71 tiles),
running reach ≈ 210 u (3.9 tiles), 1 tile = 54 u, ladders, one-way decks, coyote/buffer as now.

---
## 1. Study of the existing maps (Phase 1)

| | 1-1 Jejak Taman Fungsi | 1-2 Jambatan Berkembar | 1-3 Gerbang Songsang |
|---|---|---|---|
| Size | 110 × 30 tiles (5940 u) | 90 × 30 tiles (4860 u) | 104 × 39 tiles (5616 u) |
| Main route | meadow → down the root lane → yard → **7-plank bridge** → 5 hops over water → treehouse ground → plinth | entry → garden → terrace → **twin bridge** → islands → bank → final yard → **final bridge** → flag | stream → ruins → courtyard → upper ruins → machine yard → **seal bridge** → bank → gate approach → gate court |
| Optional routes | crate ledge (crate puzzle), canopy walk (ladder), treehouse (ladder, 3 decks) | 2 upper decks (2 ladders), canopy giant + lookout (ladder) | ruin galleries (4 ladders), gate arch walk (1 ladder) |
| Silhouette | flat blocks at rows 22–26; one dip (root lane); five water columns | flat blocks at rows 22–24 with water slots between them | flat blocks at rows 29–32 with tall wooden scaffolding on top |
| Rhythm | walk–walk–puzzle–hop ×5–walk | walk–puzzle–hop ×2–walk–puzzle | walk–(optional climb)–puzzle–walk |
| Verticality | 5 rows of variation; optional climbs to row 17 | 3 rows; optional climbs to row 19 | 4 rows on the main route; optional climbs to row 22 |
| Mathematics | f(x) = 2x+1 → 7 planks (find the input) | f∘g and g∘f, targets 9/25 and 19/49 | inverse of y = 2x+3 on {0..6}, seals 13, 7, 15 |
| Identity | garden → construction yard → cliffs → treehouse | river + two machines | ruins + waterworks + stone gate |

**Repeated structures (the "looks the same" problem)**
1. Every level is a chain of **flat rectangles to the floor** at almost the same height (1-1 rows 22–26, 1-2 rows 22–24, 1-3 rows 29–32).
2. **Deck on two posts + a ladder in the middle** appears 2× in 1-1 (canopy), 2× in 1-2 (upper decks) and 4× in 1-3 (galleries). The same shape, everywhere.
3. **Water = a slot between two rectangles** in all three levels.
4. Optional areas always go **up from the main route by ladder and back down the same way**. There is no loop that uses a different path.
5. The main route never goes **under** anything except the 1-1 root lane.

**Keep (validated and working)**
- 1-1: the crate puzzle and start ledge; the root-lane secret; the 7-plank station and bridge (x 47–53); the Tebing Berliku hops; the treehouse and its walls; the flag plinth.
- 1-2: both stations, both bridges, the double-deck twin bridge, the islands, the canopy giant.
- 1-3: the inverse machine and three seals; the seal bridge; the spring → pipe → waterfall; the stone gate; the gate arch walk.
- All checkpoint IDs, coin IDs, save keys and puzzle logic.

**Redesign**
- 1-1: the canopy walk (two identical post-and-deck frames); the flat garden; the flat yard.
- 1-2: the flat entry (no sense of arriving from 1-1); the empty island area; the island → final yard stretch.
- 1-3: four ladders in a row in the ruins; the scaffolding (it reads as wood, not as a ruin); waterworks that are cut off from the ruins; the hidden spaces that are missing.

**Reference maps (Wild Adventure).** The five reference images are **not in the repo or in this session**. All that remains is my earlier written interpretation in `MASTER-PLAN.md` (hollow cave with rock islands; hilly horizontal route with floating platforms; packed rooms and corridors; winding vertical shaft; floating islands with jump arcs). The principles used here come from that interpretation only: large connected landforms, upper and lower routes that rejoin, overhangs, shafts and return loops. **No coordinates or layouts were copied.** For an exact geometry analysis, please upload the images again.

---
## 2. World 1 continuity (Phase 4)

World 1 is one region: **the edge of the forest → the river valley → the ancient ruins upstream.** The terrain runs **downhill into the river in 1-2, then climbs again into the ruins in 1-3.**

| Transition | Exit of the previous level | Entrance of the next level | What carries over |
|---|---|---|---|
| 1-1 → 1-2 | The Taman Gerbang (posts + lintel, now built) on the plinth; a sign "Ke Lembah Sungai →"; on the right edge, the land drops away and a river glints below | 1-2 starts on a **ridge (row 22)**. The 1-1 gate stands small on the far left, then a switchback path goes down to the river | the same timber gate, the same pine and oak, the river first seen from above |
| 1-2 → 1-3 | After the final bridge: **old stone steps** and a stone marker (the first ruin stones in the game), beside the dam built from the same stone | 1-3 starts beside **the same river, narrowing into a stream**, with the same stone marker; the ruins appear on the right | the river, the ruin stone (`l3-stone`), the water mechanisms (water wheel → dam → aqueduct) |

Rules: the green background and palette stay the same throughout World 1. The ruin stone only appears from the end of 1-2. Each level stays a separate scene with its own progress (`denai-campaign-v1`, `denai-l3-campaign-v1`, `denai-save-v14`).

---
## 3. Level 1-1 · Jejak Taman Fungsi: proposal

Blueprint: `design/blueprints/w1-l1.svg`. Size unchanged (110 tiles). **Intro level, target 8–12 minutes.**

**Geometry**
- **Kampung (x 0–15):** a **house on stilts** with a veranda (deck row 22, x 0–3) behind the spawn. Flat ground stays (the crate puzzle needs it, so the ledge stays only reachable from the crate).
- **Garden hill (x 15–20):** the flat step becomes a hill with a crest at row 22 (up 1, up 1, down 1).
- **Root stone arch (x 23–32, NEW):** the two post-and-deck frames are replaced by a **natural stone arch** (block rows 20–23). Trees grow on top; the root lane passes through the tunnel underneath. The upper route walks over the arch and drops into the yard. The ladder moves to the west face of the arch (x 22.5).
- **Construction yard (x 33–47):** a **stack of logs** (block 1 tile high, x 36–38) breaks up the flat yard. A **crane** marks the bridge mouth. A **sawmill (optional)** stands at x 34.5.
- **Tebing Berliku (x 53–78):** the main hops stay. NEW: an optional **jetty** (x 58–65, row 27), an **island** (x 65–68), and two ladders (far bank x 58.5; rest cliff x 68.5) make a **loop** that rejoins the main route.
- **Pokok Tinjau (x 78–96):** stays. NEW: a **rope bridge** from the high deck (row 19) east to a ridge deck (x 90–93), then down to the east grove.
- **Taman Gerbang (x 96–110):** the finish gate on the plinth, a sign toward the valley.

**Pacing (estimate; the current level is untimed, about 5–8 minutes based on route length and puzzles)**
| Part | Current (est.) | Proposed |
|---|---|---|
| Traversal | 2 min | 2.5 min |
| Exploration (arch, treehouse, rope bridge) | 1 min | 2 min |
| Maths experiments (machine, probe) | 2 min | 2 min |
| Problem-solving (crate, crane, sawmill) | 1 min | 2 min |
| Optional secrets (3 instead of 2) | 0.5 min | 1.5 min |
| Final challenge (Tebing hops) | 1 min | 1 min |
| **Total** | **≈ 5–8 min** | **≈ 9–12 min** |

**Interactions**
| Object | Why it exists | How to use it | Visible change | Maths? | Route | Wrong / incomplete |
|---|---|---|---|---|---|---|
| Crate + plate (existing) | the gardener's goods crate | push it onto the plate | ledge appears | no | optional | push it again; C resets the crate |
| Machine f(x)=2x+1 + lever (existing) | plank order for the bridge | choose x, pull the lever | 7 planks laid across the gap | yes | **main** | short: the bridge ends early; extra: planks stacked beside it; try again |
| Crane (NEW, physical) | lifts plank bundles to the bridge mouth | lever: raise / lower | bundle moves; reaches the station | no | main (pacing) | lowered in the wrong place: the bundle comes back |
| Sawmill g(b)=3b−1 (NEW) | cuts logs for the fishing jetty | choose b logs | jetty built over the river | yes | optional | the jetty falls short or has extra planks; logs return to the pile |
| Rope bridge (NEW) | a short cut between the treehouse and the ridge | walk across | — | no | optional | — |

**Applied maths**
- *Main (existing), bridge decking.* Model: P(n) = 2n + 1. n = number of spans between supports (count). P = planks (count). Domain n ∈ {0,…,6}. Assumptions: every span takes 2 planks, plus 1 plank at the end; planks are all the same; **a simplified fictional model**. Player controls: n. Effect: P planks laid. Reasoning: 2n + 1 = 7 → n = 3. Feedback: n = 2 → 5 planks, "short by 2"; n = 4 → 9, "2 extra". Objective: evaluate a function and find the input for a target output (SP 1.1).
- *Optional (NEW), sawmill.* Model: g(b) = 3b − 1. b = logs (count), g = usable planks. Each log gives 3 planks; 1 is lost as the cutting offcut. Domain b ∈ {1,…,6}. Target: 11 planks for the jetty → b = 4. Feedback: b = 3 → 8 (the jetty stops before the island); b = 5 → 14 (extra planks stacked on the shore). Objective: the same skill on a different function, framed as a production rate.

**Replay:** the jetty and the third secret are only reachable after the sawmill. The arch and the rope bridge open a faster speedrun line. The plank challenge already has 12 variations (existing).
**Landmarks:** kampung house; the root stone arch; the yard crane; Pokok Tinjau; Taman Gerbang.
**Assets / risk:** all Kenney base (stone 40–43 / `kenney/tiles` stone, logs 6–8 from the farm pack, poles 69/89, planks 48–50). Moderate risk: the arch changes collision in the root lane area and the canopy route (coins `canopy-1..3` must move onto the arch).

---
## 4. Level 1-2 · Jambatan Berkembar: proposal

Blueprint: `design/blueprints/w1-l2.svg`. Size unchanged (90 tiles). **Intermediate level, target 12–16 minutes.**

**Geometry**
- **Rabung Masuk (x 0–12, NEW):** start on the ridge (row 22) and descend in three steps (rows 22 → 23 → 24). The 1-1 gate is visible far to the left. The view of the river opens up below.
- **Twin Pump Station (x 20–34):** the existing station becomes a **water wheel** by the river (pump-station theme). The double-deck twin bridge (main + upper deck) stays.
- **Islands (x 46–58):** the islands become rock pillars of different shapes. On the island stands the **Gerai Jeti** (optional challenge). NEW: a low ledge (row 26) leads into a **bank cave** (x 54.5–57.5) holding a secret.
- **Canopy giant (x 54–62):** stays. NEW: a **descending rope bridge** from the lookout (row 19) to a treetop (x 67–70), then down into the final yard. This makes a loop.
- **Stone Dam (x 64–78):** the final station becomes a **small dam** of ruin stone (the first sign of 1-3). The final bridge stays.
- **Old stone steps (x 84–90):** the flag stands beside a stone marker; the stream continues into 1-3.

**Pacing (current est. 6–9 min → proposed 12–16 min):** traversal 3, exploration 3, maths experiments 4 (two stations), optional challenge 2, secrets 1.5, final bridge 1.5.

**Interactions**
| Object | Why | How | Change | Maths? | Route | Wrong / incomplete |
|---|---|---|---|---|---|---|
| Twin machines f(x)=2x+1, g(x)=x² (existing) | two calibration stages that drive the pump | choose input, order, receiver mark; send | deck slides toward the marked receiver; lamp locks | yes | **main** | output over / under the mark: the deck stops short, the lamp does not lock; change order or input |
| Water wheel (NEW, physical) | powers the station | lever to start | wheel turns; the twin machine lights up | no | main | — |
| Gerai Jeti (NEW) | boat tickets from the island | choose the order: voucher then charge, or charge then voucher | the fare shown; correct choice gives a raft to the cave | yes | optional | the price shown is not the cheapest; the raft does not come; try the other order |
| River sluice (NEW, physical) | lowers the water by the bank | lever | water level drops one row; cave ledge appears | no | optional | lever again: water rises |

**Applied maths**
- *Main (existing), twin machines.* f(x) = 2x + 1, g(x) = x². These are **explicitly fictional calibration machines**; they are not claimed to be real engineering. Domain x ∈ {0,…,6}. f(g(2)) = 9, g(f(2)) = 25; f(g(3)) = 19, g(f(3)) = 49. Objective: in a composite function the order matters; the inner function runs first (SP 1.2).
- *Optional (NEW), boat ticket.* p = ticket price (RM, p ≥ 5). v(p) = p − 5 (an RM5 voucher). s(p) = 1.10p (a 10 % service charge, **as an example; real business rules differ**). s(v(p)) = 1.1p − 5.5; v(s(p)) = 1.1p − 5. For p = 20: RM16.50 and RM17.00. The player chooses the order and sees the real difference (50 sen). Objective: a composite function models a sequential process; order matters in everyday life.

**Replay:** the optional challenge uses a different p each time (p ∈ {10, 15, 20, 30}). The cave and the rope bridge are new routes for collecting coins and secrets.
**Landmarks:** the ridge with the view; the water wheel; the canopy giant; the stone dam.
**Risk:** the ridge changes the entry checkpoint position (`entry` x 108 feet 1296 → row 22). The ID stays. The coins at the entry must move up. Old saves at checkpoint `entry` restore to the new position (safe).

---
## 5. Level 1-3 · Gerbang Songsang: proposal

Blueprint: `design/blueprints/w1-l3.svg`. Size unchanged (104 × 39). **World finale, target 15–20 minutes.**

**Geometry**
- **Jejak Sungai (x 0–12):** the stream from 1-2, the same stone marker.
- **Ruin tower (x 13–39):** **stepped stone stairs** (blocks rising 1 tile, x 19–24) replace the ladders at x 17 and 22. A stone ledge (x 27–29, row 25) replaces the ladder at x 31. One ladder stays (inside the tower, x 35). Galleries stand on stone piers (already done in Phase A).
- **Hidden chamber (x 14–25, rows 33–35, NEW):** entered by dropping into the **existing 1-tile pit between the ruins and the courtyard (x 24–25)**, which currently leads nowhere. The pit becomes a shaft into the chamber; leave by stone stairs. Holds the old thermometer (optional).
- **Spring cistern + aqueduct (x 36–47, NEW):** the source moves **to the top of the tower** (water flows downhill, which is believable). A **walkable aqueduct** (one-way, row 24) carries the water to the machine yard. This is the **upper route**; the courtyard is the lower route.
- **Machine yard (x 47–60):** the inverse machine stays. Its meter is fed by the aqueduct.
- **Waterfall and seal bridge (x 60–64):** stay. NEW: a **cave behind the waterfall** (x 64–70, rows 33–35) with a ladder down from the far bank (x 68.5). This is a short loop with a secret.
- **Gate (x 76–104):** stays, including the gate arch walk.

Ladders: **5 → 3** (tower x 35, gate x 85, waterfall cave x 68.5), and no longer side by side.

**Pacing (current est. 7–10 min → proposed 15–20 min):** traversal 3, tower climb and aqueduct 4, machine (3 seals) 5, thermometer 2, secrets (5) 3, gate 1.

**Interactions**
| Object | Why | How | Change | Maths? | Route | Wrong / incomplete |
|---|---|---|---|---|---|---|
| Inverse machine + 3 seals (existing) | a meter shows y; recover the valve setting x | undo the steps (−3, ÷2), send x to the deck | seal lights up; deck rises one third | yes | **main** | wrong x: the deck moves to the wrong position and the seal does not light; undo and try again |
| Aqueduct valve (NEW, physical) | channels water to the yard | turn it at the tower top | water flows along the aqueduct; machine meter switches on | no | main (if it becomes the main route) / optional | closed: the meter is blank |
| Shaft between the ruins and the courtyard (existing pit, NEW use) | the ruin floor has collapsed | drop in | lands in the hidden chamber | no | optional | leave by the stairs |
| Thermometer F → C (NEW) | an old Fahrenheit gauge in the ruins | enter °C for the reading shown | the chamber pool lights up / the old door opens | yes | optional | the door stays shut; hint "F − 32 first" |
| Seal gate (existing) | the exit to World 2 | — | seals light up, door opens | — | main | — |

**Applied maths**
- *Main (existing), valve meter.* y = 2x + 3. x = valve setting (turns), y = meter reading (**fictional unit**). Domain {0,…,6}, image {3, 5, …, 15}. f⁻¹(y) = (y − 3)/2. Seals 13 → 5, 7 → 2, 15 → 6. Objective: the inverse function, domain and image, a one-to-one function (SP 1.3). Values outside the image (e.g. 8) have no inverse in this domain; that is already explained in the tablet.
- *Optional (NEW), thermometer.* F = 1.8C + 32 (real conversion). C = (F − 32)/1.8 is its inverse. Readings shown: 95 °F → 35 °C, 86 °F → 30 °C, 104 °F → 40 °C. Domain C ∈ [20, 45] (warm water). Answers to 1 decimal place, tolerance 0.1. Objective: the inverse of a real-world formula; the order of the inverse operations matters.

**Replay:** the thermometer picks a different reading each run. Two caves. The aqueduct as a speedrun line.
**Landmarks:** ruin tower + cistern; the aqueduct; the waterfall; the main gate (battlements are already done).
**Risk (highest of the three):** big collision changes in the ruins (the stairs replace ladders). The positions of secrets `ruin-inscription` and coins 3–7 must move. Two new spaces need extra camera bounds below (rows 33–35). The camera must not reveal the chamber before it is found.

---
## 6. Ranking of changes

| Priority | Change |
|---|---|
| **Essential for World 1** | 1-3 stairs replacing 3 ladders; 1-1 root stone arch replacing two post-and-deck frames; transitions (1-2 ridge, the 1-1 → 1-2 valley sign, stone marker 1-2 → 1-3); 1-3 source at the tower top + aqueduct (connects the ruins, the water and the machine) |
| **Desirable** | 1-1 jetty + sawmill (11 planks); 1-2 Gerai Jeti (composite money function); 1-3 thermometer; waterfall cave; 1-2 descending rope bridge; 1-1 crane |
| **Future** | travel between checkpoints (return loops without walking); making the aqueduct the main route (1-3 lower route as the return path); a 1-1 kampung with NPCs |

---
## 7. Level design template (for future worlds)
1. **Topic + SP** (DSKP code and title only).
2. **Geography + continuity:** where this level sits in the World; what is seen at entry and exit.
3. **Geometry pattern** (A–E in `WORLD-MAP-MASTERPLAN.md`) + silhouette sketch (blueprint generated from data).
4. **Main route + 2 optional routes**, including at least **one loop** that rejoins the main route a different way.
5. **Mechanism table** (the 6 questions: why it exists, how, visible change, maths?, route, wrong/incomplete).
6. **Applied maths spec:** inspiration, model, variables + units, domain, assumptions, control, physical effect, reasoning, feedback for other values, objective. State clearly if the model is fictional.
7. **Pacing** (6 categories, target duration).
8. **Replay:** a variant, a secret, a speedrun line; **no** lives or forced grinding.
9. **Landmarks** (at least 1 per area) + assets (`ASSET-BIOME-MATRIX.md`).
10. **Physics check:** rise ≤ 1.5 tiles, gap ≤ 3 tiles on the main route (blueprint generator), then a real browser test after implementation.
11. **Risks:** collision, saves, coins, the PlayFab leaderboard (best times change if the route changes).
