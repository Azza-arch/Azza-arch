// Release-candidate check: menu → World Map → 1-1 → 1-2 → 1-3 with automatic
// victory, progression, replay, save compatibility with an existing (pre-RC)
// player profile, and the Level 1 leaderboard version guard.
// PlayFab is NEVER contacted: every *.playfabapi.com request is answered by a
// local stub (the v2 board is "not configured yet", the classic board has
// two archive rows). Victory is reached by placing the player on the goal
// with the puzzles marked solved (a test shortcut; real traversal is covered
// by l1-playthrough.cjs / w1-traversal-check.cjs).
// Usage: node tests/rc-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const PAGE = 'http://denai.test:8790/app/addmath/denai/main.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const active = (p) => p.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.scene.key + ':' + s.mode));
const levels = (p) => p.$$eval('#wm-panel .wm-level', (els) => els.map((e) => `${e.querySelector('.wm-num').textContent} ${e.querySelector('.wm-chip').textContent} [${[...e.querySelectorAll('button')].map((b) => b.textContent + (b.disabled ? '(x)' : '')).join('|')}]`));
// Profile exactly as the current production build writes it (best has no course tag).
const OLD_PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-10-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 3, firstCompletedAt: '2026-10-01T01:00:00.000Z', best: { timeMs: 95000, coins: 9, secrets: 1, at: '2026-10-02T00:00:00.000Z' } } }, coinIds: ['start-reward'], secretIds: [], achievements: ['jejak-pertama', 'tepat-sekali'], adventuresCompleted: 3, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });

function playfabStub(ctx, calls) {
  return ctx.route(/playfabapi\.com/, async (route) => {
    const path = new URL(route.request().url()).pathname, body = JSON.parse(route.request().postData() || '{}');
    calls.push({ path, board: body.LeaderboardName, stats: body.Statistics?.map((s) => s.Name) });
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, status: 'OK', data }) });
    const fail = (error) => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 404, status: 'NotFound', error, errorMessage: error }) });
    if (path.endsWith('LoginWithCustomID')) return ok({ SessionTicket: 't', EntityToken: { EntityToken: 'e', Entity: { Id: 'ME', Type: 'title_player_account' } }, InfoResultPayload: { PlayerProfile: {} } });
    if (/GetLeaderboard/.test(path)) return body.LeaderboardName === 'denai_l1_time' ? ok({ Rankings: [{ Rank: 1, DisplayName: 'ArkibA', Scores: ['90000'], Entity: { Id: 'A' } }, { Rank: 2, DisplayName: 'ArkibB', Scores: ['99000'], Entity: { Id: 'B' } }] }) : fail('LeaderboardNotFound');
    if (path.endsWith('UpdateStatistics')) return fail('StatisticNotFound');
    return fail('NotImplementedInStub');
  });
}
// Test shortcut: mark the level's puzzles solved and stand on its goal.
const WIN = {
  Lorong: async () => { const s = window.__game.scene.getScene('Lorong'); s.solvedGates.add('lift'); s.elapsed = Math.max(s.elapsed, 151000); s.player.body.reset(5751, 1188 - 31); },
  Jambatan: async () => { const s = window.__game.scene.getScene('Jambatan'); s.run.workshop = { order: 'AB', runs: 1, lastOut: 8, delivered: true, swaps: 1 }; s.player.body.reset(4698, 1188 - 31); },
  GerbangSongsang: async () => { const m = await import('/app/addmath/denai/src/v14/levels/inverse.js'); const s = window.__game.scene.getScene('GerbangSongsang'); s.run.puzzle.seals = Object.fromEntries(m.SEAL_OUTPUTS.map((y) => [y, true])); s.player.body.reset(5292, 1566 - 31); },
};
const win = (p, key) => p.evaluate(`(${WIN[key].toString()})()`);
const closeDialogs = (p) => p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => { if (!['complete', 'twin-dialog', 'inverse-dialog'].includes(d.id)) d.close(); }));

(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  // ── A. New player, desktop: whole campaign ──
  { const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK); const calls = []; await playfabStub(ctx, calls);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/playfab|net::|favicon|404/i.test(m.text())) errs.push(m.text()); });
    await p.goto(PAGE); await ready(p); await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(p); await sleep(800);
    res.A = { menu: await p.textContent('#play-main') }; await p.screenshot({ path: `${out}/rc-desk-1-menu.png` });
    await p.click('#world-map-btn'); await sleep(500); await p.screenshot({ path: `${out}/rc-desk-2-worldmap.png` });
    await p.click('.wm-node[data-world="w1"]').catch(() => {}); await sleep(400); res.A.levelsNew = await levels(p); await p.screenshot({ path: `${out}/rc-desk-3-level-select.png` });
    await p.click('#wm-back').catch(() => p.keyboard.press('Escape')); await sleep(300);
    await p.click('#play-main'); await sleep(2500); await closeDialogs(p); res.A.l1Scenes = await active(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(1450, 1100); }); await sleep(900); await p.screenshot({ path: `${out}/rc-desk-4-level-1-1.png` });
    await win(p, 'Lorong'); await sleep(3500); // no key press: automatic victory
    res.A.l1Victory = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, mode: window.__game.scene.getScene('Lorong').mode, save: JSON.parse(localStorage.getItem('denai-save-v14') || 'null')?.completed, best: JSON.parse(localStorage.getItem('denai-profile-v1')).levels['w1-l1'].best }));
    await p.screenshot({ path: `${out}/rc-desk-5-victory-1-1.png` });
    // leaderboard: v2 not configured → prepared message, nothing written to the classic board
    await p.evaluate(() => document.getElementById('complete').close()); await p.evaluate(() => { const d = document.getElementById('leaderboard'); document.getElementById('lb-open-settings').click?.(); if (!d.open) { d.showModal(); } });
    await p.evaluate(() => import('/app/addmath/denai/src/v14/leaderboard/ui.js').then((m) => m.renderLeaderboard())); await sleep(1200);
    res.A.lbCurrent = await p.evaluate(() => ({ rows: document.getElementById('lb-rows').textContent, pb: document.getElementById('lb-pb').textContent, submitHidden: document.getElementById('lb-submit').hidden }));
    await p.screenshot({ path: `${out}/rc-desk-6-leaderboard-v2-not-ready.png` });
    await p.click('[data-lb-tab="classic"]'); await sleep(1000);
    res.A.lbClassic = await p.evaluate(() => ({ rows: document.getElementById('lb-rows').textContent, submitHidden: document.getElementById('lb-submit').hidden }));
    await p.screenshot({ path: `${out}/rc-desk-7-leaderboard-classic.png` });
    await p.evaluate(() => { document.getElementById('leaderboard').close(); document.getElementById('complete').showModal(); });
    // Continue → 1-2
    await p.click('#next-level2'); await sleep(3000); await closeDialogs(p); res.A.l2Scenes = await active(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); s.player.body.reset(1450, 1000); }); await sleep(1200); await p.screenshot({ path: `${out}/rc-desk-8-level-1-2.png` });
    await win(p, 'Jambatan'); await sleep(1500); res.A.l2Victory = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, levelMode: document.getElementById('complete').classList.contains('is-level-mode'), kicker: document.querySelector('#complete .victory-kicker').textContent, stats: ['completion-coins','completion-secrets','completion-time'].map((i) => document.getElementById(i).textContent), next: document.getElementById('lv-next')?.hidden === false ? document.getElementById('lv-next').textContent : null, actions: [...document.querySelectorAll('#lv-actions button')].map((b) => b.textContent), teaser: document.querySelector('#complete .teaser-title').textContent }));
    await p.screenshot({ path: `${out}/rc-desk-9-victory-1-2.png` });
    await p.click('#lv-next'); await sleep(3000); await closeDialogs(p); res.A.l3Scenes = await active(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.player.body.reset(1500, 1300); }); await sleep(1200); await p.screenshot({ path: `${out}/rc-desk-10-level-1-3.png` });
    await win(p, 'GerbangSongsang'); await sleep(1500); res.A.l3Victory = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, levelMode: document.getElementById('complete').classList.contains('is-level-mode'), kicker: document.querySelector('#complete .victory-kicker').textContent, stats: ['completion-coins','completion-secrets','completion-time'].map((i) => document.getElementById(i).textContent), next: document.getElementById('lv-next')?.hidden === false ? document.getElementById('lv-next').textContent : null, actions: [...document.querySelectorAll('#lv-actions button')].map((b) => b.textContent), teaser: document.querySelector('#complete .teaser-title').textContent }));
    await p.screenshot({ path: `${out}/rc-desk-11-victory-1-3.png` });
    await p.click('#lv-menu'); await sleep(2500); res.A.menuFromL3 = { welcome: await p.isVisible('#welcome'), map: await p.isVisible('#world-map-page'), scenes: await active(p) };
    // Reload: everything persisted; MAIN opens the map; replay 1-1 keeps records
    await p.reload(); await ready(p); await sleep(800); res.A.reloadMenu = await p.textContent('#play-main');
    await p.click('#play-main'); await sleep(500); res.A.mainOpensMap = await p.isVisible('#world-map-page'); await p.click('.wm-node[data-world="w1"]').catch(() => {}); await sleep(300); res.A.levelsAllDone = await levels(p);
    await p.screenshot({ path: `${out}/rc-desk-12-level-select-all-done.png` });
    await p.click('#wm-panel button[data-level="w1-l1"][data-mode="replay"]'); await sleep(2000); await closeDialogs(p);
    await win(p, 'Lorong'); await sleep(3500);
    res.A.replay = await p.evaluate(() => { const pr = JSON.parse(localStorage.getItem('denai-profile-v1')); return { dialog: document.getElementById('complete').open, completions: pr.levels['w1-l1'].completions, achievements: pr.achievements, l2: JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].completions, l3: JSON.parse(localStorage.getItem('denai-l3-campaign-v1')).completions }; });
    await p.screenshot({ path: `${out}/rc-desk-13-replay-victory.png` });
    res.A.playfabCalls = calls; res.A.classicWrites = calls.filter((c) => c.stats?.includes('denai_l1_time')).length; res.A.errs = errs; await ctx.close(); }
  // ── B. Returning player with a pre-RC save ──
  { const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK); const calls = []; await playfabStub(ctx, calls);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(PAGE); await ready(p); await p.evaluate((pr) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); localStorage.setItem('denai-lb-submitted', '95000'); }, OLD_PROFILE); await p.reload(); await ready(p); await sleep(800);
    res.B = { menu: await p.textContent('#play-main'), sub: await p.textContent('#play-main-sub') };
    await p.click('#world-map-btn'); await sleep(400); await p.click('.wm-node[data-world="w1"]').catch(() => {}); await sleep(300); res.B.levels = await levels(p);
    res.B.profile = await p.evaluate(() => JSON.parse(localStorage.getItem('denai-profile-v1')).levels['w1-l1']);
    await p.keyboard.press('Escape'); await sleep(300);
    await p.evaluate(() => import('/app/addmath/denai/src/v14/leaderboard/ui.js').then((m) => { document.getElementById('leaderboard').showModal(); m.renderLeaderboard(); })); await sleep(1200);
    res.B.lb = await p.evaluate(() => ({ pb: document.getElementById('lb-pb').textContent, submitHidden: document.getElementById('lb-submit').hidden }));
    res.B.errs = errs; res.B.classicWrites = calls.filter((c) => c.stats?.includes('denai_l1_time')).length; await ctx.close(); }
  // ── C. Phone (landscape) ──
  { const ctx = await b.newContext({ ...devices['iPhone 13 landscape'] }); await ctx.addInitScript(HOOK); const calls = []; await playfabStub(ctx, calls);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(PAGE); await ready(p); await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(p); await sleep(800);
    if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(300); }
    await p.screenshot({ path: `${out}/rc-phone-1-menu.png` });
    await p.locator('#world-map-btn').tap(); await sleep(500); await p.screenshot({ path: `${out}/rc-phone-2-worldmap.png` });
    await p.locator('.wm-card[data-world="w1"]').tap().catch(() => {}); await sleep(400); await p.screenshot({ path: `${out}/rc-phone-3-level-select.png` });
    await p.locator('.wm-panel-back').tap().catch(() => {}); await sleep(200); await p.keyboard.press('Escape'); await sleep(300);
    await p.locator('#play-main').tap(); await sleep(2500); await closeDialogs(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(1450, 1100); }); await sleep(900); await p.screenshot({ path: `${out}/rc-phone-4-level-1-1.png` });
    await win(p, 'Lorong'); await sleep(3500); await p.screenshot({ path: `${out}/rc-phone-5-victory-1-1.png` });
    await p.locator('#next-level2').tap(); await sleep(3000); await closeDialogs(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); s.player.body.reset(1450, 1000); }); await sleep(1200); await p.screenshot({ path: `${out}/rc-phone-6-level-1-2.png` });
    await win(p, 'Jambatan'); await sleep(1500); await p.screenshot({ path: `${out}/rc-phone-7-victory-1-2.png` });
    await p.locator('#lv-next').tap(); await sleep(3000); await closeDialogs(p);
    await p.evaluate(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.player.body.reset(1500, 1300); }); await sleep(1200); await p.screenshot({ path: `${out}/rc-phone-8-level-1-3.png` });
    await win(p, 'GerbangSongsang'); await sleep(1500); await p.screenshot({ path: `${out}/rc-phone-9-victory-1-3.png` });
    res.C = { scenes: await active(p), errs, classicWrites: calls.filter((c) => c.stats?.includes('denai_l1_time')).length }; await ctx.close(); }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
