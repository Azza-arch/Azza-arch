// Belajar — the learning hierarchy as simple paths:
//   #/bab, #/bab?t=5      Tingkatan → chapter path
//   #/bab/<id>            chapter → subtopic path → Nota / Contoh / Latihan
//   #/bab/<id>/ulang-kaji chapter revision sheet (all formulas, key points, common mistakes)
// Every chapter of both forms is listed with an honest content status:
// published, under review (shown only in owner preview ?semak=1), or not written yet.
// Nothing is locked: the path shows the recommended order, it never blocks.
import { esc, icon, crumbs, tag, masteryTag, emptyState, actionHref, insufficientNote } from '../ui.js';
import { chapter, chaptersOfForm, loadChapter, exerciseCount, writtenPool, chapterLabel, contentStats, STATUS_LABEL, gameLevelFor, NOTES_APP_URL } from '../data.js';
import { getLearner } from '../core/learner.js';
import { rank } from '../core/mastery.js';
import { renderMath, tex, sectionsOf, itemsOf } from '../core/content.js';

const formHref = (form) => (form === 5 ? '#/bab?t=5' : '#/bab');
const PKG = (c) => (c.package === 'elektif' ? tag('Elektif', 'elective') : '');
const statusTag = (c) => (c.status === 'published' ? '' : c.status === 'review' ? tag(STATUS_LABEL.review, 'review', 'clock') : tag(STATUS_LABEL.none, 'soon', 'lock'));

// ------------------------------------------------------------------ Tingkatan → chapter path
async function selection(route) {
  const form = route.query.get('t') === '5' ? 5 : 4;
  const list = chaptersOfForm(form), l = await getLearner();
  const ready = list.filter((c) => c.available);
  const sums = new Map(list.map((c) => [c.id, l.chapterSummary(c)]));
  const current = (l.last && ready.find((c) => c.id === l.last.ch)) || ready.find((c) => sums.get(c.id).state !== 'done') || null;
  const nextOf = current ? l.chapterNext(current) : null;
  const review = list.filter((c) => c.status === 'review' && !c.available).length, none = list.filter((c) => c.status === 'none').length;

  const node = (c) => {
    const sum = sums.get(c.id), cur = current && c.id === current.id;
    const cls = !c.available ? 'is-soon' : sum.state === 'done' ? 'is-done' : cur ? 'is-current' : sum.state === 'progress' ? 'is-progress' : '';
    const line = !c.available
      ? `${c.status === 'review' ? 'Nota sudah ditulis dan sedang disemak sebelum diterbitkan.' : 'Nota untuk bab ini belum ditulis.'}`
      : sum.state === 'ready' ? `${c.standards.length} subtopik` : `${sum.mastered} daripada ${sum.total} subtopik Faham atau Mahir`;
    return `<li class="path-node ${cls}">
      <span class="path-dot" aria-hidden="true">${sum.state === 'done' ? icon('check') : c.number}</span>
      <div class="path-body">
        <a class="path-link" href="#/bab/${c.id}"><span class="path-kicker">Bab ${c.number}</span><span class="path-title">${esc(c.title)}</span></a>
        <p class="path-meta">${sum.state === 'done' ? tag('Dikuasai', 'done', 'check') : cur ? tag('Anda di sini', 'progress') : ''}${statusTag(c)}${PKG(c)}${c.hasGame ? tag('Misi game', 'game', 'gamepad') : ''}<span>${esc(line)}</span></p>
        ${cur ? `<a class="btn btn-primary" href="${actionHref(nextOf)}">${l.last ? 'Sambung belajar' : 'Mula belajar'} ${icon('arrow')}</a>` : ''}
      </div>
    </li>`;
  };

  const note = form === 5 && (review || none)
    ? `<p class="notice" style="margin-bottom:20px">${icon('info')}<span>${review ? `Nota Bab ${list.filter((c) => c.status === 'review' && !c.available).map((c) => c.number).join(', ')} sudah ditulis dan <b>sedang disemak</b> sebelum diterbitkan. ` : ''}${none ? `Nota Bab ${list.filter((c) => c.status === 'none').map((c) => c.number).join(' dan ')} belum ditulis. ` : ''}Hanya kandungan yang sudah disemak diterbitkan kepada pelajar.</span></p>` : '';

  const html = `<div class="wrap wrap-path">
    <header class="pagehead">
      <p class="eyebrow">Belajar · Matematik Tambahan KSSM</p>
      <h1 class="h1">Pilih bab</h1>
    </header>
    <div class="path-toolbar">
      <nav class="seg" aria-label="Tingkatan">
        <a href="#/bab"${form === 4 ? ' aria-current="page"' : ''}>Tingkatan 4</a>
        <a href="#/bab?t=5"${form === 5 ? ' aria-current="page"' : ''}>Tingkatan 5</a>
      </nav>
      <p class="small muted">${ready.length} daripada ${list.length} bab boleh dipelajari</p>
    </div>
    ${note}
    <ol class="path" aria-label="Laluan bab Tingkatan ${form}">${list.map(node).join('')}</ol>
  </div>`;
  return { title: `Belajar · Tingkatan ${form}`, nav: 'bab', surface: 'read', html };
}

// ------------------------------------------------------------------ chapter not available
async function unavailable(c) {
  const stats = await contentStats(c.id).catch(() => null);
  const text = c.status === 'review'
    ? `Nota, contoh dan latihan bab ini sudah ditulis${stats ? ` (${stats.subtopics} subtopik, ${stats.examples} contoh berlangkah, ${stats.questions} soalan)` : ''} dan sedang disemak. Ia diterbitkan selepas semakan selesai.`
    : 'Nota, contoh dan latihan untuk bab ini belum ditulis. Senarai di bawah ialah topik DSKP bab ini.';
  return `<div class="wrap wrap-path">
    ${crumbs([['Belajar', '#/bab'], [`Tingkatan ${c.form}`, formHref(c.form)], [`Bab ${c.number}`]])}
    <header class="pagehead"><p class="eyebrow">Tingkatan ${c.form} · Bab ${c.number}</p><h1 class="h1">${esc(c.title)}</h1><p class="path-meta" style="margin-top:12px">${statusTag(c)}${PKG(c)}</p></header>
    ${emptyState({ ico: 'clock', title: c.status === 'review' ? 'Bab ini sedang disemak' : 'Bab ini belum ditulis', text, actions: `<a class="btn btn-primary" href="${formHref(c.form === 5 ? 4 : c.form)}">${c.form === 5 ? 'Belajar Tingkatan 4' : 'Kembali ke laluan bab'}</a>` })}
    <section class="section" aria-labelledby="h-std"><h2 class="h3" id="h-std" style="margin-bottom:12px">Topik dalam bab ini (DSKP)</h2>
      <ul class="std-list">${c.standards.map((s) => `<li><code>${esc(s.code)}</code><span>${esc(s.title)}</span><em>${esc(STATUS_LABEL[c.status])}</em></li>`).join('')}</ul></section>
  </div>`;
}

// ------------------------------------------------------------------ chapter → subtopic path
async function overview(id) {
  const c = chapter(id);
  if (!c) return { redirect: '#/bab' };
  if (!c.available) return { title: chapterLabel(c), nav: 'bab', surface: 'read', html: await unavailable(c) };
  const ch = await loadChapter(id);
  const l = await getLearner(), sum = l.chapterSummary(c);
  const next = l.chapterNext(c);

  const node = (s) => {
    const lv = l.level(id, s.id), ev = l.evidenceOf(id, s.id), read = l.noteDone(id, s.id);
    const n = exerciseCount(ch, s.id), w = writtenPool(ch, s.id).length, cur = next.sub === s.id;
    const game = gameLevelFor(id, s.id);
    const cls = rank(lv) >= rank('faham') ? 'is-done' : cur ? 'is-current' : read || lv !== 'belum' ? 'is-progress' : '';
    const facts = [read ? 'Nota selesai' : null, `${n} soalan latihan`, w ? `${w} soalan bertulis` : null, l.active(id, s.id) ? 'latihan belum habis' : null].filter(Boolean).join(' · ');
    return `<li class="path-node ${cls}" id="sub-${esc(s.id.replace('.', '-'))}">
      <span class="path-dot" aria-hidden="true">${rank(lv) >= rank('faham') ? icon('check') : esc(s.id)}</span>
      <div class="path-body">
        <a class="path-link" href="#/nota/${id}/${s.id}"><span class="path-kicker">Subtopik ${esc(s.id)}</span><span class="path-title">${esc(s.title)}</span></a>
        <p class="path-meta">${cur ? tag('Anda di sini', 'progress') : ''}${masteryTag(lv)}<span>${esc(facts)}</span></p>
        ${insufficientNote(ev)}
        ${cur ? `<div class="path-next"><p><b>Disyorkan: ${next.kind === 'note' ? 'baca nota' : next.kind === 'resume' ? 'sambung latihan' : 'latihan'}.</b> ${esc(next.why)}</p><a class="btn btn-primary" href="${actionHref(next)}">${l.last ? 'Sambung belajar' : 'Mula belajar'} ${icon('arrow')}</a></div>` : ''}
        <p class="path-actions"><a href="#/nota/${id}/${s.id}">${icon('book')}Nota</a><a href="#/nota/${id}/${s.id}?b=contoh">${icon('bulb')}Contoh</a>${n ? `<a href="#/latihan/${id}/${s.id}">${icon('pencil')}Latihan</a>` : ''}${w ? `<a href="#/latihan/${id}/${s.id}?jenis=bertulis">${icon('list')}Soalan bertulis</a>` : ''}${game ? `<a href="#/main">${icon('gamepad')}Misi ${game.no}</a>` : ''}</p>
      </div>
    </li>`;
  };

  const html = `<div class="wrap wrap-path">
    ${crumbs([['Belajar', '#/bab'], [`Tingkatan ${c.form}`, formHref(c.form)], [`Bab ${c.number}`]])}
    <header class="pagehead">
      <p class="eyebrow">Tingkatan ${c.form} · Bab ${c.number} · ${esc(c.bidang)}</p>
      <h1 class="h1">${esc(c.title)}</h1>
      <p class="path-meta" style="margin-top:12px">${sum.state === 'done' ? tag('Dikuasai', 'done', 'check') : ''}${PKG(c)}<span>${sum.mastered} daripada ${sum.total} subtopik Faham atau Mahir</span></p>
      ${ch.intro ? `<div class="ov-intro">${renderMath(ch.intro)}</div>` : ''}
    </header>
    <ol class="path path-sub" aria-label="Laluan subtopik Bab ${c.number}">${ch.subtopics.map(node).join('')}</ol>
    <section class="path-extra" aria-label="Ulang kaji bab">
      <a class="row-link" href="#/bab/${id}/ulang-kaji">${icon('list')}<span><b>Ulang kaji Bab ${c.number}</b><small>Semua rumus, perkara penting dan kesilapan lazim dalam satu halaman</small></span>${icon('right')}</a>
      <a class="row-link" href="${NOTES_APP_URL}#/bab/${id}">${icon('book')}<span><b>Nota penuh (rujukan)</b><small>Aplikasi Nota Add Math. Kemajuan tidak direkod di sana.</small></span>${icon('right')}</a>
    </section>
  </div>`;
  return { title: chapterLabel(c), nav: 'bab', surface: 'read', preview: c.preview, html };
}

// ------------------------------------------------------------------ chapter revision sheet
async function revision(id) {
  const c = chapter(id);
  if (!c || !c.available) return { redirect: `#/bab/${id || ''}` };
  const ch = await loadChapter(id);
  const l = await getLearner();
  const weak = l.reviewList(20).filter((r) => r.ch === id);
  const block = (s) => {
    const formulas = itemsOf(s, 'formula'), mistakes = itemsOf(s, 'mistakes'), summary = sectionsOf(s, 'summary')[0];
    return `<section class="nsec k-ulang" id="rv-${esc(s.id.replace('.', '-'))}" aria-labelledby="h-rv-${esc(s.id.replace('.', '-'))}">
      <div class="nsec-head"><h2 id="h-rv-${esc(s.id.replace('.', '-'))}">${esc(s.id)} ${esc(s.title)}</h2>${masteryTag(l.level(id, s.id))}</div>
      ${formulas.length ? `<h3 class="subhead">Rumus</h3><dl class="formulas">${formulas.map((f) => `<div class="formula"><dt>${tex(f.tex, true)}</dt><dd>${renderMath(f.html)}</dd></div>`).join('')}</dl>` : ''}
      ${summary?.points?.length ? `<h3 class="subhead">Ingat</h3><ul class="prose howto">${summary.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul>` : ''}
      ${mistakes.length ? `<h3 class="subhead">Kesilapan lazim</h3><div class="stack">${mistakes.map((m) => `<div class="mistake"><p><b>✗ Salah:</b> ${renderMath(m.wrong)}</p><p><b>Kenapa:</b> ${renderMath(m.why)}</p><p class="fix"><b>✓ Cara betul:</b> ${renderMath(m.fix)}</p></div>`).join('')}</div>` : ''}
      <p class="btn-row" style="margin-top:16px"><a class="btn btn-quiet" href="#/nota/${id}/${s.id}">${icon('book')}Nota ${esc(s.id)}</a>${exerciseCount(ch, s.id) ? `<a class="btn btn-quiet" href="#/latihan/${id}/${s.id}">${icon('pencil')}Latihan ${esc(s.id)}</a>` : ''}</p>
    </section>`;
  };
  const html = `<div class="wrap wrap-read"><div class="read">
    ${crumbs([['Belajar', '#/bab'], [`Tingkatan ${c.form}`, formHref(c.form)], [`Bab ${c.number}`, `#/bab/${id}`], ['Ulang kaji']])}
    <header class="read-head">
      <p class="eyebrow">Ulang kaji · ${esc(chapterLabel(c))}</p>
      <h1 class="h1">Ulang kaji Bab ${c.number}</h1>
      <p class="lead">Rumus, perkara penting dan kesilapan lazim bagi setiap subtopik, daripada nota yang sudah disemak.</p>
      ${weak.length ? `<div class="notice" style="margin-top:16px">${icon('target')}<span><b>Utamakan:</b> ${weak.map((r) => `<a href="${actionHref(r)}">${esc(r.sub)}</a>`).join(', ')}. ${esc(weak[0].why)}</span></div>` : ''}
    </header>
    ${ch.subtopics.map(block).join('')}
  </div></div>`;
  return { title: `Ulang kaji Bab ${c.number}`, nav: 'bab', surface: 'read', preview: c.preview, html };
}

export async function render(route) {
  const [id, sub] = route.params;
  if (!id) return selection(route);
  if (sub === 'ulang-kaji') return revision(id);
  return overview(id);
}
