(function () {
  var KEY = 'tenseTales.mastery.v1';
  var TENSES = ['presentSimple', 'pastSimple'];
  var MODES = ['storyOrder', 'wordOrder'];

  function empty() {
    return { presentSimple: { storyOrder: {}, wordOrder: {} }, pastSimple: { storyOrder: {}, wordOrder: {} } };
  }

  function load(storage) {
    var result = empty();
    try {
      var parsed = JSON.parse((storage || localStorage).getItem(KEY) || 'null');
      TENSES.forEach(function (tense) {
        MODES.forEach(function (mode) {
          var source = parsed && parsed[tense] && parsed[tense][mode];
          if (!source || typeof source !== 'object') return;
          Object.keys(source).forEach(function (level) {
            var value = source[level];
            if (!value || value.completed !== true) return;
            result[tense][mode][level] = {
              completed: true,
              bestAttempts: Math.max(0, Number.isFinite(Number(value.bestAttempts)) ? Math.floor(Number(value.bestAttempts)) : 0),
              mastered: value.mastered === true,
            };
          });
        });
      });
    } catch (error) { return result; }
    return result;
  }

  function record(tense, mode, level, attempts, storage) {
    var target = storage || localStorage;
    var data = load(target);
    if (TENSES.indexOf(tense) === -1 || MODES.indexOf(mode) === -1 || level < 1 || level > 5) return data;
    var branch = data[tense][mode];
    var previous = branch[level];
    var cleanAttempts = Math.max(0, Math.floor(Number(attempts) || 0));
    var best = previous ? Math.min(previous.bestAttempts, cleanAttempts) : cleanAttempts;
    branch[level] = { completed: true, bestAttempts: best, mastered: best === 0 };
    try { target.setItem(KEY, JSON.stringify(data)); } catch (error) { /* storage may be unavailable */ }
    return data;
  }

  function status(tense, mode, level, storage) {
    var data = load(storage);
    var item = data[tense] && data[tense][mode] && data[tense][mode][level];
    if (!item) return 'ready';
    return item.mastered ? 'mastered' : 'practising';
  }

  var api = { KEY: KEY, empty: empty, load: load, record: record, status: status };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.masteryStore = api;
})();
