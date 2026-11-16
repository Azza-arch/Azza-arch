// World 2 · Level 2-1 · Stesen A "Bukaan" — VERTICAL SLICE in a separate test room.
// Loaded only by lab-w2.html. Reuses the World 1 player body, motion, landscape and
// assets unchanged; World 1 code, saves and leaderboard are not touched.
import { MOTION } from '../../level.js';
import { audio, SFX } from '../../../audio.js';
import { createPlayer } from '../../core/player.js';
import { updatePlayer } from '../../core/player-motion.js';
import { buildLandscape } from '../../environment.js';
import { STATION_A as ST, TILE as T, f, stones, ringHits, analyse, formatA, formatNum, shapeCue } from './quadratic.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');
const BASE_SCALE = .158;
const controls = { left: false, right: false, up: false, down: false, jump: false, interact: false, restart: false, resetCrate: false, aDown: false, aUp: false, lock: false };

// Maths → world. Maths origin (0, 0) sits at world (OX, OY); 1 unit = 1 tile = 54.
const OX = 324, OY = 1400;
const wx = (x) => OX + x * T, wy = (y) => OY - y * T;
const WORLD = { width: 1026, top: 860, floor: 1566 };
const WATER_TOP = wy(ST.water);
const SPAWN = { x: wx(-4), feet: wy(ST.perchTop) };
const LEVER_X = wx(-1.5);
const GOAL_X = wx(9);
const FONT = 'ui-monospace,Consolas,"Roboto Mono",monospace';

class LabScene extends Phaser.Scene {
  constructor() { super('w2-lab'); }
  preload() {
    this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('kpp_bg_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
    for (const [key, path] of Object.entries(this.registry.get('assets'))) this.load.image(key, path);
  }
  create() {
    window.__lab = { scene: this, controls, ST, analyse, MOTION, wx, wy };
    this.mode = 'playing'; this.climbing = null; this.climbLockUntil = 0; this.jumpAt = -1000; this.groundedAt = -1000;
    this.solids = this.physics.add.staticGroup(); this.routePlatforms = []; this.ladderZones = [];
    this.physics.world.setBounds(0, WORLD.top, WORLD.width, WORLD.floor + 40 - WORLD.top);
    this.cameras.main.setBackgroundColor('#aee3f5');
    if (!this.textures.exists('fx-dot')) { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4); g.generateTexture('fx-dot', 8, 8); g.destroy(); }
    // Banks and the Pancur nozzle column: ordinary solid terrain from the World 1 builder.
    const AB_TERRAIN = [
      { id: 'bank-left', x: 0, y: wy(ST.perchTop), width: wx(ST.perchLeftEdge) },
      { id: 'pancur', x: wx(ST.column.x0), y: wy(ST.column.top), width: (ST.column.x1 - ST.column.x0) * T, style: 'stone' },
      { id: 'bank-right', x: wx(ST.perchRightEdge), y: wy(ST.perchTop), width: WORLD.width - wx(ST.perchRightEdge) },
    ];
    const { tile } = buildLandscape(this, { AB_TERRAIN, WORLD: { width: WORLD.width, floor: WORLD.floor }, parallaxShift: 60 });
    // Water in both gaps (same wave frames as World 1).
    this.waterTiles = [];
    for (const [a, b] of [[ST.perchLeftEdge, ST.column.x0], [ST.column.x1, ST.perchRightEdge]]) {
      this.add.rectangle(wx(a), WATER_TOP + 18, (b - a) * T, WORLD.floor - WATER_TOP, 0x3d9be9, .9).setOrigin(0).setDepth(9.4);
      for (let x = wx(a); x < wx(b); x += T) this.waterTiles.push(tile(33, x, WATER_TOP, 9.5, Math.min(T, wx(b) - x), T));
    }
    if (!reducedMotion) { let ph = 0; this.time.addEvent({ delay: 650, loop: true, callback: () => { ph ^= 1; this.waterTiles.forEach((t, i) => t.setFrame(((i + ph) & 1) ? 53 : 33)); } }); }
    // Props: lever on its post, goal flag on the far bank, a fence behind spawn.
    tile(106, 0, SPAWN.feet - T, 11); tile(105, T, SPAWN.feet - T, 11);
    this.lever = this.add.image(LEVER_X, SPAWN.feet, 'kpp_terrain_atlas', 64).setOrigin(.5, 1).setScale(3).setDepth(12);
    this.goal = this.add.image(GOAL_X, SPAWN.feet, 'kpp_terrain_atlas', 112).setOrigin(.5, 1).setScale(4).setDepth(11);
    this.drawGrid();
    this.curveG = this.add.graphics().setDepth(15);
    this.ringG = this.add.graphics().setDepth(16);
    this.stoneLayer = [];
    this.ringLabels = ST.rings.map(([x, y]) => this.add.text(wx(x), wy(y) + 24, '', { fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 5, y: 3 } }).setOrigin(.5, 0).setDepth(17));
    this.failTag = this.add.text(0, 0, '', { fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#fff', backgroundColor: '#b3402a', padding: { x: 7, y: 4 }, align: 'center' }).setOrigin(.5, 1).setDepth(30).setVisible(false);
    this.prompt = this.add.text(LEVER_X, SPAWN.feet - 120, '', { fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#fff2ce', backgroundColor: '#203e36', padding: { x: 8, y: 5 }, align: 'center' }).setOrigin(.5, 1).setDepth(40).setVisible(false);
    this.machineScreen = this.add.text(LEVER_X, SPAWN.feet - 70, '', { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#fee481', backgroundColor: '#434a5f', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    createPlayer(this, { SPAWN, BASE_SCALE, reducedMotion, controls });
    // Latch short taps between frames (same approach as createPlayer for jump/interact).
    this.input.keyboard.addKey('Q').on('down', () => { controls.aDown = true; });
    this.input.keyboard.addKey('F').on('down', () => { controls.lock = true; });
    this.input.keyboard.removeCapture(['Q', 'F']);
    this.applyResponsiveZoom();
    const cam = this.cameras.main;
    cam.setBounds(0, WORLD.top, WORLD.width, WORLD.floor - WORLD.top);
    cam.startFollow(this.player, true, .14, .16, -85, this.followOffsetY).setDeadzone(0, 150);
    this.a = ST.start; this.locked = false; this.solved = false; this.attempts = [];
    this.refresh();
    this.scale.on('resize', () => this.applyResponsiveZoom());
  }
  applyResponsiveZoom() {
    // Same rule as World 1 (game.js): zoom n/3 so the view is ~610 world units tall.
    const cam = this.cameras.main, h = this.scale.height || 700;
    let best = null;
    for (let n = 1; n <= 24; n++) { const k = n / 3, view = h / k; if (view < 480 || view > 740) continue; if (!best || Math.abs(view - 610) < Math.abs(h / best - 610)) best = k; }
    if (!best) best = Math.max(1 / 3, Math.round(h / 610 * 3) / 3);
    cam.setZoom(best);
    this.viewUnits = { w: this.scale.width / best, h: h / best };
    this.followOffsetY = Math.round(this.viewUnits.h * .16);
    if (cam._follow) cam.setFollowOffset(-85, this.followOffsetY);
  }
  drawGrid() {
    // Faint grid over the station so "1 unit = 1 tile" can be read directly.
    const g = this.add.graphics().setDepth(2.5);
    g.lineStyle(1, 0xffffff, .35);
    for (let x = 0; x <= 6; x++) g.lineBetween(wx(x), wy(8), wx(x), wy(ST.water));
    for (let y = 0; y <= 8; y++) g.lineBetween(wx(0), wy(y), wx(6), wy(y));
    g.lineStyle(2, 0x203e36, .55).lineBetween(wx(0), wy(0), wx(6), wy(0)); // y = 0
    const lab = { fontFamily: FONT, fontSize: '14px', color: '#203e36', fontStyle: 'bold' };
    for (let x = 0; x <= 6; x++) this.add.text(wx(x), wy(0) + 3, String(x), lab).setOrigin(.5, 0).setDepth(9.6);
    for (let y = 1; y <= 8; y++) this.add.text(wx(0) - 5, wy(y), String(y), lab).setOrigin(1, .5).setDepth(2.6);
    this.add.text(wx(6) + 14, wy(0) + 3, 'x', lab).setOrigin(0, 0).setDepth(9.6);
    this.add.text(wx(0) - 5, wy(8) - 16, 'y', lab).setOrigin(1, .5).setDepth(2.6);
  }
  // ── Pancur Lengkung ──────────────────────────────────────────────────────
  step(dir) {
    const i = ST.options.indexOf(this.a), j = Phaser.Math.Clamp(i + dir, 0, ST.options.length - 1);
    if (j === i) { this.flashCue(dir < 0 ? 'Ini nilai a paling kecil.' : 'Ini nilai a paling besar.'); return; }
    if (this.locked) this.unlock();
    const prev = this.a; this.a = ST.options[j];
    this.lever.setFrame(this.a < 0 ? 66 : 64);
    SFX.jump?.(audio);
    this.flashCue(shapeCue(this.a, prev));
    this.refresh();
  }
  toggleLock() { if (this.locked) this.unlock(); else this.lock(); this.refresh(); }
  lock() {
    this.locked = true;
    const res = analyse(this.a, MOTION);
    this.attempts.push({ a: this.a, success: res.success });
    for (const s of stones(this.a)) {
      if (s.state === 'nozzle') continue;
      if (s.state === 'high') {
        const t = this.add.text(wx(s.x), wy(8.6), `↑ y = ${formatNum(s.y)}`, { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#fff', backgroundColor: '#8a5a2b', padding: { x: 4, y: 2 } }).setOrigin(.5, 0).setDepth(14);
        this.stoneLayer.push(t); continue;
      }
      const img = this.add.image(wx(s.x - .5), wy(s.y), 'kpp_terrain_atlas', 47).setOrigin(0).setScale(3).setDepth(10);
      this.stoneLayer.push(img);
      if (s.state === 'submerged') { img.setAlpha(.35).setTint(0x7fb7e6); if (wy(s.y) > WORLD.floor - 54) img.setY(WORLD.floor - 60); continue; }
      // Collision matches the drawn stone: full tile wide, top edge exactly on the curve point.
      const body = this.add.rectangle(wx(s.x), wy(s.y) + 9, T, 18, 0, 0);
      this.physics.add.existing(body, true); body.setData('oneWay', true).setData('stone', s); this.solids.add(body);
      this.stoneLayer.push(body);
      if (!reducedMotion) { img.setScale(3, .3); this.tweens.add({ targets: img, scaleY: 3, duration: 220, ease: 'Back.out', delay: 60 * s.x }); }
    }
    this.lever.setFrame(65);
    if (!res.success && res.blocked) {
      const b = res.blocked, need = formatNum(Math.round(b.rise * 4) / 4);
      const what = b.to === 'C' ? 'puncak pancur' : `batu (${b.x}, ${formatNum(b.top)})`;
      this.failTag.setText(`Tidak sampai ke ${what}:\nperlu naik ${need} jubin, lompatan maks ≈ 1.7`).setPosition(wx(Math.min(b.x, 4.4)), wy(Math.min(b.top + 1.9, 8.2))).setVisible(true);
    } else this.failTag.setVisible(false);
    this.lastAnalysis = res;
    $('lab-state').textContent = res.success ? 'Laluan terbina. Cuba lalui!' : 'Batu terbina, tetapi laluan terputus. Lihat kenapa, ubah a, cuba lagi.';
  }
  unlock() {
    this.locked = false;
    for (const o of this.stoneLayer) { if (o.body) this.solids.remove(o, true, true); else o.destroy(); }
    this.stoneLayer = []; this.failTag.setVisible(false); this.lever.setFrame(this.a < 0 ? 66 : 64);
    $('lab-state').textContent = 'Lengkung bebas. Ubah a, kemudian kunci.';
  }
  refresh() {
    const a = this.a, g = this.curveG; g.clear();
    // Ghost curve while free; solid line once locked.
    const pts = [];
    for (let x = -0.6; x <= 6.6001; x += 0.05) { const y = f(a, ST.h, ST.k, x); if (y >= ST.water - .3 && y <= 8.8) pts.push([wx(x), wy(y)]); else pts.push(null); }
    const color = this.locked ? (this.lastAnalysis?.success ? 0x2e9d4f : 0xe0662f) : 0x2a6fdb;
    g.lineStyle(this.locked ? 5 : 4, color, this.locked ? .95 : .8);
    for (let i = 1; i < pts.length; i++) {
      if (!pts[i] || !pts[i - 1]) continue;
      if (!this.locked && (i % 4) >= 2) continue; // dashed while free
      g.lineBetween(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
    }
    if (!this.locked) { // ghost stones: outline where stones WILL appear
      g.lineStyle(2, 0x2a6fdb, .7);
      for (const s of stones(a)) if (s.state === 'solid') g.strokeRect(wx(s.x - .5), wy(s.y), T, 18);
    }
    // vertex marker
    g.fillStyle(0x203e36, 1).fillCircle(wx(ST.h), wy(ST.k), 5);
    // rings + their computed point
    const hits = ringHits(a), r = this.ringG; r.clear();
    hits.forEach((h, i) => {
      r.lineStyle(5, h.hit ? 0x2e9d4f : 0xd7a21f, 1).strokeCircle(wx(h.x), wy(h.y), 17);
      if (h.hit) r.fillStyle(0x2e9d4f, .25).fillCircle(wx(h.x), wy(h.y), 17);
      this.ringLabels[i].setText(`x=${h.x}: y = ${formatNum(h.curveY)}`).setBackgroundColor(h.hit ? '#1f6e3a' : '#203e36');
    });
    this.machineScreen.setText(`a = ${formatA(a)}`);
    $('lab-eq').innerHTML = `y = <b>${formatA(a)}</b>(x − 3)² + 4`;
    const tag = `(1−3)² = 4, jadi y = 4a + 4 = 4(${formatA(a)}) + 4 = ${formatNum(4 * a + 4)}`;
    $('lab-why').textContent = `Di cincin x = 1: ${tag}`;
    $('lab-a').textContent = formatA(a);
    $('lab-lock').textContent = this.locked ? 'Buka kunci' : 'Kunci';
    $('lab-lock').setAttribute('aria-pressed', String(this.locked));
  }
  flashCue(text) {
    const el = $('lab-cue'); el.textContent = text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
  // ── hooks the shared player modules call ────────────────────────────────
  syncVisual() { this.visual.setPosition(this.player.x, this.player.body.bottom); }
  resetCrate() {}
  dustBurst(x, y, count = 5) {
    if (reducedMotion) return;
    const e = this.add.particles(x, y, 'fx-dot', { speed: { min: 30, max: 95 }, angle: { min: 200, max: 340 }, scale: { start: .55, end: 0 }, alpha: { start: .5, end: 0 }, tint: 0x9a9a92, lifespan: 380, quantity: count, emitting: false }).setDepth(21);
    e.explode(count); this.time.delayedCall(480, () => e.destroy());
  }
  respawn(x = LEVER_X - 60) {
    const body = this.player.body;
    body.reset(x, SPAWN.feet - MOTION.bodyHeight / 2 - 1); body.setVelocity(0, 0);
    this.climbing = null; this.groundedAt = -1000; this.jumpAt = -1000; this.syncVisual();
  }
  update(time, delta) {
    if (this.mode !== 'playing') return;
    const m = updatePlayer(this, time, delta, { controls, audio, SFX, reducedMotion, BASE_SCALE, WATER: [], WATER_Y: WATER_TOP });
    if (m.respawned) return;
    const near = Math.abs(this.player.x - LEVER_X) < 80 && this.player.body.bottom > SPAWN.feet - 6;
    this.prompt.setVisible(near).setText(touchDevice ? 'Tuil: a − / a +, kemudian Kunci' : 'Q / E ubah a  ·  F kunci');
    $('lab-tools').classList.toggle('far', !near);
    if (near) {
      if (controls.aDown) this.step(-1);
      if (m.interact || controls.aUp) this.step(1);
      if (controls.lock) this.toggleLock();
    }
    controls.aDown = controls.aUp = controls.lock = false;
    if (this.player.body.bottom > WATER_TOP + 20) { // fell in: back to the lever, curve stays as it was
      this.flashCue(this.locked ? 'Jatuh! Batu di laluan itu tidak cukup dekat. Perhatikan bentuknya, ubah a.' : 'Jatuh! Kunci lengkung dahulu supaya batu terbina.');
      this.respawn(); return;
    }
    if (!this.solved && this.player.x > wx(ST.perchRightEdge) + 20 && m.grounded && this.player.body.bottom <= SPAWN.feet + 2) {
      this.solved = true; this.flashCue(`Berjaya! a = ${formatA(this.a)} melalui kedua-dua cincin.`);
      $('lab-state').textContent = 'Stesen A selesai. (Bilik ujian: Level 2-2 dan peta penuh belum dibina.)';
    }
  }
}

async function boot() {
  const response = await fetch('assets/manifest.json');
  const assets = Object.fromEntries(Object.entries(await response.json()).filter(([k]) => /^(idle|run|jump|fall)-/.test(k)));
  const frame = $('lab-frame');
  const size = () => ({ width: Math.max(1, Math.round(frame.clientWidth)), height: Math.max(1, Math.round(frame.clientHeight)) });
  const game = new Phaser.Game({
    type: Phaser.CANVAS, parent: 'lab-game', ...size(), backgroundColor: '#aee3f5', banner: false, audio: { noAudio: true },
    render: { antialias: true, roundPixels: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
    callbacks: { preBoot: (g) => g.registry.set('assets', assets) }, scene: [LabScene],
  });
  new ResizeObserver(() => { const d = size(); game.scale.setGameSize(d.width, d.height); game.scale.refresh(); }).observe(frame);
  // Touch buttons (and mouse): hold for movement, tap for actions.
  for (const b of document.querySelectorAll('[data-hold],[data-action]')) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); audio.unlock?.(); controls[b.dataset.hold || b.dataset.action] = true; });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, () => { if (b.dataset.hold) controls[b.dataset.hold] = false; });
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  $('lab-touch').hidden = !touchDevice;
  addEventListener('blur', () => Object.keys(controls).forEach((k) => { controls[k] = false; }));
}
boot().catch((e) => { console.error(e); $('lab-state').textContent = 'Bilik ujian gagal dimuatkan.'; });
