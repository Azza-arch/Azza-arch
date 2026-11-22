# V8 Phase 8.5 — Asset Usage & Composition

Every asset below was already present in `assets/manifest.json` before
this phase; nothing was downloaded. Dimensions are read from
`assets/provenance.json`.

## Zone A — Taman Perumahan

| Element | Asset(s) | Notes |
|---|---|---|
| Two houses | `house_1_full` (448×381), `house_2_full` (448×371) | Different assets side by side — the brief explicitly flags "identical building repeats" as a failure; previously only `house_1_full` appeared. |
| Flag, bush | `flag_malaysia`, `plant_bush` | Unchanged placement, clear of FIRST_GAP (420–540) and the A→B ladder (610). |

## Zone B — Lorong Pekan

| Element | Asset(s) | Notes |
|---|---|---|
| Shopfront 1 (behind town-walk-1) | `h3_wall_lower` + `h3_window_casement` + `h1_roof_porch` via `shopfront()` | Canopy now rests ON the wall — previously a lone `h1_roof_porch` floated with nothing beneath it. |
| Shopfront 2 (behind town-walk-2) | same combo, `h3_roof_hut` canopy instead | Different roof piece from shopfront 1 — avoids repeating the same silhouette twice in one zone. |
| Lamp, plant pot | `lamp_wall`, `plant_pot_leafy` | Clear of the B→C ladder (750) and Machine 1 (1250). |

## Zone C — Café Atas Angin

| Element | Asset(s) | Notes |
|---|---|---|
| Café facade | `shopfront(880, 820, 'h1_roof_porch')` | One recognizable café with an actual canopy, replacing the old single floating `h1_roof_porch`. |
| Plant | `plant_pot_tall` | At CP1's own position, unchanged. |
| Si Oyen marker | unchanged (Phase 7's procedural placeholder) | Clearly distinguishable from the café facade — a small silhouette, not architecture. |

## Zone D — Bengkel Fungsi

| Element | Asset(s) | Notes |
|---|---|---|
| Workshop mass | `h3_wall_lower` + `h3_door_grille` (distinct, named feature) + `h3_parapet` | Positioned so the machine (now `function_machine_idle`/`active`, 169×186 scaled to `MACHINE_SCALE=.55`) stays the visually dominant object — the workshop mass sits beside it, not around it. |

## Zone E — Deretan Bumbung (primary showcase)

| Element | Asset(s) | Notes |
|---|---|---|
| roof-entry facade | `buildingFacade()` (h3_wall_upper/lower) down to y=980 + `h3_roof_hut` cap | Previously: nothing but bare stone-pillar columns. |
| roof-laundry facade | same facade + `laundry_line` (previously unused) | Matches the deck's own name — a small deliberate piece of environmental storytelling. |
| roof-m2 facade | same facade + `water_tank_stand` | Water tank kept at its established spot, now sitting on a real building instead of floating alone. |

All three facades use the exact same `buildingFacade()` call with
different widths (200/200/320px, matching each deck's own `DECKS` width),
so the three buildings read as linked but not identical — confirmed via
`v8-5-platform-art-alignment.png`, which also confirms they stay
perfectly fixed to their decks as the camera pans (no parallax — these
use default `scrollFactor` 1,1, not the distant-background band's parallax
values).

## Zone F — Bukit Tanjung & Gua

| Element | Asset(s) | Notes |
|---|---|---|
| f-step1/cave-alcove/f-step2 support | `rockMass()` — **code-drawn Graphics shape, not an asset** | No rock/cliff production asset exists anywhere in the manifest (checked `assets/kenney`, `assets/production`); documented limitation, see `remaining-art-gaps.md`. |
| Cave mouth | `caveMouth()` — code-drawn dark archway | No cave-entrance asset exists either. |
| Greenery | `plant_bush` ×2 | Around the cave entrance. |

## Zone G — Jambatan Sungai

| Element | Asset(s) | Notes |
|---|---|---|
| River | `riverBand()` — code-drawn wave-pattern band | No water/river asset exists in the manifest; documented limitation. |
| Bank greenery | `plant_bush` ×2 | One per bank. |

## Interactive objects (all zones)

| Element | Before | After | Notes |
|---|---|---|---|
| Checkpoints | `kenney_sign` (64×64, generic) | `checkpoint_post_idle`/`active` (~32×99/34×100) | A real, dedicated checkpoint-post illustration; idle/active states stay clearly distinct (same as before, just better art). Scale chosen so its on-screen height (~99px) matches the player's own apparent height. |
| Function machines | `kenney_lever`/`kenney_lever_left` (64×64, generic) | `function_machine_idle`/`active` (169×186, `MACHINE_SCALE=.55` → ~102px tall) | The production sprite literally shows a small formula display — a much stronger "this is a math machine" read than a generic lever icon. Still the visually dominant object at its own position. |
| Locked gate marker | none (just a text label) | `platform_wood_left`/`right`, angled, destroyed on solve | Previously-unused assets; makes an unsolved crossing visibly incomplete. |

## Assets evaluated and deliberately NOT used

- **`h3_wall_upper`/`h3_wall_lower` as a single huge wall fill** — tried at
  native scale first; at 224–228px wide they were far too large relative
  to the 150–320px-wide decks, producing "massive blank wall fills" (an
  explicitly listed failure mode). Fixed by scaling per-deck
  (`Phaser.Math.Clamp(width/300, .68, 1.05)`) so the facade always spans
  the deck's own width in 1–2 columns, never oversized.
- **`bg_cloud`** — considered for extra sky variety but left unused; the
  existing `kenney_bg_clouds` layer already covers that role and adding a
  second, different-style cloud asset risked "mixing illustration styles
  unintentionally" (an explicit acceptance-criteria concern).
- **Kenney stone tiles (`kenney_block_center` etc.) as decoration** — kept
  ONLY for `deck()`'s actual collision-aligned surface art (unchanged, it
  already reads clearly and consistently across 8 prior phases); removed
  from the SUPPORT-PILLAR role specifically, since that was the one place
  they read as "random tiled pillars."

## Scale-consistency rule (documented, applied project-wide this phase)

Every new "important marker" (checkpoint post, function machine) is sized
so its own on-screen height approximates the player's apparent height
(~99px at `BASE_SCALE=.158`) — a simple, repeatable rule that keeps new
and old elements reading at one consistent scale language rather than
ad hoc per-asset guessing.
