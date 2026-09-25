# Tense Tales

A visual English grammar game where players read a 4-picture story and build
grammatically correct sentences in Present, Past, and Future tense.

Status: **Phase 0 — Foundation**. No gameplay, grammar logic, or scoring yet.
This phase just sets up a clean, extensible project shell.

## Running locally

This is a static site with no build step. Serve the folder with any static
file server and open it in a browser, for example:

```
npx serve .
```

or, from the repo root with PHP already available (Laragon):

```
php -S localhost:8000 -t games/tense-tales
```

Then visit `http://localhost:8000`.

## Folder structure

```
tense-tales/
├── index.html          Entry point, loads Phaser + game scripts
├── src/
│   ├── main.js          Boots the Phaser.Game instance
│   ├── config.js         Phaser game config (size, scale, scene list)
│   ├── scenes/
│   │   ├── BootScene.js   Loading screen, loads assets, hands off to Menu
│   │   ├── MenuScene.js   Title, subtitle, Play button
│   │   └── GameScene.js   Placeholder gameplay screen
│   ├── data/
│   │   └── asset-manifest.js  List of assets to load (keys + paths)
│   ├── components/       Reusable UI pieces (empty for now)
│   └── utils/            Shared helpers (empty for now)
├── assets/
│   ├── characters/
│   ├── backgrounds/
│   ├── objects/
│   ├── ui/
│   └── audio/
└── styles/
    └── main.css          Page-level layout (canvas centering, no scroll)
```

## Adding assets

1. Drop the file into the matching `assets/` subfolder.
2. Register it in `src/data/asset-manifest.js` under `images`,
   `spritesheets`, or `audio` with a `key` and `path`.
3. `BootScene` loads everything in the manifest automatically — no scene
   code needs to change.

## QA status

**Mobile responsive layout requires manual browser/device verification before release.**

`story-prototypes.html` (Phase 1.8) viewport verification status:

| Width | Status |
|---|---|
| 1440px | Visually verified |
| 768px | Not visually verified in this session |
| 375px | Not visually verified in this session |

The CSS itself is written responsively (percentage-based grid, a `max-width: 420px`
stacking rule), but this session's browser-automation resize tool did not actually
change the rendered viewport (confirmed via `window.innerWidth`), so 768px/375px were
never truly rendered and checked — only assumed from the CSS. Do not treat those two
as confirmed until someone checks them in a real browser or device.

## Deployment

Intended to be deployed as a static subpath at:

```
https://haziqbuilds.com/games/tense-tales
```

No backend, database, or login is required for this phase.
