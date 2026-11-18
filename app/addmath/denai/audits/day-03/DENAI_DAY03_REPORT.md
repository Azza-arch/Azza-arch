# DENAI — Day 03: Puzzle architecture & Add Math content system (2026-11-19)

Branch `claude/denai-day03-puzzle-architecture`, based on `claude/denai-day02-polish` (1992e75). Not merged, not deployed. `design/trailer/` untouched.

## 0. Correction to the Day 02 report (found today)
`tests/supply-quest.test.mjs` **was failing on the Day 02 branch** (expected `questStep(newQuest()) === 'none'`; Day 02 intentionally returns `'go'` so the objective pin shows from the start). The Day 02 regression loop printed `exit=$?` *after* a `$(basename …)` command substitution, which resets `$?` to 0, so the failure was reported as a pass. The behaviour is correct; the test expectation was stale. Fixed in commit `675e43e` (`questStep(newQuest())` → `'go'`, plus `questStep(null)` → `'none'`). Today's runs capture `rc=$?` immediately after each command.

## 1. Phase 1 — audit of the current puzzle code
| Level | Where the maths lived | Problems |
|---|---|---|
| 1-1 | `levels/supply-quest.js`: `VARIANTS` (K1–K3), `NEED/STOCK`, `cost`, `checkPurchase` **in the same module as Phaser/DOM scene code**; hints and wrong-answer text inline | model not separable; parameters mixed with scene; text duplicated with numbers |
| 1-2 | `levels/workshop-model.js` (pure) | machine rules are **lambdas** (`fn: x => 2*x`), not data; `sanitizeWorkshop` hard-codes valid outputs `[6, 8]`; hints in `workshop-line.js` hard-code 5/6/2 |
| 1-3 | `levels/sluice-model.js` (pure) | `2x + 3`, 13, 15 and domain hard-coded; hints in `sluice-line.js` hard-code "2 × tetapan + 3" and "sasaran 13" |
| legacy | `missions.js` (12-item bank, `evalRule`, `ruleText`, mulberry32), `levels/composition.js`, `levels/inverse.js` | useful helpers trapped in legacy files; kept for save migration |
Shared pieces: linear rule evaluation and text, seeded RNG, "answer must satisfy constraint" checks.
Save/progression impact: 1-1 saves the variant id (`K1…K3`) and `bought {x, cost}` (re-validated by `checkPurchase`); 1-2 saves `order/lastOut`; 1-3 saves `setting/lastReading`. **Live variation in 1-2/1-3 would need the save to store a puzzle id or parameters** → not done today (no save-format change); generators prepared instead.
Files at risk: the three model/scene pairs above and their tests. Regression risk: changed numbers or text in the live game → guarded by an equivalence test (§6).

## 2. Architecture before → after
**Before:** each level owns its numbers, maths, hints and feedback inside its own model or scene file; no shared schema, no ids for puzzles, no way to generate a solvable variant.
**After:** one small data/logic layer that the levels read from:
```
src/v14/puzzles/
  index.js                 registry: MODELS, DEFINITIONS, puzzleById, puzzlesFor, solve, fill
  rules.js                 linear rules as data {a, b}: makeRule, evalRule, ruleText (no eval)
  rng.js                   seeded RNG (mulberry32), seedFrom (FNV-1a for string seeds), int, pick
  models/linear-cost.js    C(x) = px + d: cost, formula, checkPurchase, acceptedChoices, solve, validateParams
  models/composite.js      two machines, order AB/BA: runLine (gf/fg notation), solve, validateParams
  models/inverse.js        f(x) = ax + b on a domain: forward, range, inverse, inverseSteps, solve, validateParams
  definitions/world1.js    6 definitions (1-1 ×3, 1-2, 1-3, 1-3 cave) + builder functions
  generators/world1.js     generateSupply / generateWorkshop / generateSluice (seeded, model-checked)
  validators/validate.js   required fields, id format, difficulty/status, 3 hints, answer == model
```
Scenes still draw, take input and animate; they now **read** parameters, hints and feedback from definitions and **call** the models.

## 3. Definition schema (adapted to the code, not a quiz)
`id` (stable, `w<world>.l<level>.<mechanic-slug>.<name>`), `legacyId` (1-1 only: K1–K3 kept in saves), `chapter` (`t4-1`, DSKP code only), `subtopic`, `sp`, `difficulty` (`mudah | sederhana | cabaran`, same scale as the notes app), `learningObjective`, `mechanic` (the in-world interaction: `supply-store`, `machine-order`, `valve-meter`, `pressure-plates`), `parameters` (numbers/rules only), `check.kind` (which model), `answer` (data, re-checked against the model), `hints` (3), `explanation`, `wrongFeedback` (templates with `{name}` placeholders, filled without eval), `status` (`live | optional | draft | review`). Generated items add `seed`.

### Example definitions (abridged)
```js
{ id: 'w1.l1.supply.k1', legacyId: 'K1', chapter: 't4-1', subtopic: '1.1', difficulty: 'mudah', mechanic: 'supply-store',
  parameters: { price: 4, delivery: 6, budget: 30, need: 5, stock: 8 }, check: { kind: 'linear-cost' },
  answer: { accepted: [5, 6], best: 5 },
  wrongFeedback: { short: '{x} papan tak cukup: jambatan perlukan {need}.', budget: 'RM{cost} melebihi bajet RM{budget}.' }, status: 'live' }

{ id: 'w1.l2.workshop.main', subtopic: '1.2', mechanic: 'machine-order', check: { kind: 'composite-order' },
  parameters: { input: 5, need: 8, start: 'BA', machines: { A: { letter: 'f', rule: { a: 2, b: 0 }, min: 1 }, B: { letter: 'g', rule: { a: 1, b: -2 }, min: 2 } } },
  answer: { working: ['AB'], outputs: { AB: 8, BA: 6 } }, status: 'live' }

{ id: 'w1.l3.sluice.main', subtopic: '1.3', mechanic: 'valve-meter', check: { kind: 'inverse-linear' },
  parameters: { rule: { a: 2, b: 3 }, domain: [0, 6], target: 13 }, answer: { setting: 5 },
  hints: [ '…tanda asal 13…', '…bacaan = 2 × tetapan + 3…', 'Undur langkah mesin: 13 − 3 = 10, 10 ÷ 2 = 5. …' ], status: 'live' }
```

## 4. Seeded variants (generated, all model-checked; not live yet)
| Seed | 1-1 supply (mudah) | 1-2 workshop | 1-3 sluice |
|---|---|---|---|
| `1` | C(x)=2x+7, need 5, budget 20 → accept {5, 6} | f=3x, g=x−1, input 5, need 14 → only AB (14; BA 12) | f=3x+1, target 13 → setting 4 |
| `2` | C(x)=3x+5, need 6, budget 27 → {6, 7} | f=3x, g=x−1, input 4, need 11 → only AB (11; BA 9) | f=3x+2, target 8 → setting 2 |
| `"denai-2026-11-19"` | C(x)=6x+7, need 5, budget 48 → {5, 6} | f=2x, g=x−3, input 5, need 7 → only AB (7; BA 4) | f=2x+5, target 13 → setting 4 |
`cabaran` supply variants accept exactly `need` (e.g. seed 3 → {6}). 2 000 generated definitions (500 seeds × 4) validated with 0 problems; the same seed always returns an identical definition.

## 5. Integration (Phase 6) — what the live game uses now
| Module | Change | Unchanged guarantee |
|---|---|---|
| `levels/supply-quest.js` | `NEED, STOCK, VARIANTS, cost, formula, checkPurchase, acceptedChoices` delegate to `linear-cost` + definitions; wrong-answer text and "buy" hints from the definition | same export names/shapes; `VARIANTS` deep-equals the old literal; saves keep `K1–K3` |
| `levels/workshop-model.js` | `STOCK, NEED, MACHINES, ORDERS, runLine` from definition + `composite`; `sanitizeWorkshop` valid outputs from the definition's answer (was `[6, 8]`) | `MACHINES.*.fn/rule/min`, notations and `newWorkshop()` identical |
| `levels/workshop-line.js` | "swap" hints from the definition | identical strings |
| `levels/sluice-model.js` | `DOMAIN, TARGET, CAVE_TARGET, reading, inverse, inverseSteps` from definitions + `inverse` model | identical values |
| `levels/sluice-line.js` | "investigate" hints from the definition; retry hint uses `TARGET` instead of a literal 13 | identical strings |
No physics, save format, progression, leaderboard or victory-UI change. Old code paths (legacy `missions.js`, `composition.js`, `inverse.js`) kept untouched.

## 6. Tests (see §8 for results)
New `tests/puzzles.test.mjs` (8 tests): unique ids; required fields; stored answers == models (and a corrupted answer is caught); normal cases of all three models (incl. exact KSSM notations); invalid inputs rejected (non-integer rules/x, out-of-range purchases, unknown order, input below a machine's minimum, a = 0, target outside the range); same seed ⇒ same puzzle; 1 200 generated variants are solvable and their answers satisfy the constraints; live levels still produce the old values.

## 7. Files
New: `src/v14/puzzles/{index,rules,rng}.js`, `src/v14/puzzles/models/{linear-cost,composite,inverse}.js`, `src/v14/puzzles/definitions/world1.js`, `src/v14/puzzles/generators/world1.js`, `src/v14/puzzles/validators/validate.js`, `tests/puzzles.test.mjs`, this report.
Modified: `src/v14/levels/supply-quest.js`, `workshop-model.js`, `workshop-line.js`, `sluice-model.js`, `sluice-line.js`, `tests/supply-quest.test.mjs` (Day 02 expectation fix).

## 8. Results
All executed on this branch with `rc=$?` captured right after each command; PlayFab blocked/stubbed.

| Test | Result |
|---|---|
| Unit (node, existing 8): analytics, inverse, progress-course, sluice, supply-quest, twins, workshop-v3, workshop | 8/8 exit 0 |
| `tests/puzzles.test.mjs` (new, 8 tests) | exit 0 · 8 pass, 0 fail |
| `l1-playthrough` / `l2-playthrough` / `l3-playthrough` | exit 0 (72 / 71 / 110 s in-game, 0 page errors) |
| `w1-progression` (fresh + old-save profile, 1-1 → 1-3, replay, "Dunia 1 selesai") | exit 0 |
| `w1-mobile-check` (11 viewports × 3 levels + pause check) | exit 0, 0 issues |
| `rc-check`, `menu-check` | exit 0 |
UI: no visible change (hints/feedback strings are identical by test), so no new screenshots. `git status` shows only Day 03 files plus the untouched `design/trailer/`.

## 9. Risks & follow-up
- **Live variation not enabled** for 1-2/1-3: needs a save field for the puzzle id (or seed) and scene art that adapts to other numbers (machine plates are text, the 1-3 meter dial ticks 3…15 are drawn for 2x+3). Proposed next step: store `puzzleId` additively in run saves and render dial ticks from `range(params)`.
- 1-1 already rotates K1–K3 on replay; generated supply variants could join the rotation once the owner approves the number ranges.
- Legacy `missions.js` still owns its own copies of `evalRule/ruleText/rng`; migrate when the legacy machine is removed (Day 01 backlog P1-04).
- The cave definition is `optional`; its plate mechanic still uses `sluice-model.pullCave`.
