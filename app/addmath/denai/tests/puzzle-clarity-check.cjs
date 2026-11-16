// Machine panels after the clarity pass, driven only through the panel buttons.
// 1-2: wrong tries → hint; x=2, f(g(x)) → 9 ✓; order → g(f(x)) → 25 ✓; bridge.
// 1-3: −3, ÷2 WITHOUT the demo → seal 13; a wrong step → hint → Undur; 7; 15.
// Usage: node tests/puzzle-clarity-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
async function run(b, tag, opts) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden); await sleep(600);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  const go = async (k) => { await p.evaluate((k) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(k); }, k); await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
  const click = async (sel) => { await p.evaluate((sel) => document.querySelector(sel).click(), sel); await sleep(1900); };
  const res = {};
  // ── 1-2 ──
  await go('Jambatan');
  await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); s.player.body.reset(1300, 1265); }); await sleep(800);
  const twin = () => p.evaluate(() => { const q = (s) => document.querySelector(s)?.textContent; return { heading: q('.twin-heading'), goals: [...document.querySelectorAll('.twin-goals li')].map((l) => l.textContent), x: q('[data-command="input"]'), order: q('[data-command="order"]'), trace: q('.twin-trace'), hint: q('.twin-hint'), routeButtons: document.querySelectorAll('[data-command^="route-"]').length }; });
  res.l2Start = await twin(); await p.screenshot({ path: `${out}/${tag}-1-2-mula.png` });
  await click('[data-command="input"]'); await click('[data-command="send"]'); await click('[data-command="send"]');
  res.l2AfterWrong = await twin(); await p.screenshot({ path: `${out}/${tag}-1-2-petunjuk.png` });
  for (let i = 0; i < 4; i++) await click('[data-command="input"]'); // 3 → 4 → 0 → 1 → 2
  await click('[data-command="send"]'); res.l2First = await twin();
  await click('[data-command="order"]'); await click('[data-command="send"]'); await sleep(600);
  res.l2Done = { ...(await twin()), bridge: await p.evaluate(() => !!window.__game.scene.getScene('Jambatan').bridges?.twins) };
  await p.screenshot({ path: `${out}/${tag}-1-2-siap.png` });
  // ── 1-3 ──
  await go('GerbangSongsang');
  await p.evaluate(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.player.body.reset(2700, 1585); }); await sleep(900);
  const inv = () => p.evaluate(() => { const q = (s) => document.querySelector(s)?.textContent; return { heading: q('.inverse-heading'), goal: q('.inverse-goal'), work: q('.inverse-work'), next: q('.inverse-order'), trace: q('.inverse-trace'), seals: window.__game.scene.getScene('GerbangSongsang').run.puzzle.seals }; });
  res.l3Start = await inv(); await p.screenshot({ path: `${out}/${tag}-1-3-mula.png` });
  await click('[data-action="subtract"]'); res.l3Step1 = await inv();
  await click('[data-action="divide"]'); res.l3Step2 = await inv(); await p.screenshot({ path: `${out}/${tag}-1-3-sedia-salur.png` });
  await click('[data-action="apply"]'); await sleep(400); res.l3Seal13 = await inv();
  await click('[data-action="multiply"]'); res.l3Wrong = await inv(); await p.screenshot({ path: `${out}/${tag}-1-3-salah.png` });
  await click('[data-action="undo"]'); await click('[data-action="subtract"]'); await click('[data-action="divide"]'); await click('[data-action="apply"]'); await sleep(400); res.l3Seal7 = await inv();
  await click('[data-action="subtract"]'); await click('[data-action="divide"]'); await click('[data-action="apply"]'); await sleep(800);
  res.l3Done = { ...(await inv()), bridge: await p.evaluate(() => window.__game.scene.getScene('GerbangSongsang').bridgeArt.length) };
  await p.screenshot({ path: `${out}/${tag}-1-3-siap.png` });
  res.errs = errs; await ctx.close(); return res;
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const res = { desktop: await run(b, 'desk', { viewport: { width: 1280, height: 720 } }), phone: await run(b, 'phone', { ...devices['iPhone 13 landscape'] }) };
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
