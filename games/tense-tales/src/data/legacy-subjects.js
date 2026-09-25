// Subjects used to build sentences. `person`/`number` decide which verb
// form applies (see grammar-engine.js -> isThirdPersonSingular).

const SubjectData = {
  i: { id: 'i', label: 'I', person: 1, number: 'singular' },
  you: { id: 'you', label: 'You', person: 2, number: 'singular' },
  he: { id: 'he', label: 'He', person: 3, number: 'singular' },
  she: { id: 'she', label: 'She', person: 3, number: 'singular' },
  it: { id: 'it', label: 'It', person: 3, number: 'singular' },
  we: { id: 'we', label: 'We', person: 1, number: 'plural' },
  they: { id: 'they', label: 'They', person: 3, number: 'plural' },
  // Recurring story character used by Story 01 and future stories.
  maya: { id: 'maya', label: 'Maya', person: 3, number: 'singular' },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubjectData;
}
