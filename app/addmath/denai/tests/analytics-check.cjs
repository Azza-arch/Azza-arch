// Analytics in the browser against a LOCAL PlayFab fake (production is never contacted).
// 1. Default build: no Event/WriteEvents requests at all.
// 2. Forced on (test flag): the campaign emits the planned events with
//    allowlisted payloads only (no nickname / e-mail / free text).
// 3. Global Privacy Control: nothing is sent even when forced on.
// Usage: node tests/analytics-check.cjs   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const PAGE = 'http://denai.test:8790/app/addmath/denai/main.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const WIN = {
  Lorong: `(() => { const s = window.__game.scene.getScene('Lorong'); s.solvedGates.add('lift'); s.elapsed = 151000; s.player.body.reset(5751, 1157); })()`,
  Jambatan: `(() => { const s = window.__game.scene.getScene('Jambatan'); s.run.workshop = { order: 'AB', runs: 1, lastOut: 8, delivered: true, swaps: 1 }; s.player.body.reset(4698, 1157); })()`,
  GerbangSongsang: `(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.run.sluice = { ...s.run.sluice, setting: 5, open: true, lastReading: 13, tests: 1 }; s.player.body.reset(5292, 1535); })()`,
};
async function run(b, { force, gpc }) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  await ctx.addInitScript(HOOK);
  if (force) await ctx.addInitScript(() => { window.__DENAI_ANALYTICS_FORCE__ = true; });
  if (gpc) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
  const events = []; let n = 0;
  await ctx.route(/playfabapi\.com/, async (route) => {
    const path = new URL(route.request().url()).pathname, body = JSON.parse(route.request().postData() || '{}');
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, status: 'OK', data }) });
    if (path.endsWith('LoginWithCustomID')) return ok({ SessionTicket: 't', EntityToken: { EntityToken: 'e', Entity: { Id: `me${++n}`, Type: 'title_player_account' } }, InfoResultPayload: { PlayerProfile: {} } });
    if (path.endsWith('WriteEvents')) { events.push(...body.Events); return ok({ AssignedEventIds: body.Events.map((_, i) => `e${i}`) }); }
    if (path.endsWith('GetLeaderboard')) return ok({ Rankings: [], EntryCount: 0 });
    if (path.endsWith('UpdateUserTitleDisplayName')) return ok({});
    if (path.endsWith('UpdateStatistics')) return ok({});
    if (path.endsWith('GetLeaderboardAroundEntity')) return ok({ Rankings: [] });
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":404,"error":"NotInFake"}' });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const ready = () => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden);
  await p.goto(PAGE); await ready(); await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(); await sleep(2500);
  await p.click('#play-main'); await sleep(2500); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.evaluate(WIN.Lorong); await p.waitForFunction(() => document.getElementById('complete').open); await sleep(800);
  await p.fill('#vrank-name', 'RahsiaNama'); await p.click('#vrank-send'); await sleep(1500);
  await p.click('#next-level2'); await sleep(3000); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.evaluate(WIN.Jambatan); await sleep(1500); await p.click('#lv-next'); await sleep(3000); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.evaluate(WIN.GerbangSongsang); await sleep(1500);
  await p.evaluate(() => import('/app/addmath/denai/src/v14/analytics.js').then((m) => m.flush())); await sleep(800);
  await ctx.close();
  return { events, errs };
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const off = await run(b, { force: false }); res.defaultBuild = { eventsSent: off.events.length, errs: off.errs };
  const on = await run(b, { force: true });
  const ALLOWED = new Set(['level', 'mode', 'entry', 'duration_s', 'coins', 'secrets', 'ranked_eligible', 'first_completion', 'method', 'source', 'channel', 'session', 'v']);
  res.forced = { names: on.events.map((e) => `${e.Name}:${e.Payload.level || e.Payload.entry || ''}${e.Payload.mode ? '/' + e.Payload.mode : ''}`), namespaces: [...new Set(on.events.map((e) => e.EventNamespace))],
    extraKeys: [...new Set(on.events.flatMap((e) => Object.keys(e.Payload)).filter((k) => !ALLOWED.has(k)))], leaksNickname: JSON.stringify(on.events).includes('RahsiaNama'), sample: on.events.find((e) => e.Name === 'level_completed')?.Payload, errs: on.errs };
  const g = await run(b, { force: true, gpc: true }); res.gpc = { eventsSent: g.events.length, errs: g.errs };
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
