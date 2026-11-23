// PAGE 03 — Chapter selection (#/bab, #/bab?t=5) and
// PAGE 04 — Chapter overview (#/bab/<id>).
import { esc, icon, bar, crumbs, stateTag, tag, masteryTag, masteryKey, emptyState, journeyCompact } from '../ui.js';
import { chapter, chaptersOfForm, loadChapter, exerciseCount, GAME, chapterLabel } from '../data.js';
import { getLearner } from '../core/learner.js';
import { rank } from '../core/mastery.js';
import { renderMath } from '../core/content.js';

const PKG = (c) => (c.package === 'elektif' ? tag('Elektif', 'elective') : '');

function card(c, l) {
  const sum = l.chapterSummary(c), st = sum.state;
  const numCls = { done: ' is-done', progress: ' is-progress', soon: ' is-soon' }[st] || '';
  const foot = st === 'soon'
    ? `<p class="small muted">${c.standards.length} subtopik · nota belum diterbitkan</p>`
    : `<div class="meter"><div class="meter-row"><span>${st === 'ready' ? `${c.standards.length} subtopik` : 'Subtopik dikuasai'}</span>${st === 'ready' ? '' : `<b>${sum.mastered}/${sum.total}</b>`}</div>${bar(sum.pct, { small: true, gold: st === 'progress', label: `Subtopik dikuasai, ${c.title}` })}</div>`;
  return `<a class="card card-link ch-card${st === 'soon' ? ' is-soon' : ''}${l.last?.ch === c.id ? ' is-current' : ''}" href="#/bab/${c.id}" aria-label="Bab ${c.number}: ${esc(c.title)}, ${st === 'soon' ? 'dalam penyediaan' : 'tersedia'}">
    <span class="num${numCls}">${st === 'done' ? icon('check') : c.number}</span>
    <div><p class="eyebrow">Bab ${c.number}</p><h3>${esc(c.title)}</h3><div class="tags">${stateTag(st)}${PKG(c)}${c.hasGame ? tag('Game', 'game', 'gamepad') : ''}</div></div>
    <div class="ch-foot">${foot}</div>
  </a>`;
}

async function selection(route) {
  const form = route.query.get('t') === '5' ? 5 : 4;
  const list = chaptersOfForm(form), l = await getLearner();
  const ready = list.filter((c) => c.available).length;
  const html = `<div class="wrap">
    ${crumbs([['Hub', '#/hub'], ['Bab']])}
    <header class="pagehead">
      <p class="eyebrow">Matematik Tambahan KSSM</p>
      <h1 class="h1">Pilih bab</h1>
      <p class="lead">Bab disusun mengikut DSKP. Bab bertanda <b>Dalam penyediaan</b> belum mempunyai nota yang diterbitkan.</p>
    </header>
    <div style="display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;margin-bottom:20px">
      <nav class="seg" aria-label="Tingkatan">
        <a href="#/bab"${form === 4 ? ' aria-current="page"' : ''}>Tingkatan 4</a>
        <a href="#/bab?t=5"${form === 5 ? ' aria-current="page"' : ''}>Tingkatan 5</a>
      </nav>
      <p class="small muted">${ready} daripada ${list.length} bab tersedia</p>
    </div>
    ${ready === 0 ? `<div style="margin-bottom:20px">${emptyState({ ico: 'clock', title: `Nota Tingkatan ${form} sedang disemak`, text: 'Senarai bab di bawah ialah topik DSKP. Nota dan latihan akan dibuka selepas disemak. Sementara itu, mulakan dengan Tingkatan 4.', actions: '<a class="btn btn-primary" href="#/bab">Lihat Tingkatan 4</a>' })}</div>` : ''}
    <div class="ch-grid">${list.map((c) => card(c, l)).join('')}</div>
  </div>`;
  return { title: `Bab Tingkatan ${form}`, nav: 'bab', surface: 'play', html };
}

function unavailable(c) {
  return `<div class="wrap">
    ${crumbs([['Hub', '#/hub'], [`Tingkatan ${c.form}`, c.form === 5 ? '#/bab?t=5' : '#/bab'], [`Bab ${c.number}`]])}
    <header class="pagehead"><p class="eyebrow">Tingkatan ${c.form} · Bab ${c.number}</p><h1 class="h1">${esc(c.title)}</h1><div class="tags" style="display:flex;gap:6px;margin-top:12px">${stateTag('soon')}${PKG(c)}</div></header>
    ${emptyState({ ico: 'clock', title: 'Nota bab ini dalam penyediaan', text: 'Nota, contoh dan latihan untuk bab ini belum diterbitkan. Kandungan diterbitkan hanya selepas disemak.', actions: `<a class="btn btn-primary" href="#/bab/t4-1">Mula dengan Bab 1 Fungsi</a><a class="btn btn-secondary" href="${c.form === 5 ? '#/bab?t=5' : '#/bab'}">${icon('left')}Kembali ke senarai bab</a>` })}
    <section class="section" aria-labelledby="h-std"><h2 class="h3" id="h-std" style="margin-bottom:12px">Topik dalam bab ini (DSKP)</h2>
      <ul class="std-list">${c.standards.map((s) => `<li><code>${esc(s.code)}</code><span>${esc(s.title)}</span></li>`).join('')}</ul></section>
  </div>`;
}

async function overview(id) {
  const c = chapter(id);
  if (!c) return { redirect: '#/bab' };
  if (!c.available) return { title: chapterLabel(c), nav: 'bab', surface: 'play', html: unavailable(c) };
  const ch = await loadChapter(id);
  const l = await getLearner(), sum = l.chapterSummary(c), st = sum.state;
  const subs = ch.subtopics;
  const resume = subs.find((s) => l.active(id, s.id));
  const unread = subs.find((s) => !l.noteDone(id, s.id));
  const weak = subs.find((s) => rank(l.level(id, s.id)) < rank('faham'));
  const next = resume ? { href: `#/latihan/${id}/${resume.id}`, label: 'Sambung latihan', title: `Latihan ${resume.id} ${resume.title}`, text: 'Anda ada set latihan yang belum habis.' }
    : unread ? { href: `#/nota/${id}/${unread.id}`, label: st === 'ready' ? 'Mula belajar' : 'Baca nota', title: `${unread.id} ${unread.title}`, text: st === 'ready' ? 'Mulakan dengan subtopik pertama.' : 'Nota seterusnya yang belum selesai.' }
    : weak ? { href: `#/latihan/${id}/${weak.id}`, label: 'Mula latihan', title: `Latihan ${weak.id} ${weak.title}`, text: 'Semua nota selesai. Latih subtopik ini sehingga tahap Faham.' }
    : { href: `#/latihan/${id}/${subs[0].id}`, label: 'Ulang latihan', title: 'Bab ini dikuasai', text: 'Ulang latihan untuk kekal mahir.' };

  const concept = (s) => {
    const read = l.noteDone(id, s.id), lv = l.level(id, s.id), n = exerciseCount(ch, s.id);
    const lastSet = l.sets.find((e) => e.ch === id && e.sub === s.id);
    return `<li class="concept">
      <span class="num${rank(lv) >= rank('faham') ? ' is-done' : read || lv !== 'belum' ? ' is-progress' : ''}">${rank(lv) >= rank('faham') ? icon('check', 'Dikuasai') : esc(s.id)}</span>
      <div><h3>${esc(s.id)} ${esc(s.title)}</h3><p class="meta" style="display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin-top:4px">${masteryTag(lv)}<span>${read ? 'Nota selesai' : 'Nota belum selesai'} · ${n} soalan${lastSet ? ` · set terakhir ${lastSet.right}/${lastSet.total}` : ''}${l.active(id, s.id) ? ' · latihan belum habis' : ''}</span></p></div>
      <div class="btn-row"><a class="btn btn-secondary" href="#/nota/${id}/${s.id}">${icon('book')}Nota</a><a class="btn btn-quiet" href="#/latihan/${id}/${s.id}"${n ? '' : ' aria-disabled="true" tabindex="-1"'}>${icon('pencil')}Latihan</a></div>
    </li>`;
  };

  const game = c.hasGame
    ? `<div class="card-game"><div class="section-head" style="margin-bottom:12px"><div><p class="eyebrow">${GAME.world}</p><h3 class="h3 display" style="font-weight:400">${esc(GAME.name)}</h3></div>${tag('Game', 'game', 'gamepad')}</div>
        <ul class="levels">${GAME.levels.map((l) => `<li class="level"><span class="level-no">${l.no}</span><div><h3>${esc(l.title)}</h3><p>${renderMath(l.text)}</p><a class="textlink" href="#/nota/${id}/${l.sub}">Konsep: ${esc(l.sub)} ${esc(subs.find((s) => s.id === l.sub)?.title || '')} ${icon('arrow')}</a></div></li>`).join('')}</ul>
        <div class="btn-row" style="margin-top:16px"><a class="btn btn-primary" href="#/main">${icon('gamepad')}Ke halaman game</a></div></div>`
    : emptyState({ ico: 'gamepad', title: 'Belum ada misi game untuk bab ini', text: `Game DENAI kini merangkumi Bab 1 Fungsi (${GAME.world}). Misi untuk bab lain belum dibina.`, actions: `<a class="btn btn-secondary" href="#/main?bab=${id}">Lihat game yang tersedia</a>` });

  const html = `<div class="wrap">
    ${crumbs([['Hub', '#/hub'], [`Tingkatan ${c.form}`, c.form === 5 ? '#/bab?t=5' : '#/bab'], [`Bab ${c.number}`]])}
    <div class="ov-head">
      <div>
        <p class="eyebrow">Tingkatan ${c.form} · Bab ${c.number} · ${esc(c.bidang)}</p>
        <h1 class="h1" style="margin-top:8px">${esc(c.title)}</h1>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">${stateTag(st)}${PKG(c)}${c.track ? tag(c.track) : ''}</div>
        <div class="ov-intro">${renderMath(ch.intro)}</div>
        <div style="margin-top:16px">${journeyCompact('fahami')}</div>
      </div>
      <aside class="card next-card" aria-labelledby="h-nextstep">
        <p class="eyebrow">Langkah seterusnya</p>
        <h2 class="h3" id="h-nextstep" style="margin-top:6px">${esc(next.title)}</h2>
        <p class="small muted" style="margin-top:4px">${esc(next.text)}</p>
        <div class="meter" style="margin:16px 0"><div class="meter-row"><span>Subtopik dikuasai</span><b>${sum.mastered}/${sum.total}</b></div>${bar(sum.pct, { gold: st !== 'done', label: 'Subtopik dikuasai dalam bab ini' })}</div>
        <a class="btn btn-primary btn-block" href="${next.href}">${esc(next.label)} ${icon('arrow')}</a>
      </aside>
    </div>

    <section class="section" style="margin-top:24px" aria-labelledby="h-konsep">
      <div class="section-head"><div><h2 class="h2" id="h-konsep">Konsep dalam bab ini</h2><p>Setiap subtopik ada satu nota dan latihan. Tahap penguasaan dikira daripada jawapan latihan anda.</p></div>${masteryKey()}</div>
      <ol class="concepts">${subs.map(concept).join('')}</ol>
    </section>

    <section class="section" aria-labelledby="h-game"><h2 class="h2" id="h-game" style="margin-bottom:16px">Aktiviti game berkaitan</h2>${game}</section>

    <p style="margin-top:32px"><a class="back" href="${c.form === 5 ? '#/bab?t=5' : '#/bab'}">${icon('left')}Semua bab Tingkatan ${c.form}</a></p>
  </div>`;
  return { title: chapterLabel(c), nav: 'bab', surface: 'play', html };
}

export async function render(route) {
  return route.params[0] ? overview(route.params[0]) : selection(route);
}
