# V9.5 — Gameplay Variety Proposals (future release, planning only)

None of these are implemented. No arbitrary three-attempt death system is
proposed anywhere here — Story Mode retries stay unlimited in every
proposal, matching the existing crate puzzle's own unlimited-reset design.

## 1. Key + locked door (Zone D, before the workshop-gate)
- **Candidate coordinates:** key prop at x≈1550/feet 980 (on
  `workshop-approach`, before the existing gate at x=1300); door overlay at
  the existing `workshop-gate` position (x 1300, y 980) — purely visual,
  the gate's own solved/unsolved logic is unchanged.
- **Learning objective:** none required — this is a pure navigation/variety
  beat, not a math gate (the function machine already covers D's math).
- **Physical interaction:** walk onto the key, auto-collect (like coins).
- **Reward:** door visual swaps from `kenney_door_closed` to an open
  variant when both the key is held AND the machine is solved.
- **Failure/recovery:** none possible — a key cannot be "failed," only not
  yet collected; approaching the door without it just blocks movement
  exactly as the existing gate already does.
- **Save implications:** none — like the crate, key state should stay
  out of the save schema (route-local, resets on reload, same precedent).
- **Regression impact:** zero geometry change; purely an added visual
  layer on an existing, already-tested gate.

## 2. Input-selection math puzzle (Zone C, optional branch)
- **Candidate coordinates:** a second small terminal on `cafe-deck`
  (x≈900, feet 820) — purely additive, does not touch the existing
  mandatory M1/M2/M3 terminals.
- **Learning objective:** multiple-choice function evaluation (pick the
  correct f(x) from 3 options) — a variant practice format, same curriculum
  topic as the existing machines.
- **Physical interaction:** press E at the terminal, same dialog pattern
  as existing puzzles, but with answer buttons instead of a text field.
- **Reward:** a coin + a short "betul!" cue, reusing existing SFX/particle
  helpers (`SFX.ui`, `sparkleBurst`).
- **Failure/recovery:** wrong pick just re-shows the question (same as
  existing puzzles' wrong-answer handling) — no penalty, unlimited retries.
- **Save implications:** could optionally persist as a 4th optional
  collectible, following the existing `discoveredSecretIds`-style pattern
  — would need a save-schema minor-version bump (v2→v3) if persisted, or
  kept session-only (not persisted) to avoid any schema change at all.
- **Regression impact:** low — entirely additive in C, a zone with no
  mandatory gate.

## 3. Pressure-switch-gated shortcut (Zone F, optional)
- **Candidate coordinates:** a second floor switch near `f-step1` (x≈2900,
  feet 700) wired to a short platform bridging directly to `f-step2`
  (skipping the existing step-down jump) — reuses the exact crate+switch
  mechanism already built and tested in V9/V9.1, just a second instance.
- **Learning objective:** none — pure traversal variety, reusing proven
  code.
- **Physical interaction:** push a second crate (would need its own id,
  e.g. `crate-2`) onto the second switch; identical mechanics to the
  existing one.
- **Reward:** a faster, alternate route through F (not mandatory — the
  existing step-down jump remains the baseline path).
- **Failure/recovery:** identical to the existing crate's auto-recovery
  on fall-into-gap.
- **Save implications:** none, mirroring the existing crate's
  deliberately-unsaved state.
- **Regression impact:** low-medium — adds a second crate instance, needs
  its own regression suite mirroring `tests/v9_phase1_crate.py`, but
  reuses already-hardened code rather than new logic.

## 4. Hidden route (Zone E, optional, cosmetic secret)
- **Candidate coordinates:** a narrow gap in `roof-laundry`'s deck
  (x≈2150–2180) leading down to a small alcove beneath it (new deck at
  y≈820, not currently occupied by anything) containing one secret,
  following the exact `SECRETS` pattern already established in Phase 7.
- **Learning objective:** none — exploration reward, consistent with the
  existing `secret-cave-treasure`/`secret-oyen` precedent.
- **Physical interaction:** drop through the gap, walk to the secret,
  auto-discover (identical to existing secrets).
- **Reward:** +1 to the existing `Rahsia dijumpai: x/3` counter — would
  need to become `x/4` everywhere that string is shown/tested.
- **Failure/recovery:** climbing back up uses the existing ladder-lands-
  on-real-surface pattern; no softlock risk since E already has
  checkpoint-recovery as its safety net (per the existing no-ground-support
  design for this zone).
- **Save implications:** adds one entry to the existing `discoveredSecretIds`
  array — no schema version bump needed (same v2 schema, just one more
  possible id).
- **Regression impact:** medium — touches the `SECRETS` count assumed in
  `tests/v8_phase7_secrets.py` and the completion-summary text assertions
  in `tests/v8_phase8_menu.py`/`v8_7_level_exit.py` (both currently assert
  exactly `1/3`) — would need those updated alongside the new secret.

## 5. One safe traversal obstacle (Zone B, optional variety)
- **Candidate coordinates:** a single Kenney `kenney_block_blue` (already
  in the manifest, currently unused) placed as a one-tile step between
  `town-walk-1` and `town-walk-2` at x≈920, y≈940 — purely cosmetic
  footing variation, not a new jump requirement (B's existing jump
  distances/margins stay untouched).
- **Learning objective:** none — visual variety only.
- **Physical interaction:** none beyond normal walking; it's just a
  step, not a new mechanic.
- **Reward/failure/recovery/save:** none — this is the lowest-risk item
  on this list, effectively just a scenery tile.
- **Regression impact:** none expected — does not change any DECKS/GATES
  geometry, just adds a non-colliding (or flush-colliding, matching ground
  height) visual tile.

All five are additive and none touch `SPAWN`/`GOAL`/mandatory-route
geometry. #1 and #5 are the lowest-risk starting points for a future pass.
