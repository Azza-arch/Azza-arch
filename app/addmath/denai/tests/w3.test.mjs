// World 3 (Kilang & Lombong): maths, maps (jump physics), walkways, secrets and the save.
// Run: node tests/w3.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation } from '../src/v14/levels/w2/quadratic.js';
import * as S from '../src/v14/levels/w3/systems.js';
import { buildLevel, levelStation, walkwayPieces, LEVEL_IDS } from '../src/v14/levels/w3/maps.js';
import { createW3Store, newRun, sanitizeRun, W3_KEY } from '../src/v14/levels/w3/campaign.js';

const weak = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 };
const strong = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
const EASY = { strict: true, maxRise: 1.5, maxGap: 2 };
const key = (c) => JSON.stringify(Object.keys(c).sort().map((k) => [k, c[k]]));

// ── 1. maths: every station has exactly its stated solution(s), and never starts on one ──
for (const st of Object.values(S.STATIONS_BY_ID)) {
  const sol = S.combos(st).filter((c) => S.solves(st, c)).map(key).sort();
  const want = st.answer ? [key(st.answer)]
    : st.type === 'intersect' ? [key({ [st.levers[0]]: st.answers[0], [st.levers[1]]: st.answers[1] }), key({ [st.levers[0]]: st.answers[1], [st.levers[1]]: st.answers[0] })].sort()
      : st.answers.map(key).sort();
  assert.deepEqual(sol, want, `${st.id}: solutions`);
  assert.ok(!S.solves(st, st.start), `${st.id}: the levers do not start on an answer`);
}
// the systems are independent (a unique solution over the reals, not only over the lever options)
const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
for (const st of [S.STATION_B, S.STATION_C]) assert.notEqual(det3(st.rows.map((r) => st.levers.map((n) => r.coef[n] || 0))), 0, `${st.id}: independent`);
// D, F: the clamps hold exactly at the intersections found by substitution
assert.deepEqual([-1, 2].map((x) => S.clampState(S.STATION_D, x).state), ['hold', 'hold']);
assert.deepEqual([-3, 4].map((x) => S.clampState(S.STATION_F, x).state), ['hold', 'hold']);
assert.equal(S.intersectOutcome(S.STATION_D, { p: 2, q: 2 }).ok, false, 'one point twice is not two points');
// E: x + y = 7, xy = 12
assert.deepEqual(S.plateOutcome(S.STATION_E, { x: 3, y: 4 }), { per: 14, area: 12, perOk: true, areaOk: true, ok: true });
assert.equal(S.plateOutcome(S.STATION_E, { x: 2, y: 5 }).ok, false, '2 × 5: right frame, wrong opening');
// K: the maximum of 3x + 2y over the region is 19 at (5, 2), and only k = 19 rests on it
assert.deepEqual(S.isolineOutcome(S.STATION_K, { k: 19 }).on, [[5, 2]]);
assert.equal(S.isolineOutcome(S.STATION_K, { k: 18 }).state, 'cuts');
assert.equal(S.isolineOutcome(S.STATION_K, { k: 20 }).state, 'misses');
// L: the minimum of 2x + 3y is 13 at (2, 3); outside the region the order is refused
assert.equal(S.planOutcome(S.STATION_L, { x: 2, y: 3 }).best, 13);
assert.equal(S.planOutcome(S.STATION_L, { x: 1, y: 2 }).feasible, false);

// ── 2. each region station alone: the right signs light a walkway that is easy to cross;
//       every other choice of signs leaves a gap even a stronger jump cannot cross ──
for (const st of [S.STATION_G, S.STATION_H]) {
  for (const c of S.combos(st)) {
    const signs = st.levers.map((n) => c[n]), station = { surfaces: S.regionSurfaces(st, signs), stoneXs: [], water: -1, top: 50, ceiling: [], rings: [] };
    if (S.solves(st, c)) assert.ok(analyseStation(station, {}, weak, EASY).success, `${st.id} ${signs}: easy`);
    else assert.ok(!analyseStation(station, {}, strong).success, `${st.id} ${signs}: impossible`);
  }
  for (const [x, y] of st.walkway) assert.ok(S.inRegion(st.lines, st.levers.map((n) => st.answer[n]), x, y), `${st.id}: (${x}, ${y}) in the region`);
}

// ── 3. every level, read from its map: easy with all stations solved, impossible without any one;
//       on 3-3 also with each wrong walkway; each secret is easy to reach from its ground ──
for (const id of LEVEL_IDS) {
  const L = buildLevel(id), all = Object.fromEntries(L.stations.map((s) => [s.st.id, true]));
  assert.ok(analyseStation(levelStation(L, all), {}, weak, EASY).success, `${id}: finishable with all stations solved`);
  for (const s of L.stations) assert.ok(!analyseStation(levelStation(L, { ...all, [s.st.id]: false }), {}, strong).success, `${id}: not finishable without ${s.st.id}`);
  for (const s of L.stations.filter((q) => q.mech.kind === 'walkway')) for (const c of S.combos(s.st)) {
    if (S.solves(s.st, c)) continue;
    const signs = s.st.levers.map((n) => c[n]);
    assert.ok(!analyseStation(levelStation(L, all, { [s.st.id]: signs }), {}, strong).success, `${id}: wrong walkway ${s.st.id} ${signs}`);
    assert.ok(walkwayPieces(s, signs).length < s.st.walkway.length);
  }
  // ground continuity: pieces never overlap; every gap in the ground is a pit or a mechanism
  const t = [...L.terrain].sort((a, b) => a.x0 - b.x0);
  for (let i = 1; i < t.length; i++) assert.ok(t[i].x0 >= t[i - 1].x1 - 1e-9, `${id}: ${t[i - 1].id} / ${t[i].id} overlap`);
  for (let i = 1; i < t.length; i++) if (t[i].x0 > t[i - 1].x1 + 1e-9) assert.ok(L.pits.some((p) => p.x0 <= t[i - 1].x1 + 1e-9 && p.x1 >= t[i].x0 - 1e-9), `${id}: gap ${t[i - 1].x1}–${t[i].x0} is a pit`);
  const sec = L.secret, from = L.terrain.find((p) => sec.platforms[0].x0 >= p.x0 - 1 && sec.platforms[0].x1 <= p.x1 + 1 && p.top < sec.platforms[0].top);
  assert.ok(from, `${id}: secret starts from the ground`);
  const sf = [{ id: 'L', x0: from.x0, x1: from.x1, top: from.top }, ...sec.platforms.slice(0, -1).map((p, i) => ({ id: `p${i}`, ...p })), { id: 'R', ...sec.platforms.at(-1) }];
  assert.ok(analyseStation({ surfaces: sf, stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] }, {}, weak, EASY).success, `${id}: secret reachable`);
  assert.ok(sec.y < L.top - 0.5, `${id}: secret inside the world`);
  assert.equal(L.coins.length, 10);
}

// ── 4. save: own key, real answers only, other levels and worlds untouched ──
{
  const mem = new Map(), storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)) };
  mem.set('denai-w2-campaign-v1', '{"keep":true}'); mem.set('denai-save-v14', '{"w1":true}');
  const store = createW3Store(storage), r = newRun('w3-l1');
  assert.deepEqual(r.levers, { A: { x: 1, y: 1 }, B: { x: 0, y: 0, z: 0 }, C: { A: 1, B: 1, C: 1 } });
  r.solved.A = true; r.levers.A = { x: 4, y: 3 }; r.checkpointId = 'after-a'; r.coins = ['c1', 'zz']; r.secrets = ['atas-kilang', 'x'];
  assert.ok(store.saveRun(r, 'w3-l1'));
  const back = store.load().levels['w3-l1'];
  assert.equal(back.run.solved.A, true); assert.equal(back.run.checkpointId, 'after-a'); assert.deepEqual(back.run.coins, ['c1']); assert.deepEqual(back.secrets, ['atas-kilang']);
  const fake = sanitizeRun({ id: 'f', solved: { A: true, B: true, C: true }, levers: { A: { x: 3, y: 4 }, B: { x: 1, y: 2, z: 3 }, C: { A: 3, B: 2, C: 4 } }, checkpointId: 'after-b', completed: true }, 'w3-l1');
  assert.deepEqual(fake.solved, { A: false, B: true, C: true }); assert.equal(fake.checkpointId, 'entry'); assert.equal(fake.completed, false);
  const g = sanitizeRun({ id: 'g', solved: { G: true, H: true }, levers: { G: { s1: '≤', s2: '≤', s3: '≥' }, H: { s1: '≤', s2: '≤', s3: '≤' } }, checkpointId: 'after-g' }, 'w3-l3');
  assert.deepEqual(g.solved, { G: true, H: false }); assert.equal(g.checkpointId, 'after-g');
  const done = newRun('w3-l4'); done.solved = { K: true, L: true }; done.levers = { K: { k: 19 }, L: { x: 2, y: 3 } }; done.completed = true; done.elapsedMs = 90000;
  assert.ok(store.saveRun(done, 'w3-l4'));
  assert.equal(store.load().levels['w3-l4'].completions, 1); assert.equal(store.load().levels['w3-l1'].run.solved.A, true, 'another level kept');
  assert.equal(mem.get('denai-w2-campaign-v1'), '{"keep":true}'); assert.equal(mem.get('denai-save-v14'), '{"w1":true}');
  const raw = JSON.parse(mem.get(W3_KEY)); raw.schemaVersion = 2; mem.set(W3_KEY, JSON.stringify(raw));
  assert.equal(store.saveRun(r, 'w3-l1'), false, 'a newer save is never overwritten');
}
console.log('world 3: ok');
