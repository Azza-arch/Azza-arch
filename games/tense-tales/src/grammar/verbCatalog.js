// Verb dictionary for the Phase 2 grammar engine. Every form is stored
// explicitly (no automatic morphology) — see grammarEngine.js for why.
// Covers the verbs used by the three approved prototype stories, plus a
// few kept in reserve for near-future stories (eat/make/see).
//
// Attached to window.TenseTales.grammar.verbCatalog (not a bare global —
// see MIGRATION.md).

(function () {
  var VerbCatalog = {
    walk: { id: 'walk', base: 'walk', thirdPerson: 'walks', past: 'walked', future: 'will walk', irregular: false },
    run: { id: 'run', base: 'run', thirdPerson: 'runs', past: 'ran', future: 'will run', irregular: true },
    stand: { id: 'stand', base: 'stand', thirdPerson: 'stands', past: 'stood', future: 'will stand', irregular: true },
    hold: { id: 'hold', base: 'hold', thirdPerson: 'holds', past: 'held', future: 'will hold', irregular: true },
    put: { id: 'put', base: 'put', thirdPerson: 'puts', past: 'put', future: 'will put', irregular: true },
    look: { id: 'look', base: 'look', thirdPerson: 'looks', past: 'looked', future: 'will look', irregular: false },
    show: { id: 'show', base: 'show', thirdPerson: 'shows', past: 'showed', future: 'will show', irregular: false },
    cheer: { id: 'cheer', base: 'cheer', thirdPerson: 'cheers', past: 'cheered', future: 'will cheer', irregular: false },
    read: { id: 'read', base: 'read', thirdPerson: 'reads', past: 'read', future: 'will read', irregular: true },
    open: { id: 'open', base: 'open', thirdPerson: 'opens', past: 'opened', future: 'will open', irregular: false },
    close: { id: 'close', base: 'close', thirdPerson: 'closes', past: 'closed', future: 'will close', irregular: false },
    climb: { id: 'climb', base: 'climb', thirdPerson: 'climbs', past: 'climbed', future: 'will climb', irregular: false },
    startClimbing: { id: 'startClimbing', base: 'start climbing', thirdPerson: 'starts climbing', past: 'started climbing', future: 'will start climbing', irregular: false },
    reach: { id: 'reach', base: 'reach', thirdPerson: 'reaches', past: 'reached', future: 'will reach', irregular: false },
    pickUp: { id: 'pickUp', base: 'pick up', thirdPerson: 'picks up', past: 'picked up', future: 'will pick up', irregular: false },
    putOn: { id: 'putOn', base: 'put on', thirdPerson: 'puts on', past: 'put on', future: 'will put on', irregular: true },
    write: { id: 'write', base: 'write', thirdPerson: 'writes', past: 'wrote', future: 'will write', irregular: true },
    hang: { id: 'hang', base: 'hang', thirdPerson: 'hangs', past: 'hung', future: 'will hang', irregular: true },
    jump: { id: 'jump', base: 'jump', thirdPerson: 'jumps', past: 'jumped', future: 'will jump', irregular: false },
    find: { id: 'find', base: 'find', thirdPerson: 'finds', past: 'found', future: 'will find', irregular: true },
    lose: { id: 'lose', base: 'lose', thirdPerson: 'loses', past: 'lost', future: 'will lose', irregular: true },
    leave: { id: 'leave', base: 'leave', thirdPerson: 'leaves', past: 'left', future: 'will leave', irregular: true },
    go: { id: 'go', base: 'go', thirdPerson: 'goes', past: 'went', future: 'will go', irregular: true },
    come: { id: 'come', base: 'come', thirdPerson: 'comes', past: 'came', future: 'will come', irregular: true },
    carry: { id: 'carry', base: 'carry', thirdPerson: 'carries', past: 'carried', future: 'will carry', irregular: false },
    play: { id: 'play', base: 'play', thirdPerson: 'plays', past: 'played', future: 'will play', irregular: false },
    think: { id: 'think', base: 'think', thirdPerson: 'thinks', past: 'thought', future: 'will think', irregular: true },
    talk: { id: 'talk', base: 'talk', thirdPerson: 'talks', past: 'talked', future: 'will talk', irregular: false },
    give: { id: 'give', base: 'give', thirdPerson: 'gives', past: 'gave', future: 'will give', irregular: true },
    take: { id: 'take', base: 'take', thirdPerson: 'takes', past: 'took', future: 'will take', irregular: true },
    arrive: { id: 'arrive', base: 'arrive', thirdPerson: 'arrives', past: 'arrived', future: 'will arrive', irregular: false },
    eat: { id: 'eat', base: 'eat', thirdPerson: 'eats', past: 'ate', future: 'will eat', irregular: true },
    make: { id: 'make', base: 'make', thirdPerson: 'makes', past: 'made', future: 'will make', irregular: true },
    see: { id: 'see', base: 'see', thirdPerson: 'sees', past: 'saw', future: 'will see', irregular: true },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerbCatalog;
  } else {
    window.TenseTales.grammar.verbCatalog = VerbCatalog;
  }
})();
