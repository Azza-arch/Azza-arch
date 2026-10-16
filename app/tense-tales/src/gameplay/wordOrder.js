(function () {
  function tokenize(sentence) {
    return String(sentence).replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean);
  }

  function shuffled(tokens, random) {
    var result = tokens.slice();
    var rng = random || Math.random;
    if (result.length < 2) return result;
    do {
      for (var i = result.length - 1; i > 0; i -= 1) {
        var j = Math.floor(rng() * (i + 1));
        var temp = result[i]; result[i] = result[j]; result[j] = temp;
      }
    } while (result.every(function (word, index) { return word === tokens[index]; }));
    return result;
  }

  function isCorrect(ordered, expected) {
    return ordered.length === expected.length && ordered.every(function (word, index) { return word === expected[index]; });
  }

  var api = { tokenize: tokenize, shuffled: shuffled, isCorrect: isCorrect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.gameplay.wordOrder = api;
})();
