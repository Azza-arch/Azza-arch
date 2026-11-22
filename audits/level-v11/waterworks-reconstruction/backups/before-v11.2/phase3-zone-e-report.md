# Phase 3 - Zone E R11-R12

## Scope and reference

Implemented only Zone E, ending at x5650. The V11.1 improved map is present and openable at `app/addmath/rooftop/docs/level-reference/v11-1-master-map.png`; it guided composition. The approved 180-frame Kenney catalog remains the asset source of truth. Zone F/G were not started. The pre-Phase-3 reversible backup is `backups/v11-pre-phase3.zip`.

## Playable rooms

- R11 (x4104 to 4860): raised timber route, two gap transitions, ladder entry/return, lower recovery floor, checkpoint and optional coin.
- R12 (x4860 to 5650): input-3 composition terminal, two selectable operation orders, safe lower crossing recovery, paired return ladders, animated water crossing and far-bank checkpoint.
- The player selects f then g or g then f in the interaction panel. f(x)=2x+1 and g(x)=3x-2. At input 3, g(f(3))=g(7)=19 is correct; f(g(3))=f(7)=15 is the calculated wrong-order result and remains retryable. The interaction confirms the result, closes automatically, animates water into the reservoir, then raises the crossing. Collision is added after the bridge stops. Solved state restores the filled reservoir, bridge and collision safely.
- Existing movement, audio, touch, A/B/C/D puzzles and isolated V11 saves were retained. V9/V10 files and their save data were not changed.

## Pipe-connection correction

The first R12 capture made the source and reservoir connection unclear. The source tank now sits at x4428-4536,y702-810 and meets frame94 at x4536,y756. Frames133/134 span x4590-5130 and a frame133 inlet at x5130 visibly enters the reservoir at x5130-5238,y702-810. A two-plank frame48/50 cradle and rooted frame89 posts support the tank. Outlet frames95/115/135 overlay the tank base at x5184 from y756; frame134 runs horizontally at y918 to the separate frame64 lever at x5238. All water and pipe sprites remain decorative. Collision belongs only to the final bridge platform.

Coordinates for terrain, decks, ladders, supports, terminal, reservoir and gate are recorded in `world-coordinates.csv`. Exact frame usage and instance changes are in `asset-frame-map.md`.

## Verification

- Natural-input browser route R01-R12: PASS, 64.89 seconds automated desktop route; emulated mobile touch ladder/jump: PASS. Zero page errors, console errors or failed network requests.
- Browser captures include R11 arrival/lower recovery, locked pipe network, composition UI, wrong-order result 15, correct-order result 19, water flow, opened crossing, far-bank checkpoint, Continue restore and mobile viewport. See `screenshots/phase3/`.
- Save/Continue restored the solved crossing safely. Wrong order stayed retryable. Correct order closed UI automatically, filled the tank, animated bridge and only then enabled collision.
- Unit suites: legacy level 12/12, V10 6/6 and full-world V10 13/13; V11 math 4/4; V11 Phase 3 3/3. JS syntax checks passed for changed modules.
- Math, traversal, save and regression details are cross-linked in `math-mechanics-verification.md`, `natural-input-traversal.md`, `save-compatibility-report.md` and `regression-results.md`.

## Stop point

Zone E R11-R12 is implemented. Stop for review here. Zone F/G are not implemented; do not treat this as a completed Level 1. No commit, push, deployment or destructive cleanup was performed.
