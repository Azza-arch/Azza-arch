// Level 1-3 (World 1 V3): sluice model, cave valve, save migration.
import assert from 'node:assert/strict';
import {DOMAIN,TARGET,CAVE_TARGET,reading,inverse,inverseSteps,newSluice,turnValve,testFlow,readNote,stepPlate,pullCave,sluiceStep,sanitizeSluice} from '../src/v14/levels/sluice-model.js';
import {createInverseStore,newRun,sanitizeRun} from '../src/v14/core/inverse-campaign.js';
import {CHECKPOINTS,COINS,SECRETS,CHANNEL,STONES,DECKS,LADDERS,CAVE,AB_TERRAIN} from '../src/v14/levels/inverse-world.js';

// f(x) = 2x + 3 is one-to-one on {0..6}; only 5 gives 13 and only 6 gives 15.
assert.deepEqual(DOMAIN.map(reading), [3, 5, 7, 9, 11, 13, 15]);
assert.equal(inverse(TARGET), 5); assert.equal(inverse(CAVE_TARGET), 6);
assert.equal(inverseSteps(13), '13 − 3 = 10, 10 ÷ 2 = 5');
assert.equal(DOMAIN.filter((x) => reading(x) === TARGET).length, 1);
assert.equal(reading(7), null); assert.equal(reading(-1), null);

// Main sluice: turn, test, nothing lost on a wrong reading, wrap 6 → 0.
let s = newSluice(); assert.equal(sluiceStep(s), 'investigate');
s = readNote(s); assert(s.noteRead);
for (let i = 0; i < 3; i++) s = turnValve(s);
let t = testFlow(s); assert.equal(t.reading, 9); assert.equal(t.result, 'low'); s = t.state;
assert.equal(s.tests, 1); assert.equal(s.lastReading, 9); assert(!s.open); assert.equal(sluiceStep(s), 'retry');
s = turnValve(turnValve(turnValve(s))); assert.equal(s.setting, 6);
t = testFlow(s); assert.equal(t.result, 'high'); assert.equal(t.reading, 15); s = t.state;
s = turnValve(s); assert.equal(s.setting, 0, 'wraps to 0');
for (let i = 0; i < 5; i++) s = turnValve(s);
t = testFlow(s); assert.equal(t.result, 'open'); s = t.state; assert(s.open); assert.equal(sluiceStep(s), 'done');
assert.equal(turnValve(s).setting, 5, 'an open sluice cannot be detuned');
assert.equal(testFlow(s).state.tests, s.tests, 'testing again changes nothing');

// Cave valve: plates set the value, a wrong pull resets the plates, 6 solves.
let c = stepPlate(s, 4); assert.equal(c.cave.setting, 4);
assert.equal(pullCave(newSluice()).result, 'none');
let r = pullCave(c); assert.equal(r.result, 'wrong'); assert.equal(r.reading, 11); c = r.state; assert.equal(c.cave.setting, null); assert.equal(c.cave.tries, 1);
c = stepPlate(c, 9); assert.equal(c.cave.setting, null, 'no plate 9');
c = stepPlate(c, 6); r = pullCave(c); assert.equal(r.result, 'solved'); c = r.state; assert(c.cave.solved);
assert.equal(stepPlate(c, 2).cave.setting, 6, 'solved valve stays');

// Sanitize: forged / corrupt states.
assert.deepEqual(sanitizeSluice('x'), newSluice());
const forged = sanitizeSluice({ setting: 3, open: true, tests: -4, lastReading: 14, cave: { setting: 2, solved: true, tries: 1e9 } });
assert.equal(forged.open, false); assert.equal(forged.tests, 0); assert.equal(forged.lastReading, null); assert.equal(forged.cave.solved, false); assert.equal(forged.cave.tries, 0);
assert.equal(sanitizeSluice({ setting: 9 }).setting, 0);
assert(sanitizeSluice({ setting: 5, open: true }).open);
assert(sanitizeSluice({ cave: { setting: 6, solved: true } }).cave.solved);
assert.deepEqual(sanitizeSluice(undefined, true), { ...newSluice(), setting: 5, open: true, lastReading: 13, tests: 1 });

// Store: round trip, checkpoints that need the sluice, completion, migration.
const mem = (seed = {}) => { const m = new Map(Object.entries(seed)); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), m }; };
const st = mem(), store = createInverseStore(st), run = newRun();
assert.deepEqual(run.sluice, newSluice()); assert(!('puzzle' in run));
run.checkpointId = 'far-bank'; assert(store.save(run)); assert.equal(store.load().run.checkpointId, 'entry', 'far bank needs the sluice (invalid → start, as before)');
run.sluice = s; run.checkpointId = 'gate-court'; run.completed = true; run.elapsedMs = 61000; run.coins = [COINS[20].id];
assert(store.save(run)); const L = store.load();
assert.equal(L.completions, 1); assert.equal(L.run.checkpointId, 'gate-court'); assert.deepEqual(L.run.coins, [], 'cave coin needs the cave valve');
run.sluice = c; run.coins = [COINS[0].id, COINS[20].id, COINS[21].id]; run.secrets = ['inverse-tablet']; assert(store.save(run));
assert.equal(store.load().run.coins.length, 3); assert.deepEqual(store.load().run.secrets, ['inverse-tablet']); assert.equal(store.load().completions, 1, 'same run counted once');
assert(store.save(newRun())); assert.equal(store.load().completions, 1); assert(!store.load().run.sluice.open, 'replay resets the sluice');

const seals = (on) => ({ version: 2, output: 15, seals: { 13: on, 7: on, 15: on }, revision: 9, steps: [], actuator: 6, demoSeen: true, applied: null });
const legacy = (on, cp) => ({ id: 'old-l3', checkpointId: cp, coins: ['l3-coin-3'], secrets: ['inverse-tablet'], puzzle: seals(on), elapsedMs: 50000, completed: false });
const done = sanitizeRun(legacy(true, 'far-bank'));
assert(done.sluice.open); assert.equal(done.checkpointId, 'far-bank'); assert.deepEqual(done.secrets, ['inverse-tablet'], 'earned secret is kept'); assert(!('puzzle' in done));
const partial = sanitizeRun(legacy(false, 'far-bank'));
assert(!partial.sluice.open); assert.equal(partial.checkpointId, 'entry'); assert.deepEqual(partial.coins, ['l3-coin-3']);

// Geometry: the flooded channel is wider than a jump; stones sit inside it;
// the arch walk carries 7 plates, the lever and the chest.
const range = 280 * (2 * 520 / 1400);
assert(CHANNEL.width > range);
for (const st2 of STONES) assert(st2.x >= CHANNEL.x && st2.x + st2.width <= CHANNEL.x + CHANNEL.width);
const walk = DECKS.find((d) => d.id === 'gate-arch-walk');
assert(walk.x <= CAVE.chestX - 27 && CAVE.plateX >= walk.x && CAVE.plateX + 7 * 54 <= CAVE.leverX - 27 && CAVE.leverX + 27 <= walk.x + walk.width);
assert(LADDERS.some((l) => l.x > walk.x && l.x < walk.x + walk.width && l.top === walk.y));
assert.equal(COINS.length, 22); assert.equal(COINS.filter((c2) => c2.cave).length, 2);
assert.equal(SECRETS.length, 3); assert(SECRETS.find((x) => x.id === 'inverse-tablet').cave);
assert(CHECKPOINTS.filter((cp) => cp.requires).every((cp) => cp.requires === 'sluice'));
assert(AB_TERRAIN.find((a) => a.id === 'machine-yard').x + AB_TERRAIN.find((a) => a.id === 'machine-yard').width === CHANNEL.x);
console.log('PASS: f(x)=2x+3 one-to-one, f⁻¹(13)=5 / f⁻¹(15)=6, valve wrap + no-loss tests, cave plates, forged saves, legacy seals migration, store/replay, channel geometry.');
