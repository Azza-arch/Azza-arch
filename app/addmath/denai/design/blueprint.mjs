// DENAI blueprint generator (design tool only; not loaded by the game).
// Reads CURRENT geometry straight from the level modules and PROPOSED geometry from
// proposals.mjs, then writes SVG blueprints + a jump-envelope sanity report.
// Run from app/addmath/denai:  node design/blueprint.mjs
import fs from 'node:fs';
import * as L1 from '../src/v14/level.js';
import * as L2 from '../src/v14/levels/twin-world.js';
import * as L3 from '../src/v14/levels/inverse-world.js';
import { L11, L12, L13, L21, T } from './proposals.mjs';

const OUT = new URL('./blueprints/', import.meta.url);
fs.mkdirSync(OUT, { recursive: true });
const t = (v) => v / T;

// ── current geometry → same schema (tiles) ──────────────────────────────────
function current11() {
  const s = L1.SURFACES;
  return {
    title: 'Level 1-1 · Jejak Taman Fungsi (semasa, dari src/v14/level.js)', width: t(L1.WORLD.width), rowTop: 15, rowBottom: 30, floor: t(L1.WORLD.floor),
    terrain: s.filter((q) => q.kind === 'solid').map((q) => [t(q.x), t(q.x + q.width), t(q.y), 'keep']),
    slab: s.filter((q) => q.kind === 'slab').map((q) => [t(q.x), t(q.x + q.width), t(q.y), t(q.bottom), 'keep']),
    deck: s.filter((q) => q.kind === 'oneWay' || q.kind === 'optional').map((q) => [t(q.x), t(q.x + q.width), t(q.y), 'keep']),
    gate: L1.GATES.map((g) => [t(g.x), t(g.x + g.width), t(g.y), 'Jambatan 7 papan']),
    ladder: L1.LADDERS.map((l) => [t(l.x), t(l.top), t(l.bottom), 'keep']),
    walls: L1.WALLS.map((w) => [t(w.x), t(w.top), t(w.bottom)]),
    water: L1.WATER.map((w) => [t(w.x), t(w.x + w.width), t(L1.WATER_Y)]),
    math: [[t(L1.TERMINALS[1].x), t(L1.TERMINALS[1].feet), '∑ Mesin f(x)=2x+1']], inter: [[t(L1.CRATE_PUZZLE.crate.x), t(L1.CRATE_PUZZLE.crate.feet), 'Kotak'], [t(L1.CRATE_PUZZLE.floorSwitch.x), t(L1.CRATE_PUZZLE.floorSwitch.feet), 'Plat'],
      [t(L1.TERMINALS[0].x), t(L1.TERMINALS[0].feet), 'Probe']],
    cp: L1.CHECKPOINTS.map((c) => [t(c.x), t(c.feet)]),
    secret: L1.SECRETS.map((q) => [t(q.x), t(q.feet), q.name]),
    coins: L1.COLLECTIBLES.map((c) => [t(c.x), t(c.y)]),
    mark: [[t(L1.GOAL.x), t(L1.GOAL.feet) - 1.5, 'Bendera']], cave: [], main: [], opt: [], loops: [], risk: [],
  };
}
function current12() {
  return {
    title: 'Level 1-2 · Jambatan Berkembar (semasa, dari twin-world.js)', width: t(L2.WORLD.width), rowTop: 15, rowBottom: 30, floor: t(L2.WORLD.floor),
    terrain: L2.AB_TERRAIN.map((q) => [t(q.x), t(q.x + q.width), t(q.y), 'keep']), slab: [],
    deck: L2.DECKS.map((d) => [t(d.x), t(d.x + d.width), t(d.y), 'keep']),
    gate: L2.STATIONS.map((s) => [t(s.bridge.x), t(s.bridge.x + s.bridge.width), t(s.bridge.y), s.title]),
    ladder: L2.LADDERS.map((l) => [t(l.x), t(l.top), t(l.bottom), 'keep']),
    water: L2.WATER.map((w) => [t(w.x), t(w.x + w.width), t(L2.WATER_Y)]),
    math: L2.STATIONS.map((s) => [t(s.x), t(s.y), '∑ ' + s.title]), cp: L2.CHECKPOINTS.map((c) => [t(c.x), t(c.feet)]),
    secret: L2.SECRETS.map((q) => [t(q.x), t(q.feet), q.id]), coins: L2.COINS.map((c) => [t(c.x), t(c.y)]),
    mark: [[t(L2.GOAL.x), t(L2.GOAL.feet) - 1.5, 'Bendera']], cave: [], main: [], opt: [], loops: [], risk: [],
  };
}
function current13() {
  return {
    title: 'Level 1-3 · Gerbang Songsang (semasa, dari inverse-world.js)', width: t(L3.WORLD.width), rowTop: 17, rowBottom: 39, floor: t(L3.WORLD.floor),
    terrain: L3.AB_TERRAIN.map((q) => [t(q.x), t(q.x + q.width), t(q.y), 'keep']), slab: [],
    deck: L3.DECKS.map((d) => [t(d.x), t(d.x + d.width), t(d.y), 'keep']),
    gate: [[t(L3.BRIDGE.x), t(L3.BRIDGE.x + L3.BRIDGE.width), t(L3.BRIDGE.y), 'Jambatan meterai']],
    ladder: L3.LADDERS.map((l) => [t(l.x), t(l.top), t(l.bottom), 'keep']),
    water: L3.WATER.map((w) => [t(w.x), t(w.x + w.width), t(L3.WATER_Y)]),
    math: [[53, 30, '∑ Mesin songsang']], inter: [[93, 29, 'Gerbang 3 meterai']], cp: L3.CHECKPOINTS.map((c) => [t(c.x), t(c.feet)]),
    secret: L3.SECRETS.map((q) => [t(q.x), t(q.feet), q.id]), coins: L3.COINS.map((c) => [t(c.x), t(c.y)]),
    mark: [[t(L3.GOAL.x), t(L3.GOAL.feet) - 1.5, 'Gerbang']], cave: [], main: [], opt: [], loops: [], risk: [],
  };
}

// ── SVG drawing ────────────────────────────────────────────────────────────
const C = { sky: '#eef7f5', terrain: '#b98557', terrainNew: '#d6a06c', edge: '#5b3a24', slab: '#9d8a72', cave: '#3c2b22', deck: '#e08a2e', gate: '#7a4cc2',
  ladder: '#e8c34a', water: '#5fb6ea', main: '#1f8f4a', opt: '#11849a', loop: '#b0479c', inter: '#2e7d5b', risk: '#c62828', mech: '#7a4cc2', cp: '#d8432b', secret: '#e0a400', text: '#203e36', change: '#d8432b' };
function panel(d, { px, oy, label }) {
  const W = d.width * px, H = (d.rowBottom - d.rowTop) * px, X = (x) => x * px, Y = (r) => (r - d.rowTop) * px, floor = d.floor ?? d.rowBottom;
  const g = [];
  g.push(`<g transform="translate(0,${oy})"><rect width="${W}" height="${H}" fill="${C.sky}"/>`);
  for (let x = 0; x <= d.width; x += 5) g.push(`<line x1="${X(x)}" y1="0" x2="${X(x)}" y2="${H}" stroke="#cfe0dc" stroke-width="${x % 10 ? .5 : 1}"/>${x % 10 === 0 ? `<text x="${X(x) + 2}" y="${H - 3}" font-size="9" fill="#7a8f8a">${x}</text>` : ''}`);
  for (const [a, b, r] of d.water) g.push(`<rect x="${X(a)}" y="${Y(r)}" width="${X(b - a)}" height="${Y(floor) - Y(r)}" fill="${C.water}" opacity=".85"/>`);
  for (const [a, b, r, st] of d.terrain) g.push(`<rect x="${X(a)}" y="${Y(r)}" width="${X(b - a)}" height="${Y(floor) - Y(r)}" fill="${st === 'new' || st === 'change' ? C.terrainNew : C.terrain}" stroke="${C.edge}" stroke-width="1.2"/>`);
  for (const [a, b, r, br, st] of d.slab) g.push(`<rect x="${X(a)}" y="${Y(r)}" width="${X(b - a)}" height="${X(br - r)}" fill="${st === 'new' ? '#c5b49a' : C.slab}" stroke="${C.edge}" stroke-width="1.2"/>`);
  for (const [a, b, r, br] of d.cave) g.push(`<rect x="${X(a)}" y="${Y(r)}" width="${X(b - a)}" height="${X(br - r)}" fill="${C.cave}" opacity=".85" rx="${px / 2}"/>`);
  for (const [a, b, r, st] of d.deck) g.push(`<line x1="${X(a)}" y1="${Y(r)}" x2="${X(b)}" y2="${Y(r)}" stroke="${st === 'new' || st === 'change' ? C.change : C.deck}" stroke-width="${px * .3}" stroke-linecap="butt"/>`);
  for (const [a, b, r, lab] of d.gate) g.push(`<line x1="${X(a)}" y1="${Y(r)}" x2="${X(b)}" y2="${Y(r)}" stroke="${C.gate}" stroke-width="${px * .3}" stroke-dasharray="${px * .5},${px * .25}"/><text x="${X((a + b) / 2)}" y="${Y(r) + px * 1.1}" font-size="9" text-anchor="middle" fill="${C.gate}">${lab}</text>`);
  for (const [x, top, bot, st] of d.ladder) {
    g.push(`<rect x="${X(x) - px * .3}" y="${Y(top)}" width="${px * .6}" height="${X(bot - top)}" fill="none" stroke="${st === 'new' ? C.change : '#a8841c'}" stroke-width="1.4"/>`);
    for (let r = top + .33; r < bot; r += .33) g.push(`<line x1="${X(x) - px * .3}" y1="${Y(r)}" x2="${X(x) + px * .3}" y2="${Y(r)}" stroke="${C.ladder}" stroke-width="1"/>`);
  }
  for (const [x, top, bot] of d.walls ?? []) g.push(`<line x1="${X(x)}" y1="${Y(top)}" x2="${X(x)}" y2="${Y(bot)}" stroke="#5b3a24" stroke-width="2"/>`);
  for (const c of d.curves ?? []) {
    const pts = []; for (let mx = c.from; mx <= c.to + 1e-9; mx += .1) pts.push(`${X(c.ox + mx).toFixed(1)},${Y(c.oy - (c.a * (mx - c.h) ** 2 + c.k)).toFixed(1)}`);
    g.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#2a6fdb" stroke-width="2" stroke-dasharray="4,3"/>`);
    for (let mx = Math.ceil(c.from); mx <= c.to; mx++) g.push(`<rect x="${X(c.ox + mx - .5)}" y="${Y(c.oy - (c.a * (mx - c.h) ** 2 + c.k))}" width="${px}" height="${px * .3}" fill="#2a6fdb" opacity=".7"/>`);
    g.push(`<text x="${X(c.ox + c.h)}" y="${Y(c.oy - c.k) - 6}" font-size="10" text-anchor="middle" fill="#2a6fdb" font-weight="bold">${c.label}</text>`);
  }
  const line = (pts, color, dash, w) => `<polyline points="${pts.map(([x, r]) => `${X(x).toFixed(1)},${(Y(r) - px * .55).toFixed(1)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" opacity=".9"/>`;
  for (const o of d.opt ?? []) { g.push(line(o.pts, C.opt, '6,4', 2.2)); const [x, r] = o.pts[Math.floor(o.pts.length / 2)]; g.push(`<rect x="${X(x) - 11}" y="${Y(r) - px * .55 - 19}" width="22" height="13" rx="3" fill="${C.opt}"/><text x="${X(x)}" y="${Y(r) - px * .55 - 9}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${o.id}</text>`); }
  for (const o of d.loops ?? []) { g.push(line(o.pts, C.loop, '2,4', 3)); const [x, r] = o.pts[0]; g.push(`<rect x="${X(x) - 11}" y="${Y(r) - px * .55 + 5}" width="22" height="13" rx="6" fill="${C.loop}"/><text x="${X(x)}" y="${Y(r) - px * .55 + 15}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${o.id}</text>`); }
  if (d.main.length) {
    g.push(line(d.main.map(([x, r]) => [x, r]), C.main, '', 3));
    const [sx, sr] = d.main[0], [ex, er] = d.main.at(-1);
    if (d.showStart !== false) g.push(`<text x="${X(sx)}" y="${Y(sr) - px * 1.3}" font-size="11" font-weight="bold" fill="${C.main}">▶ MASUK</text>`);
    if (d.showEnd !== false) g.push(`<text x="${X(ex)}" y="${Y(er) - px * 1.3}" font-size="11" font-weight="bold" fill="${C.main}" text-anchor="end">KELUAR ▶</text>`);
  }
  for (const [x, r] of d.coins ?? []) g.push(`<circle cx="${X(x)}" cy="${Y(r)}" r="2.2" fill="#e8b923"/>`);
  for (const [x, r, lab] of d.inter ?? []) g.push(`<rect x="${X(x) - 5}" y="${Y(r) - 15}" width="10" height="10" rx="2" fill="${C.inter}"/><text x="${X(x)}" y="${Y(r) - 19}" font-size="9" text-anchor="middle" fill="${C.inter}" font-weight="bold">${lab}</text>`);
  for (const [x, r, lab] of d.risk ?? []) g.push(`<text x="${X(x)}" y="${Y(r)}" font-size="13" text-anchor="middle" fill="${C.risk}">⚠</text><text x="${X(x)}" y="${Y(r) + 10}" font-size="8" text-anchor="middle" fill="${C.risk}">${lab.split(' ')[0]}</text>`);
  for (const [x, r, lab] of d.math ?? []) g.push(`<rect x="${X(x) - 5}" y="${Y(r) - 16}" width="10" height="10" fill="${C.mech}" transform="rotate(45 ${X(x)} ${Y(r) - 11})"/><text x="${X(x)}" y="${Y(r) - 20}" font-size="9" text-anchor="middle" fill="${C.mech}" font-weight="bold">${lab}</text>`);
  for (const [x, r] of d.cp) g.push(`<line x1="${X(x)}" y1="${Y(r)}" x2="${X(x)}" y2="${Y(r) - 14}" stroke="${C.cp}" stroke-width="1.5"/><path d="M${X(x)},${Y(r) - 14} l8,3 l-8,3z" fill="${C.cp}"/>`);
  for (const [x, r, lab] of d.secret) g.push(`<text x="${X(x)}" y="${Y(r) - 3}" font-size="13" text-anchor="middle" fill="${C.secret}">★</text><text x="${X(x)}" y="${Y(r) + 10}" font-size="8" text-anchor="middle" fill="#8a6a00">${lab}</text>`);
  for (const [x, r, lab] of d.mark) g.push(`<text x="${X(x)}" y="${Y(r)}" font-size="10" text-anchor="middle" fill="${C.text}" font-style="italic">◆ ${lab}</text>`);
  g.push(`<text x="6" y="14" font-size="13" font-weight="bold" fill="${C.text}">${label}</text></g>`);
  return { svg: g.join(''), W, H };
}
const LEGEND = `<g font-size="10" fill="${C.text}"><rect width="12" height="10" fill="${C.terrain}" stroke="${C.edge}"/><text x="16" y="9">tanah pepejal (sedia ada)</text>
<rect x="150" width="12" height="10" fill="${C.terrainNew}" stroke="${C.edge}"/><text x="166" y="9">tanah baharu/diubah</text>
<rect x="285" width="12" height="10" fill="#c5b49a" stroke="${C.edge}"/><text x="301" y="9">blok/tangga batu</text>
<rect x="400" width="12" height="10" fill="${C.cave}"/><text x="416" y="9">gua / ruang</text>
<line x1="490" y1="5" x2="510" y2="5" stroke="${C.deck}" stroke-width="4"/><text x="514" y="9">dek sehala</text>
<line x1="585" y1="5" x2="605" y2="5" stroke="${C.change}" stroke-width="4"/><text x="609" y="9">dek baharu</text>
<line x1="680" y1="5" x2="700" y2="5" stroke="${C.gate}" stroke-width="4" stroke-dasharray="5,3"/><text x="704" y="9">dibina oleh teka-teki</text>
<rect x="815" y="-1" width="7" height="12" fill="none" stroke="#a8841c"/><text x="826" y="9">tangga</text>
<rect x="870" width="12" height="10" fill="${C.water}"/><text x="886" y="9">air</text>
<line x1="915" y1="5" x2="935" y2="5" stroke="${C.main}" stroke-width="3"/><text x="939" y="9">laluan utama</text>
<line x1="1015" y1="5" x2="1035" y2="5" stroke="${C.opt}" stroke-width="2" stroke-dasharray="5,3"/><text x="1039" y="9">laluan pilihan</text>
<rect x="1115" y="0" width="8" height="8" fill="${C.mech}" transform="rotate(45 1119 4)"/><text x="1128" y="9">∑ matematik</text>
<path d="M1195,0 l8,3 l-8,3z" fill="${C.cp}"/><text x="1206" y="9">checkpoint</text><text x="1270" y="10" fill="${C.secret}">★</text><text x="1282" y="9">rahsia</text>
<text x="1330" y="9">◆ mercu tanda</text>
<line x1="0" y1="24" x2="20" y2="24" stroke="${C.loop}" stroke-width="3" stroke-dasharray="2,4"/><text x="24" y="28">gelung balik (G#)</text>
<rect x="130" y="19" width="10" height="10" rx="2" fill="${C.inter}"/><text x="144" y="28">interaksi bukan matematik</text>
<text x="300" y="29" fill="${C.risk}" font-size="12">⚠</text><text x="314" y="28">risiko tersangkut / salah arah (R#)</text>
<text x="520" y="28">P# = laluan pilihan · grid 1 jubin = 54 unit, label setiap 10 jubin · senarai tujuan di bawah setiap panel cadangan</text></g>`;

function notes(d, oy) {
  const rows = [...(d.opt ?? []).map((o) => [C.opt, `${o.id} · ${o.why}`]), ...(d.loops ?? []).map((o) => [C.loop, `${o.id} · ${o.why}`]), ...(d.risk ?? []).map(([, , l]) => [C.risk, `⚠ ${l}`])];
  const cols = 2, per = Math.ceil(rows.length / cols);
  const svg = rows.map(([c, txt], i) => `<text x="${6 + Math.floor(i / per) * 880}" y="${oy + 14 + (i % per) * 15}" font-size="11" fill="${c}">${txt.replace(/&/g, '&amp;')}</text>`).join('');
  return { svg, H: per * 15 + 10 };
}
function write(name, panels) {
  const px = 16; let y = 44; const parts = []; let W = 0;
  for (const p of panels) { const r = panel(p.d, { px, oy: y, label: p.label }); parts.push(r.svg); y += r.H + 8; W = Math.max(W, r.W, 1760);
    if ((p.d.opt?.length || p.d.loops?.length || p.d.risk?.length)) { const n = notes(p.d, y); parts.push(n.svg); y += n.H; } y += 18; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}" font-family="Arial, sans-serif"><rect width="100%" height="100%" fill="#ffffff"/><g transform="translate(8,8)">${LEGEND}</g>${parts.join('')}</svg>`;
  fs.writeFileSync(new URL(name, OUT), svg);
}

// ── jump-envelope sanity check of proposed main routes (design data, not gameplay) ──
// Measured in game: jump peak 92.3 units (1.71 tiles), running reach ~210 units (3.9 tiles).
// Design limits with margin: rise ≤ 1.5 tiles per jump, gap ≤ 3 tiles.
function check(d) {
  const out = [];
  for (let i = 1; i < d.main.length; i++) {
    const [x0, r0] = d.main[i - 1], [x1, r1, how] = d.main[i], rise = r0 - r1;
    if (how === 'jump' && (rise > 1.5 || Math.abs(x1 - x0) > 3.01)) out.push(`✗ ${how} (${x0},${r0})→(${x1},${r1}) naik ${rise} jubin, jarak ${Math.abs(x1 - x0)}`);
    if (how === 'walk' && rise !== 0) out.push(`✗ walk berubah aras di (${x0},${r0})→(${x1},${r1})`);
    if (how === 'drop' && rise > 0) out.push(`✗ drop ke atas di (${x1},${r1})`);
  }
  return out.length ? out : ['✓ semua lompatan laluan utama: naik ≤ 1.5 jubin, jarak ≤ 3 jubin'];
}

// ── transition strips: exit of one level beside the entrance of the next ──
function slice(d, x0, x1, title, ends = {}) {
  const inR = (x) => x >= x0 - 1e-9 && x <= x1 + 1e-9, sh = (x) => x - x0;
  const rect = (a) => (a ?? []).filter((q) => q[1] > x0 && q[0] < x1).map((q) => [sh(Math.max(q[0], x0)), sh(Math.min(q[1], x1)), ...q.slice(2)]);
  const pts = (a) => (a ?? []).filter((q) => inR(q[0])).map((q) => [sh(q[0]), ...q.slice(1)]);
  return { ...d, title, width: x1 - x0, terrain: rect(d.terrain), slab: rect(d.slab), cave: rect(d.cave), deck: rect(d.deck), gate: rect(d.gate), water: rect(d.water),
    ladder: pts(d.ladder), math: pts(d.math), inter: pts(d.inter), cp: pts(d.cp), secret: pts(d.secret), mark: pts(d.mark), risk: [], coins: [],
    main: pts(d.main), opt: [], loops: [], curves: [], ...ends };
}
function writeRow(name, pairs) {
  const px = 16; const parts = []; let y = 44; let W = 0;
  for (let [a, b, caption] of pairs) {
    const ra = panel(a, { px, oy: y, label: a.title }), wa = ra.W;
    const rb = panel(b, { px, oy: 0, label: b.title });
    parts.push(ra.svg, `<g transform="translate(${wa + 60},0)">${rb.svg}</g>`, `<text x="${wa + 30}" y="${y + ra.H / 2}" font-size="28" text-anchor="middle" fill="${C.main}">➜</text>`);
    // place b at the same y
    parts[parts.length - 2] = `<g transform="translate(${wa + 60},${y})">${rb.svg}</g>`;
    y += Math.max(ra.H, rb.H) + 8;
    const lines = caption.flatMap((c) => { const out = []; let cur = ''; for (const w of c.split(' ')) { if ((cur + ' ' + w).length > 170) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } out.push(cur); return out; });
    caption = lines; caption.forEach((c, i) => parts.push(`<text x="6" y="${y + 14 + i * 15}" font-size="11" fill="${C.text}">${c}</text>`));
    y += caption.length * 15 + 26; W = Math.max(W, wa + 60 + rb.W, 1120);
  }
  fs.writeFileSync(new URL(name, OUT), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}" font-family="Arial, sans-serif"><rect width="100%" height="100%" fill="#fff"/><g transform="translate(8,8)">${LEGEND}</g>${parts.join('')}</svg>`);
}
writeRow('w1-transitions.svg', [
  [slice(L11, 92, 110, '1-1 KELUAR (x 92–110)', { showStart: false }), slice(L12, 0, 20, '1-2 MASUK (x 0–20)', { showEnd: false }), [
    'Keluar 1-1: Gerbang Taman di atas pelantar batu (baris 22) → papan tanda "Lembah Sungai" → tanah menurun ke kanan, sungai berkilau di bawah.',
    'Masuk 1-2: bermula pada rabung yang SAMA tinggi (baris 22); gerbang 1-1 kelihatan kecil di kiri; turun 3 langkah (22→23→24) ke tebing sungai.',
    'Dibawa: pokok oak/pain yang sama, gerbang kayu yang sama, sungai pertama kali dilihat dari atas. Tiada perubahan biome.']],
  [slice(L12, 74, 90, '1-2 KELUAR (x 74–90)', { showStart: false }), slice(L13, 0, 16, '1-3 MASUK (x 0–16)', { showEnd: false }), [
    'Keluar 1-2: selepas jambatan akhir, tangga batu lama naik ke pelantar (baris 22) + tugu batu; sungai menyempit ke kanan menjadi anak sungai.',
    'Masuk 1-3: anak sungai yang SAMA + tugu batu yang sama; runtuhan muncul di kanan. Aras tanah lebih rendah (baris 32) kerana dunia 1-3 lebih tinggi menegak: kamera bermula di tebing.',
    'Dibawa: batu runtuhan (l3-stone) mula muncul di empangan 1-2; air (kincir → empangan → akueduk); pokok hutan yang sama.']],
]);
write('w1-l1.svg', [{ d: current11(), label: 'SEMASA — geometri sebenar (src/v14/level.js)' }, { d: L11, label: 'CADANGAN — ' + L11.title }]);
write('w1-l2.svg', [{ d: current12(), label: 'SEMASA — geometri sebenar (twin-world.js)' }, { d: L12, label: 'CADANGAN — ' + L12.title }]);
write('w1-l3.svg', [{ d: current13(), label: 'SEMASA — geometri sebenar (inverse-world.js)' }, { d: L13, label: 'CADANGAN — ' + L13.title }]);
write('w2-l1.svg', [{ d: L21, label: L21.title + ' — Stesen A ikut hirisan yang diuji; B dan C rancangan' }]);
const report = { 'w1-l1': check(L11), 'w1-l2': check(L12), 'w1-l3': check(L13), 'w2-l1': check(L21) };
fs.writeFileSync(new URL('route-check.json', OUT), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
