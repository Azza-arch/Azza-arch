// Day 05 · gameplay fixes (regression check for all six approved items):
//  1 (P1-A) E / Guna at the store door only opens the panel; buying only with Beli; no double buy.
//  2 (P1-B) the store panel fits the screen on every phone/tablet size (children included).
//  3 (P1-C) Level 1-2 prompt shows "Guna" on touch and "E" on keyboard; both still work.
//  4 (P2-A) "Bina jambatan bengkel dahulu" / "Pulihkan pintu air dahulu" are shown in full, no key cap.
//  5 (P2-B) the Journal closes the store and store keys do nothing behind it; both reopen.
//  6 (P2-C) after the mission the objective points to the finish.
// Usage: node tests/day05-gameplay-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
// PlayFab is stubbed and its host blocked.
const { chromium, devices } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const SEEDS = { l1: {}, l2: { 'denai-profile-v1': PROFILE }, l3: { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': L2DONE } };
const SCENE = { l1: 'Lorong', l2: 'Jambatan', l3: 'GerbangSongsang' };
const fails = [], errors = [];
const expect = (ok, msg) => { if (!ok) fails.push(msg); };
// Each section records its own failure and the next one still runs.
const section = async (name, fn) => { try { await fn(); } catch (e) { fails.push(`${name}: ${String(e.message).split('\n')[0]}`); } };
async function open(b, dev, level) {
  const ctx = await b.newContext(dev); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(`${level}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errors.push(`${level}: ${m.text()}`); });
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  await p.evaluate((seed) => { localStorage.clear(); for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v); }, SEEDS[level]); await p.reload(); await ready(p); await sleep(700);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap().catch(() => {}); await sleep(200); }
  await p.evaluate(() => document.getElementById('play-main').click());
  await p.waitForFunction((k) => window.__game.scene.getScene(k)?.mode === 'playing', SCENE[level], { timeout: 15000 }); await sleep(1200);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  return { ctx, p };
}
const ev = (p, key, fn, arg) => p.evaluate(([k, src, a]) => (new Function('s', 'a', `return (${src})(s,a)`))(window.__game.scene.getScene(k), a), [key, fn.toString(), arg]);
const tp = (p, key, x, feet) => ev(p, key, (s, a) => { s.player.body.reset(a.x, a.feet - 31); s.player.body.setVelocity(0, 0); }, { x, feet });
const prompt = (p) => p.evaluate(() => { const w = document.getElementById('world-prompt'), k = document.getElementById('world-prompt-key'); return w.hidden ? null : { key: k.hidden || getComputedStyle(k).display === 'none' ? null : k.textContent, text: document.getElementById('world-prompt-text').textContent }; });
const quest = (p) => ev(p, 'Lorong', (s) => JSON.parse(JSON.stringify({ ...s.run.quest, puzzle: undefined })));
const storeOpen = (p) => p.evaluate(() => !document.getElementById('store-panel').hidden);
const pin = (p) => p.evaluate(() => document.getElementById('qt-text')?.textContent);
const res = {};
// Panel measurement: every visible child inside the panel and inside the screen.
const MEASURE_STORE = () => {
  const st = document.getElementById('store-panel'); if (!st || st.hidden) return null; const b = st.getBoundingClientRect();
  const cs = getComputedStyle(st), L = b.left + parseFloat(cs.borderLeftWidth), Rr = b.right - parseFloat(cs.borderRightWidth), B = b.bottom - parseFloat(cs.borderBottomWidth); // inside the frame (padding box)
  const kids = [...st.querySelectorAll('button,output,p')].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return { el: e.id || e.className, inPanel: r.left >= L - 1 && r.right <= Rr + 1 && r.bottom <= B + 1, inScreen: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, clipped: e.scrollWidth > e.clientWidth + 1 }; });
  return { vw: innerWidth, vh: innerHeight, panel: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], scroll: [st.scrollWidth, st.clientWidth, st.scrollHeight, st.clientHeight], bad: kids.filter((k) => !k.inPanel || !k.inScreen || k.clipped).map((k) => k.el) };
};
const VIEWPORTS = [
  ['iphone-se-potret', devices['iPhone SE']], ['iphone-se-landskap', devices['iPhone SE landscape']],
  ['iphone-13-potret', devices['iPhone 13']], ['iphone-13-landskap', devices['iPhone 13 landscape']],
  ['pixel-5-potret', devices['Pixel 5']], ['pixel-5-landskap', devices['Pixel 5 landscape']],
  ['galaxy-s8-potret', devices['Galaxy S8']], ['galaxy-s8-landskap', devices['Galaxy S8 landscape']],
  ['ipad-mini-potret', devices['iPad Mini']], ['ipad-mini-landskap', devices['iPad Mini landscape']],
  ['desktop', { viewport: { width: 1280, height: 720 } }],
];
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const desk = { viewport: { width: 1280, height: 720 } }, phone = devices['iPhone 13'];

  // ── 1 + 5 (desktop): reopen never buys; Beli buys once; Journal closes the store.
  await section('1+5+6 (desktop 1-1)', async () => { const { ctx, p } = await open(b, desk, 'l1');
    await ev(p, 'Lorong', (s) => { Object.assign(s.run.quest, { found: true, key: true }); s.supply.key.destroy?.(); });
    await tp(p, 'Lorong', 2367, 1242); await sleep(700); await p.click('#game');
    await p.keyboard.press('KeyE'); await sleep(700); // opens the door + the panel
    res.firstOpen = { open: await storeOpen(p), msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought };
    for (let i = 0; i < 4; i++) await p.click('#sp-plus');
    await p.click('#sp-close'); await sleep(300);
    await p.keyboard.press('KeyE'); await sleep(600); // reopen with 5 selected
    res.reopen = { open: await storeOpen(p), msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought, qty: await p.textContent('#sp-qty') };
    await p.screenshot({ path: `${out}/1-buka-semula-tiada-beli.png` });
    expect(res.firstOpen.open && !res.firstOpen.bought && !res.firstOpen.msg, '1: first open shows the panel only');
    expect(res.reopen.open && res.reopen.bought === null && res.reopen.msg === '', '1: reopening the store does not buy');
    // a refused purchase, close, reopen → the old error is cleared and nothing is spent
    await p.click('#sp-minus'); await p.click('#sp-buy'); await sleep(200); res.refused = await p.textContent('#sp-msg');
    await p.click('#sp-close'); await sleep(300); await p.keyboard.press('KeyE'); await sleep(600);
    res.reopenAfterRefusal = { msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought };
    expect(/tak cukup/.test(res.refused) && res.reopenAfterRefusal.msg === '' && res.reopenAfterRefusal.bought === null, '1: refusal costs nothing and is cleared on reopen');
    // 5: Journal closes the store; E behind the Journal does nothing; both reopen.
    await p.keyboard.press('KeyJ'); await sleep(400);
    res.journal = { store: await storeOpen(p), journal: await p.evaluate(() => document.body.classList.contains('journal-open')) };
    await p.screenshot({ path: `${out}/5-jurnal-tutup-stor.png` });
    await p.keyboard.press('KeyE'); await sleep(400); res.eBehindJournal = (await quest(p)).bought;
    await V4.closeJournal(p); await p.keyboard.press('KeyE'); await sleep(600);
    res.reopenAfterJournal = await storeOpen(p);
    expect(!res.journal.store && res.journal.journal, '5: opening the Journal closes the store');
    expect(res.eBehindJournal === null, '5: store keys do nothing behind the Journal');
    expect(res.reopenAfterJournal, '5: the store reopens after the Journal closes');
    await V4.openJournal(p); await V4.closeJournal(p); res.journalReopens = true;
    // buy with Beli (qty 5), then a second click does not buy twice
    await p.keyboard.press('KeyE').catch(() => {}); await sleep(200);
    if (!(await storeOpen(p))) { await p.keyboard.press('KeyE'); await sleep(600); }
    const cur = Number(await p.textContent('#sp-qty')); for (let i = cur; i < 5; i++) await p.click('#sp-plus');
    await p.click('#sp-buy'); await sleep(150); await p.click('#sp-buy').catch(() => {}); await sleep(300);
    res.bought = (await quest(p)).bought; res.boughtMsg = await p.textContent('#sp-msg');
    expect(res.bought && res.bought.x === 5 && res.bought.cost === 26, '1: Beli buys the selected planks once (5 × RM4 + RM6 = RM26)');
    // 6: after the bridge, the objective points to the finish
    await sleep(1600); await tp(p, 'Lorong', 2510, 1242); await sleep(600); await p.keyboard.press('KeyE'); await sleep(2500); await V4.closeDialogue(p, { wait: 2500 }); await sleep(2500);
    res.l1done = await pin(p); await p.screenshot({ path: `${out}/6-l1-ke-penamat.png` });
    expect(res.l1done === 'Jambatan dibaiki ✓ · Ke penamat →', '6: 1-1 objective after the bridge');
    expect(await ev(p, 'Lorong', (s) => s.solvedGates.has('lift')), '6: progression unchanged (bridge gate solved)');
    await ctx.close(); });

  // ── 1 (touch): Guna at the door opens only; Guna while open does not buy; Beli buys.
  await section('1 (touch 1-1)', async () => { const { ctx, p } = await open(b, phone, 'l1');
    await ev(p, 'Lorong', (s) => { Object.assign(s.run.quest, { found: true, key: true, door: true }); s.supply.key.destroy?.(); });
    await tp(p, 'Lorong', 2367, 1242); await sleep(800);
    res.touchPrompt = await prompt(p);
    await p.locator('[data-action="interact"]').tap(); await sleep(700);
    res.touchOpen = { open: await storeOpen(p), msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought };
    await p.locator('[data-action="interact"]').tap().catch(() => {}); await sleep(500);
    res.touchGunaWhileOpen = (await quest(p)).bought;
    for (let i = 0; i < 4; i++) await p.locator('#sp-plus').tap();
    await p.locator('#sp-buy').tap(); await sleep(300); res.touchBought = (await quest(p)).bought;
    expect(res.touchPrompt?.key === 'Guna', '1: 1-1 touch prompt shows Guna');
    expect(res.touchOpen.open && res.touchOpen.msg === '' && res.touchOpen.bought === null, '1: Guna at the door opens the store only');
    expect(res.touchGunaWhileOpen === null, '1: Guna while the store is open does not buy');
    expect(res.touchBought?.x === 5, '1: the Beli button buys on touch');
    await ctx.close(); });

  // ── 3 + 4 + 6: Level 1-2 (touch and keyboard).
  for (const [name, dev] of [['telefon', phone], ['desktop', desk]]) await section(`3+4+6 (1-2 ${name})`, async () => {
    const { ctx, p } = await open(b, dev, 'l2'); const r = (res[`l2-${name}`] = {});
    await tp(p, 'Jambatan', 3460, 1242); await sleep(1500); await V4.closeDialogue(p, { wait: 2000, tap: name === 'telefon' });
    await tp(p, 'Jambatan', 3440, 1242); await sleep(800); r.lever = await prompt(p);
    await p.screenshot({ path: `${out}/3-l2-tuas-${name}.png` });
    if (name === 'telefon') await p.locator('[data-action="interact"]').tap(); else await p.keyboard.press('KeyE');
    await sleep(500); await p.waitForFunction(() => !window.__game.scene.getScene('Jambatan').workshop.busy, null, { timeout: 15000 });
    r.runs = await ev(p, 'Jambatan', (s) => s.run.workshop.runs);
    expect(r.lever?.key === (name === 'telefon' ? 'Guna' : 'E') && r.lever?.text === 'Jalankan bengkel', `3: 1-2 lever prompt on ${name}`);
    expect(r.runs === 1, `3: 1-2 lever works on ${name}`);
    await tp(p, 'Jambatan', 4698, 1188); await sleep(900); r.exit = await prompt(p);
    await p.screenshot({ path: `${out}/4-l2-penamat-${name}.png` });
    expect(r.exit?.text === 'Bina jambatan bengkel dahulu' && r.exit?.key === null, `4: 1-2 exit message in full, no key cap (${name})`);
    // deliver with the working order → objective points to the finish
    await ev(p, 'Jambatan', (s) => { s.run.workshop.order = 'AB'; s.workshop.place('AB', false); });
    await tp(p, 'Jambatan', 3440, 1242); await sleep(700);
    if (name === 'telefon') await p.locator('[data-action="interact"]').tap(); else await p.keyboard.press('KeyE');
    await p.waitForFunction(() => window.__game.scene.getScene('Jambatan').run.workshop.delivered, null, { timeout: 15000 }); await sleep(1500);
    await V4.closeDialogue(p, { wait: 2500, tap: name === 'telefon' }); await sleep(2500);
    r.done = await pin(p);
    expect(r.done === 'Jambatan bengkel siap ✓ · Ke penamat →', `6: 1-2 objective after the bridge (${name})`);
    await ctx.close();
  });

  // ── 4 + 6: Level 1-3 (exit message; objective after the sluice; key cap back on action prompts).
  await section('4+6 (1-3)', async () => { const { ctx, p } = await open(b, desk, 'l3'); const r = (res.l3 = {});
    await tp(p, 'GerbangSongsang', 5292, 1566); await sleep(900); r.exit = await prompt(p);
    expect(r.exit?.text === 'Pulihkan pintu air dahulu' && r.exit?.key === null, '4: 1-3 exit message without a key cap');
    await tp(p, 'GerbangSongsang', 2620, 1620); await sleep(1500); await V4.closeDialogue(p, { wait: 2000 });
    await tp(p, 'GerbangSongsang', 2862, 1620); await sleep(800); r.wheel = await prompt(p);
    expect(r.wheel?.key === 'E' && /^Pusing injap/.test(r.wheel?.text), '4: action prompts show the key cap again');
    await ev(p, 'GerbangSongsang', (s) => { s.run.sluice.setting = 5; s.sluice.showSetting(); });
    await tp(p, 'GerbangSongsang', 3060, 1620); await sleep(700); await p.keyboard.press('KeyE');
    await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang').run.sluice.open, null, { timeout: 15000 }); await sleep(3500);
    await V4.closeDialogue(p, { wait: 3000 }); await sleep(2500);
    r.done = await pin(p); await p.screenshot({ path: `${out}/6-l3-ke-penamat.png` });
    expect(r.done === 'Pintu air pulih ✓ · Ke penamat →', '6: 1-3 objective after the sluice');
    await ctx.close(); });

  // ── 2: the store panel fits on 11 viewports (children measured, not only the panel box).
  res.store = {};
  for (const [name, dev] of VIEWPORTS) await section(`2 (${name})`, async () => {
    const { ctx, p } = await open(b, dev, 'l1');
    await ev(p, 'Lorong', (s) => { Object.assign(s.run.quest, { found: true, key: true, door: true }); s.supply.key.destroy?.(); });
    await tp(p, 'Lorong', 2367, 1242); await sleep(900);
    if (dev.hasTouch) await p.locator('[data-action="interact"]').tap(); else { await p.click('#game'); await p.keyboard.press('KeyE'); }
    await sleep(800);
    // worst case: an error message + two-digit prices are visible
    await p.evaluate(() => document.getElementById('sp-buy').click()); await sleep(300);
    const m = await p.evaluate(MEASURE_STORE); res.store[name] = m;
    await p.screenshot({ path: `${out}/2-stor-${name}.png` });
    expect(m && m.bad.length === 0, `2: store panel content cut on ${name}: ${m ? m.bad.join(',') : 'panel not open'}`);
    if (m) { const btn = p.locator('#sp-close'); await (dev.hasTouch ? btn.tap({ timeout: 3000 }) : btn.click({ timeout: 3000 })).catch(() => {}); await sleep(300);
      expect(await p.evaluate(() => document.getElementById('store-panel').hidden), `2: Tutup reachable on ${name}`); }
    await ctx.close();
  });
  await b.close();
  res.errors = errors; res.fails = fails;
  console.log(JSON.stringify(res, null, 1));
  if (fails.length || errors.length) { console.error('FAIL', fails, errors); process.exit(1); }
  console.log('PASS: Day 05 — store reopen/Beli, responsive store (11 viewports), 1-2 touch label, exit messages, Journal vs store, next-step objective.');
})().catch((e) => { console.error(e); console.log(JSON.stringify({ res, fails, errors }, null, 1)); process.exit(1); });
