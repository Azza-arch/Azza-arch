// Kemajuan (#/kemajuan) — the learner's own record (or the in-memory sample in
// demo mode, flagged by the global banner):
//   * what to revise next, from real activity (no streaks, no timers);
//   * conservative mastery per subtopic with the evidence behind it, and an honest
//     "bukti belum mencukupi" where a question bank is too small (D13);
//   * every chapter of both forms with its content status;
//   * recent activity and practice history (moved here from Utama);
//   * game records stay in the game and are never counted;
//   * data controls: where the record lives, and erasing it.
import { esc, icon, emptyState, masteryTag, storageNote, actionHref, insufficientNote, MASTERY_RULES, tag } from '../ui.js';
import { CHAPTERS, chapter, subtopicTitle, STATUS_LABEL } from '../data.js';
import { getLearner, whenText } from '../core/learner.js';
import { store } from '../core/store.js';

export async function render(route) {
  const l = await getLearner(), t = l.totals;
  const erased = route?.query.get('dipadam') === '1';
  const review = l.reviewList(6);

  const reviewHtml = review.length
    ? `<ul class="review-rows">${review.map((r) => `<li><a href="${actionHref(r)}"><span><b>${esc(r.sub)} ${esc(subtopicTitle(r.ch, r.sub))}</b><small>Bab ${chapter(r.ch).number} · ${esc(r.why)}</small></span><span class="review-act">${r.kind === 'note' ? 'Habiskan nota' : r.kind === 'resume' ? 'Sambung' : 'Latih semula'}${icon('right')}</span></a></li>`).join('')}</ul>`
    : emptyState({ ico: 'check', title: l.hasActivity ? 'Tiada yang perlu diulang kaji sekarang' : 'Belum ada aktiviti', text: l.hasActivity ? 'Subtopik yang masih pada tahap Mencuba, latihan yang belum habis dan nota yang belum selesai akan muncul di sini.' : 'Cadangan ulang kaji muncul selepas anda membaca nota dan menjawab latihan.', actions: l.hasActivity ? '' : '<a class="btn btn-primary" href="#/hub">Mula belajar</a>' });

  const chapterRow = (c) => {
    if (!c.available) return `<li class="prog-ch is-soon"><div class="prog-ch-head"><span class="num is-soon">${c.number}</span><div><b>Bab ${c.number}: ${esc(c.title)}</b><span class="small muted">${esc(STATUS_LABEL[c.status])}</span></div></div></li>`;
    const sum = l.chapterSummary(c);
    const subs = sum.state === 'ready' ? '' : `<ul class="prog-subs">${c.standards.map((s) => {
      const ev = l.evidenceOf(c.id, s.code), hints = l.hints(c.id, s.code);
      const facts = [l.noteDone(c.id, s.code) ? 'nota selesai' : 'nota belum selesai', ev ? `${ev.distinctFirst} soalan berbeza betul pada cubaan pertama daripada ${ev.distinctTried} dicuba` : 'belum berlatih', hints ? `${hints} petunjuk digunakan` : null].filter(Boolean).join(' · ');
      return `<li><a href="#/nota/${c.id}/${s.code}"><b>${esc(s.code)} ${esc(s.title)}</b></a>${masteryTag(l.level(c.id, s.code))}<span class="small muted">${esc(facts)}</span>${insufficientNote(ev)}</li>`;
    }).join('')}</ul>`;
    return `<li class="prog-ch"><div class="prog-ch-head"><span class="num${sum.state === 'done' ? ' is-done' : sum.state === 'progress' ? ' is-progress' : ''}">${sum.state === 'done' ? icon('check') : c.number}</span><div><a href="#/bab/${c.id}"><b>Bab ${c.number}: ${esc(c.title)}</b></a><span class="small muted">${sum.state === 'ready' ? 'Belum mula' : `${sum.mastered} daripada ${sum.total} subtopik Faham atau Mahir`}</span></div>${sum.state === 'done' ? tag('Dikuasai', 'done', 'check') : ''}</div>${subs}</li>`;
  };
  const form = (f) => `<h3 class="subhead">Tingkatan ${f}</h3><ol class="prog-list">${CHAPTERS.filter((c) => c.form === f).map(chapterRow).join('')}</ol>`;

  const activity = l.recent.length
    ? `<ul class="activity">${l.recent.map((e) => { const ex = e.t === 'set-done'; return `<li><span class="a-ico${ex ? ' is-ex' : ''}">${icon(ex ? 'pencil' : 'book')}</span><div><b>${esc(e.sub)} ${esc(subtopicTitle(e.ch, e.sub))}</b><span>${ex ? `Latihan · betul ${e.right}/${e.total} (${e.first} pada cubaan pertama)` : 'Nota selesai'} · ${esc(whenText(e.at))}</span></div></li>`; }).join('')}</ul>`
    : '<p class="small muted">Belum ada aktiviti. Aktiviti muncul selepas anda menandakan nota selesai atau menamatkan satu set latihan.</p>';

  const sets = l.sets.slice(0, 12);
  const history = sets.length
    ? `<div class="table-wrap"><table class="table"><thead><tr><th>Latihan</th><th>Bab</th><th>Betul</th><th>Bila</th><th><span class="sr-only">Tindakan</span></th></tr></thead><tbody>${sets.map((e) => { const c = chapter(e.ch); return `<tr>
        <td><b>${esc(e.sub)} ${esc(subtopicTitle(e.ch, e.sub))}</b></td><td data-label="Bab">Bab ${c.number} ${esc(c.title)}</td>
        <td data-label="Betul"><b style="display:inline">${e.right}/${e.total}</b> <span class="small muted">(${e.first} cubaan pertama)</span></td><td data-label="Bila">${esc(whenText(e.at))}</td>
        <td><a class="textlink small" href="#/latihan/${e.ch}/${e.sub}">Latihan lagi ${icon('arrow')}</a></td></tr>`; }).join('')}</tbody></table></div>`
    : '<p class="small muted">Belum ada set latihan yang diselesaikan.</p>';

  const html = `<div class="wrap wrap-path">
    <header class="pagehead">
      <p class="eyebrow">Kemajuan</p>
      <h1 class="h1">Kemajuan saya</h1>
      <p class="prog-summary">${t.faham} daripada ${t.notesTotal} subtopik diterbitkan pada tahap Faham atau Mahir · ${t.notesDone} nota selesai · ${t.sets} set latihan</p>
      <div style="margin-top:8px">${storageNote(l)}</div>
      ${erased && !l.hasActivity ? `<p class="notice" role="status" style="margin-top:12px">${icon('check')}<span>Kemajuan anda telah dipadam daripada pelayar ini.</span></p>` : ''}
    </header>

    <section class="section-sm" aria-labelledby="h-rev"><h2 class="h3" id="h-rev">Perlu diulang kaji</h2>${reviewHtml}</section>

    <section class="section-sm" aria-labelledby="h-mas">
      <h2 class="h3" id="h-mas">Penguasaan mengikut bab</h2>
      <details class="more"><summary>Cara tahap penguasaan dikira</summary><div class="more-body">
        <dl class="rules">${MASTERY_RULES.map(([k, v]) => `<div><dt>${masteryTag({ 'Belum mula': 'belum', Mencuba: 'mencuba', Faham: 'faham', Mahir: 'mahir' }[k])}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <p class="small muted">Hanya jawapan latihan dikira. Membuka atau menandakan nota, petunjuk, cubaan kedua, soalan bertulis dan rekod game tidak dikira sebagai bukti cubaan pertama. Soalan yang sama dijawab semula tidak dikira sebagai bukti baharu. Jika bank soalan subtopik terlalu kecil, tahap tidak diberi dan anda melihat "Bukti belum mencukupi". Tahap tidak turun hanya kerana masa berlalu. Label dan ambang ini sementara sehingga diuji dengan pelajar.</p>
      </div></details>
      ${form(4)}${form(5)}
    </section>

    <section class="section-sm" aria-labelledby="h-act"><h2 class="h3" id="h-act">Aktiviti terkini</h2>${activity}</section>
    <section class="section-sm" aria-labelledby="h-hist"><h2 class="h3" id="h-hist">Sejarah latihan</h2>${history}</section>

    <section class="section-sm" aria-labelledby="h-game"><h2 class="h3" id="h-game">Game</h2>
      <p class="small muted">Misi, syiling dan pencapaian game disimpan oleh game itu sendiri. Learning Hub tidak membacanya dan tidak mengiranya sebagai penguasaan. <a href="#/main">Ke tab Game</a></p></section>

    <section class="section-sm" aria-labelledby="h-data"><h2 class="h3" id="h-data">Data dan tetapan</h2>
      <div class="card data-card">
        <p class="small">Rekod pembelajaran anda (nota, jawapan latihan, petunjuk) disimpan dalam pelayar ini sahaja. Tiada nama, e-mel atau teks jawapan disimpan, dan tiada data dihantar ke mana-mana.</p>
        ${l.demo ? '<p class="small muted" style="margin-top:12px">Mod demo: rekod contoh tidak disimpan.</p>'
          : `<div id="reset-area" style="margin-top:12px"><button type="button" class="btn btn-secondary" data-act="reset" ${l.hasActivity ? '' : 'disabled'}>${icon('x')}Padam kemajuan saya</button></div>`}
        <p class="small muted" style="margin-top:12px">Simpanan game tidak terjejas.</p>
      </div>
    </section>
  </div>`;

  const mount = (view) => {
    const area = view.querySelector('#reset-area');
    if (!area) return;
    area.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'reset') {
        area.innerHTML = `<div class="confirm" role="alertdialog" aria-labelledby="rc-t" aria-describedby="rc-d"><p id="rc-t"><b>Padam semua kemajuan dalam pelayar ini?</b></p><p id="rc-d" class="small">Nota selesai, jawapan latihan dan latihan yang belum habis akan dipadam. Tindakan ini tidak boleh dibatalkan.</p><div class="btn-row" style="margin-top:8px"><button type="button" class="btn btn-secondary" data-act="confirm">Ya, padam</button><button type="button" class="btn btn-quiet" data-act="cancel">Batal</button></div></div>`;
        area.querySelector('[data-act="cancel"]').focus();
      } else if (act === 'cancel') {
        area.innerHTML = `<button type="button" class="btn btn-secondary" data-act="reset">${icon('x')}Padam kemajuan saya</button>`;
        area.querySelector('[data-act="reset"]').focus();
      } else if (act === 'confirm') {
        store.reset();
        location.hash = '#/kemajuan?dipadam=1';
      }
    });
  };
  return { title: 'Kemajuan saya', nav: 'kemajuan', surface: 'read', html, mount };
}
