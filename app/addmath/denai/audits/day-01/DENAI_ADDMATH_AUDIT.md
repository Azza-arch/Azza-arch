# DENAI — Add Math Question Quality Report (Day 01)

## 1. How maths exists in DENAI today
**DENAI has no question database.** Each level's maths is a hand-built *mechanic* backed by a small pure model with unit tests:

| Level | Model file | Concept (DSKP T4 Bab 1 Fungsi) | Data |
|---|---|---|---|
| 1-1 | `levels/supply-quest.js` | Function as a model, evaluation: **C(x) = p·x + d** with constraints x ≥ 5, C(x) ≤ budget | 3 variants K1/K2/K3 |
| 1-2 | `levels/workshop-model.js` | **Composite functions**: f(x)=2x, g(x)=x−2, order matters | 1 configuration (input 5, need ≥ 8) |
| 1-3 | `levels/sluice-model.js` | **Inverse function**: f(x)=2x+3 on {0..6}, f⁻¹(13)=5; optional cave f⁻¹(15)=6 | 1 configuration + optional |
| (legacy) | `missions.js` | 12-item bank (find-input / pattern / find-rule) for the old 1-1 "7 planks" machine | still selected per run, never shown |
| (legacy) | `levels/composition.js`, `levels/inverse.js` | old 1-2 / 1-3 puzzles | migration only |

Storage = JS constants in modules. Loading = ES import. Validation = pure functions (`checkPurchase`, `runLine`, `testFlow`, `pullCave`, `validateVariant`) + save sanitisers that refuse forged states (e.g. `sanitizeSluice` only keeps `open` if the saved setting really gives 13). Assignment to levels = hard-wired per scene. Hints = 3 levels per level in the Journal (`syncQuestUI` / `syncWorkshopUI` / `syncSluiceUI`). Explanations = "Lihat cara kira" line after solving. Difficulty = implicit (1-1 < 1-2 < 1-3), not encoded.

A separate product, the **Add Math notes app** (`app/addmath/src/content/notes/*/questions.js`), has a real bank: 16 chapters, 422 questions (counted in `notes/*/questions.js`) with `id, chapter, subtopic, sp[], difficulty, type, prompt, answer, check, wrong[], solution[], status, provenance, review`. Its validator re-solves every `check` (passed today, 0 errors, 93 items flagged for human review). DENAI does not use it.

## 2. Mathematical verification (every item recomputed by hand)
| Item | Statement | Verified answer | Result |
|---|---|---|---|
| 1-1 K1 | C(x)=4x+6, budget 30, need ≥5 | C(5)=26 ✓, C(6)=30 ✓, C(7)=34 ✗ → accepted {5,6} | **Correct** (code comment says the same) |
| 1-1 K2 | C(x)=3x+9, budget 25 | C(5)=24 ✓, C(6)=27 ✗ → {5} | Correct |
| 1-1 K3 | C(x)=5x+5, budget 32 | C(5)=30 ✓, C(6)=35 ✗ → {5} | Correct |
| 1-2 | AB: g(f(5)) = g(10) = 8; BA: f(g(5)) = f(3) = 6 | notation `gf(5) = g(f(5))` | **Correct**, standard Malaysian convention (gf = f first) |
| 1-3 | f(x)=2x+3, x∈{0..6}; f⁻¹(13)=(13−3)÷2=5; f⁻¹(15)=6 | range {3,5,…,15}, one-to-one | Correct; domain tablet text matches |
| Hints 1-3 | "bacaan = 2 × tetapan + 3"; "13 − 3 = 10, 10 ÷ 2 = 5" | — | Correct |
| Legacy bank A–F | 2x+1, x+4, 3x+1, 2x+3, 3x−2, x+5 → 7 | x = 3, 3, 2, 2, 3, 2 | Correct, unique in {0..4} |
| Legacy P1–P3 | clues {0,1,2},{0,1,3},{1,2,4} | answers 3, 2, 3, not in clues | Correct |
| Legacy R1–R3 | f(2), f(3), f(1) = 7 | R1 3x+1; R2 x+4; R3 4x+3 — each unique | Correct |

**No incorrect mathematics found.**

## 3. Issues by category
1. **Incorrect mathematics:** none.
2. **Ambiguous wording:**
   - 1-3 meter units: "bacaan" is presented as a reading but the code comment says "game units, not a law of fluid flow" — fine for a game, but the Journal never says the calibration is a *model*; a student may over-read physics into it (low).
   - 1-1: "Beli papan secukupnya · bajet RM30" — "secukupnya" does not say "at least 5" until the hint; intended, but the receipt should show "perlu ≥ 5" once the bridge was seen (medium).
3. **Poor explanation:** none wrong; but explanations are one line and only on request. No end-of-level summary linking the action to notation (e.g. "Anda telah mencari f⁻¹(13)") (medium).
4. **Incorrect difficulty:** 1-2 is a binary choice (AB or BA) — it can be solved by trying both without reasoning (2 attempts, no cost). 1-3 can be brute-forced by turning the valve through 7 settings. Difficulty is fine for an intro world, but **mastery is not checked** (P1 design).
5. **Duplicate content:** legacy bank reuses rules across types (A & P1 = 2x+1, B & P3 = x+4, C & P2 = 3x+1). 1-3 repeats 2x+3, the same linear family as legacy item D. Not user-visible today.
6. **Technical validation:**
   - Legacy `missions.js` still runs (`selectVariant` each new run, saved in `run.missions.lift`) for an unused machine — remove or isolate (P1).
   - No unique-ID registry across levels (each model has its own ids: K1–K3, A–R3) (P2).
   - Only one fixed configuration in 1-2 and 1-3 → replay shows the same numbers (P1 for replay value).

## 4. Recommended question/puzzle architecture (adapted, not a rewrite)
Keep puzzles as mechanics with pure models. Add a thin **puzzle-definition layer** that reuses the notes-app conventions so content can be validated by the existing validator style:

```js
// levels/<level>/puzzles.js
export const PUZZLES = [{
  id: 'w1.l3.sluice.inverse-13',      // world.level.mechanic.slug — unique, never reused
  chapter: 't4-1', subtopic: '1.3', sp: ['1.3.2'],   // DSKP refs (codes only)
  difficulty: 'sederhana',            // mudah | sederhana | cabaran (same scale as notes app)
  objective: 'Cari input daripada output menggunakan fungsi songsang',
  mechanic: 'valve-meter',            // gameplayInteraction: which scene mechanic consumes it
  params: { a: 2, b: 3, domain: [0, 6], target: 13 },   // numbers only; scene draws them
  check: { kind: 'inverse', rule: '2x+3', target: 13 }, // re-solvable by the validator
  answer: 5,
  hints: ['…', '…', '…'],             // 3 levels, Malay
  explanation: ['13 − 3 = 10', '10 ÷ 2 = 5', 'f(5) = 13 ✓'],
  wrong: [{ when: 'reading<13', feedback: 'Aliran masih rendah.' }],
  status: 'review', review: { ownerApproved: false },
}];
```
- `mechanic` replaces the generic `questionType/options` fields: in DENAI the "options" are world objects (valve notches, machine order, plank quantity).
- Variants = multiple `params` sets per mechanic (as 1-1 already does), validated for exactly-one or bounded solution sets.
- A `tests/puzzles.test.mjs` re-solves every `check` (same approach as `validate-content.mjs`).
- No change to save keys: saves keep storing the chosen puzzle `id`.
