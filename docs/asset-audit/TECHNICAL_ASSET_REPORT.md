# Science Quest — technical asset report

## Archive integrity and contents

- Input: `C:\Users\syhaz\Downloads\kenney_ui-pack.zip`
- ZIP entries inspected: **1,315 files**, **1,416,520 uncompressed bytes**.
- The archive was read in place. No files were extracted over the source or altered.
- The workspace inspection did not locate a Science Quest app; project-specific recommendations therefore use the React/TypeScript, Phaser, Tailwind, and visual-direction context in the request. No application code was changed.
- Formats: **PNG (870), SVG (434), TTF (2), OGG (6), TXT (1), URL (2)**.
- No unsafe archive paths were extracted or executed; inspection used ZIP reads only.

## Raster details

- 868 PNGs are UI elements; two additional 918×515 PNGs are `Preview.png` and `Sample.png` reference composites.
- Individual controls use varied small source sizes. Common dimensions include 64×64, 32×32, 128×128, 192×64 and 384×128. The `Double` family is generally twice the linear resolution of `Default`.
- 849 UI PNGs use indexed palette mode and 19 use RGBA. Of the indexed images, 848 carry transparency metadata and one is fully opaque. Check decoded alpha behavior in the target browser/Phaser pipeline.
- No sprite sheets, animation atlases, or frame sequences were identified.
- Exact-content duplicate groups exist for repeated grey/inactive designs across color folders (20 PNG groups, 20 extra copies). These are redundant copies, not different visual choices.

## Vector details

- 434 SVGs are present across five color folders and `Extra`.
- SVG files specify explicit pixel `width`/`height`, but inspected files do not include a `viewBox`. Browser rendering works at declared dimensions, but arbitrary responsive scaling should be validated; adding/rewriting SVG metadata would modify originals and was not done.
- Some SVG inactive-grey assets are exact duplicates across color directories. Use one canonical copy when integrating if project licensing/build structure permits.

## Naming and variants

- Five core colors: Blue, Green, Grey, Red, Yellow.
- PNG includes `Default` and `Double` raster folders. SVG has one size representation per color/group.
- `Extra` holds monochrome controls/icons and input-field elements.
- Names typically encode component and treatment, e.g. `button_round_depth_flat`, `slide_vertical_color_section`, and `icon_repeat_outline`.
- Many style variations are alternatives rather than states. Select a small subset to avoid inconsistent visual treatments.

## Other technical assets

- Fonts: `Font/Kenney Future.ttf`, `Font/Kenney Future Narrow.ttf`.
- Sounds: `Sounds/click-a.ogg`, `click-b.ogg`, `switch-a.ogg`, `switch-b.ogg`, `tap-a.ogg`, `tap-b.ogg`.
- Exact audio duration/codec stream properties and font glyph coverage were not assessed in this visual inventory. Test sound loading and fallback behavior in the eventual browser build.

## Pipeline recommendations

1. Prefer SVG for scalable DOM/interface rendering and larger PNG `Double` assets for Phaser textures where supported and measured to be more efficient.
2. Do not ship every color and style variant by default. Build a small allowlist of selected assets.
3. Validate SVG sizing/viewBox behavior and palette transparency in the actual target browsers before production use.
4. Add meaningful accessible labels and keyboard/touch behavior in application code; image files provide artwork only.
5. Do not treat the bundled sample screenshot as a sprite sheet or final layout.

## Contact sheets

Contact sheets were generated with the already-installed Python 3.14.4 and Pillow 12.1.1. They use neutral tiles, preserve thumbnail aspect ratio, and caption each source with its ZIP-relative path. UI raster assets are split into pages of up to 72 items.
