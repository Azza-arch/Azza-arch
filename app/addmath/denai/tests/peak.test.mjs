// Level 2-2 stations: maths answers and mechanism traversal. Run: node tests/peak.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation } from '../src/v14/levels/w2/quadratic.js';
import { STATION_D, STATION_E, STATION_F, catchOutcome, bellOutcome, penOutcome, penArea, solves, combos, vertexOf, quad, MECHANISMS, mechanismStation } from '../src/v14/levels/w2/peak.js';
const weak = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 };
const strong = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
const key = (c) => JSON.stringify(c);

// every station: exactly one lever setting solves it, and it is the stated answer
for (const st of [STATION_D, STATION_E, STATION_F]) {
  const sol = combos(st).filter((c) => solves(st, c));
  assert.deepEqual(sol.map(key), [key(st.answer)], `${st.id}: one solution`);
  assert.ok(!solves(st, st.start), `${st.id}: the lever does not start on the answer`);
}
// D: vertex from −b/2a; the ball bounces on the curve elsewhere (symmetric points), passes otherwise
assert.deepEqual(vertexOf(-1, 6, -5), { h: 3, k: 4 });
assert.equal(quad(-1, 6, -5)(1), 0); assert.equal(quad(-1, 6, -5)(5), 0);
assert.equal(catchOutcome(STATION_D, { x: 3, y: 4 }).result, 'caught');
assert.equal(catchOutcome(STATION_D, { x: 2, y: 3 }).result, 'bounce');
assert.equal(catchOutcome(STATION_D, { x: 4, y: 3 }).result, 'bounce');
assert.equal(catchOutcome(STATION_D, { x: 3, y: 3 }).result, 'over');
assert.equal(catchOutcome(STATION_D, { x: 3, y: 5 }).result, 'under');
// E: maximum value k = 8 at x = h = 2 (−2x² + 8x = −2(x − 2)² + 8)
assert.deepEqual(vertexOf(-2, 8, 0), { h: 2, k: 8 });
for (let x = 0; x <= 4; x += 0.25) assert.ok(Math.abs(quad(-2, 8, 0)(x) - (-2 * (x - 2) ** 2 + 8)) < 1e-9);
assert.equal(bellOutcome(STATION_E, { x: 1.5 }).jetY, 7.5);
// F: A(x) = x(6 − x) rises, peaks at x = 3 (9), falls; only 9 fits all crates
assert.deepEqual(STATION_F.options.x.map((x) => penArea(STATION_F, x)), [5, 8, 9, 8, 5]);
assert.deepEqual(penOutcome(STATION_F, { x: 2 }), { full: false, area: 8, fit: 8, left: 1, length: 4 });

// mechanisms: impossible while inactive (even with a 5% stronger jump), easy once active
for (const [id, m] of Object.entries(MECHANISMS)) {
  assert.ok(!analyseStation(mechanismStation(m, false), {}, strongM()).success, `${id}: blocked while inactive`);
  assert.ok(analyseStation(mechanismStation(m, true), {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, `${id}: easy once active`);
}
function strongM() { return strong; }
console.log('peak (level 2-2): ok');
