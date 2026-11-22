# Phase 3 - Zone E R11-R12

## Scope and reference

Implemented Zone E only, ending at x=5650. The supplied V11.1 map is used as a composition guide; the approved 180-frame Kenney catalog remains the sprite source of truth. V9/V10 remain separate. A reversible pre-V11.2 backup and a second pre-alignment source backup are preserved under `audits/level-v11/waterworks-reconstruction/backups/`. Zones F/G are not implemented.

## Playable rooms

- R11 (x=4104-4860): stepped entry, raised pipe rack, ladder to lower recovery route, optional coin, and a safe return to the main tier.
- R12 (x=4860-5650): visible inlet-to-basin-to-outlet route, function-composition interaction, and gated crossing.
- The puzzle uses f(x)=2x+1 and g(x)=3x-2 at input 3. g(f(3))=g(7)=19 opens the crossing; f(g(3))=f(7)=15 is shown as the actual wrong-order result and can be retried. Correct input closes the panel, animates water and bridge, activates collision after the bridge stops, and saves the solved state.

## Latest pipe connection correction

The user correctly caught a real one-tile gap in the prior screenshot. Frame 94 at tile x=5022 turns downward through centerline x=5049, but the vertical inlet had been placed at x=5076 (centerline x=5103). The two sprite ends were therefore 54 px apart. The inlet riser is now at tile x=5022, with segments y=837, 891, 945, and 999; it touches the elbow and extends into the basin.

The pool floor spans x=5022-5184 at y=1026. Three water tiles sit initially at y=999 and rise to y=972 on success. The outlet riser at x=5130 is inside the same basin, linking the water to frame 93's up/right elbow and frame 134's control run. The safe control bank now begins at x=5184 and is 108 px wide; the interaction remains at x=5238. Pipe sprites are visual only; terrain and crossing collision remain separate.

Fresh captures: `audits/level-v11/waterworks-reconstruction/screenshots/before-after-comparison.png`, `outlet-detail-final.png`, and `natural-input/phase3-E-R12-pipe-network-locked.png`. The final capture shows the elbow and riser meeting directly, with the shared basin visibly spanning inlet to outlet.

## Verification

- Final Zone E geometry test: 3/3 passed after the inlet alignment.
- Full regression set immediately before that final sprite-only alignment: 38/38 passed; the same Phase 3 geometry suite was rerun after alignment.
- Fresh natural-input R01-R12 desktop route: PASS, 63.08 seconds automated; mobile touch movement/jump captured; 0 page errors, 0 console errors, 0 failed requests. This includes wrong order/retry, correct order, water sequence, collision activation, checkpoint and Continue restore.
- Final desktop actual-game capture completed without browser errors.

Detailed coordinates, asset frames, animation states, and regression output are recorded beside this report and under `audits/level-v11/waterworks-reconstruction/`.

## Stop point

Stop after R12 for review. Do not start Zones F/G or call Level 1 complete. No commits, pushes, deployment, or destructive cleanup were performed.

