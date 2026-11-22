# Phase 4 Save/Continue

V11 alone uses `lorong-save-v11`. Schema1 now writes layout112 and accepts layouts111/112. Old coordinates are never imported: checkpoint IDs resolve against current safe geometry. Layout111 retains B/D/E gates, C mapping, collectibles, discoveries and elapsed time. Unsupported layout/schema/level is rejected.

Sanitization rejects far-bank checkpoints without both river latches and the bridge. River latches require water-crossing; composition requires the first latch. Completion requires all six mandatory solved IDs. A Phase 3 completed flag cannot falsely complete Phase 4.

The first latch is saved separately. Both final latches are saved before bridge animation, so reload during animation installs the solved bridge at y972 with collision. A locked save has no river collider. Focused Chromium tests exercised both behaviors and Pause/Resume/Restart. Full natural traversal reloads a completed run and verifies completion, earlier water state, optional inverse discovery, gem persistence and absence of a duplicate collectible. Repeated E after completion does not change the saved record; the active timer remains frozen.

Restart replays from A using the existing confirmation; New Adventure retains the existing explicit save-reset semantics. V9/V10 data is not imported or modified; the V10 sentinel survived the full test.
