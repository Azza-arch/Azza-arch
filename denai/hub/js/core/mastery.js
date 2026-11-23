// Mastery — pure functions, no DOM, no storage (unit-tested in tests/core.test.mjs).
// Computed only from real attempt events. Levels (DENAI wording):
//   belum   Belum mula  — no attempt yet
//   mencuba Mencuba     — at least one attempt
//   faham   Faham       — ≥3 different questions right on the FIRST try,
//                          including ≥1 Sederhana or Cabaran (when the subtopic has one)
//   mahir   Mahir       — Faham, plus ≥1 Cabaran right on the first try (when the subtopic
//                          has one), the last 5 question results all right on the first try,
//                          and first-try successes on ≥2 different days
// Thresholds shrink when a subtopic has fewer questions, so every level stays reachable.
export const LEVELS = Object.freeze(['belum', 'mencuba', 'faham', 'mahir']);
export const LEVEL_LABEL = Object.freeze({ belum: 'Belum mula', mencuba: 'Mencuba', faham: 'Faham', mahir: 'Mahir' });
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

/** pool: { total, hasHarder, hasCabaran } — what the subtopic's question bank offers. */
export function levelFor(results, pool) {
  if (!results.length) return 'belum';
  const firsts = results.filter((r) => r.kind === 'first');
  const distinct = new Set(firsts.map((r) => r.q));
  const need = Math.max(1, Math.min(3, pool.total || 3));
  const harderOk = !pool.hasHarder || firsts.some((r) => HARDER.has(r.diff));
  if (distinct.size < need || !harderOk) return 'mencuba';
  const cabaranOk = !pool.hasCabaran || firsts.some((r) => r.diff === 'mencabar');
  const window = Math.max(1, Math.min(5, pool.total || 5));
  const recent = results.slice(-window);
  const steady = results.length >= window && recent.every((r) => r.kind === 'first');
  const days = new Set(firsts.map((r) => localDay(r.at))).size;
  return cabaranOk && steady && days >= 2 ? 'mahir' : 'faham';
}

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
