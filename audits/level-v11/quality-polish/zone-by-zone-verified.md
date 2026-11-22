# A-G visual architecture review

Assessment uses real Chromium captures at 1440 x 900, matching the V11.1 baseline and V11.2 build. Zone positions are fixed on authored walkable surfaces. Full captures: [`before`](screenshots/before/) and [`after`](screenshots/after/).

| Zone | Verified observation | Classification | Change |
|---|---|---|---|
| A - Start / crate plate | The large square-canopy Kenney tree is decorative, but sits left of spawn and does not cover the crate, plate, player, or route. It works as the A landmark. The crate/plate bonus deck is intentionally translucent until active. | Scale/function preference; no confirmed collision or route defect. | Kept the A landmark and crate puzzle. Ask players whether the landmark reads as useful or oversized. |
| B - Climb / lift | The lift span is intentionally parked below the crossing while locked. Posts terminate at authored support points; the gray parked art is separated from collision. The upper optional route remains readable beside the ladder. | No confirmed visual/collision defect. | No change. Lift wrong/correct, movement and safe-state behavior remain intact. |
| C - Mapping bonus | The upper deck is supported by the three authored posts and served by entry/return ladders. The nearby `E` cue is contextual, not a permanent white label. | No confirmed defect. The one-time mapping clue discovery is subjective. | No change; all four input/output pairs and return route pass natural input. |
| D - Number blocks | Rack and service deck have endpoint posts; ladder, sockets and blocks remain distinct. The parked number span does not collide before solving. | No confirmed terrain join or false platform. | No change; wrong input leaves the span parked; input 4 opens it at the safe y. |
| E - Waterworks | Source pipe, elbow, vertical riser and recessed basin align in the authored tiles. Water art is separate from collision; the far-bank bridge is supported by the existing route surfaces. | Phase 4 collision/tile connection checks pass. Flow duration is a human pacing preference. | No change; composition math and exact target 19 remain unchanged. |
| F - Ridge / optional cave | A 3x3 opaque canopy plus trunk sat on the ridge landing immediately before the cave roof. It had no collider, interaction, clue or reward; it competed with the player and made the ledge/roof transition harder to parse. | **Confirmed visual defect.** | Removed only the F tree placement. Kept step heights, cave roof, posts, ladders, cave reward and all collision data. The A tree remains. |
| G - River / destination | The original single-frame lever rotated around its center, turning its visible base; its yoyo completed before bridge motion, then snapped to the final angle. Bridge endpoints and river banks themselves align. | **Confirmed mechanical/visual defect.** | Fixed-base/pivot handle and synchronized lever/bridge response; no geometry or math change. |

## Distinguish confirmed defects from preferences

Confirmed and fixed: F's route-obscuring decorative tree; G's rotating base, disconnected-looking hinge, purposeless return swing, and delayed bridge response.

Preferences for human review: whether the A tree should remain this large, whether the one-time contextual prompts are discoverable, whether E's water animation feels rewarding or slow, and whether G's -52 degrees final handle pose looks convincing to players. Automated traversal cannot answer these questions.

No extra buildings, machinery, fake supports, or background layers were introduced. Pixel-art foreground and background remain separated; the existing calm sky is unchanged.
