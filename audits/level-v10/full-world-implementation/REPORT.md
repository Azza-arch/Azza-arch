# V10 full-world implementation

The playable V10 now spans **8400×1600**, with the main route **A → B → D → E → F → G**. C remains an optional upper branch. The old B/C prototype ending is removed; completion requires all four mechanisms and arrival at the home door at **(8316,1296 feet)**.

Open `/app/addmath/rooftop/v10.html` on the local server. The original `/app/addmath/rooftop/` remains V9. No commit, push or deployment was performed.

## Batch completion matrix

| Batch | Implemented behavior | Natural-input evidence |
|---|---|---|
| 2 — D | Number tokens 2/3/4 physically enter a socket. Wrong input returns to the rack; 4 produces 10 and opens the crossing. Optional upper note and two-order composition primer. | [Desktop D](logs/batch2-natural.json) |
| 3 — E | Reservoir, pipe manifold, two-stage numbered flow, order selection, roof platforms, three ladder connections and missed-jump recovery shelf. | [Desktop through E](logs/batch3-natural.json) |
| 4 — F | Connected descending hill, open ladder-access cave, optional inverse mapping and treasure, return to main route. | [Desktop through F](logs/batch4-natural.json) |
| 5 — G | Riverbanks, water, winch, two independent saved latches, final bridge and actual home completion. | [Desktop A–G](logs/batch5-natural.json), [touch A–G](logs/batch5-mobile.json) |

Each batch has a source snapshot in `snapshots/`. The pre-extension snapshot is `before-batch2.zip`. Restoring a snapshot affects V10 only; keep the corresponding level and runtime modules together.

## Geometry and blueprint differences

**All 41 collision surfaces match the approved blueprint exactly. All seven ladders retain their candidate endpoints.** The full coordinate record is [implemented-world.json](implemented-world.json); reviewable CSVs contain [surfaces](implemented-surfaces.csv), [ladders](implemented-ladders.csv), [terminals](implemented-terminals.csv), [checkpoints](implemented-checkpoints.csv) and [collectibles](implemented-collectibles.csv).

Changes relative to the previously working Batch1 are the addition of D–G surfaces, ladders, gates and interactions; the playable boundary expands from 2916 to 8400. A/B/C collision geometry and Chill Boy movement constants are unchanged.

Differences/additions beyond the candidate tables:

- Keep Batch1 checkpoint `cp-b-exit` at **(2790,972)** for compatible existing saves, in addition to the seven proposed checkpoints. It requires the gear gate.
- Add optional service-ledge coin `coin-d-note` at **(3996,696)**. Original stable secret IDs remain; their V10 locations are Oyen **(1900,810 feet)**, note **(3996,756)** and cave treasure **(6700,1242)**.
- D token racks occupy **x=3060,3114,3168**, bottom **972**; inserted token is centered **(3267,930)**. These are visual mechanism parts, not new collision surfaces.
- Pipe assemblies are anchored at the proposed primer **(3942,972)** and waterworks **(4806,648)**. Final controller remains **(7632,1296)**; its decorative station is at x=7650.
- Cave background shading occupies **x=6480…6750, y=936…1242**, behind the ladder, with no collision. It is distinct from foreground terrain. Home roof decoration occupies **x=8184…8400, y=1026…1080**, also non-colliding.

Solid ground has dirt fill; one-way decks and bridge spans use thin timber. No dirt was added beneath suspended E decks. Gate bodies are created only after their reveal animation finishes. The original speed 280, jump impulse 520, gravity 1400, body 28×60 and climb speed 150 remain unchanged. Ideal same-height jump reach is 208px and apex height 96.6px; acceleration reduces reach from rest. Natural traversal, rather than those ideal equations alone, verifies the installed route.

## Mathematics and physical consequences

| Interaction | Verified computation | Consequence |
|---|---|---|
| B gear | Original question: f(3)=2×3+1=7 | Output controls the wheel angle; correct result releases the timber crossing. |
| D block | Original local function f(x)=3x−2: 2→4 is wrong; 4→10 is correct | Selected numbered sprite enters the socket; incorrect token returns; correct token remains inserted and opens G2. |
| D primer | With f(x)=2x+1 and g(x)=3x−2: 2→f→g gives 13; reverse gives 9 | Both valid explorations animate their intermediate values and water readout. |
| E composition | 3→f→g: 3→7→19; reverse: 3→7→15 | Wrong order leaves the crossing closed. Correct order fills the pipe outlet and deploys G3. |
| F inverse | f:{0,1,2,3}→{1,3,5,7}; f⁻¹(7)=(7−1)/2=3 | Readout reverses the mapping and awards the optional treasure. No main-route dependency. |
| G final | Original equation 4x−3=17 gives x=5; familiar composition 2→5→13 | First result lights one latch. Second lights the other and opens the river bridge. One latch alone never creates collision. |

The three original question objects remain imported unchanged. Composition and inverse are the blueprint's explicit curriculum expansion. D keeps its original question's local `f` notation; the composition panels explicitly redefine `f` and `g` before use. Hints explain order and range; incorrect attempts show computed results without a life penalty.

Successful tasks show brief feedback, automatically close the panel, animate their world object, install safe collision, restore camera following and then restore movement. Reduced motion reaches the same safe state. Already-earned bridges are restored immediately when loading.

## Verification

- **31 unit tests passed:** 12 original V9 tests, six updated V10 baseline tests, 13 full-world geometry/math/save tests. The six baseline tests were transparently updated from the obsolete 2916px/ABC-only expectations to the approved full world and expanded legacy import.
- Desktop fresh-save A–G completion: **100.12 seconds automated wall time**. Touch fresh-save completion at 844×390: **124.61 seconds**. These are test execution times, not learner-duration estimates. Neither traversal writes avatar position or scene progress. Both skip C and still complete the main route.
- Tests explicitly submit wrong and correct inputs, traverse D's upper note, miss E's roof jump and recover by ladder, descend/ascend the cave, and reload after the first final latch before earning the second.
- [Optional regression](logs/optional-regression.json): distant movement leaves the crate still; actual contact pushes it onto the plate; crate→ledge jump collects the reward; reset works; C mapping and both café ladders work; discoveries survive Continue.
- [Portrait QA](logs/portrait-save.json): 370×740, touch, reduced motion, no horizontal document overflow, usable mechanism panels, wrong/correct flow, automatic close, restored pipe/final collision, pause/resume, and explicit V9 import preserving old save bytes. These checkpoint fixtures test restoration/UI, not reachability.
- No browser page errors, console errors or failed requests in either completed full traversal. Earlier automation failures were corrected by aligning within ladder tolerance and issuing mobile movement/jump together; no movement physics was relaxed.
- [V9 preservation](logs/v9-preservation.json): **327/327 baseline files unchanged**, including original source and assets. Save keys remain isolated (`lorong-save-v10` versus `lorong-save-v1`). Old Batch1 saves do not automatically earn new gates or full completion.

## Visual review against the supplied V10.1 map

The supplied image remains the composition reference: garden, mill, upper café, workshop, waterworks, hill/cave, river/home. The actual imported Base atlas supplies all sprite art; Chill Boy is retained. See [asset inventory](asset-use.md) and [A–G screenshot gallery](gallery.html).

The fixed-camera gallery is rendered by the real game. Its solved-save fixtures and camera-only positioning are labelled separately from the natural traversal evidence; they are not proof of reachability. Camera coordinates are recorded in [composition-cameras.json](logs/composition-cameras.json).

**Remaining visual differences:** this is a modular Base-pack interpretation, not a pixel-identical recreation of the illustration. Buildings are simpler timber structures; the cave is a supported earthen opening rather than the illustration's gray rock arch; the pack has no complete gear, café façade, rock set or house sprite matching that image. Background vegetation and decorative density remain lighter. No replacement art was generated to conceal these differences. Visual fidelity still needs the user's review; gameplay verification alone does not certify an exact visual match.

Mobile coverage is Chromium emulation, not physical-device/Safari certification. The older `v10_batch1.py` and `v10_mobile_save.py` record the historical prototype workflow and ending; current acceptance scripts are `v10_full.py`, `v10_optional.py`, `v10_portrait.py` and `v10_capture.py`.

No known mandatory-route or save blocker remains in the verified paths. Stop here for review of the implemented full world.
