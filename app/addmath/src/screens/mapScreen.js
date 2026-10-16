import { navigate } from '../utils/router.js';
import { chaptersForForm } from '../data/chapters.js';
import { getProgress, saveLastLocation } from '../utils/storage.js';

export function renderMapScreen(root, form) {
  const chapters = chaptersForForm(form);
  const progress = getProgress();
  saveLastLocation({ form });

  root.innerHTML = `
    <div class="map-screen">
      <div class="map-header">
        <button type="button" class="btn-back" id="map-back" aria-label="Kembali ke pilihan tingkatan">&larr; Kembali</button>
        <h1 class="map-title">Tingkatan ${form}</h1>
      </div>
      <div class="map-nav-row">
        <button type="button" class="map-arrow" id="map-prev" aria-label="Lihat bab sebelum">&lsaquo;</button>
        <div class="map-track-wrap">
          <div class="map-track" id="map-track" tabindex="0">
            ${chapters
              .map(
                (ch, i) => `
              <button type="button" class="map-node ${i % 2 === 1 ? 'map-node-offset' : ''}" data-chapter="${ch.id}">
                <span class="map-node-number">${ch.number}</span>
                <span class="map-node-title">${ch.title}</span>
                ${ch.ready ? '' : '<span class="map-node-status">Belum tersedia</span>'}
              </button>`
              )
              .join('')}
          </div>
        </div>
        <button type="button" class="map-arrow" id="map-next" aria-label="Lihat bab seterusnya">&rsaquo;</button>
      </div>
    </div>
  `;

  const track = root.querySelector('#map-track');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll('.map-node').forEach((node) => {
    node.addEventListener('click', () => {
      const chapterId = node.getAttribute('data-chapter');
      const chapter = chapters.find((c) => c.id === chapterId);
      if (chapter.ready) {
        navigate(`lesson/${chapterId}/1`);
      } else {
        navigate(`soon/${chapterId}`);
      }
    });
  });

  root.querySelector('#map-back').addEventListener('click', () => navigate('form'));
  root.querySelector('#map-prev').addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth * 0.8, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  root.querySelector('#map-next').addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth * 0.8, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  const lastChapterId = progress.lastForm === form ? progress.lastChapterId : null;
  const toFocus = lastChapterId
    ? root.querySelector(`.map-node[data-chapter="${lastChapterId}"]`)
    : root.querySelector('.map-node');
  if (toFocus) {
    toFocus.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}
