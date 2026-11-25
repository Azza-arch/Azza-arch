// World 2 · Level 2-1 "Jejak Lengkung" — map data (pure, no Phaser; tested with node).
// Units are tiles (1 tile = 54 world units). Global y is measured UP from one shared ground
// line, so every station's maths y equals the global y: the station at offset `ox` puts maths
// point (x, y) at global (ox + x, y). `ox` is a half-integer so stone edges (x ± ½) land on whole
// tiles and Kenney tiles stay on the grid.
//
// The ground around each station is generated FROM that station's analysed surfaces
// (STATION_A_LEVEL, STATION_B, STATION_C in quadratic.js), and tests/level-2-1.test.mjs re-runs
// the reachability analysis on this map's own terrain. The map cannot drift from the maths.
import { STATION_A_LEVEL, STATION_B, STATION_C, TILE } from './quadratic.js';

export const LEVEL_ID = 'w2-l1';
export const FLOOR_Y = -3;      // bottom of every pit (global tiles)
export const TOP_Y = 10.5;      // top of the world
export const WIDTH = 71;        // tiles

// Stations in play order. leverX: where the lever post stands (global tiles), on the left bank.
export const STATIONS = [
  { st: STATION_A_LEVEL, ox: 20.5, leverX: 19, name: 'Stesen A · Bukaan', eq: 'a', rule: 'Batu terbina pada setiap x di sepanjang lengkung.', lesson: 'a mengubah bukaan: |a| besar = sempit, a negatif = terbuka ke bawah' },
  { st: STATION_B, ox: 34.5, leverX: 34.5, name: 'Stesen B · Anjakan', eq: 'hk', rule: 'Air hanya mengeras menjadi batu jika masuk kedua-dua corong (cincin).', lesson: 'h dan k mengalihkan bentuk yang sama: bucu = (h, k)' },
  { st: STATION_C, ox: 52.5, leverX: 51.5, name: 'Stesen C · Jambatan Gantung', eq: 'k', rule: 'Kabel hanya boleh diikat jika melalui kedua-dua sauh (cincin) di atas tiang.', lesson: 'k menaikkan atau menurunkan seluruh lengkung; a positif = ada titik minimum' },
];

// Ground between the stations (global tiles): [x0, x1, top, style].
const LINKS = [
  [0, 14, 2, 'grass'],           // Rabung Masuk: the ridge from World 1
  [14, 16, 1, 'grass'],          // step down into the valley
  // Station A left bank (16 → its own edge) is generated
  // Station A right bank → a small rocky rise, then down to Station B's bank (1)
  [30, 31, 1.5, 'stone'],
  [31, 32, 2, 'stone'],
  // Station B left bank (32 → edge) and right bank (→ 48) are generated
  // Station C left bank (48 → edge) and right bank (→ 71) are generated
];
const SPAN = { A: [16, 30], B: [32, 48], C: [48, 71] }; // outer ends of each station's banks

/** Terrain columns (solid to the floor), overhang/arch slabs, water and stations' world data. */
export function buildLevel() {
  const terrain = LINKS.map(([x0, x1, top, style], i) => ({ id: `link-${i}`, x0, x1, top, style }));
  const slabs = [], waters = [];
  for (const s of STATIONS) {
    const { st, ox } = s, [outL, outR] = SPAN[st.id];
    for (const sf of st.surfaces) {
      const x0 = sf.id === 'L' ? outL : ox + sf.x0, x1 = sf.id === 'R' ? outR : ox + sf.x1;
      terrain.push({ id: `${st.id}-${sf.id}`, x0, x1, top: sf.top, style: sf.id === 'L' || sf.id === 'R' ? 'grass' : 'stone', station: st.id });
    }
    for (const [i, c] of (st.ceiling || []).entries()) slabs.push({ id: `${st.id}-roof-${i}`, x0: ox + c.x0, x1: ox + c.x1, bottom: c.y, top: c.top ?? TOP_Y, station: st.id });
    // water fills every gap between this station's ground pieces
    const ground = st.surfaces.map((sf) => [sf.id === 'L' ? outL : ox + sf.x0, sf.id === 'R' ? outR : ox + sf.x1]).sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < ground.length; i++) if (ground[i][0] > ground[i - 1][1]) waters.push({ x0: ground[i - 1][1], x1: ground[i][0], top: st.water, station: st.id });
  }
  terrain.sort((a, b) => a.x0 - b.x0);
  return {
    terrain, slabs, waters,
    stations: STATIONS,
    spawn: { x: 2, y: 2 },
    checkpoints: [
      { id: 'entry', x: 2, y: 2, label: 'Rabung Masuk' },
      { id: 'after-a', x: 28, y: STATION_A_LEVEL.surfaces.find((s) => s.id === 'R').top, label: 'Selepas Stesen A' },
      { id: 'after-b', x: 45, y: STATION_B.surfaces.find((s) => s.id === 'R').top, label: 'Selepas Stesen B' },
    ],
    // 12 coins: 4 on the ridge, 2 over each station's correct route, 2 on the way out
    coins: [
      ['c1', 4, 3], ['c2', 6, 3], ['c3', 8, 3], ['c4', 10, 3],
      ['c5', 20.5 + 2, 4.4], ['c6', 20.5 + 4, 4.4],
      ['c7', 34.5 + 4, 4.2], ['c8', 34.5 + 6, 4.2],
      ['c9', 52.5 + 3, 2.3], ['c10', 52.5 + 5, 2.3],
      ['c11', 62, 2.5], ['c12', 64, 2.5],
    ].map(([id, x, y]) => ({ id, x, y })),
    gate: { x: 66, y: 1.5 },   // stone arch towards 2-2 (decoration)
    goal: { x: 68, y: 1.5 },
    width: WIDTH, floor: FLOOR_Y, top: TOP_Y, tile: TILE,
  };
}

/** Station-local surfaces read back from the built map (for the test: map === maths). */
export function surfacesFromMap(level, s, window = 8) {
  const { st, ox } = s, xs = st.stoneXs, lo = ox + Math.min(...xs) - window, hi = ox + Math.max(...xs) + window;
  const pieces = level.terrain.filter((t) => t.x1 > lo && t.x0 < hi).map((t) => ({ id: t.id, x0: t.x0 - ox, x1: t.x1 - ox, top: t.top }));
  // the leftmost/rightmost reachable pieces play the role of the station's L / R banks
  const left = pieces.filter((p) => p.x1 <= Math.min(...xs) - 0.5 + 1e-9).sort((a, b) => b.x1 - a.x1)[0];
  const right = pieces.filter((p) => p.x0 >= Math.max(...xs) + 0.5 - 1e-9 && p.top === st.surfaces.find((q) => q.id === 'R').top).sort((a, b) => a.x0 - b.x0)[0];
  return pieces.map((p) => (p === left ? { ...p, id: 'L' } : p === right ? { ...p, id: 'R' } : p));
}
