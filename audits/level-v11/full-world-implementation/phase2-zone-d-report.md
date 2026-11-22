# Zone D implementation report — R08–R10

## Scope

Implemented only the V11.1 D block-number workshop segment after A/B/C visual polish. A/B/C walking surfaces and collision remain unchanged. No fake workshop façade was drawn; the composition uses atlas terrain, number blocks, a supported rack, one sign/readout, timber span and ladder.

## Coordinates and traversal

The coordinate/collision table is world-coordinates.csv. D starts at x3024 and ends at x4104. R08 safe approach is x3024–3564 at y972; its gated span is x3564–3834. The span art parks at y1188 and rises to y972. A 16px one-way body is created at the final y972 stop only. The far bank x3834–4104 is safe floor.

R08 rack: x3078–3294, y918. Three supported blocks display 2, 3 and 4. The input socket is at x3372 and output display at x3420. The retry checkpoint is x3294, y972.

R09 service shelf: x3294–3510, y738; ladder x3330 from y738 to floor y972; optional coin at x3402, y696. Supports end on actual floor. It returns to the main route and cannot bypass the number gate.

R10 composition pad: x3834–4104, y972; terminal x3960. It compares f(2)=5 then g(5)=13 with g(2)=4 then f(4)=9.

## Correct interaction

The player selects an input block from the rack using the input controls. The board identifies g(x)=3x−2 and target10. Input2 displays the calculated result4, leaves the panel open and keeps the span parked. Input4 displays10, confirms g(4)=10, animates the digit from rack to socket, then animates the timber span. Only after the span stops at y972 is the one-way collision added. The interaction closes automatically and checkpoint d-crossing is saved. Continue restores the final collision and checkpoint.

R10 order selection is exploratory and has no failure state. Output values are 13 and 9, respectively.

## Assets and frames

No new source artwork. D adds instances of verified catalog frames 9, 48–50, 71, 85, 89, 111–112, 124, and digit frames162–164, plus an existing coin PNG. Exact instance deltas and B timber pieces removed are in asset-frame-map.md. No unsupported gear, hazard, enemy, cloud or building sprite is used.

## Verification

- Natural keyboard route and browser captures: phase1_natural_input.py; latest log: logs/phase1-natural-input.json.
- Natural route covered R08 wrong2→4, correct4→10, the block/span animation, cross-gate movement, optional R09 ladder/coin, R10 order outputs and Continue restoration.
- v11_math.test.mjs covers formula outputs, unique target input4, composition order and unsafe checkpoint rejection.
- Existing V9/V10 Node regressions remain passing; details in regression-results.md.
- Stop before Zone E for review.
