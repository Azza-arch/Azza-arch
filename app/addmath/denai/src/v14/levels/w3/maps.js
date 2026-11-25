// World 3 (Kilang & Lombong) — map data for its four levels (pure, no Phaser; tested with node).
// Units are tiles (1 tile = 54 world units), y measured UP from the factory floor (global y = 0).
// Every crossing that a station opens is one of five fixed mechanisms; tests/w3-maps.test.mjs re-reads
// each level from this data and proves, with World 2's jump physics, that the level cannot be finished
// while any station is unsolved and is easy once all are solved (and, for the walkways of 3-3, that
// every wrong choice of signs leaves a gap the player cannot cross).
import { STATION_A, STATION_B, STATION_C, STATION_D, STATION_E, STATION_F, STATION_G, STATION_H, STATION_K, STATION_L, regionSurfaces } from './systems.js';

export const TILE = 54;
// Mechanisms, in global tiles. base = ground height in front of it.
//   steps / lift: three pieces climbing a 4-tile cliff that starts 3 tiles after x (solid steps / scaffold)
//   gate: a wall 7 tiles high on one tile of floor, gone once the station is solved
//   bridge: a girder deck across an acid pit from x to x + span
//   walkway: the lit platforms of a region station (3-3), computed from the lever signs
const climb = (x, base) => [1, 2, 3].map((d, i) => ({ id: `m${x + i}`, x0: x + i, x1: x + i + 1, top: base + d }));
export function mechPieces(m) {
  if (m.kind === 'steps' || m.kind === 'lift') return { active: climb(m.x, m.base), blocking: [] };
  if (m.kind === 'gate') return { active: [], blocking: [{ id: `wall${m.x}`, x0: m.x, x1: m.x + 1, top: m.base + 7 }] };
  if (m.kind === 'bridge') return { active: [{ id: `deck${m.x}`, x0: m.x, x1: m.x + m.span, top: m.base, deck: true }], blocking: [] };
  return { active: [], blocking: [] };
}

const G = (id, x0, x1, top) => ({ id, x0, x1, top });
const coins = (list) => list.map(([x, y], i) => ({ id: `c${i + 1}`, x, y }));

const LEVELS = {
  // ── 3-1 Tiga Injap: tanks on the factory floor (A), valves above an acid pit (B), ore trolleys (C) ──
  'w3-l1': {
    num: '3-1', title: 'Tiga Injap', width: 58, top: 15, floor: -3, next: 'KE 3-2',
    terrain: [G('entry', 0, 13, 0), G('deck-a', 13, 22, 4), G('deck-b', 28, 41, 4), G('exit', 41, 58, 8)],
    pits: [{ x0: 22, x1: 28, top: 1.5 }],
    stations: [
      { st: STATION_A, leverX: 3, area: 5.6, mech: { kind: 'steps', x: 10, base: 0 }, name: 'Stesen A · Dua Tangki',
        lesson: 'dua persamaan, dua anu: x + y = 7 dan 2x + y = 11 memberi x = 4, y = 3' },
      { st: STATION_B, leverX: 14.5, area: 17, mech: { kind: 'bridge', x: 22, span: 6, base: 4 }, name: 'Stesen B · Tiga Injap',
        lesson: 'tiga persamaan linear, tiga anu: hapuskan satu anu demi satu anu → x = 1, y = 2, z = 3' },
      { st: STATION_C, leverX: 29.5, area: 32, mech: { kind: 'lift', x: 38, base: 4 }, name: 'Stesen C · Troli Bijih',
        lesson: 'bentuk sistem daripada situasi: A + B + C = 9, 2A + B = 8, A + 2C = 11 → A = 3, B = 2, C = 4' },
    ],
    spawn: { x: 1.5, y: 0 },
    checkpoints: [{ id: 'entry', x: 1.5, y: 0 }, { id: 'after-a', x: 13.6, y: 4, needs: ['A'] }, { id: 'after-b', x: 28.6, y: 4, needs: ['A', 'B'] }],
    coins: coins([[2, 1.5], [8, 1], [11.5, 2.8], [19, 5], [24, 5.2], [26, 5.2], [37, 5], [44, 9], [47, 9], [50, 9]]),
    secret: { id: 'atas-kilang', label: 'Permata di atas bumbung kilang', x: 48.5, y: 13.2,
      platforms: [{ x0: 44, x1: 45, top: 9.5 }, { x0: 45.5, x1: 46.5, top: 11 }, { x0: 47.5, x1: 49.5, top: 12.5 }] },
    gate: { x: 53, y: 8 }, goal: { x: 56, y: 8 },
  },
  // ── 3-2 Rel Memotong Cerun: the rail and the slope (D), the hatch plate (E), the mine wheel (F) ──
  'w3-l2': {
    num: '3-2', title: 'Rel Memotong Cerun', width: 62, top: 15, floor: -3, next: 'KE 3-3',
    terrain: [G('entry', 0, 9, 2), G('mid', 17, 25, 2), G('gate-floor', 25, 26, 2), G('mid-b', 26, 44, 2), G('exit', 44, 62, 6)],
    pits: [{ x0: 9, x1: 17, top: 0.5 }],
    stations: [
      { st: STATION_D, leverX: 7, ox: 13, oy: 3, mech: { kind: 'bridge', x: 9, span: 8, base: 2 }, name: 'Stesen D · Rel dan Cerun',
        lesson: 'gantikan y = x + 1 ke dalam y = x² − 1: x² − x − 2 = 0, jadi x = −1 atau x = 2 (dua titik persilangan)' },
      { st: STATION_E, leverX: 19, area: 21.2, mech: { kind: 'gate', x: 25, base: 2 }, name: 'Stesen E · Plat Penutup',
        lesson: 'x + y = 7 dan xy = 12: x(7 − x) = 12, x² − 7x + 12 = 0, jadi (3, 4) atau (4, 3)' },
      { st: STATION_F, leverX: 28, ox: 34.5, oy: 6.5, mech: { kind: 'lift', x: 41, base: 2 }, name: 'Stesen F · Roda Lombong',
        lesson: 'gantikan y = x − 1 ke dalam x² + y² = 25: x² − x − 12 = 0, jadi x = 4 atau x = −3' },
    ],
    spawn: { x: 2.5, y: 2 },
    checkpoints: [{ id: 'entry', x: 2.5, y: 2 }, { id: 'after-d', x: 17.6, y: 2, needs: ['D'] }, { id: 'after-e', x: 26.6, y: 2, needs: ['D', 'E'] }],
    coins: coins([[4, 3], [11, 3.2], [13, 3.2], [15, 3.2], [22, 3], [31, 3], [33, 3], [47, 7], [50, 7], [53, 7]]),
    secret: { id: 'rabung-lombong', label: 'Permata di atas pintu lombong', x: 0.9, y: 7.2,
      platforms: [{ x0: 4, x1: 5, top: 3.5 }, { x0: 2, x1: 3, top: 5 }, { x0: 0, x1: 2, top: 6.5 }] },
    gate: { x: 57, y: 6 }, goal: { x: 60, y: 6 },
  },
  // ── 3-3 Bilik Kawalan: the feasible region lights the walkway over the acid (G, H) ──
  'w3-l3': {
    num: '3-3', title: 'Bilik Kawalan', width: 56, top: 13, floor: -3, next: 'KE 3-4',
    terrain: [G('entry', 0, 7, 0), G('mid', 15, 19, 0), G('mid-b', 19, 24, 1), G('exit', 34, 56, 1)],
    pits: [{ x0: 7, x1: 15, top: -0.4 }, { x0: 24, x1: 34, top: -0.4 }],
    stations: [
      { st: STATION_G, leverX: 4.5, ox: 6.5, oy: 0, mech: { kind: 'walkway' }, name: 'Stesen G · Lantai Selamat',
        lesson: 'rantau tersaur ialah kawasan yang memenuhi SEMUA ketaksamaan: y ≤ x + 1, x + y ≤ 9, y ≥ 1' },
      { st: STATION_H, leverX: 20.5, ox: 23, oy: 0, mech: { kind: 'walkway' }, name: 'Stesen H · Bilik Mesin',
        lesson: 'bentuk ketaksamaan daripada situasi: x + y ≤ 7, y ≥ 2, y ≤ 2x' },
    ],
    spawn: { x: 1.5, y: 0 },
    checkpoints: [{ id: 'entry', x: 1.5, y: 0 }, { id: 'after-g', x: 16, y: 0, needs: ['G'] }],
    coins: coins([[2.5, 1], [9.5, 3], [11.5, 5], [13.5, 3], [17, 1], [27, 4.2], [31, 5.2], [36, 2], [40, 2], [44, 2]]),
    secret: { id: 'siling-bilik', label: 'Permata di siling bilik kawalan', x: 41.5, y: 7.2,
      platforms: [{ x0: 37, x1: 38, top: 2.5 }, { x0: 38.5, x1: 39.5, top: 4 }, { x0: 40, x1: 41, top: 5.5 }, { x0: 41, x1: 43, top: 6.5 }] },
    gate: { x: 50, y: 1 }, goal: { x: 53, y: 1 },
  },
  // ── 3-4 Loji Optimum: the most output (K) and the cheapest supply (L) ──
  'w3-l4': {
    num: '3-4', title: 'Loji Optimum', width: 58, top: 15, floor: -3, next: 'KE DUNIA 4',
    terrain: [G('entry', 0, 17, 0), G('deck', 17, 31, 4), G('gate-floor', 31, 32, 4), G('exit', 32, 58, 4)],
    pits: [],
    stations: [
      { st: STATION_K, leverX: 3, ox: 5, oy: 0.5, mech: { kind: 'lift', x: 14, base: 0 }, name: 'Stesen K · Garis Keuntungan',
        lesson: 'nilai maksimum P = 3x + 2y berlaku di bucu rantau tersaur: (5, 2), P = 19' },
      { st: STATION_L, leverX: 18.5, ox: 21, oy: 4.5, mech: { kind: 'gate', x: 31, base: 4 }, name: 'Stesen L · Kos Minimum',
        lesson: 'kos minimum C = 2x + 3y juga di bucu rantau: (2, 3), C = 13' },
    ],
    spawn: { x: 1.5, y: 0 },
    checkpoints: [{ id: 'entry', x: 1.5, y: 0 }, { id: 'after-k', x: 17.6, y: 4, needs: ['K'] }],
    coins: coins([[2, 1], [9, 1], [12, 1], [15.5, 3], [19.5, 5], [28, 5], [34, 5], [38, 5], [42, 5], [46, 5]]),
    secret: { id: 'cerobong', label: 'Permata di atas loji', x: 44.5, y: 10.2,
      platforms: [{ x0: 40, x1: 41, top: 5.5 }, { x0: 41.5, x1: 42.5, top: 7 }, { x0: 43, x1: 44, top: 8.5 }, { x0: 44, x1: 46, top: 9.5 }] },
    gate: { x: 52, y: 4 }, goal: { x: 55, y: 4 },
  },
};
export const LEVEL_IDS = Object.keys(LEVELS);

/** A level with its stations' mechanisms placed. */
export function buildLevel(id) {
  const L = LEVELS[id];
  if (!L) throw new Error(`unknown World 3 level ${id}`);
  return { id, ...L, tile: TILE, stations: L.stations.map((s) => ({ ...s, ox: s.ox ?? s.leverX, oy: s.oy ?? 0, pieces: mechPieces(s.mech) })), secrets: [L.secret] };
}

/** Walkway platforms of a region station in global tiles (lit by these signs). */
export function walkwayPieces(s, signs) {
  return regionSurfaces(s.st, signs).filter((p) => p.id !== 'L' && p.id !== 'R').map((p) => ({ ...p, x0: p.x0 + s.ox, x1: p.x1 + s.ox, top: p.top + s.oy }));
}

/**
 * The whole level as one analyseStation station: ground + the mechanisms of the solved stations
 * (a gate stands until its station is solved). `signs` gives a region station's lever signs
 * (default: its answer when solved, nothing lit otherwise). L = the spawn ground, R = the goal ground.
 */
export function levelStation(level, solved = {}, signs = {}) {
  let pieces = level.terrain.map((t) => ({ ...t }));
  for (const s of level.stations) {
    const on = !!solved[s.st.id];
    if (s.mech.kind === 'walkway') {
      const sg = signs[s.st.id] ?? (on ? s.st.levers.map((n) => s.st.answer[n]) : null);
      if (sg) pieces = pieces.concat(walkwayPieces(s, sg));
      continue;
    }
    if (on) pieces = pieces.concat(s.pieces.active);
    else for (const b of s.pieces.blocking) pieces = pieces.filter((p) => !(p.x0 >= b.x0 - 1e-9 && p.x1 <= b.x1 + 1e-9)).concat({ ...b, id: `wall-${s.st.id}` });
  }
  const at = (x, y) => pieces.find((p) => x >= p.x0 && x < p.x1 && Math.abs(p.top - y) < 1e-9);
  const start = at(level.spawn.x, level.spawn.y), goal = at(level.goal.x, level.goal.y);
  return { surfaces: pieces.map((p) => (p === start ? { ...p, id: 'L' } : p === goal ? { ...p, id: 'R' } : p)), stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] };
}
