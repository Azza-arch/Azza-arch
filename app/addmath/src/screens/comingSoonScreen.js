import { navigate } from '../utils/router.js';
import { findChapter, formOfChapter } from '../data/chapters.js';
import { chapterById } from '../content/curriculum.js';

export function renderComingSoonScreen(root, chapterId) {
  const chapter = findChapter(chapterId);
  const form = formOfChapter(chapterId);

  if (!chapter) {
    navigate('start');
    return;
  }

  root.innerHTML = `
    <div class="soon-screen">
      <button type="button" class="btn-back" id="soon-back" aria-label="Kembali ke peta bab">&larr; Kembali ke peta bab</button>
      <div class="soon-card">
        <p class="soon-eyebrow">Bab ${chapter.number} &middot; Tingkatan ${form}</p>
        <h1 class="soon-title">${chapter.title}</h1>
        <p class="soon-message">Nota bab ini dalam penyediaan. Kandungan hanya diterbitkan selepas disemak.</p>${chapterById(chapter.id)?.package === 'elektif' ? '<p class="soon-note">Tajuk elektif: murid boleh memilih untuk mempelajarinya mengikut kecenderungan bidang.</p>' : ''}
      </div>
    </div>
  `;

  root.querySelector('#soon-back').addEventListener('click', () => navigate(`map/${form}`));
}
