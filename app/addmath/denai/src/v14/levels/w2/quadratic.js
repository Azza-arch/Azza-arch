// World 2 · Lembah Batu Kapur — pure maths for the Pancur Lengkung (no Phaser).
// Station A (Level 2-1 vertical slice): only `a` moves; h = 3, k = 4 are fixed.
// Scale: 1 maths unit = 1 tile (54 world units). Up is +y in maths, -y on screen.

export const TILE = 54;

// Station A layout, in maths units.
//  - perches (left/right banks) have their top at y = 0.5 and end/start at x = 0.5 / 5.5
//  - the Pancur nozzle is a solid column at x 2.5..3.5 whose top is the vertex (3, 4)
//  - water surface at y = -1 (falling in = respawn on the bank)
//  - one stepping stone per whole x between the rings (x = 1, 2, 4, 5; x = 3 is the nozzle)
export const STATION_A = Object.freeze({
  h: 3, k: 4,
  options: [-2, -1, -0.5, 0.5, 1, 2],
  start: 1,                // the lever starts on a = 1 (opens upward: clearly not a path)
  answer: -0.5,
  rings: [[1, 2], [5, 2]],
  stoneXs: [1, 2, 3, 4, 5],
  perchTop: 0.5, perchLeftEdge: 0.5, perchRightEdge: 5.5,
  column: { x0: 2.5, x1: 3.5, top: 4 },
  water: -1,
  ceiling: 8.5,            // stones above this are off the top of the station
});

export const f = (a, h, k, x) => a * (x - h) ** 2 + k;

const FRACTIONS = { 0.5: '½', 0.25: '¼' };
export function formatA(a) {
  const s = a < 0 ? '−' : '';
  const m = Math.abs(a);
  return s + (FRACTIONS[m] ?? String(m));
}
export function formatNum(v) {
  const s = v < 0 ? '−' : '';
  const m = Math.abs(v);
  const whole = Math.floor(m), frac = +(m - whole).toFixed(3);
  if (frac === 0) return s + whole;
  const map = { 0.5: '½', 0.25: '¼', 0.75: '¾' };
  return s + (whole ? whole : '') + (map[frac] ?? frac.toString().slice(1));
}

// Points on the curve where it passes the rings.
export function ringHits(a, st = STATION_A) {
  return st.rings.map(([x, y]) => ({ x, y, curveY: f(a, st.h, st.k, x), hit: Math.abs(f(a, st.h, st.k, x) - y) < 1e-9 }));
}

// Stepping stones for a given a. state: 'solid' (steppable), 'nozzle' (x = h: the column top),
// 'submerged' (under the water line, drawn faded, no collision), 'high' (above the station).
export function stones(a, st = STATION_A) {
  return st.stoneXs.map((x) => {
    const y = f(a, st.h, st.k, x);
    const state = x === st.h ? 'nozzle' : y <= st.water ? 'submerged' : y > st.ceiling ? 'high' : 'solid';
    return { x, y, state };
  });
}

// ── Real jump envelope, integrated exactly like Arcade Physics (semi-implicit Euler at 60 Hz) ──
export function jumpEnvelope(motion, gravity = 1400, hz = 60) {
  const dt = 1 / hz;
  let vy = -motion.jump, y = 0, t = 0, peak = 0;
  const path = [];
  while (t < 3) {
    vy += gravity * dt; y += vy * dt; t += dt;
    peak = Math.max(peak, -y);
    path.push({ t, rise: -y, falling: vy > 0 });
    if (-y < -6 * TILE) break;
  }
  return { peak, path, dt };
}

// Horizontal distance (world units) a running jump can cover and still have its feet at `rise`
// (world units above take-off) while coming down. -Infinity if the rise is never reached.
export function reachAtRise(env, rise, speed) {
  if (rise > env.peak) return -Infinity;
  let best = -Infinity;
  for (const p of env.path) if (p.falling && p.rise >= rise) best = p.t * speed;
  // still rising past the rise counts too (landing on the way up is impossible for one-way decks,
  // so only the falling branch is used)
  return best;
}

// Reachability of Station A with real numbers. Nodes are standing surfaces; an edge exists if a
// jump from one to the other is physically possible. Returns success + the first blocked step.
export function analyse(a, motion, opts = {}) {
  const st = opts.station ?? STATION_A;
  const oneWayTol = opts.oneWayTol ?? 8;     // createPlayer accepts a landing up to 8 units below a deck top
  const bodyW = motion.bodyWidth;
  const env = jumpEnvelope(motion, opts.gravity ?? 1400);
  const T = TILE;
  const nodes = [
    { id: 'L', x0: -10, x1: st.perchLeftEdge, top: st.perchTop, solid: true },
    { id: 'C', x0: st.column.x0, x1: st.column.x1, top: st.column.top, solid: true },
    { id: 'R', x0: st.perchRightEdge, x1: 20, top: st.perchTop, solid: true },
  ];
  for (const s of stones(a, st)) if (s.state === 'solid') nodes.push({ id: `S${s.x}`, x0: s.x - 0.5, x1: s.x + 0.5, top: s.y, solid: false, stone: s });
  const side = (n) => (n.x1 <= st.column.x0 ? -1 : n.x0 >= st.column.x1 ? 1 : 0);
  const can = (from, to) => {
    if (from === to) return false;
    const rise = (to.top - from.top) * T;
    const gap = Math.max(0, (to.x0 > from.x1 ? to.x0 - from.x1 : from.x0 > to.x1 ? from.x0 - to.x1 : 0)) * T;
    // feet can leave with the body half over the edge and land with a sliver on the target
    const needX = Math.max(0, gap - bodyW + 2);
    if (rise <= 0) {
      const drop = -rise; // falling: always reachable horizontally within the fall time if gap is small
      const tFall = Math.sqrt((2 * drop) / 1400) + (2 * motion.jump) / 1400;
      if (needX > tFall * motion.speed) return false;
    } else {
      const allowed = rise - (to.solid ? 0 : oneWayTol);
      if (allowed > env.peak) return false;
      if (needX > reachAtRise(env, Math.max(0, allowed), motion.speed)) return false;
    }
    // the nozzle column blocks anything crossing it below its top
    const sf = side(from), sto = side(to);
    if (sf && sto && sf !== sto && from.top * T + env.peak <= st.column.top * T) return false;
    return true;
  };
  // BFS from L
  const seen = new Set(['L']), queue = ['L'], prev = {};
  while (queue.length) {
    const id = queue.shift(), from = nodes.find((n) => n.id === id);
    for (const to of nodes) if (!seen.has(to.id) && can(from, to)) { seen.add(to.id); prev[to.id] = id; queue.push(to.id); }
  }
  const success = seen.has('R');
  const route = [];
  if (success) { for (let id = 'R'; id; id = prev[id]) route.unshift(id); }
  // Explain the first failure in physical terms: the lowest climb the player would need next.
  let blocked = null;
  if (!success) {
    let best = null;
    for (const fromId of seen) {
      const from = nodes.find((n) => n.id === fromId);
      const sameSide = nodes.filter((n) => !seen.has(n.id) && n.id !== 'C' && side(n) === side(from));
      for (const to of sameSide.length ? sameSide : nodes.filter((n) => n.id === 'C' && !seen.has('C'))) {
        const rise = to.top - from.top;
        if (rise > 0 && (!best || rise < best.rise)) best = { from: from.id, to: to.id, rise, x: (to.x0 + to.x1) / 2, top: to.top };
      }
    }
    blocked = best;
  }
  return { success, route, reached: [...seen], blocked, peakTiles: env.peak / T };
}

// Short, concrete reason why the shape is what it is (no long-form text).
export function shapeCue(a, prevA) {
  const open = a < 0 ? 'a negatif: lengkung terbuka ke bawah (puncak di atas)' : 'a positif: lengkung terbuka ke atas (titik terendah di bawah)';
  if (prevA === undefined || Math.sign(prevA) !== Math.sign(a)) return open;
  return Math.abs(a) > Math.abs(prevA) ? '|a| lebih besar: lengkung lebih sempit dan curam' : '|a| lebih kecil: lengkung lebih lebar dan landai';
}
