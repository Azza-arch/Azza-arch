# Science Quest — Kenney UI Pack inventory

## Scope and method

Audited the user-provided `kenney_ui-pack.zip` in place without extracting or changing its contents. Images were inspected from the archive and categorized using both their visible appearance and archive paths. Contact sheets show all 868 UI PNG files plus the two bundled reference previews. Counts below distinguish physical files from repeated size, color, and format variants.

## Pack summary

| Category | Files | Notes |
| --- | ---: | --- |
| UI component PNGs | 574 | Buttons, checkbox/radio states, sliders, input fields, dividers |
| Icon PNGs | 294 | Directional arrows, basic symbols, stars, play/repeat controls |
| SVG UI files | 434 | Vector counterpart/variant set; some are in the `Extra` group |
| Reference PNGs | 2 | `Preview.png` and `Sample.png`; presentation images, not game backgrounds |
| Fonts | 2 | Kenney Future and Kenney Future Narrow TTF |
| Sounds | 6 | Click, switch, and tap OGG effects |
| License | 1 | `License.txt` |
| Link shortcuts | 2 | Kenney website and Patreon |
| **Total** | **1,315** | All non-directory ZIP entries |

There are 100 named UI designs represented in both PNG and SVG (61 component designs and 39 icon designs), before counting color and scale variants. The `Default` and `Double` PNG folders contain 434 files each; `Double` is the larger raster variant. Five color folders are present: Blue, Green, Grey, Red, and Yellow. The monochrome `Extra` group contains additional controls and symbols.

## A. UI components

| Component | Included | Assessment |
| --- | --- | --- |
| Buttons | Rectangle, round, square; flat, gloss, gradient, border, line and depth treatments | Strong reusable base controls. Prefer one restrained flat/depth style per state. |
| Panels / windows | No dedicated panel or window family | Button-like rectangles can be evaluated as stretchable pieces, but complete dialog/window frames are absent. |
| Sliders | Horizontal and vertical tracks, color/grey sections, handles | Suitable for simple settings or a magnet-strength control after interaction/state testing. |
| Progress bars | No explicit filled progress-bar component | Can be assembled from track/fill primitives, but the pack does not provide a complete, labeled progress meter. |
| Tabs | No explicit tab component | Create as a composition from buttons and text if needed. |
| Checkboxes / radio-like controls | Square and round states, marks, crosses, circles | Useful for quiz and settings states; validate state contrast at intended display size. |
| Input fields | Rectangle and square, outlined and plain | Available in `Extra`, but no text, caret, or error-state artwork. |
| Navigation elements | Basic/decorative arrows in four directions; play and repeat symbols | Suitable for compact game navigation. Avoid using tiny variants for touch targets. |

## B. Icons

Available icon families include directional arrows, checkmark/cross/circle/square symbols, filled/outlined/depth stars, and play/repeat symbols. The pack does **not** include trophy, coin, heart, settings/gear, science, magnet, force, space, body, plant, animal, or electricity icons.

## C. Other visual assets

- No usable gameplay backgrounds, characters, scenery, decorative illustrations, or science-topic artwork are included.
- `Preview.png` and `Sample.png` show assembled UI examples, including generic sample text and layouts. Treat them as documentation/reference images, not production backgrounds or ready-made Science Quest screens.
- No sprite sheets or animation frames were identified; the pack contains discrete static UI images.

## D. File formats and path conventions

- Raster: 870 PNG files total, including two reference previews; 868 are individual UI elements.
- Vector: 434 SVG files.
- Fonts: 2 TTF files.
- Sound: 6 OGG files.
- Documentation/link: one TXT license and two URL shortcuts.
- Common archive roots: `PNG/<Color>/<Default|Double>/`, `PNG/Extra/<Default|Double>/`, `Vector/<Color>/`, and `Vector/Extra/`.
- Most asset names describe their role and style, e.g. `button_rectangle_depth_flat.png`, `slide_horizontal_color.png`, and `icon_play_dark.svg`.

See [the selection report](ASSET_SELECTION.md), [technical report](TECHNICAL_ASSET_REPORT.md), [license audit](LICENSE_AUDIT.md), and [missing-assets list](MISSING_ASSETS.md). Contact sheets are in [`contact-sheets/`](contact-sheets/).

## Named UI design families (archive filename stems)

Each listed design stem has PNG/SVG representations; color/style availability varies by family. These are filename families, not a count of individual physical files. Exact ZIP-relative directories are shown in the path convention above.

### Components (61 design families)

`button_rectangle_border`; `button_rectangle_depth_border`; `button_rectangle_depth_flat`; `button_rectangle_depth_gloss`; `button_rectangle_depth_gradient`; `button_rectangle_depth_line`; `button_rectangle_flat`; `button_rectangle_gloss`; `button_rectangle_gradient`; `button_rectangle_line`; `button_round_border`; `button_round_depth_border`; `button_round_depth_flat`; `button_round_depth_gloss`; `button_round_depth_gradient`; `button_round_depth_line`; `button_round_flat`; `button_round_gloss`; `button_round_gradient`; `button_round_line`.

`button_square_border`; `button_square_depth_border`; `button_square_depth_flat`; `button_square_depth_gloss`; `button_square_depth_gradient`; `button_square_depth_line`; `button_square_flat`; `button_square_gloss`; `button_square_gradient`; `button_square_line`; `check_round_color`; `check_round_grey`; `check_round_grey_circle`; `check_round_round_circle`; `check_square_color`; `check_square_color_checkmark`; `check_square_color_cross`; `check_square_color_square`; `check_square_grey`; `check_square_grey_checkmark`.

`check_square_grey_cross`; `check_square_grey_square`; `divider`; `divider_edges`; `input_outline_rectangle`; `input_outline_square`; `input_rectangle`; `input_square`; `slide_hangle`; `slide_horizontal_color`; `slide_horizontal_color_section`; `slide_horizontal_color_section_wide`; `slide_horizontal_grey`; `slide_horizontal_grey_section`; `slide_horizontal_grey_section_wide`; `slide_vertical_color`; `slide_vertical_color_section`; `slide_vertical_color_section_wide`; `slide_vertical_grey`; `slide_vertical_grey_section`.

`slide_vertical_grey_section_wide`.

### Icons (39 design families)

`arrow_basic_e`; `arrow_basic_e_small`; `arrow_basic_n`; `arrow_basic_n_small`; `arrow_basic_s`; `arrow_basic_s_small`; `arrow_basic_w`; `arrow_basic_w_small`; `arrow_decorative_e`; `arrow_decorative_e_small`; `arrow_decorative_n`; `arrow_decorative_n_small`; `arrow_decorative_s`; `arrow_decorative_s_small`; `arrow_decorative_w`; `arrow_decorative_w_small`; `icon_arrow_down_dark`; `icon_arrow_down_light`; `icon_arrow_down_outline`; `icon_arrow_up_dark`.

`icon_arrow_up_light`; `icon_arrow_up_outline`; `icon_checkmark`; `icon_circle`; `icon_cross`; `icon_outline_checkmark`; `icon_outline_circle`; `icon_outline_cross`; `icon_outline_square`; `icon_play_dark`; `icon_play_light`; `icon_play_outline`; `icon_repeat_dark`; `icon_repeat_light`; `icon_repeat_outline`; `icon_square`; `star`; `star_outline`; `star_outline_depth`.

