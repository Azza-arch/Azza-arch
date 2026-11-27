// World 3 full playthroughs with real physics (all four levels): at every station a wrong setting is
// tried first (the mechanism stays shut and the player cannot get past: wall, cliff or acid), then the
// answer is set with the keyboard levers; the player walks, jumps and climbs to the goal. Also: reload
// mid-run keeps the progress, the World 1 / World 2 saves are untouched, and a phone run of 3-3.
// Usage: node tests/w3-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const BASE = 'http://localhost:8790/app/addmath/denai/';
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPERS = () => {
  const W = window.__w3, s = () => W.scene, c = W.controls, T = 54;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const grounded = () => s().player.body.blocked.down || s().player.body.touching.down;
  // is there something solid to stand on at world x, just below the feet?
  const solidAt = (x, feet) => s().solids.getChildren().some((b) => b.body && x >= b.body.left && x <= b.body.right && feet >= b.body.top - 6 && feet <= b.body.top + 40);
  window.__h = {
    state: () => { const sc = s(); return { x: +(sc.player.x / T).toFixed(2), feet: +((1400 - sc.player.body.bottom) / T).toFixed(2), cp: sc.run.checkpointId, solved: { ...sc.run.solved }, coins: sc.run.coins.length, mode: sc.mode }; },
    // walk to x (tiles); jump at walls and before gaps (as a player would)
    async go(xT, maxFrames = 1500) {
      const x = xT * T; let still = 0;
      for (let i = 0; i < maxFrames; i++) {
        const sc = s(), d = x - sc.player.x, dir = Math.sign(d), body = sc.player.body;
        if (Math.abs(d) < 6 && Math.abs(body.velocity.x) < 20 && grounded()) break;
        c.right = d > 5; c.left = d < -5;
        const bl = body.blocked;
        if (grounded()) {
          const wall = (d > 0 && bl.right) || (d < 0 && bl.left);
          const edge = Math.abs(d) > 40 && !solidAt(sc.player.x + dir * 30, body.bottom);
          if (wall) { if (++still > 3) { c.jump = true; still = 0; } } else { still = 0; if (edge) c.jump = true; }
        }
        await frame();
        if (c.jump) { await frame(); c.jump = false; }
      }
      c.left = c.right = false; for (let i = 0; i < 20; i++) await frame();
      return this.state();
    },
    lever: (id) => { const st = s().stations.find((q) => q.id === id); return { c: { ...st.c }, solved: st.solved, leverX: st.s.leverX }; },
  };
};
const KEYS = [['q', 'e'], ['z', 'x'], ['c', 'v']];
// keyboard presses that move each lever from its current value to the target value
async function setLevers(p, st, target) {
  const info = await p.evaluate((id) => { const s = window.__w3.scene.stations.find((q) => q.id === id); return { levers: s.st.levers, options: s.st.options, c: { ...s.c }, region: s.type === 'region' }; }, st);
  for (const [i, n] of info.levers.entries()) {
    const from = info.options[n].indexOf(info.c[n]), to = info.options[n].indexOf(target[n]);
    const k = info.region ? (from === to ? 0 : 1) : Math.abs(to - from), key = KEYS[i][info.region || to > from ? 1 : 0];
    for (let j = 0; j < k; j++) { await p.keyboard.press(key); await sleep(90); }
  }
}
const answerOf = (st) => st.answer ?? (st.type === 'intersect' ? { [st.levers[0]]: st.answers[0], [st.levers[1]]: st.answers[1] } : st.answers[0]);

(async () => {
  const b = await chromium.launch(); const fails = [], res = {};
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const KEEP = { 'denai-save-v14': '{"w1":"keep"}', 'denai-w2-campaign-v1': '{"schemaVersion":1,"levels":{"w2-l3":{"completions":1}}}' };
  for (const lid of ['w3-l1', 'w3-l2', 'w3-l3', 'w3-l4']) {
    await p.goto(BASE + lid + '.html');
    await p.evaluate((keep) => { for (const k of Object.keys(localStorage)) if (k.startsWith('denai-w3')) localStorage.removeItem(k); for (const [k, v] of Object.entries(keep)) localStorage.setItem(k, v); }, KEEP);
    await p.reload(); await p.waitForFunction(() => window.__w3?.scene?.player); await sleep(600); await p.evaluate(HELPERS); await p.click('#w2-game');
    const stations = await p.evaluate(() => window.__w3.L.stations.map((s) => ({ id: s.st.id, type: s.st.type, leverX: s.leverX, levers: s.st.levers, answer: s.st.answer, answers: s.st.answers, mech: s.mech, oy: s.oy, ox: s.ox, width: s.st.width, sx: s.st.sx })));
    for (const [i, st] of stations.entries()) {
      await p.evaluate((x) => __h.go(x), st.leverX);
      // a wrong try: the start levers (never an answer)
      await p.keyboard.press('f'); await sleep(1500);
      const wrong = await p.evaluate((id) => __h.lever(id), st.id);
      ok(!wrong.solved, `${lid} ${st.id}: start levers do not solve`);
      // past the mechanism (beyond the far side): cannot get there
      const far = st.mech.kind === 'walkway' ? st.ox + st.width * st.sx + 1 : st.mech.kind === 'bridge' ? st.mech.x + st.mech.span + 1 : st.mech.x + (st.mech.kind === 'gate' ? 2 : 4);
      const tried = await p.evaluate((x) => __h.go(x, 700), far);
      ok(tried.x < far - 0.6, `${lid} ${st.id}: blocked while unsolved ${JSON.stringify(tried)}`);
      if (i === 0) await p.screenshot({ path: `${out}/${lid}-salah.png` });
      // back to the lever (after a fall the player is back at the checkpoint), set the answer
      await p.evaluate((x) => __h.go(x), st.leverX);
      await setLevers(p, st.id, answerOf(st));
      await p.keyboard.press('f'); await sleep(1800);
      const right = await p.evaluate((id) => __h.lever(id), st.id);
      ok(right.solved, `${lid} ${st.id}: solved with ${JSON.stringify(right.c)}`);
      const past = await p.evaluate((x) => __h.go(x), far);
      ok(past.x > far - 0.6, `${lid} ${st.id}: crossed once solved ${JSON.stringify(past)}`);
      if (i === 0) { // reload mid-run: the solved station and its mechanism come back
        await p.reload(); await p.waitForFunction(() => window.__w3?.scene?.player); await sleep(600); await p.evaluate(HELPERS); await p.click('#w2-game');
        const back = await p.evaluate(() => __h.state());
        ok(back.solved[st.id] && back.cp !== 'entry', `${lid}: reload keeps ${st.id} and the checkpoint ${JSON.stringify(back)}`);
      }
    }
    const L = await p.evaluate(() => ({ goal: window.__w3.L.goal }));
    await p.evaluate((x) => __h.go(x), L.goal.x + 0.2); await sleep(800);
    res[lid] = await p.evaluate(() => ({ done: document.getElementById('complete').open, stats: ['completion-coins', 'completion-secrets', 'completion-time', 'completion-pb'].map((i) => document.getElementById(i).textContent).join(' · '), rec: JSON.parse(localStorage.getItem('denai-w3-campaign-v1')).levels }));
    ok(res[lid].done, `${lid}: finished`);
    ok(res[lid].rec[lid]?.completions === 1, `${lid}: one completion saved`);
    await p.screenshot({ path: `${out}/${lid}-tamat.png` });
  }
  const kept = await p.evaluate(() => [localStorage.getItem('denai-save-v14'), localStorage.getItem('denai-w2-campaign-v1')]);
  ok(kept[0] === '{"w1":"keep"}' && kept[1] === '{"schemaVersion":1,"levels":{"w2-l3":{"completions":1}}}', `World 1 / World 2 saves untouched ${kept}`);
  await ctx.close();
  // phone (landscape, touch): 3-3 loads, the three sign levers and the power button fit on screen
  const phone = await b.newContext({ ...devices['iPhone 13 landscape'] });
  const q = await phone.newPage(); q.on('pageerror', (e) => errs.push(e.message));
  await q.goto(BASE + 'w3-l3.html?touch'); await q.waitForFunction(() => window.__w3?.scene?.player); await sleep(800);
  await q.evaluate(() => { const { scene, wx } = window.__w3; scene.player.body.reset(wx(4.5), scene.stations[0].leverFeet - 31); }); await sleep(900);
  res.phone = await q.evaluate(() => { const r = document.getElementById('w2-tools').getBoundingClientRect(), j = document.querySelector('#w2-touch .jump').getBoundingClientRect(), a = document.querySelector('#w2-touch [data-hold="right"]').getBoundingClientRect(); return { w: innerWidth, h: innerHeight, left: r.left, right: r.right, top: r.top, arrowsRight: a.right, jumpLeft: j.left, touch: !document.getElementById('w2-touch').hidden }; });
  ok(res.phone.left >= res.phone.arrowsRight && res.phone.right <= res.phone.jumpLeft && res.phone.top > res.phone.h * .45 && res.phone.touch, `phone: levers sit between the arrows and the jump button ${JSON.stringify(res.phone)}`);
  await q.screenshot({ path: `${out}/w3-telefon.png` });
  await phone.close(); await b.close();
  ok(!errs.length, `page errors: ${errs.join(' | ')}`);
  console.log(JSON.stringify(res, null, 1).slice(0, 1500));
  console.log(fails.length ? `w3-playthrough: FAIL\n - ${fails.join('\n - ')}` : 'w3-playthrough: PASS');
  process.exit(fails.length ? 1 : 0);
})();
