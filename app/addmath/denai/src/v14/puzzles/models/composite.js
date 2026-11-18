// DENAI puzzle model · composite functions (T4 Bab 1 · fungsi gubahan).
// Two machines on one line, each a linear rule with a minimum input it accepts.
// Order "AB" means machine A works first: output = B(A(x)). KSSM notation
// writes the function applied first on the right: if A = f and B = g, then
// "AB" is gf(x) = g(f(x)). Pure: no Phaser, no DOM.
import { evalRule, isRule } from '../rules.js';

export const ORDERS = Object.freeze(['AB', 'BA']);

export function validateParams(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return ['params missing'];
  if (!Number.isSafeInteger(p.input)) errors.push('input must be an integer');
  if (!Number.isSafeInteger(p.need)) errors.push('need must be an integer');
  for (const id of ['A', 'B']) {
    const m = p.machines?.[id];
    if (!m || !isRule(m.rule) || !Number.isSafeInteger(m.min) || !m.letter) errors.push(`machine ${id} invalid`);
  }
  if (errors.length) return errors;
  const s = solve(p);
  if (s.working.length !== 1) errors.push(`exactly one order must reach need (got ${s.working.length})`);
  if (p.start && !ORDERS.includes(p.start)) errors.push('start must be AB or BA');
  if (p.start && s.working.includes(p.start)) errors.push('the starting order must not already work');
  return errors;
}

// One production run in the given order: same shape as the Level 1-2 model.
export function runLine(p, order, input = p.input) {
  if (!ORDERS.includes(order)) throw new RangeError('order');
  if (!Number.isSafeInteger(input)) throw new RangeError('input');
  const [m1, m2] = [p.machines[order[0]], p.machines[order[1]]];
  if (input < m1.min) return { order, input, ok: false, stoppedAt: order[0] };
  const mid = evalRule(m1.rule, input);
  if (mid < m2.min) return { order, input, mid, ok: false, stoppedAt: order[1] };
  const out = evalRule(m2.rule, mid);
  const inner = m1.letter, outer = m2.letter;
  return { order, input, mid, out, ok: true, enough: out >= p.need, inner, outer,
    notation: `${outer}${inner}(${input}) = ${outer}(${inner}(${input})) = ${outer}(${mid}) = ${out}` };
}

export function solve(p) {
  const runs = ORDERS.map((o) => runLine(p, o));
  return { working: runs.filter((r) => r.ok && r.enough).map((r) => r.order), outputs: Object.fromEntries(runs.map((r) => [r.order, r.ok ? r.out : null])) };
}
