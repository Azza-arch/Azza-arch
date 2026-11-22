# Physical mathematical mechanisms

All positions are proposed; [mechanism CSV](proposed-mechanisms.csv) is the anchor table. Existing equations are read from `app/addmath/rooftop/src/level.js`. The controls below require future programming. Static sprite availability is not evidence of existing behaviour.

## Shared interaction contract

Use an in-world prompt within72px horizontally and40px in feet height, with explicit focus on the nearest eligible control. This proposed radius is smaller than the existing terminal test115px/48px. Show equation, selected input and resulting output adjacent to the apparatus. Keyboard uses existing interaction binding to enter/confirm, left/right to select, Escape to leave; touch uses three large local buttons, previous/next/insert. Puzzle mode temporarily suspends walking input, never silently moves the player. Leaving a station restores normal control and retains solved state.

Read equations as text as well as sprite digits; digits alone cannot represent minus signs, variable names and function notation accurately. Do not use colour alone for correctness: arrows, numbers, socket labels and text feedback agree. Permit reduced-motion immediate transitions with identical outcomes. No full-screen answer sheet, timers, consumable attempts or forced guessing. A compact optional explanation panel may expand on demand without changing the world camera.

Common states: idle → focused → preview → validating → animating → solved. Wrong input returns to focused with its actual computed result. Solved is monotonic. Only a fully parked bridge gains its collision surface; never leave an attractive partial bridge walkable. Save a solved logical state before/with transition completion; reloading normalises it to the parked solved pose. Decorative wheels and tokens never acquire unintended terrain collision.

## 1. Function-controlled gear — original Puzzle 1

At **(1960,1080)**, on B2 with cp-b at1900. Existing question **f(x)=2x+1; find f(3)** is unchanged. Player selects output7 on a dial and pulls the lever. The board permanently shows input3 and rule2x+1, making the unknown explicit. Preview computes θ=15°×selected output; correct7 parks at105° and extends G1 x2052–2376 at y1080. Angle is a proposed visual encoding, not a new assessed trigonometry objective. Wrong answer6 previews90° and displays `2×3+1=7`; it does not open a short bridge or punish a fall.

The wheel centre (2120,990) is decorative and connected to the bank by a visible shaft. Use actual frame68 segments plus157 hub as an assembled concept, with lever64/65/66. It is not a native Kenney gear and cannot be ridden. Future work: pivot assembly, labelled dial, answer validation, bridge animation/collision latch and save state. Functional learning is evaluating an image; environmental feedback is a stable crossing.

## 2. Number-block machine — original Puzzle 2

At **(3186,972)** on D0. Preserve **f(x)=3x−2; f(x)=10; find x**, answer4. Rack at x3060,3114,3168 contains2,3,4, drawn with frame9 and digit frames162–164. A selected token slides into the socket; it is an interaction object, not an extra pushable physics crate. Show each attempted transformation:2→4,3→7,4→10. Wrong tokens return to their rack. Correct4 stays in the inspection window and opens G2 x3348–3672 at y972.

Door frames130/150 form a housing; they do not supply a working machine. Program token selection, docking, arithmetic feedback and bridge latch. This develops missing-input reasoning already present in the game. Add a “why?” action showing `(10+2)/3=4`; the player can solve by reasoning or comparing outputs without a modal quiz.

## 3. Two-stage composition pipes — proposed main-path expansion

Safe rehearsal at **(3942,972)** establishes **f(x)=2x+1**, **g(x)=3x−2**, ordered **x → f → g**. Input2 visibly becomes5, then13. State the matching notation **g(f(x))**, explaining the inner function acts first. The active apparatus at **(4806,648)** receives input3 and target19. Correct route is3→7→19. Switching order produces3→7→15, explicitly labelled **f(g(3))**. Since both first intermediates happen to equal7 at x3, the rehearsal at x2 also compares reverse order2→4→9, making the intermediate distinction observable.

Player operates an order lever, then sends the token. Reservoirs display intermediate and final values throughout. Wrong route drains to the reusable input tray; correct order opens G3 x4914–5238 at y648. Pipe corners93/94/113/114 and joints95/115/132/133/134/135 are actual static art. Program the token's path, arrows, reservoir counters and state machine. Pipes are decorative overhead and do not block ladder shafts or become misleading climbable surfaces.

Curriculum addition: composition notation, order and numerical image through a composite. Do not imply function composition is multiplication. Use real-valued linear functions here, so every displayed intermediate belongs to the next function's domain. The separate finite-domain probe must not accidentally restrict these functions to {0,1,2,3}.

## 4. Optional mapping and inverse challenges

**B probe (1480,1134)** explicitly has domain D={0,1,2,3}, codomain K={1,2,3,4,5,6,7,8}, rule f(x)=2x+1 and range R={1,3,5,7}. Display three separate trays. Every domain element has exactly one output; unused codomain values remain visible, so range is not confused with codomain. This is proposed curriculum expansion, even though it uses a familiar formula.

**C café (1740,810)** asks the player to match the same four pairs on a tabletop. A duplicate input cannot be assigned two different outputs; explain this without penalising the player. Secret Oyen is exploration content, not a reward required for progression. Café interaction can be skipped entirely.

**F cave (6650,1242)** treats f as a bijection **D→R**, using the finite sets above. Its inverse is **f⁻¹:R→D, f⁻¹(y)=(y−1)/2**. Select7 and recover3; forward-check f(3)=7. Do not claim an inverse from the full larger codomain K to D, and do not confuse f⁻¹ with1/f. Show domain/range swapping and one-to-one pairs. Unlock the existing cave-treasure secret identity, not a mandatory bridge. Wrong attempts leave the ladder usable. Reaching the cave is voluntary; a player can retrieve exploration context without accepting an assessed inverse question.

## 5. Final bridge — original Puzzle 3 plus familiar synthesis

At **(7632,1296)** on G-bank, cp-g at7560. Latch1 preserves **h(x)=4x−3; h(x)=17; x=5** (renaming the local function to h avoids confusing it with the pipe's f). Latch2 repeats **input2 → f → g →13**, already demonstrated at D and practised at E. This is cumulative recall, not a surprise new rule. First latch remains earned after errors on the second.

The player sees both physical latch indicators and a complete378px bridge outline. When both latch, the winch extends G4 x7722–8100 at y1296 and locks. Water below is a reset hazard; no swimming mechanic. Never retract under a player. Reloading at cp-g must restore latch1 independently and solve/park the bridge when both are true. Exit at (8316,1296) records V10 completion only after actual arrival.

## Preserved baseline and explicit scope

| Existing mathematical task | V10 treatment | New assessed content? |
|---|---|---|
|2×3+1=7 | Gear output | No; physical presentation changes |
|3x−2=10 →4 | Insert numbered block | No; physical presentation changes |
|4x−3=17 →5 | Final latch1 | No; function letter clarified |
| Domain/codomain/range trays | Probe and optional café | Yes, selected Chapter1 content |
| g(f(x)) and order comparison | D rehearsal, E gate, G latch2 | Yes, main-path expansion |
| One-to-one inverse, restricted sets | Optional cave | Yes, optional expansion |

No claim of full Chapter1 coverage: graph transformations, absolute-value functions, detailed undefined-function cases, finding an unknown composed function and extended examination problems are outside this blueprint. Retain existing coins, checkpoint purpose and secret identities through explicit migration rather than deleting them.
