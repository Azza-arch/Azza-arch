# Derived assets

Project-local recolours of existing CC0 Kenney source files. These are not
new illustrations — same shape, shading, and alpha channel as the original,
only hue/saturation shifted in HSV space. Kept separate from
`assets/vendor/` because they aren't an unmodified upstream download.

## book_open_yellow.png

- Source: `assets/vendor/kenney-generic-items/Colored/genericItem_color_033.png`
  (Kenney Generic Items, CC0).
- Why: that source file renders orange/red, while the project's canonical
  closed-book asset (`genericItem_color_034.png`, used as `objectBookClosed`)
  is yellow. Used side by side (e.g. an open/closed book sequence), the two
  read as two different physical books.
- How: every opaque pixel's hue was set to 0.1051 and saturation to 0.80
  (matching `objectBookClosed`'s sampled average hue/saturation), value
  multiplied by 1.12 (clamped to 1.0) to lift it to a similar brightness.
  Per-pixel value was otherwise kept as-is, so the original shading/fold
  highlight is preserved — only the color family changed.
- Registered in `src/data/assetCatalog.js` as `objectBookOpenCanon`.
  The original `objectBookOpen` entry (orange) is untouched and still used
  by the shipped `reading-under-the-tree` story — this derived file is only
  used by `src/data/actionTemplates.js` / `action-gallery.html`.
