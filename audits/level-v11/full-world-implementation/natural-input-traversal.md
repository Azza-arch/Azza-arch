# Phase 4 natural-input traversal

Current executable: `phase4_natural_input.py`; evidence: `logs/phase4-natural-input.json`. PASS, total automated session 88.86 seconds. This includes desktop plus mobile; it is not a human playtime estimate.

Fresh A → crate/plate and bonus ledge → first gap → C mapping inputs0–3 and return → B probe, wrong/correct lift and crossing → D optional service ladder, wrong/correct number span and composition primer → corrected E steps, service passage, coin, pool, wrong/correct composition and crossing → F ridge, lower passage, wrong/correct inverse, reward and opposite ladder → G wrong/correct h input, wrong/correct composition, animated bridge, far bank → goal shelf and E interaction → completion → reload Continue.

The route uses keyboard/touch and visible UI actions. Runtime state is read for waits/assertions; no player teleport, forced gate solve or physics constant change is used in the full route. The mobile subtest explicitly loads an earlier-progress save fixture at G and uses emulated touch from there; it is not a full mobile A–G run.

Additional fixture-based scenarios in `phase4_state_checks.py` / `logs/phase4-state-checks.json`:
- Pause freezes active timer; Resume restores play.
- First latch persists alone; mid-animation reload restores safe bridge.
- Unsolved optional F entry and return via opposite ladder; main route reaches G.
- F lower route skipped safely.
- C upper branch skipped: natural jumps on B main route reach lift.
- Restart returns to A.

Desktop speed280px/s, jump520 and gravity1400 remain unchanged. Ideal apex96.6px; mandatory authored rises are54px. The 324px river remains gated rather than requiring an impossible jump. C and the F lower branch are optional.
