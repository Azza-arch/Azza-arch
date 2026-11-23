// PAGE 08 — My progress. Demo data only (clearly labelled); no backend.
import { esc, icon, bar, crumbs, demoNote, emptyState, stateTag } from '../ui.js';
import { CHAPTERS, GAME, chapter, chapterLabel, subtopicTitle } from '../data.js';
import { getDemoState, getProfile, chapterState, chapterPct } from '../demo.js';
import { demoSwitch, bindDemoSwitch } from './hub.js';
import { renderMath } from '/app/addmath/src/notes/math.js';

export function render() {
  const st = getDemoState(), p = getProfile();
  const available = CHAPTERS.filter((c) => c.available);
  const notesTotal = available.reduce((n, c) => n + c.standards.length, 0);
  const notesRead = Object.values(p.notesRead).reduce((n, a) => n + a.length, 0);
  const gameDone = GAME.levels.filter((l) => p.game[l.no] === 'done').length;
  const cur = p.current ? chapter(p.current.chapter) : null;

  const stats = `<dl class="stat-row">
    <div class="stat"><dt>Bab selesai</dt><dd>${p.chaptersDone.length} <small>/ ${available.length}</small></dd></div>
    <div class="stat"><dt>Nota dibaca</dt><dd>${notesRead} <small>/ ${notesTotal}</small></dd></div>
    <div class="stat"><dt>Set latihan dicuba</dt><dd>${p.exercises.length}</dd></div>
    <div class="stat"><dt>Misi game selesai</dt><dd>${gameDone} <small>/ ${GAME.levels.length}</small></dd></div>
  </dl>`;

  const current = cur
    ? `<a class="card-game card-link continue" href="#/bab/${cur.id}" style="display:grid">
        <div class="continue-head"><span class="big-num">${cur.number}</span><div><p class="eyebrow">Bab semasa</p><h2 class="h3">${esc(cur.title)}</h2></div></div>
        <div class="meter"><div class="meter-row"><span>Terakhir: ${esc(p.current.sub)} ${esc(subtopicTitle(cur.id, p.current.sub))}</span><b>${p.notesRead[cur.id]?.length || 0}/${cur.standards.length} nota</b></div>${bar(chapterPct(p, cur.id), { gold: true, label: 'Kemajuan bab semasa' })}</div>
      </a>`
    : emptyState({ ico: 'flag', title: 'Belum ada bab dimulakan', text: 'Kemajuan anda akan muncul di sini selepas anda membaca nota pertama.', actions: '<a class="btn btn-primary" href="#/nota/t4-1/1.1">Mula Bab 1: Fungsi</a>' });

  const doneList = p.chaptersDone.length
    ? `<ul class="rows">${p.chaptersDone.map((id) => { const c = chapter(id); return `<li><a class="row" href="#/bab/${id}"><span class="num is-done">${icon('check')}</span><span class="row-main"><b>${esc(chapterLabel(c))}</b><span>Tingkatan ${c.form} · ${c.standards.length}/${c.standards.length} nota</span></span><span class="row-end">${icon('right')}</span></a></li>`; }).join('')}</ul>`
    : emptyState({ ico: 'check', title: 'Belum ada bab selesai', text: 'Sesuatu bab dikira selesai apabila semua notanya telah dibaca.' });

  const notesByChapter = `<ul class="rows">${available.filter((c) => c.form === 4).map((c) => {
    const s = chapterState(p, c.id), read = p.notesRead[c.id]?.length || 0;
    return `<li><a class="row" href="#/bab/${c.id}"><span class="num${s === 'done' ? ' is-done' : s === 'progress' ? ' is-progress' : ''}">${c.number}</span><span class="row-main"><b>${esc(c.title)}</b><span style="margin-top:6px">${bar(chapterPct(p, c.id), { small: true, gold: s === 'progress', label: `Nota ${c.title}` })}</span></span><span class="row-end"><span class="small" style="font-weight:800;color:var(--ink)">${read}/${c.standards.length}</span>${stateTag(s).replace('class="tag', 'class="tag sr-only-m')}</span></a></li>`;
  }).join('')}</ul>`;

  const exercises = p.exercises.length
    ? `<div class="table-wrap"><table class="table"><thead><tr><th>Latihan</th><th>Bab</th><th>Skor</th><th>Bila</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>${p.exercises.map((e) => { const c = chapter(e.chapter); return `<tr>
        <td><b>${esc(e.sub)} ${esc(subtopicTitle(e.chapter, e.sub))}</b></td><td data-label="Bab">Bab ${c.number} ${esc(c.title)}</td>
        <td data-label="Skor"><b style="display:inline;color:${e.score / e.total >= 0.6 ? 'var(--ok)' : 'var(--bad)'}">${e.score}/${e.total}</b></td><td data-label="Bila">${esc(e.when)}</td>
        <td><a class="textlink small" href="#/latihan/${e.chapter}/${e.sub}">Cuba lagi ${icon('arrow')}</a></td></tr>`; }).join('')}</tbody></table></div>`
    : emptyState({ ico: 'pencil', title: 'Belum ada latihan dicuba', text: 'Setiap nota berakhir dengan satu set latihan pendek.' });

  const game = `<ul class="rows">${GAME.levels.map((l) => { const done = p.game[l.no] === 'done'; return `<li><div class="row"><span class="num${done ? ' is-done' : ''}">${done ? icon('check') : l.no}</span><span class="row-main"><b>Level ${l.no}: ${esc(l.title)}</b><span>${renderMath(l.text)}</span></span><span class="row-end">${done ? '<span class="tag tag-done">Selesai</span>' : '<span class="tag tag-soon">Belum</span>'}</span></div></li>`; }).join('')}</ul>
    <div class="btn-row" style="margin-top:12px"><a class="btn btn-secondary" href="#/main">${icon('gamepad')}Ke halaman game</a></div>`;

  const html = `<div class="wrap">
    ${crumbs([['Hub', '#/hub'], ['Kemajuan saya']])}
    <header class="pagehead" style="display:flex;flex-wrap:wrap;gap:16px;align-items:end;justify-content:space-between">
      <div><p class="eyebrow">Kemajuan saya</p><h1 class="h1">${st === 'kembali' ? 'Perjalanan anda setakat ini' : 'Kemajuan anda akan muncul di sini'}</h1></div>
      ${demoSwitch(st)}
    </header>
    ${demoNote('Kemajuan sebenar akan disambung kemudian.')}
    <div class="section" style="margin-top:24px">${stats}</div>
    <div class="grid grid-2 grid-gap-lg section" style="margin-top:32px">
      <section aria-labelledby="h-cur"><h2 class="h3" id="h-cur" style="margin-bottom:12px">Bab semasa</h2>${current}</section>
      <section aria-labelledby="h-done"><h2 class="h3" id="h-done" style="margin-bottom:12px">Bab selesai</h2>${doneList}</section>
    </div>
    <section class="section" aria-labelledby="h-notes"><div class="section-head"><div><h2 class="h3" id="h-notes">Nota dibaca, Tingkatan 4</h2><p class="small">Hanya bab yang tersedia disenaraikan.</p></div></div>${notesByChapter}</section>
    <section class="section" aria-labelledby="h-ex"><h2 class="h3" id="h-ex" style="margin-bottom:12px">Aktiviti latihan</h2>${exercises}</section>
    <section class="section" aria-labelledby="h-game"><h2 class="h3" id="h-game" style="margin-bottom:12px">Aktiviti game · ${GAME.world}: ${esc(GAME.name)}</h2>${game}</section>
  </div>`;
  return { title: 'Kemajuan saya', nav: 'kemajuan', surface: 'play', html, mount: bindDemoSwitch };
}
