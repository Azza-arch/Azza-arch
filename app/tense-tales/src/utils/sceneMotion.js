(function () {
  function reduced() {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function motionFor(panel) {
    var label = String(panel.actionLabel || '').toLowerCase();
    if (/walk|approach|leave/.test(label)) return { target: 'actor', x: 14, y: 0, rotate: 0 };
    if (/climb|reach/.test(label)) return { target: 'actor', x: 0, y: -12, rotate: -2 };
    if (/show|take|pick|write/.test(label)) return { target: 'prop', x: 6, y: -3, rotate: 4 };
    if (/read|hold|close|open|put/.test(label)) return { target: 'prop', x: 0, y: -4, rotate: -3 };
    if (/cheer/.test(label)) return { target: 'actor', x: 0, y: -9, rotate: 0 };
    return { target: 'actor', x: 0, y: -5, rotate: 0 };
  }
  function playDom(container, panel) {
    if (!container || !panel) return Promise.resolve();
    var plan = motionFor(panel);
    var selector = plan.target === 'prop' ? '[data-scene-role$="Prop"]' : '[data-scene-role="actor"]';
    var targets = Array.prototype.slice.call(container.querySelectorAll(selector));
    if (!targets.length) targets = Array.prototype.slice.call(container.querySelectorAll('[data-scene-role="actor"]'));
    if (reduced() || !targets.length || !targets[0].animate) {
      container.classList.add('is-story-focus');
      setTimeout(function () { container.classList.remove('is-story-focus'); }, 420);
      return Promise.resolve();
    }
    var animations = targets.map(function (target) {
      var base = target.style.transform;
      return target.animate([
        { transform: base, offset: 0 },
        { transform: base + ' translate(' + plan.x + 'px,' + plan.y + 'px) rotate(' + plan.rotate + 'deg)', offset: 0.58 },
        { transform: base, offset: 1 },
      ], { duration: 620, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }).finished.catch(function () {});
    });
    return Promise.all(animations);
  }
  var api = { motionFor: motionFor, playDom: playDom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.utils.sceneMotion = api;
})();
