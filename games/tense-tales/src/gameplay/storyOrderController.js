// Stateful Story Order controller. No Phaser, no DOM — GameScene/whatever
// scene renders this only reads getState() and calls the methods below.
// Canonical story data (story.panels[].order) is never mutated.

(function () {
  var storyShuffle;
  var storyValidation;

  if (typeof module !== 'undefined' && module.exports) {
    storyShuffle = require('./storyShuffle.js');
    storyValidation = require('./storyValidation.js');
  } else {
    storyShuffle = window.TenseTales.gameplay.storyShuffle;
    storyValidation = window.TenseTales.gameplay.storyValidation;
  }

  // createStoryOrderController(story) -> controller instance.
  // State shape: { storyId, orderedPanelIds, selectedSlot, attempts, completed }
  function createStoryOrderController(story) {
    var canonicalIds = storyValidation.getCanonicalOrder(story);

    var state = {
      storyId: story.id,
      orderedPanelIds: storyShuffle.shuffle(canonicalIds),
      selectedSlot: null,
      attempts: 0,
      completed: false,
    };

    function getState() {
      // Shallow-safe copy so callers can't mutate internal state directly.
      return {
        storyId: state.storyId,
        orderedPanelIds: state.orderedPanelIds.slice(),
        selectedSlot: state.selectedSlot,
        attempts: state.attempts,
        completed: state.completed,
      };
    }

    function swap(slotA, slotB) {
      var ids = state.orderedPanelIds;
      var tmp = ids[slotA];
      ids[slotA] = ids[slotB];
      ids[slotB] = tmp;
    }

    // selectSlot(index) -> { swapped: boolean }
    // Tap-to-swap: first tap selects, second tap on a different slot swaps
    // and clears selection, second tap on the SAME slot deselects.
    function selectSlot(index) {
      if (state.completed) return { swapped: false };

      if (state.selectedSlot === null) {
        state.selectedSlot = index;
        return { swapped: false };
      }
      if (state.selectedSlot === index) {
        state.selectedSlot = null;
        return { swapped: false };
      }

      swap(state.selectedSlot, index);
      state.selectedSlot = null;
      return { swapped: true };
    }

    // dragSwap(fromIndex, toIndex) -> { swapped: boolean }. Drag-and-drop
    // enhancement — funnels into the same swap() as tap, so both paths are
    // guaranteed consistent.
    function dragSwap(fromIndex, toIndex) {
      if (state.completed || fromIndex === toIndex) return { swapped: false };
      state.selectedSlot = null;
      swap(fromIndex, toIndex);
      return { swapped: true };
    }

    // check() -> { correct, attempts, showHint }
    // showHint becomes true from the 2nd wrong attempt onward.
    function check() {
      if (state.completed) return { correct: true, attempts: state.attempts, showHint: false };

      var correct = storyValidation.isCorrectOrder(state.orderedPanelIds, story);
      if (correct) {
        state.completed = true;
        return { correct: true, attempts: state.attempts, showHint: false };
      }

      state.attempts += 1;
      return { correct: false, attempts: state.attempts, showHint: state.attempts >= 2 };
    }

    // playAgain() -> resets attempts/selection/completion and reshuffles,
    // guaranteed not to start on the correct order.
    function playAgain() {
      state.orderedPanelIds = storyShuffle.shuffle(canonicalIds);
      state.selectedSlot = null;
      state.attempts = 0;
      state.completed = false;
    }

    return {
      getState: getState,
      selectSlot: selectSlot,
      dragSwap: dragSwap,
      check: check,
      playAgain: playAgain,
    };
  }

  var api = { createStoryOrderController: createStoryOrderController };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.TenseTales.gameplay.storyOrderController = api;
  }
})();
