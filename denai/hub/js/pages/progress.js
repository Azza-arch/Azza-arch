// PAGE 08 — My progress, from the learner's own record (or the in-memory
// sample in demo mode, flagged by the global banner). Game progress is kept by
// the game itself and is not read in Phase 1.
import { esc, icon, bar, crumbs, emptyState, stateTag, masteryTag, masteryKey, storageNote } from '../ui.js';
import { CHAPTERS, GAME, chapter, chapterLabel, subtopicTitle, GAME_URL } from '../data.js';
import { getLearner, whenText } from '../core/learner.js';
import { renderMath } from '../core/content.js';

export async function render() {
  const l = await getLearner(), t = l.totals;
  const available = CHAPTERS.filter((c) => c.available);
  const cur = l.last ? chapter(l.last.ch) : null;

  const stats = `<dl class="stat-row">
    <div class="stat"><dt>Bab dikuasai</dt><dd>${t.chaptersDone} <small>/ ${t.chaptersAvailable}</small></dd></div>
    <div class="stat"><dt>Subtopik Faham atau Mahir</dt><dd>${t.faham} <small>/ ${t.notesTotal}</small></dd></div>
    <div class="stat"><dt>Nota selesai</dt><dd>${t.notesDone} <small>/ ${t.notesTotal}</small></dd></div>
    <div class="stat"><dt>Set latihan selesai</dt><dd>${t.sets}</dd></div>
  </dl>`;

  const current = cur
    ? (() => { const sum = l.chapterSummary(cur); return `<a class="card-game card-link continue" href="#/bab/${cur.id}" style="display:grid">
        <div class="continue-head"><span class="big-num">${cur.number}</span><div><p class="eyebrow">Bab semasa</p><h2 class="h3">${esc(cur.title)}</h2></div></div>
        <div class="meter"><div class="meter-row"><span>Terakhir: ${esc(l.last.sub)} ${esc(subtopicTitle(cur.id, l.last.sub))} · ${esc(whenText(l.last.at))}</span><b>${sum.mastered}/${sum.total} dikuasai</b></div>${bar(sum.pct, { gold: true, label: 'Subtopik dikuasai dalam bab semasa' })}</div>
      </a>`; })()
    : emptyState({ ico: 'flag', title: 'Belum ada bab dimulakan', text: 'Kemajuan anda akan muncul di sini selepas anda membuka nota pertama.', actions: '<a class="btn btn-primary" href="#/nota/t4-1/1.1">Mula Bab 1: Fungsi</a>' });

  const doneChapters = available.filter((c) => l.chapterSummary(c).state === 'done');
  const doneList = doneChapters.length
    ? `<ul class="rows">${doneChapters.map((c) => `<li><a class="row" href="#/bab/${c.id}"><span class="num is-done">${icon('check')}</span><span class="row-main"><b>${esc(chapterLabel(c))}</b><span>Tingkatan ${c.form} · semua ${c.standards.length} subtopik Faham atau Mahir</span></span><span class="row-end">${icon('right')}</span></a></li>`).join('')}</ul>`
    : emptyState({ ico: 'check', title: 'Belum ada bab dikuasai', text: 'Sesuatu bab dikuasai apabila setiap subtopiknya mencapai tahap Faham melalui latihan.' });

  // Per-subtopic mastery for every chapter the learner has touched (others listed compactly).
  const chRows = available.map((c) => {
    const sum = l.chapterSummary(c);
    const subs = sum.state === 'ready' ? '' : `<ul class="mastery-key" style="margin-top:8px">${c.standards.map((s) => `<li style="list-style:none">${esc(s.code)} ${masteryTag(l.level(c.id, s.code))}${l.noteDone(c.id, s.code) ? '' : ' <span class="small muted">nota belum selesai</span>'}</li>`).join('')}</ul>`;
    return `<li><a class="row" href="#/bab/${c.id}"><span class="num${sum.state === 'done' ? ' is-done' : sum.state === 'progress' ? ' is-progress' : ''}">${c.number}</span><span class="row-main"><b>${esc(c.title)}</b><span style="margin-top:6px">${bar(sum.pct, { small: true, gold: sum.state === 'progress', label: `Subtopik dikuasai, ${c.title}` })}</span>${subs}</span><span class="row-end"><span class="small" style="font-weight:800;color:var(--ink)">${sum.mastered}/${sum.total}</span>${stateTag(sum.state).replace('class="tag', 'class="tag sr-only-m')}</span></a></li>`;
  }).join('');

  const sets = l.sets.slice(0, 12);
  const exercises = sets.length
    ? `<div class="table-wrap"><table class="table"><thead><tr><th>Latihan</th><th>Bab</th><th>Betul</th><th>Bila</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>${sets.map((e) => { const c = chapter(e.ch); return `<tr>
        <td><b>${esc(e.sub)} ${esc(subtopicTitle(e.ch, e.sub))}</b></td><td data-label="Bab">Bab ${c.number} ${esc(c.title)}</td>
        <td data-label="Betul"><b style="display:inline;color:${e.right / e.total >= 0.6 ? 'var(--ok)' : 'var(--bad)'}">${e.right}/${e.total}</b> <span class="small muted">(${e.first} cubaan pertama)</span></td><td data-label="Bila">${esc(whenText(e.at))}</td>
        <td><a class="textlink small" href="#/latihan/${e.ch}/${e.sub}">Latihan lagi ${icon('arrow')}</a></td></tr>`; }).join('')}</tbody></table></div>`
    : emptyState({ ico: 'pencil', title: 'Belum ada latihan diselesaikan', text: 'Setiap nota berakhir dengan latihan pendek. Keputusan setiap set muncul di sini.' });

  const game = `<ul class="rows">${GAME.levels.map((lv) => `<li><div class="row"><span class="num">${lv.no}</span><span class="row-main"><b>Level ${lv.no}: ${esc(lv.title)}</b><span>${renderMath(lv.text)}</span></span><span class="row-end">${masteryTag(l.level(GAME.chapter, lv.sub))}</span></div></li>`).join('')}</ul>
    <p class="small muted" style="margin-top:12px">Label di sebelah kanan ialah tahap penguasaan anda bagi konsep setiap level (daripada latihan). Kemajuan misi itu sendiri disimpan oleh game.</p>
    <div class="btn-row" style="margin-top:12px"><a class="btn btn-secondary" href="#/main">${icon('gamepad')}Ke halaman game</a><a class="btn btn-quiet" href="${GAME_URL}">Buka game</a></div>`;

  const html = `<div class="wrap">
    ${crumbs([['Hub', '#/hub'], ['Kemajuan saya']])}
    <header class="pagehead">
      <p class="eyebrow">Kemajuan saya</p><h1 class="h1">${l.hasActivity ? 'Perjalanan anda setakat ini' : 'Kemajuan anda akan muncul di sini'}</h1>
      <div style="margin-top:12px">${storageNote(l)}</div>
    </header>
    ${stats}
    <div class="grid grid-2 grid-gap-lg section" style="margin-top:32px">
      <section aria-labelledby="h-cur"><h2 class="h3" id="h-cur" style="margin-bottom:12px">Bab semasa</h2>${current}</section>
      <section aria-labelledby="h-done"><h2 class="h3" id="h-done" style="margin-bottom:12px">Bab dikuasai</h2>${doneList}</section>
    </div>
    <section class="section" aria-labelledby="h-notes"><div class="section-head"><div><h2 class="h3" id="h-notes">Penguasaan mengikut bab</h2><p class="small">Bab yang tersedia sahaja. Tahap dikira daripada jawapan latihan.</p></div>${masteryKey()}</div><ul class="rows">${chRows}</ul></section>
    <section class="section" aria-labelledby="h-ex"><h2 class="h3" id="h-ex" style="margin-bottom:12px">Aktiviti latihan</h2>${exercises}</section>
    <section class="section" aria-labelledby="h-game"><h2 class="h3" id="h-game" style="margin-bottom:12px">Game · ${GAME.world}: ${esc(GAME.name)}</h2>${game}</section>
  </div>`;
  return { title: 'Kemajuan saya', nav: 'kemajuan', surface: 'play', html };
}
