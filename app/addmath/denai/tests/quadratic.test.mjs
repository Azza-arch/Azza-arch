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

// ── Phase 2: stations B and C (generic analyser) ──
import { STATION_A_LEVEL, STATION_B, STATION_C, stationCombos, passesRings, analyseStation, routeEffort, airReach, jumpEnvelope as env2, reachAtRise } from '../src/v14/levels/w2/quadratic.js';
const weakM = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 };
const strongM = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
const key = (st, c) => st.levers.map((l) => `${l}=${c[l]}`).join(',');
// open-air reach from the new step simulation agrees with the Station A envelope
{ const e = env2(MOTION); for (const rise of [0, 27, 54, 81]) assert.ok(Math.abs(airReach(MOTION, rise) - reachAtRise(e, rise, MOTION.speed)) < 1e-6, `airReach rise ${rise}`); }
for (const st of [STATION_A_LEVEL, STATION_B, STATION_C]) {
  const combos = stationCombos(st);
  // maths: the rings pick exactly one lever setting, and it is the answer
  const byRings = combos.filter((c) => passesRings(st, c));
  assert.deepEqual(byRings.map((c) => key(st, c)), [key(st, st.answer)], `${st.id}: rings give one answer`);
  // physics agrees with the maths: only the answer crosses, with margins both ways
  for (const c of combos) {
    const right = key(st, c) === key(st, st.answer);
    assert.equal(analyseStation(st, c, MOTION).success, right, `${st.id} ${key(st, c)} normal jump`);
    if (right) assert.ok(analyseStation(st, c, weakM).success, `${st.id} answer with a 5% weaker jump`);
    else { const r = analyseStation(st, c, strongM); assert.ok(!r.success, `${st.id} ${key(st, c)} must fail with a 5% stronger jump`); assert.ok(analyseStation(st, c, MOTION).factors.length, `${st.id} ${key(st, c)} explains the failure`); }
  }
  // the correct route is gentle for a Form 4 player: no climb above 1.5 tiles, no gap above 2 tiles
  // easy = possible with a 5% weaker jump taken from a STANDSTILL in the middle of each stone
  const ok = analyseStation(st, st.answer, weakM, { strict: true, maxRise: 1.5, maxGap: 2 }), eff = routeEffort(st, st.answer, MOTION, ok.route);
  assert.ok(ok.success, `${st.id}: an easy route exists (standing take-off)`);
  assert.ok(eff.rise <= 1.5 && eff.gap <= 2, `${st.id} route effort ${JSON.stringify(eff)}`);
}
// Anchored stations (B, C): with nothing built the station cannot be crossed, even with a 5% stronger
// jump (so every wrong setting fails physically), and a wrong setting is explained as 'loose'.
for (const st of [STATION_B, STATION_C]) {
  const empty = { ...st, stoneXs: [] };
  assert.ok(!analyseStation(empty, st.answer, strongM).success, `${st.id}: empty station is impassable`);
  for (const c of stationCombos(st)) if (key(st, c) !== key(st, st.answer)) assert.ok(analyseStation(st, c, MOTION).factors.includes('loose'), `${st.id} ${key(st, c)} explained as loose`);
}
assert.deepEqual(STATION_B.answer, { a: -0.5, h: 5, k: 4 });
assert.deepEqual(STATION_C.levers, ['k']);
console.log('quadratic stations B, C: ok');
