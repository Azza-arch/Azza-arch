# Latest Zone E pipe connection review

The user correctly identified a remaining gap in the earlier V11.2 capture. Frame 94 turns the elevated inlet downward through the **bottom-center** of its 54 px tile. The vertical riser had been placed at x=5076, one tile to the right of the elbow tile at x=5022, so the sprites did not meet. The low water in the basin had made the gap less obvious but had not repaired the pipe.

The inlet riser now uses x=5022. Its centerline is x=5049, matching the bottom outlet of frame 94 exactly. The pipe extends from y=837 through y=1053 into the basin. The basin is 162 px wide (x=5022-5184); its floor remains at y=1026. The outlet riser at x=5130 enters the other side of the same basin, where the low water visibly bridges inlet and outlet. The right bank begins at x=5184 and still provides a 108 px standing area for the terminal at x=5238.

The pipe remains decorative; player collision is independently defined by the terrain and the animated crossing. The pre-alignment source files are preserved in `backups/before-final-pipe-alignment/`.

Fresh actual-game capture: `screenshots/natural-input/phase3-E-R12-pipe-network-locked.png`. Water flow and open-crossing captures are in the same folder. Natural-input R01-R12 traversal passed after this alignment with zero page, console, or network errors.
