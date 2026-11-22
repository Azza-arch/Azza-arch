# Science Quest — asset selection

Ratings are for the stated Science Quest direction (friendly primary-school science game, landscape-first, web, touch-friendly). Selection does not imply that these files have been integrated into the project.

## SELECTED

| Asset path inside ZIP | Use | Why |
| --- | --- | --- |
| `Vector/Blue/button_rectangle_depth_flat.svg` | Primary action button | Crisp scaling, blue family matches proposed brand, clear edge/depth helps communicate action. |
| `Vector/Blue/button_round_depth_flat.svg` | Secondary/action button | Rounded cartoon character fits the audience; use selectively. |
| `Vector/Yellow/star.svg` | Reward and achievement feedback | Visible, familiar reward symbol with a proposed yellow accent. |
| `Vector/Green/check_square_color_checkmark.svg` | Correct/complete state | Clear positive state; pair with text or another cue, not color alone. |
| `Vector/Blue/slide_horizontal_color.svg` | Settings or magnet-strength control | Horizontal control suits landscape and existing category imagery. |
| `Vector/Extra/icon_play_dark.svg` | Play/continue affordance | Simple high-contrast symbol; label the control for clarity. |
| `Font/Kenney Future.ttf` | Display headings, trial use | Distinctive friendly display face; keep body instructions in a highly legible UI sans-serif. |
| `Sounds/tap-a.ogg` | Optional button feedback | Short interaction sound; audition and offer mute/volume control in a child-facing game. |

The corresponding PNGs are useful where Phaser rendering or packaging benefits from pre-rasterized textures. Prefer one rendering format per use case and avoid shipping redundant PNG and SVG copies without a pipeline need.

## OPTIONAL

| Asset path inside ZIP | Use | Caveat |
| --- | --- | --- |
| `Vector/Blue/button_rectangle_flat.svg` | Less dimensional primary/tertiary action | Could be visually quieter than the depth treatment; test against the final background. |
| `Vector/Yellow/button_round_depth_flat.svg` | Reward/bonus action | Reserve yellow for emphasis so it retains meaning. |
| `Vector/Green/arrow_basic_e.svg` | Next/forward navigation | Keep icon secondary to a labeled, touch-sized control. |
| `Vector/Blue/star_outline.svg` | Inactive rating/reward state | Verify contrast and selected/unselected distinction. |
| `Vector/Extra/input_rectangle.svg` | Text entry field frame | Functional frame only; no field state, label, or validation feedback. |
| `Vector/Blue/slide_horizontal_grey.svg` | Disabled/inactive slider track | Grey files are visually identical across the five color folders in inspected duplicate groups. |
| `Font/Kenney Future Narrow.ttf` | Short decorative labels | Narrow display forms may reduce readability; avoid long instructions and small sizes. |
| `Sounds/click-a.ogg`, `Sounds/switch-a.ogg` | Alternate interaction sounds | Choose only after listening in context; no need to use all included sound variants. |

## REJECTED for core Science Quest UI

| Asset family | Reason |
| --- | --- |
| Gloss and gradient variants such as `button_*_gloss` and `button_*_gradient` | The multiple highlight treatments can make a screen noisy and less consistent. Keep only if the final art direction specifically calls for them. |
| Decorative arrows and very small arrow variants | Less clear for children and touch navigation than a large, labeled directional control. |
| Red as the default action family | Better reserved for destructive, error, or danger feedback in the proposed hierarchy. |
| `Preview.png` and `Sample.png` | Reference compositions, not reusable game artwork or a Science Quest screen. |

Rejected here means “not recommended as a core default”, not that the file is unusable for every purpose.

## CUSTOM REQUIRED

No suitable pack asset was found for: science-topic iconography (including magnet and force), mascot/characters, environments/backgrounds, trophy/coin/heart/settings symbols, topic selection illustrations, complete panels/dialog frames, achievement badges, and a branded progress meter. See [missing assets](MISSING_ASSETS.md).

## Compatibility notes

- **Visual consistency:** coherent, colorful, outlined UI family; five main color variants share a common visual language.
- **Children:** friendly and legible at larger sizes, though the kit is generic game UI rather than science-specific content.
- **Landscape:** horizontal controls, broad buttons, and stars are a natural fit; no ready-made 16:9 scene/background.
- **Touch:** large `Double` PNGs and scalable SVGs help at high pixel density. Actual hit areas must be implemented independently and remain comfortably large.
- **Commercial use:** included `License.txt` explicitly states CC0 and allows commercial projects; attribution is optional. See [license audit](LICENSE_AUDIT.md).
