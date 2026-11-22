# Three lightweight UI directions

Planning comparison, not implemented themes or generated mockups. **Recommend direction1: Timber edge.** The experience mode is play: the world should remain the main surface, with readable controls attached to the current action.

Palette evidence: sampled opaque pixels from the actual packed atlas. Wood48–50/89 supplies `#6f3e43`, `#9f5a52`, `#cb815e`, `#f4ac66`; terrain supplies outline `#434a5f`, foliage `#2eb082`/`#36e377`; water33/73 supplies `#2cc5f6`/`#4ce5fd`; coin151 supplies `#f4b41b`/`#fee481`. These are color sources, not an assertion that every pairing passes contrast.

| Direction | Pixel-art coherence | Readability | Mobile | Accessibility | Scope |
|---|---|---|---|---|---|
| **1 Timber edge — recommended** | Flat wood-dark surfaces, small warm edge, hard corners; echoes decks without pretending UI is a new wooden sprite | Pale text on wood-dark; gold reserved for action/focus. No wood texture behind paragraphs | Compact controls and short strips; optional full-width help sheet | Strong focus outline, text+shape status, 48px controls; verify exact contrast | Medium: shared CSS/Phaser tokens plus contextual controls; no new art/font |
| **2 River slate** | Slate outline color with blue water accent; clean, cooler identity | Strong light-on-slate reading; blue only for active flow, not body text | Very compact, less ornament | Straightforward contrast; blue alone must not encode correctness | Low–medium; easy token reuse but E could visually dominate every zone |
| **3 Bright trail** | Sky stays visible; small pale-gold plaques and dark outline text, minimal persistent containers | Good on quiet sky, fragile over foliage/soil; needs opaque text backing | More room for the world, but multi-line plaques can spread | Requires careful placement and contrast across every camera view | Medium–high placement work despite small CSS change; less robust portrait help |

Direction1 relates controls to recurring timber without making every panel resemble a wooden crate. Use `#6f3e43` as the candidate surface and `#fee481` for short headings/focus; retain an existing pale text color for body copy if measured contrast requires it. Keep saturated green/blue in the game world. CSS rectangles, borders and text are allowed UI, not invented asset-pack sprites.

## Typography and component rules · PROPOSE

- Reuse existing installed stacks: system sans for readable Malay prose, existing monospace stack for numbers/equations. No new font download; no unverified pixel font. Pixel coherence comes from spacing, edges and restraint, not making every sentence a jagged display face.
- Prefer short action labels: `Masukkan`, `Uji`, `Jalankan`, `Bantuan`. Remove `Blok 0–9` answer grids from the normal flow when the associated world interaction replaces them.
- Hard corners and a restrained2px border; no soft card shadows or nested dashboard boxes. Sprite rendering stays crisp; do not apply nearest-neighbor rules to normal HTML text.
- Body text at least16 CSS px in help and controls; minimum48×48 touch targets. Preserve keyboard focus, Escape/back and explicit labels. Verify normal-text contrast4.5:1 and meaningful control/focus contrast3:1 before approval of implemented tokens. Do not use color alone for locked/safe or selected states.
- One transient message at a time near play: immediate safety/state feedback outranks contextual dialogue, which outranks zone arrival. Mission notes retain deferred information. No automatic help opening; explicit help pauses, ordinary world feedback does not.

## Effect on each surface

| Surface | Proposed change | Preserve |
|---|---|---|
| Title | Keep actual landscape and Chill Boy; smaller wordmark block `DENAI / Bab 1: Misi Fungsi`; primary Continue or Start, secondary options grouped below. Remove the impression of a floating menu-only ground slab if it reads as playable scenery. [Current title](evidence/title.png) | Existing actions, settings, save handling; no cinematic or new portrait |
| HUD | Compact collection indicator with existing coin, pause at opposite top corner; move redundant `Level 1` into pause/title | Counts and accessible text; no new score system |
| Objective | One short line below HUD: `Pulihkan pengangkat.` / `Lintas jambatan sungai.`; expands notes only on request | Rereadable mission state and optional-route distinction |
| Contextual controls | One verb for highlighted world target; screen-safe control strip only during adjustment. Fix `Guna · Guna` | Existing movement/jump controls; clear keyboard/touch parity |
| Math feedback | Tested input→intermediate→output near the mechanism, with a small backing where needed; previous experiment accessible in notes | Exact equations, domain where relevant, optional hints and worked answers |
| Pause | Centered compact timber-edge menu over frozen visible world; Resume first, recovery/help/settings below, restart separated | Confirmation for destructive restart, notes and current focus behavior |
| Results | Keep destination visible behind concise `Bab 1 selesai`; collection/secrets/time from verified state, optional learning recap collapsed | Goal validation, honest counters, Replay/Main Menu and completed Continue |

## Responsive composition

Desktop: leave the mechanism and target landing free of menus. Portrait: HUD top, touch movement bottom; the action/readout occupies a reserved short band only when needed. If a world label cannot avoid player/jump surfaces, move its text to that band and identify the active target; do not shrink it to illegibility. Landscape: respect thumb zones and horizontal safe insets. Hints may use a paused scrollable sheet because they are explicitly requested reading, not the default play loop.

No theme is approved yet. Review direction1 together with the B/G interaction sequence; approving colors alone would leave the principal experience problem unresolved.
