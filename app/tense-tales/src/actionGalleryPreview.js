// Phase B action-gallery controller. Renders the 10-level manifest
// (src/data/levelManifest.js), filterable by level then by action within
// that level. 'ready' actions render the same interactive Play/Replay/
// Prev/Next card as before, built from the shared actionEngine factories.
// 'blocked' actions render a quiet card explaining exactly what's missing,
// instead of being silently skipped or faked.
(function () {
  var T = window.TenseTales;
  var catalog = T.data.assetCatalog;
  var manifest = T.data.levelManifest;
  var composition = T.utils.sceneComposition;
  var frame = T.data.actionEngine.frame;

  var defaultRoles = { actor: 'amir', giver: 'aina', receiver: 'amir', giverName: 'Aina', receiverName: 'Amir' };

  function renderInto(el, scene) {
    var zoom = document.createElement('div');
    zoom.className = 'scene-zoom';
    el.textContent = '';
    el.appendChild(zoom);
    return composition.renderDom(zoom, scene, catalog, { frameBounds: frame });
  }

  function button(label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    return b;
  }

  function makeBlockedCard(action) {
    var card = document.createElement('div');
    card.className = 'ag-card ag-card--blocked';
    var head = document.createElement('div');
    head.className = 'ag-card-head';
    var title = document.createElement('h2');
    title.className = 'ag-card-title';
    title.textContent = action.title;
    head.appendChild(title);
    var badge = document.createElement('span');
    badge.className = 'ag-badge';
    badge.textContent = 'Blocked';
    head.appendChild(badge);
    card.appendChild(head);
    var reason = document.createElement('p');
    reason.className = 'ag-blocked-reason';
    reason.textContent = action.blockedReason;
    card.appendChild(reason);
    return card;
  }

  function makeReadyCard(action) {
    var def = action.build(defaultRoles);
    var card = document.createElement('div');
    card.className = 'ag-card';

    var head = document.createElement('div');
    head.className = 'ag-card-head';
    var title = document.createElement('h2');
    title.className = 'ag-card-title';
    title.textContent = action.title;
    head.appendChild(title);
    card.appendChild(head);

    var stage = document.createElement('div');
    stage.className = 'ag-stage';
    card.appendChild(stage);

    var stateLabel = document.createElement('div');
    stateLabel.className = 'ag-state-label';
    card.appendChild(stateLabel);

    var controls = document.createElement('div');
    controls.className = 'ag-controls';
    var prevBtn = button('⟨ Prev');
    var playBtn = button('▶ Play');
    var replayBtn = button('↻ Replay');
    var nextBtn = button('Next ⟩');
    var dots = document.createElement('div');
    dots.className = 'ag-dots';
    [prevBtn, playBtn, replayBtn, nextBtn].forEach(function (b) { controls.appendChild(b); });
    controls.appendChild(dots);
    card.appendChild(controls);

    var statesList = def.states, idx = 0, timer = null;

    function dotEls() {
      dots.textContent = '';
      statesList.forEach(function (s, i) {
        var d = document.createElement('span');
        d.className = 'ag-dot' + (i === idx ? ' is-active' : '');
        dots.appendChild(d);
      });
    }
    function show(i) {
      idx = Math.max(0, Math.min(statesList.length - 1, i));
      var s = statesList[idx];
      renderInto(stage, s.scene);
      stateLabel.textContent = (idx + 1) + '/' + statesList.length + ' — ' + s.label;
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === statesList.length - 1;
      dotEls();
    }
    function stopPlay() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (typeof prefersReducedMotion === 'function' && prefersReducedMotion()) { show(statesList.length - 1); return; }
      stopPlay(); show(0);
      timer = setInterval(function () {
        if (idx >= statesList.length - 1) { stopPlay(); return; }
        show(idx + 1);
      }, 900);
    }
    prevBtn.addEventListener('click', function () { stopPlay(); show(idx - 1); });
    nextBtn.addEventListener('click', function () { stopPlay(); show(idx + 1); });
    playBtn.addEventListener('click', play);
    replayBtn.addEventListener('click', play);

    show(0);
    return card;
  }

  var grid = document.getElementById('agGrid');
  var levelFilterEl = document.getElementById('agLevelFilter');
  var actionFilterEl = document.getElementById('agActionFilter');
  var state = { levelId: manifest.levels[0].id, actionId: 'all' };

  function currentLevel() { return manifest.levels.filter(function (l) { return l.id === state.levelId; })[0]; }

  function renderLevelFilter() {
    levelFilterEl.textContent = '';
    manifest.levels.forEach(function (lvl, i) {
      var readyCount = lvl.actions.filter(function (a) { return a.assetStatus === 'ready'; }).length;
      var b = button((i + 1) + '. ' + lvl.title + ' (' + readyCount + '/' + lvl.actions.length + ')');
      b.className = 'ag-filter-btn' + (lvl.id === state.levelId ? ' is-active' : '');
      b.addEventListener('click', function () { state.levelId = lvl.id; state.actionId = 'all'; renderAll(); });
      levelFilterEl.appendChild(b);
    });
  }

  function renderActionFilter() {
    actionFilterEl.textContent = '';
    var lvl = currentLevel();
    var allBtn = button('All actions');
    allBtn.className = 'ag-filter-btn ag-filter-btn--sub' + (state.actionId === 'all' ? ' is-active' : '');
    allBtn.addEventListener('click', function () { state.actionId = 'all'; renderGrid(); renderActionFilter(); });
    actionFilterEl.appendChild(allBtn);
    lvl.actions.forEach(function (a) {
      var b = button(a.title + (a.assetStatus === 'blocked' ? ' 🚫' : ''));
      b.className = 'ag-filter-btn ag-filter-btn--sub' + (state.actionId === a.id ? ' is-active' : '');
      b.addEventListener('click', function () { state.actionId = a.id; renderGrid(); renderActionFilter(); });
      actionFilterEl.appendChild(b);
    });
  }

  function renderGrid() {
    grid.textContent = '';
    var lvl = currentLevel();
    if (!lvl.actions.length) {
      var p = document.createElement('p');
      p.className = 'ag-note';
      p.textContent = lvl.note || 'No actions yet.';
      grid.appendChild(p);
      return;
    }
    var actions = state.actionId === 'all' ? lvl.actions : lvl.actions.filter(function (a) { return a.id === state.actionId; });
    actions.forEach(function (a) {
      grid.appendChild(a.assetStatus === 'ready' ? makeReadyCard(a) : makeBlockedCard(a));
    });
  }

  function renderAll() {
    renderLevelFilter();
    renderActionFilter();
    renderGrid();
  }

  renderAll();

  var rmCheckbox = document.getElementById('agReducedMotion');
  rmCheckbox.checked = typeof prefersReducedMotion === 'function' && prefersReducedMotion();
  var realPrefersReducedMotion = prefersReducedMotion;
  prefersReducedMotion = function () { return rmCheckbox.checked || realPrefersReducedMotion(); };

  // ===== Phase A4 Part 2: real multi-frame cycle previews =====
  // Walk/run genuinely step through every frame of the pack's walk0-7 /
  // run0-2 cycle while translating the actor across the frame — not a
  // 3-state card switching between idle/hold. Loops by wrapping x back to
  // the start once the actor would leave the safe zoom window.
  var Engine = T.data.actionEngine;
  function makeCycleCard(title, charId, poses, frameMs, xStep, env) {
    var card = document.createElement('div');
    card.className = 'ag-card';
    var head = document.createElement('div');
    head.className = 'ag-card-head';
    var h = document.createElement('h2');
    h.className = 'ag-card-title';
    h.textContent = title;
    head.appendChild(h);
    card.appendChild(head);
    var stage = document.createElement('div');
    stage.className = 'ag-stage';
    card.appendChild(stage);
    var label = document.createElement('div');
    label.className = 'ag-state-label';
    card.appendChild(label);
    var controls = document.createElement('div');
    controls.className = 'ag-controls';
    var playBtn = button('▶ Play');
    var stopBtn = button('⏸ Stop');
    controls.appendChild(playBtn);
    controls.appendChild(stopBtn);
    card.appendChild(controls);

    var frame = 0, x = Engine.SAFE_X.start, timer = null;
    function draw() {
      var scene = { environment: env || 'park', layers: [Engine.actorLayer('p1', charId, poses[frame % poses.length], x)] };
      renderInto(stage, scene);
      label.textContent = 'Frame: ' + poses[frame % poses.length] + ' (' + (frame % poses.length + 1) + '/' + poses.length + ')';
    }
    function tick() {
      frame++;
      x += xStep;
      if (x > Engine.SAFE_X.end) x = Engine.SAFE_X.start;
      draw();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (typeof prefersReducedMotion === 'function' && prefersReducedMotion()) {
        frame = Math.floor(poses.length / 2); x = Engine.SAFE_X.mid; draw(); return;
      }
      stop();
      timer = setInterval(tick, frameMs);
    }
    playBtn.addEventListener('click', play);
    stopBtn.addEventListener('click', stop);
    draw();
    return card;
  }

  var cycleGrid = document.getElementById('agCycleGrid');
  cycleGrid.appendChild(makeCycleCard('Walk (real 8-frame cycle)', 'amir', ['walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7'], 140, 1.2));
  cycleGrid.appendChild(makeCycleCard('Run (real 3-frame cycle, faster)', 'amir', ['run0', 'run1', 'run2'], 90, 2.4));

  // ===== Pose-only previews (no object attached yet) =====
  // Reuses the same 3-state Play/Replay card as the rest of the gallery —
  // these are genuinely 3-state actions (before/during/after a single
  // pose beat), unlike walk/run's continuous cycle.
  function poseOnlyAction(title, charId, midPose, labels) {
    return {
      assetStatus: 'ready',
      title: title,
      build: function () {
        return {
          states: [
            { id: 'start', label: labels[0], scene: { environment: 'park', layers: [Engine.actorLayer('p1', charId, 'idle', Engine.SAFE_X.mid)] } },
            { id: 'action', label: labels[1], scene: { environment: 'park', layers: [Engine.actorLayer('p1', charId, midPose, Engine.SAFE_X.mid)] } },
            { id: 'end', label: labels[2], scene: { environment: 'park', layers: [Engine.actorLayer('p1', charId, 'idle', Engine.SAFE_X.mid)] } },
          ],
        };
      },
    };
  }
  var poseGrid = document.getElementById('agPoseGrid');
  [
    poseOnlyAction('Pick up (down)', 'amir', 'down', ['Stands up', 'Bends down', 'Stands up again']),
    poseOnlyAction('Push (shove)', 'amir', 'shove', ['Stands still', 'Pushes forward', 'Stands still']),
  ].forEach(function (a) { poseGrid.appendChild(makeReadyCard(a)); });

  // Switch/hand-off: switch0 -> switch1 -> switch0, its own 3-state action
  // (not idle-wrapped, since the pose pair itself IS the hand-off beat).
  var switchAction = {
    title: 'Switch / hand-off (switch0 → switch1)',
    build: function () {
      return {
        states: [
          { id: 'start', label: 'Reaches to one side', scene: { environment: 'park', layers: [Engine.actorLayer('p1', 'amir', 'switch0', Engine.SAFE_X.mid)] } },
          { id: 'action', label: 'Switches to the other side', scene: { environment: 'park', layers: [Engine.actorLayer('p1', 'amir', 'switch1', Engine.SAFE_X.mid)] } },
          { id: 'end', label: 'Back to the first side', scene: { environment: 'park', layers: [Engine.actorLayer('p1', 'amir', 'switch0', Engine.SAFE_X.mid)] } },
        ],
      };
    },
  };
  poseGrid.appendChild(makeReadyCard(switchAction));

  // ===== Phase B1: pick up / push with real props =====
  var manifestProps = T.data.levelManifest.props;
  var suitcaseProp = { id: 'suitcase', asset: 'objectSuitcase', scale: 0.26, continuityKey: 'suitcase', label: 'the suitcase', labelCap: 'The suitcase' };
  var b1Grid = document.getElementById('agB1Grid');
  [
    { title: 'Pick up the book', build: function () { return Engine.createPickUpAction({ actorRole: 'amir', prop: manifestProps.book, verbId: 'pickUp' }); } },
    { title: 'Pick up the keys', build: function () { return Engine.createPickUpAction({ actorRole: 'aina', prop: { id: 'keys', asset: 'objectKeys', scale: 0.14, continuityKey: 'keys', label: 'the keys', labelCap: 'The keys' }, verbId: 'pickUp' }); } },
    { title: 'Push the suitcase', build: function () { return Engine.createPushAction({ actorRole: 'amir', prop: suitcaseProp, verbId: 'push' }); } },
  ].forEach(function (a) { b1Grid.appendChild(makeReadyCard(a)); });
})();
