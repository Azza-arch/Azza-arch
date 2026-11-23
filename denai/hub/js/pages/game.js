// PAGE 07 — Game launch. Connects the notes to the existing Phaser game.
// The Play button opens the real game route; the game itself is untouched.
import { esc, icon, crumbs, tag, journeyCompact } from '../ui.js';
import { chapter, GAME, GAME_URL, GAME_LANDING_URL, subtopicTitle } from '../data.js';
import { getProfile } from '../demo.js';
import { renderMath } from '/app/addmath/src/notes/math.js';

export function render(route) {
  const from = chapter(route.query.get('bab') || '');
  const p = getProfile();
  const gc = chapter(GAME.chapter);
  const notice = from && !from.hasGame
    ? `<p class="notice" style="margin-top:20px">${icon('info')}<span>Bab ${from.number} ${esc(from.title)} belum mempunyai misi game. Game yang tersedia sekarang ialah untuk <b>Bab ${gc.number} ${esc(gc.title)}</b>.</span></p>` : '';

  const html = `
  <section class="sky-band">
    <div class="wrap">
      ${crumbs([['Hub', '#/hub'], ['Game DENAI']])}
      ${notice}
      <div class="game-hero">
        <div>
          <p class="eyebrow">Game DENAI · ${GAME.world} · Tingkatan ${gc.form} Bab ${gc.number} ${esc(gc.title)}</p>
          <h1 class="h1 display" style="font-size:var(--fs-hero);line-height:1;margin-top:10px">${esc(GAME.name)}</h1>
          <p class="lead" style="margin-top:14px;color:var(--ink)">Bantu Chill Boy membaiki jambatan, menjalankan bengkel dan memulihkan pintu air. Setiap misi menggunakan konsep fungsi yang anda pelajari dalam nota.</p>
          <div class="btn-row" style="margin-top:24px">
            <a class="btn btn-primary btn-lg" href="${GAME_URL}" id="play">${icon('play')}Main DENAI</a>
            <a class="btn btn-secondary btn-lg" href="#/hub">${icon('left')}Kembali ke Hub</a>
          </div>
          <p class="hero-note">Game dibuka dalam halaman penuh. Kemajuan game disimpan oleh game itu sendiri dalam pelayar ini.</p>
        </div>
        <div class="stage">
          <div class="stage-shot"><img src="${GAME.menuShot.src}" width="${GAME.menuShot.w}" height="${GAME.menuShot.h}" alt="${esc(GAME.menuShot.alt)}"></div>
          <div class="chillboy" aria-hidden="true"></div>
        </div>
      </div>
    </div>
    <div class="ground" aria-hidden="true"></div>
  </section>

  <div class="wrap">
    <section class="section" style="margin-top:48px" aria-labelledby="h-lv">
      <div class="section-head"><div><p class="eyebrow">Konsep pembelajaran berkaitan</p><h2 class="h2" id="h-lv">Setiap level, satu subtopik</h2></div>${journeyCompact('main')}</div>
      <ol class="levels">${GAME.levels.map((l) => `<li class="level"><span class="level-no">${l.no}</span><div>
        <h3>${esc(l.title)}${p.game[l.no] === 'done' ? ` ${tag('Selesai · data contoh', 'done', 'check')}` : ''}</h3>
        <p>${renderMath(l.text)}</p>
        <div class="btn-row" style="gap:4px 16px;margin-top:6px"><a class="textlink small" href="#/nota/${gc.id}/${l.sub}">${icon('book')}Nota ${esc(l.sub)} ${esc(subtopicTitle(gc.id, l.sub))}</a><a class="textlink small" href="#/latihan/${gc.id}/${l.sub}">${icon('pencil')}Latihan</a></div>
      </div></li>`).join('')}</ol>
    </section>

    <section class="section" aria-labelledby="h-shots">
      <h2 class="h2" id="h-shots" style="margin-bottom:16px">Dalam game</h2>
      <div class="grid grid-3">${GAME.shots.map((s) => `<figure class="shot"><img src="${s.src}" width="${s.w}" height="${s.h}" loading="lazy" alt="${esc(s.alt)}"><figcaption><b>${s.title}.</b> ${esc(s.text)}</figcaption></figure>`).join('')}</div>
    </section>

    <section class="section grid grid-2 grid-gap-lg" aria-label="Cara main">
      <div class="card"><h2 class="h3">Kawalan</h2>
        <ul class="keys" style="margin-top:12px"><li><kbd>←</kbd><kbd>→</kbd> Gerak</li><li><kbd>Space</kbd> Lompat</li><li><kbd>↑</kbd><kbd>↓</kbd> Tangga</li><li><kbd>E</kbd> Guna / berinteraksi</li></ul>
        <p class="small muted" style="margin-top:12px">Telefon: butang sentuh muncul di skrin. Game menggunakan mod landskap.</p></div>
      <div class="card"><h2 class="h3">Sebelum bermain</h2>
        <p class="small muted" style="margin-top:8px">Baca nota <a href="#/nota/${gc.id}/1.1">1.1 Fungsi</a> dahulu jika anda belum biasa dengan objek dan imej. Maklumat lanjut tentang game ada di <a href="${GAME_LANDING_URL}">laman DENAI</a>.</p>
        <div class="btn-row" style="margin-top:16px"><a class="btn btn-primary" href="${GAME_URL}">${icon('play')}Main DENAI</a></div></div>
    </section>
  </div>`;
  return { title: `Game: ${GAME.name}`, nav: 'main', surface: 'play', html };
}
