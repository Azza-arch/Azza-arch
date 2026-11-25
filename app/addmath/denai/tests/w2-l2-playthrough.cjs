// Level 2-2 full playthrough with real physics: wrong tries at D, E and F (the mechanisms stay shut
// and the player cannot get past), right answers (steps rise, gate opens, lift rises), reload
// mid-run, finish, save isolation (World 1 and the 2-1 record untouched), phone touch.
// Usage: node tests/w2-l2-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8790/app/addmath/denai/w2-l2.html';
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPERS = () => {
  const W = window.__w2, s = () => W.scene, c = W.controls, T = 54;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const grounded = () => s().player.body.blocked.down || s().player.body.touching.down;
  window.__h = {
    state: () => { const sc = s(); return { x: +(sc.player.x / T).toFixed(2), feet: +((1400 - sc.player.body.bottom) / T).toFixed(2), cp: sc.run.checkpointId, solved: { ...sc.run.solved }, coins: sc.run.coins.length, mode: sc.mode }; },
    st: (id) => { const st = s().stations.find((q) => q.id === id); return { c: { ...st.c }, solved: st.solved, result: st.result?.result ?? (st.result ? (st.result.rings ?? st.result.full) : null) }; },
    async go(xT) {
      const x = xT * T; let still = 0;
      for (let i = 0; i < 1200; i++) {
        const sc = s(), d = x - sc.player.x;
        if (Math.abs(d) < 5 && Math.abs(sc.player.body.velocity.x) < 20) break;
        c.right = d > 4; c.left = d < -4;
        const bl = sc.player.body.blocked;
        if (grounded() && ((d > 0 && bl.right) || (d < 0 && bl.left))) { if (++still > 3) { c.jump = true; still = 0; } } else still = 0;
        await frame();
      }
      c.left = c.right = false; for (let i = 0; i < 20; i++) await frame();
      return this.state();
    },
  };
};
async function keys(p, list) { for (const k of list) { await p.keyboard.press(k); await sleep(130); } }

(async () => {
  const b = await chromium.launch(); const res = {}; const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const W1 = { 'denai-profile-v1': '{"schemaVersion":1,"levels":{"w1-l1":{"completions":2}}}' };
  const L1 = { schemaVersion: 1, levels: { 'w2-l1': { completions: 1, completedRuns: ['r'], bestMs: 60000, coins: ['c1'], run: null } } };
  await p.goto(URL); await p.evaluate(([w1, l1]) => { localStorage.clear(); for (const [k, v] of Object.entries(w1)) localStorage.setItem(k, v); localStorage.setItem('denai-w2-campaign-v1', JSON.stringify(l1)); }, [W1, L1]); await p.reload();
  await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS); await p.click('#w2-game');
  // ── D: (2, 3) is on the curve but the ball bounces; then the cliff stays unclimbable ──
  await p.evaluate(() => __h.go(8));
  await keys(p, ['e', 'x', 'x', 'f']); await sleep(2200);
  res.Dwrong = await p.evaluate(() => __h.st('D'));
  ok(res.Dwrong.c.x === 2 && res.Dwrong.c.y === 3 && res.Dwrong.result === 'bounce' && !res.Dwrong.solved, `D (2,3) bounces: ${JSON.stringify(res.Dwrong)}`);
  await p.screenshot({ path: `${out}/l22-1-d-melantun.png` });
  await p.evaluate(() => __h.go(20)); await sleep(900);
  res.DwrongTry = await p.evaluate(() => __h.state());
  ok(res.DwrongTry.feet < 1 && res.DwrongTry.x < 18.1, `D unsolved: the 4-tile cliff cannot be climbed ${JSON.stringify(res.DwrongTry)}`);
  await p.evaluate(() => __h.go(8));
  await keys(p, ['e', 'x', 'f']); await sleep(2200); // (3, 4)
  res.D = await p.evaluate(() => __h.st('D'));
  ok(res.D.solved && res.D.result === 'caught', 'D (3,4) caught');
  await sleep(900); await p.screenshot({ path: `${out}/l22-2-d-tangkap.png` });
  res.afterD = await p.evaluate(() => __h.go(20));
  ok(res.afterD.feet > 3.9 && res.afterD.cp === 'after-d', `climbs the stone steps to the plateau ${JSON.stringify(res.afterD)}`);
  // ── E: bell at 1.5 (jet only 7.5) → gate stays shut; then x = 2 rings ──
  await p.evaluate(() => __h.go(21.5));
  await keys(p, ['e', 'e', 'f']); await sleep(1800);
  res.Ewrong = await p.evaluate(() => __h.st('E'));
  ok(res.Ewrong.c.x === 1.5 && !res.Ewrong.solved, `E x=1.5 does not ring ${JSON.stringify(res.Ewrong)}`);
  await p.screenshot({ path: `${out}/l22-3-e-salah.png` });
  res.EwrongTry = await p.evaluate(() => __h.go(31));
  ok(res.EwrongTry.x < 29.1, `E unsolved: the gate blocks ${JSON.stringify(res.EwrongTry)}`);
  await p.evaluate(() => __h.go(21.5));
  await keys(p, ['e', 'f']); await sleep(1800);
  res.E = await p.evaluate(() => __h.st('E'));
  ok(res.E.solved, 'E x=2 rings');
  await p.screenshot({ path: `${out}/l22-4-e-betul.png` });
  await sleep(900);
  res.afterE = await p.evaluate(() => __h.go(32));
  ok(res.afterE.x > 31.5 && res.afterE.cp === 'after-e', `through the open gate ${JSON.stringify(res.afterE)}`);
  // ── reload mid-run ──
  await p.reload(); await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS); await p.click('#w2-game');
  res.reload = await p.evaluate(() => ({ ...__h.state(), D: __h.st('D').solved, E: __h.st('E').solved }));
  ok(res.reload.D && res.reload.E && Math.abs(res.reload.x - 32) < 0.6 && res.reload.feet > 3.9, `reload: D, E solved, spawn after the gate ${JSON.stringify(res.reload)}`);
  // ── F: x = 2 (area 8) → lift stays down; x = 3 (area 9) → lift up ──
  await p.evaluate(() => __h.go(33));
  await keys(p, ['e', 'f']); await sleep(600);
  res.Fwrong = await p.evaluate(() => __h.st('F'));
  ok(res.Fwrong.c.x === 2 && !res.Fwrong.solved, 'F x=2: 8 crates only');
  await p.screenshot({ path: `${out}/l22-5-f-salah.png` });
  await p.evaluate(() => __h.go(47)); await sleep(900); // let the last hop against the cliff land
  res.FwrongTry = await p.evaluate(() => __h.state());
  ok(res.FwrongTry.feet < 4.5 && res.FwrongTry.x < 45.1, `F unsolved: the exit cliff cannot be climbed ${JSON.stringify(res.FwrongTry)}`);
  await p.evaluate(() => __h.go(33));
  await keys(p, ['e', 'f']); await sleep(1200);
  res.F = await p.evaluate(() => __h.st('F'));
  ok(res.F.solved, 'F x=3 holds all 9 crates');
  await p.screenshot({ path: `${out}/l22-6-f-betul.png` });
  res.afterF = await p.evaluate(() => __h.go(47));
  ok(res.afterF.feet > 7.9, `up the cargo lift to the exit ledge ${JSON.stringify(res.afterF)}`);
  // ── finish ──
  await p.evaluate(() => __h.go(54.3)); await sleep(700);
  res.finish = await p.evaluate(() => ({ open: document.getElementById('w2-done').open, stats: document.getElementById('w2-done-stats').textContent, save: JSON.parse(localStorage.getItem('denai-w2-campaign-v1')) }));
  ok(res.finish.open && res.finish.save.levels['w2-l2'].completions === 1, 'finish dialog, one 2-2 completion');
  ok(res.finish.save.levels['w2-l1'].completions === 1 && res.finish.save.levels['w2-l1'].bestMs === 60000, '2-1 record untouched');
  await p.screenshot({ path: `${out}/l22-7-tamat.png` });
  res.w1 = await p.evaluate((w1) => Object.entries(w1).every(([k, v]) => localStorage.getItem(k) === v), W1);
  ok(res.w1, 'World 1 save unchanged');
  res.keys = await p.evaluate(() => Object.keys(localStorage).sort());
  ok(res.keys.every((k) => k === 'denai-w2-campaign-v1' || k === 'denai-profile-v1'), `only the World 2 key written: ${res.keys}`);
  res.errs = errs; ok(!errs.length, `no page errors: ${errs.join(' | ')}`);
  await ctx.close();
  // ── phone landscape ──
  const pc = await b.newContext({ ...devices['iPhone 13 landscape'] }); const pp = await pc.newPage(); const perr = [];
  pp.on('pageerror', (e) => perr.push(e.message));
  await pp.goto(URL); await pp.evaluate(() => localStorage.clear()); await pp.reload(); await pp.waitForFunction(() => window.__w2?.scene?.player); await sleep(700);
  await pp.evaluate(HELPERS); await pp.evaluate(() => __h.go(8));
  for (const sel of ['[data-action="l1Up"]', '[data-action="l1Up"]', '[data-action="l2Up"]', '[data-action="l2Up"]', '[data-action="l2Up"]']) { await pp.locator(sel).tap(); await sleep(150); }
  await pp.locator('#w2-lock').tap(); await sleep(2400);
  res.phone = await pp.evaluate(() => ({ D: __h.st('D'), touch: !document.getElementById('w2-touch').hidden }));
  ok(res.phone.touch && res.phone.D.solved, `phone: touch levers + Tembak catch the ball ${JSON.stringify(res.phone)}`);
  ok(!perr.length, `phone: no errors ${perr}`);
  await pp.screenshot({ path: `${out}/l22-8-telefon.png` });
  await pc.close(); await b.close();
  console.log(JSON.stringify(res, null, 1));
  console.log(fails.length ? `w2-l2-playthrough: FAIL\n - ${fails.join('\n - ')}` : 'w2-l2-playthrough: PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
