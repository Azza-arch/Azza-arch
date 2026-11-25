// World 3 (Kilang & Lombong) — pure maths for every station (no Phaser; tested with node).
// T4 Bab 3 Sistem Persamaan (3.1 linear in three variables, 3.2 one linear + one non-linear) and
// T5 Bab 7 Pengaturcaraan Linear (7.1 inequalities and the feasible region, 7.2 optimisation).
// Every station is checked exactly here; what it changes in the world (a lift, a gate, a bridge,
// a lit walkway) is fixed geometry validated with the same jump physics as World 2
// (analyseStation in ../w2/quadratic.js; tests/w3-*.test.mjs).
const EPS = 1e-9;
const range = (a, b, step = 1) => Array.from({ length: Math.round((b - a) / step) + 1 }, (_, i) => +(a + i * step).toFixed(6));
const fmt = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2))).replace('-', '−');
export { fmt as formatNum };

/** Every lever setting of a station (cartesian product of its options). */
export function combos(st) {
  return st.levers.reduce((acc, lv) => acc.flatMap((c) => st.options[lv].map((v) => ({ ...c, [lv]: v }))), [{}]);
}
const term = (k, v, first) => { const s = k < 0 ? '−' : first ? '' : '+'; const a = Math.abs(k); return `${first ? s : ` ${s} `}${a === 1 ? '' : a}${v}`; };
/** "2x + y − z" from { x: 2, y: 1, z: -1 } */
export function lhsText(coef) { return Object.entries(coef).filter(([, k]) => k).map(([v, k], i) => term(k, v, i === 0)).join(''); }

// ── Type 'system': each row is a tank / scale fed by the levers; it is right only at its mark ──
// value = Σ coef·lever; solved when every row equals its rhs (the unique solution of the system).
export function systemOutcome(st, c) {
  const rows = st.rows.map((r) => { const v = Object.entries(r.coef).reduce((s, [n, k]) => s + k * c[n], 0); return { ...r, value: v, ok: Math.abs(v - r.rhs) < EPS }; });
  return { rows, ok: rows.every((r) => r.ok) };
}
// 3-1 Station A (warm-up, two variables; Form 3): two tanks
export const STATION_A = Object.freeze({
  id: 'A', type: 'system', levers: ['x', 'y'], options: { x: range(0, 6), y: range(0, 6) }, start: { x: 1, y: 1 }, answer: { x: 4, y: 3 },
  rows: [{ coef: { x: 1, y: 1 }, rhs: 7, label: 'Tangki 1' }, { coef: { x: 2, y: 1 }, rhs: 11, label: 'Tangki 2' }],
});
// 3-1 Station B: three valves, three tanks — x + y + z = 6, 2x + y − z = 1, x − y + 2z = 5 → (1, 2, 3)
export const STATION_B = Object.freeze({
  id: 'B', type: 'system', levers: ['x', 'y', 'z'], options: { x: range(0, 5), y: range(0, 5), z: range(0, 5) }, start: { x: 0, y: 0, z: 0 }, answer: { x: 1, y: 2, z: 3 },
  rows: [{ coef: { x: 1, y: 1, z: 1 }, rhs: 6, label: 'Tangki 1' }, { coef: { x: 2, y: 1, z: -1 }, rhs: 1, label: 'Tangki 2' }, { coef: { x: 1, y: -1, z: 2 }, rhs: 5, label: 'Tangki 3' }],
});
// 3-1 Station C (context): ore barrels of mass x (A), y (B), z (C) tonnes on three trolley scales —
// P: A + B + C = 9, Q: 2A + B = 8, R: A + 2C = 11 → A = 3, B = 2, C = 4 (independent: det = −3)
export const STATION_C = Object.freeze({
  id: 'C', type: 'system', levers: ['A', 'B', 'C'], options: { A: range(1, 6), B: range(1, 6), C: range(1, 6) }, start: { A: 1, B: 1, C: 1 }, answer: { A: 3, B: 2, C: 4 },
  rows: [{ coef: { A: 1, B: 1, C: 1 }, rhs: 9, label: 'Troli P' }, { coef: { A: 2, B: 1 }, rhs: 8, label: 'Troli Q' }, { coef: { A: 1, C: 2 }, rhs: 11, label: 'Troli R' }],
});

// ── Type 'intersect': a straight rail meets a curve; two clamps slide along the rail (x = p, q) ──
// A clamp holds only where the rail touches the curve: both clamps on the two intersection points.
export const curveY = (cv, x) => (cv.kind === 'parabola' ? cv.a * x * x + cv.b * x + cv.c : null);
export function onCurve(cv, x, y) {
  if (cv.kind === 'parabola') return Math.abs(curveY(cv, x) - y) < EPS;
  return Math.abs(x * x + y * y - cv.r * cv.r) < EPS; // circle centred at the origin
}
/** Where a clamp at x stands relative to the curve: 'hold' | 'above' | 'below' (parabola) | 'inside' | 'outside' (circle). */
export function clampState(st, x) {
  const y = st.line.m * x + st.line.k, cv = st.curve;
  if (onCurve(cv, x, y)) return { x, y, state: 'hold' };
  if (cv.kind === 'parabola') return { x, y, state: y > curveY(cv, x) ? 'above' : 'below', curveY: curveY(cv, x) };
  return { x, y, state: x * x + y * y < cv.r * cv.r ? 'inside' : 'outside' };
}
export function intersectOutcome(st, c) {
  const clamps = st.levers.map((n) => clampState(st, c[n]));
  return { clamps, ok: c[st.levers[0]] !== c[st.levers[1]] && clamps.every((q) => q.state === 'hold') };
}
// 3-2 Station D: rail y = x + 1, slope y = x² − 1 → (−1, 0) and (2, 3)
export const STATION_D = Object.freeze({
  id: 'D', type: 'intersect', levers: ['p', 'q'], options: { p: range(-3, 3), q: range(-3, 3) }, start: { p: -3, q: 3 }, answers: [-1, 2],
  line: { m: 1, k: 1 }, curve: { kind: 'parabola', a: 1, b: 0, c: -1 }, grid: { x0: -3, x1: 3, y0: -1, y1: 5 },
});
// 3-2 Station F: rail y = x − 1 crosses the mine wheel x² + y² = 25 → (−3, −4) and (4, 3)
export const STATION_F = Object.freeze({
  id: 'F', type: 'intersect', levers: ['p', 'q'], options: { p: range(-5, 5), q: range(-5, 5) }, start: { p: -5, q: 5 }, answers: [-3, 4],
  line: { m: 1, k: -1 }, curve: { kind: 'circle', r: 5 }, grid: { x0: -5, x1: 5, y0: -5, y1: 5 }, scale: 0.8,
});

// ── Type 'plate' (3-2 Station E): a rectangular steel plate x × y must seal a hatch whose frame is
// 14 m round and whose opening is 12 m²: x + y = 7 and xy = 12 → (3, 4) or (4, 3) (both seal it).
export const STATION_E = Object.freeze({
  id: 'E', type: 'plate', levers: ['x', 'y'], options: { x: range(1, 6), y: range(1, 6) }, start: { x: 1, y: 1 }, answers: [{ x: 3, y: 4 }, { x: 4, y: 3 }],
  perimeter: 14, area: 12,
});
export function plateOutcome(st, { x, y }) {
  const per = 2 * (x + y), area = x * y;
  return { per, area, perOk: per === st.perimeter, areaOk: area === st.area, ok: per === st.perimeter && area === st.area };
}

// ── Type 'region' (3-3): each constraint line gets a sign lever (≤ / ≥); the walkway platforms that
// lie in the feasible region are powered (solid), the rest stay off. Only the right signs light a
// walkway that crosses the acid pit. Points are lattice points (x, y); sx = tiles per unit across.
export const SIGNS = ['≤', '≥'];
export const satisfies = (l, sign, x, y) => (sign === '≤' ? l.a * x + l.b * y <= l.c + EPS : l.a * x + l.b * y >= l.c - EPS);
export const inRegion = (lines, signs, x, y) => lines.every((l, i) => satisfies(l, signs[i], x, y));
export function lineText(l) {
  const lhs = lhsText(Object.fromEntries([['x', l.a], ['y', l.b]].filter(([, k]) => k)));
  return { lhs, rhs: fmt(l.c) };
}
export function regionOutcome(st, c) {
  const signs = st.levers.map((n) => c[n]);
  const lit = st.walkway.filter(([x, y]) => inRegion(st.lines, signs, x, y));
  return { signs, lit, off: st.walkway.filter((p) => !lit.includes(p)), ok: lit.length === st.walkway.length };
}
// 3-3 Station G: y ≤ x + 1 (beam A), x + y ≤ 9 (beam B), y ≥ 1 (above the acid)
export const STATION_G = Object.freeze({
  id: 'G', type: 'region', levers: ['s1', 's2', 's3'], options: { s1: SIGNS, s2: SIGNS, s3: SIGNS }, start: { s1: '≥', s2: '≥', s3: '≤' }, answer: { s1: '≤', s2: '≤', s3: '≥' },
  lines: [{ a: -1, b: 1, c: 1, name: 'Rasuk A', show: 'y □ x + 1', words: 'lantai mesti di bawah rasuk A (garis y = x + 1)' },
    { a: 1, b: 1, c: 9, name: 'Rasuk B', show: 'x + y □ 9', words: 'lantai mesti di bawah rasuk B (garis x + y = 9)' },
    { a: 0, b: 1, c: 1, name: 'Paras asid', show: 'y □ 1', words: 'lantai mesti sekurang-kurangnya 1 unit di atas asid' }],
  walkway: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 4], [6, 3], [7, 2], [8, 1]], width: 9, sx: 1, banks: { L: 0, R: 0 }, grid: { x1: 9, y1: 6 },
});
// 3-3 Station H (context): x = mesin jenis P, y = mesin jenis Q in the control room —
// at most 7 machines (x + y ≤ 7), at least 2 of type Q (y ≥ 2), Q at most twice P (y ≤ 2x)
export const STATION_H = Object.freeze({
  id: 'H', type: 'region', levers: ['s1', 's2', 's3'], options: { s1: SIGNS, s2: SIGNS, s3: SIGNS }, start: { s1: '≥', s2: '≤', s3: '≥' }, answer: { s1: '≤', s2: '≥', s3: '≤' },
  lines: [{ a: 1, b: 1, c: 7, name: 'Jumlah mesin', show: 'x + y □ 7', words: 'jumlah mesin tidak melebihi 7' },
    { a: 0, b: 1, c: 2, name: 'Mesin Q', show: 'y □ 2', words: 'sekurang-kurangnya 2 mesin Q' },
    { a: -2, b: 1, c: 0, name: 'Nisbah', show: 'y □ 2x', words: 'mesin Q tidak lebih daripada dua kali mesin P (y = 2x)' }],
  walkway: [[1, 2], [2, 3], [3, 4], [4, 3], [5, 2]], width: 6, sx: 2, banks: { L: 1, R: 1 }, grid: { x1: 7, y1: 7 },
});
/** A region station's surfaces (station-local tiles) for the jump analysis: banks + lit platforms.
 *  Each platform is sx tiles wide, centred on x·sx, so neighbouring points join into a staircase and
 *  the banks meet the first and last unit; a missing (unlit) point leaves a gap of at least sx tiles. */
export function regionSurfaces(st, signs) {
  const sx = st.sx, h = sx / 2, lit = st.walkway.filter(([x, y]) => inRegion(st.lines, signs, x, y));
  return [{ id: 'L', x0: -8, x1: h, top: st.banks.L },
    ...lit.map(([x, y]) => ({ id: `p${x}_${y}`, x0: x * sx - h, x1: x * sx + h, top: y })),
    { id: 'R', x0: st.width * sx - h, x1: st.width * sx + 8, top: st.banks.R }];
}

// ── Type 'isoline' (3-4 Station K): the objective P = 3x + 2y over Station H's region. A gantry
// rail lies along 3x + 2y = k; it rests on the region only at the maximum (it then touches one
// corner: (5, 2), k = 19). Below: it still cuts through the region (more is possible). Above: no
// plan gives that much.
const H_LINES = STATION_H.lines, H_SIGNS = ['≤', '≥', '≤'];
export const feasible = (x, y) => x >= 0 && y >= 0 && inRegion(H_LINES, H_SIGNS, x, y);
export const lattice = (x1, y1, ok) => range(0, x1).flatMap((x) => range(0, y1).filter((y) => ok(x, y)).map((y) => [x, y]));
export const STATION_K = Object.freeze({
  id: 'K', type: 'isoline', levers: ['k'], options: { k: range(10, 24) }, start: { k: 10 }, answer: { k: 19 },
  objective: { x: 3, y: 2 }, sense: 'max', lines: H_LINES, signs: H_SIGNS, grid: { x1: 8, y1: 8 },
});
export function isolineOutcome(st, { k }) {
  const pts = lattice(st.grid.x1, st.grid.y1, (x, y) => x >= 0 && y >= 0 && inRegion(st.lines, st.signs, x, y));
  const val = ([x, y]) => st.objective.x * x + st.objective.y * y, best = Math.max(...pts.map(val));
  const on = pts.filter((p) => Math.abs(val(p) - k) < EPS), above = pts.filter((p) => val(p) > k + EPS);
  return { k, best, on, above: above.length, state: above.length ? 'cuts' : on.length ? 'rests' : 'misses', ok: !above.length && on.length > 0 };
}
// ── Type 'plan' (3-4 Station L): choose a supply plan (x lorries of ore A, y of ore B). It must meet
// both supply needs (x + 2y ≥ 8, 3x + y ≥ 9) at the lowest cost C = 2x + 3y → (2, 3), C = 13.
export const STATION_L = Object.freeze({
  id: 'L', type: 'plan', levers: ['x', 'y'], options: { x: range(0, 8), y: range(0, 8) }, start: { x: 0, y: 0 }, answer: { x: 2, y: 3 },
  lines: [{ a: 1, b: 2, c: 8, name: 'Bekalan besi', show: 'x + 2y □ 8', words: 'besi: x + 2y sekurang-kurangnya 8' }, { a: 3, b: 1, c: 9, name: 'Bekalan arang', show: '3x + y □ 9', words: 'arang: 3x + y sekurang-kurangnya 9' }],
  signs: ['≥', '≥'], objective: { x: 2, y: 3 }, sense: 'min', grid: { x1: 8, y1: 8 },
});
export function planOutcome(st, { x, y }) {
  const broken = st.lines.filter((l, i) => !satisfies(l, st.signs[i], x, y));
  const cost = st.objective.x * x + st.objective.y * y;
  const pts = lattice(st.grid.x1, st.grid.y1, (a, b) => inRegion(st.lines, st.signs, a, b));
  const best = Math.min(...pts.map(([a, b]) => st.objective.x * a + st.objective.y * b));
  return { broken, cost, best, feasible: !broken.length, ok: !broken.length && cost === best };
}

/** Is this lever setting the station's solution? (exact maths, used by the game and the save) */
export function solves(st, c) {
  switch (st.type) {
    case 'system': return systemOutcome(st, c).ok;
    case 'intersect': return intersectOutcome(st, c).ok;
    case 'plate': return plateOutcome(st, c).ok;
    case 'region': return regionOutcome(st, c).ok;
    case 'isoline': return isolineOutcome(st, c).ok;
    case 'plan': return planOutcome(st, c).ok;
    default: return false;
  }
}
export const STATIONS_BY_ID = Object.freeze({ A: STATION_A, B: STATION_B, C: STATION_C, D: STATION_D, E: STATION_E, F: STATION_F, G: STATION_G, H: STATION_H, K: STATION_K, L: STATION_L });
