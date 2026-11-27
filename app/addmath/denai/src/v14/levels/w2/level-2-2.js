// World 2 (Lembah Batu Kapur) · Level 2-2 "Lembah Puncak" — its own page (w2-l2.html).
// Cerun Angin (valley) → Stesen D: catch the ball at the vertex → stone steps rise up the cliff →
// Stesen E: slide the bell to where the jet is highest → the stone gate opens → Stesen F: the fence
// pen that holds all 9 crates → the cargo lift rises → exit towards 2-3.
// Reuses the World 1 player body, motion, landscape builder, Kenney assets (base + Farm fence) and
// Chill Boy unchanged; writes only its own record in the World 2 save key (campaign.js).
import { showVictory } from '../../ui/level-shell.js';
import { responsiveZoom } from '../../core/zoom.js';
import { MOTION } from '../../level.js';
import { audio, SFX } from '../../../audio.js';
import { createPlayer } from '../../core/player.js';
import { updatePlayer } from '../../core/player-motion.js';
import { buildLandscape } from '../../environment.js';
import { TILE as T, formatNum } from './quadratic.js';
import { quad, catchOutcome, bellOutcome, penOutcome, penArea } from './peak.js';
import { buildLevel, LEVEL_ID, variantFor } from './level-2-2-data.js';
import { createW2Store, newRun } from './campaign.js';
import { setupCamera, updateCamera } from './camera.js';
import { trackStart, trackDone } from './track.js';
import { exitGate, stoneColumn, solidColumns, scaffoldLedges, karstBackdrop, buildSecret, SLAB } from './art.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');
const BASE_SCALE = .158;
const FONT = 'ui-monospace,Consolas,"Roboto Mono",monospace';
const controls = { left: false, right: false, up: false, down: false, jump: false, interact: false, restart: false, resetCrate: false, l1Down: false, l1Up: false, l2Down: false, l2Up: false, lock: false };
let L = buildLevel(); // rebuilt in create() for the run's variant (replays: another curve at Station D)
const OY = 1400;
const wx = (x) => x * T, wy = (y) => OY - y * T;
const WORLD = { width: L.width * T, top: Math.floor(wy(L.top)), floor: Math.ceil(wy(L.floor)) };
const store = createW2Store(globalThis.localStorage);
const fmt = (v) => formatNum(v);
const generalForm = ({ a, b, c }) => `y = ${a === -1 ? '−' : a === 1 ? '' : fmt(a)}x² ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}x ${c < 0 ? '−' : '+'} ${fmt(Math.abs(c))}`.replace(/ \+ 0$/, '');
const ACTION = { D: 'Tembak', E: 'Sembur', F: 'Susun peti' };

class Level22 extends Phaser.Scene {
  constructor() { super('LembahPuncak'); }
  preload() {
    this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet('kpp_bg_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet('kpf_atlas', 'assets/kenney-pixel-platformer-farm/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
    for (const [key, path] of Object.entries(this.registry.get('assets'))) this.load.image(key, path);
  }
  create() {
    window.__w2 = { scene: this, controls, L, wx, wy, store };
    this.mode = 'playing'; this.climbing = null; this.climbLockUntil = 0; this.jumpAt = -1000; this.groundedAt = -1000;
    this.solids = this.physics.add.staticGroup(); this.routePlatforms = []; this.ladderZones = [];
    this.physics.world.setBounds(0, WORLD.top, WORLD.width, WORLD.floor + 40 - WORLD.top);
    this.cameras.main.setBackgroundColor('#aee3f5');
    this.textures.get('kpf_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
    if (!this.textures.exists('fx-dot')) { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4); g.generateTexture('fx-dot', 8, 8); g.destroy(); }
    const AB_TERRAIN = L.terrain.map((t) => ({ id: t.id, x: wx(t.x0), y: wy(t.top), width: (t.x1 - t.x0) * T, style: t.style === 'stone' ? 'karst' : undefined }));
    const { tile } = buildLandscape(this, { AB_TERRAIN, SLABS: [], WORLD: { width: WORLD.width, floor: WORLD.floor }, parallaxShift: 60 });
    karstBackdrop(this, WORLD.width, wy(-0.5)); // Lembah Batu Kapur: distant limestone towers (art.js)
    this.tileAt = tile;
    tile(106, wx(0), wy(1) - T, 11); tile(105, wx(1), wy(1) - T, 11);
    // landmark: the Loceng Puncak beam high above the plateau (Station E's rail)
    this.cpFlags = {};
    for (const cp of L.checkpoints.slice(1)) this.cpFlags[cp.id] = this.add.image(wx(cp.x), wy(cp.y), 'kpp_terrain_atlas', 111).setOrigin(.5, 1).setScale(3).setDepth(11);
    exitGate(tile, wx, wy, L.gate); // pillars without caps under a lintel with closed ends (art.js)
    this.add.text(wx(L.gate.x + .5), wy(L.gate.y + 3.5), 'KE 2-3', { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fff2ce', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, .5).setDepth(12); // a plaque on the lintel's face (the top stays free to stand on)
    this.goal = this.add.image(wx(L.goal.x), wy(L.goal.y), 'kpp_terrain_atlas', 112).setOrigin(.5, 1).setScale(4).setDepth(11);
    // ── save / run ──
    this.save = store.load().levels[LEVEL_ID];
    const fresh = new URLSearchParams(location.search).has('baru');
    if (fresh) history.replaceState(null, '', location.pathname);
    this.run = !fresh && this.save.run && !this.save.run.completed ? this.save.run : newRun(LEVEL_ID, variantFor(this.save.completions));
    trackStart(LEVEL_ID, !fresh && !!this.save.run && !this.save.run.completed, this.save.completions);
    L = buildLevel(this.run.variant);
    this.secrets = L.secrets.map((q) => ({ q, s: buildSecret(this, tile, wx, wy, q, this.run.secrets.includes(q.id) ? 'run' : this.save.secrets.includes(q.id)) }));
    this.coinSprites = {};
    for (const c of L.coins) if (!this.run.coins.includes(c.id)) this.coinSprites[c.id] = this.add.image(wx(c.x), wy(c.y), 'kpp_terrain_atlas', 151).setScale(3).setDepth(14);
    // ── stations + mechanisms ──
    this.stations = L.stations.map((s) => this.buildStation(s));
    const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
    createPlayer(this, { SPAWN: { x: wx(cp.x), feet: wy(cp.y) }, BASE_SCALE, reducedMotion, controls });
    for (const [k, name] of [['Q', 'l1Down'], ['Z', 'l2Down'], ['X', 'l2Up'], ['F', 'lock']]) this.input.keyboard.addKey(k).on('down', () => { controls[name] = true; });
    this.input.keyboard.removeCapture(['Q', 'Z', 'X', 'F']);
    for (const st of this.stations) {
      Object.assign(st.c, this.run.levers[st.id]);
      if (this.run.solved[st.id]) { st.solved = true; this.activate(st, true); if (st.id === 'F') { st.packed = true; st.tried.set(st.c.x, 9); } }
      this.draw(st);
    }
    for (const [c, id] of [['after-d', 'D'], ['after-e', 'E']]) if (this.run.solved[id]) this.cpFlags[c]?.setFrame(112);
    this.applyResponsiveZoom();
    { const E = this.stations.find((q) => q.id === 'E'); this.camZones = [{ x0: wx(E.s.leverX - 2), x1: wx(E.ox + E.st.to + 1.5), below: wy(E.oy - 0.5), centreY: wy(E.oy + 4.4) }]; }
    setupCamera(this, WORLD); // per-level camera (camera.js); Station E adds a framing zone in update()
    this.scale.on('resize', () => this.applyResponsiveZoom());
    this.elapsed = this.run.elapsedMs; this.lastSave = 0; this.busy = false;
    this.active = null; this.updateHud(true); this.writeSave();
    if (this.run.variant === 'alt' && !this.run.solved.D) this.cue('Main semula: lengkung baharu di Stesen D. Cari bucunya!');
  }
  applyResponsiveZoom() {
    const cam = this.cameras.main, h = this.scale.height || 700;
    const best = responsiveZoom(h); // the same rule as World 1 (core/zoom.js)
    cam.setZoom(best);
    this.viewUnits = { w: this.scale.width / best, h: h / best };
    this.followOffsetY = Math.round(this.viewUnits.h * .16);
    if (cam._follow) cam.setFollowOffset(-85, this.followOffsetY);
  }
  // ── station visuals ──────────────────────────────────────────────────────
  grid(st, x0, x1, y0, y1) {
    const g = this.add.graphics().setDepth(2.5); g.lineStyle(1, 0xffffff, .38);
    for (let x = x0; x <= x1; x++) g.lineBetween(st.X(x), st.Y(y1), st.X(x), st.Y(y0));
    for (let y = y0; y <= y1; y++) g.lineBetween(st.X(x0), st.Y(y), st.X(x1), st.Y(y));
    const lab = { fontFamily: FONT, fontSize: '13px', color: '#203e36', fontStyle: 'bold', stroke: '#fffdf5', strokeThickness: 4 };
    for (let x = x0; x <= x1; x++) this.add.text(st.X(x), st.Y(y0) + 3, String(x), lab).setOrigin(.5, 0).setDepth(9.7);
    for (let y = y0 + 1; y <= y1; y++) this.add.text(st.X(x0) - 4, st.Y(y), String(y), lab).setOrigin(1, .5).setDepth(2.6);
  }
  buildStation(s) {
    const { st, ox, oy } = s, X = (x) => wx(ox + x), Y = (y) => wy(oy + y);
    const feet = wy(L.terrain.find((t) => s.leverX >= t.x0 && s.leverX <= t.x1).top);
    const lever = this.add.image(wx(s.leverX), feet, 'kpp_terrain_atlas', 64).setOrigin(.5, 1).setScale(3).setDepth(12);
    const screen = this.add.text(wx(s.leverX), feet - 70, '', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#fee481', backgroundColor: '#434a5f', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
    const sign = this.add.text(wx(s.leverX), feet - 104, s.name, { fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12).setVisible(false); // the HUD names the station
    const o = { id: st.id, s, st, ox, oy, X, Y, lever, screen, sign, leverFeet: feet, c: { ...st.start }, solved: false, result: null, trail: this.add.graphics().setDepth(15), fx: this.add.graphics().setDepth(16), parts: [] };
    const pm = L.mechanisms.find((m) => m.station === st.id);
    o.mech = { ...pm, bodies: [], art: [] };
    if (st.id === 'D') {
      this.grid(o, 0, 6, 0, 6);
      this.tileAt(95, X(st.from) - 27, Y(0) - 24, 10.5, 54, 24); // launcher: only the Kenney pipe mouth shows, the ball leaves it at the first root
      o.cupPole = this.add.graphics().setDepth(10.6);
      o.cup = this.add.graphics().setDepth(14.5);
    } else if (st.id === 'E') {
      this.grid(o, 0, 4, 0, 8);
      this.tileAt(95, X(0) - 27, Y(0) - 24, 10.5, 54, 24); // the jet's nozzle mouth at (0, 0), flush with the ground
      // rock beam carrying the bell rail: a floating slab from x = −1 to 5, ends closed (art.js SLAB)
      for (let x = -1; x <= 4; x++) this.tileAt(x === -1 ? SLAB[1] : x === 4 ? SLAB[2] : SLAB[3], X(x), Y(9.6), 8.8);
      this.add.graphics().setDepth(9.6).lineStyle(4, 0x5b3a24, 1).lineBetween(X(-0.2), Y(8.6) + 2, X(4.2), Y(8.6) + 2);
      o.bell = this.add.graphics().setDepth(14.5);
    } else if (st.id === 'F') {
      // a wooden notice board in Kenney's sign style (frame 86 palette) with a paper plan pinned on it:
      // the pen seen from above on a 6 × 6 grid, plus the A(x) bars. Below it, on the ground, the real
      // pen: a Farm fence of length 6 − x (one crate per fence piece) and the 9 crates waiting beside it.
      const cell = 18, W = 6 * cell + 24 + 5 * 32 + 14, H = 6 * cell + 44;
      o.board = { x: X(1) + 14, y: Y(4.4) + 30, cell };
      const bx = o.board.x - 14, by = Y(4.4), g = this.add.graphics().setDepth(9.4);
      for (const px of [bx + 22, bx + W - 34]) g.fillStyle(0x6f3e43, 1).fillRect(px - 3, by + H, 18, Y(0) - by - H).fillStyle(0xcb815e, 1).fillRect(px + 3, by + H, 6, Y(0) - by - H);
      g.fillStyle(0x6f3e43, 1).fillRect(bx, by, W, H).fillStyle(0xcb815e, 1).fillRect(bx + 6, by + 6, W - 12, H - 12).fillStyle(0xf4ac66, 1).fillRect(bx + 6, by + 6, W - 12, 6);
      for (const [nx, ny] of [[bx + 9, by + 15], [bx + W - 15, by + 15], [bx + 9, by + H - 15], [bx + W - 15, by + H - 15]]) g.fillStyle(0x9f5a52, 1).fillRect(nx, ny, 6, 6);
      g.fillStyle(0xfdf4dc, 1).fillRect(o.board.x - 6, o.board.y - 6, W - 28 + 4, 6 * cell + 12); // the pinned paper
      this.add.text(o.board.x + 6 * cell + 22, o.board.y - 4, 'Luas A(x)', { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#6f3e43' }).setDepth(9.5);
      o.pen = this.add.graphics().setDepth(9.5); o.bars = this.add.graphics().setDepth(9.5); o.tried = new Map(); o.barLabels = [];
      o.penX = X(1.6); o.pileX = X(5.4); o.fence = [];
      o.crates = [];
      for (let i = 0; i < 9; i++) o.crates.push(this.add.image(0, 0, 'kpp_terrain_atlas', 26).setOrigin(0, 1).setScale(1).setDepth(11));
    }
    // mechanism art + bodies (inactive state)
    if (pm.blocking.length) for (const b of pm.blocking) { // the stone gate
      const body = this.add.rectangle(wx(b.x0 + .5), wy((b.top + 4) / 2), (b.x1 - b.x0) * T, (b.top - 4) * T, 0, 0);
      this.physics.add.existing(body, true); this.solids.add(body); o.mech.bodies.push(body);
      o.mech.art.push(...stoneColumn(this.tileAt, wx, wy, b.x0, 4, b.top)); // one solid stone column (art.js)
    }
    return o;
  }
  // the solved station's mechanism: steps / lift ledges rise, the gate sinks
  activate(st, quiet = false) {
    const m = st.mech;
    if (m.blocking.length) {
      for (const b of m.bodies) { this.solids.remove(b, true, true); }
      m.bodies = [];
      for (const a of m.art) { if (quiet || reducedMotion) a.destroy(); else this.tweens.add({ targets: a, y: a.y + 7 * T, alpha: 0, duration: 900, ease: 'Quad.in', onComplete: () => a.destroy() }); }
      m.art = [];
    }
    // D: a solid earth staircase up the cliff; F: wooden scaffold ledges on poles (art.js)
    const plank = st.id === 'F';
    for (const p of m.active) {
      const h = plank ? 30 : T, body = this.add.rectangle(wx((p.x0 + p.x1) / 2), wy(p.top) + h / 2, (p.x1 - p.x0) * T, h, 0, 0);
      this.physics.add.existing(body, true); this.solids.add(body); m.bodies.push(body);
    }
    const ground = (x, y) => L.terrain.some((t) => x >= t.x0 && x < t.x1 && y < t.top);
    const groups = plank ? scaffoldLedges(this.tileAt, wx, wy, m.active, 4) : solidColumns(this.tileAt, wx, wy, m.active, 0, ground);
    groups.forEach((imgs, i) => {
      for (const img of imgs) {
        m.art.push(img);
        if (!quiet && !reducedMotion) { const to = img.y; img.y += (m.active[i].top - (plank ? 4 : 0)) * T; img.setAlpha(0); this.tweens.add({ targets: img, y: to, alpha: 1, duration: 700, ease: 'Back.out', delay: 140 * i }); }
      }
    });
  }
  // ── drawing ─────────────────────────────────────────────────────────────
  draw(st) {
    const c = st.c;
    st.screen.setText(st.st.levers.map((n) => `${n} = ${fmt(c[n])}`).join('  '));
    if (st.id === 'D') {
      const g = st.cupPole; g.clear(); g.lineStyle(6, 0x5b3a24, 1).lineBetween(st.X(c.x), st.Y(c.y) + 10, st.X(c.x), st.Y(0));
      const cup = st.cup; cup.clear(); cup.fillStyle(0xd7a21f, 1).fillRect(st.X(c.x) - 22, st.Y(c.y), 44, 10).fillRect(st.X(c.x) - 22, st.Y(c.y) - 14, 6, 14).fillRect(st.X(c.x) + 16, st.Y(c.y) - 14, 6, 14);
      cup.lineStyle(2, 0x5b3a24, 1).strokeRect(st.X(c.x) - 22, st.Y(c.y) - 14, 44, 24);
    } else if (st.id === 'E') {
      const g = st.bell; g.clear(); const bx = st.X(c.x), by = st.Y(8);
      g.lineStyle(3, 0x5b3a24, 1).lineBetween(bx, st.Y(8.6) + 2, bx, by - 30);
      g.fillStyle(st.solved ? 0xfee481 : 0xd7a21f, 1).fillTriangle(bx - 22, by, bx + 22, by, bx, by - 34).fillCircle(bx, by + 4, 6);
      g.lineStyle(2, 0x5b3a24, 1).strokeTriangle(bx - 22, by, bx + 22, by, bx, by - 34);
    } else if (st.id === 'F') {
      const { x: bx, y: by, cell } = st.board, w = c.x, len = 6 - w, g = st.pen; g.clear();
      g.lineStyle(1, 0xd9c9a6, 1); for (let i = 0; i <= 6; i++) { g.lineBetween(bx + i * cell, by, bx + i * cell, by + 6 * cell); g.lineBetween(bx, by + i * cell, bx + 6 * cell, by + i * cell); }
      g.lineStyle(3, 0x8a5a2b, 1).strokeRect(bx, by, len * cell, w * cell); // the 12-unit fence: length 6 − x by width x
      const fit = Math.min(w * len, 9);
      if (st.packed) for (let i = 0; i < fit; i++) g.fillStyle(0xb5713a, 1).fillRect(bx + (i % len) * cell + 3, by + Math.floor(i / len) * cell + 3, cell - 6, cell - 6);
      // A(x) bars for every width tried so far: rise, peak, fall
      const b = st.bars; b.clear(); st.barLabels.forEach((t) => t.destroy()); st.barLabels = [];
      const ox = bx + 6 * cell + 24, base = by + 6 * cell;
      for (const x of [1, 2, 3, 4, 5]) {
        const a = penArea(st.st, x), shown = st.tried.has(x), h = a * 9;
        b.fillStyle(shown ? (a >= 9 ? 0x2e9d4f : 0x2a6fdb) : 0xe4dccb, 1).fillRect(ox + (x - 1) * 32, base - (shown ? h : 4), 24, shown ? h : 4);
        st.barLabels.push(this.add.text(ox + (x - 1) * 32 + 12, base + 1, String(x), { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#203e36' }).setOrigin(.5, 0).setDepth(9.6));
        if (shown) st.barLabels.push(this.add.text(ox + (x - 1) * 32 + 12, base - h - 1, String(a), { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#203e36' }).setOrigin(.5, 1).setDepth(9.6));
      }
      this.placePen(st, false);
    }
    if (st.solved) st.screen.setBackgroundColor('#1f6e3a').setText(`${st.screen.text} ✓`);
  }
  // the ground pen: fence of length 6 − x (Farm frames single/left/right/middle 38–41, one crate wide
  // each), crates in rows of 6 − x (x rows = the pen's width) when packed, the rest left in the pile
  placePen(st, animate) {
    const len = 6 - st.c.x, ground = wy(4), fit = st.packed ? Math.min(st.c.x * len, 9) : 0;
    st.fence.forEach((f) => f.destroy());
    st.fence = Array.from({ length: len }, (_, i) => this.add.image(st.penX + i * 18, ground, 'kpf_atlas', len === 1 ? 38 : i === 0 ? 39 : i === len - 1 ? 40 : 41).setOrigin(0, 1).setDepth(11.2));
    st.crates.forEach((cr, i) => {
      const inPen = i < fit, k = i - fit;
      const x = inPen ? st.penX + (i % len) * 18 : st.pileX + (k % 3) * 18;
      const y = inPen ? ground - Math.floor(i / len) * 18 : ground - Math.floor(k / 3) * 18;
      if (animate && !reducedMotion && inPen) this.tweens.add({ targets: cr, x, y, duration: 380, ease: 'Quad.out', delay: 70 * i });
      else cr.setPosition(x, y);
    });
  }
  // ── actions ─────────────────────────────────────────────────────────────
  step(st, lever, dir) {
    if (st.solved) { this.cue('Stesen ini sudah selesai.'); return; }
    if (this.busy) return;
    const name = st.st.levers[lever]; if (!name) return;
    const opts = st.st.options[name], i = opts.indexOf(st.c[name]), j = Phaser.Math.Clamp(i + dir, 0, opts.length - 1);
    if (i === j) { this.cue(dir < 0 ? `Ini nilai ${name} paling kecil.` : `Ini nilai ${name} paling besar.`); return; }
    st.c[name] = opts[j]; st.result = null; st.packed = false; SFX.jump?.(audio);
    this.run.levers[st.id] = { ...st.c };
    this.draw(st); this.updateHud(true);
  }
  act(st) {
    if (st.solved || this.busy) return;
    if (st.id === 'D') this.fireD(st); else if (st.id === 'E') this.fireE(st); else this.packF(st);
  }
  flight(st, f, from, to, color, stopAt, done) {
    // the ball / water follows the curve; its trail stays visible (an observation, not a punishment)
    this.busy = true; const tr = st.trail; tr.clear(); tr.fillStyle(color, .9);
    const dot = this.add.graphics({ x: st.X(from), y: st.Y(f(from)) }).setDepth(16); dot.fillStyle(color, 1).fillCircle(0, 0, 9); // Canvas renderer: no tints, so a drawn ball
    const end = stopAt ?? to, steps = Math.round((end - from) / .05), dur = reducedMotion ? 0 : 1100 * (end - from) / (to - from);
    for (let i = 0; i <= steps; i += 2) { const x = from + i * .05; tr.fillCircle(st.X(x), st.Y(f(x)), 3); }
    const finish = () => { dot.setPosition(st.X(end), st.Y(f(end))); done(dot); this.busy = false; };
    if (!dur) { finish(); return; }
    SFX.jump?.(audio);
    this.tweens.addCounter({ from, to: end, duration: dur, ease: 'Linear', onUpdate: (tw) => { const x = tw.getValue(); dot.setPosition(st.X(x), st.Y(f(x))); }, onComplete: finish });
  }
  fireD(st) {
    const { a, b, c } = st.st.coeff, f = quad(a, b, c), out = catchOutcome(st.st, st.c);
    st.result = out; this.updateHud(true);
    const onCurve = out.result === 'caught' || out.result === 'bounce';
    this.flight(st, f, st.st.from, st.st.to, 0x203e36, onCurve ? st.c.x : null, (dot) => {
      if (out.result === 'caught') { this.solve(st); this.cue('Bola tertangkap di puncak! Di bucu bola berhenti naik. Tangga batu naik.'); return; }
      if (out.result === 'bounce') {
        this.cue(`Bola melantun: di x = ${fmt(st.c.x)} bola masih ${out.slope > 0 ? 'naik' : 'turun'}, bukan di puncak.`); SFX.incorrect?.(audio);
        if (!reducedMotion) this.tweens.add({ targets: dot, x: dot.x + (out.slope > 0 ? 60 : -60), y: dot.y + 160, alpha: 0, duration: 700, ease: 'Quad.in', onComplete: () => dot.destroy() }); else dot.destroy();
        return;
      }
      dot.destroy(); SFX.incorrect?.(audio);
      this.cue(out.result === 'over' ? `Bola lalu di atas cawan: di x = ${fmt(st.c.x)}, y bola = ${fmt(out.ballY)}.` : `Bola lalu di bawah cawan: di x = ${fmt(st.c.x)}, y bola = ${fmt(out.ballY)}.`);
    });
  }
  fireE(st) {
    const { a, b, c } = st.st.coeff, f = quad(a, b, c), out = bellOutcome(st.st, st.c);
    st.result = out; this.updateHud(true);
    this.flight(st, f, st.st.from, st.st.to, 0x2a8ae0, null, (dot) => {
      dot.destroy();
      if (out.rings) { this.solve(st); this.cue('DING! Air sampai ke loceng di titik tertinggi. Gerbang batu terbuka.'); return; }
      SFX.incorrect?.(audio); this.cue(`Air tidak sampai ke loceng: di x = ${fmt(st.c.x)}, air hanya setinggi ${fmt(out.jetY)} (loceng di 8).`);
    });
  }
  packF(st) {
    const out = penOutcome(st.st, st.c);
    st.result = out; st.packed = true; st.tried.set(st.c.x, out.area); this.draw(st); this.placePen(st, true); this.updateHud(true);
    if (out.full) { this.solve(st); this.cue('Kesemua 9 peti muat! Luas maksimum 9 pada x = 3. Lif kargo naik.'); }
    else { SFX.incorrect?.(audio); this.cue(`Luas ${out.area}: hanya ${out.fit} peti muat, ${out.left} tertinggal. Lif perlukan 9.`); }
  }
  solve(st) {
    st.solved = true; this.run.solved[st.id] = true; this.run.levers[st.id] = { ...st.c };
    const cp = { D: 'after-d', E: 'after-e' }[st.id];
    if (cp) { this.run.checkpointId = cp; this.cpFlags[cp]?.setFrame(112); }
    SFX.correct?.(audio); SFX.checkpoint?.(audio);
    this.activate(st); this.draw(st); this.updateHud(true); this.writeSave();
  }
  // ── HUD ──────────────────────────────────────────────────────────────────
  nearest() { const px = this.player.x; return this.stations.reduce((m, st) => (Math.abs(wx(st.s.leverX) - px) < Math.abs(wx(m.s.leverX) - px) ? st : m)); }
  updateHud(force = false) {
    const st = this.nearest();
    if (!force && st === this.active) return;
    this.active = st;
    const c = st.c, r = st.result;
    $('w2-station').textContent = st.s.name + (st.solved ? ' ✓' : '');
    let eq, meta, why, state;
    if (st.id === 'D') {
      eq = generalForm(st.st.coeff); meta = `Cawan di (${fmt(c.x)}, ${fmt(c.y)})`;
      why = 'Bola hanya kekal dalam cawan di titik tertinggi. Bentuk am y = ax² + bx + c: paksi simetri x = −b/2a.';
      state = st.solved ? `Selesai. ${st.s.lesson}.` : !r ? 'Letak cawan (x, y), kemudian tembak.' : r.result === 'bounce' ? 'Bola melantun keluar: di situ bola masih bergerak menegak.' : r.result === 'caught' ? 'Tertangkap!' : 'Bola tidak menyentuh cawan. Perhatikan jejaknya.';
    } else if (st.id === 'E') {
      eq = 'y = −2x² + 8x'; meta = `Loceng di x = ${fmt(c.x)}, tinggi 8`;
      why = 'Loceng hanya berbunyi jika air sampai ke ketinggian 8. Di mana air paling tinggi?';
      state = st.solved ? `Selesai. ${st.s.lesson}.` : !r ? 'Alihkan loceng, kemudian sembur air.' : `Di x = ${fmt(c.x)} air setinggi ${fmt(r.jetY)}.`;
    } else {
      eq = 'A(x) = x(6 − x)'; meta = `Lebar x = ${fmt(c.x)}, panjang ${fmt(6 - c.x)}, pagar 12`;
      why = 'Pagar 12 unit mengelilingi kandang segi empat tepat. Lif kargo hanya naik dengan kesemua 9 peti di dalam.';
      state = st.solved ? `Selesai. ${st.s.lesson}.` : !r ? 'Pilih lebar x, kemudian susun peti.' : `Luas ${r.area}: ${r.fit} peti muat${r.left ? `, ${r.left} tertinggal` : ''}.`;
    }
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
    const m = updatePlayer(this, time, delta, { controls, audio, SFX, reducedMotion, BASE_SCALE, WATER: [], WATER_Y: WORLD.floor + 200 });
    if (m.respawned) return;
    const px = this.player.x, feet = this.player.body.bottom;
    const st = this.nearest();
    updateCamera(this, this.camZones); // Station E: lift the view so the jet and the bell fit together
    const near = Math.abs(px - wx(st.s.leverX)) < 80 && Math.abs(feet - st.leverFeet) < 8;
    $('w2-tools').classList.toggle('far', !near);
    (this.hud ??= document.querySelector('.w2-hud'))?.classList.toggle('compact', !near);
    if (near && !st.solved) {
      if (controls.l1Down) this.step(st, 0, -1);
      if (m.interact || controls.l1Up) this.step(st, 0, 1);
      if (controls.l2Down) this.step(st, 1, -1);
      if (controls.l2Up) this.step(st, 1, 1);
      if (controls.lock) this.act(st);
    }
    controls.l1Down = controls.l1Up = controls.l2Down = controls.l2Up = controls.lock = false;
    this.updateHud();
    for (const { q, s } of this.secrets) if (s.check(px, feet)) { this.run.secrets.push(q.id); SFX.checkpoint?.(audio); this.cue(`Rahsia ditemui: ${q.label}!`); this.writeSave(); }
    for (const c of L.coins) {
      const spr = this.coinSprites[c.id];
      if (spr && Math.abs(spr.x - px) < 36 && Math.abs(spr.y - (feet - 30)) < 48) { spr.destroy(); delete this.coinSprites[c.id]; this.run.coins.push(c.id); SFX.coin?.(audio); this.updateHud(true); this.writeSave(); }
    }
    if (px > wx(L.goal.x) - 20 && feet <= wy(L.goal.y) + 4 && this.stations.every((s) => s.solved)) { this.finish(); return; }
    if (time - this.lastSave > 5000) { this.lastSave = time; this.writeSave(); }
  }
  finish() {
    this.mode = 'complete'; this.physics.pause();
    const prevBest = store.load().levels[LEVEL_ID].bestMs;
    this.run.completed = true; this.run.checkpointId = 'after-e'; this.writeSave();
    const rec = store.load().levels[LEVEL_ID];
    trackDone(LEVEL_ID, this.run, rec);
    const t = Math.round(this.elapsed / 1000), mmss = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    showVictory({ coins: this.run.coins.length, coinsTotal: L.coins.length, secrets: (this.run.secrets || []).length, secretsTotal: (L.secrets || []).length, ms: this.elapsed, newBest: Number.isFinite(rec.bestMs) && (!Number.isFinite(prevBest) || rec.bestMs < prevBest), bestMs: rec.bestMs }); // World 1's victory card (ui/level-shell.js)
    SFX.victory?.(audio);
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
    callbacks: { preBoot: (g) => g.registry.set('assets', assets) }, scene: [Level22],
  });
  new ResizeObserver(() => { const d = size(); game.scale.setGameSize(d.width, d.height); game.scale.refresh(); }).observe(frame);
  for (const b of document.querySelectorAll('[data-hold],[data-action]')) {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); audio.unlock?.(); controls[b.dataset.hold || b.dataset.action] = true; });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, () => { if (b.dataset.hold) controls[b.dataset.hold] = false; });
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  $('w2-touch').hidden = !touchDevice;
  $('w2-replay').addEventListener('click', () => { $('complete').close(); store.saveRun(newRun(LEVEL_ID, variantFor(store.load().levels[LEVEL_ID].completions)), LEVEL_ID); game.scene.getScene('LembahPuncak').scene.restart(); });
  addEventListener('blur', () => Object.keys(controls).forEach((k) => { controls[k] = false; }));
}
boot().catch((e) => { console.error(e); $('w2-state').textContent = 'Level gagal dimuatkan.'; });
