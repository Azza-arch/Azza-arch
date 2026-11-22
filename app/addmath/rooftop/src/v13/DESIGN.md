# V13 design tokens — pixel-adventure theme

This documents the intentional palette/typography choices introduced in `src/v13/pixel-theme.css`, scoped to the isolated V13 runtime only (`app/addmath/rooftop/v13.html`). These are a deliberate new visual language for V13's Kenney "UI Pack - Pixel Adventure" (CC0) re-skin, not drift from the project root's existing `DESIGN.md` — V12 is untouched and keeps its own forest-green dashboard palette exactly as it was.

## Why a separate palette

V12's theme (`--ink:#fff2ce; --surface:#203e36; --paper:#18352f; --gold:#ffd16b`) is a cool forest green, designed around flat HTML cards. V13's sprites are warm browns/creams (Kenney's own wood-and-leather palette) — reusing V12's cool greens behind warm wooden sprite borders would clash, not cohere, so V13 defines its own token set rather than forcing the old one onto new art. See `audits/denai-v13/phase2/final-report.md` for the full before/after rationale.

## Color tokens

| Token | Value | Role | Source |
|---|---|---|---|
| `--pk-ink` | `#fff2ce` | Primary text on dark/panel surfaces | Reused from V12's own `--ink` — the one token kept identical, since it already reads well against both palettes |
| `--pk-ink-dim` | `#e8d9b8` | Secondary/muted text | Derived from `--pk-ink`, desaturated for hierarchy |
| `--pk-wood-dark` | `#3a2814` | Darkest wood tone — masthead chip backgrounds, dark text accents | Sampled from the pack's own panel sprite border (dark edge pixel, directly measured) |
| `--pk-text-on-panel` | `#4a3419` | Body text sitting on the warm panel fill | Chosen for contrast against the panel sprite's `#a9733f`-ish fill (sampled from `panel.png`'s centre fill pixels) |
| `--pk-text-on-button` | `#2b2016` | Button label text | Same family, darker, for contrast against the lighter blue-grey button sprite |
| `--pk-focus` | `#fff2b1` | Focus ring / selected state | Reused from V12's own `--focus` unchanged — focus-visibility behavior should stay consistent across both versions |

Additional one-off colors used directly in `pixel-theme.css` (not promoted to custom properties because each is a single, specific UI-state tint, not a reusable role): `#8fa3bd` (button base fill, sampled from `button-bar.png`), `#7a5530` (chip/pill border, a mid-tone wood sampled from the same sprite family), `#0b1a14cc` (dialog backdrop dim, matches V12's own backdrop darkness at a slightly warmer hue), `#5c2e12` (readout/output emphasis text, a deep brown for numeric results to read as "the answer," distinct from body text), `#c99a5e` (Chill Boy's bubble fill — one shade lighter than the panel fill, so the bubble reads as "the same material, closer to the camera" rather than a different material entirely).

## Button role hierarchy (filter-based, not separate assets)

All buttons share the one verified `button-bar.png` sprite (frames 69+70+71 from the pack's "Large tiles / Thick outline" sheet). Role is expressed by CSS `filter`, a legitimate re-tint of the real asset rather than a different image:
- **Primary** (`button.primary`, `.welcome .primary`, `.pause-actions #resume`, `#dial-test`): `sepia(.55) saturate(2.6) hue-rotate(-28deg) brightness(1.12)` — shifts the sprite's native blue-grey toward a warm gold, matching `--pk-focus`'s hue family so "this is the recommended next action" reads consistently with the focus-ring color.
- **Secondary** (`button.secondary`, and every unclassed button by default): no filter — the sprite's native blue-grey, read as neutral.
- **Destructive** (`button.danger`, applied to "Mula Semula" / restart-run): `hue-rotate(150deg) saturate(1.7) brightness(.92)` — shifts toward red/rust, distinct from both primary gold and secondary blue-grey.

## Typography

- `--pk-font: ui-monospace, Consolas, 'Courier New', monospace` — used for headings, button labels, HUD chips, and short readouts (numbers/equations), where a slightly mechanical/game-native feel suits short, punchy text. This matches V12's own existing choice to use monospace for its title screen (`presentation.css`'s `.welcome h2{font-family:ui-monospace,...}`), so it's a continuation of an existing precedent, not an arbitrary new import.
- Body/paragraph text (dialogue lines, rule explanations, worked solutions) intentionally stays on the inherited `system-ui, sans-serif` stack from `presentation.css` — per the V12 UI audit's own finding, forcing dense instructional text into a pixel/monospace font at small sizes would hurt readability for exactly the content where it matters most (the math rule text, the worked-solution steps). This is a deliberate exception, not an oversight.

## Scope

These tokens apply only within `src/v13/pixel-theme.css`, loaded only by `v13.html`. They do not touch, override, or get read by `v12.html` or any file under `src/v12/`.
