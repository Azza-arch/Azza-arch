// Landing /denai/ player count against a LOCAL PlayFab fake (production never contacted).
// Usage: node tests/landing-count-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function visit(b, mode, opts = { viewport: { width: 1280, height: 800 } }, shot) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(() => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; });
  const calls = [];
  await ctx.route(/playfabapi\.com/, (route) => {
    const path = new URL(route.request().url()).pathname, body = JSON.parse(route.request().postData() || '{}'); calls.push(`${path} ${body.LeaderboardName || ''}`);
    if (mode === 'offline') return route.abort('internetdisconnected');
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, status: 'OK', data }) });
    if (path.endsWith('LoginWithCustomID')) return ok({ SessionTicket: 't', EntityToken: { EntityToken: 'e', Entity: { Id: 'v1', Type: 'title_player_account' } }, InfoResultPayload: { PlayerProfile: {} } });
    if (path.endsWith('GetLeaderboard')) return mode === 'missing' ? route.fulfill({ status: 404, contentType: 'application/json', body: '{"code":404,"error":"LeaderboardNotFound"}' }) : ok({ Rankings: [], EntryCount: 1234 });
    return route.fulfill({ status: 404, body: '{}' });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/denai/'); await sleep(3500);
  const r = await p.evaluate(() => { const el = document.getElementById('players-live'); return { visible: !el.hidden, text: el.textContent, overflow: document.documentElement.scrollWidth > innerWidth }; });
  if (shot) await p.screenshot({ path: `${out}/${shot}`, clip: { x: 0, y: 0, width: opts.viewport?.width || 390, height: Math.min(900, opts.viewport?.height || 844) } });
  await ctx.close(); return { ...r, calls, errs };
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const res = { ok: await visit(b, 'ok', undefined, 'landing-desktop.png'), missing: await visit(b, 'missing'), offline: await visit(b, 'offline'), phone: await visit(b, 'ok', { ...devices['iPhone 13'] }, 'landing-telefon.png') };
  // without the test stub flag an automated browser must not call PlayFab at all
  const ctx = await b.newContext(); const calls = []; ctx.on('request', (r) => { if (/playfabapi/.test(r.url())) calls.push(r.url()); });
  const p = await ctx.newPage(); await p.goto('http://denai.test:8790/denai/'); await sleep(3500); res.unstubbedAutomation = { playfabRequests: calls.length, visible: await p.evaluate(() => !document.getElementById('players-live').hidden) };
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
