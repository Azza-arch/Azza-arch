// World 2 · Level 2-3 "Gerbang Parabola" — pure maths for the stations (no Phaser; tested with node).
// SP 2.1.1 (solving), 2.1.2 (equation from roots), 2.1.3 (quadratic inequality),
// 2.2.1–2.2.2 (types of roots, discriminant), 2.3.2 (position of the graph and types of roots).
// Like Level 2-2, each answer is checked exactly and drives a fixed mechanism whose traversal is
// validated: impossible while inactive (generous physics), easy once active (strict physics).
import { quad } from './peak.js';

const EPS = 1e-9;
export const disc = (a, b, c) => b * b - 4 * a * c;
export function realRoots(a, b, c) {
  const d = disc(a, b, c);
  if (d < -EPS) return [];
  if (Math.abs(d) <= EPS) return [-b / (2 * a)];
  const s = Math.sqrt(d); return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
}

// ── Station G "Dua Ponton" ──────────────────────────────────────────────
// A chain y = x² − 6x + 5 hangs over the river (water at y = 0). Two pontoons hold it up only where it
// touches the water: at the roots x = 1 and x = 5. Then the pontoon bridge floats across.
export const STATION_G = Object.freeze({
  id: 'G', coeff: { a: 1, b: -6, c: 5 },
  levers: ['kiri', 'kanan'], options: { kiri: [0, 1, 2, 3], kanan: [3, 4, 5, 6] },
  start: { kiri: 3, kanan: 3 }, answer: { kiri: 1, kanan: 5 },
});
export function pontoonOutcome(st, lv) {
  const f = quad(st.coeff.a, st.coeff.b, st.coeff.c);
  const at = (x) => ({ x, chainY: f(x), touches: Math.abs(f(x)) < EPS });
  const left = at(lv.kiri), right = at(lv.kanan);
  return { left, right, holds: left.touches && right.touches && lv.kiri !== lv.kanan };
}

// ── Station H "Aras Rantai" ─────────────────────────────────────────────
// The chain y = x² − 6x + c: the lever c raises or lowers it. The bucket at x = 3 only fills if the
// chain JUST touches the water: one point of contact, b² − 4ac = 0 → c = 9.
// c < 9: two points (b² − 4ac > 0, the chain dips into the water); c > 9: none (b² − 4ac < 0).
export const STATION_H = Object.freeze({
  id: 'H', a: 1, b: -6, bucketX: 3,
  levers: ['c'], options: { c: [5, 6, 7, 8, 9, 10, 11] },
  start: { c: 5 }, answer: { c: 9 },
});
export function chainOutcome(st, { c }) {
  const d = disc(st.a, st.b, c), roots = realRoots(st.a, st.b, c);
  return { d, roots, kind: d > EPS ? 'two' : d < -EPS ? 'none' : 'one', fills: Math.abs(d) <= EPS && Math.abs(roots[0] - st.bucketX) < EPS };
}

// ── The gate's two seals (the climax) ───────────────────────────────────
// Seal P "Punca": build x² + bx + c whose roots are the gate's markers 2 and 6 → (x − 2)(x − 6).
export const SEAL_P = Object.freeze({
  id: 'P', roots: [2, 6],
  levers: ['b', 'c'], options: { b: [-10, -8, -6, -4, -2, 0], c: [4, 6, 8, 10, 12, 14] },
  start: { b: -2, c: 4 }, answer: { b: -8, c: 12 },
});
export function sealPOutcome(st, { b, c }) {
  const f = quad(1, b, c), at = st.roots.map((x) => ({ x, y: f(x), on: Math.abs(f(x)) < EPS }));
  return { at, lit: at.every((p) => p.on) };
}
// Seal Q "Ketaksamaan": light the part of the gate where (x − 2)(x − 6) < 0 → 2 < x < 6.
export const SEAL_Q = Object.freeze({
  id: 'Q', coeff: { a: 1, b: -8, c: 12 },
  levers: ['kiri', 'kanan'], options: { kiri: [0, 1, 2, 3, 4], kanan: [4, 5, 6, 7, 8] },
  start: { kiri: 0, kanan: 8 }, answer: { kiri: 2, kanan: 6 },
});
export function sealQOutcome(st, { kiri, kanan }) {
  const [r1, r2] = realRoots(st.coeff.a, st.coeff.b, st.coeff.c);
  // the lit band must be exactly where the curve is below the axis
  return { lit: Math.abs(kiri - r1) < EPS && Math.abs(kanan - r2) < EPS, roots: [r1, r2], tooWide: kiri < r1 || kanan > r2, tooNarrow: kiri > r1 || kanan < r2 };
}

export function solvesRoots(st, lv) {
  if (st.id === 'G') return pontoonOutcome(st, lv).holds;
  if (st.id === 'H') return chainOutcome(st, lv).fills;
  if (st.id === 'P') return sealPOutcome(st, lv).lit;
  if (st.id === 'Q') return sealQOutcome(st, lv).lit;
  return false;
}

// ── Mechanisms (x local to the mechanism, y global tiles; see level-2-3-data.js) ──
export const MECHANISMS_23 = Object.freeze({
  // G: pontoon bridge floating across a 6-tile river (banks y = 1, water y = 0)
  G: { id: 'pontoons', base: [{ id: 'L', x0: -10, x1: 0, top: 1 }, { id: 'R', x0: 6, x1: 20, top: 1 }],
       active: [0, 1, 2, 3, 4, 5].map((i) => ({ id: `p${i}`, x0: i, x1: i + 1, top: 0.5 })), blocking: [] },
  // H: the filled bucket lowers a drawbridge across the 6-tile pool at bank height
  H: { id: 'drawbridge', base: [{ id: 'L', x0: -10, x1: 0, top: 1 }, { id: 'R', x0: 6, x1: 20, top: 1 }],
       active: [{ id: 'deck', x0: 0, x1: 6, top: 1 }], blocking: [] },
  // P + Q: the stone gate opens only when both seals are lit
  PQ: { id: 'gate-23', base: [{ id: 'L', x0: -10, x1: 0, top: 1 }, { id: 'W', x0: 0, x1: 1, top: 9 }, { id: 'R', x0: 1, x1: 20, top: 1 }],
        active: [], blocking: ['W'] },
});
