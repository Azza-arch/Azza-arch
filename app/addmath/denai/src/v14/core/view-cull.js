// View culling for the Canvas renderer (World 1 V3, Fasa E).
//
// Measured on Level 1-3 (tests/l3-perf.cjs, iPhone 13 landscape profile, CPU ×4):
// the Canvas renderer issues a drawImage for every object in the scene every
// frame, on-screen or not. The parallax background alone is a Container of
// ~3 400 tiles (≈15 ms/frame), and ~1 150 off-screen terrain tiles cost ≈6 ms.
// Coins, water animation and particles were measured and are NOT the cost.
//
// This skips drawing objects that lie outside the camera view by setting
// `cameraFilter` (Phaser's per-camera exclusion bit). `visible` is never
// touched, so game logic that shows/hides objects keeps working, and the
// picture is pixel-identical: only things the camera cannot see are skipped.
//
// Only plain Images that exist when installViewCull() runs are managed
// (terrain tiles, stone blocks, scenery, background tiles). Sprites (player,
// coins), Text, shapes, Images with a moving physics body and anything created
// later are always drawn. Safety net (Fasa F): every frame, a managed Image
// whose position (or its container's) changed since installation is released
// and always drawn from then on — a tweened plank or lift can never vanish.
// `exclude` / setData('noCull', true) remain available for explicit opt-out.
const CELL = 216;
export function installViewCull(scene, { margin = 162, exclude = [] } = {}) {
  const cam = scene.cameras.main, skip = new Set([...exclude, scene.player, scene.visual]);
  const spaces = new Map(); // scroll factor → { cells: Map<key, obj[]>, all: obj[] }
  const add = (o, sfx, sfy) => {
    if (o.type !== 'Image' || skip.has(o) || o.getData?.('noCull')) return;
    if (o.body && o.body.physicsType === Phaser.Physics.Arcade.DYNAMIC_BODY) return; // e.g. the 1-1 crate
    const id = `${sfx},${sfy}`; let sp = spaces.get(id); if (!sp) spaces.set(id, sp = { sfx, sfy, cells: new Map(), all: [] });
    // getBounds() includes a parent container's transform.
    const b = o.getBounds(), x0 = Math.floor(b.x / CELL), x1 = Math.floor(b.right / CELL), y0 = Math.floor(b.y / CELL), y1 = Math.floor(b.bottom / CELL);
    if (x1 - x0 > 40 || y1 - y0 > 40) return; // very large objects: always drawn
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const k = cx * 4096 + cy; let c = sp.cells.get(k); if (!c) sp.cells.set(k, c = []); c.push(o); }
    sp.all.push(o); o.cameraFilter |= cam.id; o.__culled = true;
    const pc = o.parentContainer; o.__home = [o.x, o.y, pc ? pc.x : 0, pc ? pc.y : 0];
  };
  for (const o of scene.children.list) {
    if (o.type === 'Container') { for (const c of o.list) add(c, o.scrollFactorX, o.scrollFactorY); continue; }
    add(o, o.scrollFactorX, o.scrollFactorY);
  }
  let lastKey = '', stamp = 0, released = 0;
  const moved = (o) => { const h = o.__home, pc = o.parentContainer; return o.x !== h[0] || o.y !== h[1] || (pc ? pc.x !== h[2] || pc.y !== h[3] : false); };
  const sync = () => {
    // Release anything that has moved since installation (checked every frame).
    for (const sp of spaces.values()) for (const o of sp.all) if (!o.__dyn && moved(o)) { o.__dyn = true; o.cameraFilter &= ~cam.id; released++; }
    const v = cam.worldView, key = `${Math.round(v.x / 27)}|${Math.round(v.y / 27)}|${Math.round(v.width)}|${Math.round(v.height)}`;
    if (key === lastKey) return; lastKey = key; stamp++;
    for (const sp of spaces.values()) {
      // An object with scroll factor sf is offset by scroll·(1−sf) on screen.
      const ex = v.x - cam.scrollX * (1 - sp.sfx), ey = v.y - cam.scrollY * (1 - sp.sfy);
      const x0 = Math.floor((ex - margin) / CELL), x1 = Math.floor((ex + v.width + margin) / CELL), y0 = Math.floor((ey - margin) / CELL), y1 = Math.floor((ey + v.height + margin) / CELL);
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const c = sp.cells.get(cx * 4096 + cy); if (c) for (const o of c) o.__cullStamp = stamp; }
      for (const o of sp.all) { if (o.__dyn || o.__cullStamp === stamp) o.cameraFilter &= ~cam.id; else o.cameraFilter |= cam.id; }
    }
  };
  scene.events.on('prerender', sync);
  scene.events.once('shutdown', () => scene.events.off('prerender', sync));
  sync();
  return { sync, count: () => [...spaces.values()].reduce((n, s) => n + s.all.length, 0), released: () => released, stats: () => [...spaces.values()].map((s) => ({ sf: [s.sfx, s.sfy], objects: s.all.length, drawn: s.all.filter((o) => !(o.cameraFilter & cam.id)).length })) };
}
