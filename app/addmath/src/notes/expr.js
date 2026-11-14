// Expression evaluator used in the browser to check pupils' typed answers
// (e.g. "2x+2", "(x-1)/2", "|x-3|", "sqrt(x)"). Supports + - * / ^,
// parentheses, implicit multiplication, |...| absolute value, and the
// functions sqrt, abs, log (base 10), ln, sin, cos, tan (radians).
// The content validator uses its own separate solver (tests/solvers.mjs).
const FUNCS = { sqrt: Math.sqrt, abs: Math.abs, log: Math.log10, ln: Math.log, exp: Math.exp, sin: Math.sin, cos: Math.cos, tan: Math.tan };

export function compile(input) {
  const src = String(input).toLowerCase().replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
  let i = 0;
  const peek = () => src[i];
  const fail = () => { throw new Error('parse'); };
  function primary() {
    const c = peek();
    if (c === '(') { i++; const v = sum(); if (src[i++] !== ')') fail(); return v; }
    if (c === '|') { i++; const v = sum(); if (src[i++] !== '|') fail(); return (s) => Math.abs(v(s)); }
    if (c === '-') { i++; const v = power(); return (s) => -v(s); }
    if (c === '+') { i++; return power(); }
    const num = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));
    if (num) { i += num[0].length; const n = Number(num[0]); return () => n; }
    const fn = /^(sqrt|abs|log|ln|exp|sin|cos|tan)/.exec(src.slice(i));
    if (fn) { i += fn[0].length; const arg = primary(); const f = FUNCS[fn[0]]; return (s) => f(arg(s)); }
    if (src.startsWith('pi', i)) { i += 2; return () => Math.PI; }
    if (src[i] === 'e' && !/[a-z]/.test(src[i + 1] || '')) { i++; return () => Math.E; }
    const id = /^[a-z]/.exec(src.slice(i));
    if (id) { i++; const k = id[0]; return (s) => { if (!(k in s)) throw new Error('var'); return s[k]; }; }
    return fail();
  }
  function power() { const b = primary(); if (peek() === '^') { i++; const e = power(); return (s) => b(s) ** e(s); } return b; }
  function product() {
    let v = power();
    for (;;) {
      const c = peek();
      if (c === '*') { i++; const r = power(); const l = v; v = (s) => l(s) * r(s); }
      else if (c === '/') { i++; const r = power(); const l = v; v = (s) => l(s) / r(s); }
      else if (c === '(' || (c && /[a-z\d.]/.test(c)) ) { const r = power(); const l = v; v = (s) => l(s) * r(s); }
      else return v;
    }
  }
  function sum() {
    let v = product();
    for (;;) {
      const c = peek();
      if (c === '+') { i++; const r = product(); const l = v; v = (s) => l(s) + r(s); }
      else if (c === '-') { i++; const r = product(); const l = v; v = (s) => l(s) - r(s); }
      else return v;
    }
  }
  const f = sum();
  if (i !== src.length) fail();
  return f;
}

export function tryEval(input, scope = {}) {
  try { const v = compile(input)(scope); return Number.isFinite(v) ? v : null; } catch { return null; }
}

// Two expressions in x are treated as equivalent if they agree at many
// sample points inside `domain` (skipping points where either is undefined).
export function equivalent(a, b, { variable = 'x', samples = [-3.7, -2.2, -1.3, -0.4, 0.6, 1.5, 2.9, 4.1, 5.3, 7.7], tol = 1e-6, upToConstant = false } = {}) {
  let fa, fb, compared = 0, shift = null; // upToConstant: indefinite integrals may differ by a constant
  try { fa = compile(a); fb = compile(b); } catch { return false; }
  for (const x of samples) {
    let va, vb;
    try { va = fa({ [variable]: x }); vb = fb({ [variable]: x }); } catch { return false; }
    if (!Number.isFinite(va) || !Number.isFinite(vb)) { if (Number.isFinite(va) !== Number.isFinite(vb)) return false; continue; }
    if (upToConstant) { if (shift === null) shift = va - vb; va -= shift; }
    if (Math.abs(va - vb) > tol * Math.max(1, Math.abs(vb))) return false;
    compared++;
  }
  return compared >= 4;
}

export const fmt = (n) => String(Number(Number(n).toPrecision(12)));
