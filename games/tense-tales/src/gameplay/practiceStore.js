(function () {
  var KEY = 'tenseTales.practice.v1';
  function empty() { return { presentSimple: {}, pastSimple: {} }; }
  function load(storage) {
    var result = empty();
    try {
      var parsed = JSON.parse((storage || localStorage).getItem(KEY) || 'null');
      ['presentSimple', 'pastSimple'].forEach(function (tense) {
        var branch = parsed && parsed[tense];
        if (!branch || typeof branch !== 'object') return;
        Object.keys(branch).forEach(function (storyId) {
          var item = branch[storyId] || {};
          result[tense][storyId] = {
            total: Math.max(0, Math.floor(Number(item.total) || 0)),
            verbChoice: Math.max(0, Math.floor(Number(item.verbChoice) || 0)),
            timeSort: Math.max(0, Math.floor(Number(item.timeSort) || 0)),
          };
        });
      });
    } catch (error) { return result; }
    return result;
  }
  function recordError(tense, storyId, type, storage) {
    var target = storage || localStorage;
    var data = load(target);
    if (!data[tense] || ['verbChoice', 'timeSort'].indexOf(type) === -1) return data;
    var item = data[tense][storyId] || { total: 0, verbChoice: 0, timeSort: 0 };
    item.total += 1; item[type] += 1; data[tense][storyId] = item;
    try { target.setItem(KEY, JSON.stringify(data)); } catch (error) { /* unavailable storage */ }
    return data;
  }
  function recordSuccess(tense, storyId, type, storage) {
    var target = storage || localStorage;
    var data = load(target);
    var item = data[tense] && data[tense][storyId];
    if (!item || ['verbChoice', 'timeSort'].indexOf(type) === -1) return data;
    item[type] = Math.max(0, item[type] - 1);
    item.total = Math.max(0, item.total - 1);
    try { target.setItem(KEY, JSON.stringify(data)); } catch (error) { /* unavailable storage */ }
    return data;
  }
  var api = { KEY: KEY, empty: empty, load: load, recordError: recordError, recordSuccess: recordSuccess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.practiceStore = api;
})();
