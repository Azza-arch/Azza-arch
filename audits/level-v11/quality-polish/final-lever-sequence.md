# G final lever: sequence and collision proof

## Visual construction

Kenney Pixel Platformer atlas frame 64 is 18 x 18 px. The runtime creates two nearest-neighbor CanvasTextures from that verified frame: handle source rows 0-11 and base source rows 10-17. The 2 px overlap keeps the hinge connected. The fixed base is drawn at world position (7390, 948); the rotating container pivot is at (7423, 951), matching the source hinge. The collision model is independent of both textures.

## Animation sequence

1. Correct latch and composition are checked without changing their formulas: `4x - 3 = 17` requires x=5; `g(f(2))=13` opens the final bridge. Wrong x or reversed order leaves the gate closed and allows another attempt.
2. The solved gate IDs are saved. After a short 250 ms acknowledgment, the puzzle closes.
3. The handle moves once from 0 deg to -52 deg over 460 ms while all six bridge planks rise together from y=1242 to y=972 over 760 ms. The base does not move.
4. No bridge collider exists during the transition. On tween completion, the art snaps to y=972, then one 324 x 16 collider is installed at x=7506, y=972; checkpoint and save update afterward.
5. Reduced motion skips the delay and tweens, applies the final angle/position, and installs the same collider. Reload during a saved transition restores that safe final state directly.
6. Pause/resume pauses both tweens without changing their positions and continues to the same safe result.

## Browser measurements

See [`regression/lever-animation.json`](regression/lever-animation.json) and the real-browser frames in [`screenshots/lever-sequence/`](screenshots/lever-sequence/):

- Locked: handle 0 deg, base [7390,948], bridge y=1242, no collider.
- Moving: handle -27.60 deg at capture; bridge y=1181.30; base [7390,948]; no collider.
- Safe: handle -52 deg, bridge y=972; collider x=7506, y=972, width 324, height 16.
- Pause/resume: lever angle and bridge y values remain fixed while paused.
- Mid-transition reload: restores y=972, angle -52 deg, collider present.
- Reduced-motion mobile: reaches the same safe state with no console/network failures.

`level.js` is unchanged. Existing unit regression also confirms the final collider is installed only after bridge settling.
