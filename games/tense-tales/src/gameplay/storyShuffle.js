// Pure shuffle logic for Story Order gameplay. No Phaser, no DOM.
// Never mutates its input; never returns the same order it was given.

(function () {
  function shuffle(canonicalIds) {
    if (!Array.isArray(canonicalIds) || canonicalIds.length === 0) {
      throw new Error('shuffle() requires a non-empty array of ids');
    }

    var result = canonicalIds.slice();
    var isSameOrder = function (arr) {
      return arr.every(function (id, i) { return id === canonicalIds[i]; });
    };

    do {
      for (var i = result.length - 1; i > 0; i -= 1) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
      }
    } while (isSameOrder(result) && canonicalIds.length > 1);

    return result;
  }

  var api = { shuffle: shuffle };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.TenseTales.gameplay.storyShuffle = api;
  }
})();
