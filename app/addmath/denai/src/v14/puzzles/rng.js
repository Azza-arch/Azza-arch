// DENAI puzzle layer · reproducible randomness.
// mulberry32 (same algorithm as the legacy missions.js picker): a given seed
// always produces the same sequence, so a puzzle can be regenerated exactly.

export function seedFrom(value) {
  if (Number.isSafeInteger(value)) return value >>> 0;
  // FNV-1a 32-bit for string seeds such as "w1.l1.supply:2026-11-19".
  let h = 0x811c9dc5;
  for (const ch of String(value)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

export function rng(seed) {
  let a = seedFrom(seed);
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Integer in [lo, hi] (inclusive) from a generator returned by rng().
export function int(rand, lo, hi) {
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || hi < lo) throw new RangeError('int: bad range');
  return lo + Math.floor(rand() * (hi - lo + 1));
}
export const pick = (rand, list) => list[Math.floor(rand() * list.length)];
