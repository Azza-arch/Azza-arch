// Owner review preview. Content in 'review' is NEVER listed publicly; it is
// only rendered when the owner opens the app with ?semak=1 (remembered for
// the browser tab via sessionStorage, cleared with ?semak=0). Every preview
// page shows a clear "not published" banner.
const KEY = 'addmath-semak';
export function previewMode() {
  try {
    const q = new URLSearchParams(location.search).get('semak');
    if (q === '1') sessionStorage.setItem(KEY, '1');
    if (q === '0') sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === '1';
  } catch { return false; }
}
export const visibleStatus = (status) => status === 'published' || (status === 'review' && previewMode());
export const previewBanner = (status) => status === 'published' ? '' :
  `<div class="preview-banner" role="note"><strong>PRATONTON SEMAKAN</strong> — kandungan ini berstatus <code>${status}</code> dan belum diterbitkan kepada umum.</div>`;
