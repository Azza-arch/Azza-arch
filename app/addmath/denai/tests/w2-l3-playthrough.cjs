// Level 2-3 full playthrough with real physics: wrong tries at G (pontoon off a root), H (chain too
// high), P (wrong c) and Q (band too wide), right answers (pontoon bridge, drawbridge, both seals →
// gate), falling into the river, reload mid-run, World 2 complete, save isolation, phone touch.
// Usage: node tests/w2-l3-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8790/app/addmath/denai/w2-l3.html';
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPERS = () => {
  const W = window.__w2, s = () => W.scene, c = W.controls, T = 54;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const grounded = () => s().player.body.blocked.down || s().player.body.touching.down;
  window.__h = {
    state: () => { const sc = s(); return { x: +(sc.player.x / T).toFixed(2), feet: +((1400 - sc.player.body.bottom) / T).toFixed(2), cp: sc.run.checkpointId, solved: { ...sc.run.solved }, coins: sc.run.coins.length, mode: sc.mode }; },
    st: (id) => { const st = s().stations.find((q) => q.id === id); return { c: { ...st.c }, solved: st.solved, result: st.result ?? null }; },
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
  const PREV = { schemaVersion: 1, levels: { 'w2-l1': { completions: 1, completedRuns: ['a'], bestMs: 60000, coins: [], run: null }, 'w2-l2': { completions: 1, completedRuns: ['b'], bestMs: 90000, coins: [], run: null } } };
  await p.goto(URL); await p.evaluate(([w1, prev]) => { localStorage.clear(); for (const [k, v] of Object.entries(w1)) localStorage.setItem(k, v); localStorage.setItem('denai-w2-campaign-v1', JSON.stringify(prev)); }, [W1, PREV]); await p.reload();
  await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS); await p.click('#w2-game');
  // ── the river cannot be crossed before Station G ──
  await p.evaluate(() => __h.go(16)); await sleep(900);
  res.riverFirst = await p.evaluate(() => __h.state());
  ok(res.riverFirst.x < 9.5 && !res.riverFirst.solved.G, `river blocks before G ${JSON.stringify(res.riverFirst)}`);
  // ── G: pontoon at 2 (chain 3 under water) fails; 1 and 5 hold ──
  await p.evaluate(() => __h.go(7));
  await keys(p, ['q', 'x', 'x', 'f']); await sleep(400); // kiri 3 → 2, kanan 3 → 5
  res.Gwrong = await p.evaluate(() => __h.st('G'));
  ok(res.Gwrong.c.kiri === 2 && res.Gwrong.c.kanan === 5 && !res.Gwrong.solved && res.Gwrong.result && !res.Gwrong.result.holds, `G (2,5) does not hold ${JSON.stringify(res.Gwrong)}`);
  await keys(p, ['q', 'f']); await sleep(900); // kiri → 1
  res.G = await p.evaluate(() => __h.st('G'));
  ok(res.G.solved, 'G (1,5) holds');
  await p.screenshot({ path: `${out}/l23-1-ponton.png` });
  res.afterG = await p.evaluate(() => __h.go(17));
  ok(res.afterG.x > 16.5 && res.afterG.cp === 'after-g', `across the pontoon bridge ${JSON.stringify(res.afterG)}`);
  // ── H: c = 10 (no contact) fails; c = 9 fills the bucket ──
  await p.evaluate(() => __h.go(18.5));
  await keys(p, ['e', 'e', 'e', 'e', 'e', 'f']); await sleep(400);
  res.Hwrong = await p.evaluate(() => __h.st('H'));
  ok(res.Hwrong.c.c === 10 && !res.Hwrong.solved && res.Hwrong.result?.kind === 'none', `H c=10: no contact ${JSON.stringify(res.Hwrong)}`);
  await p.evaluate(() => __h.go(27)); await sleep(900);
  res.HwrongTry = await p.evaluate(() => __h.state());
  ok(res.HwrongTry.x < 20.5, `pool blocks before H ${JSON.stringify(res.HwrongTry)}`);
  await p.evaluate(() => __h.go(18.5));
  await keys(p, ['q', 'f']); await sleep(900);
  res.H = await p.evaluate(() => __h.st('H'));
  ok(res.H.solved && res.H.c.c === 9, 'H c=9 touches once');
  await p.screenshot({ path: `${out}/l23-2-rantai.png` });
  res.afterH = await p.evaluate(() => __h.go(28));
  ok(res.afterH.x > 27.5 && res.afterH.cp === 'after-h', `across the drawbridge ${JSON.stringify(res.afterH)}`);
  // ── reload mid-run ──
  await p.reload(); await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(700); await p.evaluate(HELPERS); await p.click('#w2-game');
  res.reload = await p.evaluate(() => ({ ...__h.state(), G: __h.st('G').solved, H: __h.st('H').solved }));
  ok(res.reload.G && res.reload.H && Math.abs(res.reload.x - 27.5) < 0.6, `reload: G, H solved, spawn at the seals ${JSON.stringify(res.reload)}`);
  // ── the gate blocks before the seals ──
  await p.evaluate(() => __h.go(40)); await sleep(900);
  res.gateFirst = await p.evaluate(() => __h.state());
  ok(res.gateFirst.x < 38.1, `gate blocks before the seals ${JSON.stringify(res.gateFirst)}`);
  // ── P: b −2 → −8, c 4 → 10 fails; c → 12 lights ──
  await p.evaluate(() => __h.go(29));
  await keys(p, ['q', 'q', 'q', 'x', 'x', 'x', 'f']); await sleep(400);
  res.Pwrong = await p.evaluate(() => __h.st('P'));
  ok(res.Pwrong.c.b === -8 && res.Pwrong.c.c === 10 && !res.Pwrong.solved, `P (−8,10) not lit ${JSON.stringify(res.Pwrong)}`);
  await keys(p, ['x', 'f']); await sleep(500);
  res.P = await p.evaluate(() => __h.st('P'));
  ok(res.P.solved, 'P (−8,12) lit');
  // ── Q: kiri 0 → 2, kanan 8 → 7 (too wide) fails; kanan → 6 lights; the gate opens ──
  await p.evaluate(() => __h.go(34));
  await keys(p, ['e', 'e', 'z', 'f']); await sleep(400);
  res.Qwrong = await p.evaluate(() => __h.st('Q'));
  ok(res.Qwrong.c.kiri === 2 && res.Qwrong.c.kanan === 7 && !res.Qwrong.solved && res.Qwrong.result?.tooWide, `Q 2<x<7 too wide ${JSON.stringify(res.Qwrong)}`);
  await keys(p, ['z', 'f']); await sleep(1300);
  res.Q = await p.evaluate(() => __h.st('Q'));
  ok(res.Q.solved, 'Q 2<x<6 lit');
  await p.screenshot({ path: `${out}/l23-3-meterai.png` });
  // ── through the gate: World 2 complete ──
  await p.evaluate(() => __h.go(46.9)); await sleep(800);
  res.finish = await p.evaluate(() => ({ open: document.getElementById('w2-done').open, title: document.getElementById('w2-done-title').textContent, save: JSON.parse(localStorage.getItem('denai-w2-campaign-v1')) }));
  ok(res.finish.open && res.finish.save.levels['w2-l3'].completions === 1, `finish: World 2 complete ${res.finish.title}`);
  ok(res.finish.save.levels['w2-l1'].bestMs === 60000 && res.finish.save.levels['w2-l2'].bestMs === 90000, '2-1 and 2-2 records untouched');
  await p.screenshot({ path: `${out}/l23-4-tamat.png` });
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
  await pp.evaluate(HELPERS); await pp.evaluate(() => __h.go(7));
  for (const sel of ['[data-action="l1Down"]', '[data-action="l1Down"]', '[data-action="l2Up"]', '[data-action="l2Up"]']) { await pp.locator(sel).tap(); await sleep(150); }
  await pp.locator('#w2-lock').tap(); await sleep(900);
  res.phone = await pp.evaluate(() => ({ G: __h.st('G'), touch: !document.getElementById('w2-touch').hidden }));
  ok(res.phone.touch && res.phone.G.solved, `phone: touch levers place the pontoons ${JSON.stringify(res.phone)}`);
  ok(!perr.length, `phone: no errors ${perr}`);
  await pp.screenshot({ path: `${out}/l23-5-telefon.png` });
  await pc.close(); await b.close();
  console.log(JSON.stringify(res, null, 1));
  console.log(fails.length ? `w2-l3-playthrough: FAIL\n - ${fails.join('\n - ')}` : 'w2-l3-playthrough: PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
