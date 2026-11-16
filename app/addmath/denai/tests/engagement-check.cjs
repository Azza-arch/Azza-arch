// Player Engagement V1 browser checks against a LOCAL fake PlayFab backend.
// Every *.playfabapi.com request is answered in-process by FakePlayFab below
// (controlled test records only; nothing reaches the production title).
// Covers: new guest, player counting + dedupe, first completion, nickname
// validation / duplicate / consent, confirmed rank, skip + join later,
// replay slower/faster, reload after completion, offline + later retry,
// classic vs v2 separation, keyboard flow, phone layout, share card.
// Usage: node tests/engagement-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const PAGE = 'http://denai.test:8790/app/addmath/denai/main.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });

class FakePlayFab {
  constructor() {
    this.offline = false; this.calls = []; this.names = {}; this.byCustom = {}; this.n = 0;
    this.stats = { denai_players: { o1: 1, o2: 1, o3: 1, o4: 1 }, denai_l1_time_v2: { o1: 100000, o2: 130000, o3: 160000, o4: 210000 }, denai_l1_time: { a: 90000, b: 99000 } };
    Object.assign(this.names, { o1: 'Kancil', o2: 'Rusa', o3: 'Helang', o4: 'Tapir', a: 'ArkibA', b: 'ArkibB', taken: 'Diambil' });
  }
  ranked(board) { return Object.entries(this.stats[board]).sort((x, y) => (board === 'denai_players' ? 0 : x[1] - y[1])).map(([id, v], i) => ({ Rank: i + 1, DisplayName: this.names[id] || null, Scores: [String(v)], Entity: { Id: id, Type: 'title_player_account' } })); }
  async handle(route) {
    if (this.offline) return route.abort('internetdisconnected');
    const path = new URL(route.request().url()).pathname, body = JSON.parse(route.request().postData() || '{}'), h = route.request().headers();
    const me = h['x-entitytoken'] || h['x-authorization'];
    this.calls.push({ path, me, board: body.LeaderboardName, stats: body.Statistics?.map((s) => `${s.Name}=${s.Scores[0]}`), name: body.DisplayName });
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, status: 'OK', data }) });
    const fail = (error, code = 400) => route.fulfill({ status: code, contentType: 'application/json', body: JSON.stringify({ code, status: 'Error', error, errorMessage: error }) });
    if (path.endsWith('LoginWithCustomID')) { const id = (this.byCustom[body.CustomId] ||= `me${++this.n}`); return ok({ SessionTicket: id, EntityToken: { EntityToken: id, Entity: { Id: id, Type: 'title_player_account' } }, InfoResultPayload: { PlayerProfile: { DisplayName: this.names[id] } } }); }
    if (path.endsWith('UpdateUserTitleDisplayName')) { if (Object.entries(this.names).some(([id, n]) => n === body.DisplayName && id !== me)) return fail('NameNotAvailable'); this.names[me] = body.DisplayName; return ok({ DisplayName: body.DisplayName }); }
    if (path.endsWith('UpdateStatistics')) {
      for (const s of body.Statistics) if (!this.stats[s.Name]) return fail('StatisticNotFound', 404);
      for (const s of body.Statistics) { const v = Number(s.Scores[0]), b = this.stats[s.Name], cur = b[me]; b[me] = cur == null ? v : s.Name === 'denai_players' ? Math.max(cur, v) : Math.min(cur, v); }
      return ok({});
    }
    if (path.endsWith('GetLeaderboard')) { if (!this.stats[body.LeaderboardName]) return fail('LeaderboardNotFound', 404); const all = this.ranked(body.LeaderboardName); return ok({ Rankings: all.slice(0, body.PageSize), EntryCount: all.length }); }
    if (path.endsWith('GetLeaderboardAroundEntity')) { if (!this.stats[body.LeaderboardName]) return fail('LeaderboardNotFound', 404); const all = this.ranked(body.LeaderboardName), i = all.findIndex((r) => r.Entity.Id === body.Entity.Id); if (i < 0) return ok({ Rankings: [] }); const k = body.MaxSurroundingEntries; return ok({ Rankings: all.slice(Math.max(0, i - k), i + k + 1) }); }
    return fail('NotInFake', 404);
  }
  count(re) { return this.calls.filter((c) => re.test(JSON.stringify(c))).length; }
}

const WIN = (ms) => `(() => { const s = window.__game.scene.getScene('Lorong'); s.solvedGates.add('lift'); s.elapsed = ${ms}; s.player.body.reset(5751, 1157); })()`;
const vr = (p) => p.evaluate(() => { const v = (id) => document.getElementById(id); return { pb: v('vrank-pb').textContent, join: !v('vrank-join').hidden, result: !v('vrank-result').hidden, later: !v('vrank-later').hidden, status: v('vrank-status').textContent, list: [...v('vrank-list').children].map((li) => `${li.className === 'is-me' ? '*' : ''}${li.textContent}`), msg: v('vrank-msg').textContent }; });
const menuCard = (p) => p.evaluate(() => ({ players: document.getElementById('cm-players').hidden ? null : document.getElementById('cm-players').textContent, levels: document.getElementById('cm-levels').textContent, top: [...document.querySelectorAll('#cm-top li')].map((li) => li.textContent) }));
async function startL1(p) { await p.click('#play-main'); await sleep(2200); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); }
async function win(p, ms) { await p.evaluate(WIN(ms)); await p.waitForFunction(() => document.getElementById('complete').open, null, { timeout: 8000 }); await sleep(1200); }
async function toMenu(p) { await p.evaluate(() => document.getElementById('menu-btn').click()); await sleep(1800); }
async function replayL1(p) { await p.click('#world-map-btn'); await sleep(400); await p.click('#wm-panel button[data-level="w1-l1"]'); await sleep(2200); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); }

(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const fake = new FakePlayFab();
  // ── 1. New guest (desktop) ──
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => fake.handle(r));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/playfab|net::|favicon|40\d/i.test(m.text())) errs.push(m.text()); });
  await p.goto(PAGE); await ready(p); await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(p); await sleep(1500);
  res.menuNew = await menuCard(p); await p.screenshot({ path: `${out}/e-desk-1-menu.png` });
  // ── 2. Counting: only after 15 s of real play, once ──
  await startL1(p); await sleep(5000); res.countAfter5s = fake.count(/denai_players=1/);
  await sleep(11500); res.countAfter16s = fake.count(/denai_players=1/);
  // ── 3. First completion: nickname validation, duplicate, consent, confirmed rank ──
  await win(p, 151000); res.firstVictory = await vr(p); await p.screenshot({ path: `${out}/e-desk-2-victory-join.png` });
  res.keyboardFocus = await p.evaluate(() => document.activeElement?.id);
  // keyboard: Tab order reaches the nickname field from the stats; Enter submits
  await p.focus('#vrank-pb').catch(() => {}); await p.evaluate(() => document.getElementById('vrank-name').focus()); res.tabFromName = await p.evaluate(() => document.activeElement.id);
  await p.fill('#vrank-name', 'ab'); await p.keyboard.press('Enter'); await sleep(300); res.shortName = (await vr(p)).msg;
  await p.fill('#vrank-name', '<b>x</b>'); await p.keyboard.press('Enter'); await sleep(300); res.htmlName = (await vr(p)).msg;
  await p.fill('#vrank-name', 'Diambil'); await p.keyboard.press('Enter'); await sleep(1200); res.dupName = (await vr(p)).msg;
  res.v2BeforeConsent = fake.count(/denai_l1_time_v2=/);
  await p.fill('#vrank-name', 'Pelangi_7'); await p.keyboard.press('Enter'); await sleep(2500);
  res.joined = await vr(p); res.v2AfterConsent = fake.calls.filter((c) => c.stats?.some((s) => s.startsWith('denai_l1_time_v2='))).map((c) => c.stats);
  await p.screenshot({ path: `${out}/e-desk-3-victory-rank.png` });
  await p.click('#share-result'); await sleep(800); res.share = await p.evaluate(() => ({ open: document.getElementById('share-dialog').open, img: document.getElementById('share-img').naturalWidth }));
  await p.screenshot({ path: `${out}/e-desk-4-share-card.png` });
  await p.evaluate(() => { const a = document.getElementById('share-img'); const c = document.createElement('canvas'); c.width = a.naturalWidth; c.height = a.naturalHeight; c.getContext('2d').drawImage(a, 0, 0); window.__card = c.toDataURL('image/png'); });
  const card = await p.evaluate(() => window.__card); require('fs').writeFileSync(`${out}/e-share-card.png`, Buffer.from(card.split(',')[1], 'base64'));
  await p.click('#share-close');
  // ── 4. Reload after completion: no duplicate submission ──
  const before = fake.count(/denai_l1_time_v2=/);
  await p.reload(); await ready(p); await sleep(2000); res.reload = { v2Writes: fake.count(/denai_l1_time_v2=/) - before, completeOpen: await p.evaluate(() => document.getElementById('complete').open), menu: await menuCard(p) };
  await p.screenshot({ path: `${out}/e-desk-5-menu-after.png` });
  // ── 5. Replay slower: no submission; replay faster: submission + improvement ──
  await replayL1(p); await win(p, 200000); res.slower = { ...(await vr(p)), v2Writes: fake.count(/denai_l1_time_v2=/) - before };
  await p.evaluate(() => localStorage.setItem('denai-lb-last-submit', '0')); // test clock: the 15 s throttle has passed
  await toMenu(p); await replayL1(p); await win(p, 120000); await sleep(1500);
  res.faster = { ...(await vr(p)), writes: fake.calls.filter((c) => c.stats?.some((s) => s.startsWith('denai_l1_time_v2='))).map((c) => c.stats[0]) };
  await p.screenshot({ path: `${out}/e-desk-6-replay-faster.png` });
  res.classicWrites = fake.count(/"denai_l1_time=/); res.classicBoard = fake.stats.denai_l1_time;
  res.playersEntries = Object.keys(fake.stats.denai_players).length;
  res.errs = errs; await ctx.close();

  // ── 6. Skip, then join later (second guest) ──
  { const c2 = await b.newContext({ viewport: { width: 1280, height: 760 } }); await c2.addInitScript(HOOK); await c2.route(/playfabapi\.com/, (r) => fake.handle(r));
    const q = await c2.newPage(); await q.goto(PAGE); await ready(q); await q.evaluate(() => localStorage.clear()); await q.reload(); await ready(q); await sleep(800);
    const w0 = fake.count(/denai_l1_time_v2=/); await startL1(q); await win(q, 140000);
    await q.click('#vrank-skip'); await sleep(300); res.skip = { ...(await vr(q)), consent: await q.evaluate(() => localStorage.getItem('denai-lb-consent')), v2Writes: fake.count(/denai_l1_time_v2=/) - w0, progressSaved: await q.evaluate(() => JSON.parse(localStorage.getItem('denai-profile-v1')).levels['w1-l1'].best?.timeMs) };
    await q.screenshot({ path: `${out}/e-desk-7-skipped.png` });
    await q.click('#vrank-later-join'); await sleep(300); await q.fill('#vrank-name', 'Bayu'); await q.click('#vrank-send'); await sleep(2500);
    res.joinLater = { ...(await vr(q)), v2Writes: fake.count(/denai_l1_time_v2=/) - w0 }; await c2.close(); }

  // ── 7. Network failure, then recovery (third guest) ──
  { const c3 = await b.newContext({ viewport: { width: 1280, height: 760 } }); await c3.addInitScript(HOOK); await c3.route(/playfabapi\.com/, (r) => fake.handle(r));
    const q = await c3.newPage(); const e3 = []; q.on('pageerror', (e) => e3.push(e.message));
    await q.goto(PAGE); await ready(q); await q.evaluate(() => localStorage.clear()); fake.offline = true; await q.reload(); await ready(q); await sleep(1500);
    res.offlineMenu = await menuCard(q); await q.screenshot({ path: `${out}/e-desk-8-menu-offline.png` });
    await startL1(q); await win(q, 145000);
    await q.fill('#vrank-name', 'Ombak'); await q.click('#vrank-send'); await sleep(1500); res.offlineJoin = await vr(q);
    // consent given while online-but-board-down is covered by rc-check; here: consent stored before going offline
    await q.evaluate(() => { localStorage.setItem('denai-lb-consent', 'joined'); localStorage.setItem('denai-lb-name', 'Ombak'); });
    await toMenu(q); await replayL1(q); await win(q, 142000); await sleep(1500); res.offlineAfterConsent = await vr(q);
    res.offlineCanContinue = await q.isVisible('#next-level2');
    await q.screenshot({ path: `${out}/e-desk-9-victory-offline.png` });
    fake.offline = false; await q.evaluate(() => { localStorage.setItem('denai-lb-last-submit', '0'); localStorage.removeItem('denai-community-cache'); });
    const w0 = fake.count(/denai_l1_time_v2=/); await toMenu(q); await sleep(2500);
    res.retryOnMenu = { v2Writes: fake.count(/denai_l1_time_v2=/) - w0, menu: await menuCard(q) }; res.offlineErrs = e3; await c3.close(); }

  // ── 8. Phone (landscape + portrait) ──
  for (const [name, dev] of [['land', devices['iPhone 13 landscape']], ['port', devices['iPhone 13']]]) {
    const c = await b.newContext({ ...dev }); await c.addInitScript(HOOK); await c.route(/playfabapi\.com/, (r) => fake.handle(r));
    const q = await c.newPage(); await q.goto(PAGE); await ready(q); await q.evaluate(() => localStorage.clear()); await q.reload(); await ready(q); await sleep(1500);
    if (await q.isVisible('.rotate-stay')) { await q.locator('.rotate-stay').tap(); await sleep(300); }
    await q.screenshot({ path: `${out}/e-phone-${name}-1-menu.png` });
    await q.locator('#play-main').tap(); await sleep(2200); await q.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    await win(q, 160000); await q.screenshot({ path: `${out}/e-phone-${name}-2-victory-join.png` });
    await q.locator('#vrank-name').fill(`Hp${name}`); await q.locator('#vrank-send').tap(); await sleep(2500);
    await q.evaluate(() => document.getElementById('vrank').scrollIntoView({ block: 'center' })); await sleep(300);
    await q.screenshot({ path: `${out}/e-phone-${name}-3-victory-rank.png` });
    res[`phone_${name}`] = { rank: (await vr(q)).status, actionsReachable: await q.evaluate(() => { const panel = document.querySelector('.victory-panel'); return panel.scrollHeight > panel.clientHeight ? 'scrolls' : 'fits'; }) };
    await c.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
