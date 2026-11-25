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
