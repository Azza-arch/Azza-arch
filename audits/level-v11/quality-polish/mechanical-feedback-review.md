# Mechanism feedback review

Every mechanism was observed in the natural-input route. The current V11.2 change set alters only G's animation; all equations, accepted answers, hints, retries and learning objectives remain the same.

| Mechanism | Player action | Machine response | Visible/playable result | QA outcome |
|---|---|---|---|---|
| A crate / plate | Push the crate onto the plate. | Plate depresses and the crate switch state changes. | Bonus deck becomes visible and usable; it remains optional. | Natural input reaches and leaves the deck. |
| B lift | Enter an input; x=3 gives f(3)=7. Wrong input leaves it locked. | Lever/actuator feedback and lift planks move. | The crossing collider is created only at the upper safe stop; checkpoint updates. | Wrong/correct, moving and safe states pass. |
| D number-block machine | Supply x=4 to g(x)=3x-2. | Correct number block responds and the span rises. | The far landing is playable only after settling. | x=2 stays locked; x=4 opens at y=972. |
| E waterworks | Choose function order for input 3. | Wrong g-then-f shows 15 and leaves the gate closed; f-then-g yields 19 and starts the visible water path. | Reservoir fills, then the span settles and gains its collider. | Wrong/correct result, endpoint visuals and far-bank checkpoint pass. The full sequence is about 3.4 seconds; humans should judge whether that choreography feels rewarding or too slow. |
| F optional reward | Find the cave and solve the inverse relation: output 7 comes from input 3. | Correct answer confirms the inverse; wrong input can be retried. | Optional gem reward appears; the main route remains available without it. | Visit/skip routes pass; no gate depends on this reward. |
| G final bridge | Solve 4x-3=17 with x=5, then choose f before g for g(f(2))=13. | Fixed-base handle turns in direct response while the planks rise. | Collision is added only after all six planks stop at the bank height. | Wrong latch/order, correct sequence, pause, reload, reduced motion and collision states pass. |

No other mechanism was slowed or redesigned. The only newly identified timing question is E's purposeful flow sequence; it is listed for human beta feedback rather than changed without evidence.
