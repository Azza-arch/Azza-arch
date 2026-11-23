// Practice-set selection — pure (unit-tested). Draws up to `size` questions from
// the subtopic's whole auto-checkable pool instead of always the first five:
//   * mix: aim for 2 Asas, 2 Sederhana, 1 Cabaran, topped up from what exists;
//   * priority: never tried → missed before → right on 2nd try → right on 1st try;
//   * the previous set goes to the back of the queue so "Latihan lagi" differs;
//   * shown easiest first.
const ORDER = { mudah: 0, sederhana: 1, mencabar: 2 };
const TARGET = { mudah: 2, sederhana: 2, mencabar: 1 };

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * pool: questions [{id, difficulty}]; history: outcomes() for this subtopic;
 * prevIds: ids of the last set; returns an array of question ids.
 */
export function pickSet(pool, history = [], prevIds = [], rng = Math.random, size = 5) {
  const last = new Map(); for (const r of history) last.set(r.q, r.kind);
  const avoidPrev = pool.length > size;
  const prio = (q) => {
    const k = last.get(q.id);
    const base = k === undefined ? 0 : k === 'miss' ? 1 : k === 'second' ? 2 : 3;
    return base + (avoidPrev && prevIds.includes(q.id) ? 10 : 0);
  };
  const ranked = pool.map((q) => ({ q, p: prio(q), r: rng() })).sort((a, b) => a.p - b.p || a.r - b.r);
  const chosen = [];
  for (const d of Object.keys(TARGET)) chosen.push(...ranked.filter((x) => x.q.difficulty === d).slice(0, TARGET[d]));
  for (const x of ranked) { if (chosen.length >= size) break; if (!chosen.includes(x)) chosen.push(x); }
  return chosen.slice(0, size)
    .sort((a, b) => (ORDER[a.q.difficulty] ?? 1) - (ORDER[b.q.difficulty] ?? 1) || a.p - b.p || a.r - b.r)
    .map((x) => x.q.id);
}
