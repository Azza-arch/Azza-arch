// World 2 Station A: maths + reachability with the real MOTION numbers. Run: node tests/quadratic.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { STATION_A as ST, f, stones, ringHits, analyse, jumpEnvelope, formatA } from '../src/v14/levels/w2/quadratic.js';
assert.equal(f(-0.5, 3, 4, 1), 2); assert.equal(f(-0.5, 3, 4, 5), 2); assert.equal(f(-1, 3, 4, 1), 0);
assert.deepEqual(ST.options.filter((a) => ringHits(a).every((r) => r.hit)), [-0.5], 'only a = -1/2 passes both rings');
assert.deepEqual(stones(-0.5).map((s) => s.y), [2, 3.5, 4, 3.5, 2]);
assert.equal(stones(-2)[0].state, 'submerged'); assert.equal(stones(2)[0].state, 'high');
const peak = jumpEnvelope(MOTION).peak;
assert.ok(Math.abs(peak - 92.28) < 0.05, `peak ${peak}`); // matches the browser measurement
for (const a of ST.options) assert.equal(analyse(a, MOTION).success, a === ST.answer, `a=${a}`);
assert.equal(analyse(-1, MOTION).blocked.rise, 2.5);
assert.equal(analyse(-2, MOTION).blocked.to, 'C');
// margins: the correct route still works with a 10% weaker jump; wrong ones still fail with a 10% stronger jump
assert.ok(analyse(-0.5, { ...MOTION, jump: MOTION.jump * 0.95 }).success);
for (const a of [-2, -1, 0.5, 1, 2]) assert.ok(!analyse(a, { ...MOTION, jump: MOTION.jump * 1.03 }).success, `a=${a} margin`);
assert.equal(formatA(-0.5), '−½');
console.log('quadratic: ok');
