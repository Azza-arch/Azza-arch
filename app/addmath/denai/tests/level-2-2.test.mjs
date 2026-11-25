// Level 2-2 map: built terrain + mechanisms behave exactly like the validated mechanisms.
// Run: node tests/level-2-2.test.mjs
import assert from 'node:assert/strict';
import { MOTION } from '../src/level.js';
import { analyseStation } from '../src/v14/levels/w2/quadratic.js';
import { buildLevel, mechanismFromMap, STATIONS, WIDTH, TOP_Y, SECRET, stationsFor, variantFor } from '../src/v14/levels/w2/level-2-2-data.js';
import { quad } from '../src/v14/levels/w2/peak.js';
const L = buildLevel(), t = L.terrain;
const weak = { ...MOTION, jump: MOTION.jump * 0.95, speed: MOTION.speed * 0.95 }, strong = { ...MOTION, jump: MOTION.jump * 1.05, speed: MOTION.speed * 1.05 };
// ground is continuous (no water in 2-2), covers the width, never overlaps
assert.equal(t[0].x0, 0); assert.equal(t.at(-1).x1, WIDTH);
for (let i = 1; i < t.length; i++) assert.ok(Math.abs(t[i].x0 - t[i - 1].x1) < 1e-9, `continuous ${t[i - 1].id} → ${t[i].id}`);
// every rise of more than one tile is a cliff that a mechanism climbs
const cliffs = []; for (let i = 1; i < t.length; i++) if (t[i].top - t[i - 1].top > 1) cliffs.push(t[i].x0);
assert.deepEqual(cliffs, [18, 45], 'cliffs at x = 18 (Station D steps) and x = 45 (Station F lift)');
// each mechanism, re-read from the MAP: impossible while inactive, easy once active
for (const s of STATIONS) {
  assert.ok(!analyseStation(mechanismFromMap(L, s, false), {}, strong).success, `${s.st.id}: blocked on the map while inactive`);
  assert.ok(analyseStation(mechanismFromMap(L, s, true), {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, `${s.st.id}: easy on the map once active`);
}
// the whole level in order: each mechanism is the ONLY way on (no other route around it)
const all = (active) => ({ surfaces: [...t.map((p, i) => ({ ...p, id: i === 0 ? 'L' : i === t.length - 1 ? 'R' : p.id })).filter((p) => !(active.E ? false : p.id === 'gate-floor')),
  ...(active.E ? [] : [{ id: 'gate', x0: 29, x1: 30, top: 11 }]), ...L.mechanisms.filter((m) => active[m.station]).flatMap((m) => m.active)], stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] });
for (const missing of ['D', 'E', 'F']) {
  const act = { D: true, E: true, F: true, [missing]: false };
  assert.ok(!analyseStation(all(act), {}, strong).success, `level cannot be finished without station ${missing}`);
}
assert.ok(analyseStation(all({ D: true, E: true, F: true }), {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, 'level can be finished easily with all three');
// the stations' curves fit in the world: D's ball and E's jet (and the bell) are inside it
for (const s of STATIONS) if (s.st.coeff) { const f = quad(s.st.coeff.a, s.st.coeff.b, s.st.coeff.c); for (let x = s.st.from; x <= s.st.to; x += 0.25) assert.ok(s.oy + f(x) <= TOP_Y - 0.5, `${s.st.id} curve inside the world`); }
assert.ok(STATIONS[1].oy + STATIONS[1].st.bellY < TOP_Y, 'bell inside the world');
// levers on solid ground, coins and checkpoints inside the world
for (const s of STATIONS) assert.ok(t.some((p) => s.leverX >= p.x0 && s.leverX <= p.x1), `${s.st.id} lever on ground`);
for (const c of [...L.coins, ...L.checkpoints]) assert.ok(c.x > 0 && c.x < WIDTH);
assert.equal(new Set(L.coins.map((c) => c.id)).size, 12);
console.log('level 2-2: ok');

// replay variant: the same map and mechanisms, only Station D's curve changes; it fits D's grid (0…6)
{ const alt = buildLevel('alt'); assert.deepEqual(alt.terrain, L.terrain); assert.equal(alt.stations[0].st.coeff.b, 8);
  assert.ok(alt.stations[0].st.to <= 6 && alt.stations[0].st.options.x.every((x) => x <= 6));
  assert.deepEqual(stationsFor('base'), STATIONS); assert.deepEqual([0, 1, 2, 3].map(variantFor), ['base', 'alt', 'base', 'alt']); }
// secret: from the exit ledge (y 8) up the stones to the gate top, easy with weak jumps (strict),
// and the gem is in the world and above the gate
{ const ex = t.find((p) => p.id === 'exit');
  const sf = [{ id: 'L', x0: ex.x0, x1: SECRET.platforms[0].x0, top: ex.top }, ...SECRET.platforms.slice(0, -1).map((p, i) => ({ id: `p${i}`, ...p })), { id: 'R', ...SECRET.platforms.at(-1) }];
  assert.ok(analyseStation({ surfaces: sf, stoneXs: [], water: -50, top: 50, ceiling: [], rings: [] }, {}, weak, { strict: true, maxRise: 1.5, maxGap: 2 }).success, 'secret reachable');
  assert.ok(SECRET.y < TOP_Y - 0.5 && SECRET.x > L.gate.x - 1 && SECRET.x < L.gate.x + 2); }
console.log('level 2-2 variant + secret: ok');
