// DENAI puzzle layer · linear rules as data.
// A rule is a plain object { a, b } meaning f(x) = a·x + b (integers only).
// Rules are evaluated from data — never with eval() or Function().

export function makeRule(a, b) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) throw new RangeError('rule: a and b must be integers');
  return Object.freeze({ a, b });
}
export const isRule = (r) => !!r && Number.isSafeInteger(r.a) && Number.isSafeInteger(r.b);

export function evalRule(r, x) {
  if (!isRule(r)) throw new RangeError('rule: invalid rule');
  if (!Number.isFinite(x)) throw new RangeError('rule: x must be a number');
  return r.a * x + r.b;
}

// Text in KSSM style with a proper minus sign: 2x + 3, x − 2, 2x, 5.
export function ruleText(r, v = 'x') {
  if (!isRule(r)) throw new RangeError('rule: invalid rule');
  const ax = r.a === 0 ? '' : r.a === 1 ? v : r.a === -1 ? `−${v}` : `${r.a < 0 ? '−' : ''}${Math.abs(r.a)}${v}`;
  if (!ax) return r.b < 0 ? `−${-r.b}` : String(r.b);
  return r.b === 0 ? ax : `${ax} ${r.b > 0 ? '+' : '−'} ${Math.abs(r.b)}`;
}
