// V4 UI test helpers (portrait dialogue + Journal), shared by the browser tests.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dlgOpen = (p) => p.evaluate(() => !!document.getElementById('v4-dialog')?.classList.contains('open'));
// Wait (up to `wait` ms) for a dialogue, then advance it with Space (or a tap) until it closes.
// Returns the pages that were shown ([] if no dialogue appeared).
async function closeDialogue(p, { wait = 1500, tap = false } = {}) {
  const t0 = Date.now(); while (!(await dlgOpen(p)) && Date.now() - t0 < wait) await sleep(60);
  const pages = [];
  for (let i = 0; i < 10 && (await dlgOpen(p)); i++) {
    // wait for the page to finish typing, read it, then advance
    await p.waitForFunction(() => { const d = document.getElementById('v4-dialog'); return !d.classList.contains('open') || d.classList.contains('ready'); }, null, { timeout: 4000 }).catch(() => {});
    if (!(await dlgOpen(p))) break;
    pages.push(await p.textContent('#v4-dialog .dlg-text'));
    if (tap) await p.locator('#v4-dialog').tap(); else await p.keyboard.press('Space');
    await sleep(200);
  }
  await sleep(250); // lock grace period
  return pages;
}
async function openJournal(p, { tap = false } = {}) {
  if (tap) await p.locator('#journal-btn').tap(); else await p.keyboard.press('KeyJ');
  await p.waitForFunction(() => document.body.classList.contains('journal-open'), null, { timeout: 3000 }); await sleep(150);
}
async function closeJournal(p, { tap = false } = {}) {
  if (tap) await p.locator('#qt-close').tap(); else await p.keyboard.press('Escape');
  await p.waitForFunction(() => !document.body.classList.contains('journal-open'), null, { timeout: 3000 }); await sleep(150);
}
// Open the Journal, press "?" n times, collect the hint texts, close.
async function readHints(p, n = 3, opts = {}) {
  await openJournal(p, opts); const out = [];
  for (let i = 0; i < n; i++) { if (opts.tap) await p.locator('#qt-hint').tap(); else await p.click('#qt-hint'); await sleep(120); out.push(await p.textContent('#qt-hint-text')); }
  await closeJournal(p, opts); return out;
}
async function readMath(p, opts = {}) {
  await openJournal(p, opts); if (opts.tap) await p.locator('#qt-math').tap(); else await p.click('#qt-math'); await sleep(120);
  const t = await p.textContent('#qt-math-text'); await closeJournal(p, opts); return t;
}
const dialogLog = (p) => p.evaluate(() => (window.__denaiDialogLog || []).map((d) => d.pages.join(' / ')));
module.exports = { dialogLog, closeDialogue, openJournal, closeJournal, readHints, readMath, dlgOpen };
