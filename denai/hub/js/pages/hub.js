// PAGE 02 — Learning Hub dashboard, with two demo states (Pelajar Baharu / Kembali).
import { esc, icon, bar, demoNote, stateTag, journeyCompact } from '../ui.js';
import { chapter, chapterLabel, subtopicTitle, CHAPTERS, GAME, GAME_URL } from '../data.js';
import { STATES, getDemoState, setDemoState, getProfile, chapterPct, chapterState, nextAction } from '../demo.js';

const actionHref = (a) => (a.kind === 'ex' ? `#/latihan/${a.chapter}/${a.sub}` : `#/nota/${a.chapter}/${a.sub}`);
const actionLabel = (a) => (a.kind === 'ex' ? 'Cuba latihan' : 'Baca nota');

export function demoSwitch(current) {
  return `<div class="seg" role="group" aria-label="Pilih keadaan demo">${Object.entries(STATES).map(([k, l]) =>
    `<button type="button" data-demo="${k}" aria-pressed="${k === current}">${l}</button>`).join('')}</div>`;
}
export function bindDemoSwitch(view) {
  view.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    setDemoState(b.dataset.demo);
    window.dispatchEvent(new HashChangeEvent('hashchange')); // re-render the same route
  }));
}

function recommendCard(p) {
  const a = nextAction(p), c = chapter(a.chapter);
  return `<section class="section" aria-labelledby="h-next">
    <div class="card next-card recommend">
      <div>
        <p class="eyebrow">Tindakan seterusnya yang dicadangkan</p>
        <h2 class="h3" id="h-next" style="margin-top:6px">${a.kind === 'ex' ? 'Latihan' : 'Nota'} ${esc(a.sub)} · ${esc(subtopicTitle(a.chapter, a.sub))}</h2>
        <p class="muted" style="margin-top:4px">${esc(chapterLabel(c))}. ${esc(a.why)}</p>
      </div>
      <a class="btn btn-primary btn-lg" href="${actionHref(a)}">${actionLabel(a)} ${icon('arrow')}</a>
    </div>
  </section>`;
}

function newLearner(p) {
  const first = chapter('t4-1');
  return `
  <section class="welcome">
    <div>
      <p class="eyebrow">Pelajar baharu</p>
      <h1 style="margin-top:6px">Selamat datang ke DENAI</h1>
      <p class="lead" style="margin-top:10px">Anda belum memulakan mana-mana bab. Ikut tiga langkah ini untuk bermula.</p>
      <ol class="steps-start" style="margin-top:20px">
        <li><div><b>Pilih bab</b><span>Mula dengan Bab 1 Fungsi, asas kepada banyak bab lain.</span></div></li>
        <li><div><b>Baca satu nota, kemudian cuba latihan</b><span>Setiap nota fokus pada satu konsep: Fahami, Contoh, Ulang Kaji, Latihan.</span></div></li>
        <li><div><b>Main misi yang berkaitan</b><span>Game DENAI menggunakan konsep fungsi yang sama.</span></div></li>
      </ol>
    </div>
    <a class="card card-link ch-card" href="#/bab/${first.id}" style="min-height:0">
      <span class="num">${first.number}</span>
      <div><p class="eyebrow">Bab pertama yang tersedia</p><h3 style="font-size:var(--fs-lg);margin-top:4px">${esc(first.title)}</h3><div class="tags">${stateTag('ready')}<span class="tag tag-game">${icon('gamepad')}Ada misi game</span></div></div>
      <div class="ch-foot muted small">Tingkatan ${first.form} · ${first.standards.length} subtopik: ${first.standards.map((s) => esc(s.title)).join(', ')}</div>
    </a>
  </section>
  ${recommendCard(p)}`;
}

function returningLearner(p) {
  const cur = chapter(p.current.chapter), pct = chapterPct(p, cur.id);
  const curState = chapterState(p, cur.id);
  const available = CHAPTERS.filter((c) => c.available);
  const notesTotal = available.reduce((n, c) => n + c.standards.length, 0);
  const notesRead = Object.values(p.notesRead).reduce((n, a) => n + a.length, 0);
  const g = GAME.levels.filter((l) => p.game[l.no] === 'done').length;
  const icoFor = (a) => (a.type === 'game' ? ['gamepad', ' is-game'] : a.type === 'ex' ? ['pencil', ' is-ex'] : ['book', '']);
  const actTitle = (a) => (a.type === 'game' ? `${GAME.world}: ${GAME.name}` : `${a.sub} ${subtopicTitle(a.chapter, a.sub)}`);
  return `
  <section class="welcome">
    <div>
      <p class="eyebrow">Pelajar kembali</p>
      <h1 style="margin-top:6px">Selamat kembali!</h1>
      <p class="lead" style="margin-top:10px">Kali terakhir anda membuka ${esc(chapterLabel(cur))}.</p>
    </div>
    <div class="card-game continue">
      <div class="continue-head"><span class="big-num">${cur.number}</span><div><p class="eyebrow">Sambung belajar</p><h2 class="h3">${esc(cur.title)}</h2></div></div>
      <div><p class="small"><b>Terakhir dilawati:</b> ${esc(p.current.sub)} ${esc(subtopicTitle(cur.id, p.current.sub))}</p>
        <div class="meter" style="margin-top:10px"><div class="meter-row"><span>Nota bab ini</span><b>${p.notesRead[cur.id]?.length || 0}/${cur.standards.length}</b></div>${bar(pct, { gold: curState !== 'done', label: 'Kemajuan nota bab semasa' })}</div></div>
      <div class="btn-row"><a class="btn btn-primary" href="#/nota/${cur.id}/${p.current.sub}">Sambung ${icon('arrow')}</a><a class="btn btn-quiet" href="#/bab/${cur.id}">Gambaran bab</a></div>
    </div>
  </section>
  ${recommendCard(p)}
  <div class="grid grid-2 grid-gap-lg section">
    <section class="card" aria-labelledby="h-act">
      <div class="section-head"><h2 class="h3" id="h-act">Aktiviti terkini</h2></div>
      <ul class="activity">${p.activity.map((a) => { const [ico, cls] = icoFor(a); return `<li><span class="a-ico${cls}">${icon(ico)}</span><div><b>${esc(actTitle(a))}</b><span>${esc(a.text)} · ${esc(a.when)}</span></div></li>`; }).join('')}</ul>
    </section>
    <section class="card" aria-labelledby="h-prog">
      <div class="section-head"><h2 class="h3" id="h-prog">Kemajuan pembelajaran</h2><a class="textlink small" href="#/kemajuan">Butiran ${icon('arrow')}</a></div>
      <div class="stack">
        <div class="meter"><div class="meter-row"><span>Bab selesai</span><b>${p.chaptersDone.length}/${available.length}</b></div>${bar(available.length ? (p.chaptersDone.length / available.length) * 100 : 0, { label: 'Bab selesai' })}</div>
        <div class="meter"><div class="meter-row"><span>Nota dibaca</span><b>${notesRead}/${notesTotal}</b></div>${bar(notesTotal ? (notesRead / notesTotal) * 100 : 0, { label: 'Nota dibaca' })}</div>
        <div class="meter"><div class="meter-row"><span>Misi game ${GAME.world}</span><b>${g}/${GAME.levels.length}</b></div>${bar((g / GAME.levels.length) * 100, { label: 'Misi game selesai' })}</div>
      </div>
      <p class="small muted" style="margin-top:16px">Peratus dikira daripada ${available.length} bab yang tersedia sekarang.</p>
    </section>
  </div>`;
}

export function render() {
  const st = getDemoState(), p = getProfile();
  const html = `<div class="wrap">
    <div style="display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;justify-content:space-between;padding-top:20px">
      ${journeyCompact(st === 'baharu' ? 'fahami' : 'latih')}
      ${demoSwitch(st)}
    </div>
    <div style="margin-top:16px">${demoNote('Tukar keadaan untuk melihat paparan pelajar baharu dan pelajar kembali.')}</div>
    ${st === 'kembali' ? returningLearner(p) : newLearner(p)}
    <section class="section" aria-labelledby="h-quick">
      <h2 class="h3" id="h-quick" style="margin-bottom:16px">Pergi ke</h2>
      <div class="grid grid-3">
        <a class="card card-link card-tight" href="#/bab"><span class="num" style="margin-bottom:12px">${icon('book')}</span><h3 class="h3" style="font-size:var(--fs-md)">Semua bab</h3><p class="small muted">Tingkatan 4 dan 5, mengikut DSKP.</p></a>
        <a class="card card-link card-tight" href="#/main"><span class="num is-done" style="margin-bottom:12px">${icon('gamepad')}</span><h3 class="h3" style="font-size:var(--fs-md)">Game DENAI</h3><p class="small muted">${GAME.world}: ${esc(GAME.name)}.</p></a>
        <a class="card card-link card-tight" href="#/kemajuan"><span class="num is-progress" style="margin-bottom:12px">${icon('chart')}</span><h3 class="h3" style="font-size:var(--fs-md)">Kemajuan saya</h3><p class="small muted">Bab, nota, latihan dan misi.</p></a>
      </div>
      <p class="small muted" style="margin-top:16px">Mahu terus main? <a href="${GAME_URL}">Buka game DENAI</a>.</p>
    </section>
  </div>`;
  return { title: 'Learning Hub', nav: 'hub', surface: 'play', html, mount: bindDemoSwitch };
}
