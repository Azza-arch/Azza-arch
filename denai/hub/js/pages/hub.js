// PAGE 02 — Learning Hub dashboard. Driven by the learner record (core/learner.js):
// no activity yet → getting-started view; otherwise → continue, next action,
// recent activity and mastery-based progress. In demo mode (?demo=1) the same
// code runs on an in-memory sample, flagged by the global "Mod demo" banner.
import { esc, icon, bar, stateTag, masteryTag, journeyCompact, storageNote } from '../ui.js';
import { chapter, chapterLabel, subtopicTitle, GAME, GAME_URL } from '../data.js';
import { getLearner, whenText } from '../core/learner.js';

export const actionHref = (a) => (a.kind === 'note' ? `#/nota/${a.ch}/${a.sub}` : `#/latihan/${a.ch}/${a.sub}`);
export const actionLabel = (a) => ({ note: 'Baca nota', ex: 'Mula latihan', resume: 'Sambung latihan' }[a.kind]);
const actionTitle = (a) => `${a.kind === 'note' ? 'Nota' : 'Latihan'} ${a.sub} · ${subtopicTitle(a.ch, a.sub)}`;

function recommendCard(a) {
  const c = chapter(a.ch);
  return `<section class="section" aria-labelledby="h-next">
    <div class="card next-card recommend">
      <div>
        <p class="eyebrow">Langkah seterusnya</p>
        <h2 class="h3" id="h-next" style="margin-top:6px">${esc(actionTitle(a))}</h2>
        <p class="muted" style="margin-top:4px">${esc(chapterLabel(c))}. ${esc(a.why)}</p>
      </div>
      <a class="btn btn-primary btn-lg" href="${actionHref(a)}">${actionLabel(a)} ${icon('arrow')}</a>
    </div>
  </section>`;
}

function newLearner(l) {
  const first = chapter('t4-1');
  return `
  <section class="welcome">
    <div>
      <p class="eyebrow">Mula di sini</p>
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
  ${recommendCard(l.nextAction())}
  <div style="margin-top:16px">${storageNote(l)}</div>`;
}

function returningLearner(l) {
  const cur = chapter(l.last.ch), sum = l.chapterSummary(cur);
  const t = l.totals;
  const recent = l.recent.length
    ? `<ul class="activity">${l.recent.map((e) => {
        const ex = e.t === 'set-done';
        return `<li><span class="a-ico${ex ? ' is-ex' : ''}">${icon(ex ? 'pencil' : 'book')}</span><div><b>${esc(e.sub)} ${esc(subtopicTitle(e.ch, e.sub))}</b><span>${ex ? `Latihan · betul ${e.right}/${e.total} (${e.first} pada cubaan pertama)` : 'Nota selesai'} · ${esc(whenText(e.at))}</span></div></li>`;
      }).join('')}</ul>`
    : '<p class="small muted">Aktiviti muncul di sini selepas anda menandakan nota selesai atau menamatkan satu set latihan.</p>';
  return `
  <section class="welcome">
    <div>
      <p class="eyebrow">Sambung belajar</p>
      <h1 style="margin-top:6px">Selamat kembali!</h1>
      <p class="lead" style="margin-top:10px">Kali terakhir anda membuka ${esc(chapterLabel(cur))} · ${esc(whenText(l.last.at))}.</p>
    </div>
    <div class="card-game continue">
      <div class="continue-head"><span class="big-num">${cur.number}</span><div><p class="eyebrow">Bab semasa</p><h2 class="h3">${esc(cur.title)}</h2></div></div>
      <div><p class="small"><b>Terakhir:</b> ${esc(l.last.sub)} ${esc(subtopicTitle(cur.id, l.last.sub))} ${masteryTag(l.level(cur.id, l.last.sub))}</p>
        <div class="meter" style="margin-top:10px"><div class="meter-row"><span>Subtopik dikuasai (Faham atau Mahir)</span><b>${sum.mastered}/${sum.total}</b></div>${bar(sum.pct, { gold: sum.state !== 'done', label: 'Subtopik dikuasai dalam bab semasa' })}</div></div>
      <div class="btn-row"><a class="btn btn-primary" href="${l.last.kind === 'ex' ? `#/latihan/${cur.id}/${l.last.sub}` : `#/nota/${cur.id}/${l.last.sub}`}">Sambung ${icon('arrow')}</a><a class="btn btn-quiet" href="#/bab/${cur.id}">Gambaran bab</a></div>
    </div>
  </section>
  ${recommendCard(l.nextAction())}
  <div class="grid grid-2 grid-gap-lg section">
    <section class="card" aria-labelledby="h-act">
      <div class="section-head"><h2 class="h3" id="h-act">Aktiviti terkini</h2></div>
      ${recent}
    </section>
    <section class="card" aria-labelledby="h-prog">
      <div class="section-head"><h2 class="h3" id="h-prog">Kemajuan pembelajaran</h2><a class="textlink small" href="#/kemajuan">Butiran ${icon('arrow')}</a></div>
      <div class="stack">
        <div class="meter"><div class="meter-row"><span>Bab dikuasai</span><b>${t.chaptersDone}/${t.chaptersAvailable}</b></div>${bar(t.chaptersAvailable ? (t.chaptersDone / t.chaptersAvailable) * 100 : 0, { label: 'Bab dikuasai' })}</div>
        <div class="meter"><div class="meter-row"><span>Subtopik Faham atau Mahir</span><b>${t.faham}/${t.notesTotal}</b></div>${bar(t.notesTotal ? (t.faham / t.notesTotal) * 100 : 0, { label: 'Subtopik dikuasai' })}</div>
        <div class="meter"><div class="meter-row"><span>Nota selesai</span><b>${t.notesDone}/${t.notesTotal}</b></div>${bar(t.notesTotal ? (t.notesDone / t.notesTotal) * 100 : 0, { gold: true, label: 'Nota selesai' })}</div>
      </div>
      <p class="small muted" style="margin-top:16px">Dikira daripada ${t.chaptersAvailable} bab yang tersedia. Kemajuan game disimpan oleh game itu sendiri.</p>
    </section>
  </div>
  <div style="margin-top:16px">${storageNote(l)}</div>`;
}

export async function render() {
  const l = await getLearner();
  const html = `<div class="wrap">
    <div style="padding-top:20px">${journeyCompact(l.hasActivity ? 'latih' : 'fahami')}</div>
    ${l.last ? returningLearner(l) : newLearner(l)}
    <section class="section" aria-labelledby="h-quick">
      <h2 class="h3" id="h-quick" style="margin-bottom:16px">Pergi ke</h2>
      <div class="grid grid-3">
        <a class="card card-link card-tight" href="#/bab"><span class="num" style="margin-bottom:12px">${icon('book')}</span><h3 class="h3" style="font-size:var(--fs-md)">Semua bab</h3><p class="small muted">Tingkatan 4 dan 5, mengikut DSKP.</p></a>
        <a class="card card-link card-tight" href="#/main"><span class="num is-done" style="margin-bottom:12px">${icon('gamepad')}</span><h3 class="h3" style="font-size:var(--fs-md)">Game DENAI</h3><p class="small muted">${GAME.world}: ${esc(GAME.name)}.</p></a>
        <a class="card card-link card-tight" href="#/kemajuan"><span class="num is-progress" style="margin-bottom:12px">${icon('chart')}</span><h3 class="h3" style="font-size:var(--fs-md)">Kemajuan saya</h3><p class="small muted">Nota, latihan dan tahap penguasaan.</p></a>
      </div>
      <p class="small muted" style="margin-top:16px">Mahu terus main? <a href="${GAME_URL}">Buka game DENAI</a>.</p>
    </section>
  </div>`;
  return { title: 'Learning Hub', nav: 'hub', surface: 'play', html };
}
