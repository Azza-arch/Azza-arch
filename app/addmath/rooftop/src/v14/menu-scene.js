// V13 main-menu scenery — isolated <canvas> renderer (zero Phaser
// dependency, zero shared CSS selectors; see presentation.css's
// .menu-canvas comment for why this architecture replaced the earlier
// DOM/CSS layer stack).
//
// Every frame below was identified against the pack's own official sheet
// (assets/kenney-pixel-platformer/Preview.png) and by rendering each
// candidate tile_XXXX.png individually before using it — not guessed:
//
//   Grass top:        tile_0001 (left edge) / 0002 or 0022 (mid) / 0003 (right edge)
//   Soil fill:         tile_0004 / 0005 (mid), tile_0120 / 0121 (left/right edge wall)
//   Broad canopy:      tile_0017/0018/0019 (top row), 0037/0038/0039 (mid row,
//                      repeated to widen it), 0057/0058/0059 (bottom row) —
//                      this is the EXACT assembly sceneryTree() already uses
//                      in the real playable map (environment.js), just
//                      widened (5 cols instead of 3) so it reads as a broad
//                      mass instead of a cube.
//   Trunk:             tile_0136 (plain), tile_0137 (trunk with a small
//                      branch stub) — confirmed by rendering the 130-149
//                      range: 136/137/138 are the only trunk-with-branch
//                      pieces in this pack.
//   Small leaf cluster (branch tip): tile_0016 (a standalone round bush
//                      blob, confirmed NOT part of the big-canopy assembly
//                      — it's its own single-tile bush).
//   Low bushes:        tile_0124 / 0125 (kpp_bush_a / kpp_bush_b).
//   Chill Boy:         assets/chill-boy/idle-00.png (same file the actual
//                      game uses).
//
// Fixed-resolution composition (REF_W x REF_H), stretched to fill its
// container via CSS — a deliberate, scoped tradeoff for a static
// one-screenshot menu, not an oversight.

const REF_W = 1366, REF_H = 650;
const BASE = 'assets/kenney-pixel-platformer/Tiles/';
const TILE = 48; // on-canvas size per 18px-native terrain/canopy/trunk tile

const IMG = {
  cloudsSky: 'assets/kenney/backgrounds/background_clouds.png',
  edgeL: BASE + 'tile_0001.png',
  midA: BASE + 'tile_0002.png',
  midB: BASE + 'tile_0022.png',
  edgeR: BASE + 'tile_0003.png',
  fillA: BASE + 'tile_0004.png',
  fillB: BASE + 'tile_0005.png',
  fillL: BASE + 'tile_0120.png',
  fillR: BASE + 'tile_0121.png',
  canTL: BASE + 'tile_0017.png', canTM: BASE + 'tile_0018.png', canTR: BASE + 'tile_0019.png',
  canML: BASE + 'tile_0037.png', canMM: BASE + 'tile_0038.png', canMR: BASE + 'tile_0039.png',
  canBL: BASE + 'tile_0057.png', canBM: BASE + 'tile_0058.png', canBR: BASE + 'tile_0059.png',
  trunk: BASE + 'tile_0136.png',
  trunkBranch: BASE + 'tile_0137.png',
  leafTuft: BASE + 'tile_0016.png',
  bushA: BASE + 'tile_0124.png',
  bushB: BASE + 'tile_0125.png',
  chillBoy: 'assets/chill-boy/idle-00.png',
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // missing asset: skip, never fabricate a replacement
    img.src = src;
  });
}

// ONE elevation change, not a staircase of blocks: a wide flat left stand
// (under the title/button) and a wide flat raised stand on the right
// (Chill Boy's ground), joined by a single cliff edge. Each block's own
// first/last column is a real left/right edge tile; every interior column
// is a plain mid tile — no edge tile ever appears except at a block's true
// outer boundary, so there is never a stray internal seam.
const BLOCKS = [
  { c0: 0, c1: 17, top: 440 }, // left stand
  { c0: 17, c1: 29, top: 330 }, // right stand, raised — Chill Boy + tree
];
const BOTTOM = 720;

function drawTerrain(ctx, images) {
  for (const b of BLOCKS) {
    for (let col = b.c0; col < b.c1; col++) {
      const isLeft = col === b.c0, isRight = col === b.c1 - 1;
      const x = col * TILE;
      const topImg = isLeft ? images.edgeL : isRight ? images.edgeR : (col % 2 === 0 ? images.midA : images.midB);
      if (topImg) ctx.drawImage(topImg, x, b.top, TILE, TILE);
      let row = 0;
      for (let y = b.top + TILE; y < BOTTOM; y += TILE, row++) {
        const fillImg = isLeft ? images.fillL : isRight ? images.fillR : ((col + row) % 2 === 0 ? images.fillA : images.fillB);
        if (fillImg) ctx.drawImage(fillImg, x, y, TILE, TILE);
      }
    }
  }
}

// Broad canopy: the same 3-row canopy assembly sceneryTree() uses
// in-world, widened to 5 columns (repeating the mid column) so the
// silhouette reads as a broad mass, not a cube. originX/Y is the top-left
// corner of the canopy block; `size` is the on-canvas size of one 18px
// native tile.
function drawCanopy(ctx, images, originX, originY, size) {
  const cols = 5;
  const rows = [
    [images.canTL, images.canTM, images.canTR],
    [images.canML, images.canMM, images.canMR],
    [images.canBL, images.canBM, images.canBR],
  ];
  for (let r = 0; r < 3; r++) {
    const [left, mid, right] = rows[r];
    for (let c = 0; c < cols; c++) {
      const img = c === 0 ? left : c === cols - 1 ? right : mid;
      if (img) ctx.drawImage(img, originX + c * size, originY + r * size, size, size);
    }
  }
}

// Broad-canopy tree with a branching trunk: canopy (above) sits on a
// plain-trunk column, with one real branch tile (tile_0137, a trunk
// segment with its own branch stub) partway up, capped by a small
// standalone leaf-blob tile (tile_0016) so the branch reads as "holding
// its own small cluster of leaves" — all verified tiles, no fabricated
// pixels, same assembly principle as the trunk+canopy pairing itself.
function drawTree(ctx, images, footX, footY, scale) {
  const size = TILE * scale;
  const canopyW = size * 5, canopyH = size * 3;
  const trunkRows = 3;
  const canopyX = footX - canopyW / 2;
  const canopyY = footY - trunkRows * size - canopyH + size; // canopy bottom overlaps trunk top by one tile
  drawCanopy(ctx, images, canopyX, canopyY, size);
  for (let r = 0; r < trunkRows; r++) {
    const y = footY - size * (r + 1);
    const img = r === 1 && images.trunkBranch ? images.trunkBranch : images.trunk;
    if (img) ctx.drawImage(img, footX - size / 2, y, size, size);
  }
  if (images.leafTuft) {
    // The branch (row r=1) points right in the source art; cap its tip.
    ctx.drawImage(images.leafTuft, footX + size * 0.9, footY - size * 1.9, size * 0.8, size * 0.8);
  }
}

async function paint(canvas) {
  canvas.width = REF_W;
  canvas.height = REF_H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const entries = await Promise.all(Object.entries(IMG).map(async ([key, src]) => [key, await loadImage(src)]));
  const images = Object.fromEntries(entries);

  // Sky: flat, calm, no repeating texture passed off as depth. Two
  // discrete (non-tiled) placements of the pack's own cloud/sky image —
  // restrained accents, not a wallpaper strip.
  ctx.fillStyle = '#aee3f5';
  ctx.fillRect(0, 0, REF_W, REF_H);
  if (images.cloudsSky) {
    ctx.drawImage(images.cloudsSky, 120, 30, 200, 200);
    ctx.drawImage(images.cloudsSky, 760, 10, 170, 170);
  }

  // Foreground terrain: one clean elevation change (see BLOCKS above).
  drawTerrain(ctx, images);

  // Right stand: Chill Boy grounded on the raised block's own surface
  // (top:330), with the broad-canopy tree as the landmark just past him
  // and two low bush tufts for restrained ground cover.
  if (images.bushA) ctx.drawImage(images.bushA, 870, 294, 36, 36);
  if (images.chillBoy) ctx.drawImage(images.chillBoy, 930, 160, 140, 170);
  if (images.bushB) ctx.drawImage(images.bushB, 1080, 294, 36, 36);
  // Kept clear of the gear button (top-right, ~x1300-1366,y18-64) and of
  // Chill Boy's own bounding box — sized so neither collides.
  drawTree(ctx, images, 1190, 330, 0.95);
}

function init() {
  const canvas = document.getElementById('menu-canvas');
  if (!canvas) return;
  paint(canvas);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
