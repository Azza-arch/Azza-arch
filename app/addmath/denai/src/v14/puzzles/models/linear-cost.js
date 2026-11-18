// DENAI puzzle model · linear cost function (T4 Bab 1 · fungsi sebagai model).
// C(x) = price·x + delivery. A purchase x (integer 1…stock) is accepted when
// x ≥ need (enough for the job) and C(x) ≤ budget. Pure: no Phaser, no DOM.
import { makeRule, evalRule, ruleText } from '../rules.js';

const posInt = (v) => Number.isSafeInteger(v) && v > 0;

export function validateParams(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return ['params missing'];
  for (const k of ['price', 'delivery', 'budget', 'need', 'stock']) if (!Number.isSafeInteger(p[k]) || p[k] < 0) errors.push(`${k} must be a non-negative integer`);
  if (errors.length) return errors;
  if (!posInt(p.price)) errors.push('price must be > 0');
  if (!posInt(p.need) || p.need > p.stock) errors.push('need must be 1…stock');
  if (!errors.length && !acceptedChoices(p).length) errors.push('no purchase satisfies need and budget');
  return errors;
}

export const costRule = (p) => makeRule(p.price, p.delivery);
export const formula = (p) => `C(x) = ${ruleText(costRule(p))}`;
export function cost(p, x) {
  if (!Number.isSafeInteger(x)) throw new RangeError('cost: x must be an integer');
  return evalRule(costRule(p), x);
}

// { ok, code: 'range' | 'short' | 'budget', cost, change, exact }
export function checkPurchase(p, x) {
  if (!Number.isInteger(x) || x < 1 || x > p.stock) return { ok: false, code: 'range' };
  const c = cost(p, x);
  if (x < p.need) return { ok: false, code: 'short', cost: c };
  if (c > p.budget) return { ok: false, code: 'budget', cost: c };
  return { ok: true, cost: c, change: p.budget - c, exact: x === p.need };
}
export const acceptedChoices = (p) => Array.from({ length: p.stock }, (_, i) => i + 1).filter((x) => checkPurchase(p, x).ok);

// Answer as data: every accepted quantity and the cheapest one.
export function solve(p) {
  const accepted = acceptedChoices(p);
  return { accepted, best: accepted[0] ?? null };
}
