// Independent solvers for question checking. Deliberately written apart from
// the content files: a question's stored answer is compared with what these
// compute from the question's structured `given` data.

// Safe evaluator for school algebra in one variable: numbers, x, + − * / ^,
// parentheses, unary minus and implicit multiplication (3x, 2(x+1), x(x−1)).
export function evaluate(expr, vars = {}) {
  const src = String(expr).replace(/\s+/g, '').replace(/−/g, '-');
  let i = 0;
  const peek = () => src[i];
  const fail = (msg) => { throw new Error(`${msg} at ${i} in "${src}"`); };
  function primary() {
    const c = peek();
    if (c === '(') { i++; const v = sum(); if (src[i++] !== ')') fail('missing )'); return v; }
    if (c === '|') { i++; const v = sum(); if (src[i++] !== '|') fail('missing |'); return Math.abs(v); }
    const fn = /^(abs|sqrt|ln|log|exp)\(/.exec(src.slice(i));
    if (fn) { i += fn[1].length; const v = primary(); const k = fn[1];
      if (k === 'sqrt' && v < 0) fail('sqrt of negative'); if ((k === 'ln' || k === 'log') && v <= 0) return NaN;
      return k === 'abs' ? Math.abs(v) : k === 'sqrt' ? Math.sqrt(v) : k === 'ln' ? Math.log(v) : k === 'log' ? Math.log10(v) : Math.exp(v); }
    if (src.startsWith('e', i) && !/[a-z]/.test(src[i + 1] || '') && !('e' in vars)) { i++; return Math.E; }
    if (c === '-') { i++; return -power(); }
    if (c === '+') { i++; return power(); }
    const num = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (num) { i += num[0].length; return Number(num[0]); }
    const id = /^[a-z]/.exec(src.slice(i));
    if (id) { i++; if (!(id[0] in vars)) fail(`unknown variable ${id[0]}`); return vars[id[0]]; }
    return fail('unexpected token');
  }
  function power() { const b = primary(); if (peek() === '^') { i++; return b ** power(); } return b; }
  function product() {
    let v = power();
    for (;;) {
      const c = peek();
      if (c === '*') { i++; v *= power(); }
      else if (c === '/') { i++; const d = power(); if (d === 0) fail('division by zero'); v /= d; }
      else if (c === '(' || c === '|' && false || (c && /[a-z\d]/.test(c))) v *= power(); // implicit multiplication
      else return v;
    }
  }
  function sum() {
    let v = product();
    for (;;) { const c = peek(); if (c === '+') { i++; v += product(); } else if (c === '-') { i++; v -= product(); } else return v; }
  }
  const v = sum();
  if (i !== src.length) fail('trailing input');
  return v;
}

export const domainOfMapping = (pairs) => [...new Set(pairs.map(([a]) => a))].sort((a, b) => a - b);
export const rangeOfMapping = (pairs) => [...new Set(pairs.map(([, b]) => b))].sort((a, b) => a - b);

// A relation on `domain` is a function iff every element of the domain has exactly one image.
export function isFunctionMapping({ domain, pairs }) {
  return domain.every((d) => new Set(pairs.filter(([a]) => a === d).map(([, b]) => b)).size === 1)
    && pairs.every(([a]) => domain.includes(a));
}

// "{1, 2, 3}" → [1, 2, 3]
export function parseSet(text) {
  const m = /^\{(.*)\}$/.exec(String(text).replace(/\s+/g, ''));
  if (!m) return null;
  return m[1] === '' ? [] : m[1].split(',').map(Number).sort((a, b) => a - b);
}

export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- helpers for the notes validator -------------------------------------
export const f1 = (expr) => (x) => evaluate(expr, { x });
// All real roots of f(x) = target on [a, b] (scan + bisection; also catches
// touching roots such as |x - 2| = 0 by checking near-zero samples).
export function roots(fn, target, a = -60, b = 60, steps = 24000) {
  const out = []; const g = (x) => { try { return fn(x) - target; } catch { return NaN; } };
  let px = a, pv = g(a);
  for (let k = 1; k <= steps; k++) {
    const x = a + ((b - a) * k) / steps, v = g(x);
    if (Number.isFinite(pv) && Number.isFinite(v)) {
      if (pv === 0) out.push(px);
      else if (pv * v < 0) { let lo = px, hi = x; for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2; (g(lo) * g(m) <= 0 ? (hi = m) : (lo = m)); } out.push((lo + hi) / 2); }
      else if (Math.abs(v) < 1e-9) out.push(x);
    }
    px = x; pv = v;
  }
  return [...new Set(out.map((r) => +r.toFixed(9)))].filter((r, i, arr) => i === 0 || Math.abs(r - arr[i - 1]) > 1e-6);
}
export function sameFunction(fa, fb, samples = [-3.7, -2.2, -1.3, -0.4, 0.6, 1.5, 2.9, 4.1, 5.3, 7.7]) {
  let n = 0;
  for (const x of samples) { let a, b; try { a = fa(x); b = fb(x); } catch { continue; } if (!Number.isFinite(a) || !Number.isFinite(b)) continue; if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return false; n++; }
  return n >= 5;
}
export function extremaOnInterval(fn, a, b, steps = 20000) {
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k <= steps; k++) { const v = fn(a + ((b - a) * k) / steps); if (v < lo) lo = v; if (v > hi) hi = v; }
  return { min: lo, max: hi };
}
