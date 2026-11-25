// Level 2-1 full playthrough with real physics (keyboard levers, real jumps), wrong attempts at
// B and C, reload mid-run, finish, save isolation, and a phone-landscape check.
// Usage: node tests/w2-l1-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8790/app/addmath/denai/w2-l1.html';
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPERS = () => {
  const W = window.__w2, s = () => W.scene, c = W.controls, T = 54;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const grounded = () => s().player.body.blocked.down || s().player.body.touching.down;
  window.__h = {
    state: () => { const sc = s(); return { x: +(sc.player.x / T).toFixed(2), feet: +((1400 - sc.player.body.bottom) / T).toFixed(2), grounded: grounded(), cp: sc.run.checkpointId, solved: { ...sc.run.solved }, coins: sc.run.coins.length, mode: sc.mode }; },
    st: (id) => { const st = s().stations.find((q) => q.id === id); return { c: { ...st.c }, locked: st.locked, solved: st.solved, success: st.analysis?.success ?? null, factors: st.analysis?.factors ?? null }; },
    // walk toward x (tiles); hop over a step when blocked
    async go(xT) {
      const x = xT * T; let still = 0;
      for (let i = 0; i < 900; i++) {
        const sc = s(), d = x - sc.player.x;
        if (Math.abs(d) < 5 && Math.abs(sc.player.body.velocity.x) < 20) break;
        c.right = d > 4; c.left = d < -4;
        const bl = sc.player.body.blocked; // pushing against a step: hop up it
        if (grounded() && ((d > 0 && bl.right) || (d < 0 && bl.left))) { if (++still > 3) { c.jump = true; still = 0; } } else still = 0;
        await frame();
      }
      c.left = c.right = false; for (let i = 0; i < 20; i++) await frame();
      return this.state();
    },
    // one jump steering toward x (tiles); resolves when landed or fallen back to a checkpoint
    async hop(xT, maxFrames = 200) {
      const x = xT * T, sc = s(); c.jump = true; let left = false;
      for (let i = 0; i < maxFrames; i++) {
        await frame();
        const b = sc.player.body, d = x - sc.player.x; c.right = d > 5; c.left = d < -5;
        if (b.velocity.y < 0) left = true;
        if (left && grounded() && Math.abs(b.velocity.y) < 1) break;
      }
      c.left = c.right = false; for (let i = 0; i < 12; i++) await frame();
      return this.state();
    },
  };
};

async function keys(p, list) { for (const k of list) { await p.keyboard.press(k); await sleep(120); } }

(async () => {
  const b = await chromium.launch(); const res = {}; const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  // a World 1 player's saves must survive untouched
  const W1 = { 'denai-profile-v1': '{"schemaVersion":1,"levels":{"w1-l1":{"completions":2}}}', 'denai-campaign-v1': '{"schemaVersion":1,"levels":{}}' };
  await p.goto(URL); await p.evaluate((w1) => { localStorage.clear(); for (const [k, v] of Object.entries(w1)) localStorage.setItem(k, v); }, W1); await p.reload();
  await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS);
  await p.click('#w2-game');
  res.start = await p.evaluate(() => __h.state());
  // ── Station A: Q twice (1 → ½ → −½), F ──
  await p.evaluate(() => __h.go(19));
  await keys(p, ['q', 'q', 'f']);
  res.A = await p.evaluate(() => __h.st('A'));
  ok(res.A.c.a === -0.5 && res.A.locked && res.A.success, 'A: a = -1/2 locked and valid');
  for (const x of [20.8, 21.5, 22.5, 23.5, 24.5, 25.5, 27.5]) await p.evaluate((x) => (x === 20.8 ? __h.go(x) : __h.hop(x)), x);
  res.afterA = await p.evaluate(() => __h.state());
  ok(res.afterA.solved.A && res.afterA.cp === 'after-a', 'A solved, checkpoint after-a');
  await p.screenshot({ path: `${out}/l21-1-selepas-a.png` });
  // ── Station B: wrong (5, 3) first, physically ──
  await p.evaluate(() => __h.go(34.5));
  res.Bstart = await p.evaluate(() => __h.st('B'));
  await keys(p, ['e', 'e', 'x', 'f']); // h 3 → 5, k 2 → 3
  res.Bwrong = await p.evaluate(() => __h.st('B'));
  ok(res.Bwrong.c.h === 5 && res.Bwrong.c.k === 3 && res.Bwrong.success === false && res.Bwrong.factors.includes('loose'), 'B (5,3) fails: misses the rings, nothing hardens');
  await p.screenshot({ path: `${out}/l21-2-b-salah.png` });
  await p.evaluate(() => __h.go(36.8));
  res.BwrongTry = await p.evaluate(() => __h.hop(39.5));
  await sleep(400); res.BafterFall = await p.evaluate(() => __h.state());
  ok(!res.BafterFall.solved.B && res.BafterFall.x < 30, 'B wrong: the player cannot cross (back to the checkpoint)');
  // right answer: k 3 → 4
  await p.evaluate(() => __h.go(34.5));
  await keys(p, ['x', 'f']);
  res.B = await p.evaluate(() => __h.st('B'));
  ok(res.B.c.h === 5 && res.B.c.k === 4 && res.B.success, 'B (5,4) valid');
  // route: the stones 2, 3½, 4, 3½, 2 at x = 3…7 (global 37.5…41.5), one hop each, then the bank
  await p.evaluate(() => __h.go(36.8));
  res.Bhops = [];
  for (const x of [37.5, 38.5, 39.5, 40.5, 41.5, 43]) res.Bhops.push(await p.evaluate((x) => __h.hop(x), x));
  await p.screenshot({ path: `${out}/l21-3-b-betul.png` });
  res.afterB = await p.evaluate(() => __h.go(44.5));
  ok(res.afterB.solved.B && res.afterB.cp === 'after-b', 'B solved, checkpoint after-b');
  // ── reload mid-run: solved stations and checkpoint come back ──
  await p.reload(); await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS); await p.click('#w2-game');
  res.reload = await p.evaluate(() => ({ ...__h.state(), A: __h.st('A'), B: __h.st('B') }));
  ok(res.reload.solved.A && res.reload.solved.B && res.reload.A.locked && res.reload.B.locked && Math.abs(res.reload.x - 45) < 0.6, 'reload: A, B still solved, spawn at after-b');
  // ── Station C: wrong k = 2, then k = 1 ──
  await p.evaluate(() => __h.go(51.5));
  await keys(p, ['q', 'f']); // k 3 → 2
  res.Cwrong = await p.evaluate(() => __h.st('C'));
  ok(res.Cwrong.c.k === 2 && res.Cwrong.success === false && res.Cwrong.factors.includes('loose'), 'C k=2 fails: the cable misses the anchors');
  await p.evaluate(() => __h.go(53.7)); await p.evaluate(() => __h.hop(54.5)); await p.evaluate(() => __h.go(55.3));
  res.CwrongTry = await p.evaluate(async () => { await __h.hop(57.5); await __h.hop(58.5); return __h.state(); });
  await p.screenshot({ path: `${out}/l21-4-c-salah.png` });
  ok(!res.CwrongTry.solved.C && res.CwrongTry.x < 57.1, 'C k=2: no bridge, the player cannot cross');
  await p.evaluate(() => __h.go(51.5));
  await keys(p, ['q', 'f']); // k 2 (locked: unlocks) → 1, lock
  res.C = await p.evaluate(() => __h.st('C'));
  ok(res.C.c.k === 1 && res.C.success, 'C k=1 valid');
  await p.evaluate(() => __h.go(53.7));
  for (const x of [54.5, 55.5, 56.5, 57.5, 58.5, 60.5]) await p.evaluate((x) => __h.hop(x), x);
  res.afterC = await p.evaluate(() => __h.state());
  ok(res.afterC.solved.C, 'C solved');
  await p.screenshot({ path: `${out}/l21-5-selepas-c.png` });
  // ── finish ──
  await p.evaluate(() => __h.go(68.3)); await sleep(600);
  res.finish = await p.evaluate(() => ({ open: document.getElementById('w2-done').open, stats: document.getElementById('w2-done-stats').textContent, rec: JSON.parse(localStorage.getItem('denai-w2-campaign-v1')).levels['w2-l1'] }));
  ok(res.finish.open && res.finish.rec.completions === 1, 'finish dialog, one completion saved');
  await p.screenshot({ path: `${out}/l21-6-tamat.png` });
  res.keys = await p.evaluate(() => Object.keys(localStorage).sort());
  res.w1 = await p.evaluate((w1) => Object.entries(w1).every(([k, v]) => localStorage.getItem(k) === v), W1);
  ok(res.w1, 'World 1 saves byte-for-byte unchanged');
  ok(res.keys.every((k) => k === 'denai-w2-campaign-v1' || k in W1 || /^denai-(audio|settings|lb|device|analytics)/.test(k)), `only the World 2 key written: ${res.keys}`);
  res.errs = errs; ok(!errs.length, `no page errors: ${errs.join(' | ')}`);
  await ctx.close();
  // ── phone landscape: loads, touch buttons, levers usable by touch ──
  const pc = await b.newContext({ ...devices['iPhone 13 landscape'] }); const pp = await pc.newPage(); const perr = [];
  pp.on('pageerror', (e) => perr.push(e.message));
  await pp.goto(URL); await pp.evaluate(() => localStorage.clear()); await pp.reload(); await pp.waitForFunction(() => window.__w2?.scene?.player); await sleep(700);
  await pp.evaluate(HELPERS); await pp.evaluate(() => __h.go(19));
  await pp.locator('[data-action="l1Down"]').tap(); await sleep(150); await pp.locator('[data-action="l1Down"]').tap(); await sleep(150); await pp.locator('#w2-lock').tap(); await sleep(500);
  res.phone = await pp.evaluate(() => ({ A: __h.st('A'), touch: !document.getElementById('w2-touch').hidden, zoom: __w2.scene.cameras.main.zoom }));
  ok(res.phone.touch && res.phone.A.locked && res.phone.A.c.a === -0.5, 'phone: touch levers work');
  ok(!perr.length, `phone: no errors ${perr}`);
  await pp.screenshot({ path: `${out}/l21-7-telefon.png` });
  await pc.close(); await b.close();
  console.log(JSON.stringify(res, null, 1));
  console.log(fails.length ? `w2-l1-playthrough: FAIL\n - ${fails.join('\n - ')}` : 'w2-l1-playthrough: PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
