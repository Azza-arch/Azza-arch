# Waterworks animation and collision state

1. Locked: the pipe sprites are fixed and decorative. Three basin tiles show a low water level at y=999, visibly joining the inlet and outlet inside the recessed pool. The crossing art stays parked at y=1188 and has no collider.
2. Correct composition: save the solved gate state, pause Arcade physics during success feedback, and close the interaction dialog automatically.
3. Flow: a Kenney water marker travels along the corrected route, down the frame-94 inlet riser at x=5049, across the basin, then up the outlet riser at x=5157 and toward the control.
4. Reservoir: the three frame-33 water surfaces rise from y=999 to y=972.
5. Crossing: after the basin animation ends, timber art moves from y=1188 to y=972.
6. Safe state: create the crossing collider only after the art stops; save checkpoint `e-crossing`, then resume gameplay and camera follow.
7. Continue: restore the full pool, bridge, collider, checkpoint, and solved state safely. Reduced motion skips tween duration while keeping the same final collision timing.
