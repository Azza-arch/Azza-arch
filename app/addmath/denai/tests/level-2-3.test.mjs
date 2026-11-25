// Level 2-3 map: each mechanism is the only way on; easy once active. Run: node tests/level-2-3.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation } from '../src/v14/levels/w2/quadratic.js';
import { buildLevel, levelStation, STATIONS, WIDTH, TOP_Y } from '../src/v14/levels/w2/level-2-3-data.js';
import { quad } from '../src/v14/levels/w2/peak.js';
const L = buildLevel(), t = L.terrain;
const weak = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 }, strong = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
assert.equal(t[0].x0, 0); assert.equal(t.at(-1).x1, WIDTH);
// gaps in the ground are exactly the two waters
const gaps = []; for (let i = 1; i < t.length; i++) if (t[i].x0 > t[i - 1].x1 + 1e-9) gaps.push([t[i - 1].x1, t[i].x0]);
assert.deepEqual(gaps, L.waters.map((w) => [w.x0, w.x1]));
// the level cannot be finished without any one mechanism, and is easy with all
for (const missing of ['G', 'H', 'PQ']) assert.ok(!analyseStation(levelStation(L, { G: true, H: true, PQ: true, [missing]: false }), {}, strong).success, `no way round ${missing}`);
assert.ok(analyseStation(levelStation(L, { G: true, H: true, PQ: true }), {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, 'easy with all three');
// levers stand on dry ground; boards and chains fit in the world
for (const s of STATIONS) assert.ok(t.some((p) => s.leverX >= p.x0 && s.leverX <= p.x1) && !L.waters.some((w) => s.leverX > w.x0 && s.leverX < w.x1), `${s.st.id} lever on ground`);
const G = STATIONS[0].st; for (let x = 0; x <= 6; x += .5) assert.ok(quad(1, -6, 5)(x) <= TOP_Y - 1);
assert.ok(Math.max(...STATIONS[1].st.options.c) <= TOP_Y - 1, 'H chain anchors inside the world');
assert.equal(new Set(L.coins.map((c) => c.id)).size, 12);
for (const c of [...L.coins, ...L.checkpoints]) assert.ok(c.x > 0 && c.x < WIDTH);
void G;
console.log('level 2-3: ok');
