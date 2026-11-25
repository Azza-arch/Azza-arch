// Level 2-3 stations: maths answers and mechanism traversal. Run: node tests/roots.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation } from '../src/v14/levels/w2/quadratic.js';
import { combos, mechanismStation } from '../src/v14/levels/w2/peak.js';
import { STATION_G, STATION_H, SEAL_P, SEAL_Q, solvesRoots, pontoonOutcome, chainOutcome, sealPOutcome, sealQOutcome, realRoots, disc, MECHANISMS_23 } from '../src/v14/levels/w2/roots.js';
const weak = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 };
const strong = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
const key = (c) => JSON.stringify(c);
for (const st of [STATION_G, STATION_H, SEAL_P, SEAL_Q]) {
  const sol = combos(st).filter((c) => solvesRoots(st, c));
  assert.deepEqual(sol.map(key), [key(st.answer)], `${st.id}: exactly one solution`);
  assert.ok(!solvesRoots(st, st.start), `${st.id}: lever does not start on the answer`);
}
// G: roots of x² − 6x + 5 are 1 and 5; a pontoon off a root shows the chain's height there
assert.deepEqual(realRoots(1, -6, 5), [1, 5]);
assert.equal(pontoonOutcome(STATION_G, { kiri: 2, kanan: 5 }).left.chainY, -3);
// H: discriminant 36 − 4c → two / one / no points of contact
assert.deepEqual(STATION_H.options.c.map((c) => disc(1, -6, c)), [16, 12, 8, 4, 0, -4, -8]);
assert.deepEqual(chainOutcome(STATION_H, { c: 8 }).roots, [2, 4]);
assert.equal(chainOutcome(STATION_H, { c: 8 }).kind, 'two');
assert.equal(chainOutcome(STATION_H, { c: 9 }).kind, 'one');
assert.equal(chainOutcome(STATION_H, { c: 10 }).kind, 'none');
// P: (x − 2)(x − 6) = x² − 8x + 12; Q: negative exactly between the roots
assert.ok(sealPOutcome(SEAL_P, { b: -8, c: 12 }).lit);
assert.deepEqual(sealQOutcome(SEAL_Q, { kiri: 1, kanan: 6 }).tooWide, true);
assert.deepEqual(sealQOutcome(SEAL_Q, { kiri: 3, kanan: 6 }).tooNarrow, true);
for (let x = 0; x <= 8; x += 0.5) { const v = (x - 2) * (x - 6); assert.equal(v < 0, x > 2 && x < 6); }
// mechanisms: impossible while inactive, easy once active
for (const [id, m] of Object.entries(MECHANISMS_23)) {
  assert.ok(!analyseStation(mechanismStation(m, false), {}, strong).success, `${id}: blocked while inactive`);
  assert.ok(analyseStation(mechanismStation(m, true), {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, `${id}: easy once active`);
}
console.log('roots (level 2-3): ok');
