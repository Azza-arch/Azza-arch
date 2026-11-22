# Science Quest — Design System V1 recommendation

**Status:** audit recommendation only. No interface has been implemented. This recommendation is based on the provided Science Quest brief and the audited Kenney UI pack.

## Design intent

Build a friendly science-adventure interface with a clear blue-led identity and distinct color cues for success, rewards, and caution. Use the Kenney pack as a consistent control language; custom topic art will carry the educational identity. Avoid combining every included button effect or making the whole game look like the generic sample screenshot.

## Color palette

| Token | Recommendation | Use |
| --- | --- | --- |
| `brand.navy` | `#15324B` | Main text, dark framing, high-contrast labels |
| `brand.cyan` | `#20A9D6` | Primary actions and interactive emphasis; aligns with the pack’s Blue family |
| `brand.turquoise` | `#24B8A5` | Secondary navigation or science/energy accents; use sparingly |
| `reward.yellow` | `#FFC928` | Stars, discoveries, highlighted rewards |
| `success.green` | `#31B978` | Correct/completed feedback, paired with icon/text |
| `surface.paper` | `#F5F8FC` | Calm light content surface |
| `surface.blue` | `#D9F0FA` | Secondary panel surface |
| `ink.primary` | `#173044` | Primary text on light surfaces |
| `state.error` | `#D94352` | Incorrect/error state only, paired with text or symbol |

These are proposed interface tokens, not sampled hex values from the ZIP. The pack’s color folders provide visual blue, green, grey, red, and yellow variants, but not a documented Science Quest palette. Check contrast for all text and states during implementation.

## Typography

- Use `Kenney Future.ttf` for short headings, level names, and celebratory moments after testing glyph coverage and legibility.
- Keep instructions, questions, buttons, numbers, and body copy in a clear sans-serif system/UI font. Children need easy scanning at small-screen sizes.
- Use `Kenney Future Narrow.ttf` only for short labels where the width helps; avoid long lines, dense instructions, and small text.
- Establish at least three clear roles: display heading, body/instruction, and compact metadata. Do not use the decorative face for every role.

## Buttons and controls

- Primary: blue rectangular button with restrained depth, based on `Vector/Blue/button_rectangle_depth_flat.svg`.
- Secondary: flatter blue or green rectangular button, based on `Vector/Blue/button_rectangle_flat.svg` or `Vector/Green/button_rectangle_depth_flat.svg`.
- Reward: yellow round/rectangular action or star only for rewards and discoveries.
- Destructive/error: red only for errors or destructive choices, not general navigation.
- Pressed, disabled, focus, and selected states must be explicit in code; the pack’s files are visual pieces and do not supply behavior.
- Use visible labels for important actions. Icons alone should be reserved for universally recognizable, supplemental actions.
- Ensure the touch target is at least 44 CSS px in web UI (prefer 48 px or more for child-facing primary actions), regardless of the artwork’s source dimensions.

## Panels, shape, and icon treatment

- Use a consistent medium corner radius, approximately 12–16 CSS px for panels and 10–14 px for buttons. Do not combine the pack’s round button shape with heavily rounded cards everywhere.
- The archive has no complete panel/window family. Compose content surfaces with CSS or selected nine-slice-ready artwork only after validating source edges; do not stretch icon assets.
- Keep a consistent icon scale and outline weight. The pack mixes filled, outlined, and depth styles; choose one family per UI context.
- Pair color states with shape, symbol, or text so success/error is not communicated by color alone.

## Spacing scale

Use a 4 px base with an 8 px rhythm: `4, 8, 12, 16, 24, 32, 48, 64` CSS px. Keep button label padding generous and align controls to a consistent grid. This is a proposed system token scale, not a measurement from the asset pack.

## Hierarchy and content

1. Current activity or question title.
2. Main science interaction/illustration.
3. Primary action or answer choices.
4. Progress and supporting hint.
5. Secondary navigation, settings, and optional detail.

For Magnet & Force, let the custom experiment illustration dominate. Use the Kenney UI controls to frame the interaction without competing with the scientific concept.

## Landscape 16:9 layout principles

- Design around a 16:9 reference canvas while allowing fluid resizing and letterboxing only where the Phaser playfield needs a fixed world ratio.
- Keep web navigation and menus in a responsive DOM layer; keep Phaser gameplay at a stable logical resolution and scale the canvas without cropping essential content.
- Use a main content area with a clear focal experiment, an adjacent instruction/answer region, and a persistent compact progress/nav area. Avoid tiny control clusters at the screen edges.
- On tablet/mobile landscape, collapse secondary navigation and preserve the experiment, prompt, and primary action first. Ensure touch targets do not shrink with the canvas.
- Provide a portrait/reflow fallback for mobile browsers even though landscape is the primary game composition.

## Asset decisions grounded in this audit

- Reuse the pack’s Blue/Green/Yellow families selectively for controls and feedback.
- Favor SVG for resizable web elements where its explicit dimensions behave correctly; favor `Double` PNGs for Phaser textures when raster performance and density are validated.
- No existing pack assets cover science art, backgrounds, mascot, panels, trophy/coin/heart/settings, or a full progress system. Plan those gaps as separate asset/design work.

See the [asset inventory](asset-audit/ASSET_INVENTORY.md), [asset selections](asset-audit/ASSET_SELECTION.md), and [missing assets](asset-audit/MISSING_ASSETS.md).
