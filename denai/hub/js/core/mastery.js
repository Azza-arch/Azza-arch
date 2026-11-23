// Mastery — pure functions, no DOM, no storage (unit-tested in tests/core.test.mjs).
// Computed only from real attempt events, following the owner's conservative
// mastery principles (D13 in PRODUCT-BLUEPRINT.md §14):
//   * opening or finishing a note, and anything in the game, is never evidence;
//   * a question answered right again is NOT new evidence (evidence = distinct questions);
//   * mastery needs evidence on different questions AND different study days;
//   * when a subtopic's question bank cannot provide the evidence a level needs,
//     the level is not given — the learner sees "bukti belum mencukupi" instead
//     (thresholds are never lowered to fit a small bank);
//   * time passing never lowers a level.
//
// Levels (labels provisional until student testing):
//   belum   Belum mula  — no attempt yet
//   mencuba Mencuba     — at least one attempt
//   faham   Faham       — ≥ FAHAM_MIN different questions right on the FIRST try,
//                          including ≥1 Sederhana/Cabaran when the bank has one
//   mahir   Mahir       — Faham, plus ≥1 Cabaran right on the first try (when the bank
//                          has one), the latest result on each of the last MAHIR_WINDOW
//                          different questions right on the first try, and first-try
//                          successes on new questions on ≥ MAHIR_DAYS different days
// The numbers are the Phase 1 starting values; they are HYPOTHESES to be checked
// with pilot data (open decision O16). They are not lowered for small banks.
export const LEVELS = Object.freeze(['belum', 'mencuba', 'faham', 'mahir']);
export const LEVEL_LABEL = Object.freeze({ belum: 'Belum mula', mencuba: 'Mencuba', faham: 'Faham', mahir: 'Mahir' });
export const RULES = Object.freeze({ FAHAM_MIN: 3, MAHIR_WINDOW: 5, MAHIR_DAYS: 2 });
export const rank = (lv) => LEVELS.indexOf(lv);
const HARDER = new Set(['sederhana', 'mencabar']);

const localDay = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/**
 * One result per question per practice set, in the order first attempted.
 * kind: 'first' (right on try 1) | 'second' (right on try 2) | 'miss' (not right).
 */
export function outcomes(attempts) {
  const by = new Map();
  for (const a of attempts) {
    const k = `${a.set}|${a.q}`;
    if (!by.has(k)) by.set(k, { q: a.q, diff: a.diff, sp: a.sp || [], at: a.at, kind: 'miss' });
    const o = by.get(k);
    if (a.ok) o.kind = a.try === 1 ? 'first' : (o.kind === 'first' ? 'first' : 'second');
  }
  return [...by.values()].sort((x, y) => (x.at < y.at ? -1 : x.at > y.at ? 1 : 0));
}

/**
 * Full evidence picture for one subtopic.
 * pool: { total, hasHarder, hasCabaran } — what the subtopic's auto-checkable bank offers.
 * Returns { level, distinctFirst, distinctTried, days, insufficient, need }.
 *   insufficient: null | 'faham' | 'mahir' — the next level the bank cannot evidence.
 */
export function evidence(results, pool) {
  const total = pool.total || 0;
  const firsts = results.filter((r) => r.kind === 'first');
  // Earliest first-try success per question: repeats add nothing.
  const firstHit = new Map();
  for (const r of firsts) if (!firstHit.has(r.q)) firstHit.set(r.q, r);
  const distinctFirst = firstHit.size;
  const distinctTried = new Set(results.map((r) => r.q)).size;
  const days = new Set([...firstHit.values()].map((r) => localDay(r.at))).size;
  const fahamPossible = total >= RULES.FAHAM_MIN;
  const mahirPossible = total >= RULES.MAHIR_WINDOW;
  const base = { distinctFirst, distinctTried, days, need: RULES.FAHAM_MIN, total };

  if (!results.length) return { ...base, level: 'belum', insufficient: fahamPossible ? null : 'faham' };
  const harderOk = !pool.hasHarder || firsts.some((r) => HARDER.has(r.diff));
  if (!fahamPossible) return { ...base, level: 'mencuba', insufficient: 'faham' };
  if (distinctFirst < RULES.FAHAM_MIN || !harderOk) return { ...base, level: 'mencuba', insufficient: null };
  if (!mahirPossible) return { ...base, level: 'faham', insufficient: 'mahir' };

  const cabaranOk = !pool.hasCabaran || firsts.some((r) => r.diff === 'mencabar');
  // Latest result on each of the last MAHIR_WINDOW different questions.
  const latest = [];
  const seen = new Set();
  for (let i = results.length - 1; i >= 0 && latest.length < RULES.MAHIR_WINDOW; i--) {
    if (seen.has(results[i].q)) continue;
    seen.add(results[i].q); latest.push(results[i]);
  }
  const steady = latest.length === RULES.MAHIR_WINDOW && latest.every((r) => r.kind === 'first');
  const level = cabaranOk && steady && days >= RULES.MAHIR_DAYS ? 'mahir' : 'faham';
  return { ...base, level, insufficient: null };
}

/** Level only (see evidence()). */
export const levelFor = (results, pool) => evidence(results, pool).level;

/** Pool facts for a list of questions (the auto-checkable bank of one subtopic). */
export const poolOf = (questions) => ({
  total: questions.length,
  hasHarder: questions.some((q) => HARDER.has(q.difficulty)),
  hasCabaran: questions.some((q) => q.difficulty === 'mencabar'),
});

/** Per-SP view of the same results (stored for later DSKP / teacher reports). */
export function bySp(results) {
  const m = new Map();
  for (const r of results) for (const sp of r.sp) {
    const e = m.get(sp) || { sp, first: 0, second: 0, miss: 0 };
    e[r.kind] += 1; m.set(sp, e);
  }
  return [...m.values()];
}
