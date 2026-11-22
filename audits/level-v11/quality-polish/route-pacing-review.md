# Route pacing review

This review uses `src/v11/level.js`, fixed A-G captures, and both complete natural-input traces. It describes route shape; it does not treat automation success as a human difficulty rating.

## Verified route shape

- The mandatory A sequence includes the first measured gap (108 px) and then a longer optional crate/plate deck. The bonus interaction does not block the main route.
- B uses 54 px terrace rises, a ladder, and one solved lift crossing. C is an upper side branch with entry/return ladders and four short mapping inputs; skipping it still reaches the probe and lift.
- D contains the number rack, optional service ledge and ladder, then a separate composition station. The transitions between authored surfaces are not empty corridors in the fixed captures.
- E has the pipe run, lower recovery route, two composition stations, basin, bridge and checkpoint. Its water choreography is approximately 3.4 seconds from correct answer to safe bridge (acknowledgment + flow + fill + bridge settle). This is measurable but whether it feels too slow is subjective.
- F is the longest named room span (R13: x=5650..7250). It includes a collectible, three 54 px hillside elevation changes, the optional cave/roof and an overlook checkpoint. The C/F skip trace walks the main route without visiting the cave; it does not prove that a new player will find the route obvious.
- G has two math latches. The final animation now takes about 0.76 seconds from movement start to safe collision, after a brief 0.25 second acknowledgment. The gate stays non-collidable during motion.

## Pacing findings

No extra corridor, repeated obstacle, new math question or difficulty change was introduced. The only repeated shape pattern is F's three equal hillside rises; the fixed screenshots show a legible slope, but human players should say whether it feels repetitive. Automated traversal covers both optional branches and both skip cases, but says nothing about route discovery, frustration or enjoyment.

The measured E animation is the clearest wait to ask about. G's new wait is short and linked to visible movement, but human feedback should confirm that the bridge response feels immediate enough. Keep the stable route until those questions are answered; no pacing geometry change is justified by bot data alone.

## Human prompts

Ask testers where they first hesitate, whether they recognize C/F as optional, whether F's staircase is repetitive, and whether E's water sequence and G's bridge wait feel purposeful. Record wrong turns and retries rather than asking for a completion-time estimate from these automation runs.
