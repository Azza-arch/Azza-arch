// Utama (#/hub) — the student's home. One question, one answer: "what do I do
// now?" One primary action (Sambung belajar), the reason in one sentence, where
// it sits in the chapter path, and at most three things worth revising.
// Activity history and statistics live in Kemajuan, not here.
import { esc, icon, actionHref, actionKind, storageNote } from '../ui.js';
import { chapter, chapterLabel, subtopicTitle } from '../data.js';
import { getLearner, whenText } from '../core/learner.js';

export async function render() {
  const l = await getLearner();
  const a = l.nextAction();
  const c = chapter(a.ch);
  const pos = c.standards.findIndex((s) => s.code === a.sub) + 1;
  const returning = !!l.last;
  const review = l.reviewList(4).filter((r) => !(r.ch === a.ch && r.sub === a.sub)).slice(0, 3);

  const html = `<div class="wrap home-wrap">
    <section class="home-main" aria-labelledby="h-home">
      <p class="eyebrow">${returning ? `Terakhir belajar ${esc(whenText(l.last.at).toLowerCase())}` : 'Mula di sini'}</p>
      <h1 class="home-title" id="h-home">${returning ? 'Selamat kembali' : 'Selamat datang ke DENAI'}</h1>
      <div class="next-up">
        <p class="next-label">Seterusnya</p>
        <h2 class="next-title">${esc(actionKind(a))} ${esc(a.sub)} · ${esc(subtopicTitle(a.ch, a.sub))}</h2>
        <p class="next-why">${esc(a.why)}</p>
        <a class="btn btn-primary btn-lg btn-block-m" href="${actionHref(a)}" id="continue">${returning ? 'Sambung belajar' : 'Mula belajar'} ${icon('arrow')}</a>
        <p class="next-where">${esc(chapterLabel(c))} · subtopik ${pos} daripada ${c.standards.length} · <a href="#/bab/${c.id}">Lihat laluan bab</a></p>
      </div>
    </section>
    ${review.length ? `<section class="home-review" aria-labelledby="h-review">
      <h2 class="h3" id="h-review">Perlu diulang kaji</h2>
      <ul class="review-rows">${review.map((r) => `<li><a href="${actionHref(r)}"><span><b>${esc(r.sub)} ${esc(subtopicTitle(r.ch, r.sub))}</b><small>${esc(r.why)}</small></span>${icon('right')}</a></li>`).join('')}</ul>
      <p class="small"><a href="#/kemajuan">Semua cadangan ulang kaji</a></p>
    </section>` : ''}
    <div class="home-foot">${storageNote(l)}</div>
  </div>`;
  return { title: 'Utama', nav: 'hub', surface: 'play', html };
}
