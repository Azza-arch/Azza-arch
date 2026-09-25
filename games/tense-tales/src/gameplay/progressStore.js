(function () {
  var KEY = 'tenseTales.progress.v1';
  var TENSES = ['presentSimple', 'pastSimple'];
  var MODES = ['storyOrder', 'wordOrder'];

  function defaults() {
    return {
      presentSimple: { storyOrder: 1, wordOrder: 1 },
      pastSimple: { storyOrder: 1, wordOrder: 1 },
    };
  }

  function normalize(value) {
    var clean = defaults();
    TENSES.forEach(function (tense) {
      MODES.forEach(function (mode) {
        var candidate = value && value[tense] && Number(value[tense][mode]);
        clean[tense][mode] = Number.isFinite(candidate) ? Math.max(1, Math.min(5, Math.floor(candidate))) : 1;
      });
    });
    return clean;
  }

  function load(storage) {
    try {
      return normalize(JSON.parse((storage || localStorage).getItem(KEY) || 'null'));
    } catch (error) {
      return defaults();
    }
  }

  function unlock(tense, mode, completedLevel, storage) {
    var target = storage || localStorage;
    var progress = load(target);
    if (TENSES.indexOf(tense) === -1 || MODES.indexOf(mode) === -1) return progress;
    progress[tense][mode] = Math.max(progress[tense][mode], Math.min(5, completedLevel + 1));
    try { target.setItem(KEY, JSON.stringify(progress)); } catch (error) { /* storage may be unavailable */ }
    return progress;
  }

  var api = { KEY: KEY, defaults: defaults, normalize: normalize, load: load, unlock: unlock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.progressStore = api;
})();
