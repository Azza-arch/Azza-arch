# Lorong Atas Bumbung — V6.2 Current Problems

**Status: evidence only. No source modified.** Source of truth: live `app/addmath/rooftop/src/level.js` (read in full for this pass), cross-checked against `audits/level-v6.1/level-v6.1-implementation-report.md` (what V6.1 actually shipped) and `audits/level-v6.1/level-v6.1-blueprint.md` (the proposal that preceded it — note its x-coordinates are **not** what got implemented; the live file is authoritative).

---

## 1. Zone B (`lorong-pekan`, x=1100–2200): optional-only, no genuine shortcut

Live geometry:
- `DECKS`: `awning-b1` (1250–1370, y900), `awning-b2` (1500–1620, y900), `awning-b3` (1750–1870, y900) — three platforms, identical height, identical width (120px).
- `LADDERS`: up at x=1280 (900↔1000), down at x=1850 (900↔1000).
- `GROUND_RANGES` includes `[540, 3850]` — i.e. the street beneath the entire awning run is **continuous and unbroken**.

**The problem, concretely:** a player who never touches the ladder, never jumps an awning gap, and never leaves y=1000 reaches the café (Zone C) exactly as fast as, or faster than, a player who climbs up, makes two flat 130px jumps, and climbs down. The upper route's only payoff is `coin-b1` and `coin-b2` (repositioned above b1/b3 in V6.1). This is exactly the Part 4.1 failure case named in the brief: *"to reach a coin and return to the same street."* The three awnings also read visually as one repeated shape (confirmed in `level-v6.1-implemented-geometry.png`), even though V6.1 already fixed the *gap-sizing* bug from V6 — the shape problem V5 originally flagged is still present because nothing about the route makes leaving the street worthwhile in time or access.

## 2. Zone E (`deretan-bumbung`, x=4300–6150): rooftop chain is bypassable, so it is not progression-critical

Live geometry:
- `DECKS`: `roof-e1` (4550–4690, y960), `roof-e2` (4800–4960, y896), `roof-e3` (4880–5040, y800, ladder-only), `roof-e4` (5200–5350, y940).
- `LADDERS`: single ladder at x=4900 (800↔896) for the one rise too big to jump.
- `GROUND_RANGES` includes `[4300, 5650]` — continuous street under the **entire** chain, including the terminal.
- `TERMINALS`: `p2` at x=5570, feet=1000 — on the street, not on any deck.
- `GATES`: `rooftop-gate` at x=5650, width=500.

**The problem, concretely:** `p2` (Puzzle 2, the function machine gating `rooftop-gate`) sits at ground height on a ground range that runs unbroken from the workshop-gate exit (x=4300) straight to the terminal (x=5570) and the gate itself (x=5650). A player can walk the entire distance from Zone D's exit to Puzzle 2 without ever touching `roof-e1`–`roof-e4` or the ladder. V6.1's own implementation report calls this chain "varied" and "directional," which is true of its *shape*, but shape was never the gating problem — reachability was. The rooftop traversal is cosmetically distinct from Zone B's but functionally identical to it: optional, coin-rewarded, skippable. This directly matches Part 9's stated problem: *"The game currently does not sufficiently justify the sequence JUMP UP → CLIMB → JUMP DOWN → REACH MACHINE 2."*

## 3. Repeated tower/ladder geometry (historical, partially resolved)

V6.1 already resolved the literal shape-duplication V5/V6 flagged (Zone B flat/same-height vs Zone E varied-height/one-ladder — confirmed by diffing `DECKS` above). This is not re-flagged as a problem in itself. What V6.1 did **not** address — and what V6.2 must — is that fixing the *shape* of the two zones did nothing to fix the *access* problem: both zones are still "look nice, skip freely."

## 4. Long flat stretches with no local variation

- Zone D approach: already shortened to ~430px in V6 (confirmed `workshop-gate` at x=3850 vs `TERMINALS.p1` at x=3750 — a ~100px machine-to-gate approach, not the 870px flagged in V5). **No further action needed**; out of scope, matches V6.1's own "already APPROVE" finding.
- The lower street under Zone E (`[4300, 5650]`, 1350px) is the longest single uninterrupted flat ground segment in the level once Zone D's approach is excluded. This is a symptom of problem #2, not a separate issue — fixing Zone E's access also breaks up this stretch.

## 5. Machines read as quiz terminals, not environmental mechanisms (Zone E specifically)

Puzzle 1 (`p1`, Zone D) is approached through a visibly blocked route (`workshop-gate` directly ahead of the terminal) — this already satisfies Part 4.5's "OBSTACLE → DISCOVER SOLUTION → SOLVE FUNCTION → WORLD CHANGES → PROGRESS" loop and needs no change. Puzzle 2 (`p2`, Zone E) does **not**: because the terminal sits on open, already-reachable ground, there is no obstacle to discover — the player just walks up to it. Puzzle 3 (`p3`, Zone G) is approached via `final-gate` at the river, also already a visible obstacle — no change needed.

## 6. Visual readability (unchanged from V6.1, flagged but out of scope for geometry decisions)

- Camera: `offsetY=10`, `bounds.top=480` (already implemented in V6.1, per `game.js:71-78`). Confirmed unchanged live. No further camera change is proposed in this pass — Part 14 of this brief is design-only and the camera is explicitly code the brief says not to touch.
- No dedicated Kenney sprite exists for an "awning" or "rooftop deck" — V5/V6/V6.1 all accepted this and represented it with greybox deck+ladder tiles. Same acceptance carries into V6.2 (Part 15).

## 7. Missing/assumed artifacts, disclosed per instructions

`audits/level-v6/` contains only `level-v6-feasibility-review.md` (no blueprint/topology PNG under that folder — the external V6 blueprint referenced throughout V6.1's docs lived outside the repo, at a user Downloads path, and was not re-fetched for this pass since the live `level.js` supersedes it as source of truth). All other priority references in Part 2 of the brief were found and read in full.
