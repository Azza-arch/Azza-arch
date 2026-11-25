// World 2 (Lembah Batu Kapur) · Level 2-3 "Gerbang Parabola" — its own page (w2-l3.html). Last level of World 2.
// Tebing Sungai → Stesen G: pontoons at the roots hold the chain → pontoon bridge → Stesen H: lower the
// chain until it touches the water exactly once (b² − 4ac = 0) → the bucket fills → drawbridge →
// Gate of Two Seals: P (equation from the roots 2 and 6) and Q ((x − 2)(x − 6) < 0) → the gate opens.
// Reuses the World 1 player body, motion, landscape builder, Kenney assets and Chill Boy unchanged;
// writes only its own record in the World 2 save key (campaign.js).
import { MOTION } from '../../level.js';
import { audio, SFX } from '../../../audio.js';
import { createPlayer } from '../../core/player.js';
import { updatePlayer } from '../../core/player-motion.js';
import { buildLandscape } from '../../environment.js';
import { TILE as T, formatNum } from './quadratic.js';
import { quad } from './peak.js';
import { pontoonOutcome, chainOutcome, sealPOutcome, sealQOutcome } from './roots.js';
import { buildLevel, LEVEL_ID, GATE_MX } from './level-2-3-data.js';
import { createW2Store, newRun } from './campaign.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');
const BASE_SCALE = .158;
const FONT = 'ui-monospace,Consolas,"Roboto Mono",monospace';
const controls = { left: false, right: false, up: false, down: false, jump: false, interact: false, restart: false, resetCrate: false, l1Down: false, l1Up: false, l2Down: false, l2Up: false, lock: false };
const L = buildLevel();
const OY = 1400;
const wx = (x) => x * T, wy = (y) => OY - y * T;
const WORLD = { width: L.width * T, top: Math.floor(wy(L.top)), floor: Math.ceil(wy(L.floor)) };
const store = createW2Store(globalThis.localStorage);
const fmt = (v) => formatNum(v);
const ACTION = { G: 'Pasang ponton', H: 'Uji rantai', P: 'Pasang meterai', Q: 'Pasang meterai' };
const BOARD = 27; // px per unit on the seal boards

class Level23 extends Phaser.Scene {
  constructor() { super('GerbangParabola'); }
  preload() {
    this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('kpp_bg_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
    for (const [key, path] of Object.entries(this.registry.get('assets'))) this.load.image(key, path);
  }
  create() {
    window.__w2 = { scene: this, controls, L, wx, wy, store };
    this.mode = 'playing'; this.climbing = null; this.climbLockUntil = 0; this.jumpAt = -1000; this.groundedAt = -1000;
    this.solids = this.physics.add.staticGroup(); this.routePlatforms = []; this.ladderZones = [];
    this.physics.world.setBounds(0, WORLD.top, WORLD.width, WORLD.floor + 40 - WORLD.top);
    this.cameras.main.setBackgroundColor('#aee3f5');
    if (!this.textures.exists('fx-dot')) { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4); g.generateTexture('fx-dot', 8, 8); g.destroy(); }
    const AB_TERRAIN = L.terrain.map((t) => ({ id: t.id, x: wx(t.x0), y: wy(t.top), width: (t.x1 - t.x0) * T, style: t.style === 'stone' ? 'stone' : undefined }));
    const { tile } = buildLandscape(this, { AB_TERRAIN, SLABS: [], WORLD: { width: WORLD.width, floor: WORLD.floor }, parallaxShift: 60 });
    this.tileAt = tile;
    // water (same wave frames as World 1); falling in → back to the checkpoint
    this.waterTiles = []; this.waterZones = L.waters.map((w) => ({ x0: wx(w.x0), x1: wx(w.x1), top: wy(w.top) }));
    for (const w of this.waterZones) {
      this.add.rectangle(w.x0, w.top + 18, w.x1 - w.x0, WORLD.floor - w.top, 0x3d9be9, .9).setOrigin(0).setDepth(9.4);
      for (let x = w.x0; x < w.x1; x += T) this.waterTiles.push(tile(33, x, w.top, 9.5, Math.min(T, w.x1 - x), T));
    }
    if (!reducedMotion) { let ph = 0; this.time.addEvent({ delay: 650, loop: true, callback: () => { ph ^= 1; this.waterTiles.forEach((t, i) => t.setFrame(((i + ph) & 1) ? 53 : 33)); } }); }
    tile(106, wx(0), wy(1) - T, 11); tile(105, wx(1), wy(1) - T, 11);
    this.cpFlags = {};
    for (const cp of L.checkpoints.slice(1)) this.cpFlags[cp.id] = this.add.image(wx(cp.x), wy(cp.y), 'kpp_terrain_atlas', 111).setOrigin(.5, 1).setScale(3).setDepth(11);
    for (let y = L.gate.y; y < L.gate.y + 3; y++) { tile(40, wx(L.gate.x - 1), wy(y + 1), 8.8); tile(40, wx(L.gate.x + 1), wy(y + 1), 8.8); }
    for (let x = L.gate.x - 1; x <= L.gate.x + 1; x++) tile(42, wx(x), wy(L.gate.y + 4), 8.8);
    this.add.text(wx(L.gate.x + .5), wy(L.gate.y + 4) - 6, 'KE DUNIA 3', { fontFamily: 'Arial, sans-serif', fontSize: '16px', fontStyle: 'bold', color: '#fff2ce', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    this.goal = this.add.image(wx(L.goal.x), wy(L.goal.y), 'kpp_terrain_atlas', 112).setOrigin(.5, 1).setScale(4).setDepth(11);
    // ── save / run ──
    this.save = store.load().levels[LEVEL_ID];
    const fresh = new URLSearchParams(location.search).has('baru');
    if (fresh) history.replaceState(null, '', location.pathname);
    this.run = !fresh && this.save.run && !this.save.run.completed ? this.save.run : newRun(LEVEL_ID);
    this.coinSprites = {};
    for (const c of L.coins) if (!this.run.coins.includes(c.id)) this.coinSprites[c.id] = this.add.image(wx(c.x), wy(c.y), 'kpp_terrain_atlas', 151).setScale(3).setDepth(14);
    // ── mechanisms (inactive state) + stations ──
    this.mechs = {};
    for (const m of L.mechanisms) {
      const o = { ...m, bodies: [], art: [], on: false };
      for (const b of m.blocking) { // the stone gate with two seal lamps
        const body = this.add.rectangle(wx(b.x0 + .5), wy((b.top + 1) / 2), (b.x1 - b.x0) * T, (b.top - 1) * T, 0, 0);
        this.physics.add.existing(body, true); this.solids.add(body); o.bodies.push(body);
        for (let y = 1; y < b.top; y++) o.art.push(this.tileAt(y === b.top - 1 ? 40 : 120, wx(b.x0), wy(y + 1), 9.1));
        o.lamps = { P: this.add.circle(wx(b.x0 + .5), wy(6.5), 11, 0x5a4a3a).setStrokeStyle(3, 0x203e36).setDepth(9.3), Q: this.add.circle(wx(b.x0 + .5), wy(5.3), 11, 0x5a4a3a).setStrokeStyle(3, 0x203e36).setDepth(9.3) };
        o.art.push(o.lamps.P, o.lamps.Q);
      }
      this.mechs[m.key] = o;
    }
    this.stations = L.stations.map((s) => this.buildStation(s));
    const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
    createPlayer(this, { SPAWN: { x: wx(cp.x), feet: wy(cp.y) }, BASE_SCALE, reducedMotion, controls });
    for (const [k, name] of [['Q', 'l1Down'], ['Z', 'l2Down'], ['X', 'l2Up'], ['F', 'lock']]) this.input.keyboard.addKey(k).on('down', () => { controls[name] = true; });
    this.input.keyboard.removeCapture(['Q', 'Z', 'X', 'F']);
    for (const st of this.stations) { Object.assign(st.c, this.run.levers[st.id]); if (this.run.solved[st.id]) st.solved = true; this.draw(st); }
    for (const key of ['G', 'H', 'PQ']) if (this.mechs[key].needs.every((id) => this.run.solved[id])) this.activate(this.mechs[key], true);
    if (this.run.solved.P) this.mechs.PQ.lamps?.P.setFillStyle(0xfee481); if (this.run.solved.Q) this.mechs.PQ.lamps?.Q.setFillStyle(0xfee481);
    for (const [c, id] of [['after-g', 'G'], ['after-h', 'H']]) if (this.run.solved[id]) this.cpFlags[c]?.setFrame(112);
    this.applyResponsiveZoom();
    const cam = this.cameras.main;
    cam.setBounds(0, WORLD.top, WORLD.width, WORLD.floor - WORLD.top);
    cam.startFollow(this.player, true, .14, .16, -85, this.followOffsetY).setDeadzone(0, 150);
    this.scale.on('resize', () => this.applyResponsiveZoom());
    this.elapsed = this.run.elapsedMs; this.lastSave = 0; this.busy = false;
    this.active = null; this.updateHud(true); this.writeSave();
  }
  applyResponsiveZoom() {
    const cam = this.cameras.main, h = this.scale.height || 700;
    let best = null;
    for (let n = 1; n <= 24; n++) { const k = n / 3, view = h / k; if (view < 480 || view > 740) continue; if (!best || Math.abs(view - 610) < Math.abs(h / best - 610)) best = k; }
    if (!best) best = Math.max(1 / 3, Math.round(h / 610 * 3) / 3);
    cam.setZoom(best);
    this.viewUnits = { w: this.scale.width / best, h: h / best };
    this.followOffsetY = Math.round(this.viewUnits.h * .16);
    if (cam._follow) cam.setFollowOffset(-85, this.followOffsetY);
  }
  grid(st, x0, x1, y0, y1) {
    const g = this.add.graphics().setDepth(2.5); g.lineStyle(1, 0xffffff, .38);
    for (let x = x0; x <= x1; x++) g.lineBetween(st.X(x), st.Y(y1), st.X(x), st.Y(y0));
    for (let y = y0; y <= y1; y++) g.lineBetween(st.X(x0), st.Y(y), st.X(x1), st.Y(y));
    const lab = { fontFamily: FONT, fontSize: '13px', color: '#203e36', fontStyle: 'bold' };
    for (let x = x0; x <= x1; x++) this.add.text(st.X(x), st.Y(0) - 18, String(x), lab).setOrigin(.5, 1).setDepth(9.7);
  }
  buildStation(s) {
    const { st, ox, oy } = s;
    const isBoard = st.id === 'P' || st.id === 'Q';
    // stations G and H use 1 unit = 1 tile; the seal boards use BOARD px per unit
    const X = isBoard ? (x) => wx(ox) + x * BOARD : (x) => wx(ox + x);
    const Y = isBoard ? (y) => wy(oy + 2) - y * BOARD : (y) => wy(oy + y);
    const feet = wy(L.terrain.find((t) => s.leverX >= t.x0 && s.leverX <= t.x1).top);
    const lever = this.add.image(wx(s.leverX), feet, 'kpp_terrain_atlas', 64).setOrigin(.5, 1).setScale(3).setDepth(12);
    const screen = this.add.text(wx(s.leverX), feet - 70, '', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#fee481', backgroundColor: '#434a5f', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    const sign = this.add.text(wx(s.leverX), feet - 104, s.name, { fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    const o = { id: st.id, s, st, ox, oy, X, Y, lever, screen, sign, leverFeet: feet, c: { ...st.start }, solved: false, result: null, g: this.add.graphics().setDepth(14.5), fx: this.add.graphics().setDepth(15) };
    if (st.id === 'G' || st.id === 'H') {
      this.grid(o, 0, 6, -1, st.id === 'G' ? 6 : 8);
      // the chain's anchor posts on both banks
      for (const x of [0, 6]) for (let y = 1; y < (st.id === 'G' ? 5 : 11); y++) this.tileAt(89, X(x) - 27, Y(y + 1), 9.2);
    } else {
      const g = this.add.graphics().setDepth(9.4), w = 8 * BOARD, top = Y(6), bottom = Y(-4);
      g.fillStyle(0xfffdf5, .95).fillRect(X(0) - 8, top - 8, w + 16, bottom - top + 16).lineStyle(3, 0x5b3a24, 1).strokeRect(X(0) - 8, top - 8, w + 16, bottom - top + 16);
      g.lineStyle(1, 0xd8cfbb, 1); for (let x = 0; x <= 8; x++) g.lineBetween(X(x), top, X(x), bottom); for (let y = -4; y <= 6; y++) g.lineBetween(X(0), Y(y), X(8), Y(y));
      g.lineStyle(2, 0x203e36, 1).lineBetween(X(0), Y(0), X(8), Y(0));
      for (let x = 0; x <= 8; x += 2) this.add.text(X(x), Y(0) + 2, String(x), { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#203e36' }).setOrigin(.5, 0).setDepth(9.5);
    }
    return o;
  }
  activate(m, quiet = false) {
    if (m.on) return; m.on = true;
    if (m.blocking.length) {
      for (const b of m.bodies) this.solids.remove(b, true, true); m.bodies = [];
      for (const a of m.art) { if (quiet || reducedMotion) a.destroy(); else this.tweens.add({ targets: a, y: a.y + 9 * T, alpha: 0, duration: 1000, ease: 'Quad.in', onComplete: () => a.destroy() }); }
      m.art = [];
    }
    for (const p of m.active) {
      const body = this.add.rectangle(wx((p.x0 + p.x1) / 2), wy(p.top) + 9, (p.x1 - p.x0) * T, 18, 0, 0);
      this.physics.add.existing(body, true); this.solids.add(body); m.bodies.push(body);
      for (let x = p.x0; x < p.x1; x++) {
        const img = m.key === 'G' ? this.add.image(wx(x), wy(p.top), 'kpp_terrain_atlas', 26).setOrigin(0).setScale(3).setDepth(10)  // pontoon crates
          : this.add.image(wx(x), wy(p.top), 'kpp_terrain_atlas', x === p.x0 ? 48 : x + 1 >= p.x1 ? 50 : 49).setOrigin(0).setScale(3).setDepth(10); // drawbridge planks
        if (!quiet && !reducedMotion) { const to = img.y; img.y -= 3 * T; img.setAlpha(0); this.tweens.add({ targets: img, y: to, alpha: 1, duration: 600, ease: 'Back.out', delay: 90 * (x - p.x0) }); }
      }
    }
  }
  // ── drawing ──
  curve(st, f, x0, x1, color, alpha = .95, clip) {
    const g = st.g; let prev = null; g.lineStyle(4, color, alpha);
    for (let x = x0; x <= x1 + 1e-9; x += .05) {
      const y = f(x), ok = clip ? clip(y) : true, p = [st.X(x), st.Y(y)];
      if (prev && ok) g.lineBetween(prev[0], prev[1], p[0], p[1]);
      prev = ok ? p : null;
    }
  }
  draw(st) {
    const c = st.c, g = st.g; g.clear();
    st.screen.setText(st.st.levers.map((n) => `${n} = ${fmt(c[n])}`).join('  '));
    if (st.id === 'G') {
      const f = quad(1, -6, 5);
      this.curve(st, f, 0, 6, 0x5b5b5b, .95, (y) => y >= 0); this.curve(st, f, 0, 6, 0x5b5b5b, .35, (y) => y < 0 && y > -1.2); // under water: faint
      for (const x of [c.kiri, c.kanan]) { const y = f(x), on = Math.abs(y) < 1e-9;
        g.fillStyle(on ? 0x2e9d4f : 0xd7a21f, 1).fillRect(st.X(x) - 20, st.Y(0) - 10, 40, 14).lineStyle(2, 0x203e36, 1).strokeRect(st.X(x) - 20, st.Y(0) - 10, 40, 14);
        if (y > 0) g.lineStyle(2, 0x8a5a2b, 1).lineBetween(st.X(x), st.Y(0) - 10, st.X(x), st.Y(y)); }
    } else if (st.id === 'H') {
      const f = quad(1, -6, c.c);
      this.curve(st, f, 0, 6, 0x5b5b5b, .95, (y) => y >= 0); this.curve(st, f, 0, 6, 0x5b5b5b, .35, (y) => y < 0 && y > -1.2);
      const by = Math.max(f(3), -0.6); // the bucket hangs from the chain's lowest point
      g.fillStyle(st.solved ? 0x2a8ae0 : 0x8a8a8a, 1).fillRect(st.X(3) - 14, st.Y(by) - 4, 28, 22).lineStyle(2, 0x203e36, 1).strokeRect(st.X(3) - 14, st.Y(by) - 4, 28, 22);
      for (const x of [0, 6]) g.fillStyle(0xd7a21f, 1).fillCircle(st.X(x), st.Y(f(x)), 6);
    } else if (st.id === 'P') {
      const f = quad(1, c.b, c.c), out = sealPOutcome(st.st, c);
      this.curve(st, f, 0, 8, 0x2a6fdb, .95, (y) => y >= -4 && y <= 6);
      for (const p of out.at) g.lineStyle(4, p.on ? 0x2e9d4f : 0xd7a21f, 1).strokeCircle(st.X(p.x), st.Y(0), 9);
    } else if (st.id === 'Q') {
      const f = quad(1, -8, 12);
      g.fillStyle(st.solved ? 0x2e9d4f : 0x2a6fdb, .25).fillRect(st.X(c.kiri), st.Y(6), (c.kanan - c.kiri) * BOARD, 10 * BOARD);
      g.lineStyle(4, st.solved ? 0x2e9d4f : 0x2a6fdb, 1).lineBetween(st.X(c.kiri), st.Y(0), st.X(c.kanan), st.Y(0));
      this.curve(st, f, 0, 8, 0x203e36, .95, (y) => y >= -4 && y <= 6);
    }
    if (st.solved) st.sign.setBackgroundColor('#1f6e3a').setText(`${st.s.name} ✓`);
  }
  // ── actions ──
  step(st, lever, dir) {
    if (st.solved) { this.cue('Stesen ini sudah selesai.'); return; }
    const name = st.st.levers[lever]; if (!name) return;
    const opts = st.st.options[name], i = opts.indexOf(st.c[name]), j = Phaser.Math.Clamp(i + dir, 0, opts.length - 1);
    if (i === j) { this.cue(dir < 0 ? `Ini nilai ${name} paling kecil.` : `Ini nilai ${name} paling besar.`); return; }
    st.c[name] = opts[j]; st.result = null; SFX.jump?.(audio);
    this.run.levers[st.id] = { ...st.c };
    this.draw(st); this.updateHud(true);
  }
  act(st) {
    if (st.solved) return;
    let ok = false, msg = '';
    if (st.id === 'G') {
      const r = pontoonOutcome(st.st, st.c); st.result = r; ok = r.holds;
      const bad = [r.left, r.right].find((p) => !p.touches);
      msg = ok ? 'Kedua-dua ponton menyokong rantai di x = 1 dan x = 5. Jambatan ponton terapung!'
        : `Di x = ${fmt(bad.x)}, rantai berada ${bad.chainY > 0 ? `${fmt(bad.chainY)} unit di atas` : `${fmt(-bad.chainY)} unit di bawah`} air: ponton tidak menyokongnya.`;
    } else if (st.id === 'H') {
      const r = chainOutcome(st.st, st.c); st.result = r; ok = r.fills;
      msg = ok ? 'Rantai menyentuh air tepat sekali (b² − 4ac = 0). Baldi penuh, jambatan angkat turun!'
        : r.kind === 'two' ? `Rantai mencecah air di dua tempat (x = ${r.roots.map(fmt).join(' dan ')}): b² − 4ac = ${fmt(r.d)} > 0. Baldi tenggelam.`
        : `Rantai tidak sampai ke air: b² − 4ac = ${fmt(r.d)} < 0, tiada punca nyata. Baldi kosong.`;
    } else if (st.id === 'P') {
      const r = sealPOutcome(st.st, st.c); st.result = r; ok = r.lit;
      const bad = r.at.find((p) => !p.on);
      msg = ok ? 'Meterai Punca menyala: (x − 2)(x − 6) = x² − 8x + 12.' : `Graf tidak melalui punca ${fmt(bad.x)}: di x = ${fmt(bad.x)}, y = ${fmt(bad.y)}.`;
    } else {
      const r = sealQOutcome(st.st, st.c); st.result = r; ok = r.lit;
      msg = ok ? 'Meterai Ketaksamaan menyala: (x − 2)(x − 6) < 0 apabila 2 < x < 6.'
        : r.tooWide ? 'Julat terlalu lebar: sebahagiannya graf berada di atas paksi-x (nilai positif).' : 'Julat terlalu sempit: ada bahagian di bawah paksi-x yang tertinggal.';
    }
    this.cue(msg);
    if (!ok) { SFX.incorrect?.(audio); this.updateHud(true); return; }
    st.solved = true; this.run.solved[st.id] = true; this.run.levers[st.id] = { ...st.c };
    const cp = { G: 'after-g', H: 'after-h' }[st.id];
    if (cp) { this.run.checkpointId = cp; this.cpFlags[cp]?.setFrame(112); }
    if (st.id === 'P' || st.id === 'Q') this.mechs.PQ.lamps?.[st.id]?.setFillStyle(0xfee481);
    SFX.correct?.(audio); SFX.checkpoint?.(audio);
    for (const m of Object.values(this.mechs)) if (!m.on && m.needs.every((id) => this.run.solved[id])) { this.activate(m); if (m.key === 'PQ') this.cue('Kedua-dua meterai menyala. Gerbang Parabola terbuka!'); }
    this.draw(st); this.updateHud(true); this.writeSave();
  }
  // ── HUD ──
  nearest() { const px = this.player.x; return this.stations.reduce((m, st) => (Math.abs(wx(st.s.leverX) - px) < Math.abs(wx(m.s.leverX) - px) ? st : m)); }
  updateHud(force = false) {
    const st = this.nearest();
    if (!force && st === this.active) return;
    this.active = st;
    const c = st.c, r = st.result; let eq, meta, why, state;
    if (st.id === 'G') {
      eq = 'y = x² − 6x + 5'; meta = `Ponton di x = ${fmt(c.kiri)} dan x = ${fmt(c.kanan)}`;
      why = 'Ponton hanya menyokong rantai di tempat rantai mencecah air (y = 0). Selesaikan x² − 6x + 5 = 0.';
      state = st.solved ? `Selesai: ${st.s.lesson}.` : r ? 'Ponton belum di tempat rantai mencecah air.' : 'Letak dua ponton, kemudian pasang.';
    } else if (st.id === 'H') {
      const d = 36 - 4 * c.c;
      eq = `y = x² − 6x + ${fmt(c.c)}`; meta = `b² − 4ac = 36 − 4(${fmt(c.c)}) = ${fmt(d)}`;
      why = 'Baldi di x = 3 hanya terisi jika rantai menyentuh air tepat sekali.';
      state = st.solved ? `Selesai: ${st.s.lesson}.` : d > 0 ? 'b² − 4ac > 0: rantai mencecah air di dua tempat.' : d < 0 ? 'b² − 4ac < 0: rantai tidak sampai ke air.' : 'b² − 4ac = 0: uji rantai!';
    } else if (st.id === 'P') {
      eq = `y = x² ${c.b < 0 ? '−' : '+'} ${fmt(Math.abs(c.b))}x + ${fmt(c.c)}`; meta = 'Punca yang dikehendaki: 2 dan 6';
      why = 'Bina persamaan kuadratik yang puncanya 2 dan 6 (graf melalui kedua-dua bulatan pada paksi-x).';
      state = st.solved ? `Selesai: ${st.s.lesson}.` : 'Ubah b dan c, kemudian pasang meterai.';
    } else {
      eq = '(x − 2)(x − 6) < 0'; meta = `Julat: ${fmt(c.kiri)} < x < ${fmt(c.kanan)}`;
      why = 'Nyalakan bahagian di mana graf berada di bawah paksi-x (nilai negatif).';
      state = st.solved ? `Selesai: ${st.s.lesson}.` : 'Pilih hujung kiri dan kanan julat, kemudian pasang meterai.';
    }
    $('w2-station').textContent = st.s.name + (st.solved ? ' ✓' : '');
    $('w2-eq').textContent = eq; $('w2-vertex').textContent = meta; $('w2-why').textContent = why; $('w2-state').textContent = state;
    const [n1, n2] = st.st.levers;
    $('w2-l1').hidden = !n1; $('w2-l2').hidden = !n2;
    if (n1) { $('w2-l1-name').textContent = n1; $('w2-l1-val').textContent = fmt(c[n1]); }
    if (n2) { $('w2-l2-name').textContent = n2; $('w2-l2-val').textContent = fmt(c[n2]); }
    $('w2-lock').textContent = st.solved ? 'Selesai' : ACTION[st.id];
    $('w2-lock').disabled = st.solved;
    $('w2-keys').textContent = touchDevice ? '' : `Di tuil: Q/E ubah ${n1}${n2 ? `, Z/X ubah ${n2}` : ''}, F ${ACTION[st.id].toLowerCase()}`;
    $('w2-coins').textContent = `${this.run.coins.length}/${L.coins.length}`;
  }
  cue(text) { const el = $('w2-cue'); el.textContent = text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
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
  writeSave() { this.run.elapsedMs = Math.round(this.elapsed); if (!store.saveRun(this.run, LEVEL_ID)) $('w2-save').textContent = 'Simpanan tidak tersedia: kemajuan sesi ini masih boleh dimainkan.'; }
  update(time, delta) {
    if (this.mode !== 'playing') return;
    this.elapsed += delta;
    const m = updatePlayer(this, time, delta, { controls, audio, SFX, reducedMotion, BASE_SCALE, WATER: [], WATER_Y: WORLD.floor });
    if (m.respawned) return;
    const px = this.player.x, feet = this.player.body.bottom;
    const st = this.nearest();
    const near = Math.abs(px - wx(st.s.leverX)) < 80 && Math.abs(feet - st.leverFeet) < 8;
    $('w2-tools').classList.toggle('far', !near);
    if (near && !st.solved) {
      if (controls.l1Down) this.step(st, 0, -1);
      if (m.interact || controls.l1Up) this.step(st, 0, 1);
      if (controls.l2Down) this.step(st, 1, -1);
      if (controls.l2Up) this.step(st, 1, 1);
      if (controls.lock) this.act(st);
    }
    controls.l1Down = controls.l1Up = controls.l2Down = controls.l2Up = controls.lock = false;
    this.updateHud();
    if (this.waterZones.some((w) => px > w.x0 && px < w.x1 && feet > w.top + 20)) { this.cue('Jatuh ke air! Kembali ke checkpoint.'); SFX.fall?.(audio); this.respawn(); return; }
    for (const c of L.coins) {
      const spr = this.coinSprites[c.id];
      if (spr && Math.abs(spr.x - px) < 36 && Math.abs(spr.y - (feet - 30)) < 48) { spr.destroy(); delete this.coinSprites[c.id]; this.run.coins.push(c.id); SFX.coin?.(audio); this.updateHud(true); this.writeSave(); }
    }
    if (px > wx(L.goal.x) - 20 && this.stations.every((s) => s.solved)) { this.finish(); return; }
    if (time - this.lastSave > 5000) { this.lastSave = time; this.writeSave(); }
  }
  finish() {
    this.mode = 'complete'; this.physics.pause();
    const prevBest = store.load().levels[LEVEL_ID].bestMs;
    this.run.completed = true; this.run.checkpointId = 'after-h'; this.writeSave();
    const rec = store.load().levels[LEVEL_ID];
    const t = Math.round(this.elapsed / 1000), mmss = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    $('w2-done-stats').textContent = `Masa ${mmss} · Syiling ${this.run.coins.length}/${L.coins.length}${Number.isFinite(rec.bestMs) && (!Number.isFinite(prevBest) || rec.bestMs < prevBest) ? ' · Rekod baharu!' : ''}`;
    SFX.victory?.(audio);
    $('w2-done').showModal(); $('w2-replay').focus();
  }
}
void GATE_MX;

async function boot() {
  const response = await fetch('assets/manifest.json');
  const assets = Object.fromEntries(Object.entries(await response.json()).filter(([k]) => /^(idle|run|jump|fall)-/.test(k)));
  const frame = $('w2-frame');
  const size = () => ({ width: Math.max(1, Math.round(frame.clientWidth)), height: Math.max(1, Math.round(frame.clientHeight)) });
  const game = new Phaser.Game({
    type: Phaser.CANVAS, parent: 'w2-game', ...size(), backgroundColor: '#aee3f5', banner: false, audio: { noAudio: true },
    render: { antialias: true, roundPixels: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
    callbacks: { preBoot: (g) => g.registry.set('assets', assets) }, scene: [Level23],
  });
  new ResizeObserver(() => { const d = size(); game.scale.setGameSize(d.width, d.height); game.scale.refresh(); }).observe(frame);
  for (const b of document.querySelectorAll('[data-hold],[data-action]')) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); audio.unlock?.(); controls[b.dataset.hold || b.dataset.action] = true; });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, () => { if (b.dataset.hold) controls[b.dataset.hold] = false; });
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  $('w2-touch').hidden = !touchDevice;
  $('w2-replay').addEventListener('click', () => { $('w2-done').close(); store.saveRun(newRun(LEVEL_ID), LEVEL_ID); game.scene.getScene('GerbangParabola').scene.restart(); });
  addEventListener('blur', () => Object.keys(controls).forEach((k) => { controls[k] = false; }));
}
boot().catch((e) => { console.error(e); $('w2-state').textContent = 'Level gagal dimuatkan.'; });
