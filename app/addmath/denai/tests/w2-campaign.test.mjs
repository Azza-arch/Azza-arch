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

// ── Level 2-2 in the same key; saving one level never drops another ──
{
  const s = mem(), st = createW2Store(s);
  const r1 = newRun(); r1.levers.A = { a: -0.5 }; r1.solved.A = true; st.saveRun(r1);
  const r2 = newRun('w2-l2');
  assert.deepEqual(r2.levers, { D: { x: 1, y: 1 }, E: { x: 0.5 }, F: { x: 1 } });
  r2.levers.D = { x: 3, y: 4 }; r2.solved.D = true; r2.checkpointId = 'after-d'; r2.coins = ['d1', 'c1'];
  assert.ok(st.saveRun(r2, 'w2-l2'));
  const back = st.load().levels;
  assert.equal(back['w2-l1'].run.solved.A, true, '2-1 record kept after saving 2-2');
  assert.equal(back['w2-l2'].run.solved.D, true); assert.equal(back['w2-l2'].run.checkpointId, 'after-d');
  assert.deepEqual(back['w2-l2'].run.coins, ['d1'], '2-1 coin ids are not valid in 2-2');
  // a fake 2-2 save: only real answers count (D needs the vertex, E the bell at x = 2, F x = 3)
  const fake = sanitizeRun({ id: 'f', solved: { D: true, E: true, F: true }, levers: { D: { x: 2, y: 3 }, E: { x: 2 }, F: { x: 4 } }, checkpointId: 'after-e', completed: true }, 'w2-l2');
  assert.deepEqual(fake.solved, { D: false, E: true, F: false }); assert.equal(fake.checkpointId, 'entry'); assert.equal(fake.completed, false);
  // a level this release does not know survives a save
  const raw = JSON.parse(s.getItem(W2_KEY)); raw.levels['w2-l3'] = { completions: 2, note: 'future' }; s.setItem(W2_KEY, JSON.stringify(raw));
  st.saveRun(r1);
  assert.deepEqual(JSON.parse(s.getItem(W2_KEY)).levels['w2-l3'], { completions: 2, note: 'future' }, 'unknown level kept');
  assert.equal(st.saveRun(r1, 'w2-l9'), false, 'unknown level id refused');
  // Level 2-3: seals P and Q count only with their real answers
  const r3 = newRun('w2-l3');
  assert.deepEqual(r3.levers, { G: { kiri: 3, kanan: 3 }, H: { c: 5 }, P: { b: -2, c: 4 }, Q: { kiri: 0, kanan: 8 } });
  const f3 = sanitizeRun({ id: 'x', solved: { G: true, H: true, P: true, Q: true }, levers: { G: { kiri: 1, kanan: 5 }, H: { c: 8 }, P: { b: -8, c: 12 }, Q: { kiri: 2, kanan: 7 } }, checkpointId: 'after-h' }, 'w2-l3');
  assert.deepEqual(f3.solved, { G: true, H: false, P: true, Q: false }); assert.equal(f3.checkpointId, 'after-g');
}
console.log('w2 campaign (2-1 + 2-2): ok');
