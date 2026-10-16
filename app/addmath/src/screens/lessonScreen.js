import { navigate } from '../utils/router.js';
import { findChapter, formOfChapter } from '../data/chapters.js';
import { CHAPTER1_LESSONS } from '../data/lessonsChapter1.js';
import { MXC_HELP_HTML } from '../data/mxcHelp.js';
import { saveLastLocation } from '../utils/storage.js';

// Only Bab 1 (t4-1, Fungsi) has lessons wired up right now.
const LESSON_SOURCES = {
  't4-1': CHAPTER1_LESSONS,
};

export function renderLessonScreen(root, chapterId, lessonNumber) {
  const chapter = findChapter(chapterId);
  const lessons = LESSON_SOURCES[chapterId];
  const form = formOfChapter(chapterId);

  if (!chapter || !lessons) {
    navigate(`map/${form}`);
    return;
  }

  const total = lessons.length;
  let index = Math.min(Math.max(Number(lessonNumber) || 1, 1), total) - 1;

  saveLastLocation({ form, chapterId, lessonIndex: index });

  // Per-lesson UI state kept outside the render function so toggles/tabs
  // survive a re-render of the same lesson (e.g. after a compute update).
  let state = {};

  function resetStateForLesson(lesson) {
    const firstToggle = lesson.diagramHtml.match(/data-toggle="([^"]+)"/);
    state = {
      activeToggle: firstToggle ? firstToggle[1] : null,
      activeTab: lesson.tabs ? 'maksud' : null,
      showingBasicHelp: false,
      lastExplainHtml: lesson.defaultExplainHtml,
    };
  }

  function draw() {
    const lesson = lessons[index];
    root.innerHTML = `
      <div class="lesson-screen">
        <div class="lesson-header">
          <button type="button" class="btn-back" id="lesson-map-back" aria-label="Kembali ke peta bab">&larr; Peta bab</button>
          <div class="lesson-header-text">
            <p class="lesson-chapter-title">Bab ${chapter.number}: ${chapter.title}</p>
            <p class="lesson-note-title">${lesson.title}</p>
          </div>
        </div>

        <div class="lesson-body">
          <div class="lesson-panel lesson-diagram" id="lesson-diagram">
            ${lesson.diagramHtml}
          </div>
          <div class="lesson-panel lesson-explain">
            ${
              lesson.tabs
                ? `<div class="explain-tabs" role="tablist">
                    ${Object.keys(lesson.tabs)
                      .map(
                        (key) => `
                      <button type="button" class="explain-tab ${state.activeTab === key ? 'is-active' : ''}" data-tab="${key}">
                        ${tabLabel(key)}
                      </button>`
                      )
                      .join('')}
                  </div>`
                : ''
            }
            <div class="explain-body" id="explain-body">
              ${currentExplainHtml(lesson)}
            </div>
            ${
              lesson.hasBasicHelp
                ? `<button type="button" class="basic-help-link" id="basic-help-toggle">
                    ${state.showingBasicHelp ? 'Kembali ke penerangan' : 'Lupa asas? Pernah belajar y = mx + c?'}
                  </button>`
                : ''
            }
            ${
              lesson.misconceptions && lesson.misconceptions.length
                ? `<div class="misconceptions">
                    <p class="misconceptions-label">Ingat:</p>
                    <ul>${lesson.misconceptions.map((m) => `<li>${m}</li>`).join('')}</ul>
                  </div>`
                : ''
            }
          </div>
        </div>

        <div class="lesson-nav">
          <button type="button" class="btn-ghost" id="lesson-prev" ${index === 0 ? 'disabled' : ''}>&larr; Sebelum</button>
          <span class="lesson-progress">Nota ${index + 1} / ${total}</span>
          ${
            index === total - 1
              ? `<button type="button" class="btn-primary" id="lesson-practice">Cuba latihan &rarr;</button>`
              : `<button type="button" class="btn-primary" id="lesson-next">Seterusnya &rarr;</button>`
          }
        </div>
      </div>
    `;

    wireEvents(lesson);
    if (lesson.compute) {
      runCompute(lesson, root.querySelector('[data-role="compute-input"]')?.value ?? lesson.computeDefault);
    } else if (lesson.computeOrder) {
      runComputeOrder(lesson, root.querySelector('[data-role="compute-input"]')?.value ?? lesson.computeDefault);
    }
  }

  function tabLabel(key) {
    if (key === 'maksud') return 'Maksud';
    if (key === 'contoh') return 'Contoh';
    if (key === 'jalanKerja') return 'Jalan kerja';
    return key;
  }

  function currentExplainHtml(lesson) {
    if (state.showingBasicHelp) return MXC_HELP_HTML;
    if (state.activeTab && lesson.tabs) return lesson.tabs[state.activeTab];
    return state.lastExplainHtml;
  }

  function setExplain(html) {
    state.lastExplainHtml = html;
    state.activeTab = null;
    state.showingBasicHelp = false;
    root.querySelector('#explain-body').innerHTML = html;
    root.querySelectorAll('.explain-tab').forEach((el) => el.classList.remove('is-active'));
    const link = root.querySelector('#basic-help-toggle');
    if (link) link.textContent = 'Lupa asas? Pernah belajar y = mx + c?';
  }

  function runCompute(lesson, rawValue) {
    const resultEl = root.querySelector('[data-role="compute-result"]');
    if (resultEl) resultEl.innerHTML = lesson.compute(rawValue);
  }

  function runComputeOrder(lesson, rawValue) {
    const resultEl = root.querySelector('[data-role="compute-result"]');
    if (!resultEl) return;
    const order = resultEl.getAttribute('data-order') || state.activeToggle || 'fg';
    const x = Number(rawValue);
    if (rawValue === '' || Number.isNaN(x)) {
      resultEl.innerHTML = `<p class="compute-error">Masukkan nombor yang sah.</p>`;
      return;
    }
    resultEl.innerHTML = lesson.computeOrder[order](x);
  }

  function wireEvents(lesson) {
    root.querySelector('#lesson-map-back').addEventListener('click', () => navigate(`map/${form}`));

    const prevBtn = root.querySelector('#lesson-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));

    const nextBtn = root.querySelector('#lesson-next');
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    const practiceBtn = root.querySelector('#lesson-practice');
    if (practiceBtn) practiceBtn.addEventListener('click', () => navigate(`practice/${chapterId}`));

    const diagram = root.querySelector('#lesson-diagram');

    diagram.querySelectorAll('[data-part]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-part');
        diagram.querySelectorAll('[data-part]').forEach((p) => p.classList.remove('is-active'));
        el.classList.add('is-active');
        if (lesson.explainMap && lesson.explainMap[key]) {
          setExplain(lesson.explainMap[key]);
        }
      });
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          el.click();
        }
      });
    });

    diagram.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-toggle');
        state.activeToggle = key;
        diagram.querySelectorAll('[data-toggle]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        diagram.querySelectorAll('[data-variant]').forEach((v) => {
          v.hidden = v.getAttribute('data-variant') !== key;
        });
        if (lesson.explainMap && lesson.explainMap[key]) {
          setExplain(lesson.explainMap[key]);
        }
        if (lesson.computeOrder) {
          const resultEl = root.querySelector('[data-role="compute-result"]');
          if (resultEl) resultEl.setAttribute('data-order', key);
          const input = root.querySelector('[data-role="compute-input"]');
          runComputeOrder(lesson, input ? input.value : lesson.computeDefault);
        }
      });
    });

    root.querySelectorAll('.explain-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-tab');
        state.activeTab = key;
        state.showingBasicHelp = false;
        root.querySelectorAll('.explain-tab').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        root.querySelector('#explain-body').innerHTML = lesson.tabs[key];
      });
    });

    const helpBtn = root.querySelector('#basic-help-toggle');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        state.showingBasicHelp = !state.showingBasicHelp;
        root.querySelector('#explain-body').innerHTML = currentExplainHtml(lesson);
        helpBtn.textContent = state.showingBasicHelp ? 'Kembali ke penerangan' : 'Lupa asas? Pernah belajar y = mx + c?';
      });
    }

    const computeInput = root.querySelector('[data-role="compute-input"]');
    if (computeInput) {
      computeInput.addEventListener('input', () => {
        if (lesson.compute) runCompute(lesson, computeInput.value);
        else if (lesson.computeOrder) runComputeOrder(lesson, computeInput.value);
      });
    }
  }

  function goTo(newIndex) {
    if (newIndex < 0 || newIndex >= total) return;
    navigate(`lesson/${chapterId}/${newIndex + 1}`);
  }

  resetStateForLesson(lessons[index]);
  draw();
}
