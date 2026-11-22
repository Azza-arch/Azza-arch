# V9 Phase 1.1 — Crate Puzzle: Purpose & Reachability

Answering the brief's explicit required questions directly.

## Why is the crate here?

The crate sits at x=230 (Zone A's own continuous ground segment,
confirmed via `GROUND_RANGES[0]=[0,420]`), just right of spawn, so the
natural spawn→right walking direction is also the natural push direction.
It serves **two roles at once**: (1) it is what presses the pressure
plate, and (2) once resting on the plate, it is the literal stepping
stone the player climbs to reach the ledge above. Both roles happen at
the *same* location, so cause and effect are visible in one place — not
a crate in one spot and an unrelated switch somewhere else.

## Why is the switch (pressure plate) here?

At x=340, directly beneath the unlocked ledge (x:290–390). This is
deliberate: the one spot where the crate is "on the switch" is also the
one spot where it's physically useful as a platform to climb — pushing
the crate anywhere else achieves nothing, and there is no separate,
disconnected "switch location" to find.

## What new destination becomes available?

A small ledge at y=980 (rise 120px above the ground), positioned
directly beside the Zone A spawn area. Reaching it triggers a one-time,
session-only discovery cue (sparkle + "Kawasan tersembunyi!" text) —
deliberately **not** a new tracked collectible (see "known limitation"
below).

## Why couldn't the player access that destination previously?

Verified directly, not assumed: a player jumping from flat ground at
that exact x position was tested and settles back at the ground (bottom
=1100) without ever reaching y=980 — the 120px rise exceeds this game's
own proven ~96.6px maximum unaided jump rise (`v0²/2g` with
`MOTION.jump=520`, `WORLD.gravity=1400`), the same ceiling every other
jump in this level is already validated against. The ledge's collision
body does not even exist until the plate is pressed, so there is nothing
to prematurely stand on either way.

## Can the puzzle be ignored without blocking completion?

Yes. Verified directly: the full A→G adventure (all three gates solved,
exit via the goal) completes normally with the crate left completely
untouched at its start position. The puzzle occupies a dead-end pocket
of Zone A's ground that the mandatory route already passes through
without needing to interact with anything in it.

## Reachability/purpose test (brief §9), answered explicitly

| Question | Answer |
|---|---|
| Can the player reach the ledge? | Yes — crate → plate → climb crate → jump. Verified via real natural keyboard input (hold-right to push, short jump-and-drift to mount, jump again to the ledge). |
| Can the player reach the ledge without activating the mechanism? | No — verified: a direct jump from the ground at that x settles back at y=1100, never reaching y=980; the ledge has no collision body at all until the plate is pressed. |
| Is the destination actually useful? | It is a genuine, provable "you could not get here any other way" moment with a discovery cue — see the disclosed limitation below regarding the lack of a tangible item. |
| Does falling create a softlock? | No — the crate auto-recovers (y>1160, the same threshold the player's own fall-recovery uses, confirmed appropriate since this crate sits on the identical ground tier); the player's own fall-recovery is completely separate and unaffected. |
| Can the player recover? | Yes — automatic crate recovery, explicit "Reset Kotak" (C), and the existing checkpoint respawn (R) all remain fully functional at all times (verified: R still works mid-puzzle). |
| Does the platform visually match its collision? | Yes — the ledge's art is drawn at the exact same world coordinates as `CRATE_PUZZLE.platform`, and only gains visible full opacity at the same moment its `platform()` collision body is created. |

## Known, disclosed limitation: no tangible reward item

Per the brief's own explicit allowance ("if a meaningful optional reward
cannot be implemented safely using existing objects and geometry... report
that it still lacks a reward"): no new collectible was added to the
ledge. Every existing coin in Zone A (`coin-a`) is already freely
reachable on the ground and was not relocated (moving it would mean
altering already-free terrain access, outside this pass's authorized
scope of "reposition only the V9 crate/switch/platform geometry"). The
reward is currently **access + a one-time discovery cue only**, not an
item. This is honestly disclosed, not hidden, and is a reasonable
candidate for a small future addition (e.g. a dedicated small reward
prop) if/when new art is authorized.

## Does the layout actually look cleaner in real screenshots?

Yes — see `crate-puzzle-before-after.png` and
`visual-composition-review.md` for the full before/after comparison and
specific visual-composition notes (pressure-plate switch, tinted crate,
etc.).
