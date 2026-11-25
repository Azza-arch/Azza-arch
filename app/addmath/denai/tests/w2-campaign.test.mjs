// World 2 save store. Run: node tests/w2-campaign.test.mjs
import assert from 'node:assert/strict';
import { createW2Store, newRun, sanitizeRun, W2_KEY } from '../src/v14/levels/w2/campaign.js';
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), keys: () => [...m.keys()], m }; };

// fresh run: levers at each station's start, nothing solved
const r = newRun();
assert.deepEqual(r.levers, { A: { a: 1 }, B: { h: 3, k: 2 }, C: { k: 3 } });
assert.deepEqual(r.solved, { A: false, B: false, C: false });

// only the World 2 key is ever written
const s = mem(), store = createW2Store(s);
const run = newRun(); run.levers.A = { a: -0.5 }; run.solved.A = true; run.checkpointId = 'after-a'; run.coins = ['c1', 'c5', 'bogus'];
assert.ok(store.saveRun(run));
assert.deepEqual(s.keys(), [W2_KEY]);
const back = store.load().levels['w2-l1'];
assert.equal(back.run.solved.A, true); assert.equal(back.run.checkpointId, 'after-a'); assert.deepEqual(back.run.coins, ['c1', 'c5']); assert.deepEqual(back.coins, ['c1', 'c5']);

// a save cannot claim a station it did not solve with the real answer
const fake = sanitizeRun({ id: 'x', solved: { A: true, B: true, C: true }, levers: { A: { a: 1 }, B: { h: 5, k: 4 }, C: { k: 9 } }, checkpointId: 'after-b', completed: true });
assert.deepEqual(fake.solved, { A: false, B: true, C: false });
assert.equal(fake.checkpointId, 'entry', 'after-b needs A and B');
assert.equal(fake.completed, false);
assert.deepEqual(fake.levers.C, { k: 3 }, 'invalid lever value falls back to the start');

// completion counts once per run; best time kept
const done = newRun(); done.levers = { A: { a: -0.5 }, B: { h: 5, k: 4 }, C: { k: 1 } }; done.solved = { A: true, B: true, C: true }; done.completed = true; done.elapsedMs = 90000;
store.saveRun(done); store.saveRun(done);
let lv = store.load().levels['w2-l1'];
assert.equal(lv.completions, 1); assert.equal(lv.bestMs, 90000); assert.equal(lv.run.completed, true);
const faster = { ...done, id: 'second', elapsedMs: 80000 }; store.saveRun(faster);
lv = store.load().levels['w2-l1']; assert.equal(lv.completions, 2); assert.equal(lv.bestMs, 80000);

// damaged or newer saves
const bad = mem(); bad.setItem(W2_KEY, '{not json'); assert.equal(createW2Store(bad).load().levels['w2-l1'].run, null);
const newer = mem(); newer.setItem(W2_KEY, JSON.stringify({ schemaVersion: 2, levels: {} })); assert.equal(createW2Store(newer).saveRun(newRun()), false);
assert.equal(newer.getItem(W2_KEY), JSON.stringify({ schemaVersion: 2, levels: {} }), 'newer save untouched');
// storage unavailable: no throw
assert.equal(createW2Store({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }).saveRun(newRun()), false);
console.log('w2 campaign: ok');
