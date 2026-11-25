// World 2 · Level 2-2 "Lembah Puncak" — pure maths for the three stations (no Phaser; tested with node).
// SP 2.3.3 (general form ↔ vertex form), 2.3.5 (features of the graph), 2.3.6 (maximum / minimum).
// Each station is an AIM / OPTIMISE puzzle: the answer is checked exactly (maths), and what it
// changes in the world is a fixed mechanism (stone steps, a gate, a cargo lift) whose traversal is
// validated like every World 2 path: impossible while inactive (generous physics, 5% stronger
// jump), easy once active (strict physics, standing take-off, 5% weaker jump).
import { TILE } from './quadratic.js';

const EPS = 1e-9;
export const quad = (a, b, c) => (x) => a * x * x + b * x + c;
export const vertexOf = (a, b, c) => { const h = -b / (2 * a); return { h, k: quad(a, b, c)(h) }; };

// ── Station D "Tangkap di Puncak" ─────────────────────────────────────────
// A ball is fired along y = −x² + 6x − 5 (from the root x = 1 to the root x = 5). The player places
// a catching cup with two levers (x, y). The ball only stays in the cup where its vertical speed is
// zero: at the vertex (3, 4). On the curve elsewhere it bounces off (still rising or falling);
// off the curve it passes above or below the cup.
export const STATION_D = Object.freeze({
  id: 'D', coeff: { a: -1, b: 6, c: -5 }, from: 1, to: 5,
  levers: ['x', 'y'], options: { x: [1, 2, 3, 4, 5], y: [1, 2, 3, 4, 5] },
  start: { x: 1, y: 1 }, answer: { x: 3, y: 4 },
});
export function catchOutcome(st, { x, y }) {
  const { a, b, c } = st.coeff, f = quad(a, b, c), fy = f(x), slope = 2 * a * x + b;
  if (Math.abs(fy - y) > EPS) return { result: fy > y ? 'over' : 'under', ballY: fy, slope };
  return Math.abs(slope) < EPS ? { result: 'caught', ballY: fy, slope } : { result: 'bounce', ballY: fy, slope };
}

// ── Station E "Loceng" ──────────────────────────────────────────────────
// A water jet y = −2x² + 8x from (0, 0) to (4, 0). The bell hangs at height 8; the player slides it
// along a rail (x in half-unit steps). It only rings where the jet reaches 8: at x = h = 2, the
// maximum value k = 8 of y = −2(x − 2)² + 8.
export const STATION_E = Object.freeze({
  id: 'E', coeff: { a: -2, b: 8, c: 0 }, from: 0, to: 4, bellY: 8,
  levers: ['x'], options: { x: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4] },
  start: { x: 0.5 }, answer: { x: 2 },
});
export function bellOutcome(st, { x }) {
  const { a, b, c } = st.coeff, jet = quad(a, b, c)(x);
  return { rings: jet >= st.bellY - EPS, jetY: jet, short: st.bellY - jet };
}

// ── Station F "Kandang Maksimum" ────────────────────────────────────────
// 12 units of fence around a rectangular pen (4 sides): width x, length 6 − x, area A(x) = x(6 − x).
// The cargo lift only rises with all 9 crates (one crate per square unit) inside.
export const STATION_F = Object.freeze({
  id: 'F', perimeter: 12, crates: 9,
  levers: ['x'], options: { x: [1, 2, 3, 4, 5] },
  start: { x: 1 }, answer: { x: 3 },
});
export const penArea = (st, x) => x * (st.perimeter / 2 - x);
export function penOutcome(st, { x }) {
  const area = penArea(st, x), fit = Math.min(area, st.crates);
  return { full: area >= st.crates, area, fit, left: st.crates - fit, length: st.perimeter / 2 - x };
}

/** Is this lever setting the station's solution? (exact maths, used by the game and the save) */
export function solves(st, c) {
  if (st.id === 'D') return catchOutcome(st, c).result === 'caught';
  if (st.id === 'E') return bellOutcome(st, c).rings;
  if (st.id === 'F') return penOutcome(st, c).full;
  return false;
}
export function combos(st) {
  return st.levers.reduce((acc, lv) => acc.flatMap((c) => st.options[lv].map((v) => ({ ...c, [lv]: v }))), [{}]);
}

// ── Mechanisms (fixed geometry, in global tiles; see level-2-2-data.js) ────
// Each is a reachability station for analyseStation: 'L' = where the player stands, 'R' = where the
// mechanism leads. `active` adds the surfaces the solved station creates; `blocking` is removed.
export const MECHANISMS = Object.freeze({
  // D: the caught ball's weight pulls a chain that raises three stone steps up a 4-tile cliff
  D: { id: 'stairs-d', base: [{ id: 'L', x0: -10, x1: 0, top: 0 }, { id: 'R', x0: 3, x1: 20, top: 4 }],
       active: [{ id: 's1', x0: 0, x1: 1, top: 1 }, { id: 's2', x0: 1, x1: 2, top: 2 }, { id: 's3', x0: 2, x1: 3, top: 3 }], blocking: [] },
  // E: the ringing bell opens a stone gate in a wall far higher than any jump
  E: { id: 'gate-e', base: [{ id: 'L', x0: -10, x1: 0, top: 4 }, { id: 'W', x0: 0, x1: 1, top: 11 }, { id: 'R', x0: 1, x1: 20, top: 4 }],
       active: [], blocking: ['W'] },
  // F: the full pen drives a cargo lift: three crate ledges up a 4-tile cliff to the exit
  F: { id: 'lift-f', base: [{ id: 'L', x0: -10, x1: 0, top: 4 }, { id: 'R', x0: 3, x1: 20, top: 8 }],
       active: [{ id: 'k1', x0: 0, x1: 1, top: 5 }, { id: 'k2', x0: 1, x1: 2, top: 6 }, { id: 'k3', x0: 2, x1: 3, top: 7 }], blocking: [] },
});
/** The mechanism as an analyseStation station (no stones, open air). */
export function mechanismStation(m, active) {
  const surfaces = m.base.filter((s) => !(active && m.blocking.includes(s.id))).concat(active ? m.active : []);
  return { surfaces, stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] };
}
export { TILE };
