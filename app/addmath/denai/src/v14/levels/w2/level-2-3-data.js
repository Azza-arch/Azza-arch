// World 2 · Level 2-3 "Gerbang Parabola" — map data (pure, no Phaser; tested with node).
// Units are tiles, y UP from the river's water line (global y = 0); banks at y = 1.
// Tebing Sungai → Station G (pontoons at the roots → pontoon bridge over the river) → Station H
// (chain level: one point of contact → bucket → drawbridge over the pool) → the Gate of Two Seals
// (P: equation from roots, Q: inequality; both lit → the stone gate opens) → World 2 complete.
import { STATION_G, STATION_H, SEAL_P, SEAL_Q, MECHANISMS_23 } from './roots.js';
import { TILE } from './quadratic.js';

export const LEVEL_ID = 'w2-l3';
export const FLOOR_Y = -3;
export const TOP_Y = 12;
export const WIDTH = 48;
export const GATE_MX = 38;

export const STATIONS = [
  { st: STATION_G, ox: 9, oy: 0, leverX: 7, mech: 'G', mx: 9, name: 'Stesen G · Dua Ponton',
    lesson: 'punca persamaan x² − 6x + 5 = 0 ialah x = 1 dan x = 5, tempat lengkung mencecah paksi-x' },
  { st: STATION_H, ox: 20, oy: 0, leverX: 18.5, mech: 'H', mx: 20, name: 'Stesen H · Aras Rantai',
    lesson: 'b² − 4ac > 0: dua punca; = 0: satu punca (graf menyentuh paksi-x); < 0: tiada punca nyata' },
  { st: SEAL_P, ox: 27.5, oy: 3.7, leverX: 29, mech: 'PQ', mx: GATE_MX, name: 'Meterai Punca',
    lesson: 'punca 2 dan 6 → (x − 2)(x − 6) = x² − 8x + 12' },
  { st: SEAL_Q, ox: 32.5, oy: 3.7, leverX: 34, mech: 'PQ', mx: GATE_MX, name: 'Meterai Ketaksamaan',
    lesson: '(x − 2)(x − 6) < 0 apabila 2 < x < 6, iaitu di antara punca, di bawah paksi-x' },
];

const GROUND = [
  ['tebing', 0, 9, 1, 'grass'],
  // river (Station G) 9–15
  ['tengah', 15, 20, 1, 'grass'],
  // pool (Station H) 20–26
  ['meterai', 26, 38, 1, 'stone'], ['gate-floor', 38, 39, 1, 'stone'], ['keluar', 39, 48, 1, 'grass'],
];

function placed(key, mx) {
  const m = MECHANISMS_23[key], shift = (p) => ({ ...p, x0: p.x0 + mx, x1: p.x1 + mx });
  return { id: m.id, key, active: m.active.map(shift), blocking: m.base.filter((p) => m.blocking.includes(p.id)).map(shift), needs: key === 'PQ' ? ['P', 'Q'] : [key] };
}

export function buildLevel() {
  const terrain = GROUND.map(([id, x0, x1, top, style]) => ({ id, x0, x1, top, style }));
  return {
    terrain, slabs: [],
    waters: [{ x0: 9, x1: 15, top: 0, station: 'G' }, { x0: 20, x1: 26, top: 0, station: 'H' }],
    stations: STATIONS,
    mechanisms: [placed('G', 9), placed('H', 20), placed('PQ', GATE_MX)],
    spawn: { x: 2, y: 1 },
    checkpoints: [
      { id: 'entry', x: 2, y: 1, label: 'Tebing Sungai' },
      { id: 'after-g', x: 17, y: 1, label: 'Selepas sungai' },
      { id: 'after-h', x: 27.5, y: 1, label: 'Gerbang Dua Meterai' },
    ],
    coins: [
      ['e1', 3, 2], ['e2', 5, 2], ['e3', 11, 1.5], ['e4', 13, 1.5], ['e5', 16.5, 2], ['e6', 17.5, 2],
      ['e7', 22, 2], ['e8', 24, 2], ['e9', 31, 2], ['e10', 36, 2], ['e11', 41, 2], ['e12', 43, 2],
    ].map(([id, x, y]) => ({ id, x, y })),
    gate: { x: 45, y: 1 },
    goal: { x: 46.5, y: 1 },
    width: WIDTH, floor: FLOOR_Y, top: TOP_Y, tile: TILE,
  };
}

/** The whole level as one analyseStation station, with the given mechanisms active (for the tests). */
export function levelStation(level, active) {
  const t = level.terrain, surfaces = [];
  t.forEach((p, i) => { if (!(p.id === 'gate-floor' && !active.PQ)) surfaces.push({ ...p, id: i === 0 ? 'L' : i === t.length - 1 ? 'R' : p.id }); });
  for (const m of level.mechanisms) {
    if (active[m.key]) surfaces.push(...m.active);
    else surfaces.push(...m.blocking);
  }
  return { surfaces, stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] };
}
