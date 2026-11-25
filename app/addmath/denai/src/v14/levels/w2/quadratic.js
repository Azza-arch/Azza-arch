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

// Horizontal distance (world units) a running jump covers before the feet come down to `rise`
// (world units above take-off; negative = a drop), with an optional ceiling `cap` (world units the
// feet can rise before the head hits rock: the upward speed is then lost, as in Arcade Physics).
// Same semi-implicit Euler at 60 Hz as jumpEnvelope. -Infinity if `rise` is never reached falling.
export function airReach(motion, rise, cap = Infinity, gravity = 1400, hz = 60, standing = false) {
  // standing: take off from rest; horizontal speed builds up with the player's acceleration in the air
  const dt = 1 / hz;
  let vy = -motion.jump, y = 0, t = 0, vx = standing ? 0 : motion.speed, x = 0, best = -Infinity;
  while (t < 4) {
    vy += gravity * dt; y += vy * dt; t += dt;
    vx = Math.min(motion.speed, vx + (motion.acceleration ?? 2100) * dt); x += vx * dt;
    if (-y >= cap) { y = -cap; if (vy < 0) vy = 0; }
    if (vy > 0 && -y < rise) break;                       // fell past the target height
    if (vy > 0) best = x;                                 // last frame still at or above it (conservative)
  }
  return best;
}

// ── Generic station reachability (Phase 2) ──────────────────────────────────
// A station is described in maths units (1 unit = 1 tile):
//   surfaces: solid ground the player can stand on and cannot pass through
//             [{ id, x0, x1, top }]; 'L' (start) and 'R' (goal) must exist
//   stoneXs:  where stepping stones appear (one per whole x) on y = a(x − h)² + k
//   water:    stones at or below this are submerged (drawn, no collision)
//   ceiling:  optional rock overhang [{ x0, x1, y }] (y = its underside): a stone needs
//             headroom for the player's body, and jumps under it are cut short
//   top:      stones above this are off the top of the station
// Nodes are standing surfaces; an edge exists if one real jump can join them.
const HEAD = (m) => m.bodyHeight / TILE;           // body height in tiles
export const curveAt = (c, x) => f(c.a, c.h, c.k, x);
function ceilingOver(st, x0, x1) {                  // lowest overhang above any part of [x0, x1]
  let y = Infinity;
  for (const c of st.ceiling || []) if (c.x0 < x1 && c.x1 > x0) y = Math.min(y, c.y);
  return y;
}
export function stationStones(st, c, motion) {
  // Anchored stations (a water jet into two receivers, a cable tied to two posts): if the curve misses
  // a ring nothing is supported, so nothing is built ('loose': drawn as the falling curve, no collision).
  const loose = st.anchored && !st.rings.every(([x, y]) => Math.abs(curveAt(c, x) - y) < 1e-9);
  return st.stoneXs.map((x) => {
    if (loose) return { x, y: curveAt(c, x), state: 'loose' };
    const y = curveAt(c, x);
    const covered = st.surfaces.some((s) => x > s.x0 && x < s.x1);
    const roof = ceilingOver(st, x - 0.5, x + 0.5);
    const state = covered ? 'nozzle' : y <= st.water ? 'submerged' : y > st.top ? 'high'
      : motion && y + HEAD(motion) > roof ? 'buried' : 'solid';
    return { x, y, state };
  });
}
export function analyseStation(station, c, motion, opts = {}) {
  let st = station;
  const oneWayTol = opts.oneWayTol ?? 8;     // createPlayer accepts a landing up to 8 units below a deck top
  const g = opts.gravity ?? 1400, T = TILE, bodyW = motion.bodyWidth;
  const env = jumpEnvelope(motion, g);
  const nodes = st.surfaces.map((s) => ({ ...s, solid: true }));
  for (const s of stationStones(st, c, motion)) if (s.state === 'solid') nodes.push({ id: `S${s.x}`, x0: s.x - 0.5, x1: s.x + 0.5, top: s.y, solid: false, stone: s });
  // Generous flight (used to prove a WRONG curve fails, so it must never under-estimate the player):
  // a 2D trajectory at full running speed from several take-off points, where rock only stops the
  // head where the body actually is. Side collisions with rock are ignored (also generous).
  const roofAt = (x) => ceilingOver(st, (x - bodyW / 2) / T, (x + bodyW / 2) / T) * T; // world units
  const flight = (from, to) => {
    const dir = (to.x0 + to.x1) / 2 >= (from.x0 + from.x1) / 2 ? 1 : -1, dt = 1 / 60, H = motion.bodyHeight;
    const edge = (dir > 0 ? from.x1 : from.x0) * T, far = (dir > 0 ? from.x0 : from.x1) * T;
    const t0 = to.x0 * T, t1 = to.x1 * T, land = to.top * T, tol = to.solid ? 0 : oneWayTol;
    for (let k = 0; k <= 24; k++) {
      const x0 = edge + dir * (bodyW / 2 - 1) - dir * k * 9;       // take-off: from the edge backwards
      if (dir > 0 ? x0 < far : x0 > far) break;
      const base = from.top * T;
      if (base + H > roofAt(x0)) continue;                        // no room to stand here
      let x = x0, h = base, vy = -motion.jump;
      for (let i = 0; i < 240; i++) {
        const hPrev = h;
        vy += g * dt; h -= vy * dt; x += dir * motion.speed * dt;
        const r = roofAt(x); if (h + H > r) { h = r - H; if (vy < 0) vy = 0; }
        if (vy > 0 && h <= land + tol && hPrev >= land - 1e-6) {
          // any speed between standing and full speed was possible: the body may be anywhere
          // between the take-off point and x; it lands if that span overlaps the target
          const lo = Math.min(x0, x) - bodyW / 2, hi = Math.max(x0, x) + bodyW / 2;
          if (hi > t0 + 1 && lo < t1 - 1 && land + H <= roofAt(Math.min(Math.max(x, t0 + bodyW / 2), t1 - bodyW / 2))) return true;
        }
        if (h < Math.min(land, base) - 6 * T) break;
      }
    }
    return false;
  };
  const can = (from, to) => {
    if (from === to) return false;
    const strict = opts.strict === true;
    const rise = (to.top - from.top) * T;
    const gap = Math.max(0, to.x0 > from.x1 ? to.x0 - from.x1 : from.x0 > to.x1 ? from.x0 - to.x1 : 0) * T;
    // optional comfort limits (tiles): "is there a route a Form 4 player finds easy?"
    if (opts.maxRise != null && rise > opts.maxRise * T + 1e-6) return false;
    if (opts.maxGap != null && gap > opts.maxGap * T + 1e-6) return false;
    // solid ground standing between the two blocks the jump unless the feet clear its top
    const a0 = Math.min(from.x1, to.x1), a1 = Math.max(from.x0, to.x0);
    for (const s of nodes) if (s.solid && s !== from && s !== to && s.x0 >= a0 - 1e-9 && s.x1 <= a1 + 1e-9 && from.top * T + env.peak <= s.top * T) return false;
    if (!strict) return flight(from, to);
    // Strict (used to prove the RIGHT curve is easy, so it must never over-estimate the player):
    // stand still in the middle of a stone (or half a tile back from a bank's edge), any rock over
    // the take-off, the gap or the target caps the whole jump, land with 10 units on the target.
    const lo = Math.min(from.x0, to.x0), hi = Math.max(from.x1, to.x1);
    const roof = ceilingOver(st, lo, hi);
    const peak = Math.min(env.peak, (roof - from.top - HEAD(motion)) * T);
    if (peak < 0) return false;
    const back = Math.min(0.5, (from.x1 - from.x0) / 2) * T;
    const needX = Math.max(0, back + gap + 10 - bodyW / 2);
    const allowed = rise > 0 ? rise - (to.solid ? 0 : oneWayTol) : rise;
    if (allowed > peak) return false;
    if (needX > airReach(motion, Math.max(allowed, rise > 0 ? 0 : rise), Number.isFinite(roof) ? peak : Infinity, g, 60, true)) return false;
    for (const s of nodes) if (s.solid && s !== from && s !== to && s.x0 >= a0 - 1e-9 && s.x1 <= a1 + 1e-9 && from.top * T + peak <= s.top * T) return false;
    return true;
  };
  const seen = new Set(['L']), queue = ['L'], prev = {};
  while (queue.length) {
    const id = queue.shift(), from = nodes.find((n) => n.id === id);
    for (const to of nodes) if (!seen.has(to.id) && can(from, to)) { seen.add(to.id); prev[to.id] = id; queue.push(to.id); }
  }
  const success = seen.has('R');
  const route = [];
  if (success) for (let id = 'R'; id; id = prev[id]) route.unshift(id);
  // Explain a failure the way the player meets it: the next surface ahead of the furthest point
  // reached, and the best place to try it from (the smallest climb within jumping distance).
  let blocked = null;
  const factors = [];
  if (!success) {
    const mid = (n) => (n.x0 + n.x1) / 2, gapOf = (p, q) => Math.max(0, q.x0 > p.x1 ? q.x0 - p.x1 : p.x0 > q.x1 ? p.x0 - q.x1 : 0);
    const reachedNodes = nodes.filter((n) => seen.has(n.id));
    const front = reachedNodes.reduce((m, n) => (n.x1 > m.x1 ? n : m));
    const ahead = nodes.filter((n) => !seen.has(n.id) && mid(n) > mid(front)).sort((p, q) => gapOf(front, p) - gapOf(front, q) || p.x0 - q.x0)[0];
    if (ahead) {
      const reachX = airReach(motion, 0, Infinity, g) / T;
      // try from where the player actually stands near it: the closest surfaces (within 1 tile of the
      // smallest gap), not a far-off leap across the whole station
      const near = reachedNodes.filter((n) => gapOf(n, ahead) <= reachX + 1e-9);
      const minGap = Math.min(...near.map((n) => gapOf(n, ahead)));
      const tries = near.filter((n) => gapOf(n, ahead) <= minGap + 1 + 1e-9);
      const from = (tries.length ? tries : [front]).reduce((m, n) => {
        const dn = ahead.top - n.top, dm = ahead.top - m.top;
        return dn < dm - 1e-9 || (Math.abs(dn - dm) < 1e-9 && gapOf(n, ahead) < gapOf(m, ahead)) ? n : m;
      });
      blocked = { from: from.id, to: ahead.id, rise: ahead.top - from.top, gap: gapOf(from, ahead), x: mid(ahead), top: ahead.top };
      // the same hop with the rock overhang removed: possible → the rock is what stopped it
      const saved = st.ceiling; st = { ...st, ceiling: [] };
      const openAir = can(from, ahead); st = { ...st, ceiling: saved };
      if (saved?.length && openAir) factors.push('roof');
      else if (blocked.rise * T - (ahead.solid ? 0 : oneWayTol) > env.peak) factors.push('climb');
      else factors.push('gap');
    }
    // stones between the rings that the player can see are unusable
    const xs = (st.rings || []).map(([x]) => x);
    if (xs.length) {
      const between = stationStones(st, c, motion).filter((s2) => s2.x >= Math.min(...xs) && s2.x <= Math.max(...xs));
      for (const f2 of ['high', 'submerged', 'buried', 'loose']) if (between.some((s2) => s2.state === f2)) factors.unshift(f2);
    }
  }
  return { success, route, reached: [...seen], blocked, factors, peakTiles: env.peak / T };
}

// ── Level 2-1 stations B and C (Phase 2, 25 Nov 2026) ───────────────────────
// Found by an exhaustive layout search (tests/quadratic.test.mjs re-checks them): the correct
// curve must be walkable with a 5 % weaker jump and every other lever setting must fail with a
// 5 % stronger jump; the correct route never needs a climb above 1.5 tiles or a gap above 2 tiles.
// A limestone overhang is what makes the answer unique: the player's jump is generous (peak
// 1.71 tiles, running reach 3.9 tiles), so in open air almost any curve can be crossed.

// Station B "Anjakan": the shape from Station A (a = −½) is fixed; levers h and k move it. The jet only
// hardens into stones if it enters BOTH receiver rings (3, 2) and (7, 2) → only h = 5, k = 4 (anchored).
// Banks y = 1 with a 5-tile pond between (x 2.5–7.5): with nothing built the gap cannot be jumped even
// with a 5 % stronger jump; with the right curve the stones 2, 3½, 4, 3½, 2 make an easy stair.
// (Phase 3 redesign, 25 Nov: with honest physics a shifted curve's stones stay within the player's
// 4-tile jump, so h and k cannot be told apart by traversal alone; anchoring makes the rings matter.)
export const STATION_B = Object.freeze({
  id: 'B', a: -0.5, levers: ['h', 'k'], anchored: true,
  options: { h: [3, 4, 5, 6, 7], k: [2, 3, 4, 5, 6] },
  start: { h: 3, k: 2 }, answer: { a: -0.5, h: 5, k: 4 },
  rings: [[3, 2], [7, 2]],
  surfaces: [{ id: 'L', x0: -10, x1: 2.5, top: 1 }, { id: 'R', x0: 7.5, x1: 20, top: 1 }],
  stoneXs: [3, 4, 5, 6, 7], water: -1, top: 8.5,
  ceiling: [],
});

// Station C "Jambatan Gantung" (anchored: the cable is only tied on if it passes both anchor rings):
// a = ½ and h = 4 fixed (cable between posts at x = 2 and x = 6);
// lever k raises or lowers the whole cable. Posts (solid, top 2.5) carry the anchor rings (2, 3) and
// (6, 3) → ½(2 − 4)² + k = 3 → only k = 1. A stone arch (x 3.5–4.5, underside y = 3.5) stands over
// the middle: a cable that is too high leaves no headroom under the arch; one that is too low cannot
// be climbed back onto the far post.
// Design note: the blueprint moved a, h and k here; a search over every layout found no station
// where (a, k) together has a single physical answer, so C moves k only (a was Station A's lever).
export const STATION_C = Object.freeze({
  id: 'C', a: 0.5, h: 4, levers: ['k'], anchored: true,
  options: { k: [0, 1, 2, 3, 4] },
  start: { k: 3 }, answer: { a: 0.5, h: 4, k: 1 },
  rings: [[2, 3], [6, 3]],
  surfaces: [{ id: 'L', x0: -10, x1: 1.5, top: 1.5 }, { id: 'P1', x0: 1.5, x1: 2.5, top: 2.5 }, { id: 'P2', x0: 5.5, x1: 6.5, top: 2.5 }, { id: 'R', x0: 6.5, x1: 20, top: 1.5 }],
  stoneXs: [2, 3, 4, 5, 6], water: -0.5, top: 8.5,
  // the arch: a keystone hanging over the middle (underside 3.5) from a rock band (underside 7) that
  // spans the posts; the band is far above any jump here, it only holds the keystone up
  ceiling: [{ x0: 3.5, x1: 4.5, y: 3.5, top: 7 }, { x0: 1.5, x1: 6.5, y: 7, top: 8 }],
});

/** Every lever setting of a station as a curve { a, h, k }. */
export function stationCombos(st) {
  const base = { a: st.a, h: st.h, k: st.k };
  return st.levers.reduce((acc, lv) => acc.flatMap((c) => st.options[lv].map((v) => ({ ...c, [lv]: v }))), [base]);
}
/** Does the curve pass through every ring of the station? (the maths answer, independent of physics) */
export const passesRings = (st, c) => st.rings.every(([x, y]) => Math.abs(curveAt(c, x) - y) < 1e-9);
/** Biggest climb and biggest gap (tiles) along a found route — how hard the correct path is to play. */
export function routeEffort(st, c, motion, route) {
  const ns = [...st.surfaces, ...stationStones(st, c, motion).filter((s) => s.state === 'solid').map((s) => ({ id: `S${s.x}`, x0: s.x - .5, x1: s.x + .5, top: s.y }))];
  let rise = 0, gap = 0;
  for (let i = 1; i < route.length; i++) {
    const a = ns.find((n) => n.id === route[i - 1]), b = ns.find((n) => n.id === route[i]);
    rise = Math.max(rise, b.top - a.top); gap = Math.max(gap, b.x0 > a.x1 ? b.x0 - a.x1 : a.x0 > b.x1 ? a.x0 - b.x1 : 0);
  }
  return { rise, gap };
}

// Station A as a generic station (h = 3, k = 4 fixed; the lever moves a).
const asStation = (st) => ({
  surfaces: [
    { id: 'L', x0: -10, x1: st.perchLeftEdge, top: st.perchTop },
    { id: 'C', x0: st.column.x0, x1: st.column.x1, top: st.column.top },
    { id: 'R', x0: st.perchRightEdge, x1: 20, top: st.perchTop },
  ],
  stoneXs: st.stoneXs, water: st.water, top: st.ceiling, ceiling: [],
});
// Station A in the same shape as B and C (one lever, a), for the Level 2-1 map.
export const STATION_A_LEVEL = Object.freeze({
  ...asStation(STATION_A), id: 'A', a: STATION_A.start, h: STATION_A.h, k: STATION_A.k, levers: ['a'],
  options: { a: STATION_A.options }, start: { a: STATION_A.start }, answer: { a: STATION_A.answer, h: STATION_A.h, k: STATION_A.k },
  rings: STATION_A.rings,
});
export function analyse(a, motion, opts = {}) {
  const st = opts.station ?? STATION_A;
  return analyseStation(asStation(st), { a, h: st.h, k: st.k }, motion, opts);
}

// Short, concrete reason why the shape is what it is (no long-form text).
export function shapeCue(a, prevA) {
  const open = a < 0 ? 'a negatif: lengkung terbuka ke bawah (puncak di atas)' : 'a positif: lengkung terbuka ke atas (titik terendah di bawah)';
  if (prevA === undefined || Math.sign(prevA) !== Math.sign(a)) return open;
  return Math.abs(a) > Math.abs(prevA) ? '|a| lebih besar: lengkung lebih sempit dan curam' : '|a| lebih kecil: lengkung lebih lebar dan landai';
}
