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
