// Phase A1/A2 pilot: "Aina gives Amir a book" — one scene, three authored
// hand-off states. Dev-only, not wired into the game, not a new story.
//
// Why the 'drag' pose: the previously-wired poses (hold, show, interact,
// idle, think, talk) were inspected directly as PNGs and none put a hand
// out away from the body — 'hold' and 'show' both keep both hands close to
// the chest, 'interact' is a clenched-fist "ready" stance. The 'drag' pose
// (file already shipped in the Kenney Toon Characters pack, just not
// previously registered in assetCatalog.js/characterAnchors.js) is the one
// pose in the whole pack where the body leans and a single arm extends
// forward with an open-ish hand at chest-to-waist height — see the anchor
// comment in characterAnchors.js for how its coordinates were measured.
// Mirroring it with flipX on the right-hand character makes both reaching
// arms point toward the same midpoint, without rotating either character.
(function () {
  var T = window.TenseTales;
  var catalog = T.data.assetCatalog;
  var composition = T.utils.sceneComposition;

  function actor(id, a, p, x, y, o) { return Object.assign({ id: id, assetId: a, pose: p, role: 'actor', x: x, y: y, scale: 1.1, z: 3 }, o || {}); }
  function held(id, a, parent, anchor, s, o) { return Object.assign({ id: id, assetId: a, role: 'heldProp', scale: s, attach: { parent: parent, anchor: anchor, offsetX: 0, offsetY: 0 }, z: 4 }, o || {}); }

  var AINA_X = 41, AMIR_X = 59;
  var BOOK_SCALE = 0.17;

  var states = {
    1: { // Aina holds the book; Amir's hands are empty.
      environment: 'park',
      layers: [
        actor('aina', 'characterKidFemale', 'hold', AINA_X, 88),
        actor('amir', 'characterKidMale', 'idle', AMIR_X, 88, { flipX: true }),
        held('bookStack', 'objectBookClosed', 'aina', 'bothHands', BOOK_SCALE, { continuityKey: 'bookStack', attach: { parent: 'aina', anchor: 'bothHands', offsetX: 0, offsetY: 6 } }),
      ],
    },
    2: { // Aina offers the book; Amir reaches to receive it.
      environment: 'park',
      layers: [
        actor('aina', 'characterKidFemale', 'drag', AINA_X, 88),
        actor('amir', 'characterKidMale', 'drag', AMIR_X, 88, { flipX: true }),
        held('bookStack', 'objectBookClosed', 'aina', 'rightHand', BOOK_SCALE, { continuityKey: 'bookStack' }),
      ],
    },
    3: { // Amir holds the book; Aina's hands are empty.
      environment: 'park',
      layers: [
        actor('amir', 'characterKidMale', 'hold', AMIR_X, 88, { flipX: true }),
        actor('aina', 'characterKidFemale', 'idle', AINA_X, 88),
        held('bookStack', 'objectBookClosed', 'amir', 'bothHands', BOOK_SCALE, { continuityKey: 'bookStack', attach: { parent: 'amir', anchor: 'bothHands', offsetX: 0, offsetY: 6 } }),
      ],
    },
  };

  var frame = { width: 640, height: 544 };
  var allFindings = [];

  [1, 2, 3].forEach(function (n) {
    var scene = states[n];
    ['stage' + n, 'stage' + n + 'b'].forEach(function (elId) {
      var el = document.getElementById(elId);
      if (!el) return;
      var zoom = document.createElement('div');
      zoom.className = 'scene-zoom';
      el.textContent = '';
      el.appendChild(zoom);
      var result = composition.renderDom(zoom, scene, catalog, { frameBounds: frame });
      if (elId === 'stage' + n) {
        allFindings.push('State ' + n + ': ' + (result.findings.length ? JSON.stringify(result.findings) : 'no validator findings (not proof of visual correctness — see screenshots)'));
      }
    });
  });

  var out = document.getElementById('gbFindings');
  if (out) out.textContent = allFindings.join('\n');
})();
