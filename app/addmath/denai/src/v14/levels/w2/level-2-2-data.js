// World 2 · Level 2-2 "Lembah Puncak" — map data (pure, no Phaser; tested with node).
// Units are tiles (1 tile = 54 world units), y measured UP from the valley floor (global y = 0).
// A vertical level: valley (y 0) → stone steps raised by Station D → plateau (y 4) → stone gate
// opened by Station E's bell → cargo lift driven by Station F's pen → exit ledge (y 8) → 2-3.
// Each station's maths origin sits at (ox, oy): maths point (x, y) is global (ox + x, oy + y).
import { STATION_D, STATION_D_ALT, STATION_E, STATION_F, MECHANISMS, TILE } from './peak.js';

export const LEVEL_ID = 'w2-l2';
export const FLOOR_Y = -2;
export const TOP_Y = 14;        // the bell hangs at y = 12 under a rock beam (top 13.6)
export const WIDTH = 56;

export const STATIONS = [
  { st: STATION_D, ox: 8, oy: 0, leverX: 8, name: 'Stesen D · Tangkap di Puncak', mech: 'D', mx: 15,
    lesson: 'bucu y = ax² + bx + c berada pada x = −b/2a; di bucu bola berhenti naik' },
  { st: STATION_E, ox: 23, oy: 4, leverX: 21.5, name: 'Stesen E · Loceng', mech: 'E', mx: 29,
    lesson: 'nilai maksimum ialah k dan berlaku pada x = h: −2x² + 8x = −2(x − 2)² + 8' },
  { st: STATION_F, ox: 34, oy: 4, leverX: 33, name: 'Stesen F · Kandang Maksimum', mech: 'F', mx: 42,
    lesson: 'luas A(x) = x(6 − x) naik, mencapai maksimum 9 pada x = 3, kemudian turun' },
];

// Ground (global tiles): [id, x0, x1, top, style]. The two cliffs (x 18 and x 45) are only crossed
// with the mechanisms; the gate floor (x 29–30) carries Station E's stone gate.
/** The stations for a run: 'alt' (replays) swaps Station D's curve for y = −x² + 8x − 12. */
export const VARIANTS = ['base', 'alt'];
export function stationsFor(variant = 'base') {
  return variant === 'alt' ? STATIONS.map((s) => (s.mech === 'D' ? { ...s, st: STATION_D_ALT } : s)) : STATIONS;
}
/** Which variant a new run uses: the first play and every second replay use the base set. */
export const variantFor = (completions) => (completions % 2 === 1 ? 'alt' : 'base');

// Secret (optional): stepping stones up from the exit ledge to the top of the exit gate, where a
// limestone gem waits. Rises ≤ 1.5, gaps ≤ 1 (tests/level-2-2.test.mjs checks it with weak jumps).
export const SECRET = { id: 'atas-gerbang', label: 'Permata di atas gerbang', x: 52.5, y: 12.6,
  platforms: [{ x0: 47.5, x1: 48.5, top: 9.5 }, { x0: 49, x1: 50, top: 11 }, { x0: 51, x1: 54, top: 12, lintel: true }] };

const GROUND = [
  ['ridge', 0, 7, 1, 'grass'], ['valley', 7, 18, 0, 'grass'],
  ['plateau-a', 18, 29, 4, 'stone'], ['gate-floor', 29, 30, 4, 'stone'], ['plateau-b', 30, 45, 4, 'stone'],
  ['exit', 45, 56, 8, 'stone'],
];

/** Mechanism pieces in global tiles: steps / lift ledges appear when active; the gate disappears. */
function placedMechanism(s) {
  const m = MECHANISMS[s.mech], shift = (p) => ({ ...p, x0: p.x0 + s.mx, x1: p.x1 + s.mx });
  return { id: m.id, station: s.st.id, active: m.active.map(shift), blocking: m.base.filter((p) => m.blocking.includes(p.id)).map(shift) };
}

export function buildLevel(variant = 'base') {
  const terrain = GROUND.map(([id, x0, x1, top, style]) => ({ id, x0, x1, top, style }));
  return {
    terrain, slabs: [], waters: [],
    stations: stationsFor(variant), variant, secrets: [SECRET],
    mechanisms: STATIONS.map(placedMechanism),
    spawn: { x: 2, y: 1 },
    checkpoints: [
      { id: 'entry', x: 2, y: 1, label: 'Cerun Angin' },
      { id: 'after-d', x: 20, y: 4, label: 'Dataran' },
      { id: 'after-e', x: 32, y: 4, label: 'Selepas Gerbang' },
    ],
    coins: [
      ['d1', 3, 2], ['d2', 5, 2], ['d3', 10.5, 1], ['d4', 11.5, 1],
      ['d5', 19.5, 5], ['d6', 20.5, 5], ['d7', 24, 5], ['d8', 26, 5],
      ['d9', 37, 5], ['d10', 39, 5], ['d11', 48, 9], ['d12', 50, 9],
    ].map(([id, x, y]) => ({ id, x, y })),
    gate: { x: 52, y: 8 },
    goal: { x: 54, y: 8 },
    width: WIDTH, floor: FLOOR_Y, top: TOP_Y, tile: TILE,
  };
}

/** A mechanism read back from the built map, as an analyseStation station (for the tests). */
export function mechanismFromMap(level, s, active, window = 6) {
  const pm = level.mechanisms.find((m) => m.station === s.st.id);
  const lo = s.mx - window, hi = s.mx + 3 + window;
  let pieces = level.terrain.filter((t) => t.x1 > lo && t.x0 < hi).map((t) => ({ id: t.id, x0: t.x0 - s.mx, x1: t.x1 - s.mx, top: t.top }));
  if (!active) { // the gate stands on its floor: replace the floor under it by the gate itself
    for (const b of pm.blocking) pieces = pieces.filter((p) => !(p.x0 >= b.x0 - s.mx - 1e-9 && p.x1 <= b.x1 - s.mx + 1e-9)).concat({ id: `gate-${b.id}`, x0: b.x0 - s.mx, x1: b.x1 - s.mx, top: b.top });
  } else pieces = pieces.concat(pm.active.map((p) => ({ ...p, x0: p.x0 - s.mx, x1: p.x1 - s.mx })));
  // start = the ground the player stands on before the mechanism; goal = the ground after it
  const Ltop = MECHANISMS[s.mech].base.find((b) => b.id === 'L').top;
  const start = pieces.filter((p) => p.x0 < 0 && p.top === Ltop && !p.id.startsWith('gate')).sort((a, b) => b.x1 - a.x1)[0];
  const endX = Math.max(...MECHANISMS[s.mech].base.filter((b) => b.id === 'R').map((b) => b.x0));
  const goal = pieces.filter((p) => p.x0 >= endX - 1e-9).sort((a, b) => a.x0 - b.x0)[0];
  return { surfaces: pieces.map((p) => (p === start ? { ...p, id: 'L' } : p === goal ? { ...p, id: 'R' } : p)), stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] };
}
