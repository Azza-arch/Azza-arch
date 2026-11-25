// PAGE 01 — Home: what DENAI is, the learning journey, chapters, the game.
import { esc, icon } from '../ui.js';
import { CHAPTERS, GAME, GAME_URL, chaptersOfForm, STATUS_LABEL } from '../data.js';
import { renderMath } from '../core/content.js';

export const JOURNEY = [
  ['bulb', 'Fahami', 'Satu konsep pada satu masa, dengan bahasa yang mudah.', 'var(--sky-pale)'],
  ['list', 'Ulang kaji', 'Rumus penting, langkah dan kesilapan lazim dalam satu tempat.', '#f0eafb'],
  ['pencil', 'Latih', 'Soalan interaktif dengan maklum balas dan penyelesaian penuh.', 'var(--gold-pale)'],
  ['gamepad', 'Main', 'Guna konsep yang sama dalam misi game platform DENAI.', 'var(--grass-pale)'],
  ['chart', 'Jejak kemajuan', 'Lihat bab yang selesai dan langkah seterusnya.', 'var(--wood-pale)'],
];

const chip = (c) => c.available
  ? `<li><a class="chip" href="#/bab/${c.id}"><b>${c.number}</b>${esc(c.title)}</a></li>`
  : `<li><span class="chip is-soon" title="${STATUS_LABEL[c.status]}"><b>${c.number}</b>${esc(c.title)}<span class="sr-only"> (${STATUS_LABEL[c.status]})</span></span></li>`;

export function render() {
  const t4 = chaptersOfForm(4), t5 = chaptersOfForm(5);
  const ready = CHAPTERS.filter((c) => c.available).length;
  const html = `
  <section class="sky-band">
    <div class="wrap hero">
      <div>
        <p class="hero-logo" aria-hidden="true">DENAI</p>
        <h1>Fahami Add Math. <em>Kemudian main.</em></h1>
        <p class="lead">DENAI menggabungkan nota ringkas, latihan interaktif dan game platform untuk Matematik Tambahan KSSM Tingkatan 4 dan 5. Belajar satu konsep, cuba soalan, kemudian guna konsep itu dalam misi.</p>
        <div class="btn-row">
          <a class="btn btn-primary btn-lg" href="#/hub">Mula Belajar ${icon('arrow')}</a>
          <a class="btn btn-secondary btn-lg" href="#/main">${icon('gamepad')}Teroka Game</a>
        </div>
        <p class="hero-note">Percuma · terus dalam pelayar · tanpa daftar</p>
      </div>
      <div class="stage">
        <div class="stage-shot"><img src="${GAME.menuShot.src}" width="${GAME.menuShot.w}" height="${GAME.menuShot.h}" alt="${esc(GAME.menuShot.alt)}"></div>
        <div class="chillboy" aria-hidden="true"></div>
      </div>
    </div>
    <div class="ground" aria-hidden="true"></div>
  </section>

  <div class="wrap">
    <section class="section" data-reveal aria-labelledby="h-journey">
      <div class="section-head"><div><p class="eyebrow">Cara DENAI berfungsi</p><h2 class="h2" id="h-journey">Lima langkah, satu konsep pada satu masa</h2></div></div>
      <ol class="journey">${JOURNEY.map(([ico, t, d, bg]) => `<li><span class="j-ico" style="--jc:${bg}">${icon(ico)}</span><b>${t}</b><p>${d}</p></li>`).join('')}</ol>
    </section>

    <section class="section" data-reveal aria-labelledby="h-bab">
      <div class="section-head">
        <div><p class="eyebrow">Kurikulum KSSM</p><h2 class="h2" id="h-bab">Bab yang tersedia</h2></div>
        <p>${ready} daripada ${CHAPTERS.length} bab ada nota dan latihan sekarang.</p>
      </div>
      <div class="grid grid-2 grid-gap-lg">
        <div class="card"><h3 class="h3">Tingkatan 4</h3><p class="muted small" style="margin:4px 0 16px">${t4.filter((c) => c.available).length} daripada ${t4.length} bab tersedia</p><ul class="chip-list">${t4.map(chip).join('')}</ul></div>
        <div class="card"><h3 class="h3">Tingkatan 5</h3><p class="muted small" style="margin:4px 0 16px">${t5.some((c) => c.available) ? `${t5.filter((c) => c.available).length} daripada ${t5.length} bab tersedia` : [t5.some((c) => c.status === 'review') ? `Bab ${t5.filter((c) => c.status === 'review').map((c) => c.number).join(', ')} sedang disemak` : '', t5.some((c) => c.status === 'none') ? `Bab ${t5.filter((c) => c.status === 'none').map((c) => c.number).join(', ')} belum ditulis` : ''].filter(Boolean).join('; ')}</p><ul class="chip-list">${t5.map(chip).join('')}</ul></div>
      </div>
      <p style="margin-top:20px"><a class="textlink" href="#/bab">Lihat semua bab ${icon('arrow')}</a></p>
    </section>

    <section class="section" data-reveal aria-labelledby="h-game">
      <div class="card-game">
        <div class="section-head" style="margin-bottom:20px">
          <div><p class="eyebrow">Game DENAI</p><h2 class="h2 display" id="h-game">${GAME.world}: ${esc(GAME.name)}</h2></div>
          <span class="tag tag-game">${icon('gamepad')}Bab 1 Fungsi · Tingkatan 4</span>
        </div>
        <p class="lead" style="font-size:var(--fs-md)">Bantu Chill Boy membaiki jambatan, menjalankan bengkel dan memulihkan pintu air dengan fungsi. Tiga level, setiap satu berpadanan dengan satu subtopik dalam nota.</p>
        <div class="grid grid-3" style="margin-top:20px">${GAME.shots.map((s) => `<figure class="shot"><img src="${s.src}" width="${s.w}" height="${s.h}" loading="lazy" alt="${esc(s.alt)}"><figcaption><b>${s.title}.</b> ${esc(s.text)}</figcaption></figure>`).join('')}</div>
        <ul class="levels" style="margin-top:20px">${GAME.levels.map((l) => `<li class="level"><span class="level-no">${l.no}</span><div><h3>${esc(l.title)}</h3><p>${renderMath(l.text)}</p></div></li>`).join('')}</ul>
        <div class="btn-row" style="margin-top:24px">
          <a class="btn btn-primary btn-lg" href="${GAME_URL}">${icon('play')}Main DENAI</a>
          <a class="btn btn-quiet" href="#/main">Misi dan konsep berkaitan ${icon('arrow')}</a>
        </div>
      </div>
    </section>

    <section class="section" data-reveal>
      <div class="card-sky recommend">
        <div><h2 class="h2 display">Sedia untuk mula?</h2><p style="margin-top:6px">Utama menunjukkan satu langkah seterusnya untuk anda, berdasarkan apa yang sudah anda buat.</p></div>
        <a class="btn btn-primary btn-lg" href="#/hub">Masuk Learning Hub ${icon('arrow')}</a>
      </div>
    </section>
  </div>`;
  return { title: 'Belajar Add Math sambil main', nav: 'home', surface: 'play', html };
}
