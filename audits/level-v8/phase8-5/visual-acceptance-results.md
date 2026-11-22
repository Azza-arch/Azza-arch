# V8 Phase 8.5 — Visual Acceptance Results

Evaluated against the brief's five criteria (A. architectural coherence,
B. gameplay readability, C. composition, D. world continuity, E. art
consistency). Not every zone gets a blanket PASS — two are flagged with
honest, specific weaknesses below.

## Zone A — Taman Perumahan: **PASS**

- A. Two distinct houses (`house_1_full`, `house_2_full`) — reads as a
  real small street, not a repeat.
- B. Ground, FIRST_GAP, and the A→B ladder all remain exactly as readable
  as before (unchanged collision, confirmed by `probe.py`'s "A: first gap
  jumped" / "A->B: ladder climbed" assertions passing unmodified).
- C. Houses sit directly on the ground surface, no floating silhouettes.
- D. Transitions cleanly into B's shopfront row via the shared
  `bg_house_row` background band.
- E. Grayscale values and outline weight consistent with every other
  zone.

## Zone B — Lorong Pekan: **PASS**

- A. Two linked shopfronts (wall+window+canopy each), canopies now
  genuinely resting on their walls.
- B. The town-walk jump (the one real jump in this zone) is completely
  unobstructed by the new art — confirmed via `probe.py`'s "B: real jump
  to town-walk-2 landed" check, unaffected.
- C. Reasonable density; not every inch of the deck is covered in props.
- D/E. Consistent with A and C.

## Zone C — Café Atas Angin: **PASS, with a flagged weakness**

- A. The café facade is recognizable as a building with a canopy.
- **Weakness**: it reuses the exact same `shopfront()` combo and
  `h1_roof_porch` canopy as B's first shopfront — at a glance, the café
  does not read as meaningfully MORE distinct from an ordinary shopfront
  than the brief's "one recognizable café facade" implies it should. A
  genuinely distinct café silhouette (e.g. a wider canopy, a counter prop)
  would need either a different existing asset combination not yet tried,
  or new art — documented in `remaining-art-gaps.md` rather than forced
  through with a mislabeled claim of success.
- B. Checkpoint 1 and Si Oyen remain clearly, individually visible and
  distinguishable from the facade (confirmed via screenshot).
- C/D/E. Otherwise consistent.

## Zone D — Bengkel Fungsi: **PASS, modest**

- A. Wall + door/grille + parapet reads as "a workshop", but the mass is
  noticeably smaller/sparser than B's or C's compositions — an honest
  "adequate, not a highlight" zone.
- B. The machine (`function_machine_idle`/`active`) remains the visually
  dominant object at its own position — confirmed by screenshot, the
  workshop mass sits beside it, never crowding it.
- C. Slightly sparse composition; acceptable but the weakest "filled-in"
  zone alongside C.
- D/E. Consistent.

## Zone E — Deretan Bumbung: **PASS — strongest zone**

- A. Three linked building facades, each with its own themed roofline
  (hut / laundry line matching the deck's own name / water tank) —
  directly satisfies "distinct linked building silhouettes" and "light
  environmental storytelling."
- B. The climb to Machine 2 remains mandatory and fully readable; the M2
  bypass-blocked checks in `probe.py` pass unmodified.
- C. Genuine visual depth — three buildings at three different heights,
  not a flat repeat.
- D. Confirmed via `v8-5-platform-art-alignment.png`: the same three
  buildings stay precisely fixed to their decks across three camera pan
  positions — no parallax drift.
- E. Consistent grayscale/outline language with every other zone.

## Zone F — Bukit Tanjung & Gua: **PASS**

- A. The jagged rock silhouette reads clearly as hillside terrain, not a
  building — correctly distinct from every other zone's architecture.
- B. The optional cave is now visibly marked (a dark archway) instead of
  only a text sign; the main stepped-descent route is unaffected
  (`probe.py`'s "F: step-down jump landed on f-step2" passes unmodified).
- C. Reasonable composition — not an oversized mountain filling the
  screen, as the brief explicitly warned against.
- D. Flows naturally from E's rooftops into F's hillside via the existing
  `bg_hills` overlap band.
- E. The rock shape is intentionally simple code-drawn geometry (see
  `remaining-art-gaps.md`) — consistent in weight/tone with the rest of
  the grayscale identity, but a simpler medium than the illustrated
  production assets elsewhere. Disclosed, not hidden.

## Zone G — Jambatan Sungai: **PASS, sparse**

- A. The river band gives the final crossing an actual "river" identity
  it previously lacked entirely.
- B. Before/after gate screenshots (`v8-5-before-after.png`) confirm the
  crossing visibly looks blocked before the puzzle is solved and shows a
  real, matching bridge afterward — directly satisfying the brief's
  explicit before/after requirement.
- C. The zone remains the sparsest of the seven — acceptable for a "simple
  recognizable destination" per the brief, but there is room for more
  bank detail in a future pass (see `remaining-art-gaps.md`).
- D/E. Consistent.

## Overall

5 of 7 zones are unreserved passes; 2 (C and D) pass with specific,
named weaknesses rather than being marked as flawless by default. No
zone was accepted merely because it "contains an identifiable prop" —
each was checked against actual connection to terrain, scale consistency,
and gameplay readability before being marked.
