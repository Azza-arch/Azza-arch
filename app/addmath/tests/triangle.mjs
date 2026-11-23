// Independent triangle solver for the notes validator (Bab 9).
// It never uses the sine rule, cosine rule or ½ab sin C formulas taught in the
// chapter: every triangle is BUILT from coordinates (rays, distances, bisection,
// scanning) and its sides, angles and area are then MEASURED from the vertices.
// Conventions: vertices A, B, C; side a = BC (opposite A), b = CA, c = AB.
// Angles in degrees. Returns every non-degenerate triangle consistent with the givens.
const D = Math.PI / 180;
const V = ['A', 'B', 'C'];
const sideOf = (P, Q) => V.find((v) => v !== P && v !== Q).toLowerCase();
const PERMS = [['A', 'B', 'C'], ['A', 'C', 'B'], ['B', 'A', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['C', 'B', 'A']];

export function measure(pts) {
  const L = (P, Q) => Math.hypot(pts[P][0] - pts[Q][0], pts[P][1] - pts[Q][1]);
  const ang = (P) => { const [Q, R] = V.filter((v) => v !== P); const u = [pts[Q][0] - pts[P][0], pts[Q][1] - pts[P][1]], w = [pts[R][0] - pts[P][0], pts[R][1] - pts[P][1]]; return Math.abs(Math.atan2(u[0] * w[1] - u[1] * w[0], u[0] * w[0] + u[1] * w[1])) / D; };
  const [p, q, r] = [pts.A, pts.B, pts.C];
  return { a: L('B', 'C'), b: L('A', 'C'), c: L('A', 'B'), A: ang('A'), B: ang('B'), C: ang('C'), area: Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])) / 2 };
}

export function triSolve(g) {
  const has = (k) => g[k] !== undefined;
  const out = [];
  const finish = (pts) => {
    const t = measure(pts);
    if (!(t.area > 1e-9)) return;
    for (const k of Object.keys(g)) if (Math.abs(t[k] - g[k]) > 1e-6 * Math.max(1, Math.abs(g[k]))) return;
    if (!out.some((o) => ['a', 'b', 'c'].every((k) => Math.abs(o[k] - t[k]) < 1e-6))) out.push(t);
  };
  for (const [X, Y, Z] of PERMS) {
    const xy = sideOf(X, Y), xz = sideOf(X, Z), yz = sideOf(Y, Z);
    const place = (angX, lxy, lxz) => ({ [X]: [0, 0], [Y]: [lxy, 0], [Z]: [lxz * Math.cos(angX * D), lxz * Math.sin(angX * D)] });
    // two sides and the included angle
    if (has(X) && has(xy) && has(xz)) finish(place(g[X], g[xy], g[xz]));
    // three sides: open the angle at X until the far side has the right length
    if (has(xy) && has(xz) && has(yz)) {
      const f = (th) => Math.hypot(g[xy] - g[xz] * Math.cos(th), g[xz] * Math.sin(th)) - g[yz];
      let lo = 0, hi = Math.PI;
      if (f(lo) < 0 && f(hi) > 0) { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; } finish(place(lo / D, g[xy], g[xz])); }
    }
    // two angles and any side: intersect two rays on a unit base, then scale
    if (has(X) && has(Y) && g[X] + g[Y] < 180) {
      const u = [Math.cos(g[X] * D), Math.sin(g[X] * D)], v = [Math.cos((180 - g[Y]) * D), Math.sin((180 - g[Y]) * D)];
      const det = -u[0] * v[1] + v[0] * u[1]; // s·u − w·v = (1, 0)
      const s = -v[1] / det; const base = { [X]: [0, 0], [Y]: [1, 0], [Z]: [s * u[0], s * u[1]] };
      const m0 = measure(base);
      for (const k of ['a', 'b', 'c']) if (has(k)) { const sc = g[k] / m0[k]; finish(Object.fromEntries(Object.entries(base).map(([n, [x, y]]) => [n, [x * sc, y * sc]]))); }
    }
    // two sides and the area: open the angle at X and watch the measured area
    if (has('area') && has(xy) && has(xz)) {
      const ar = (th) => measure(place(th / D, g[xy], g[xz])).area - g.area;
      const N = 20000; for (let i = 1; i < N; i++) { let lo = (Math.PI * i) / N, hi = (Math.PI * (i + 1)) / N; if (ar(lo) * ar(hi) < 0) { for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (ar(lo) * ar(m) <= 0) hi = m; else lo = m; } finish(place(lo / D, g[xy], g[xz])); } }
      if (Math.abs(ar(Math.PI / 2)) < 1e-9) finish(place(90, g[xy], g[xz]));
    }
    // two sides and a non-included angle (ambiguous case): slide Z along the ray from X
    if (has(X) && has(xy) && has(yz)) {
      const c = g[xy], u = [Math.cos(g[X] * D), Math.sin(g[X] * D)];
      const F = (t) => Math.hypot(t * u[0] - c, t * u[1]) - g[yz];
      const T = 4 * (c + g[yz]), N = 100000; let tp = T / N, fp = F(tp);
      for (let i = 2; i <= N; i++) {
        const t = (T * i) / N, ft = F(t);
        if (fp * ft < 0) { let lo = tp, hi = t; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (F(lo) * F(m) <= 0) hi = m; else lo = m; } finish(place(g[X], c, (lo + hi) / 2)); }
        tp = t; fp = ft;
      }
      const foot = c * Math.cos(g[X] * D); // tangent case: the far side just touches the ray
      if (foot > 0 && Math.abs(F(foot)) < 1e-9) finish(place(g[X], c, foot));
    }
  }
  return out;
}

// 3-D helper: distances, angles at a vertex and triangle areas from coordinates.
export function geo3(pts, want, of) {
  const P = of.map((n) => pts[n]);
  const sub = (p, q) => p.map((x, k) => x - q[k]);
  const len = (v) => Math.hypot(...v);
  if (want === 'dist') return len(sub(P[0], P[1]));
  const u = sub(P[0], P[1]), w = sub(P[2], P[1]);
  const cr = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  if (want === 'angle') return Math.atan2(len(cr), u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / D;
  if (want === 'area') return len(cr) / 2;
  return NaN;
}

// Circular measure (T5 Bab 1), measured on a fine polygon — never via s = jθ or ½j²θ.
// θ in radians (or deg: true). want: arc | chord | sector | segment | sector-perimeter | segment-perimeter.
export function circMeasure({ j, theta, deg, R2 }, want) {
  const th = deg ? (theta * Math.PI) / 180 : theta, N = 20000;
  const pts = []; for (let k = 0; k <= N; k++) { const a = (th * k) / N; pts.push([j * Math.cos(a), j * Math.sin(a)]); }
  let arc = 0; for (let k = 1; k <= N; k++) arc += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  const shoe = (P) => { let s = 0; for (let k = 0; k < P.length; k++) { const [x1, y1] = P[k], [x2, y2] = P[(k + 1) % P.length]; s += x1 * y2 - x2 * y1; } return Math.abs(s) / 2; };
  const chord = Math.hypot(pts[N][0] - pts[0][0], pts[N][1] - pts[0][1]);
  const sector = shoe([[0, 0], ...pts]), segment = shoe(pts);
  if (want === 'annulus') return sector - circMeasure({ j: R2, theta, deg }, 'sector');
  return { arc, chord, sector, segment, 'sector-perimeter': arc + 2 * j, 'segment-perimeter': arc + chord }[want];
}
// Solve for j or θ so that a measured quantity hits a target (bisection on the measurement).
export function circSolve({ j, theta, deg, solveFor, target, want, lo, hi }) {
  const f = (v) => circMeasure(solveFor === 'j' ? { j: v, theta, deg } : { j, theta: v, deg }, want) - target;
  let a = lo, b = hi; if (f(a) * f(b) > 0) return NaN;
  for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
  return (a + b) / 2;
}

// Calculus (T5 Bab 2/3) — numerical, never by the differentiation rules being taught.
export const nd1 = (f, x, h = 1e-3) => (f(x - 2 * h) - 8 * f(x - h) + 8 * f(x + h) - f(x + 2 * h)) / (12 * h); // 5-point stencil
export const nd2 = (f, x, h = 1e-3) => (-f(x - 2 * h) + 16 * f(x - h) - 30 * f(x) + 16 * f(x + h) - f(x + 2 * h)) / (12 * h * h);
export function limitAt(f, a = 0) { // two-sided; returns NaN if the sides disagree
  const L = (h) => f(a + h), Rr = (h) => f(a - h);
  const right = 2 * L(1e-5) - L(2e-5), left = 2 * Rr(1e-5) - Rr(2e-5); // Richardson for the O(h) one-sided error
  return Math.abs(right - left) <= 1e-6 * Math.max(1, Math.abs(right)) ? (right + left) / 2 : NaN;
}
export function stationary(f, from, to, steps = 200000) { // x where f' changes sign (or touches 0)
  const g = (x) => nd1(f, x); const out = [];
  let xp = from, gp = g(from);
  for (let k = 1; k <= steps; k++) { const x = from + ((to - from) * k) / steps, gx = g(x);
    if (gp === 0) out.push(xp); else if (gp * gx < 0) { let a = xp, b = x; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; } out.push((a + b) / 2); }
    xp = x; gp = gx; }
  return out;
}
export function natureAt(f, x0, d = 1e-3) { const l = nd1(f, x0 - d), r = nd1(f, x0 + d); return l > 0 && r < 0 ? 'max' : l < 0 && r > 0 ? 'min' : 'inflection'; }
export function extremum(f, from, to, type, steps = 200000) { let best = null; for (let k = 0; k <= steps; k++) { const x = from + ((to - from) * k) / steps, v = f(x); if (Number.isFinite(v) && (best === null || (type === 'max' ? v > best.v : v < best.v))) best = { x, v }; } // refine
  let a = Math.max(from, best.x - (to - from) / steps), b = Math.min(to, best.x + (to - from) / steps); const phi = (Math.sqrt(5) - 1) / 2; const better = (u, w) => (type === 'max' ? f(u) > f(w) : f(u) < f(w));
  for (let i = 0; i < 100; i++) { const c = b - phi * (b - a), e = a + phi * (b - a); if (better(c, e)) b = e; else a = c; } const x = (a + b) / 2; return f(x) === undefined ? best : (type === 'max' ? (f(x) >= best.v ? { x, v: f(x) } : best) : (f(x) <= best.v ? { x, v: f(x) } : best)); }

// Integration (T5 Bab 3) — Simpson's rule on a fine grid, roots by scanning.
export function simpson(f, a, b, n = 2000) { if (a === b) return 0; const h = (b - a) / n; let s = f(a) + f(b); for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h); return (s * h) / 3; }
export function areaBetween(f, g, a, b) { // ∫|f − g|, split where f − g changes sign
  const d = (x) => f(x) - g(x), cuts = [a], N = 20000;
  for (let k = 0; k < N; k++) { const u = a + ((b - a) * k) / N, v = a + ((b - a) * (k + 1)) / N; if (d(u) * d(v) < 0) { let lo = u, hi = v; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (d(lo) * d(m) <= 0) hi = m; else lo = m; } cuts.push((lo + hi) / 2); } }
  cuts.push(b); let s = 0; for (let k = 1; k < cuts.length; k++) s += Math.abs(simpson(d, cuts[k - 1], cuts[k])); return s;
}
export function riemann(f, a, b, n, rule = 'left') { const h = (b - a) / n; let s = 0; for (let k = 0; k < n; k++) { const x = a + k * h + (rule === 'right' ? h : rule === 'mid' ? h / 2 : 0); s += f(x) * h; } return s; }

// Counting (T5 Bab 4) — brute-force enumeration, never nPr / nCr / n! formulas.
// items: array (repeats allowed = identical objects); mode 'perm' (ordered, r of them) | 'comb' (unordered) |
// 'product' (one from each of sets); circular: arrangements equal up to rotation; where: predicate on the tuple.
export function countBrute({ items, r, mode = 'perm', circular = false, sets, where }) {
  const seen = new Set(); let n = 0;
  const take = (tuple) => { if (where && !where(tuple)) return; let key = tuple.map(String).join('\u0001');
    if (circular) { let best = null; for (let s = 0; s < tuple.length; s++) { const k = [...tuple.slice(s), ...tuple.slice(0, s)].map(String).join('\u0001'); if (best === null || k < best) best = k; } key = best; }
    if (mode === 'comb') key = [...tuple].map(String).sort().join('\u0001');
    if (!seen.has(key)) { seen.add(key); n++; } };
  if (mode === 'product') { const rec = (k, acc) => { if (k === sets.length) return take(acc); for (const v of sets[k]) rec(k + 1, [...acc, v]); }; rec(0, []); return n; }
  const len = r ?? items.length, used = new Array(items.length).fill(false);
  if (mode === 'comb') { const rec = (start, acc) => { if (acc.length === len) return take(acc.map((i) => items[i])); for (let i = start; i < items.length; i++) rec(i + 1, [...acc, i]); }; rec(0, []); return n; }
  const rec = (acc) => { if (acc.length === len) return take(acc.map((i) => items[i])); for (let i = 0; i < items.length; i++) if (!used[i]) { used[i] = true; rec([...acc, i]); used[i] = false; } }; rec([]); return n;
}

// Probability (T5 Bab 5) — binomial by enumerating all 2^n success/failure sequences
// (no nCr formula); normal by integrating the density with Simpson's rule (no table).
export function binomDist(n, p) { let P = [1]; for (let i = 0; i < n; i++) { const nx = new Array(P.length + 1).fill(0); P.forEach((v, k) => { nx[k] += v * (1 - p); nx[k + 1] += v * p; }); P = nx; } return P; } // trial by trial (each sequence's probability flows through), no nCr
export function binomFind({ mean, variance }) { for (let n = 1; n <= 1000; n++) { const p = mean / n; if (p > 1) continue; if (Math.abs(binomStat({ n, p, want: 'var' }) - variance) < 1e-9) return n; } return NaN; }
export function binom({ n, p, want = 'eq', r, r2 }) { const P = binomDist(n, p), s = (lo, hi) => P.slice(Math.max(0, lo), Math.min(n, hi) + 1).reduce((a, b) => a + b, 0);
  return { eq: P[r], le: s(0, r), lt: s(0, r - 1), ge: s(r, n), gt: s(r + 1, n), between: s(r, r2) }[want]; }
export function binomStat({ n, p, want }) { const P = binomDist(n, p); const m = P.reduce((a, pr, k) => a + k * pr, 0); const v = P.reduce((a, pr, k) => a + (k - m) ** 2 * pr, 0); return { mean: m, var: v, sd: Math.sqrt(v) }[want]; }
const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
export const normCdf = (z) => (z >= 0 ? 0.5 + simpson(phi, 0, z, 4000) : 0.5 - simpson(phi, 0, -z, 4000));
export function normal({ mu = 0, sigma = 1, want, a, b }) { const Z = (x) => (x - mu) / sigma; return { lt: normCdf(Z(a)), gt: 1 - normCdf(Z(a)), between: normCdf(Z(b)) - normCdf(Z(a)) }[want]; }
export function normalInv({ mu = 0, sigma = 1, prob, tail = 'lower' }) { const target = tail === 'upper' ? 1 - prob : prob; let lo = -10, hi = 10; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (normCdf(m) < target) lo = m; else hi = m; } return mu + sigma * ((lo + hi) / 2); }

// Trigonometry (T5 Bab 6). f is evaluated with x in RADIANS; from/to and returned roots
// are in degrees when deg is true. Roots: sign changes, tangencies (local minima of |f|
// that reach 0, e.g. sin x = 1) and endpoints, all by scanning.
export function trigRoots(f, from, to, deg = true, N = 72000) {
  const g = (t) => f(deg ? (t * Math.PI) / 180 : t), xs = [], h = (to - from) / N, push = (r) => { if (!xs.some((v) => Math.abs(v - r) < 1e-6 * Math.max(1, Math.abs(r)))) xs.push(r); };
  const vals = []; for (let k = 0; k <= N; k++) vals.push(g(from + k * h));
  for (let k = 0; k <= N; k++) if (Math.abs(vals[k]) < 1e-10) push(from + k * h); // exact zeros on grid points (incl. endpoints)
  for (let k = 0; k < N; k++) { const a = from + k * h, b = a + h; if (vals[k] * vals[k + 1] < 0) { let lo = a, hi = b; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; } const r = (lo + hi) / 2; if (Math.abs(g(r)) < 1e-6) push(r); } } // |g| small rejects asymptotes (tan)
  for (let k = 1; k < N; k++) if (Math.abs(vals[k]) <= Math.abs(vals[k - 1]) && Math.abs(vals[k]) <= Math.abs(vals[k + 1]) && vals[k - 1] * vals[k + 1] > 0) { // tangency
    let lo = from + (k - 1) * h, hi = from + (k + 1) * h; for (let i = 0; i < 100; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (Math.abs(g(m1)) < Math.abs(g(m2))) hi = m2; else lo = m1; } const r = (lo + hi) / 2; if (Math.abs(g(r)) < 1e-9) push(r); }
  return xs.sort((a, b) => a - b);
}
export function trigGraph(f, want, from, to, deg = true, N = 72000) { const g = (t) => f(deg ? (t * Math.PI) / 180 : t); let mx = -Infinity, mn = Infinity; for (let k = 0; k <= N; k++) { const v = g(from + ((to - from) * k) / N); if (Number.isFinite(v)) { mx = Math.max(mx, v); mn = Math.min(mn, v); } }
  if (want === 'max') return mx; if (want === 'min') return mn; if (want === 'amp') return (mx - mn) / 2;
  if (want === 'period') { const S = [7, 23, 41, 66, 97, 133]; for (let T = (to - from) / 3600; T <= to - from; T += (to - from) / 3600) if (S.every((s) => { const a = g(s), b = g(s + T); return !Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) < 1e-6; })) { let lo = T - (to - from) / 3600, hi = T; return Math.round(hi * 1000) / 1000; } return NaN; } return NaN; }

// ---------------------------------------------------------------- T5 Bab 7: linear programming
// cons: [[a, b, op, c], …] meaning a·x + b·y op c; x ≥ 0 and y ≥ 0 are always added.
const LP_EPS = 1e-9;
export function lpHolds(cons, x, y) {
  if (x < -LP_EPS || y < -LP_EPS) return false;
  return cons.every(([a, b, op, c]) => { const v = a * x + b * y - c; return op === '<=' ? v <= LP_EPS : op === '>=' ? v >= -LP_EPS : op === '<' ? v < -LP_EPS : op === '>' ? v > LP_EPS : Math.abs(v) <= LP_EPS; });
}
// Optimum of obj = p·x + q·y. Continuous: every pairwise intersection of boundary
// lines that is feasible (vertex enumeration), cross-checked by a grid search that
// must never beat it. Integer: brute force over every lattice point in [0, bound]².
export function lpSolve({ cons, obj, goal = 'max', integer = false, bound = 200 }) {
  const [p, q] = obj, k = (x, y) => p * x + q * y, better = (u, v) => (goal === 'max' ? u > v + LP_EPS : u < v - LP_EPS);
  const opt = []; let best = null;
  const consider = (x, y) => { if (!lpHolds(cons, x, y)) return; const v = k(x, y); if (best === null || better(v, best)) { best = v; opt.length = 0; opt.push([x, y]); } else if (Math.abs(v - best) <= 1e-7) opt.push([x, y]); };
  if (integer) { for (let x = 0; x <= bound; x++) for (let y = 0; y <= bound; y++) consider(x, y); return { value: best, points: opt }; }
  const lines = [...cons.map(([a, b, , c]) => [a, b, c]), [1, 0, 0], [0, 1, 0]];
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const [a1, b1, c1] = lines[i], [a2, b2, c2] = lines[j], D = a1 * b2 - a2 * b1; if (Math.abs(D) < 1e-12) continue;
    consider((c1 * b2 - c2 * b1) / D, (a1 * c2 - a2 * c1) / D);
  }
  // grid cross-check (feasible region must be bounded in the optimising direction)
  for (let i = 0; i <= 2000; i++) for (let j = 0; j <= 2000; j++) { const x = (i * bound) / 2000, y = (j * bound) / 2000; if (lpHolds(cons, x, y) && best !== null && better(k(x, y), best)) return { value: NaN, points: [], unbounded: true }; }
  const uniq = []; for (const pt of opt) if (!uniq.some((u) => Math.hypot(u[0] - pt[0], u[1] - pt[1]) < 1e-7)) uniq.push(pt);
  return { value: best, points: uniq };
}
export function halfPlaneSame(h1, h2) { // same solution set? sampled on a grid that includes boundary points
  for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) { const x = i / 2, y = j / 2; if (lpHolds([h1], x + 50, y + 50) !== lpHolds([h2], x + 50, y + 50)) return false; if (lpHolds([h1], x, y) !== lpHolds([h2], x, y)) return false; }
  return true;
}

// ---------------------------------------------------------------- T5 Bab 8: kinematics
// Functions of t (written with x in the check specs). From a(t) or v(t) the motion is
// rebuilt by RK4 integration from t = 0 (not by antiderivatives); from s(t), v and a
// are measured with finite differences.
export function kinState({ s, v, a, v0 = 0, s0 = 0 }, T, steps = 20000) {
  if (s) return { s: s(T), v: nd1(s, T), a: nd2(s, T) };
  if (v) { let S = s0, h = T / steps; for (let k = 0; k < steps; k++) { const t = k * h; S += (h / 6) * (v(t) + 4 * v(t + h / 2) + v(t + h)); } return { s: T === 0 ? s0 : S, v: v(T), a: nd1(v, T) }; }
  let S = s0, V = v0; const h = T / steps;
  for (let k = 0; k < steps && T !== 0; k++) { const t = k * h; // RK4 on s' = V, V' = a(t)
    const k1s = V, k1v = a(t), k2s = V + (h / 2) * k1v, k2v = a(t + h / 2), k3s = V + (h / 2) * k2v, k3v = a(t + h / 2), k4s = V + h * k3v, k4v = a(t + h);
    S += (h / 6) * (k1s + 2 * k2s + 2 * k3s + k4s); V += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v); }
  return { s: S, v: V, a: a(T) };
}
// March the motion forward once from t = 0 (RK4 on s' = v, v' = a; or Simpson steps
// of v), recording (t, s, v) on a uniform grid up to tEnd.
export function kinTrack({ s, v, a, v0 = 0, s0 = 0 }, tEnd, N = 40000) {
  const h = tEnd / N, T = [], S = [], V = [];
  if (s) { for (let k = 0; k <= N; k++) { const t = k * h; T.push(t); S.push(s(t)); V.push(nd1(s, t)); } return { T, S, V }; }
  let Sc = s0, Vc = v ? v(0) : v0;
  for (let k = 0; k <= N; k++) {
    const t = k * h; T.push(t); S.push(Sc); V.push(v ? v(t) : Vc); if (k === N) break;
    if (v) { Sc += (h / 6) * (v(t) + 4 * v(t + h / 2) + v(t + h)); continue; }
    const k1s = Vc, k1v = a(t), k2s = Vc + (h / 2) * k1v, k2v = a(t + h / 2), k3s = Vc + (h / 2) * k2v, k3v = a(t + h / 2), k4s = Vc + h * k3v, k4v = a(t + h);
    Sc += (h / 6) * (k1s + 2 * k2s + 2 * k3s + k4s); Vc += (h / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
  }
  return { T, S, V };
}
// Total distance travelled between t1 and t2: sum of |Δs| over the marched grid.
export function pathLength(motion, t1, t2, N = 40000) {
  const { T, S } = kinTrack(motion, t2, N); let d = 0;
  for (let k = 1; k < T.length; k++) if (T[k] > t1 + 1e-12) d += Math.abs(S[k] - S[k - 1]) * (T[k - 1] >= t1 - 1e-12 ? 1 : (T[k] - t1) / (T[k] - T[k - 1]));
  return d;
}
export function kinExtreme(motion, want, type, from, to, N = 40000) {
  const { T, S, V } = kinTrack(motion, to, N), arr = want === 's' ? S : V; let best = null;
  for (let k = 0; k < T.length; k++) if (T[k] >= from - 1e-12) { const x = arr[k]; if (best === null || (type === 'max' ? x > best : x < best)) best = x; }
  return best;
}
