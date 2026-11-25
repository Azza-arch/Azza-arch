// World 2 (Lembah Batu Kapur) · Level 2-1 "Jejak Lengkung" — full map, PREVIEW page only (w2-l1.html).
// Rabung Masuk → Stesen A (a) → Stesen B (h, k, under a limestone overhang) → Stesen C (k, cable
// bridge under a stone arch) → stone gate towards 2-2.
// Reuses the World 1 player body, motion, landscape builder and Kenney assets unchanged. It writes
// only its own save key (campaign.js); World 1 saves and the leaderboard are never touched.
// The geometry comes from level-2-1-data.js, which is generated from the analysed stations.
import { MOTION } from '../../level.js';
import { audio, SFX } from '../../../audio.js';
import { createPlayer } from '../../core/player.js';
import { updatePlayer } from '../../core/player-motion.js';
import { buildLandscape } from '../../environment.js';
import { TILE as T, curveAt, stationStones, analyseStation, passesRings, formatA, formatNum } from './quadratic.js';
import { buildLevel, LEVEL_ID } from './level-2-1-data.js';
import { createW2Store, newRun } from './campaign.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');
const BASE_SCALE = .158;
const FONT = 'ui-monospace,Consolas,"Roboto Mono",monospace';
const controls = { left: false, right: false, up: false, down: false, jump: false, interact: false, restart: false, resetCrate: false, l1Down: false, l1Up: false, l2Down: false, l2Up: false, lock: false };

const L = buildLevel();
const OY = 1400;                                   // world y of global ground y = 0 (same frame as World 1)
const wx = (x) => x * T, wy = (y) => OY - y * T;
const WORLD = { width: L.width * T, top: Math.floor(wy(L.top)), floor: Math.ceil(wy(L.floor)) };
const store = createW2Store(globalThis.localStorage);

// What the player sees going wrong, in words (factors from analyseStation).
const WHY = {
  buried: 'sebahagian lengkung masuk ke dalam batu',
  submerged: 'sebahagian batu tenggelam',
  high: 'batu terlalu tinggi',
  roof: 'batu kapur di atas menghalang lompatan',
  climb: 'terlalu tinggi untuk dipanjat',
  gap: 'celah terlalu jauh',
  loose: 'lengkung tidak melalui kedua-dua cincin, jadi tiada binaan',
};
function equationHtml(s, c) {
  const b = (v, on) => (on ? `<b>${v}</b>` : v);
  const lv = s.st.levers;
  const a = lv.includes('a') ? b(formatA(c.a), true) : (c.a === -1 ? '−' : c.a === 1 ? '' : formatA(c.a));
  const inner = c.h === 0 ? 'x' : `(x − ${b(formatNum(c.h), lv.includes('h'))})`;
  const k = `${c.k < 0 ? '−' : '+'} ${b(formatNum(Math.abs(c.k)), lv.includes('k'))}`;
  return `y = ${a}${c.h === 0 ? 'x' : inner}² ${k}`;
}

class Level21 extends Phaser.Scene {
  constructor() { super('LembahJejak'); }
  preload() {
    this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('kpp_bg_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
    for (const [key, path] of Object.entries(this.registry.get('assets'))) this.load.image(key, path);
  }
  create() {
    window.__w2 = { scene: this, controls, L, wx, wy, store, analyseStation, MOTION };
    this.mode = 'playing'; this.climbing = null; this.climbLockUntil = 0; this.jumpAt = -1000; this.groundedAt = -1000;
    this.solids = this.physics.add.staticGroup(); this.routePlatforms = []; this.ladderZones = [];
    this.physics.world.setBounds(0, WORLD.top, WORLD.width, WORLD.floor + 40 - WORLD.top);
    this.cameras.main.setBackgroundColor('#aee3f5');
    if (!this.textures.exists('fx-dot')) { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4); g.generateTexture('fx-dot', 8, 8); g.destroy(); }
    // ── Ground, limestone overhang / arch, water (all from level-2-1-data.js) ──
    const AB_TERRAIN = L.terrain.map((t) => ({ id: t.id, x: wx(t.x0), y: wy(t.top), width: (t.x1 - t.x0) * T, style: t.style === 'stone' ? 'stone' : undefined }));
    const SLABS = L.slabs.map((r) => ({ id: r.id, x: wx(r.x0), y: Math.max(WORLD.top, wy(r.top)), width: (r.x1 - r.x0) * T, bottom: wy(r.bottom), style: 'ruin' }));
    const { tile } = buildLandscape(this, { AB_TERRAIN, SLABS, WORLD: { width: WORLD.width, floor: WORLD.floor }, parallaxShift: 60 });
    this.tileAt = tile;
    this.waterTiles = [];
    this.waterZones = L.waters.map((w) => ({ x0: wx(w.x0), x1: wx(w.x1), top: wy(w.top) }));
    for (const w of this.waterZones) {
      this.add.rectangle(w.x0, w.top + 18, w.x1 - w.x0, WORLD.floor - w.top, 0x3d9be9, .9).setOrigin(0).setDepth(9.4);
      for (let x = w.x0; x < w.x1; x += T) this.waterTiles.push(tile(33, x, w.top, 9.5, Math.min(T, w.x1 - x), T));
    }
    if (!reducedMotion) { let ph = 0; this.time.addEvent({ delay: 650, loop: true, callback: () => { ph ^= 1; this.waterTiles.forEach((t, i) => t.setFrame(((i + ph) & 1) ? 53 : 33)); } }); }
    // Landmarks from existing Kenney frames: fence at the start, flags at checkpoints, stone gate + flag at the exit.
    tile(106, wx(0), wy(2) - T, 11); tile(105, wx(1), wy(2) - T, 11);
    this.cpFlags = {};
    for (const cp of L.checkpoints.slice(1)) this.cpFlags[cp.id] = this.add.image(wx(cp.x), wy(cp.y), 'kpp_terrain_atlas', 111).setOrigin(.5, 1).setScale(3).setDepth(11);
    for (let y = L.gate.y; y < L.gate.y + 3; y++) { tile(40, wx(L.gate.x - 1), wy(y + 1), 8.8); tile(40, wx(L.gate.x + 1), wy(y + 1), 8.8); }
    for (let x = L.gate.x - 1; x <= L.gate.x + 1; x++) tile(42, wx(x), wy(L.gate.y + 4), 8.8);
    this.goal = this.add.image(wx(L.goal.x), wy(L.goal.y), 'kpp_terrain_atlas', 112).setOrigin(.5, 1).setScale(4).setDepth(11);
    this.add.text(wx(L.gate.x + .5), wy(L.gate.y + 4) - 6, 'KE 2-2', { fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#fff2ce', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    // ── Coins (Kenney coin frame, same as World 1) ──
    this.coinSprites = {};
    // ── Stations ──
    this.stations = L.stations.map((s, i) => this.buildStation(s, i));
    // ── Player, camera, input ──
    this.save = store.load().levels[LEVEL_ID];
    this.run = this.save.run && !this.save.run.completed ? this.save.run : newRun();
    for (const c of L.coins) if (!this.run.coins.includes(c.id)) this.coinSprites[c.id] = this.add.image(wx(c.x), wy(c.y), 'kpp_terrain_atlas', 151).setScale(3).setDepth(14);
    const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
    createPlayer(this, { SPAWN: { x: wx(cp.x), feet: wy(cp.y) }, BASE_SCALE, reducedMotion, controls });
    for (const [k, name] of [['Q', 'l1Down'], ['Z', 'l2Down'], ['X', 'l2Up'], ['F', 'lock']]) this.input.keyboard.addKey(k).on('down', () => { controls[name] = true; });
    this.input.keyboard.removeCapture(['Q', 'Z', 'X', 'F']);
    for (const st of this.stations) { Object.assign(st.c, this.run.levers[st.id]); if (this.run.solved[st.id]) { st.solved = true; this.lock(st, true); } this.draw(st); }
    for (const [cp, id] of [['after-a', 'A'], ['after-b', 'B']]) if (this.run.solved[id]) this.cpFlags[cp]?.setFrame(112);
    this.applyResponsiveZoom();
    const cam = this.cameras.main;
    cam.setBounds(0, WORLD.top, WORLD.width, WORLD.floor - WORLD.top);
    cam.startFollow(this.player, true, .14, .16, -85, this.followOffsetY).setDeadzone(0, 150);
    this.scale.on('resize', () => this.applyResponsiveZoom());
    this.elapsed = this.run.elapsedMs; this.lastSave = 0;
    this.active = null; this.updateHud(true);
    this.writeSave();
  }
  applyResponsiveZoom() {
    // Same rule as World 1 (game.js) and the Station A test room.
    const cam = this.cameras.main, h = this.scale.height || 700;
    let best = null;
    for (let n = 1; n <= 24; n++) { const k = n / 3, view = h / k; if (view < 480 || view > 740) continue; if (!best || Math.abs(view - 610) < Math.abs(h / best - 610)) best = k; }
    if (!best) best = Math.max(1 / 3, Math.round(h / 610 * 3) / 3);
    cam.setZoom(best);
    this.viewUnits = { w: this.scale.width / best, h: h / best };
    this.followOffsetY = Math.round(this.viewUnits.h * .16);
    if (cam._follow) cam.setFollowOffset(-85, this.followOffsetY);
  }
  // ── Station: grid, lever, rings, curve, stones ──────────────────────────
  buildStation(s, index) {
    const { st, ox } = s;
    const X = (x) => wx(ox + x), Y = (y) => wy(y);
    const xs = st.stoneXs, x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1;
    const yTop = Math.min(8, Math.min(...(st.ceiling || []).map((c) => c.y), 8));
    const g = this.add.graphics().setDepth(2.5);
    g.lineStyle(1, 0xffffff, .35);
    for (let x = x0; x <= x1; x++) g.lineBetween(X(x), Y(yTop), X(x), Y(st.water));
    for (let y = Math.ceil(st.water); y <= yTop; y++) g.lineBetween(X(x0), Y(y), X(x1), Y(y));
    const lab = { fontFamily: FONT, fontSize: '13px', color: '#203e36', fontStyle: 'bold' };
    for (let x = x0; x <= x1; x++) this.add.text(X(x), Y(st.water) + 4, String(x), lab).setOrigin(.5, 0).setDepth(9.7);
    const leverFeet = wy(L.terrain.find((t) => s.leverX >= t.x0 && s.leverX <= t.x1).top);
    const lever = this.add.image(wx(s.leverX), leverFeet, 'kpp_terrain_atlas', 64).setOrigin(.5, 1).setScale(3).setDepth(12);
    const screen = this.add.text(wx(s.leverX), leverFeet - 70, '', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#fee481', backgroundColor: '#434a5f', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    const sign = this.add.text(wx(s.leverX), leverFeet - 104, s.name, { fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    const ringLabels = st.rings.map(([x, y]) => this.add.text(X(x), Y(y) + 22, '', { fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 4, y: 2 } }).setOrigin(.5, 0).setDepth(17));
    const failTag = this.add.text(0, 0, '', { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fff', backgroundColor: '#b3402a', padding: { x: 7, y: 4 }, align: 'center' }).setOrigin(.5, 1).setDepth(30).setVisible(false);
    return {
      id: st.id, s, st, ox, index, X, Y, lever, screen, sign, ringLabels, failTag, leverFeet,
      c: { a: st.a, h: st.h, k: st.k, ...st.start }, locked: false, solved: false, layer: [], analysis: null,
      curveG: this.add.graphics().setDepth(15), ringG: this.add.graphics().setDepth(16),
      exitX: wx(ox + st.surfaces.find((q) => q.id === 'R').x0) + 20,
    };
  }
  step(st, lever, dir) {
    if (st.solved) { this.cue('Stesen ini sudah selesai.'); return; }
    const name = st.st.levers[lever]; if (!name) return;
    const opts = st.st.options[name], i = opts.indexOf(st.c[name]), j = Phaser.Math.Clamp(i + dir, 0, opts.length - 1);
    if (i === j) { this.cue(dir < 0 ? `Ini nilai ${name} paling kecil.` : `Ini nilai ${name} paling besar.`); return; }
    if (st.locked) this.unlock(st);
    const prev = st.c[name]; st.c[name] = opts[j];
    SFX.jump?.(audio);
    this.cue(this.shapeCue(name, prev, st.c[name]));
    this.run.levers[st.id] = Object.fromEntries(st.st.levers.map((n) => [n, st.c[n]]));
    this.draw(st); this.updateHud(true);
  }
  shapeCue(name, prev, now) {
    if (name === 'a') return now < 0 === prev < 0 ? (Math.abs(now) > Math.abs(prev) ? '|a| lebih besar: lengkung lebih sempit' : '|a| lebih kecil: lengkung lebih lebar') : now < 0 ? 'a negatif: terbuka ke bawah' : 'a positif: terbuka ke atas';
    if (name === 'h') return now > prev ? 'h bertambah: seluruh lengkung beralih ke kanan' : 'h berkurang: seluruh lengkung beralih ke kiri';
    return now > prev ? 'k bertambah: seluruh lengkung naik' : 'k berkurang: seluruh lengkung turun';
  }
  lock(st, quiet = false) {
    st.locked = true;
    const res = analyseStation(st.st, st.c, MOTION); st.analysis = res;
    for (const s of stationStones(st.st, st.c, MOTION)) {
      if (s.state === 'nozzle') continue;
      if (s.state === 'high') { st.layer.push(this.add.text(st.X(s.x), st.Y(8.6), `↑ y = ${formatNum(s.y)}`, { fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: '#fff', backgroundColor: '#8a5a2b', padding: { x: 4, y: 2 } }).setOrigin(.5, 0).setDepth(14)); continue; }
      const img = this.add.image(st.X(s.x - .5), Math.min(st.Y(s.y), WORLD.floor - 60), 'kpp_terrain_atlas', 47).setOrigin(0).setScale(3).setDepth(10);
      st.layer.push(img);
      if (s.state === 'loose') { // not supported by both rings: it forms for a moment, then drops into the water
        img.setAlpha(.6);
        if (!reducedMotion && !quiet) this.tweens.add({ targets: img, y: WORLD.floor, alpha: 0, duration: 900, ease: 'Quad.in', delay: 250 + 40 * (s.x - st.st.stoneXs[0]) });
        else img.setAlpha(.2);
        continue;
      }
      if (s.state === 'submerged') { img.setAlpha(.35).setTint(0x7fb7e6); if (st.Y(s.y) > WORLD.floor - 54) img.setY(WORLD.floor - 60); continue; }
      if (s.state === 'buried') {
        // inside the rock, or right under it with no room for the player's body: drawn, never stood on
        img.setAlpha(.45).setTint(0x8f8a80).setDepth(9.2);
        const roof = Math.min(...(st.st.ceiling || []).filter((c) => s.x > c.x0 && s.x < c.x1).map((c) => c.y), Infinity);
        if (s.y < roof) st.layer.push(this.add.text(st.X(s.x), st.Y(s.y) + 20, 'sempit', { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#fff', backgroundColor: '#6b5a48', padding: { x: 3, y: 1 } }).setOrigin(.5, 0).setDepth(14));
        continue;
      }
      const body = this.add.rectangle(st.X(s.x), st.Y(s.y) + 9, T, 18, 0, 0);
      this.physics.add.existing(body, true); body.setData('oneWay', true).setData('stone', s); this.solids.add(body);
      st.layer.push(body);
      if (!reducedMotion && !quiet) { img.setScale(3, .3); this.tweens.add({ targets: img, scaleY: 3, duration: 220, ease: 'Back.out', delay: 50 * (s.x - st.st.stoneXs[0]) }); }
    }
    st.lever.setFrame(65);
    st.failTag.setVisible(false);
    if (!res.success && !quiet) {
      const why = res.factors.map((f) => WHY[f]).filter(Boolean);
      const at = res.blocked ? [res.blocked.x, Math.min(res.blocked.top + 1.6, 8)] : [st.st.stoneXs[2], 6];
      st.failTag.setText(`Laluan terputus:\n${why.slice(0, 2).join(';\n')}`).setPosition(st.X(at[0]), st.Y(at[1])).setVisible(true);
    }
    if (!quiet) SFX.ui?.(audio);
    this.draw(st);
  }
  unlock(st) {
    st.locked = false;
    for (const o of st.layer) { if (o.body) this.solids.remove(o, true, true); else o.destroy(); }
    st.layer = []; st.failTag.setVisible(false); st.lever.setFrame(64); st.analysis = null;
    this.draw(st);
  }
  draw(st) {
    const { c, X, Y } = st, s = st.st, g = st.curveG; g.clear();
    const xs = s.stoneXs, from = Math.min(...xs) - .7, to = Math.max(...xs) + .7;
    const pts = [];
    for (let x = from; x <= to + 1e-9; x += .05) { const y = curveAt(c, x); pts.push(y >= s.water - .3 && y <= 8.8 ? [X(x), Y(y)] : null); }
    const color = st.locked ? (st.analysis?.success ? 0x2e9d4f : 0xe0662f) : 0x2a6fdb;
    g.lineStyle(st.locked ? 5 : 4, color, st.locked ? .95 : .8);
    for (let i = 1; i < pts.length; i++) { if (!pts[i] || !pts[i - 1]) continue; if (!st.locked && (i % 4) >= 2) continue; g.lineBetween(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]); }
    if (!st.locked) { g.lineStyle(2, 0x2a6fdb, .7); for (const q of stationStones(s, c, MOTION)) if (q.state === 'solid') g.strokeRect(X(q.x - .5), Y(q.y), T, 18); }
    if (c.k <= 8.8 && c.k >= s.water - .3) g.fillStyle(0x203e36, 1).fillCircle(X(c.h), Y(c.k), 5);
    const r = st.ringG; r.clear();
    s.rings.forEach(([x, y], i) => {
      const cy = curveAt(c, x), hit = Math.abs(cy - y) < 1e-9;
      r.lineStyle(5, hit ? 0x2e9d4f : 0xd7a21f, 1).strokeCircle(X(x), Y(y), 17);
      if (hit) r.fillStyle(0x2e9d4f, .25).fillCircle(X(x), Y(y), 17);
      st.ringLabels[i].setText(`x=${x}: y = ${formatNum(cy)}`).setBackgroundColor(hit ? '#1f6e3a' : '#203e36');
    });
    st.screen.setText(s.levers.map((n) => `${n} = ${n === 'a' ? formatA(c[n]) : formatNum(c[n])}`).join('  '));
    if (st.solved) { st.sign.setBackgroundColor('#1f6e3a').setText(`${st.s.name} ✓`); }
  }
  // ── HUD (HTML) ─────────────────────────────────────────────────────────
  nearest() {
    const px = this.player.x;
    return this.stations.reduce((m, st) => (Math.abs(wx(st.s.leverX) - px) < Math.abs(wx(m.s.leverX) - px) ? st : m));
  }
  updateHud(force = false) {
    const st = this.nearest();
    if (!force && st === this.active) return;
    this.active = st;
    const s = st.st, c = st.c;
    $('w2-station').textContent = st.s.name + (st.solved ? ' ✓' : '');
    $('w2-eq').innerHTML = equationHtml(st.s, c);
    const rings = s.rings.map(([x, y]) => `x = ${x}: y = ${formatNum(curveAt(c, x))}${Math.abs(curveAt(c, x) - y) < 1e-9 ? ' ✓' : ` (cincin di ${formatNum(y)})`}`).join(' · ');
    $('w2-why').textContent = `${rings}. ${st.s.rule}`;
    $('w2-vertex').textContent = `Bucu: (${formatNum(c.h)}, ${formatNum(c.k)})`;
    let state;
    if (st.solved) state = `Selesai. ${st.s.lesson}.`;
    else if (st.locked) state = st.analysis.success ? (stationStones(s, c, MOTION).some((q) => q.state === 'buried') ? 'Laluan terbina. Batu bertanda "sempit" tiada ruang untuk berdiri: guna batu di cincin.' : 'Laluan terbina. Cuba lalui!') : `Laluan terputus: ${st.analysis.factors.map((f) => WHY[f]).join('; ')}. Ubah tuil, cuba lagi.`;
    else state = passesRings(s, c) ? 'Lengkung melalui kedua-dua cincin. Kunci untuk membina batu.' : 'Ubah tuil supaya lengkung melalui kedua-dua cincin, kemudian kunci.';
    $('w2-state').textContent = state;
    // lever buttons for this station
    const [n1, n2] = s.levers;
    $('w2-l1').hidden = !n1; $('w2-l2').hidden = !n2;
    if (n1) { $('w2-l1-name').textContent = n1; $('w2-l1-val').textContent = n1 === 'a' ? formatA(c[n1]) : formatNum(c[n1]); }
    if (n2) { $('w2-l2-name').textContent = n2; $('w2-l2-val').textContent = formatNum(c[n2]); }
    $('w2-lock').textContent = st.solved ? 'Selesai' : st.locked ? 'Buka kunci' : 'Kunci';
    $('w2-lock').setAttribute('aria-pressed', String(st.locked));
    $('w2-lock').disabled = st.solved;
    $('w2-keys').textContent = touchDevice ? '' : `Di tuil: Q/E ubah ${n1}${n2 ? `, Z/X ubah ${n2}` : ''}, F kunci`;
    $('w2-coins').textContent = `${this.run.coins.length}/${L.coins.length}`;
  }
  cue(text) { const el = $('w2-cue'); el.textContent = text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  // ── hooks the shared player modules call ──
  syncVisual() { this.visual.setPosition(this.player.x, this.player.body.bottom); }
  resetCrate() {}
  dustBurst(x, y, count = 5) {
    if (reducedMotion) return;
    const e = this.add.particles(x, y, 'fx-dot', { speed: { min: 30, max: 95 }, angle: { min: 200, max: 340 }, scale: { start: .55, end: 0 }, alpha: { start: .5, end: 0 }, tint: 0x9a9a92, lifespan: 380, quantity: count, emitting: false }).setDepth(21);
    e.explode(count); this.time.delayedCall(480, () => e.destroy());
  }
  respawn() {
    const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
    const body = this.player.body;
    body.reset(wx(cp.x), wy(cp.y) - MOTION.bodyHeight / 2 - 1); body.setVelocity(0, 0);
    this.climbing = null; this.groundedAt = -1000; this.jumpAt = -1000; this.syncVisual();
  }
  writeSave() { this.run.elapsedMs = Math.round(this.elapsed); if (!store.saveRun(this.run)) $('w2-save').textContent = 'Simpanan tidak tersedia: kemajuan sesi ini masih boleh dimainkan.'; }
  update(time, delta) {
    if (this.mode !== 'playing') return;
    this.elapsed += delta;
    const m = updatePlayer(this, time, delta, { controls, audio, SFX, reducedMotion, BASE_SCALE, WATER: [], WATER_Y: WORLD.floor });
    if (m.respawned) return;
    const px = this.player.x, feet = this.player.body.bottom;
    // levers
    const st = this.nearest();
    const near = Math.abs(px - wx(st.s.leverX)) < 80 && Math.abs(feet - st.leverFeet) < 8;
    $('w2-tools').classList.toggle('far', !near);
    if (near && !st.solved) {
      if (controls.l1Down) this.step(st, 0, -1);
      if (m.interact || controls.l1Up) this.step(st, 0, 1);
      if (controls.l2Down) this.step(st, 1, -1);
      if (controls.l2Up) this.step(st, 1, 1);
      if (controls.lock) { st.locked ? this.unlock(st) : this.lock(st); this.updateHud(true); }
    }
    controls.l1Down = controls.l1Up = controls.l2Down = controls.l2Up = controls.lock = false;
    this.updateHud();
    // water: back to the last checkpoint; the curves stay as they were
    if (this.waterZones.some((w) => px > w.x0 && px < w.x1 && feet > w.top + 20)) {
      this.cue('Jatuh ke air! Kembali ke checkpoint. Perhatikan lengkung, ubah tuil.');
      SFX.fall?.(audio); this.respawn(); return;
    }
    // a station is solved when the player stands on its far bank with its locked, valid curve
    for (const s of this.stations) {
      if (!s.solved && s.locked && s.analysis?.success && px > s.exitX && m.grounded && Math.abs(feet - wy(s.st.surfaces.find((q) => q.id === 'R').top)) < 4) {
        s.solved = true; this.run.solved[s.id] = true;
        const cp = { A: 'after-a', B: 'after-b' }[s.id];
        if (cp) { this.run.checkpointId = cp; this.cpFlags[cp]?.setFrame(112); SFX.checkpoint?.(audio); }
        this.cue(`${s.s.name} selesai! ${s.s.lesson}.`); SFX.correct?.(audio);
        this.draw(s); this.updateHud(true); this.writeSave();
      }
    }
    // coins
    for (const c of L.coins) {
      const spr = this.coinSprites[c.id];
      if (spr && Math.abs(spr.x - px) < 36 && Math.abs(spr.y - (feet - 30)) < 48) { spr.destroy(); delete this.coinSprites[c.id]; this.run.coins.push(c.id); SFX.coin?.(audio); this.updateHud(true); this.writeSave(); }
    }
    // finish
    if (px > wx(L.goal.x) - 20 && this.stations.every((s) => s.solved)) { this.finish(); return; }
    if (time - this.lastSave > 5000) { this.lastSave = time; this.writeSave(); }
  }
  finish() {
    this.mode = 'complete'; this.physics.pause();
    const prevBest = store.load().levels[LEVEL_ID].bestMs;
    this.run.completed = true; this.run.checkpointId = 'after-b'; this.writeSave();
    const rec = store.load().levels[LEVEL_ID];
    const t = Math.round(this.elapsed / 1000), mmss = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    $('w2-done-stats').textContent = `Masa ${mmss} · Syiling ${this.run.coins.length}/${L.coins.length}${Number.isFinite(rec.bestMs) && (!Number.isFinite(prevBest) || rec.bestMs < prevBest) ? ' · Rekod baharu!' : ''}`;
    SFX.victory?.(audio);
    $('w2-done').showModal(); $('w2-replay').focus();
  }
}

async function boot() {
  const response = await fetch('assets/manifest.json');
  const assets = Object.fromEntries(Object.entries(await response.json()).filter(([k]) => /^(idle|run|jump|fall)-/.test(k)));
  const frame = $('w2-frame');
  const size = () => ({ width: Math.max(1, Math.round(frame.clientWidth)), height: Math.max(1, Math.round(frame.clientHeight)) });
  const game = new Phaser.Game({
    type: Phaser.CANVAS, parent: 'w2-game', ...size(), backgroundColor: '#aee3f5', banner: false, audio: { noAudio: true },
    render: { antialias: true, roundPixels: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
    callbacks: { preBoot: (g) => g.registry.set('assets', assets) }, scene: [Level21],
  });
  new ResizeObserver(() => { const d = size(); game.scale.setGameSize(d.width, d.height); game.scale.refresh(); }).observe(frame);
  for (const b of document.querySelectorAll('[data-hold],[data-action]')) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); audio.unlock?.(); controls[b.dataset.hold || b.dataset.action] = true; });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, () => { if (b.dataset.hold) controls[b.dataset.hold] = false; });
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  $('w2-touch').hidden = !touchDevice;
  $('w2-replay').addEventListener('click', () => {
    $('w2-done').close();
    const sc = game.scene.getScene('LembahJejak'); store.saveRun({ ...newRun() }); sc.scene.restart();
  });
  addEventListener('blur', () => Object.keys(controls).forEach((k) => { controls[k] = false; }));
}
boot().catch((e) => { console.error(e); $('w2-state').textContent = 'Level gagal dimuatkan.'; });
