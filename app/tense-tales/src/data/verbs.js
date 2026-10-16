// Verb conjugations for Present Simple (base / third person), Past Simple,
// and Future Simple ("will " + base). Deliberately flat and explicit —
// no spelling-rule engine — so it stays easy to read and extend.

const VerbData = {
  wake: { id: 'wake', base: 'wake', thirdPerson: 'wakes', past: 'woke', future: 'will wake', irregular: true },
  eat: { id: 'eat', base: 'eat', thirdPerson: 'eats', past: 'ate', future: 'will eat', irregular: true },
  go: { id: 'go', base: 'go', thirdPerson: 'goes', past: 'went', future: 'will go', irregular: true },
  run: { id: 'run', base: 'run', thirdPerson: 'runs', past: 'ran', future: 'will run', irregular: true },
  play: { id: 'play', base: 'play', thirdPerson: 'plays', past: 'played', future: 'will play', irregular: false },
  walk: { id: 'walk', base: 'walk', thirdPerson: 'walks', past: 'walked', future: 'will walk', irregular: false },
  see: { id: 'see', base: 'see', thirdPerson: 'sees', past: 'saw', future: 'will see', irregular: true },
  take: { id: 'take', base: 'take', thirdPerson: 'takes', past: 'took', future: 'will take', irregular: true },
  come: { id: 'come', base: 'come', thirdPerson: 'comes', past: 'came', future: 'will come', irregular: true },
  make: { id: 'make', base: 'make', thirdPerson: 'makes', past: 'made', future: 'will make', irregular: true },
  find: { id: 'find', base: 'find', thirdPerson: 'finds', past: 'found', future: 'will find', irregular: true },
  lose: { id: 'lose', base: 'lose', thirdPerson: 'loses', past: 'lost', future: 'will lose', irregular: true },
  miss: { id: 'miss', base: 'miss', thirdPerson: 'misses', past: 'missed', future: 'will miss', irregular: false },
  arrive: { id: 'arrive', base: 'arrive', thirdPerson: 'arrives', past: 'arrived', future: 'will arrive', irregular: false },
  open: { id: 'open', base: 'open', thirdPerson: 'opens', past: 'opened', future: 'will open', irregular: false },
  leave: { id: 'leave', base: 'leave', thirdPerson: 'leaves', past: 'left', future: 'will leave', irregular: true },
  steal: { id: 'steal', base: 'steal', thirdPerson: 'steals', past: 'stole', future: 'will steal', irregular: true },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerbData;
}
