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
      else if (c === '(' || (c && /[a-z\d]/.test(c))) v *= power(); // implicit multiplication
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
