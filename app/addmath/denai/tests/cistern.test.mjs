// Day 07 · Level 1-3 cistern (Takungan Lama): code lock model + permanent artifact store.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newSluice, sanitizeSluice, meterOf, turnCistern, pullCistern, testFlow, turnValve } from '../src/v14/levels/sluice-model.js';
import { createInverseStore, newRun, KEY } from '../src/v14/core/inverse-campaign.js';
import { CISTERN, ARTIFACTS, AB_TERRAIN, SLABS, LADDERS, WORLD } from '../src/v14/levels/inverse-world.js';

const memory = (seed = {}) => { const bytes = new Map(Object.entries(seed)); return { getItem: (k) => bytes.get(k) ?? null, setItem: (k, v) => bytes.set(k, String(v)), bytes }; };
const json = (v) => JSON.parse(JSON.stringify(v));

test('the code is the inverse of the cistern target, never the sluice or cave setting', () => {
  const m = meterOf(newSluice());
  assert.deepEqual([m.CISTERN_SETTING, m.CISTERN_TARGET], [3, 9], 'original puzzle: f(x) = 2x + 3, f(3) = 9');
  for (let seed = 0; seed < 500; seed++) {
    const v = meterOf(newSluice({ seed }));
    assert.ok(v.CISTERN_SETTING >= 1 && v.CISTERN_SETTING <= 6);
    assert.ok(v.CISTERN_SETTING !== v.SETTING && v.CISTERN_SETTING !== v.CAVE_SETTING, `seed ${seed}`);
    assert.equal(v.reading(v.CISTERN_SETTING), v.CISTERN_TARGET);
  }
});

test('wrong codes are refused with the reading; the right code opens; nothing else changes', () => {
  let s = newSluice();
  s = turnCistern(s); // 1
  const wrong = pullCistern(s);
  assert.deepEqual([wrong.result, wrong.reading, wrong.state.cistern.solved, wrong.state.cistern.tries], ['wrong', 5, false, 1]);
  s = turnCistern(turnCistern(wrong.state)); // 3
  const right = pullCistern(s);
  assert.equal(right.result, 'solved'); assert.equal(right.state.cistern.solved, true);
  assert.deepEqual(turnCistern(right.state), right.state, 'a solved dial does not turn');
  // the sluice puzzle and its session are untouched by the cistern
  const { cistern: _a, ...restBefore } = newSluice(), { cistern: _b, ...restAfter } = right.state;
  assert.deepEqual(restAfter, restBefore);
  // and the sluice still works as before
  let t = right.state; while (t.setting !== meterOf(t).SETTING) t = turnValve(t);
  assert.equal(testFlow(t).result, 'open');
});

test('cistern state is saved, sanitized and cannot be forged', () => {
  const s = pullCistern(turnCistern(turnCistern(turnCistern(newSluice())))).state; // code 3 → solved
  assert.deepEqual(sanitizeSluice(json(s)).cistern, s.cistern);
  assert.equal(sanitizeSluice({ cistern: { setting: 4, solved: true } }).cistern.solved, false, 'forged solve refused');
  assert.deepEqual(sanitizeSluice({ setting: 2 }).cistern, { setting: 0, tries: 0, solved: false }, 'older save without the field');
  for (const junk of [null, 'x', 5, [], { setting: 'a', tries: -3 }, { setting: 99 }]) assert.deepEqual(sanitizeSluice({ cistern: junk }).cistern, { setting: 0, tries: 0, solved: false });
});

test('Kristal Kapur is stored once, permanently, and survives a replay', () => {
  const m = memory(), store = createInverseStore(m);
  assert.deepEqual(store.load().artifacts, [], 'new player: empty collection');
  assert.equal(store.addArtifact('kristal-kapur'), true);
  assert.equal(store.addArtifact('kristal-kapur'), false, 'second pickup refused');
  assert.equal(store.addArtifact('bogus'), false, 'unknown id refused');
  assert.deepEqual(store.load().artifacts, ['kristal-kapur']);
  // a normal run save and a replay (new run) keep it
  assert.ok(store.save(newRun())); assert.ok(store.save(newRun({ replay: true })));
  assert.deepEqual(createInverseStore(m).load().artifacts, ['kristal-kapur']);
  assert.deepEqual([...m.bytes.keys()], [KEY], 'no new storage key');
});

test('corrupt, legacy and newer data never break the store', () => {
  for (const raw of ['{bad', JSON.stringify({ schemaVersion: 1, artifacts: 'kristal-kapur' }), JSON.stringify({ schemaVersion: 1, artifacts: ['x', 1, null] }), JSON.stringify({ schemaVersion: 1, completions: 2 })]) {
    const store = createInverseStore(memory({ [KEY]: raw }));
    assert.deepEqual(store.load().artifacts, []);
  }
  const legacy = createInverseStore(memory({ [KEY]: JSON.stringify({ schemaVersion: 1, completions: 2, completedRuns: ['a', 'b'], coins: ['l3-coin-1'], secrets: [], bestMs: 9e4 }) }));
  assert.ok(legacy.addArtifact('kristal-kapur'));
  const l = legacy.load(); assert.deepEqual([l.completions, l.coins, l.bestMs, l.artifacts], [2, ['l3-coin-1'], 9e4, ['kristal-kapur']], 'earlier progress kept');
  const newer = createInverseStore(memory({ [KEY]: JSON.stringify({ schemaVersion: 2, artifacts: [] }) }));
  assert.equal(newer.addArtifact('kristal-kapur'), false, 'a newer schema is never overwritten');
});

test('map: the room fits the existing camera and respawn limits; the route above is continuous', () => {
  const floor = AB_TERRAIN.find((t) => t.id === 'cistern-floor'), roof = SLABS.find((s) => s.id === 'cistern-roof');
  assert.ok(CISTERN.feet === floor.y && CISTERN.feet < WORLD.floor - 8, 'floor above the respawn line (body.bottom > floor − 8)');
  assert.ok(CISTERN.roof === roof.bottom && roof.y === CISTERN.hatch.y);
  assert.ok(CISTERN.x + CISTERN.width < 3240 - 600, 'outside the camera water band of the channel (x 2640–3716)');
  assert.ok(LADDERS.some((l) => l.x === CISTERN.ladder.x && l.top === CISTERN.hatch.y && l.bottom === CISTERN.feet));
  assert.equal(ARTIFACTS.length, 1, 'one collectible prototype');
});
