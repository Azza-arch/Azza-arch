// Pure order-validation for Story Order gameplay. No Phaser, no DOM.
// Validates by panel ID/order data — never by DOM/visual position.

(function () {
  function getCanonicalOrder(story) {
    return story.panels
      .slice()
      .sort(function (a, b) { return a.order - b.order; })
      .map(function (panel) { return panel.id; });
  }

  function isCorrectOrder(currentOrderIds, story) {
    var canonical = getCanonicalOrder(story);
    if (currentOrderIds.length !== canonical.length) return false;
    return currentOrderIds.every(function (id, i) { return id === canonical[i]; });
  }

  var api = { getCanonicalOrder: getCanonicalOrder, isCorrectOrder: isCorrectOrder };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.TenseTales.gameplay.storyValidation = api;
  }
})();
