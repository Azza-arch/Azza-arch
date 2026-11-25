// Game (#/main, #/main?bab=<id>) — the fourth primary destination (D14).
// Shows every world on the game's own map with its real state, how each playable
// mission maps to a subtopic, and keeps game records apart from academic mastery:
// the hub only reads game saves (core/game-records.js), never writes them, and nothing in the game changes a
// mastery level. The Play button opens the existing Phaser game, unchanged.
import { esc, icon, masteryTag, tag } from '../ui.js';
import { chapter, GAME, WORLDS, GAME_URL, GAME_LANDING_URL, subtopicTitle } from '../data.js';
import { renderMath } from '../core/content.js';
import { getLearner } from '../core/learner.js';
import { gameRecords, timeText } from '../core/game-records.js';

const STATE = { playable: ['Boleh dimain', 'done'], development: ['Sedang dibina', 'progress'], soon: ['Akan datang', 'soon'] };

export async function render(route) {
  const from = chapter(route.query.get('bab') || '');
  const gc = chapter(GAME.chapter);
  const l = await getLearner();
  const gr = l.demo ? null : gameRecords();
  const rec = (no) => { const r = gr?.[no]; if (!r) return ''; return r.done ? `${tag('Selesai', 'done', 'check')}<span class="small muted"> ${r.completions} kali${r.bestMs ? ` · terbaik ${timeText(r.bestMs)}` : ''}</span>` : r.running ? tag('Sedang dimain', 'progress') : `<span class="small muted">Belum dimain</span>`; };
  const notice = from && !from.hasGame
    ? `<p class="notice" style="margin-top:16px">${icon('info')}<span>Bab ${from.number} ${esc(from.title)} belum mempunyai misi game. Misi yang boleh dimain sekarang ialah untuk <b>Bab ${gc.number} ${esc(gc.title)}</b>.</span></p>` : '';

  const missions = `<ol class="levels">${GAME.levels.map((lv) => `<li class="level"><span class="level-no">${lv.no}</span><div>
      <h3>${esc(lv.title)}</h3>
      ${gr ? `<p class="level-rec">${rec(lv.no)}</p>` : ''}
      <p><b>Konsep:</b> ${esc(lv.concept)} · subtopik ${esc(lv.sub)} ${esc(subtopicTitle(gc.id, lv.sub))} · SP ${esc(lv.sp.join(', '))}</p>
      <p>${renderMath(lv.text)}</p>
      <p class="level-mastery"><span class="small muted">Tahap penguasaan anda bagi ${esc(lv.sub)} (daripada latihan, bukan game):</span>${masteryTag(l.level(gc.id, lv.sub))}</p>
      <p class="path-actions"><a href="#/nota/${gc.id}/${lv.sub}">${icon('book')}Nota ${esc(lv.sub)}</a><a href="#/latihan/${gc.id}/${lv.sub}">${icon('pencil')}Latihan ${esc(lv.sub)}</a></p>
    </div></li>`).join('')}</ol>`;

  const world = (w) => {
    const [label, kind] = STATE[w.state];
    const c = chapter(w.chapter);
    return `<li class="world${w.state === 'playable' ? ' is-playable' : ''}">
      <div class="world-head"><span class="world-no">${w.no}</span><div><h3>Dunia ${w.no}: ${esc(w.name)}</h3><p class="small muted">${esc(w.topic)} · Tingkatan ${c.form} Bab ${c.number}</p></div>${tag(label, kind)}</div>
      ${w.state === 'playable' ? missions
        : `<p class="small muted world-note">${w.state === 'development' ? `Misi sedang dibina dalam game${w.levels ? ` (${w.levels.map(esc).join(', ')})` : ''}. Belum boleh dimain.` : 'Belum dibina.'} Sementara itu, pelajari topik ini dalam <a href="#/bab/${c.id}">Belajar: Bab ${c.number}</a>.</p>`}
    </li>`;
  };

  const html = `
  <section class="sky-band">
    <div class="wrap">
      ${notice}
      <div class="game-hero">
        <div>
          <p class="eyebrow">Game DENAI</p>
          <h1 class="h1 display" style="font-size:var(--fs-hero);line-height:1;margin-top:10px">Main sambil guna konsep</h1>
          <p class="lead" style="margin-top:14px;color:var(--ink)">Bantu Chill Boy membaiki jambatan, menjalankan bengkel dan memulihkan pintu air. Setiap misi menggunakan satu konsep fungsi daripada nota.</p>
          <div class="btn-row" style="margin-top:24px"><a class="btn btn-primary btn-lg" href="${GAME_URL}" id="play">${icon('play')}Main DENAI</a></div>
          <p class="hero-note">Game dibuka dalam halaman penuh. Untuk kembali ke sini, tekan butang Kembali pelayar.</p>
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
    <p class="notice game-sep" style="margin-top:32px">${icon('info')}<span><b>Rekod game bukan bukti penguasaan.</b> Misi selesai, syiling, masa dan pencapaian disimpan oleh game itu sendiri dalam pelayar ini. Learning Hub hanya memaparkan status misi; tahap penguasaan hanya berubah melalui jawapan latihan.</span></p>

    <section class="section" style="margin-top:32px" aria-labelledby="h-worlds">
      <div class="section-head"><div><h2 class="h2" id="h-worlds">Dunia dan misi</h2><p>Hanya Dunia 1 boleh dimain sekarang. Dunia lain disenaraikan seperti dalam peta game.</p></div></div>
      <ol class="worlds">${WORLDS.map(world).join('')}</ol>
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
        <p class="small muted" style="margin-top:8px">Belum biasa dengan objek dan imej? Baca <a href="#/nota/${gc.id}/1.1">nota 1.1 Fungsi</a> dahulu. Maklumat lanjut tentang game ada di <a href="${GAME_LANDING_URL}">laman DENAI</a>.</p></div>
    </section>
  </div>`;
  return { title: 'Game', nav: 'main', surface: 'play', html };
}
