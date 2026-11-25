// World 2 camera, per level. The shared player module (player-motion.js) frames World 1 with a fixed
// "high ground" line (y < 1230 shows more below the player). World 2 maps sit on another vertical
// scale, so each level turns that rule off (camHighY = −∞: the player stays low on screen, the sky and
// the station above stay in view) and can add framing zones: while the player stands inside a zone,
// the camera centre rises to `centreY` so a tall station (a jet and its bell) fits in one view.
//   zones: [{ x0, x1, below, centreY, fixed }] in world units (feet must be above `below`). By default a
//   zone only lifts the view (never below the player's own framing); `fixed` holds the centre at centreY
//   (a station whose water and top must both be in view).
export function setupCamera(scene, WORLD) {
  scene.camHighY = -Infinity;
  const cam = scene.cameras.main;
  cam.setBounds(0, WORLD.top, WORLD.width, WORLD.floor - WORLD.top);
  scene.camTarget = scene.add.zone(scene.player.x, scene.player.y, 1, 1);
  cam.startFollow(scene.camTarget, true, .14, .16, -85, scene.followOffsetY).setDeadzone(0, 150);
}
export function updateCamera(scene, zones = []) {
  const px = scene.player.x, feet = scene.player.body.bottom, cam = scene.cameras.main;
  const z = zones.find((q) => px > q.x0 && px < q.x1 && feet < q.below);
  // the camera centre is target − offset, so add the current offset to put the centre at centreY
  const want = z && z.centreY + cam.followOffset.y, wantY = !z ? scene.player.y : z.fixed ? want : Math.min(scene.player.y, want);
  scene.camTarget.setPosition(px, Phaser.Math.Linear(scene.camTarget.y, wantY, z || Math.abs(scene.camTarget.y - scene.player.y) > 2 ? .08 : 1));
  if (!!z !== scene.camInZone) { scene.camInZone = !!z; cam.setDeadzone(0, z ? 0 : 150); } // no vertical slack while framing
}
