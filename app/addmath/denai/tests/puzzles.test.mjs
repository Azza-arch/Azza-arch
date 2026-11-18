// Day 03 · puzzle definition layer: definitions, pure models, seeded generators,
// and the live levels' use of them (values must be identical to before).
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFINITIONS, MODELS, puzzleById, puzzlesFor, solve, fill } from '../src/v14/puzzles/index.js';
import { validateDefinition, validateAll, REQUIRED } from '../src/v14/puzzles/validators/validate.js';
import { makeRule, evalRule, ruleText } from '../src/v14/puzzles/rules.js';
import { rng, seedFrom, int } from '../src/v14/puzzles/rng.js';
import * as linear from '../src/v14/puzzles/models/linear-cost.js';
import * as composite from '../src/v14/puzzles/models/composite.js';
import * as inverse from '../src/v14/puzzles/models/inverse.js';
import { generateSupply, generateWorkshop, generateSluice } from '../src/v14/puzzles/generators/world1.js';
import { VARIANTS, cost, checkPurchase } from '../src/v14/levels/supply-quest.js';
import { MACHINES, runLine, newWorkshop } from '../src/v14/levels/workshop-model.js';
import { TARGET, CAVE_TARGET, DOMAIN, reading, inverseSteps } from '../src/v14/levels/sluice-model.js';

test('1. every puzzle id is unique and stable in format', () => {
  const ids = DEFINITIONS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, ['w1.l1.supply.k1', 'w1.l1.supply.k2', 'w1.l1.supply.k3', 'w1.l2.workshop.main', 'w1.l3.sluice.main', 'w1.l3.cave.main']);
});

test('2. every definition has all required fields', () => {
  for (const d of DEFINITIONS) for (const k of REQUIRED) assert.ok(d[k] !== undefined && d[k] !== '', `${d.id} missing ${k}`);
  assert.deepEqual(validateDefinition({ id: 'w1.l1.supply.x' }).slice(0, 2), ['missing chapter', 'missing subtopic']);
});

test('3. every stored answer equals the model result (validator passes)', () => {
  assert.deepEqual(validateAll(DEFINITIONS), []);
  for (const d of DEFINITIONS) assert.deepEqual(solve(d), d.answer, d.id);
  const broken = { ...puzzleById('w1.l3.sluice.main'), answer: { setting: 4 } };
  assert.match(validateDefinition(broken).join(), /answer/);
});

test('4. models: normal cases', () => {
  const k1 = puzzleById('w1.l1.supply.k1').parameters;
  assert.equal(linear.formula(k1), 'C(x) = 4x + 6');
  assert.equal(linear.cost(k1, 5), 26);
  assert.deepEqual(linear.checkPurchase(k1, 5), { ok: true, cost: 26, change: 4, exact: true });
  assert.equal(linear.checkPurchase(k1, 4).code, 'short');
  assert.equal(linear.checkPurchase(k1, 7).code, 'budget');
  const w = puzzleById('w1.l2.workshop.main').parameters;
  assert.equal(composite.runLine(w, 'AB').notation, 'gf(5) = g(f(5)) = g(10) = 8');
  assert.equal(composite.runLine(w, 'BA').notation, 'fg(5) = f(g(5)) = f(3) = 6');
  assert.deepEqual(composite.solve(w), { working: ['AB'], outputs: { AB: 8, BA: 6 } });
  const s = puzzleById('w1.l3.sluice.main').parameters;
  assert.deepEqual(inverse.range(s), [3, 5, 7, 9, 11, 13, 15]);
  assert.deepEqual(inverse.inverse(s, 13), { ok: true, x: 5 });
  assert.equal(inverse.inverseSteps(s, 13), '13 − 3 = 10, 10 ÷ 2 = 5');
  assert.equal(ruleText(makeRule(1, -2)), 'x − 2');
  assert.equal(ruleText(makeRule(-1, 0)), '−x');
  assert.equal(ruleText(makeRule(0, -4)), '−4');
  assert.equal(evalRule(makeRule(3, -2), 3), 7);
  assert.equal(fill('RM{cost} > RM{budget} {nope}', { cost: 34, budget: 30 }), 'RM34 > RM30 {nope}');
});

test('5. invalid input is rejected clearly', () => {
  assert.throws(() => makeRule(1.5, 0), RangeError);
  assert.throws(() => evalRule({ a: 'x', b: 0 }, 1), RangeError);
  assert.throws(() => evalRule(makeRule(1, 0), NaN), RangeError);
  const k1 = puzzleById('w1.l1.supply.k1').parameters;
  for (const x of [0, -1, 2.5, 9, '5', null]) assert.equal(linear.checkPurchase(k1, x).code, 'range', String(x));
  assert.throws(() => linear.cost(k1, 2.5), RangeError);
  assert.match(linear.validateParams({ ...k1, budget: 10 }).join(), /no purchase/);
  assert.match(linear.validateParams({ ...k1, price: 0 }).join(), /price/);
  const w = puzzleById('w1.l2.workshop.main').parameters;
  assert.throws(() => composite.runLine(w, 'CA'), RangeError);
  assert.throws(() => composite.runLine(w, 'AB', 1.5), RangeError);
  assert.equal(composite.runLine(w, 'BA', 1).ok, false, 'machine B refuses input below its minimum');
  assert.match(composite.validateParams({ ...w, need: 99 }).join(), /exactly one order/);
  const s = puzzleById('w1.l3.sluice.main').parameters;
  assert.equal(inverse.forward(s, 7), null);
  assert.equal(inverse.forward(s, 2.5), null);
  assert.equal(inverse.inverse(s, 14).reason, 'not-whole');
  assert.equal(inverse.inverse(s, 17).reason, 'outside-domain');
  assert.match(inverse.validateParams({ ...s, rule: makeRule(0, 3) }).join(), /a ≠ 0/);
  assert.match(inverse.validateParams({ ...s, target: 14 }).join(), /range/);
});

test('6. the same seed gives the same puzzle; different seeds differ', () => {
  for (const seed of [1, 42, 'denai-2026-11-19']) {
    assert.deepEqual(generateSupply(seed), generateSupply(seed));
    assert.deepEqual(generateWorkshop(seed), generateWorkshop(seed));
    assert.deepEqual(generateSluice(seed), generateSluice(seed));
  }
  assert.equal(seedFrom('abc'), seedFrom('abc'));
  const a = rng(7), b = rng(7);
  assert.deepEqual([1, 2, 3].map(() => int(a, 0, 100)), [1, 2, 3].map(() => int(b, 0, 100)));
  const distinct = new Set([...Array(20).keys()].map((s) => JSON.stringify(generateSluice(s).parameters)));
  assert.ok(distinct.size > 5, `only ${distinct.size} distinct sluice puzzles`);
});

test('7–8. generated variants are possible, well-posed and their answers really work', () => {
  for (let s = 0; s < 300; s++) {
    for (const d of [generateSupply(s), generateSupply(s, { difficulty: 'cabaran' }), generateWorkshop(s), generateSluice(s)]) {
      assert.deepEqual(validateDefinition(d), [], d.id);
      const p = d.parameters;
      if (d.mechanic === 'supply-store') {
        assert.ok(d.answer.accepted.length >= 1);
        for (const x of d.answer.accepted) { assert.ok(x >= p.need); assert.ok(linear.cost(p, x) <= p.budget); }
        if (d.difficulty === 'cabaran') assert.deepEqual(d.answer.accepted, [p.need]);
      } else if (d.mechanic === 'machine-order') {
        assert.equal(d.answer.working.length, 1);
        assert.ok(composite.runLine(p, d.answer.working[0]).out >= p.need);
        assert.ok(!composite.runLine(p, p.start).enough, 'the starting order must fail first');
      } else {
        assert.equal(inverse.forward(p, d.answer.setting), p.target);
        assert.ok(d.answer.setting >= 1 && d.answer.setting <= 6);
      }
    }
  }
  assert.deepEqual(validateAll([...Array(100).keys()].flatMap((s) => [generateSupply(s), generateSupply(s, { difficulty: 'cabaran' }), generateWorkshop(s), generateSluice(s)])), [], 'generated ids are unique');
});

test('integration: live levels read the definitions and keep their previous values', () => {
  assert.deepEqual(VARIANTS, [{ id: 'K1', price: 4, delivery: 6, budget: 30 }, { id: 'K2', price: 3, delivery: 9, budget: 25 }, { id: 'K3', price: 5, delivery: 5, budget: 32 }]);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map((x) => cost(VARIANTS[0], x)), [10, 14, 18, 22, 26, 30, 34, 38]);
  assert.equal(checkPurchase(VARIANTS[2], 6).code, 'budget');
  assert.deepEqual([MACHINES.A.rule, MACHINES.B.rule, MACHINES.A.min, MACHINES.B.min], ['f(x) = 2x', 'g(x) = x − 2', 1, 2]);
  assert.equal(runLine('AB').out, 8); assert.equal(newWorkshop().order, 'BA');
  assert.deepEqual([TARGET, CAVE_TARGET, [...DOMAIN]], [13, 15, [0, 1, 2, 3, 4, 5, 6]]);
  assert.deepEqual(DOMAIN.map(reading), [3, 5, 7, 9, 11, 13, 15]); assert.equal(reading(7), null);
  assert.equal(inverseSteps(13), '13 − 3 = 10, 10 ÷ 2 = 5');
  assert.equal(puzzlesFor('supply-store').length, 3);
  assert.deepEqual(Object.keys(MODELS).sort(), ['composite-order', 'inverse-linear', 'linear-cost']);
});
