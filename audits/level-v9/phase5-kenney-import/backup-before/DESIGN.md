---
name: Lorong Atas Bumbung
description: A canvas-led monochrome rooftop learning experience within Add Math.
colors:
  paper: "#f3f2ee"
  ink: "#242624"
  muted: "#60635f"
  line: "#cececa"
  surface: "#fffefa"
typography:
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(20px, 2.4vw, 30px)"
    fontWeight: 650
    letterSpacing: "-.035em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
  equation:
    fontFamily: "Georgia, serif"
    fontSize: "clamp(25px, 5vw, 32px)"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  frame: "4px"
  control: "6px"
  welcome: "8px"
  dialog: "12px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#fff"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
---

# Design System: Lorong Atas Bumbung

## Overview

**Direction: Experience mode.** This document describes only the existing `/app/addmath/rooftop/` surface. The Phaser 3 canvas leads; restrained Malay controls support exploration and one function puzzle. It does not define the surrounding Add Math lesson system or other applications.

The neighborhood uses original supplied Figma exports and the original Chill Boy. Preserve the readable traversal route and forgiving learning experience. The existing Add Math lessons remain intact.

**V9 release-candidate update** (`audits/level-v9/release-candidate/`): the canvas's `grayscale(1)` filter was removed for the first public release — the user's explicit "colorful, clean, modular, friendly platformer" art direction supersedes the earlier monochrome identity. Source PNGs are still never recolored; the canvas now simply renders them as authored (soft sky blue, warm brown terrain, green grass, gold coins — the existing Kenney/production asset colors, not a new palette).

## Colors

Paper and surface neutrals frame dark ink controls, muted secondary text and thin line borders in the surrounding page chrome — that part is unchanged. `#game` (the Phaser canvas itself) no longer applies `grayscale(1)`; it renders the existing asset PNGs in their own native color. Distinguish progress through text, numbered steps and filled states as well as contrast.

## Typography

The CSS retains Add Math's `Space Grotesk` heading and `Plus Jakarta Sans` body stack names. **This standalone offline runtime does not load either font:** the browser's system sans-serif fallback is the rendered truth. Do not claim self-hosted custom fonts. Canvas labels use Arial/sans-serif; equations use Georgia/serif.

Headings use compact negative tracking. Supporting UI is mostly 11–14px; welcome headings are 32px and dialog headings 29px before responsive adjustments. Keep math expressions distinct and feedback legible.

## Layout

The centered shell has a 1384px maximum width and 32px desktop side padding. A compact masthead sits above a 16:9 game frame; the numbered route and live status sit below. Objective and checkpoint labels occupy the upper canvas edge. The welcome panel overlays the right side without replacing the visible world.

At 800px, spacing and typography tighten. Portrait screens up to 540px use a 3:4 frame capped at 72vh, a full-width heading and an inset welcome panel. Short landscape screens up to 540px high prioritize the canvas with `100dvh - 48px` frame height and hide supplementary footer text. The camera viewport adapts without stretching sprites. Coarse pointers receive bottom-edge touch controls; instructions should match the active input method.

## Elevation & Depth

The shell is flat, using borders and neutral fills. Native modal dialogs alone use a soft shadow and dark backdrop. Within the world, distant legacy backgrounds remain low-opacity silhouettes with slower parallax; production-v6 foreground art and physical wooden platforms stay visually prominent. Reduced-motion preferences remove camera smoothing and the bridge reveal tween.

## Shapes

Use simple bordered rectangles: 4px game-frame and HUD corners, 6px controls, 8px welcome panel and 12px dialogs. Circular numbered route markers indicate progress. Keep decoration subordinate to recognizable deck edges, ladders, checkpoint, function machine and destination.

## Components

- **Controls:** Primary actions use ink fills and white text; secondary controls use surface fills and line borders. Standard buttons have a 44px minimum height. Visible keyboard focus uses a 3px outline with 4px offset. Touch controls use explicit Malay action labels and directional arrows.
- **World:** Production-v6 assets supply the foreground; five isolated legacy exports supply distant scenery only. Original Chill Boy frames remain unchanged. Wooden decks identify walkable surfaces; decorative roofs, railings and the tank do not imply additional collision routes.
- **HUD and route:** Short objective/checkpoint text supports exploration. The four numbered stages are Rumah, Bumbung, Mesin fungsi and Destinasi, with current and completed states visibly filled.
- **Dialogs:** Native `dialog` elements handle puzzle, pause and completion. Opening menus pauses physics; focus moves to the relevant input/action and returns to the game when play resumes. The puzzle presents `f(x) = 2x + 1`, target output 7, an input and live feedback. Wrong answers retain the puzzle and can reveal a hint; only the correct answer creates the visible, walkable bridge.
- **Recovery:** Falls return to the start/checkpoint without lives or time pressure. An opened bridge persists through checkpoint recovery; replay resets the run.

## Do's and Don'ts

- **Do** preserve the canvas-led hierarchy, concise Malay copy and input-appropriate instructions.
- **Do** reuse supplied artwork, maintain asset provenance and keep the physical route readable.
- **Do** retain keyboard focus, live feedback, native dialogs and portrait/landscape usability.
- **Don't** generate replacement artwork, redraw Chill Boy, introduce Unity or flatten reference compositions into the playable world.
- **Don't** mix older foreground sets into the production-v6 scene or expand these scoped rules into global Add Math design policy.
- **Don't** claim loaded custom fonts or alter the existing lessons to support this standalone level.
