// Tense Tales — Phase A design preview controller.
//
// This is NOT a new learning engine. It is a thin presentation layer over
// the existing, already-tested pure-JS modules (grammarEngine,
// sentenceBuilder, storyOrderController, wordOrder, learningFeedback,
// sceneComposition) wired up just enough to review the new visual design
// and interaction pattern for each of the 7 Phase A screens. Validation,
// grammar generation, and scene composition are 100% delegated to the
// production modules loaded before this file — nothing about "what is a
// correct answer" is reimplemented here.
//
// Not linked from index.html; not part of the production entry flow.

(() => {
  const T = window.TenseTales;
  const STORY_ID = 'climbing-the-tree'; // "The Fallen Books" (see src/data/stories.js)
  const TENSE = 'pastSimple'; // preview defaults to one tense; not a toggle in Phase A
  const story = T.data.stories[STORY_ID];
  const catalog = T.data.assetCatalog;
  const composition = T.utils.sceneComposition;
  const reduced = window.prefersReducedMotion ? window.prefersReducedMotion() : false;

  // ---- Screen switching -----------------------------------------------
  const screens = {
    home: document.getElementById('screen-home'),
    select: document.getElementById('screen-select'),
    storyorder: document.getElementById('screen-storyorder'),
    sentence: document.getElementById('screen-sentence'),
    results: document.getElementById('screen-results'),
    classroom: document.getElementById('screen-classroom'),
  };
  function goto(name) {
    if (!screens[name]) return;
    Object.entries(screens).forEach(([key, el]) => el.classList.toggle('is-active', key === name));
    document.querySelectorAll('.dp-devbar [data-goto]').forEach((btn) => {
      btn.setAttribute('aria-current', btn.dataset.goto === name ? 'true' : 'false');
    });
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    if (name === 'storyorder') initStoryOrder();
    if (name === 'sentence') initSentence();
    if (name === 'classroom') initClassroom();
  }
  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      goto(el.dataset.goto);
    });
  });
  goto('home');

  // ---- Scene rendering helper -------------------------------------------
  // Renders one story panel into a container using the SAME composition
  // engine production gameplay uses (sceneComposition.renderDom), so what
  // you see here is exactly what the real game would draw — not a mockup.
  function renderPanel(container, panel, frame) {
    container.innerHTML = '';
    composition.renderDom(container, panel.scene, catalog, {
      storyId: story.id,
      panelId: panel.id,
      frameBounds: frame || { width: container.clientWidth || 400, height: container.clientHeight || 300 },
    });
  }

  function panelById(id) {
    return story.panels.find((p) => p.id === id);
  }

  // ---- A. Home ------------------------------------------------------------
  renderPanel(document.getElementById('homeScene'), panelById('climb-tree-02'), { width: 420, height: 315 });
  renderPanel(document.getElementById('continueThumb'), panelById('climb-tree-01'), { width: 48, height: 48 });

  // ---- B. Story / activity selection --------------------------------------
  (() => {
    const grid = document.getElementById('storyGrid');
    const stories = Object.values(T.data.stories).sort((a, b) => a.level - b.level);
    stories.forEach((s) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'dp-story-card';
      const thumb = document.createElement('div');
      thumb.className = 'dp-story-thumb';
      const scenePane = document.createElement('div');
      scenePane.className = 'dp-story-scene';
      const status = document.createElement('span');
      status.className = 'dp-story-status' + (s.id === STORY_ID ? ' is-ready' : '');
      status.textContent = s.id === STORY_ID ? 'Recommended' : 'Available';
      thumb.append(scenePane, status);
      card.appendChild(thumb);
      const body = document.createElement('div');
      body.className = 'dp-story-body';
      body.innerHTML = `
        <h3>${s.title}</h3>
        <div class="dp-story-tags"><span>${s.supportedTenses.map((t) => (t === 'pastSimple' ? 'Past' : 'Present')).join(' / ')}</span><span>4 scenes</span></div>
        <div class="dp-story-meta"><span class="dp-est-note">~5 min (estimate)</span><span>Level ${s.level}</span></div>
      `;
      card.appendChild(body);
      card.addEventListener('click', () => goto('storyorder'));
      grid.appendChild(card);
      // Render after insertion so clientWidth is available for the thumb.
      requestAnimationFrame(() => renderPanel(scenePane, s.panels[0], { width: thumb.clientWidth || 260, height: (thumb.clientWidth || 260) * 0.75 }));
    });
  })();

  // ---- C. Story Order -------------------------------------------------
  let soController = null;
  let soChecked = false;
  function initStoryOrder() {
    soController = T.gameplay.storyOrderController.createStoryOrderController(story);
    soChecked = false;
    document.getElementById('soTimeChip').textContent = TENSE === 'pastSimple' ? 'Yesterday' : 'Every day';
    document.getElementById('soHint').hidden = true;
    document.getElementById('soFeedbackSlot').innerHTML = '';
    renderStoryOrder();
  }
  function renderStoryOrder() {
    const grid = document.getElementById('soGrid');
    grid.innerHTML = '';
    const state = soController.getState();
    grid.dataset.order = state.orderedPanelIds.join(',');
    state.orderedPanelIds.forEach((panelId, slotIndex) => {
      const panel = panelById(panelId);
      const slot = document.createElement('div');
      slot.className = 'dp-so-slot';
      const badge = document.createElement('span');
      badge.className = 'dp-so-badge';
      badge.textContent = String(slotIndex + 1);
      badge.setAttribute('aria-hidden', 'true');
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'dp-so-card';
      card.setAttribute('aria-label', `Slot ${slotIndex + 1}: ${panel.actionLabel}. Tap to select, tap another slot to swap.`);
      if (state.selectedSlot === slotIndex) card.classList.add('is-selected');
      card.addEventListener('click', () => {
        if (soChecked) return;
        const result = soController.selectSlot(slotIndex);
        renderStoryOrder();
      });
      slot.append(card, badge);
      grid.appendChild(slot);
      requestAnimationFrame(() => renderPanel(card, panel, { width: card.clientWidth || 260, height: card.clientHeight || 195 }));
    });
  }
  document.getElementById('soCheckBtn').addEventListener('click', () => {
    const result = soController.check();
    soChecked = result.correct;
    const canonical = T.gameplay.storyValidation.getCanonicalOrder(story);
    const state = soController.getState();
    const cards = document.querySelectorAll('#soGrid .dp-so-card');
    state.orderedPanelIds.forEach((panelId, i) => {
      cards[i].classList.toggle('is-correct', result.correct);
      cards[i].classList.toggle('is-incorrect', !result.correct && canonical[i] !== panelId);
    });
    const slot = document.getElementById('soFeedbackSlot');
    if (result.correct) {
      const lastPanel = panelById(canonical[canonical.length - 1]);
      const cmp = T.gameplay.learningFeedback.comparison(story.wordChallenge, TENSE);
      slot.innerHTML = `
        <div class="dp-feedback is-correct">
          <span class="dp-feedback-icon" aria-hidden="true">✓</span>
          <div class="dp-feedback-body">
            <h3>That's the right order!</h3>
            <p>${story.panels.map((p) => p.actionLabel).join(' → ')}</p>
            <p class="dp-feedback-answer"><mark>${cmp.selected.sentence}</mark><br>${cmp.selected.reason}</p>
          </div>
        </div>`;
      document.getElementById('soHint').hidden = true;
    } else {
      const hint = T.gameplay.learningFeedback.storyHint(story, result.attempts || 1);
      const hintEl = document.getElementById('soHint');
      hintEl.hidden = false;
      hintEl.textContent = hint.title + ' ' + hint.body;
      slot.innerHTML = `
        <div class="dp-feedback is-incorrect">
          <span class="dp-feedback-icon" aria-hidden="true">!</span>
          <div class="dp-feedback-body">
            <h3>Not quite the right order yet</h3>
            <p>Your arrangement is kept — move the highlighted pictures and try again.</p>
          </div>
        </div>`;
    }
  });
  document.getElementById('soHelpBtn').addEventListener('click', () => {
    const hint = T.gameplay.learningFeedback.storyHint(story, 1);
    const hintEl = document.getElementById('soHint');
    hintEl.hidden = false;
    hintEl.textContent = hint.title + ' ' + hint.body;
  });

  // ---- D. Build the Sentence -------------------------------------------
  let wsOrderedIds = [];
  let wsTokens = [];
  let wsChecked = false;
  function initSentence() {
    const panel = panelById(story.wordChallenge.panelId);
    document.getElementById('wsTimeChip').textContent = TENSE === 'pastSimple' ? 'Yesterday' : 'Every day';
    renderPanel(document.getElementById('wsScene'), panel, { width: 420, height: 315 });
    const resolved = T.grammar.sentenceBuilder.resolvePanelSentence(story.wordChallenge, TENSE);
    wsTokens = T.gameplay.wordOrder.tokenize(resolved.sentence);
    const bankOrder = T.gameplay.wordOrder.shuffled(wsTokens);
    wsOrderedIds = [];
    wsChecked = false;
    document.getElementById('wsFeedbackSlot').innerHTML = '';
    renderBank(bankOrder);
    renderSentenceArea();
  }
  function renderBank(bankOrder) {
    const bank = document.getElementById('wsBank');
    bank.innerHTML = '';
    bankOrder.forEach((word, i) => {
      const id = word + '__' + i;
      if (wsOrderedIds.includes(id)) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-token dp-token-bank';
      btn.textContent = word;
      btn.dataset.tokenId = id;
      btn.dataset.word = word;
      btn.disabled = wsChecked;
      btn.addEventListener('click', () => {
        wsOrderedIds.push(id);
        renderSentenceArea();
        renderBank(bankOrder);
      });
      bank.appendChild(btn);
    });
    bank.dataset.order = JSON.stringify(bankOrder.map((w, i) => w + '__' + i));
  }
  function renderSentenceArea() {
    const area = document.getElementById('wsSentenceArea');
    area.innerHTML = '';
    area.classList.toggle('has-words', wsOrderedIds.length > 0);
    const bankOrder = JSON.parse(document.getElementById('wsBank').dataset.order || '[]');
    wsOrderedIds.forEach((id) => {
      const word = id.split('__')[0];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-token dp-token-placed';
      btn.textContent = word;
      btn.disabled = wsChecked;
      btn.addEventListener('click', () => {
        wsOrderedIds = wsOrderedIds.filter((x) => x !== id);
        renderSentenceArea();
        renderBank(bankOrder.map((x) => x.split('__')[0]));
      });
      area.appendChild(btn);
    });
    if (!wsOrderedIds.length) {
      const placeholder = document.createElement('span');
      placeholder.style.color = 'var(--dp-ink-soft)';
      placeholder.textContent = 'Tap words below to build the sentence…';
      area.appendChild(placeholder);
    }
  }
  document.getElementById('wsUndoBtn').addEventListener('click', () => {
    if (wsChecked || !wsOrderedIds.length) return;
    wsOrderedIds.pop();
    renderSentenceArea();
    const bankOrder = JSON.parse(document.getElementById('wsBank').dataset.order || '[]').map((x) => x.split('__')[0]);
    renderBank(bankOrder);
  });
  document.getElementById('wsCheckBtn').addEventListener('click', () => {
    const words = wsOrderedIds.map((id) => id.split('__')[0]);
    const isCorrect = T.gameplay.wordOrder.isCorrect(words, wsTokens);
    wsChecked = isCorrect;
    const slot = document.getElementById('wsFeedbackSlot');
    document.querySelectorAll('#wsSentenceArea .dp-token-placed, #wsBank .dp-token-bank').forEach((t) => { t.disabled = isCorrect; });
    if (isCorrect) {
      const cmp = T.gameplay.learningFeedback.comparison(story.wordChallenge, TENSE);
      slot.innerHTML = `
        <div class="dp-feedback is-correct">
          <span class="dp-feedback-icon" aria-hidden="true">✓</span>
          <div class="dp-feedback-body">
            <h3>Sentence complete!</h3>
            <p class="dp-feedback-answer"><mark>${cmp.selected.sentence}</mark></p>
            <p>${cmp.selected.reason}</p>
          </div>
        </div>`;
    } else {
      const hint = T.gameplay.learningFeedback.wordHint(story.wordChallenge, TENSE, words, T.gameplay.wordOrder.tokenize, 1);
      slot.innerHTML = `
        <div class="dp-feedback is-incorrect">
          <span class="dp-feedback-icon" aria-hidden="true">!</span>
          <div class="dp-feedback-body">
            <h3>${hint.title}</h3>
            <p>${hint.body}</p>
          </div>
        </div>`;
    }
  });

  // ---- G. Classroom preview -----------------------------------------------
  let crIndex = 0;
  function initClassroom() {
    crIndex = 0;
    renderClassroomStep();
  }
  function renderClassroomStep() {
    const panel = story.panels[crIndex];
    document.getElementById('crStep').textContent = `Question ${crIndex + 1} of ${story.panels.length}`;
    renderPanel(document.getElementById('crScene'), panel, { width: 460, height: 345 });
    document.getElementById('crQuestion').textContent = `What ${crIndex === 0 ? 'happened first' : 'happened next'}?`;
    const resolved = T.grammar.sentenceBuilder.resolvePanelSentence(panel, TENSE);
    document.getElementById('crAnswer').textContent = resolved.sentence;
    const cmp = T.gameplay.learningFeedback.comparison(panel, TENSE);
    document.getElementById('crExplain').textContent = cmp.selected.reason;
    document.getElementById('crReveal').classList.remove('is-shown');
    document.getElementById('crRevealBtn').textContent = 'Reveal Answer';
    document.getElementById('crPrevBtn').disabled = crIndex === 0;
    document.getElementById('crNextBtn').disabled = crIndex === story.panels.length - 1;
  }
  document.getElementById('crRevealBtn').addEventListener('click', () => {
    const reveal = document.getElementById('crReveal');
    const showing = reveal.classList.toggle('is-shown');
    document.getElementById('crRevealBtn').textContent = showing ? 'Hide Answer' : 'Reveal Answer';
  });
  document.getElementById('crPrevBtn').addEventListener('click', () => { if (crIndex > 0) { crIndex -= 1; renderClassroomStep(); } });
  document.getElementById('crNextBtn').addEventListener('click', () => { if (crIndex < story.panels.length - 1) { crIndex += 1; renderClassroomStep(); } });
})();
