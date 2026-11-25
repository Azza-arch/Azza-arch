// Level 2-1 map: the built terrain must give exactly the analysed puzzles. Run: node tests/level-2-1.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation, stationCombos } from '../src/v14/levels/w2/quadratic.js';
import { buildLevel, surfacesFromMap, STATIONS, WIDTH } from '../src/v14/levels/w2/level-2-1-data.js';

const level = buildLevel();
const key = (st, c) => st.levers.map((l) => `${l}=${c[l]}`).join(',');

// 1. Ground pieces never overlap and cover the whole width except the water gaps.
const t = level.terrain;
for (let i = 1; i < t.length; i++) assert.ok(t[i].x0 >= t[i - 1].x1 - 1e-9, `overlap ${t[i - 1].id} / ${t[i].id}`);
assert.equal(t[0].x0, 0); assert.equal(t.at(-1).x1, WIDTH);
for (let i = 1; i < t.length; i++) if (t[i].x0 > t[i - 1].x1) assert.ok(level.waters.some((w) => Math.abs(w.x0 - t[i - 1].x1) < 1e-9 && Math.abs(w.x1 - t[i].x0) < 1e-9), `gap ${t[i - 1].x1}-${t[i].x0} has water`);
// stone edges land on whole tiles (Kenney grid)
for (const s of STATIONS) for (const x of s.st.stoneXs) assert.ok(Number.isInteger(s.ox + x - 0.5), `${s.st.id} stone ${x} on the grid`);

// 2. Every station, re-read from the MAP (neighbouring steps and banks included), behaves exactly
//    like the analysed station: only the answer crosses.
for (const s of STATIONS) {
  const fromMap = { ...s.st, surfaces: surfacesFromMap(level, s) };
  assert.ok(fromMap.surfaces.some((p) => p.id === 'L') && fromMap.surfaces.some((p) => p.id === 'R'), `${s.st.id}: banks found on the map`);
  for (const c of stationCombos(s.st)) {
    const right = key(s.st, c) === key(s.st, s.st.answer);
    assert.equal(analyseStation(fromMap, c, MOTION).success, right, `${s.st.id} on the map, ${key(s.st, c)}`);
  }
  assert.ok(analyseStation(fromMap, s.st.answer, MOTION, { maxRise: 1.5, maxGap: 2 }).success, `${s.st.id}: easy route on the map`);
}

// 3. The paths between stations are walkable without any puzzle: no step up higher than 1 tile.
for (let i = 1; i < t.length; i++) if (Math.abs(t[i].x0 - t[i - 1].x1) < 1e-9) assert.ok(t[i].top - t[i - 1].top <= 1 + 1e-9, `step up ${t[i - 1].id} → ${t[i].id}`);

// 4. Levers stand on dry ground with headroom; checkpoints and coins are inside the world.
for (const s of STATIONS) {
  const under = t.find((p) => s.leverX >= p.x0 && s.leverX <= p.x1);
  assert.ok(under && !level.waters.some((w) => s.leverX > w.x0 && s.leverX < w.x1), `${s.st.id} lever on ground`);
  const roof = level.slabs.filter((r) => s.leverX > r.x0 && s.leverX < r.x1).map((r) => r.bottom);
  assert.ok(!roof.length || Math.min(...roof) - under.top >= MOTION.bodyHeight / 54 + 0.2, `${s.st.id} lever headroom`);
}
for (const c of [...level.checkpoints, ...level.coins]) assert.ok(c.x > 0 && c.x < WIDTH, `${c.id} inside`);
assert.equal(new Set(level.coins.map((c) => c.id)).size, level.coins.length);
console.log('level 2-1: ok');
