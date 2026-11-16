// World 1 environment checks (structure, not looks): collision snapshot, crown overlaps,
// ladder landings, pipe continuity and tree branch joins, for all three levels.
// Usage: node tests/w1-env-check.cjs [snapshot.json]   (needs a server on :8790 at the repo root)
// With a snapshot path that exists, collision bodies are compared against it; otherwise it is written.
const { chromium } = require('playwright');
const fs = require('fs');
const snapPath = process.argv[2];
const CAPTURE = () => {
  let P;
  Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => {
    P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } };
  } });
};
const INSPECT = async (key) => {
  const g = window.__game;
  if (key) { g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(key); await new Promise((r) => setTimeout(r, 2500)); }
  const s = key ? g.scene.getScene(key) : g.scene.getScenes(true)[0];
  const bodies = s.solids.getChildren().map((o) => { const b = o.body; return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height), o.getData('oneWay') ? 1 : 0]; }).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const crowns = (s.treeCrowns || []).filter((c) => !c.fg);
  const overlaps = [];
  for (let i = 0; i < crowns.length; i++) for (let j = i + 1; j < crowns.length; j++) {
    const a = crowns[i], b = crowns[j];
    if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) overlaps.push(`${a.type}@${a.x} × ${b.type}@${b.x}`);
  }
  const tops = bodies.map(([x, y, w]) => ({ x, y, w }));
  const ladders = (s.ladderZones || []).map((z) => z.getData('ladder')).map((l) => {
    const on = (y) => tops.some((t) => Math.abs(t.y - y) <= 2 && l.x >= t.x - 2 && l.x <= t.x + t.w + 2);
    return { x: l.x, top: l.top, bottom: l.bottom, topLands: on(l.top), bottomLands: on(l.bottom) };
  });
  let pipe = null;
  if (s.pipeCells) {
    const c = s.pipeCells, gaps = [];
    for (let i = 1; i < c.length; i++) { const d = Math.abs(c[i].x - c[i - 1].x) + Math.abs(c[i].y - c[i - 1].y); if (d !== 54) gaps.push(i); }
    pipe = { cells: c.length, gaps, frames: c.map((q) => q.elbow ?? (q.horizontal ? 'h' : 'v')).join(' ') };
  }
  return { key: s.scene.key, bodies, overlaps, ladders, pipe };
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  await ctx.addInitScript(CAPTURE);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await new Promise((r) => setTimeout(r, 2500));
  const out = [];
  for (const key of [null, 'Jambatan', 'GerbangSongsang']) out.push(await p.evaluate(INSPECT, key));
  const joins = await p.evaluate(async () => { const m = await import('./src/v14/environment.js'); return m.treeJoinErrors ? m.treeJoinErrors() : 'n/a'; });
  await b.close();
  const report = { joins, errs, levels: out.map((l) => ({ key: l.key, bodies: l.bodies.length, crownOverlaps: l.overlaps, laddersNotLanding: l.ladders.filter((x) => !x.topLands || !x.bottomLands), pipe: l.pipe })) };
  if (snapPath) {
    const now = Object.fromEntries(out.map((l) => [l.key, l.bodies]));
    if (fs.existsSync(snapPath)) {
      const old = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
      report.collision = Object.fromEntries(Object.keys(now).map((k) => [k, JSON.stringify(old[k]) === JSON.stringify(now[k]) ? 'identical' : `CHANGED (${old[k]?.length} → ${now[k].length})`]));
    } else { fs.writeFileSync(snapPath, JSON.stringify(now)); report.collision = 'snapshot written'; }
  }
  console.log(JSON.stringify(report, null, 1));
})();
