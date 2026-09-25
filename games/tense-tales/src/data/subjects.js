// Subjects for the Phase 2 grammar engine. `person`/`number` decide
// third-person-singular verb agreement in Present Simple. `text` is the
// exact, pre-capitalized string to drop into a sentence — no runtime
// capitalization logic needed.
//
// Attached to window.TenseTales.data.subjects (not a bare global — the
// legacy system's src/data/legacy-subjects.js uses the name `SubjectData`,
// so there's no direct collision, but every new-system file follows the
// same namespaced convention for consistency; see MIGRATION.md).

(function () {
  var Subjects = {
    i: { id: 'i', text: 'I', person: 1, number: 'singular' },
    you: { id: 'you', text: 'You', person: 2, number: 'singular' },
    he: { id: 'he', text: 'He', person: 3, number: 'singular' },
    she: { id: 'she', text: 'She', person: 3, number: 'singular' },
    it: { id: 'it', text: 'It', person: 3, number: 'singular' },
    we: { id: 'we', text: 'We', person: 1, number: 'plural' },
    they: { id: 'they', text: 'They', person: 3, number: 'plural' },

    // Named subjects used by the approved prototype stories.
    amir: { id: 'amir', text: 'Amir', person: 3, number: 'singular' },
    aina: { id: 'aina', text: 'Aina', person: 3, number: 'singular' },
    theBoy: { id: 'theBoy', text: 'The boy', person: 3, number: 'singular' },
    theGirl: { id: 'theGirl', text: 'The girl', person: 3, number: 'singular' },
    theChildren: { id: 'theChildren', text: 'The children', person: 3, number: 'plural' },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Subjects;
  } else {
    window.TenseTales.data.subjects = Subjects;
  }
})();
