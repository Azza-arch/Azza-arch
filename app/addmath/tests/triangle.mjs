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
