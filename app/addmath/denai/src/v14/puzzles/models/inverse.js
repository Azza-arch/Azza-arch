// DENAI puzzle model · inverse functions (T4 Bab 1 · fungsi songsang).
// f(x) = a·x + b on a whole-number domain {lo…hi}. The player knows a target
// output y and must recover x = f⁻¹(y) = (y − b) ÷ a. Pure: no Phaser, no DOM.
import { evalRule, isRule } from '../rules.js';

export function domainOf(p) { const [lo, hi] = p.domain; return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i); }

export function validateParams(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return ['params missing'];
  if (!isRule(p.rule) || p.rule.a === 0) errors.push('rule must be linear with a ≠ 0 (one-to-one)');
  if (!Array.isArray(p.domain) || p.domain.length !== 2 || !p.domain.every(Number.isSafeInteger) || p.domain[0] > p.domain[1]) errors.push('domain must be [lo, hi] integers');
  if (!Number.isSafeInteger(p.target)) errors.push('target must be an integer');
  if (errors.length) return errors;
  if (!inverse(p, p.target).ok) errors.push('target is not in the range of f');
  return errors;
}

// f(x) for x in the domain, otherwise null (the machine has no such setting).
export function forward(p, x) { return Number.isInteger(x) && x >= p.domain[0] && x <= p.domain[1] ? evalRule(p.rule, x) : null; }
export const range = (p) => domainOf(p).map((x) => evalRule(p.rule, x));

// { ok, x } — ok only when (y − b) ÷ a is a whole number inside the domain.
export function inverse(p, y) {
  if (!Number.isFinite(y)) return { ok: false, reason: 'not-a-number' };
  const x = (y - p.rule.b) / p.rule.a;
  if (!Number.isInteger(x)) return { ok: false, x, reason: 'not-whole' };
  if (x < p.domain[0] || x > p.domain[1]) return { ok: false, x, reason: 'outside-domain' };
  return { ok: true, x };
}

// Worked steps, undoing the machine in reverse order: "13 − 3 = 10, 10 ÷ 2 = 5".
export function inverseSteps(p, y) {
  const { a, b } = p.rule, parts = [];
  let v = y;
  if (b !== 0) { const n = v - b; parts.push(`${v} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${n}`); v = n; }
  if (a !== 1) { const n = v / a; parts.push(`${v} ÷ ${a} = ${n}`); v = n; }
  return parts.join(', ');
}

export function solve(p) { const r = inverse(p, p.target); return { setting: r.ok ? r.x : null }; }
