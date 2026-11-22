# Math and mechanism verification

| Room | Rule | Input(s) | Expected output / effect | Verification |
|---|---|---|---|---|
| R04 | f(x)=2x+1 | 2 | 5 | Existing browser probe |
| R05 | f(x)=2x+1 | 2 then 3 | 5 (retry), then 7 opens B lift | Natural-input run; collision appears only after the lift stops |
| R06 | f(x)=2x+1 | 0,1,2,3 | 1,3,5,7 and optional mapping discovery | Natural-input run |
| R08 | g(x)=3x−2 | 2 then 4 | Rack choices 2/3/4 yield 4/7/10; input2 wrong/retry, input4 correct | v11_math.test.mjs and browser natural input |
| R08 transition | Correct input 4 | — | Digit block animates rack→socket; span moves y1188→972; collision created after stop; checkpoint/save updated | Browser captures and state assertions |
| R10 | f(x)=2x+1, g(x)=3x−2 | 2 | g(f(2))=13; f(g(2))=9 | v11_math.test.mjs and browser order-button assertions |

D evaluates the selected input directly; wrong answers show the calculated result and leave the panel open for retry. Solved number-span state is persisted in the isolated V11 save and restored with its final collision body. Four math/layout/save tests pass by direct Node test execution.

| R12 | f(x)=2x+1, g(x)=3x-2 | 3 | f then g: 3->7->19 (correct); g then f: 3->7->15 (wrong-order result, retry) | V11 Phase 3 math test and browser panel captures |
| R12 transition | Correct order f then g | - | UI closes; inlet/outlet water flow reaches reservoir; bridge animates; collision appears only after safe stop; Continue restores crossing | Browser natural-input route and Continue reload |
