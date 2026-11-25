// World 2 tile art helpers: the right Kenney frames for each shape, so stacked pieces read as one
// solid object (no "pile of boxes"). Frames checked pixel by pixel in tilemap_packed.png:
//   60–63  tan/stone surface WITHOUT a bottom outline (ground that continues below)
//   40–43  the same surface WITH a bottom outline (a floating slab / lintel)
//   120–123 earth fill with side outlines only (single / left / right / middle)
//   140–143 earth with a bottom outline (lowest row)
//   146    small wooden platform; 89 support pole
// Index order everywhere: single, left end, right end, middle.
const PICK = (set, left, right) => (left && right ? set[0] : left ? set[1] : right ? set[2] : set[3]);
export const SURFACE = [60, 61, 63, 62], SLAB = [40, 41, 43, 42], FILL = [120, 121, 123, 122];

/** Exit gate: two pillars (fill, no caps) under a lintel slab with closed ends. */
export function exitGate(tile, wx, wy, gate, depth = 8.8) {
  for (let y = gate.y; y < gate.y + 3; y++) for (const x of [gate.x - 1, gate.x + 1]) tile(FILL[0], wx(x), wy(y + 1), depth);
  for (let x = gate.x - 1; x <= gate.x + 1; x++) tile(x === gate.x - 1 ? SLAB[1] : x === gate.x + 1 ? SLAB[2] : SLAB[3], wx(x), wy(gate.y + 4), depth);
}

/** A one-tile-wide stone column standing on the ground from yBottom up to yTop (surface cap, fill below). */
export function stoneColumn(tile, wx, wy, x, yBottom, yTop, depth = 9.1) {
  const out = [];
  for (let y = yBottom; y < yTop; y++) out.push(tile(y === yTop - 1 ? SURFACE[0] : FILL[0], wx(x), wy(y + 1), depth));
  return out;
}

/**
 * Solid columns (e.g. a staircase) standing on ground at yBase: pieces [{ x0, x1, top }] in tiles.
 * `solidAt(x, y)` tells whether a neighbouring cell (column x, row starting at y) is solid, so edges get
 * outlines only where the shape really ends. Returns the images per piece (for a rise animation).
 */
export function solidColumns(tile, wx, wy, pieces, yBase, solidAt, depth = 9.6) {
  const filled = (x, y) => pieces.some((p) => x >= p.x0 && x < p.x1 && y >= yBase && y < p.top) || solidAt(x, y);
  return pieces.map((p) => {
    const imgs = [];
    for (let x = p.x0; x < p.x1; x++) for (let y = yBase; y < p.top; y++) {
      const top = y === p.top - 1, left = !filled(x - 1, y), right = !filled(x + 1, y);
      imgs.push(tile(PICK(top ? SURFACE : FILL, left, right), wx(x), wy(y + 1), depth));
    }
    return imgs;
  });
}

/** Wooden ledges on poles (a scaffold lift): plank 146 (top 10/18 of its frame = 30 units) with its top
 *  exactly at the ledge height, and pole 89 from under the plank down to the ground at yBase. */
export function scaffoldLedges(tile, wx, wy, pieces, yBase, depth = 9.6) {
  return pieces.map((p) => {
    const imgs = [];
    for (let x = p.x0; x < p.x1; x++) {
      imgs.push(tile(146, wx(x), wy(p.top), depth + 0.1));
      imgs.push(tile(89, wx(x), wy(p.top) + 30, depth, 54, 24));             // the part under the plank
      for (let y = yBase; y < p.top - 1; y++) imgs.push(tile(89, wx(x), wy(y + 1), depth)); // full rows below
    }
    return imgs;
  });
}

/**
 * Distant limestone towers (karst) for World 2's identity: flat pale silhouettes on the tile grid,
 * drawn with Graphics (the game uses the Canvas renderer, where image tints are unreliable), far
 * behind the forest band (parallax, no collision). A fixed pattern, so every visit looks the same.
 * Each tower has a stepped top (one tile narrower on one side) like the steep karst hills of Perak.
 */
export function karstBackdrop(scene, worldWidth, baseY, { sf = 0.35, depth = 0.6, color = 0x9fd1bb, alpha = 1 } = {}) {
  const T = 54, TOWERS = [[2, 6], [3, 9], [2, 5], [2, 8], [3, 7], [2, 10], [3, 6], [2, 8]];
  const g = scene.add.graphics().setScrollFactor(sf, 1).setDepth(depth);
  g.fillStyle(color, alpha);
  const span = worldWidth * sf + 1600;
  for (let x = -200, i = 0; x < span; i++) {
    const [w, h] = TOWERS[i % TOWERS.length], step = i % 2 ? 0 : 1; // which side steps down
    g.fillRect(x, baseY - (h - 1) * T, w * T, (h - 1) * T);                 // the body
    g.fillRect(x + (step ? 0 : T / 2), baseY - h * T, w * T - T / 2, T);    // the stepped top
    x += w * T + T * (3 + (i * 7) % 5); // uneven gaps: 3–7 tiles
  }
  return g;
}

/**
 * An optional secret: stone stepping platforms (frame 147, one-way like the station stones; a platform
 * marked `lintel` is already drawn, e.g. the exit gate's top) leading to a limestone gem (frame 67).
 * found: false | true (an earlier run: faint gem) | 'run' (this run: no gem).
 * Returns { gem, check(px, feet) → true once, when the player reaches the gem }.
 */
export function buildSecret(scene, tile, wx, wy, secret, found, depth = 10) {
  const T = 54;
  for (const p of secret.platforms) {
    if (!p.lintel) for (let x = p.x0; x < p.x1 - 1e-9; x++) tile(147, wx(x), wy(p.top), depth);
    const body = scene.add.rectangle(wx((p.x0 + p.x1) / 2), wy(p.top) + 9, (p.x1 - p.x0) * T, 18, 0, 0);
    scene.physics.add.existing(body, true); body.setData('oneWay', true); scene.solids.add(body);
  }
  const gem = scene.add.image(wx(secret.x), wy(secret.y), 'kpp_terrain_atlas', 67).setScale(3).setDepth(14);
  let taken = found === 'run';
  if (taken) gem.setVisible(false);       // found earlier in this same run
  else if (found) gem.setAlpha(.35); // found in an earlier run: a faint gem shows where it was
  else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) scene.tweens.add({ targets: gem, y: gem.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return {
    gem,
    check(px, feet) {
      if (taken || Math.abs(gem.x - px) > 40 || Math.abs(gem.y - (feet - 30)) > 50) return false;
      taken = true; scene.tweens.killTweensOf(gem);
      scene.tweens.add({ targets: gem, y: gem.y - 40, alpha: 0, scale: 4, duration: 500, onComplete: () => gem.destroy() });
      return true;
    },
  };
}
