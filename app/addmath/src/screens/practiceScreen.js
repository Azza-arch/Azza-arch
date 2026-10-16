import { navigate } from '../utils/router.js';
import { findChapter, formOfChapter } from '../data/chapters.js';
import { CHAPTER1_PRACTICE } from '../data/practiceChapter1.js';

const PRACTICE_SOURCES = {
  't4-1': CHAPTER1_PRACTICE,
};

const LETTERS = ['A', 'B', 'C', 'D'];

export function renderPracticeScreen(root, chapterId) {
  const chapter = findChapter(chapterId);
  const questions = PRACTICE_SOURCES[chapterId];
  const form = formOfChapter(chapterId);

  if (!chapter || !questions) {
    navigate(`map/${form}`);
    return;
  }

  let qIndex = 0;
  let selected = null;
  let answered = false;
  let correctCount = 0;

  function draw() {
    if (qIndex >= questions.length) {
      drawComplete();
      return;
    }

    const q = questions[qIndex];
    root.innerHTML = `
      <div class="practice-screen">
        <div class="practice-header">
          <button type="button" class="btn-back" id="practice-back" aria-label="Kembali ke peta bab">&larr; Peta bab</button>
          <p class="practice-progress">Soalan ${qIndex + 1} / ${questions.length}</p>
        </div>
        <div class="practice-card">
          <p class="practice-prompt">${q.prompt}</p>
          <div class="practice-options" role="group" aria-label="Pilihan jawapan">
            ${q.options
              .map(
                (opt, i) => `
              <button type="button" class="practice-option" data-opt="${i}">
                <span class="practice-letter">${LETTERS[i]}</span>${opt}
              </button>`
              )
              .join('')}
          </div>
          <div class="practice-feedback" id="practice-feedback" aria-live="polite"></div>
        </div>
        <div class="practice-actions" id="practice-actions"></div>
      </div>
    `;

    root.querySelector('#practice-back').addEventListener('click', () => navigate(`map/${form}`));

    root.querySelectorAll('.practice-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        selected = Number(btn.getAttribute('data-opt'));
        answered = true;
        showFeedback(q);
      });
    });
  }

  function showFeedback(q) {
    root.querySelectorAll('.practice-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('is-correct');
      if (i === selected && selected !== q.answer) btn.classList.add('is-wrong');
    });

    const isCorrect = selected === q.answer;
    if (isCorrect) correctCount += 1;

    root.querySelector('#practice-feedback').innerHTML = `
      <p class="feedback-verdict ${isCorrect ? 'is-correct' : 'is-wrong'}">
        ${isCorrect ? 'Betul.' : 'Belum tepat.'}
      </p>
      <p>${q.feedback[selected]}</p>
    `;

    root.querySelector('#practice-actions').innerHTML = `
      ${
        !isCorrect
          ? `<button type="button" class="btn-ghost" id="practice-retry">Cuba lagi</button>`
          : ''
      }
      <a class="btn-ghost" href="#/lesson/${chapterId}/${q.relatedLesson}">Semak nota berkaitan</a>
      <button type="button" class="btn-primary" id="practice-next">
        ${qIndex === questions.length - 1 ? 'Selesai' : 'Soalan seterusnya &rarr;'}
      </button>
    `;

    const retryBtn = root.querySelector('#practice-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        selected = null;
        answered = false;
        draw();
      });
    }

    root.querySelector('#practice-next').addEventListener('click', () => {
      qIndex += 1;
      selected = null;
      answered = false;
      draw();
    });
  }

  function drawComplete() {
    root.innerHTML = `
      <div class="practice-screen practice-complete">
        <h1 class="practice-complete-title">Latihan selesai</h1>
        <p class="practice-complete-score">${correctCount} daripada ${questions.length} betul.</p>
        <p class="practice-complete-note">Ini ringkasan latihan ringkas, bukan ukuran penguasaan keseluruhan bab.</p>
        <div class="practice-complete-actions">
          <button type="button" class="btn-primary" id="complete-map">Kembali ke peta bab</button>
          <a class="btn-ghost" href="#/lesson/${chapterId}/1">Semak nota semula</a>
        </div>
      </div>
    `;
    root.querySelector('#complete-map').addEventListener('click', () => navigate(`map/${form}`));
  }

  draw();
}
