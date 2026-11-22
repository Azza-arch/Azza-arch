# Lorong Atas Bumbung — V6.3 Zone-by-Zone Composition Plan

**Status: design-only proposal, Option A (mixed asset family) from `level-v6.3-art-direction.md`.** All x/y coordinates below are the live, unchanged V6.2 geometry from `src/level.js` — no gameplay coordinate is altered anywhere in this document. Every "what must not change" line is a direct restatement of a V6.2-approved value.

---

## ZONE A — Taman Perumahan (x: 0–1100)

- **Foreground gameplay:** unchanged — spawn at x156/feet1000, continuous ground `[0,420]`, `FIRST_GAP` (x420, width120), continuous ground `[540,3850]` resumes here through to Zone D.
- **Midground architecture:** 2–3 instances of `house_1_full`/`house_2_full`, placed behind the ground line at varied x (e.g. x≈200, x≈750), scroll factor ~.55, never overlapping `FIRST_GAP`'s x-range so the jump stays visually unambiguous.
- **Background:** single `bg_house_row` (256×160, repeats) at the lightest tonal step, scroll factor ~.3, spanning the full zone width; one `kenney_bg_clouds` instance (already present, unchanged).
- **Interactive objects:** none in Zone A (no puzzle, no checkpoint) — matches the brief's own "No required mathematics" rule for this zone.
- **Props:** one `flag_malaysia` near spawn (establishes place immediately, used once per the art direction's cap), one `plant_bush` near the FIRST_GAP landing.
- **Asset mapping:** `house_1_full`, `house_2_full`, `bg_house_row`, `flag_malaysia`, `plant_bush` — all currently unused, all already in `manifest.json`.
- **Visual risks:** `house_1_full`/`house_2_full` are the illustrated-family style (outline/hatching) — placed midground-only, never collidable, never overlapping the FIRST_GAP jump arc.
- **Must not change:** `SPAWN` (156,1000), `FIRST_GAP` (420,120), `GROUND_RANGES[0]`/`[1]`.

---

## ZONE B — Lorong Pekan (x: 1100–2200)

- **Foreground gameplay:** unchanged V6.2 geometry — `awning-b1` (1250–1370, y900), `awning-b2` (1510–1660, y960), ladder-up x1280, ladder-down x1630, continuous street beneath.
- **Midground architecture:** `h3_roof_hut` instances (130×90, small shopfront silhouette) placed directly behind `awning-b1` and `awning-b2` at a slightly higher scroll factor than background (~.5), suggesting the awnings are shopfront canopies, not freestanding platforms — this is the single most direct fix for visual audit #3.
- **Background:** continuation of `bg_house_row` from Zone A (visual continuity per §8 of the brief), lightening slightly to suggest "approaching town center."
- **Interactive objects:** none (no puzzle in Zone B) — coins only (`coin-b1` x1310/y770, `coin-b2` x1585/y830, both unchanged).
- **Props:** one `lamp_wall` near the ladder-up, one `plant_pot_leafy` near the lower street (reinforces "street," low style-risk).
- **Asset mapping:** if Layer 3 is also upgraded (art direction §0 Option A), `platform_wood_*` + `platform_post` replace `kenney_deck_*`/`kenney_block_center` for `awning-b1`/`awning-b2` specifically — directly fixes audit #2/#4 ("arbitrary tile pillars") since `platform_post` is a proper post/strut shape, not a stacked filler block.
- **Visual risks:** `h3_roof_hut` behind two platforms at different heights (900 vs 960) must be scaled/positioned per-platform, not copy-pasted identically, or the "avoid repeating identical tower silhouettes" goal (already won at the gameplay level in V6.2) would be visually undone by identical background shopfronts.
- **Must not change:** `awning-b1`/`awning-b2` coordinates, both ladders, no street obstacle (already confirmed absent in V6.2 — this pass must not reintroduce one even as decoration that reads as an obstacle).

---

## ZONE C — Café Atas Angin (x: 2200–3100)

- **Foreground gameplay:** unchanged — `cafe-roof` deck (2700–2880, y824), ladder x2720, `CHECKPOINTS[0]` (2750, feet1000).
- **Midground architecture:** `h1_roof_porch` (213×65) positioned directly above/behind the checkpoint, at ground-adjacent height — this is the inventory's single best-match asset for "a recognizable café-front shape," placed so the checkpoint visually sits "at the café" rather than "near an unrelated sign."
- **Background:** `house_3_full` (tallest of the three house sprites, 468×519) as a single two-storey backdrop behind the café roof, establishing the café as part of a larger building rather than a standalone platform.
- **Interactive objects:** `checkpoint_post_idle/active` at (2750,1000) — direct swap from `kenney_sign`/`kenney_flag_a`, same two-state mechanism.
- **Props:** one `plant_hanging` under the `h1_roof_porch` canopy (a café-specific accent), one `plant_pot_tall` at ground level.
- **Asset mapping:** `h1_roof_porch`, `house_3_full`, `checkpoint_post_idle`, `checkpoint_post_active`, `plant_hanging`, `plant_pot_tall`.
- **Visual risks:** none significant — `h1_roof_porch` is small and iconic (low style-risk per the inventory sampling); `house_3_full` is midground/background-only.
- **Must not change:** `cafe-roof` deck, its ladder, `CHECKPOINTS[0]`. No interior, no NPCs, no purchasing system, no new climbing sequence (all explicitly forbidden in the brief).

---

## ZONE D — Bengkel Fungsi (x: 3100–4300)

- **Foreground gameplay:** unchanged — `TERMINALS.p1` (3750,1000), `GATES.workshop-gate` (3850, width450).
- **Midground architecture:** a small composed structure from `h3_wall_lower`/`h3_wall_upper` + `h3_door_grille` directly behind the M1 terminal, reading as "the workshop the machine belongs to" — composed from modular parts, not a stacked-terrain-block fake building (per the brief's explicit prohibition).
- **Background:** continuation of the town backdrop, thinning out (fewer house silhouettes than B/C) to signal "edge of town, approaching the rooftop district."
- **Interactive objects:** `function_machine_idle/active` at (3750,1000) — direct swap from `kenney_lever`, gains the explicit `f(x)=2x+1` readout already drawn into the sprite itself (per the inventory sampling), reinforcing "this is a function machine" without relying solely on the `MESIN 1` text label.
- **Props:** none beyond the workshop structure itself — Zone D's visual interest should come from the machine/gate relationship, not from set dressing, per the brief's "minimal pipe/gear motifs if approved assets support them" (none exist in the inventory beyond what `h3_door_grille`'s industrial-grille look already implies — no further addition recommended).
- **Asset mapping:** `h3_wall_lower`, `h3_wall_upper`, `h3_door_grille`, `function_machine_idle`, `function_machine_active`.
- **Visual risks:** the workshop structure must stay clearly behind/around the terminal, not in front of it, so the interaction prompt (`E · Gunakan mesin`) is never visually obstructed.
- **Must not change:** `TERMINALS.p1`, `GATES.workshop-gate`, Puzzle 1's formula/answer (`f(3)=7`).

---

## ZONE E — Deretan Bumbung (x: 4300–6150)

- **Foreground gameplay:** unchanged V6.2 geometry (post-V6.2 implementation) — `roof-e1` (4550–4690,y960), `roof-e2` (4800–4960,y896), `roof-e3` (4880–5040,y800, hosts `TERMINALS.p2` at x5020/feet800), `roof-e4` (5200–5350,y940, optional branch), single ladder x4900, continuous recovery street `[4300,5650]`.
- **Midground architecture:** a low, continuous roof-mass silhouette (composed from `h3_roof_hut` repeated/varied + `h3_parapet` as a top-edge trim) running beneath the entire `roof-e1`–`roof-e4` chain, at a height below the platforms themselves (never overlapping their collision y-range) — this is the direct fix for "make the platform chain look like a connected rooftop environment rather than floating rectangular blocks."
- **Background:** `bg_hills` at the far distance (very light tonal step), suggesting Bukit Tanjung is visible from here, foreshadowing Zone F.
- **Interactive objects:** `function_machine_idle/active` at `roof-e3` (x5020,feet800) — the terminal must remain the single most visually prominent object on `roof-e3` (per the brief's explicit "do not obscure the terminal"), so the roof-mass silhouette behind it stays at the lower midground contrast step, never competing with the machine's Layer-4 contrast.
- **Props:** one `water_tank_stand` (128×198) on the background roof-mass, reinforcing "rooftop" at a glance, placed away from any jump trajectory.
- **Asset mapping:** `h3_roof_hut`, `h3_parapet`, `bg_hills`, `function_machine_idle`, `function_machine_active`, `water_tank_stand`.
- **Visual risks (explicit, per the brief's own Zone E warning):** the roof-mass silhouette is background art only — it must never be given a Phaser physics body, and it must sit entirely below the lowest platform's collision box (`roof-e4` at y940) in z-order and, where it might appear to extend toward the street, must not visually suggest a climbable surface from ground level (satisfying "do not visually suggest a fake shortcut from below to Machine 2," which is now also structurally impossible per the V6.2 interaction-range work, but must not be visually re-implied by careless art placement).
- **Must not change:** every `DECKS`/`LADDERS`/`TERMINALS.p2` coordinate from the V6.2 implementation — this zone's gameplay geometry is the most recently hardened in the whole level and this pass must not touch any of it.

---

## ZONE F — Bukit Tanjung & Gua (x: 6150–6800)

- **Foreground gameplay:** unchanged — `hill-plateau` (6700–7400,y824), `gua-alcove` (6400–6550,y824), ladders x6720/x6460, `CHECKPOINTS[2]` (6780,824).
- **Midground architecture:** none (per the brief's own "low, gentle hillside silhouettes," not buildings) — a simple rising terrain-contour shape using the existing `kenney_block_blue` flat-color technique (already proven at the cave entrance) extended slightly, not a new asset.
- **Background:** `bg_hills` continues from Zone E, now closer/slightly darker to signal arrival.
- **Interactive objects:** `checkpoint_post_idle/active` at (6780,824).
- **Props:** `plant_bush` scattered sparingly along the hillside (2 instances max).
- **Asset mapping:** `bg_hills` (continued), `kenney_block_blue` (existing technique, already used for the cave entrance — this pass only extends its existing use, adds no new asset), `checkpoint_post_idle/active`, `plant_bush`.
- **Visual risks:** minimal — this zone intentionally uses the least new art of any zone, matching the brief's "do not create a massive cave dungeon" / "small hillside outside town" framing.
- **Must not change:** `hill-plateau`, `gua-alcove`, both ladders, `CHECKPOINTS[2]` — the optional cave alcove's accessibility is explicitly protected per the brief.

---

## ZONE G — Jambatan Sungai & Destinasi (x: 6800–7400)

- **Foreground gameplay:** unchanged — `TERMINALS.p3` (6820,824), `GATES.final-gate` (6900,width350), `GOAL` (7330,824).
- **Midground architecture:** none required — the brief asks for "recognizable separation between riverbanks," which is a ground-texture/color read (e.g. a visually distinct tile or tint on either side of the gate, still using existing ground tiles, no new asset), not a building silhouette.
- **Background:** `bg_hills` fades out here (the journey's visual "coming down" from the hill), replaced by open sky — a deliberate emptier background at the very end, read as "the destination is the clearing itself," not a visual oversight.
- **Interactive objects:** `function_machine_idle/active` at (6820,824), goal flag unchanged (`kenney_flag_a/b`).
- **Props:** none beyond what's already present — this zone should read as a clean, open climax, not a decorated one.
- **Asset mapping:** `function_machine_idle`, `function_machine_active` (if Option A approved); otherwise unchanged.
- **Visual risks:** the bridge (`kenney_bridge`, already visually distinct from ground) must stay the clearest, most legible element in the zone — "give the level a clear visual climax" is served by restraint here, not by adding more art.
- **Must not change:** `TERMINALS.p3`, `GATES.final-gate`, `GOAL`, Puzzle 3's formula/answer (`4x-3=17 ⇒ x=5`), completion behavior.
