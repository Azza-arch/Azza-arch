// Day 04 · puzzle sessions: seeded variants that persist in the existing saves.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, restoreSession, baseSession, definitionFor, validParams, BASE, SESSION_VERSION } from '../src/v14/puzzles/session.js';
import { validateDefinition } from '../src/v14/puzzles/validators/validate.js';
import * as linear from '../src/v14/puzzles/models/linear-cost.js';
import * as inverseModel from '../src/v14/puzzles/models/inverse.js';
import { newQuest, sanitizeQuest, variantOf, cost, checkPurchase, formula } from '../src/v14/levels/supply-quest.js';
import { sanitize as sanitizeL1 } from '../src/v14/save.js';
import { newWorkshop, sanitizeWorkshop, lineOf, canopyNote, victoryLine as l2Victory } from '../src/v14/levels/workshop-model.js';
import { newSluice, sanitizeSluice, meterOf, testFlow, pullCave, stepPlate, turnValve, mathText, noteText, secretText } from '../src/v14/levels/sluice-model.js';
import { createCampaignStore, newRun as newL2Run } from '../src/v14/core/campaign-store.js';
import { createInverseStore, newRun as newL3Run } from '../src/v14/core/inverse-campaign.js';

const LEVELS = ['w1-l1', 'w1-l2', 'w1-l3'];
const memory = (seed = {}) => { const bytes = new Map(Object.entries(seed)); return { getItem: (k) => bytes.get(k) ?? null, setItem: (k, v) => bytes.set(k, String(v)), bytes }; };
const json = (v) => JSON.parse(JSON.stringify(v));
const L1 = (quest, extra = {}) => ({ schemaVersion: 2, layoutVersion: 2, levelId: 'denai-bab1-functions-v14-slice', runId: 'r1', runSeed: 1, solvedGateIds: [], quest, ...extra });

test('1. the same seed gives the same configuration', () => {
  for (const L of LEVELS) for (const seed of [0, 1, 7, 123456, 0xffffffff]) {
    assert.deepEqual(createSession(L, { seed }), createSession(L, { seed }), `${L} seed ${seed}`);
    assert.deepEqual(definitionFor(L, createSession(L, { seed })), definitionFor(L, createSession(L, { seed })));
  }
  assert.deepEqual(newWorkshop({ seed: 42 }), newWorkshop({ seed: 42 }));
  assert.deepEqual(newSluice({ seed: 42 }), newSluice({ seed: 42 }));
});

test('2. different seeds can give different configurations', () => {
  for (const L of LEVELS) {
    const distinct = new Set([...Array(200).keys()].map((seed) => JSON.stringify(createSession(L, { seed }).params)));
    assert.ok(distinct.size >= 6, `${L}: only ${distinct.size} distinct puzzles`);
  }
});

test('3. a session survives save → load in each level\'s own store', () => {
  // 1-1 (denai-save-v14): the quest carries the session.
  const q = newQuest(null, createSession('w1-l1', { seed: 99, difficulty: 'cabaran' }));
  assert.deepEqual(sanitizeL1(json(L1(q))).quest.puzzle, q.puzzle);
  // 1-2 (denai-campaign-v1)
  const m2 = memory(), s2 = createCampaignStore(m2), r2 = newL2Run({ replay: true });
  assert.ok(s2.saveRun(r2));
  assert.deepEqual(createCampaignStore(m2).load().levels['w1-l2'].run.workshop.puzzle, r2.workshop.puzzle);
  // 1-3 (denai-l3-campaign-v1)
  const m3 = memory(), s3 = createInverseStore(m3), r3 = newL3Run({ replay: true });
  assert.ok(s3.save(r3));
  assert.deepEqual(createInverseStore(m3).load().run.sluice.puzzle, r3.sluice.puzzle);
  // No new keys: each level still writes only its own key.
  assert.deepEqual([...m2.bytes.keys()], ['denai-campaign-v1']);
  assert.deepEqual([...m3.bytes.keys()], ['denai-l3-campaign-v1']);
});

test('4. a refresh in the middle of a puzzle keeps the numbers and the progress', () => {
  // 1-2: wrong order run once, then reload.
  const w = { ...newWorkshop({ seed: 5 }) }, L = lineOf(w);
  w.runs = 1; w.lastOut = L.runLine(w.order).out;
  const back = sanitizeWorkshop(json(w));
  assert.deepEqual(back, w);
  assert.deepEqual(lineOf(back).MACHINES.A.rule, L.MACHINES.A.rule);
  // 1-3: valve turned, one wrong test, reload, then the correct setting still opens.
  let st = newSluice({ seed: 5 }); const m = meterOf(st);
  st = turnValve(st); st = testFlow(st).state;
  const reloaded = sanitizeSluice(json(st));
  assert.deepEqual(reloaded, st);
  let s = reloaded; while (s.setting !== m.SETTING) s = turnValve(s);
  assert.equal(testFlow(s).result, 'open');
  // 1-1: store opened, reload twice: same price list each time.
  const q = { ...newQuest(null, createSession('w1-l1', { seed: 5 })), found: true, key: true, door: true };
  const once = sanitizeQuest(json(q)), twice = sanitizeQuest(json(once));
  assert.deepEqual(twice, once); assert.deepEqual(variantOf(twice), variantOf(q));
});

test('5. old saves without a session migrate to the original puzzle', () => {
  // 1-1: the K-id picks the original price list; a purchase stays valid.
  for (const [id, def] of [['K1', 'w1.l1.supply.k1'], ['K2', 'w1.l1.supply.k2'], ['K3', 'w1.l1.supply.k3']]) {
    const q = sanitizeL1(L1({ variant: id, found: true, key: true, door: true, bought: { x: 5 } })).quest;
    assert.equal(q.puzzle.id, def); assert.equal(q.variant, id); assert.equal(q.bought.x, 5);
  }
  const k1 = variantOf(sanitizeQuest({ variant: 'K1' }));
  assert.deepEqual(k1, { id: 'K1', price: 4, delivery: 6, budget: 30 });
  // 1-2 / 1-3: the original machines and meter; earlier progress is kept.
  const w = sanitizeWorkshop({ order: 'AB', runs: 2, lastOut: 8, delivered: true, swaps: 1 });
  assert.equal(w.puzzle.id, BASE['w1-l2']); assert.equal(w.delivered, true);
  const st = sanitizeSluice({ setting: 5, tests: 3, lastReading: 13, open: true, noteRead: true, cave: { setting: 6, tries: 1, solved: true } });
  assert.equal(st.puzzle.id, BASE['w1-l3']); assert.ok(st.open && st.cave.solved);
  // Through the stores, with legacy bytes exactly as Day 03 wrote them.
  const day03 = { schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['r'], coins: [], secrets: [], bestMs: 9e4, run: { id: 'r', checkpointId: 'exit', coins: [], secrets: [], puzzles: {}, workshop: { order: 'AB', runs: 1, lastOut: 8, delivered: true, swaps: 1 }, elapsedMs: 9e4, completed: true } } } };
  const l2 = createCampaignStore(memory({ 'denai-campaign-v1': JSON.stringify(day03) })).load().levels['w1-l2'];
  assert.equal(l2.completions, 1); assert.equal(l2.run.workshop.puzzle.id, BASE['w1-l2']); assert.ok(l2.run.workshop.delivered);
  // A deterministic session: migrating twice gives the identical session.
  assert.deepEqual(sanitizeWorkshop({ order: 'BA' }).puzzle, sanitizeWorkshop({ order: 'BA' }).puzzle);
});

test('6. a completed puzzle stays completed after reload', () => {
  const w = newWorkshop({ seed: 11 }), L = lineOf(w);
  const done = { ...w, order: L.WORKING, runs: 2, lastOut: L.runLine(L.WORKING).out, delivered: true };
  assert.equal(sanitizeWorkshop(json(sanitizeWorkshop(json(done)))).delivered, true);
  let st = newSluice({ seed: 11 }); const m = meterOf(st);
  while (st.setting !== m.SETTING) st = turnValve(st);
  st = testFlow(st).state; assert.ok(st.open);
  st = pullCave(stepPlate(st, m.CAVE_SETTING)).state; assert.ok(st.cave.solved);
  const back = sanitizeSluice(json(sanitizeSluice(json(st))));
  assert.ok(back.open && back.cave.solved);
  const q = { ...newQuest(null, createSession('w1-l1', { seed: 11 })), bought: { x: 5, cost: cost(variantOf({ puzzle: createSession('w1-l1', { seed: 11 }) }), 5) }, repaired: true };
  assert.equal(sanitizeQuest(json(q)).repaired, true);
  // A forged completion with another puzzle's answer is not accepted.
  assert.equal(sanitizeSluice({ ...json(st), puzzle: baseSession('w1-l3', BASE['w1-l3']), setting: 4 }).open, false, 'original puzzle needs setting 5');
});

test('7. replay starts a new session; the first visit keeps the original', () => {
  assert.equal(newL2Run().workshop.puzzle.id, BASE['w1-l2']);
  assert.equal(newL3Run().sluice.puzzle.id, BASE['w1-l3']);
  const replays2 = new Set([...Array(30)].map(() => JSON.stringify(newL2Run({ replay: true }).workshop.puzzle.params)));
  const replays3 = new Set([...Array(30)].map(() => JSON.stringify(newL3Run({ replay: true }).sluice.puzzle.params)));
  assert.ok(replays2.size > 1 && replays3.size > 1, 'replays draw new puzzles');
  // A replay never inherits the previous run's progress.
  const r = newL3Run({ replay: true });
  assert.deepEqual([r.sluice.setting, r.sluice.tests, r.sluice.open, r.completed], [0, 0, false, false]);
});

test('8. every live variant is valid, solvable and drawable by its mechanic', () => {
  for (let seed = 0; seed < 400; seed++) for (const L of LEVELS) {
    const s = createSession(L, { seed, difficulty: seed % 2 ? 'mudah' : 'cabaran' }), d = definitionFor(L, s);
    assert.ok(validParams(L, s.params), `${L} ${seed}`);
    assert.deepEqual(validateDefinition(d), [], `${L} ${seed}`);
    if (L === 'w1-l1') { assert.equal(s.params.need, 5); assert.ok(d.answer.accepted.includes(5)); assert.ok(s.params.budget <= 99); }
    if (L === 'w1-l2') {
      const v = lineOf({ puzzle: s });
      assert.equal(v.START, 'BA'); assert.equal(v.WORKING, 'AB'); assert.ok(v.STOCK >= 4 && v.STOCK <= 6);
      assert.ok(!v.runLine('BA').enough && v.runLine('AB').enough, 'exactly one order works and it is not the start');
    }
    if (L === 'w1-l3') {
      const m = meterOf({ puzzle: s });
      assert.ok(m.SETTING >= 2 && m.SETTING <= 5, 'not 0 (wheel start) and not trivial');
      assert.ok(m.CAVE_SETTING >= 1 && m.CAVE_SETTING !== m.SETTING);
      assert.deepEqual([...m.DOMAIN], [0, 1, 2, 3, 4, 5, 6], 'the wheel has 7 notches');
      assert.ok(m.MIN >= 0 && m.MAX <= 99, 'meter digits');
    }
  }
});

test('9. what the player sees uses the same parameters as the model', () => {
  for (let seed = 0; seed < 50; seed++) {
    const q = newQuest(null, createSession('w1-l1', { seed })), v = variantOf(q), p = q.puzzle.params;
    assert.equal(formula(v), linear.formula(p));
    assert.equal(cost(v, 5), p.price * 5 + p.delivery);
    assert.equal(checkPurchase(v, 5).ok, true);
    const w = newWorkshop({ seed }), L = lineOf(w), P = w.puzzle.params;
    assert.equal(L.MACHINES.A.rule, `f(x) = ${P.f.a}x`);
    assert.equal(L.MACHINES.B.rule, `g(x) = x − ${-P.g.b}`);
    assert.equal(L.NEED, P.need); assert.equal(L.STOCK, P.input);
    assert.match(canopyNote(w), new RegExp(`g\\(x\\) = x − ${-P.g.b}`));
    assert.match(l2Victory(w), new RegExp(`gf\\(${P.input}\\) = ${L.runLine('AB').out}`));
    const st = newSluice({ seed }), m = meterOf(st), R = st.puzzle.params;
    assert.equal(m.TARGET, R.target); assert.equal(m.CAVE_TARGET, R.cave);
    assert.equal(inverseModel.forward({ rule: R.rule, domain: [0, 6] }, m.SETTING), R.target);
    assert.ok(noteText(st).includes(`${R.rule.a} × tetapan + ${R.rule.b}`));
    assert.ok(mathText(st).includes(`f(${m.SETTING}) = ${R.target}`));
    assert.ok(secretText({ id: 'domain-tablet' }, st).includes(`{${m.RANGE.join(',')}}`));
    assert.deepEqual([...m.RANGE], [0, 1, 2, 3, 4, 5, 6].map((x) => R.rule.a * x + R.rule.b));
  }
  // The original puzzles still show the exact Day 03 texts.
  assert.equal(noteText(newSluice()), 'Catatan penyelenggaraan (koyak):\n«Kalibrasi injap: bacaan = 2 × tetapan + 3. Bacaan asal …»');
  assert.equal(l2Victory(newWorkshop()), 'Susunan fungsi boleh mengubah hasil: gf(5) = 8, fg(5) = 6.');
});

test('10. invalid seeds and corrupt data are handled safely', () => {
  for (const seed of [-1, 1.5, '7', null, 2 ** 40, NaN]) assert.throws(() => createSession('w1-l2', { seed }), RangeError);
  assert.throws(() => createSession('w9-l9', { seed: 1 }), RangeError);
  const good = createSession('w1-l3', { seed: 3 });
  // Damaged parameters + valid seed → rebuilt from the seed (same puzzle).
  assert.deepEqual(restoreSession('w1-l3', { ...good, params: { rule: { a: 0, b: 1 }, target: 'x' } }), good);
  // Unsolvable / undrawable parameters are rejected.
  const bad = [
    ['w1-l1', { price: 9, delivery: 20, budget: 10, need: 5, stock: 8 }],
    ['w1-l1', { price: 4, delivery: 6, budget: 30, need: 3, stock: 8 }],
    ['w1-l2', { input: 5, need: 99, start: 'BA', f: { a: 2, b: 0 }, g: { a: 1, b: -2 } }],
    ['w1-l2', { input: 9, need: 16, start: 'BA', f: { a: 2, b: 0 }, g: { a: 1, b: -2 } }],
    ['w1-l3', { rule: { a: 2, b: 3 }, target: 3, cave: 15 }],
    ['w1-l3', { rule: { a: 2, b: 3 }, target: 14, cave: 15 }],
    ['w1-l3', { rule: { a: 2, b: 3 }, target: 13, cave: 13 }],
  ];
  for (const [L, params] of bad) {
    assert.equal(validParams(L, params), false, JSON.stringify(params));
    assert.equal(restoreSession(L, { v: SESSION_VERSION, id: 'x', seed: null, difficulty: 'mudah', params }).id, BASE[L], 'falls back to the original');
  }
  // Garbage of every kind never throws and never loses the run.
  for (const junk of [null, 'x', 42, [], { v: 2 }, { v: 1, id: 5 }, { v: 1, id: 'a'.repeat(200), params: {} }, { v: 1, id: 'x', seed: -4, params: null }]) {
    assert.equal(sanitizeWorkshop({ order: 'AB', runs: 1, puzzle: junk }).puzzle.id, BASE['w1-l2']);
    assert.equal(sanitizeSluice({ setting: 2, puzzle: junk }).puzzle.id, BASE['w1-l3']);
    assert.equal(sanitizeQuest({ variant: 'K2', puzzle: junk }).puzzle.id, 'w1.l1.supply.k2');
  }
  // Unknown extra fields are not carried into the save.
  const extra = sanitizeWorkshop({ puzzle: { ...json(createSession('w1-l2', { seed: 8 })), evil: '<script>', params: { ...createSession('w1-l2', { seed: 8 }).params, x: 1 } } });
  assert.equal('evil' in extra.puzzle, false); assert.equal('x' in extra.puzzle.params, false);
  // Corrupt store bytes: the level still loads with a fresh original puzzle.
  const m = memory({ 'denai-l3-campaign-v1': '{not json' });
  assert.equal(createInverseStore(m).load().run, null);
});
