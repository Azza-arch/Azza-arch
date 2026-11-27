// World 3 (Kilang & Lombong) — one scene engine for its four level pages (w3-l1 … w3-l4.html).
// The map, the stations and their mechanisms come from maps.js / systems.js (pure, tested); this file
// only draws them with the Kenney Industrial pack (plus base-pack levers, coins and flags), runs the
// levers, and turns a solved station into its mechanism. Reuses the World 1 player body and motion,
// World 2's camera / secret / analytics helpers and Chill Boy unchanged. Saves only its own key.
import { showVictory } from '../../ui/level-shell.js';
import { responsiveZoom } from '../../core/zoom.js';
import { MOTION } from '../../level.js';
import { audio, SFX } from '../../../audio.js';
import { createPlayer } from '../../core/player.js';
import { updatePlayer } from '../../core/player-motion.js';
import { buildLandscape } from '../../environment.js';
import { setupCamera, updateCamera } from '../w2/camera.js';
import { buildSecret } from '../w2/art.js';
import { trackStart, trackDone } from '../w2/track.js';
import { buildLevel, walkwayPieces } from './maps.js';
import { createW3Store, newRun } from './campaign.js';
import { formatNum as fmt, lhsText, systemOutcome, intersectOutcome, plateOutcome, regionOutcome, isolineOutcome, planOutcome, inRegion, curveY, lattice, solves } from './systems.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('touch');
const BASE_SCALE = .158, T = 54, OY = 1400;
const FONT = 'ui-monospace,Consolas,"Roboto Mono",monospace', SANS = 'Arial, sans-serif';
const wx = (x) => x * T, wy = (y) => OY - y * T;
const controls = { left: false, right: false, up: false, down: false, jump: false, interact: false, restart: false, resetCrate: false, l1Down: false, l1Up: false, l2Down: false, l2Up: false, l3Down: false, l3Up: false, lock: false };
// Kenney Industrial frames (checked pixel by pixel in tilemap_packed.png, 16 × 7 frames):
//   16–19 metal-topped ground continuing below · 0–3 the same with a bottom outline (a floating slab)
//   32–35 earth fill with side outlines · 48–51 earth with a bottom outline · 87–90 hazard deck
//   23 support pole · 64 warning lamp. Index order: single, left, right, middle.
const SURF = [16, 17, 19, 18], FILL = [32, 33, 35, 34], BOT = [48, 49, 51, 50], SLAB = [0, 1, 3, 2];
/** The part of the line ax + by = c inside the grid box (two end points, left to right), or null. */
function segInBox(a, b, c, gx) {
  const pts = [];
  if (b) for (const x of [gx.x0, gx.x1]) pts.push([x, (c - a * x) / b]);
  if (a) for (const y of [gx.y0, gx.y1]) pts.push([(c - b * y) / a, y]);
  const inside = pts.filter(([x, y]) => x >= gx.x0 - 1e-9 && x <= gx.x1 + 1e-9 && y >= gx.y0 - 1e-9 && y <= gx.y1 + 1e-9).sort((p, q) => p[0] - q[0] || q[1] - p[1]);
  return inside.length >= 2 ? [inside[0], inside.at(-1)] : null;
}
const PICK = (set, l, r) => (l && r ? set[0] : l ? set[1] : r ? set[2] : set[3]);
const ACTION = { system: 'Buka injap', intersect: 'Pasang pengapit', plate: 'Pasang plat', region: 'Hidupkan kuasa', isoline: 'Turunkan rel', plan: 'Hantar pesanan' };
const COLORS = { ink: 0x203e36, metal: 0x434a5f, glass: 0xdce1e7, water: 0x2cc5f6, mark: 0xe0662f, ok: 0x2e9d4f, rail: 0x5b6378, region: 0x2e9d4f };

/** Boot one World 3 level page. `text` = the page's done-dialog lines etc. */
export function bootLevel(levelId) {
  const store = createW3Store(globalThis.localStorage);
  let L = buildLevel(levelId);
  const WORLD = { width: L.width * T, top: Math.floor(wy(L.top)), floor: Math.ceil(wy(L.floor)) };

  class Level3 extends Phaser.Scene {
    constructor() { super(`W3-${levelId}`); }
    preload() {
      this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
      this.load.spritesheet('kpp_bg_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap-backgrounds_packed.png', { frameWidth: 24, frameHeight: 24 });
      this.load.spritesheet('kpi_atlas', 'assets/kenney-pixel-platformer-industrial/Tilemap/tilemap_packed.png', { frameWidth: 18, frameHeight: 18 });
      for (const [key, path] of Object.entries(this.registry.get('assets'))) this.load.image(key, path);
    }
    create() {
      L = buildLevel(levelId);
      window.__w3 = { scene: this, controls, L, wx, wy, store, solves };
      this.mode = 'playing'; this.climbing = null; this.climbLockUntil = 0; this.jumpAt = -1000; this.groundedAt = -1000;
      this.solids = this.physics.add.staticGroup(); this.routePlatforms = []; this.ladderZones = [];
      this.physics.world.setBounds(0, WORLD.top, WORLD.width, WORLD.floor + 40 - WORLD.top);
      this.cameras.main.setBackgroundColor('#cfdbe4');
      this.textures.get('kpi_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
      if (!this.textures.exists('fx-dot')) { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4); g.generateTexture('fx-dot', 8, 8); g.destroy(); }
      // the base landscape only gives the tile helper here (World 3 draws its own ground and sky)
      const { tile } = buildLandscape(this, { AB_TERRAIN: [], SLABS: [], WORLD: { width: WORLD.width, floor: WORLD.floor }, parallaxShift: 60 });
      this.bgLayer?.setVisible(false);
      this.tileAt = tile;
      this.factoryBackdrop();
      this.drawGround();
      this.drawPits();
      // ── save / run ──
      this.save = store.load().levels[levelId];
      const fresh = new URLSearchParams(location.search).has('baru');
      if (fresh) history.replaceState(null, '', location.pathname);
      const resumed = !fresh && !!this.save.run && !this.save.run.completed;
      this.run = resumed ? this.save.run : newRun(levelId);
      trackStart(levelId, resumed, this.save.completions);
      // ── landmarks: checkpoints, exit gate, goal ──
      this.cpFlags = {};
      for (const cp of L.checkpoints.slice(1)) this.cpFlags[cp.id] = this.add.image(wx(cp.x), wy(cp.y), 'kpp_terrain_atlas', 111).setOrigin(.5, 1).setScale(3).setDepth(11);
      this.exitGate();
      this.goal = this.add.image(wx(L.goal.x), wy(L.goal.y), 'kpp_terrain_atlas', 112).setOrigin(.5, 1).setScale(4).setDepth(11);
      this.coinSprites = {};
      for (const c of L.coins) if (!this.run.coins.includes(c.id)) this.coinSprites[c.id] = this.add.image(wx(c.x), wy(c.y), 'kpp_terrain_atlas', 151).setScale(3).setDepth(14);
      this.secrets = L.secrets.map((q) => ({ q, s: buildSecret(this, tile, wx, wy, q, this.run.secrets.includes(q.id) ? 'run' : this.save.secrets.includes(q.id)) }));
      // ── stations ──
      this.stations = L.stations.map((s) => this.buildStation(s));
      const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
      createPlayer(this, { SPAWN: { x: wx(cp.x), feet: wy(cp.y) }, BASE_SCALE, reducedMotion, controls });
      for (const [k, name] of [['Q', 'l1Down'], ['Z', 'l2Down'], ['X', 'l2Up'], ['C', 'l3Down'], ['V', 'l3Up'], ['F', 'lock']]) this.input.keyboard.addKey(k).on('down', () => { controls[name] = true; });
      this.input.keyboard.removeCapture(['Q', 'Z', 'X', 'C', 'V', 'F']);
      for (const st of this.stations) {
        Object.assign(st.c, this.run.levers[st.id]);
        if (this.run.solved[st.id]) { st.solved = true; st.result = this.outcome(st); if (st.type === 'region') this.power(st, true); else this.activate(st, true); }
        this.draw(st);
      }
      for (const c of L.checkpoints.slice(1)) if (c.needs.every((id) => this.run.solved[id])) this.cpFlags[c.id]?.setFrame(112);
      this.applyResponsiveZoom();
      setupCamera(this, WORLD);
      this.camZones = this.stations.map((st) => st.zone);
      this.scale.on('resize', () => this.applyResponsiveZoom());
      this.elapsed = this.run.elapsedMs; this.lastSave = 0; this.busy = false;
      this.active = null; this.updateHud(true); this.writeSave();
    }
    applyResponsiveZoom() {
      const cam = this.cameras.main, h = this.scale.height || 700;
      const best = responsiveZoom(h); // the same rule as World 1 (core/zoom.js)
      cam.setZoom(best);
      this.viewUnits = { w: this.scale.width / best, h: h / best };
      this.followOffsetY = Math.round(this.viewUnits.h * .16);
      if (cam._follow) cam.setFollowOffset(-85, this.followOffsetY);
    }
    // ── art ──────────────────────────────────────────────────────────────
    itile(frame, x, y, depth = 9, w = T, h = T) { return this.add.image(x, y, 'kpi_atlas', frame).setOrigin(0).setScale(3).setCrop(0, 0, w / 3, h / 3).setDepth(depth); }
    factoryBackdrop() {
      // distant factory: chimneys, tanks and saw-tooth sheds as flat silhouettes (Graphics: the Canvas
      // renderer ignores tints), far behind the play area, with parallax; a fixed pattern
      const far = this.add.graphics().setScrollFactor(.3, 1).setDepth(.6), near = this.add.graphics().setScrollFactor(.55, 1).setDepth(.7);
      const base = wy(-0.5), span = WORLD.width * .6 + 1800;
      far.fillStyle(0xb3c2cf, 1);
      for (let x = -200, i = 0; x < span; i++) {
        const w = 54 * (3 + (i % 3)), h = 54 * (5 + (i * 5) % 4);
        far.fillRect(x, base - h, w, h);
        if (i % 2 === 0) far.fillRect(x + w * .2, base - h - 54 * 3, 30, 54 * 3); // chimney
        if (i % 3 === 1) far.fillCircle(x + w / 2, base - h, w * .35);        // tank dome
        x += w + 54 * (1 + (i * 3) % 3);
      }
      near.fillStyle(0x9eb0bf, 1);
      for (let x = -100, i = 0; x < span; i++) {
        const w = 54 * 4, h = 54 * (2 + (i % 2));
        near.fillRect(x, base - h, w, h);
        for (let k = 0; k < 4; k++) near.fillTriangle(x + k * 54, base - h, x + k * 54 + 54, base - h, x + k * 54 + 54, base - h - 30); // saw-tooth roof
        x += w + 54 * (2 + (i * 5) % 4);
      }
    }
    drawGround() {
      const floor = WORLD.floor, pieces = L.terrain;
      const filled = (x, y) => pieces.some((t) => x >= wx(t.x0) && x < wx(t.x1) && y >= wy(t.top));
      for (const t of pieces) {
        const x0 = wx(t.x0), x1 = wx(t.x1), top = wy(t.top);
        const b = this.add.rectangle((x0 + x1) / 2, (top + floor) / 2, x1 - x0, floor - top, 0, 0);
        this.physics.add.existing(b, true); this.solids.add(b); b.setData('oneWay', false).setData('id', t.id); this.routePlatforms.push(b);
        for (let x = x0; x < x1; x += T) for (let y = top; y < floor; y += T) {
          const l = x === x0 && !filled(x - 1, y), r = x + T >= x1 && !filled(x + T, y);
          this.itile(PICK(y === top ? SURF : y + T >= floor ? BOT : FILL, l, r), x, y, 9, Math.min(T, x1 - x), Math.min(T, floor - y));
        }
      }
    }
    drawPits() {
      this.acid = (L.pits || []).map((p) => ({ x0: wx(p.x0), x1: wx(p.x1), top: wy(p.top) }));
      for (const a of this.acid) {
        const g = this.add.graphics().setDepth(9.4);
        g.fillStyle(0x6fcf4a, .92).fillRect(a.x0, a.top, a.x1 - a.x0, WORLD.floor - a.top).fillStyle(0xc4f27a, 1).fillRect(a.x0, a.top, a.x1 - a.x0, 6);
        if (!reducedMotion) for (let i = 0; i < 4; i++) {
          const b = this.add.image(a.x0 + (a.x1 - a.x0) * (i + .5) / 4, a.top + 60, 'fx-dot').setScale(.7).setAlpha(.8).setDepth(9.45);
          this.tweens.add({ targets: b, y: a.top + 4, alpha: 0, duration: 1300, delay: i * 320, repeat: -1 });
        }
        this.add.image((a.x0 + a.x1) / 2, a.top - 4, 'kpi_atlas', 42).setOrigin(.5, 1).setScale(2).setDepth(9.3); // hazard sign
      }
    }
    exitGate() {
      const g = L.gate;
      for (let y = g.y; y < g.y + 3; y++) for (const x of [g.x - 1, g.x + 1]) this.itile(FILL[0], wx(x), wy(y + 1), 8.8);
      for (let x = g.x - 1; x <= g.x + 1; x++) this.itile(x === g.x - 1 ? SLAB[1] : x === g.x + 1 ? SLAB[2] : SLAB[3], wx(x), wy(g.y + 4), 8.8);
      this.itile(64, wx(g.x), wy(g.y + 5), 8.8); // a warning lamp on top
      this.add.text(wx(g.x + .5), wy(g.y + 3.5), L.next, { fontFamily: SANS, fontSize: '15px', fontStyle: 'bold', color: '#fff2ce', backgroundColor: '#203e36', padding: { x: 6, y: 3 } }).setOrigin(.5).setDepth(12);
    }
    // ── stations ─────────────────────────────────────────────────────────
    groundAt(x) { return L.terrain.find((t) => x >= t.x0 && x <= t.x1)?.top ?? 0; }
    buildStation(s) {
      const { st } = s, feet = wy(this.groundAt(s.leverX)), type = st.type;
      const o = { id: st.id, type, s, st, c: { ...st.start }, solved: false, result: null, leverFeet: feet, parts: [], mech: { bodies: [], art: [] } };
      o.lever = this.add.image(wx(s.leverX), feet, 'kpp_terrain_atlas', 64).setOrigin(.5, 1).setScale(3).setDepth(12);
      o.screen = this.add.text(wx(s.leverX), feet - 70, '', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#fee481', backgroundColor: '#434a5f', padding: { x: 6, y: 3 } }).setOrigin(.5, 1).setDepth(12);
      o.g = this.add.graphics().setDepth(9.6); o.fg = this.add.graphics().setDepth(14.5); o.labels = [];
      let top = this.groundAt(s.leverX) + 4.6;
      if (type === 'system' || type === 'plate') { o.ax = s.area; o.base = this.groundAt(s.area); if (type === 'plate') top = o.base + 8.9; }
      else {
        const grid = st.grid, sx = st.sx ?? st.scale ?? 1, sy = st.scale ?? 1;
        o.X = (u) => wx(s.ox + u * sx); o.Y = (v) => wy(s.oy + v * sy);
        o.gx = { x0: grid.x0 ?? 0, x1: grid.x1, y0: grid.y0 ?? 0, y1: grid.y1 };
        this.gridArt(o); top = s.oy + o.gx.y1 * sy + .6;
      }
      // the camera holds the whole station (and its ground) while the player is near it
      const ground = this.groundAt(s.leverX), x1 = Math.max(s.leverX + 8, (s.mech.x ?? 0) + (s.mech.span ?? 3) + 1, o.X ? (o.X(o.gx.x1) / T) + 1 : 0);
      const bottom = Math.min(ground, o.Y ? (OY - o.Y(o.gx.y0)) / T : ground);
      o.zone = { x0: wx(s.leverX - 2), x1: wx(x1), below: WORLD.floor, centreY: wy((bottom - 1.8 + top) / 2), fixed: true };
      // mechanism in its inactive state (a gate stands)
      for (const b of s.pieces.blocking) {
        const body = this.add.rectangle(wx(b.x0 + .5), wy((b.top + s.mech.base) / 2), (b.x1 - b.x0) * T, (b.top - s.mech.base) * T, 0, 0);
        this.physics.add.existing(body, true); this.solids.add(body); o.mech.bodies.push(body);
        for (let y = s.mech.base; y < b.top; y++) o.mech.art.push(this.itile(y === b.top - 1 ? SURF[0] : FILL[0], wx(b.x0), wy(y + 1), 9.1));
        o.mech.art.push(this.itile(64, wx(b.x0), wy(b.top + 1), 9.1));
      }
      if (type === 'region') { o.walk = []; this.walkwayGhosts(o); }
      return o;
    }
    gridArt(o) {
      const { X, Y, gx } = o, g = this.add.graphics().setDepth(2.5), lab = { fontFamily: FONT, fontSize: '13px', color: '#203e36', fontStyle: 'bold', stroke: '#fffdf5', strokeThickness: 4 };
      g.fillStyle(0xfffdf5, .28).fillRect(X(gx.x0), Y(gx.y1), X(gx.x1) - X(gx.x0), Y(gx.y0) - Y(gx.y1));
      g.lineStyle(1, 0xffffff, .55);
      for (let x = gx.x0; x <= gx.x1; x++) g.lineBetween(X(x), Y(gx.y0), X(x), Y(gx.y1));
      for (let y = gx.y0; y <= gx.y1; y++) g.lineBetween(X(gx.x0), Y(y), X(gx.x1), Y(y));
      g.lineStyle(2, 0x203e36, .6);
      if (gx.x0 <= 0 && gx.x1 >= 0) g.lineBetween(X(0), Y(gx.y0), X(0), Y(gx.y1));
      if (gx.y0 <= 0 && gx.y1 >= 0) g.lineBetween(X(gx.x0), Y(0), X(gx.x1), Y(0));
      for (let x = gx.x0; x <= gx.x1; x++) this.add.text(X(x), Y(gx.y0) + 3, fmt(x), lab).setOrigin(.5, 0).setDepth(9.7);
      for (let y = gx.y0 + 1; y <= gx.y1; y++) this.add.text(X(gx.x0) - 4, Y(y), fmt(y), lab).setOrigin(1, .5).setDepth(2.6);
    }
    label(o, x, y, text, style = {}, origin = [.5, 1]) {
      const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#fff', backgroundColor: '#203e36', padding: { x: 4, y: 2 }, ...style }).setOrigin(...origin).setDepth(17);
      o.labels.push(t); return t;
    }
    // ── drawing per station type ─────────────────────────────────────────
    draw(st) {
      const c = st.c, g = st.g, fg = st.fg; g.clear(); fg.clear(); st.labels.forEach((t) => t.destroy()); st.labels = [];
      st.screen.setText(st.type === 'region' ? st.st.lines.map((l, i) => l.show.replace('□', c[st.st.levers[i]])).join('  ·  ') : st.st.levers.map((n) => `${n} = ${typeof c[n] === 'number' ? fmt(c[n]) : c[n]}`).join('  '));
      this[`draw_${st.type}`](st);
      if (st.solved) st.screen.setBackgroundColor('#1f6e3a').setText(`${st.screen.text} ✓`);
    }
    gauge(st, x, label, expr, value, rhs, shown) {
      // a tank: glass column with a mark at the target; filled to the value once the valves are opened
      const H = 3.4 * T, W = 1.3 * T, bx = wx(x) - W / 2, by = wy(st.base) - H - 6, unit = H / (2 * Math.max(1, Math.abs(rhs)));
      const g = st.g; g.fillStyle(COLORS.metal, 1).fillRect(bx - 6, by - 6, W + 12, H + 12).fillStyle(COLORS.glass, 1).fillRect(bx, by, W, H);
      g.fillStyle(COLORS.metal, 1).fillRect(bx - 10, wy(st.base) - 6, 8, 6).fillRect(bx + W + 2, wy(st.base) - 6, 8, 6);
      if (shown) {
        const lv = Math.max(0, Math.min(H, value * unit)), right = Math.abs(value - rhs) < 1e-9;
        g.fillStyle(right ? 0x34c46a : COLORS.water, 1).fillRect(bx, by + H - lv, W, lv);
        if (value * unit > H) { g.fillStyle(COLORS.water, .9); for (let i = 0; i < 5; i++) g.fillCircle(bx + W / 2 + (i - 2) * 9, by - 12 - (i % 2) * 8, 4); } // overflow
        this.label(st, bx + W / 2, by + H - lv - 4, fmt(value), { backgroundColor: right ? '#1f6e3a' : '#2a6fdb' });
      }
      g.lineStyle(4, COLORS.mark, 1).lineBetween(bx - 8, by + H - rhs * unit, bx + W + 8, by + H - rhs * unit);
      this.label(st, bx + W + 10, by + H - rhs * unit, `= ${fmt(rhs)}`, { backgroundColor: '#b3402a', fontSize: '12px' }, [0, .5]);
      this.label(st, bx + W / 2, by - 10, `${label}\n${expr}`, { fontSize: '12px', align: 'center' });
    }
    draw_system(st) {
      const out = systemOutcome(st.st, st.c), shown = !!st.result;
      out.rows.forEach((r, i) => this.gauge(st, st.ax + i * 2.1, r.label, lhsText(r.coef), r.value, r.rhs, shown));
    }
    draw_plate(st) {
      const { x, y } = st.c, out = plateOutcome(st.st, st.c), shown = !!st.result;
      this.gauge(st, st.ax, 'Bingkai', '2(x + y)', out.per, st.st.perimeter, shown);
      this.gauge(st, st.ax + 2.1, 'Bukaan', 'xy', out.area, st.st.area, shown);
      // the plate itself, to scale (½ tile per metre), hanging by the hatch
      const u = T / 2, px = wx(st.ax) - .65 * T, py = wy(st.base + 5.3) - y * u, g = st.g; // above the two gauges
      g.fillStyle(0x959ab1, 1).fillRect(px, py, x * u, y * u).lineStyle(3, COLORS.metal, 1).strokeRect(px, py, x * u, y * u);
      for (let i = 1; i < x; i++) g.lineStyle(1, 0x737999, 1).lineBetween(px + i * u, py, px + i * u, py + y * u);
      for (let j = 1; j < y; j++) g.lineStyle(1, 0x737999, 1).lineBetween(px, py + j * u, px + x * u, py + j * u);
      this.label(st, px + x * u / 2, py - 4, `${fmt(x)} × ${fmt(y)}`);
    }
    draw_intersect(st) {
      const { X, Y, gx } = st, s = st.st, g = st.g, fg = st.fg, cv = s.curve;
      // the curve: the slope's edge (parabola) or the mine wheel's rim (circle)
      g.lineStyle(6, 0x8a5a2b, 1);
      if (cv.kind === 'parabola') {
        let prev = null;
        for (let x = gx.x0; x <= gx.x1 + 1e-9; x += .05) { const y = curveY(cv, x), p = y >= gx.y0 - .2 && y <= gx.y1 + .2 ? [X(x), Y(y)] : null; if (p && prev) g.lineBetween(prev[0], prev[1], p[0], p[1]); prev = p; }
      } else {
        g.strokeCircle(X(0), Y(0), X(cv.r) - X(0)); g.lineStyle(3, 0x8a5a2b, .7);
        for (let a = 0; a < Math.PI; a += Math.PI / 4) g.lineBetween(X(0) + Math.cos(a) * (X(cv.r) - X(0)), Y(0) - Math.sin(a) * (X(cv.r) - X(0)), X(0) - Math.cos(a) * (X(cv.r) - X(0)), Y(0) + Math.sin(a) * (X(cv.r) - X(0)));
      }
      // the rail y = mx + k across the grid
      const yAt = (x) => s.line.m * x + s.line.k, xs = [gx.x0, gx.x1].map((x) => Math.max(gx.x0, Math.min(gx.x1, x)));
      const clip = (x) => Math.max(gx.y0, Math.min(gx.y1, yAt(x))), xa = s.line.m > 0 ? Math.max(xs[0], (gx.y0 - s.line.k) / s.line.m) : xs[0], xb = s.line.m > 0 ? Math.min(xs[1], (gx.y1 - s.line.k) / s.line.m) : xs[1];
      g.lineStyle(7, COLORS.rail, 1).lineBetween(X(xa), Y(clip(xa)), X(xb), Y(clip(xb))).lineStyle(2, 0xdce1e7, 1).lineBetween(X(xa), Y(clip(xa)) - 2, X(xb), Y(clip(xb)) - 2);
      // the two clamps on the rail; after "Pasang", each drops to where the curve is
      const out = intersectOutcome(s, st.c);
      out.clamps.forEach((q, i) => {
        const cx = X(q.x), cy = Y(Math.max(gx.y0, Math.min(gx.y1, q.y))), hold = q.state === 'hold';
        fg.fillStyle(st.result ? (hold ? COLORS.ok : COLORS.mark) : 0xd7a21f, 1).fillRect(cx - 9, cy - 9, 18, 18).lineStyle(2, COLORS.ink, 1).strokeRect(cx - 9, cy - 9, 18, 18);
        if (st.result && q.state === 'above') { fg.lineStyle(2, COLORS.mark, 1); for (let yy = q.y; yy > q.curveY; yy -= .25) fg.lineBetween(cx, Y(yy), cx, Y(Math.max(q.curveY, yy - .12))); }
        const tag = !st.result ? `${st.st.levers[i]} = ${fmt(q.x)}` : hold ? 'terpaut ✓' : { above: 'tergantung', below: 'tertanam', inside: 'di dalam roda', outside: 'di luar roda' }[q.state];
        this.label(st, cx, cy - 12, tag, { backgroundColor: st.result ? (hold ? '#1f6e3a' : '#b3402a') : '#203e36', fontSize: '12px' });
      });
    }
    walkwayGhosts(st) {
      // every walkway platform is always visible: an outline while unpowered, a solid girder when lit
      const s = st.s, g = this.add.graphics().setDepth(9.3); st.ghosts = g;
      g.lineStyle(2, 0x434a5f, .8);
      const w = s.st.sx * T;
      for (const [x, y] of s.st.walkway) {
        const x0 = wx(s.ox + x * s.st.sx - s.st.sx / 2), y0 = wy(s.oy + y);
        for (let i = 0; i < w; i += 10) { g.lineBetween(x0 + i, y0, x0 + Math.min(i + 6, w), y0); g.lineBetween(x0 + i, y0 + T * .45, x0 + Math.min(i + 6, w), y0 + T * .45); }
      }
    }
    draw_region(st) {
      const { X, Y, gx } = st, s = st.st, g = st.g, signs = s.levers.map((n) => st.c[n]);
      // shade the lattice cells that satisfy all three (the feasible region), draw each boundary line
      for (let x = gx.x0; x <= gx.x1; x++) for (let y = gx.y0; y <= gx.y1; y++) if (inRegion(s.lines, signs, x, y)) g.fillStyle(COLORS.region, .16).fillCircle(X(x), Y(y), 9);
      s.lines.forEach((l, i) => {
        const seg = segInBox(l.a, l.b, l.c, gx);
        if (!seg) return;
        const [a, b] = seg;
        g.lineStyle(3, [0xd7a21f, 0x2a6fdb, 0x8a5a2b][i], 1).lineBetween(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]));
        this.label(st, X(b[0]), Y(b[1]) - 2, l.show.replace('□', signs[i]), { backgroundColor: ['#8a6a12', '#1f4f9e', '#6b4a24'][i], fontSize: '12px' }, [1, 1]);
      });
    }
    draw_isoline(st) {
      const { X, Y, gx } = st, s = st.st, g = st.g, fg = st.fg, out = isolineOutcome(s, st.c);
      for (const [x, y] of lattice(gx.x1, gx.y1, (a, b) => inRegion(s.lines, s.signs, a, b))) g.fillStyle(COLORS.region, .35).fillCircle(X(x), Y(y), 8);
      // the gantry rail 3x + 2y = k
      const k = st.c.k, seg = segInBox(3, 2, k, gx);
      if (!seg) return;
      const [A, B] = seg;
      fg.lineStyle(7, COLORS.rail, 1).lineBetween(X(A[0]), Y(A[1]), X(B[0]), Y(B[1]));
      this.label(st, X(B[0]), Y(B[1]) - 4, `3x + 2y = ${k}`, { backgroundColor: '#434a5f' }, [1, 1]);
      if (st.result) {
        for (const [x, y] of out.on) fg.fillStyle(out.state === 'rests' ? COLORS.ok : 0xd7a21f, 1).fillCircle(X(x), Y(y), 9);
        if (out.state === 'cuts') for (const [x, y] of lattice(gx.x1, gx.y1, (a2, b2) => inRegion(s.lines, s.signs, a2, b2) && 3 * a2 + 2 * b2 > k)) fg.lineStyle(2, COLORS.mark, 1).strokeCircle(X(x), Y(y), 11);
      }
    }
    draw_plan(st) {
      const { X, Y, gx } = st, s = st.st, g = st.g, fg = st.fg, out = planOutcome(s, st.c);
      for (const [x, y] of lattice(gx.x1, gx.y1, (a, b) => inRegion(s.lines, s.signs, a, b))) g.fillStyle(COLORS.region, .3).fillCircle(X(x), Y(y), 8);
      s.lines.forEach((l, i) => {
        const seg = segInBox(l.a, l.b, l.c, gx);
        if (seg) { const [a, b] = seg; g.lineStyle(3, [0xd7a21f, 0x8a5a2b][i], 1).lineBetween(X(a[0]), Y(a[1]), X(b[0]), Y(b[1])); this.label(st, X(a[0]) + 6, Y(a[1]) + 4, `${l.name}: ${l.show.replace('□', '≥')}`, { backgroundColor: ['#8a6a12', '#6b4a24'][i], fontSize: '12px' }, [0, 0]); }
      });
      const { x, y } = st.c;
      fg.fillStyle(st.result ? (out.ok ? COLORS.ok : COLORS.mark) : 0x2a6fdb, 1).fillCircle(X(x), Y(y), 10).lineStyle(2, COLORS.ink, 1).strokeCircle(X(x), Y(y), 10);
      if (st.result && out.feasible) { // the cost line through the chosen plan: cheaper plans lie below it
        const C = out.cost, seg = segInBox(2, 3, C, gx) || [[x, y], [x, y]], [P, Q] = seg;
        fg.lineStyle(2, 0x434a5f, 1); for (let t = 0; t < 1; t += .06) { const u = Math.min(1, t + .03); fg.lineBetween(X(P[0] + (Q[0] - P[0]) * t), Y(P[1] + (Q[1] - P[1]) * t), X(P[0] + (Q[0] - P[0]) * u), Y(P[1] + (Q[1] - P[1]) * u)); }
        this.label(st, X(Q[0]), Y(Q[1]) - 4, `2x + 3y = ${C}`, { backgroundColor: '#434a5f', fontSize: '12px' }, [1, 1]);
      }
    }
    // ── actions ───────────────────────────────────────────────────────────
    outcome(st) {
      const f = { system: systemOutcome, intersect: intersectOutcome, plate: plateOutcome, region: regionOutcome, isoline: isolineOutcome, plan: planOutcome }[st.type];
      return f(st.st, st.c);
    }
    step(st, lever, dir) {
      if (st.solved) { this.cue('Stesen ini sudah selesai.'); return; }
      if (this.busy) return;
      const name = st.st.levers[lever]; if (!name) return;
      const opts = st.st.options[name], i = opts.indexOf(st.c[name]);
      const j = st.type === 'region' ? (i + 1) % opts.length : Phaser.Math.Clamp(i + dir, 0, opts.length - 1); // a sign lever flips
      if (i === j) { this.cue(dir < 0 ? `Ini nilai ${name} paling kecil.` : `Ini nilai ${name} paling besar.`); return; }
      st.c[name] = opts[j]; st.result = null; SFX.jump?.(audio);
      this.run.levers[st.id] = { ...st.c };
      this.draw(st); this.updateHud(true);
    }
    act(st) {
      if (st.solved || this.busy) return;
      const out = this.outcome(st); st.result = out;
      if (st.type === 'region') { this.power(st); this.draw(st); this.updateHud(true); if (out.ok) this.solve(st, 'Kuasa hidup! Semua pelantar dalam rantau tersaur menyala: lantai selamat terbina.'); else { SFX.incorrect?.(audio); this.cue(`${out.lit.length} daripada ${st.st.walkway.length} pelantar menyala. Pelantar di luar rantau kekal padam: laluan terputus.`); } return; }
      this.draw(st); this.updateHud(true);
      if (out.ok) { this.solve(st, this.successCue(st)); return; }
      SFX.incorrect?.(audio); this.cue(this.failCue(st, out));
    }
    successCue(st) {
      return { system: 'Semua tangki tepat pada tanda! Tekanan cukup: mesin hidup.', intersect: 'Kedua-dua pengapit terpaut pada titik persilangan. Rel dipasang!', plate: 'Plat muat tepat: bingkai 14 m dan bukaan 12 m². Pintu terbuka.', isoline: 'Rel terletak pada bucu rantau: P maksimum 19. Lif naik.', plan: 'Kos minimum 13! Pesanan dihantar, pintu loji terbuka.' }[st.type];
    }
    failCue(st, out) {
      if (st.type === 'system') { const bad = out.rows.filter((r) => !r.ok); return `${bad.map((r) => `${r.label}: ${fmt(r.value)} (tanda ${fmt(r.rhs)})`).join(' · ')}. Ubah injap.`; }
      if (st.type === 'intersect') return st.c[st.st.levers[0]] === st.c[st.st.levers[1]] ? 'Kedua-dua pengapit di tempat yang sama: rel perlukan dua titik.' : 'Pengapit hanya terpaut di titik yang berada pada rel DAN lengkung.';
      if (st.type === 'plate') return `Bingkai ${fmt(out.per)} m (perlu 14), bukaan ${fmt(out.area)} m² (perlu 12).`;
      if (st.type === 'isoline') return out.state === 'misses' ? `Tiada pelan dalam rantau memberi P = ${st.c.k}: rel tidak menyentuh lantai.` : `Rel masih memotong rantau: ${out.above} pelan memberi P lebih besar daripada ${st.c.k}.`;
      if (st.type === 'plan') return out.broken.length ? `Pesanan ditolak: ${out.broken.map((l) => l.words).join('; ')}.` : `Pelan sah, tetapi kos ${out.cost}. Ada pelan dalam rantau yang lebih murah (di bawah garis kos).`;
      return '';
    }
    solve(st, text) {
      st.solved = true; this.run.solved[st.id] = true; this.run.levers[st.id] = { ...st.c };
      for (const c of L.checkpoints.slice(1)) if (c.needs.includes(st.id) && c.needs.every((id) => this.run.solved[id])) { this.run.checkpointId = c.id; this.cpFlags[c.id]?.setFrame(112); }
      SFX.correct?.(audio); SFX.checkpoint?.(audio);
      if (st.type !== 'region') this.activate(st);
      this.draw(st); this.updateHud(true); this.writeSave(); this.cue(text);
    }
    // region: (re)build the lit walkway platforms for the current signs
    power(st, quiet = false) {
      for (const o of st.walk) { if (o.body) this.solids.remove(o, true, true); else o.destroy(); }
      st.walk = [];
      const signs = st.st.levers.map((n) => st.c[n]);
      walkwayPieces(st.s, signs).forEach((p, i) => {
        const body = this.add.rectangle(wx((p.x0 + p.x1) / 2), wy(p.top) + T / 2, (p.x1 - p.x0) * T, T, 0, 0);
        this.physics.add.existing(body, true); this.solids.add(body); st.walk.push(body);
        for (let x = p.x0; x < p.x1 - 1e-9; x++) {
          const n = p.x1 - p.x0, img = this.itile(n === 1 ? SLAB[0] : x === p.x0 ? SLAB[1] : x === p.x1 - 1 ? SLAB[2] : SLAB[3], wx(x), wy(p.top), 9.5); st.walk.push(img);
          if (!quiet && !reducedMotion) { img.setAlpha(0); this.tweens.add({ targets: img, alpha: 1, duration: 300, delay: 90 * i }); }
        }
      });
    }
    // the solved station's mechanism: steps / lift ledges rise, a deck extends, a gate sinks
    activate(st, quiet = false) {
      const m = st.mech, s = st.s;
      for (const b of m.bodies) this.solids.remove(b, true, true);
      m.bodies = [];
      for (const a of m.art) { if (quiet || reducedMotion) a.destroy(); else this.tweens.add({ targets: a, y: a.y + 7 * T, alpha: 0, duration: 900, ease: 'Quad.in', onComplete: () => a.destroy() }); }
      m.art = [];
      const kind = s.mech.kind;
      s.pieces.active.forEach((p, i) => {
        const body = this.add.rectangle(wx((p.x0 + p.x1) / 2), kind === 'steps' ? wy((p.top + s.mech.base) / 2) : wy(p.top) + T / 2, (p.x1 - p.x0) * T, kind === 'steps' ? (p.top - s.mech.base) * T : T, 0, 0);
        this.physics.add.existing(body, true); this.solids.add(body); m.bodies.push(body);
        const imgs = [];
        if (kind === 'steps') for (let y = s.mech.base; y < p.top; y++) imgs.push(this.itile(PICK(y === p.top - 1 ? SURF : FILL, i === 0, false), wx(p.x0), wy(y + 1), 9.6));
        else if (kind === 'lift') { imgs.push(this.itile(SLAB[0], wx(p.x0), wy(p.top), 9.7)); for (let y = s.mech.base; y < p.top - 1; y++) imgs.push(this.itile(23, wx(p.x0), wy(y + 1), 9.5)); }
        else if (kind === 'bridge') for (let x = p.x0; x < p.x1; x++) imgs.push(this.itile(x === p.x0 ? 87 : x === p.x1 - 1 ? 90 : 88 + (x % 2), wx(x), wy(p.top), 9.7));
        imgs.forEach((img, k) => {
          m.art.push(img);
          if (quiet || reducedMotion) return;
          const to = { x: img.x, y: img.y };
          if (kind === 'bridge') { img.x = wx(p.x0) - T; img.setAlpha(0); this.tweens.add({ targets: img, x: to.x, alpha: 1, duration: 260, delay: 110 * k }); }
          else { img.y += (p.top - s.mech.base) * T; img.setAlpha(0); this.tweens.add({ targets: img, y: to.y, alpha: 1, duration: 700, ease: 'Back.out', delay: 140 * i }); }
        });
      });
    }
    // ── HUD ───────────────────────────────────────────────────────────────
    nearest() { const px = this.player.x; return this.stations.reduce((m, st) => (Math.abs(wx(st.s.leverX) - px) < Math.abs(wx(m.s.leverX) - px) ? st : m)); }
    hudText(st) {
      const s = st.st, c = st.c, r = st.result, done = st.solved ? `Selesai. ${st.s.lesson}.` : null;
      if (st.type === 'system') return { eq: s.rows.map((row) => `${lhsText(row.coef)} = ${fmt(row.rhs)}`).join('<br>'), meta: s.levers.map((n) => `${n} = ${fmt(c[n])}`).join(', '), why: s.id === 'C' ? 'A, B, C = jisim (tan) setiap tong bijih. Setiap troli hanya bergerak jika beratnya tepat pada tanda.' : 'Setiap injap mengalirkan air ke tangki mengikut persamaan. Mesin hidup hanya jika SEMUA tangki tepat pada tanda.', state: done ?? (!r ? 'Tetapkan injap, kemudian buka.' : 'Lihat tangki yang tidak tepat: ubah satu anu, perhatikan kesannya.') };
      if (st.type === 'intersect') return { eq: `y = ${s.line.m === 1 ? '' : fmt(s.line.m)}x ${s.line.k < 0 ? '−' : '+'} ${fmt(Math.abs(s.line.k))}<br>${s.curve.kind === 'parabola' ? 'y = x² − 1' : 'x² + y² = 25'}`, meta: `Pengapit di x = ${fmt(c.p)} dan x = ${fmt(c.q)}`, why: `Rel (garis lurus) mesti dipaut pada ${s.curve.kind === 'parabola' ? 'cerun' : 'rim roda'} di KEDUA-DUA titik persilangan. Gantikan persamaan linear ke dalam persamaan tak linear.`, state: done ?? (!r ? 'Gerakkan pengapit, kemudian pasang.' : 'Pengapit merah tidak menyentuh lengkung.') };
      if (st.type === 'plate') return { eq: '2(x + y) = 14<br>xy = 12', meta: `Plat ${fmt(c.x)} m × ${fmt(c.y)} m`, why: 'Bingkai pintu palka 14 m keliling, bukaan 12 m². Plat mesti muat tepat.', state: done ?? (!r ? 'Pilih sisi plat, kemudian pasang.' : 'Satu meter tepat tidak cukup: kedua-duanya mesti tepat.') };
      if (st.type === 'region') return { eq: s.lines.map((l) => l.show.replace('□', c[s.levers[s.lines.indexOf(l)]])).join('<br>'), meta: s.lines.map((l) => l.name).join(' · '), why: `Ubah tanda setiap kekangan: ${s.lines.map((l) => l.words).join('; ')}. Hanya pelantar dalam rantau tersaur menyala.`, state: done ?? (!r ? 'Tetapkan tanda, kemudian hidupkan kuasa.' : `${r.lit.length}/${s.walkway.length} pelantar menyala.`) };
      if (st.type === 'isoline') return { eq: `P = 3x + 2y<br>3x + 2y = ${c.k}`, meta: 'Rantau: x + y ≤ 7, y ≥ 2, y ≤ 2x', why: 'Rel gantri mengikut garis P = k. Naikkan k: rel berhenti di titik terakhir rantau yang disentuh = P maksimum.', state: done ?? (!r ? 'Pilih k, kemudian turunkan rel.' : r.state === 'cuts' ? 'Rel memotong rantau: P masih boleh naik.' : 'Rel tidak menyentuh rantau.') };
      return { eq: 'C = 2x + 3y (minimum)<br>x + 2y ≥ 8, 3x + y ≥ 9', meta: `Pelan: x = ${fmt(c.x)}, y = ${fmt(c.y)}`, why: 'x lori bijih besi, y lori arang. Pesanan mesti memenuhi kedua-dua bekalan dengan kos terendah.', state: done ?? (!r ? 'Pilih pelan, kemudian hantar.' : r.ok ? 'Kos minimum!' : r.feasible ? `Kos ${r.cost}: cari pelan lebih murah dalam rantau.` : 'Pelan di luar rantau tersaur.') };
    }
    updateHud(force = false) {
      const st = this.nearest();
      if (!force && st === this.active) return;
      this.active = st;
      const h = this.hudText(st);
      $('w2-station').textContent = st.s.name + (st.solved ? ' ✓' : '');
      $('w2-eq').innerHTML = h.eq; $('w2-vertex').textContent = h.meta; $('w2-why').textContent = h.why; $('w2-state').textContent = h.state;
      const names = st.st.levers;
      ['w2-l1', 'w2-l2', 'w2-l3'].forEach((id, i) => {
        const n = names[i]; $(id).hidden = !n; if (!n) return;
        const region = st.type === 'region', [lhs, rhs] = region ? st.st.lines[i].show.split('□') : [n, ''];
        $(`${id}-name`).textContent = region ? lhs.trim() : n; $(id).querySelector('.eqs').textContent = region ? ' ' : ' = ';
        $(`${id}-val`).textContent = region ? `${st.c[n]}${rhs}` : typeof st.c[n] === 'number' ? fmt(st.c[n]) : st.c[n];
      });
      $('w2-lock').textContent = st.solved ? 'Selesai' : ACTION[st.type];
      $('w2-lock').disabled = st.solved;
      $('w2-keys').textContent = touchDevice ? '' : `Di tuil: Q/E tuil 1${names[1] ? ', Z/X tuil 2' : ''}${names[2] ? ', C/V tuil 3' : ''}, F ${ACTION[st.type].toLowerCase()}`;
      $('w2-coins').textContent = `${this.run.coins.length}/${L.coins.length}`;
    }
    cue(text) { const el = $('w2-cue'); el.textContent = text; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    syncVisual() { this.visual.setPosition(this.player.x, this.player.body.bottom); }
    resetCrate() {}
    dustBurst(x, y, count = 5) {
      if (reducedMotion) return;
      const e = this.add.particles(x, y, 'fx-dot', { speed: { min: 30, max: 95 }, angle: { min: 200, max: 340 }, scale: { start: .55, end: 0 }, alpha: { start: .5, end: 0 }, lifespan: 380, quantity: count, emitting: false }).setDepth(21);
      e.explode(count); this.time.delayedCall(480, () => e.destroy());
    }
    respawn() {
      const cp = L.checkpoints.find((c) => c.id === this.run.checkpointId) || L.checkpoints[0];
      const body = this.player.body;
      body.reset(wx(cp.x), wy(cp.y) - MOTION.bodyHeight / 2 - 1); body.setVelocity(0, 0);
      this.climbing = null; this.groundedAt = -1000; this.jumpAt = -1000; this.syncVisual();
    }
    writeSave() { this.run.elapsedMs = Math.round(this.elapsed); if (!store.saveRun(this.run, levelId)) $('w2-save').textContent = 'Simpanan tidak tersedia: kemajuan sesi ini masih boleh dimainkan.'; }
    update(time, delta) {
      if (this.mode !== 'playing') return;
      this.elapsed += delta;
      const m = updatePlayer(this, time, delta, { controls, audio, SFX, reducedMotion, BASE_SCALE, WATER: [], WATER_Y: WORLD.floor + 200 });
      if (m.respawned) return;
      const px = this.player.x, feet = this.player.body.bottom, st = this.nearest();
      updateCamera(this, [st.zone]); // only the nearest station frames the view (zones may overlap)
      const near = Math.abs(px - wx(st.s.leverX)) < 80 && Math.abs(feet - st.leverFeet) < 8;
      $('w2-tools').classList.toggle('far', !near);
      (this.hud ??= document.querySelector('.w2-hud'))?.classList.toggle('compact', !near);
      if (near && !st.solved) {
        if (controls.l1Down) this.step(st, 0, -1);
        if (m.interact || controls.l1Up) this.step(st, 0, 1);
        if (controls.l2Down) this.step(st, 1, -1);
        if (controls.l2Up) this.step(st, 1, 1);
        if (controls.l3Down) this.step(st, 2, -1);
        if (controls.l3Up) this.step(st, 2, 1);
        if (controls.lock) this.act(st);
      }
      controls.l1Down = controls.l1Up = controls.l2Down = controls.l2Up = controls.l3Down = controls.l3Up = controls.lock = false;
      this.updateHud();
      if (this.acid.some((a) => px > a.x0 && px < a.x1 && feet > a.top + 20)) { this.cue('Jatuh ke asid! Kembali ke checkpoint.'); SFX.fall?.(audio); this.respawn(); return; }
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
      const prevBest = store.load().levels[levelId].bestMs;
      this.run.completed = true; this.run.checkpointId = L.checkpoints.at(-1).id; this.writeSave();
      const rec = store.load().levels[levelId];
      trackDone(levelId, this.run, rec);
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
      type: Phaser.CANVAS, parent: 'w2-game', ...size(), backgroundColor: '#cfdbe4', banner: false, audio: { noAudio: true },
      render: { antialias: true, roundPixels: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
      callbacks: { preBoot: (g) => g.registry.set('assets', assets) }, scene: [Level3],
    });
    new ResizeObserver(() => { const d = size(); game.scale.setGameSize(d.width, d.height); game.scale.refresh(); }).observe(frame);
    for (const b of document.querySelectorAll('[data-hold],[data-action]')) {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); audio.unlock?.(); controls[b.dataset.hold || b.dataset.action] = true; });
      for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, () => { if (b.dataset.hold) controls[b.dataset.hold] = false; });
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    $('w2-touch').hidden = !touchDevice;
    $('w2-replay').addEventListener('click', () => { $('complete').close(); store.saveRun(newRun(levelId), levelId); game.scene.getScene(`W3-${levelId}`).scene.restart(); });
    addEventListener('blur', () => Object.keys(controls).forEach((k) => { controls[k] = false; }));
  }
  boot().catch((e) => { console.error(e); $('w2-state').textContent = 'Level gagal dimuatkan.'; });
}
