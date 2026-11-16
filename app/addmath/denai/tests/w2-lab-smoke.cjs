// Brief browser checks for the World 2 Station A slice: keyboard, touch, collision, real jumps.
const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8790/app/addmath/denai/lab-w2.html';
const out = process.argv[2] || "."; // screenshot folder
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// In-page helpers (real physics, driven through the same controls object as the touch buttons).
const HELPERS = () => {
  const L = window.__lab, s = L.scene, c = L.controls;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  window.__h = {
    state: () => ({ a: s.a, locked: s.locked, solved: s.solved, x: Math.round(s.player.x), bottom: Math.round(s.player.body.bottom), grounded: s.player.body.blocked.down || s.player.body.touching.down }),
    async walkTo(x) { for (let i = 0; i < 400; i++) { const d = x - s.player.x; if (Math.abs(d) < 4 && Math.abs(s.player.body.velocity.x) < 20) break; c.right = d > 3; c.left = d < -3; await frame(); } c.left = c.right = false; for (let i = 0; i < 20; i++) await frame(); },
    // Jump and steer toward targetX; resolve once landed (or fallen in).
    async hop(targetX, { maxFrames = 240, onPeak } = {}) {
      c.jump = true; let left = false, minBottom = Infinity, peakShot = false;
      for (let i = 0; i < maxFrames; i++) {
        await frame();
        const b = s.player.body; minBottom = Math.min(minBottom, b.bottom);
        const d = targetX - s.player.x; c.right = d > 5; c.left = d < -5;
        if (b.velocity.y < 0) left = true;
        if (onPeak && !peakShot && left && b.velocity.y > 0) { peakShot = true; window.__peakHit = true; }
        if (left && (b.blocked.down || b.touching.down) && Math.abs(b.velocity.y) < 1) break;
        if (b.bottom > 1480) break;
      }
      c.left = c.right = false; for (let i = 0; i < 12; i++) await frame();
      return { ...this.state(), minBottom: Math.round(minBottom) };
    },
    stoneBodies: () => s.solids.getChildren().filter((o) => o.getData('stone')).map((o) => ({ x: o.getData('stone').x, y: o.getData('stone').y, top: o.body.top, left: o.body.left, width: o.body.width, expectTop: L.wy(o.getData('stone').y), expectLeft: L.wx(o.getData('stone').x - .5) })),
    async peakOnFlat() { await this.walkTo(150); const start = s.player.body.bottom; c.jump = true; let min = start; for (let i = 0; i < 90; i++) { await frame(); min = Math.min(min, s.player.body.bottom); } return start - min; },
    async reachOnFlat() { // run-up jump: horizontal distance until feet are back at take-off height
      s.respawn(40); for (let i = 0; i < 10; i++) await frame();
      c.right = true; for (let i = 0; i < 40; i++) await frame();
      const x0 = s.player.x, y0 = s.player.body.bottom; c.jump = true; let up = false;
      let last = s.player.x; for (let i = 0; i < 120; i++) { const prevX = s.player.x; await frame(); if (s.player.body.bottom < y0 - 10) up = true; if (up && s.player.body.bottom >= y0 - 0.5) { last = prevX; break; } }
      const dx = s.player.x - x0; c.right = false; return dx;
    },
  };
};

async function press(p, key, n = 1) { for (let i = 0; i < n; i++) { await p.keyboard.press(key); await sleep(90); } }

(async () => {
  const b = await chromium.launch(); const res = {};
  // ── Desktop: keyboard, maths display, collision, real routes ──
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.waitForFunction(() => window.__lab?.scene?.player); await sleep(600);
  await p.evaluate(HELPERS);
  res.peakPx = await p.evaluate(() => __h.peakOnFlat());
  res.reachPx = await p.evaluate(() => __h.reachOnFlat());
  await p.evaluate(() => __lab.scene.respawn()); await sleep(300);
  await p.click('#lab-game'); // focus canvas
  // keyboard: walk to the lever with D, then Q/E/F
  await p.keyboard.down('KeyD'); await sleep(150); await p.keyboard.up('KeyD'); await sleep(300);
  await p.evaluate(() => __h.walkTo(__lab.wx(-1.5)));
  res.kbStart = await p.evaluate(() => __h.state());
  await p.screenshot({ path: `${out}/1-sebelum-a1.png` });
  await press(p, 'q', 2); // 1 → ½ → −½
  res.kbAfterQ2 = await p.evaluate(() => ({ a: __lab.scene.a, eq: document.getElementById('lab-eq').textContent, why: document.getElementById('lab-why').textContent }));
  await sleep(300); await p.screenshot({ path: `${out}/2-selepas-a-negatif-separuh.png` });
  await press(p, 'q', 1); // −1
  res.kbAfterQ3 = await p.evaluate(() => __lab.scene.a);
  await press(p, 'f'); await sleep(500);
  res.lockMinus1 = await p.evaluate(() => ({ locked: __lab.scene.locked, analysis: __lab.scene.lastAnalysis, stones: __h.stoneBodies(), tag: __lab.scene.failTag.visible && __lab.scene.failTag.text }));
  // unsuitable attempt, real physics: from the bank edge, try to reach stone (2, 3)
  await p.evaluate(() => __h.walkTo(__lab.wx(0.5) - 12));
  const failShot = p.evaluate(() => __h.hop(__lab.wx(2), { onPeak: true }));
  await p.waitForFunction(() => window.__peakHit === true, null, { timeout: 5000 }).catch(() => {});
  await p.screenshot({ path: `${out}/3-percubaan-tidak-sesuai-a-1.png` });
  res.failHop1 = await failShot;
  // if they landed on the low stone (1, 0), try again from there (still real physics)
  if (res.failHop1.bottom < 1480) res.failHop2 = await p.evaluate(() => __h.hop(__lab.wx(2)));
  await sleep(400);
  res.afterFall = await p.evaluate(() => __h.state());
  // retry: R (restart key) puts the player back by the lever; E (up) once to −½, then F
  await press(p, 'r'); await sleep(200);
  await p.evaluate(() => __h.walkTo(__lab.wx(-1.5)));
  await press(p, 'e', 1); await press(p, 'f'); await sleep(500);
  res.lockHalf = await p.evaluate(() => ({ a: __lab.scene.a, locked: __lab.scene.locked, analysis: __lab.scene.lastAnalysis.success, stones: __h.stoneBodies() }));
  res.collisionMatches = res.lockHalf.stones.every((s) => Math.abs(s.top - s.expectTop) < 0.01 && Math.abs(s.left - s.expectLeft) < 0.01 && s.width === 54);
  // successful route, every hop with the real player
  const route = [];
  await p.evaluate(() => __h.walkTo(__lab.wx(0.5) - 12));
  route.push(['ke (1,2)', await p.evaluate(() => __h.hop(__lab.wx(1)))]);
  route.push(['ke (2,3.5)', await p.evaluate(() => __h.hop(__lab.wx(2)))]);
  route.push(['ke puncak (3,4)', await p.evaluate(() => __h.hop(__lab.wx(3)))]);
  await sleep(200); await p.screenshot({ path: `${out}/4-laluan-berjaya-di-puncak.png` });
  route.push(['ke (4,3.5)', await p.evaluate(() => __h.hop(__lab.wx(4)))]);
  route.push(['ke (5,2)', await p.evaluate(() => __h.hop(__lab.wx(5)))]);
  route.push(['ke tebing kanan', await p.evaluate(() => __h.hop(__lab.wx(6.5)))]);
  await sleep(500); await p.screenshot({ path: `${out}/5-laluan-berjaya-tamat.png` });
  res.route = route.map(([k, v]) => `${k}: x=${v.x} kaki=${v.bottom} grounded=${v.grounded}`);
  res.expectTops = { s1: 1400 - 2 * 54, s2: 1400 - 3.5 * 54, col: 1400 - 4 * 54, bank: 1400 - 0.5 * 54 };
  res.solved = await p.evaluate(() => __lab.scene.solved);
  // every wrong value, real physics: try the best single hop from the bank toward each stone
  res.wrongTried = {};
  for (const [a, steps] of [[-2, 2], [0.5, 0], [2, 0]]) {
    await press(p, 'r'); await sleep(150);
    await p.evaluate((a) => { const s = __lab.scene; if (s.locked) s.unlock(); s.a = a; s.lock(); s.refresh(); }, a);
    await p.evaluate(() => __h.walkTo(__lab.wx(0.5) - 12));
    const r1 = await p.evaluate(() => __h.hop(__lab.wx(2)));
    const r2 = r1.bottom < 1480 ? await p.evaluate(() => __h.hop(__lab.wx(3))) : null;
    const r3 = r2 && r2.bottom < 1480 ? await p.evaluate(() => __h.hop(__lab.wx(4))) : null;
    res.wrongTried[a] = { hop1: r1, hop2: r2, hop3: r3, crossed: [r1, r2, r3].some((r) => r && r.x > __x5()) };
  }
  res.errs = errs; await ctx.close();

  // ── Phone (landscape, touch) ──
  const pc = await b.newContext({ ...devices['iPhone 13 landscape'] });
  const pp = await pc.newPage(); const perrs = []; pp.on('pageerror', (e) => perrs.push(e.message));
  await pp.goto(URL); await pp.waitForFunction(() => window.__lab?.scene?.player); await sleep(600);
  const hold = async (sel, ms) => { const el = pp.locator(sel); await el.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true }); await sleep(ms); await el.dispatchEvent('pointerup', { pointerId: 1, bubbles: true }); };
  res.touchVisible = await pp.isVisible('#lab-touch');
  const x0 = await pp.evaluate(() => __lab.scene.player.x);
  await hold('[data-hold="right"]', 450);
  await sleep(300);
  const x1 = await pp.evaluate(() => __lab.scene.player.x);
  res.touchMoved = Math.round(x1 - x0);
  await pp.evaluate(HELPERS); await pp.evaluate(() => __h.walkTo(__lab.wx(-1.5)));
  await pp.locator('[data-action="aDown"]').tap(); await sleep(150);
  await pp.locator('[data-action="aDown"]').tap(); await sleep(150);
  await pp.locator('#lab-lock').tap(); await sleep(600);
  res.touchState = await pp.evaluate(() => ({ a: __lab.scene.a, locked: __lab.scene.locked, zoom: __lab.scene.cameras.main.zoom, view: __lab.scene.viewUnits }));
  await pp.locator('[data-action="jump"]').tap(); await sleep(120);
  res.touchJumped = await pp.evaluate(() => __lab.scene.player.body.velocity.y < 0 || __lab.scene.player.body.bottom < 1372);
  await sleep(600);
  await pp.screenshot({ path: `${out}/6-telefon-landskap.png` });
  res.phoneErrs = perrs; await pc.close();
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
function __x5() { return 324 + 5.5 * 54; }
