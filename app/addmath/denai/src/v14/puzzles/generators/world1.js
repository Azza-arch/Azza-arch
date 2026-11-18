// DENAI puzzle generators (World 1 mechanics). Seeded: the same seed always
// returns the same definition. Each candidate is checked by its model and
// rejected until it is solvable and well-posed (bounded attempts, then error).
// Not wired into the live levels yet: Level 1-2/1-3 saves store fixed values,
// so live variation there needs a save-format decision first.
import { rng, int, pick, seedFrom } from '../rng.js';
import { makeRule } from '../rules.js';
import * as linear from '../models/linear-cost.js';
import * as composite from '../models/composite.js';
import * as inverseModel from '../models/inverse.js';
import { supplyDefinition, workshopDefinition, sluiceDefinition } from '../definitions/world1.js';

const TRIES = 50;
function attempt(seed, build) {
  const rand = rng(seed);
  for (let i = 0; i < TRIES; i++) { const out = build(rand); if (out) return out; }
  throw new Error(`generator: no valid puzzle for seed ${seed}`);
}
const tag = (prefix, seed) => `${prefix}.gen-${seedFrom(seed).toString(36)}`;

// 1-1: 'mudah' leaves room for one extra plank; 'cabaran' accepts exactly `need`.
export function generateSupply(seed, { difficulty = 'mudah' } = {}) {
  return attempt(seed, (r) => {
    const need = int(r, 4, 6), stock = need + 3, price = int(r, 2, 6), delivery = int(r, 3, 10);
    const exact = price * need + delivery, budget = exact + (difficulty === 'cabaran' ? int(r, 0, price - 1) : int(r, price, price * 2 - 1));
    const p = { price, delivery, budget, need, stock };
    if (linear.validateParams(p).length) return null;
    return supplyDefinition(`${tag('w1.l1.supply', seed)}-${difficulty}`, null, p, linear.solve(p), { difficulty, status: 'draft', seed: seedFrom(seed) });
  });
}

// 1-2: f(x) = ax doubles/triples, g(x) = x − k removes; only one order reaches `need`.
export function generateWorkshop(seed) {
  return attempt(seed, (r) => {
    const f = makeRule(pick(r, [2, 3]), 0), g = makeRule(1, -int(r, 1, 3)), input = int(r, 3, 6);
    const probe = { input, need: 0, machines: { A: { rule: f, min: 1, letter: 'f' }, B: { rule: g, min: -g.b, letter: 'g' } } };
    const ab = composite.runLine(probe, 'AB'), ba = composite.runLine(probe, 'BA');
    if (!ab.ok || !ba.ok || ab.out === ba.out) return null;
    const need = Math.max(ab.out, ba.out), working = ab.out >= need ? 'AB' : 'BA', start = working === 'AB' ? 'BA' : 'AB';
    const p = { ...probe, need, start };
    if (composite.validateParams(p).length) return null;
    return workshopDefinition(tag('w1.l2.workshop', seed), { input, need, start, f, g }, composite.solve(p), { status: 'draft', seed: seedFrom(seed) });
  });
}

// 1-3: f(x) = ax + b on {0…6}; the target is the image of a non-zero setting.
export function generateSluice(seed) {
  return attempt(seed, (r) => {
    const rule = makeRule(pick(r, [2, 3]), int(r, 1, 5)), x = int(r, 1, 6), target = rule.a * x + rule.b;
    const p = { rule, domain: [0, 6], target };
    if (inverseModel.validateParams(p).length) return null;
    return sluiceDefinition(tag('w1.l3.sluice', seed), p, inverseModel.solve(p), { status: 'draft', seed: seedFrom(seed) });
  });
}
