# Migration notes: legacy system vs. new system (Phase 2+)

This project now has two grammar/data/gameplay systems living side by side in
the same `index.html`, loaded as classic `<script>` tags with no bundler.
Because every top-level `const`/`class` in a classic script becomes a shared
global on the page, the two systems had a real risk of colliding on names
(hard `SyntaxError` on re-declaration, or a silent overwrite of one system's
global by the other). This document records the audit and the fix so future
phases don't accidentally reintroduce the collision.

## The collision risk (found during the Phase 3 audit)

- The legacy system (still used by `GameScene` / `SentenceScene`, the old
  "Missed Bus" story) declares bare globals: `Tenses`, `TenseLabels`,
  `VerbData`, `TimeCueData`, `SentenceTemplates`, `window.GrammarEngine`,
  `window.SentenceChunks`, plus `const AssetCatalog`, `const StoryData`,
  `const SubjectData`.
- The new system (Phase 2 grammar engine, Phase 3 Story Order gameplay)
  needed its own `Tenses`/`TenseLabels`/subjects/stories/verb catalog with
  incompatible shapes (e.g. the legacy `GrammarEngine` takes positional args;
  the new `grammar.engine` takes `{verbId, tense, subject}` objects). Reusing
  the same global names would have been a hard crash; reusing
  `window.GrammarEngine` for the new engine would have been a silent bug
  (whichever script loads last wins, and `SentenceScene` would start calling
  the wrong function shape).

## The fix: a single namespace object (Option A)

Every new-system file is wrapped in an IIFE and exports to
`window.TenseTales.<namespace>.<name>` instead of a bare global:

```js
window.TenseTales = { grammar: {}, data: {}, gameplay: {} };
```

- `window.TenseTales.grammar.constants` — `src/grammar/grammarConstants.js`
- `window.TenseTales.grammar.verbCatalog` — `src/grammar/verbCatalog.js`
- `window.TenseTales.grammar.engine` — `src/grammar/grammarEngine.js`
- `window.TenseTales.grammar.sentenceBuilder` — `src/grammar/sentenceBuilder.js`
- `window.TenseTales.data.subjects` — `src/data/subjects.js`
- `window.TenseTales.data.stories` — `src/data/stories.js`
- `window.TenseTales.data.assetCatalog` — `src/data/assetCatalog.js`
- `window.TenseTales.gameplay.storyShuffle` — `src/gameplay/storyShuffle.js`
- `window.TenseTales.gameplay.storyValidation` — `src/gameplay/storyValidation.js`
- `window.TenseTales.gameplay.storyOrderController` — `src/gameplay/storyOrderController.js`

This was chosen over ES modules because the project has no build step and no
bundler; namespacing under one object is a same-file, no-tooling-change fix,
while switching to `<script type="module">` would have required reworking
every existing legacy script's loading order and global-access assumptions
at the same time. Each file still supports `module.exports` for Node
(`require()`-based unit tests), so the dual Node/browser pattern from Phase 2
is preserved.

## Why the legacy files were renamed, not deleted

Per the explicit "don't delete legacy yet" requirement, the old files that
would have collided by name were renamed with a `legacy-` prefix rather than
removed, so the old Missed-Bus gameplay keeps working untouched:

| Old path | New path |
| --- | --- |
| `src/grammar/grammar-engine.js` | `src/grammar/legacy-grammar-engine.js` |
| `src/grammar/sentence-chunks.js` | `src/grammar/legacy-sentence-chunks.js` |
| `src/data/stories.js` | `src/data/legacy-stories.js` |
| `src/data/subjects.js` | `src/data/legacy-subjects.js` |
| `tests/grammar-engine.test.js` | `tests/legacy-grammar-engine.test.js` |
| `tests/sentence-chunks.test.js` | `tests/legacy-sentence-chunks.test.js` |

`index.html` was updated to point at the renamed files. `src/data/tenses.js`,
`src/data/verbs.js`, `src/data/time-cues.js`, and
`src/data/sentence-templates.js` were **not** renamed or touched — they still
declare their original bare globals (`Tenses`, `TenseLabels`, `VerbData`,
`TimeCueData`, `SentenceTemplates`) and are only used by the legacy scenes.

Verified after the rename: the legacy Node tests still pass under their new
paths, and the live game (Play → GameScene → old "Missed Bus" story) still
boots and plays with zero console errors.

## Rule for future phases

- Do not add new bare globals. Any new file goes under
  `window.TenseTales.<grammar|data|gameplay>.<name>`.
- Do not extend the legacy files (`legacy-*.js`, `tenses.js`, `verbs.js`,
  `time-cues.js`, `sentence-templates.js`, `GameScene.js`, `SentenceScene.js`).
  They exist only to keep the old Missed-Bus story working during the
  transition and are not being built on further.
- New scenes/components (Story Order, and whatever comes after it) read
  everything through `window.TenseTales.*`, never through the legacy names.
