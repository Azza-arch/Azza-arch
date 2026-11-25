// M-5 (owner decision 2026-11-25, option A): the DENAI Learning Hub is the
// student front door; this notes app stays as the full reference. A thin bar
// above every screen links to the matching Hub page. Progress here is not
// counted in the Hub (separate records), and the bar says so.
const HUB = '/denai/hub/';
const ID = /^[a-z0-9.\-]{1,40}$/i;

function hubHref() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [name, ch, sub] = parts;
  const ok = (v) => typeof v === 'string' && ID.test(v);
  if (name === 'bab' && ok(ch)) return `${HUB}#/bab/${ch}`;
  if (name === 'nota' && ok(ch) && ok(sub)) return `${HUB}#/nota/${ch}/${sub}`;
  if (name === 'latihan' && ok(ch) && ok(sub)) return `${HUB}#/latihan/${ch}/${sub}`;
  if ((name === 'latihan' || name === 'ulangkaji') && ok(ch)) return `${HUB}#/bab/${ch}${name === 'ulangkaji' ? '/ulang-kaji' : ''}`;
  return `${HUB}#/hub`;
}

const bar = document.getElementById('hub-bar');
if (bar) {
  bar.innerHTML = `<p><span class="hub-bar-text"><b>Nota rujukan.</b> Untuk belajar langkah demi langkah dan menjejak kemajuan, guna DENAI Learning Hub. Jawapan di sini tidak dikira dalam kemajuan Hub.</span>
    <a class="hub-bar-link" id="hub-bar-link" href="${HUB}#/hub">Buka di Learning Hub &rarr;</a></p>`;
  const link = bar.querySelector('#hub-bar-link');
  const sync = () => { link.href = hubHref(); };
  window.addEventListener('hashchange', sync);
  sync();
}
