# V11.1 room implementation matrix — Phase 1 polish and Zone D

| Room | Built behavior | Route / recovery | Status |
|---|---|---|---|
| R01 | Safe spawn, tree landmark, 54px step, keyboard/touch movement and jump | Main route continues right; no hazard | Implemented and naturally traversed |
| R02 | Pushable crate, pressure plate, conditional supported ledge and collectible | Optional ledge; crate reset retained; main path can continue | Implemented and naturally traversed |
| R03 | 108px gap and wide far bank with checkpoint | Fall returns to latest saved checkpoint | Implemented and naturally traversed |
| R04 | Input/output probe for f(x)=2x+1 | Repeatable; wrong input has no penalty | Implemented and naturally traversed |
| R05 | Supported lever/lift frame, seven actuator markers, output check, moving bridge | Wrong answer is retryable; bridge collision is added at safe destination; checkpoint saves after success | Implemented and naturally traversed |
| R06 | Elevated timber bonus deck, two ladders, four input/output pairs, optional gem and coins | Ladder returns to B; no main-route dependency | Implemented; entered, completed and exited naturally |
| R07 | Stepped terrace connects B to D and previews the number rack | Main route continues to D; no false Level 1 completion | Implemented and naturally traversed |
| R08 | Supported rack with digit blocks 2/3/4, crate-shaped input socket, g(x)=3x−2 output board; target10 | Wrong inputs show actual result and leave retry available; correct input4 animates block and bridge | Implemented and naturally traversed |
| R09 | Optional upper service shelf, ladder and coin | Returns to safe D floor; no gate dependency | Implemented and naturally traversed |
| R10 | Input2 composition primer: f→g or g→f | Both order choices are safe; no gate on route | Implemented and naturally traversed |

Zone E and later regions are not present in this build.
