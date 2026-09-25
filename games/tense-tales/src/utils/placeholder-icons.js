// Phase 1 has no illustrated art yet, so we build simple flat-shape
// "placeholder" icons at runtime instead of shipping emoji or borrowed art.
// Swap these for real illustrations later by replacing the drawing
// functions below (or loading real images through the asset manifest) —
// callers only ever reference the texture keys.

const PLACEHOLDER_ICON_SIZE = 200;

function ensurePlaceholderAssets(scene) {
  createCardFrameTexture(scene);
  createWakeIcon(scene);
  createBreakfastIcon(scene);
  createBusIcon(scene);
  createSchoolIcon(scene);
}

function createCardFrameTexture(scene) {
  const key = 'card-frame';
  if (scene.textures.exists(key)) return;

  const size = 320;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xfbf9ff, 1);
  g.fillRoundedRect(4, 4, size - 8, size - 8, 28);
  g.lineStyle(4, 0xd8ceff, 1);
  g.strokeRoundedRect(4, 4, size - 8, size - 8, 28);
  g.generateTexture(key, size, size);
  g.destroy();
}

function createWakeIcon(scene) {
  const key = 'icon-wake';
  if (scene.textures.exists(key)) return;

  const s = PLACEHOLDER_ICON_SIZE;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // sun
  g.fillStyle(0xffd166, 1);
  g.fillCircle(s * 0.72, s * 0.28, s * 0.14);
  g.lineStyle(4, 0xffd166, 1);
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const cx = s * 0.72;
    const cy = s * 0.28;
    const r1 = s * 0.19;
    const r2 = s * 0.26;
    g.lineBetween(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1, cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
  }

  // bed
  g.fillStyle(0x8c7ae6, 1);
  g.fillRoundedRect(s * 0.12, s * 0.58, s * 0.62, s * 0.24, 10);
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(s * 0.16, s * 0.5, s * 0.2, s * 0.16, 8);
  g.fillStyle(0x5a4bc4, 1);
  g.fillRoundedRect(s * 0.1, s * 0.8, s * 0.66, s * 0.08, 6);

  g.generateTexture(key, s, s);
  g.destroy();
}

function createBreakfastIcon(scene) {
  const key = 'icon-breakfast';
  if (scene.textures.exists(key)) return;

  const s = PLACEHOLDER_ICON_SIZE;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // plate
  g.fillStyle(0xfff6e5, 1);
  g.fillCircle(s * 0.42, s * 0.55, s * 0.3);
  g.lineStyle(3, 0xe4d9c0, 1);
  g.strokeCircle(s * 0.42, s * 0.55, s * 0.3);

  // egg
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(s * 0.36, s * 0.52, s * 0.22, s * 0.16);
  g.fillStyle(0xffd166, 1);
  g.fillCircle(s * 0.38, s * 0.52, s * 0.06);

  // toast
  g.fillStyle(0xd8a15c, 1);
  g.fillRoundedRect(s * 0.52, s * 0.42, s * 0.16, s * 0.2, 4);

  // cup
  g.fillStyle(0x74b9ff, 1);
  g.fillRoundedRect(s * 0.74, s * 0.4, s * 0.16, s * 0.2, 4);
  g.lineStyle(4, 0x74b9ff, 1);
  g.strokeCircle(s * 0.94, s * 0.48, s * 0.05);

  g.generateTexture(key, s, s);
  g.destroy();
}

function createBusIcon(scene) {
  const key = 'icon-bus';
  if (scene.textures.exists(key)) return;

  const s = PLACEHOLDER_ICON_SIZE;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // motion lines (bus is pulling away)
  g.lineStyle(4, 0xa9a4c9, 1);
  g.lineBetween(s * 0.02, s * 0.5, s * 0.14, s * 0.5);
  g.lineBetween(s * 0.02, s * 0.62, s * 0.12, s * 0.62);

  // body
  g.fillStyle(0xffb020, 1);
  g.fillRoundedRect(s * 0.2, s * 0.38, s * 0.64, s * 0.32, 12);
  g.fillStyle(0x2f2b45, 1);
  g.fillRect(s * 0.2, s * 0.38, s * 0.64, s * 0.07);

  // windows
  g.fillStyle(0xdff3ff, 1);
  g.fillRoundedRect(s * 0.28, s * 0.48, s * 0.14, s * 0.1, 3);
  g.fillRoundedRect(s * 0.46, s * 0.48, s * 0.14, s * 0.1, 3);

  // wheels
  g.fillStyle(0x2f2b45, 1);
  g.fillCircle(s * 0.32, s * 0.72, s * 0.06);
  g.fillCircle(s * 0.72, s * 0.72, s * 0.06);

  // clock (missed the bus)
  g.fillStyle(0xffffff, 1);
  g.fillCircle(s * 0.84, s * 0.28, s * 0.14);
  g.lineStyle(3, 0x2f2b45, 1);
  g.strokeCircle(s * 0.84, s * 0.28, s * 0.14);
  g.lineBetween(s * 0.84, s * 0.28, s * 0.84, s * 0.19);
  g.lineBetween(s * 0.84, s * 0.28, s * 0.9, s * 0.3);

  g.generateTexture(key, s, s);
  g.destroy();
}

function createSchoolIcon(scene) {
  const key = 'icon-school';
  if (scene.textures.exists(key)) return;

  const s = PLACEHOLDER_ICON_SIZE;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // building
  g.fillStyle(0xff7675, 1);
  g.fillRoundedRect(s * 0.16, s * 0.46, s * 0.68, s * 0.4, 6);

  // roof
  g.fillStyle(0xb84a49, 1);
  g.fillTriangle(s * 0.1, s * 0.46, s * 0.9, s * 0.46, s * 0.5, s * 0.24);

  // door
  g.fillStyle(0x7a2e2d, 1);
  g.fillRoundedRect(s * 0.44, s * 0.66, s * 0.14, s * 0.2, 4);

  // windows
  g.fillStyle(0xfff6e5, 1);
  g.fillRoundedRect(s * 0.24, s * 0.54, s * 0.12, s * 0.12, 3);
  g.fillRoundedRect(s * 0.66, s * 0.54, s * 0.12, s * 0.12, 3);

  // flag
  g.lineStyle(3, 0x5a4bc4, 1);
  g.lineBetween(s * 0.5, s * 0.24, s * 0.5, s * 0.08);
  g.fillStyle(0x74b9ff, 1);
  g.fillTriangle(s * 0.5, s * 0.08, s * 0.5, s * 0.18, s * 0.68, s * 0.12);

  g.generateTexture(key, s, s);
  g.destroy();
}
