// Phase B: 10-level manifest. Data only — each action either points at a
// real `build(roles)` function (actionEngine factory + a prop def) or is
// marked assetStatus:'blocked' with the exact missing sprite category
// named, per the asset-reality rule this project already follows
// elsewhere (see assetCatalog.js's "Unavailable categories"). No action
// below fakes a prop with a mismatched icon to avoid saying "blocked".
//
// This file defines WHAT each level needs, not new rendering logic —
// 'ready' actions are built from src/data/actionEngine.js's generic
// factories, reusing the same carry/give/put primitives across props.
(function () {
  var Engine = typeof require === 'function' ? require('./actionEngine.js') : window.TenseTales.data.actionEngine;
  var Catalog = typeof require === 'function' ? require('./assetCatalog.js') : window.TenseTales.data.assetCatalog;

  // ===== Canonical props (one definition each, reused wherever needed) =====
  var PROPS = {
    book: { id: 'book', asset: 'objectBookClosed', scale: 0.17, continuityKey: 'bookStack', label: 'the book', labelCap: 'The book' },
    bookOpen: { id: 'bookOpen', asset: 'objectBookOpenCanon', scale: 0.17, continuityKey: 'bookStack', label: 'the open book', labelCap: 'The book' },
    backpack: { id: 'backpack', asset: 'objectBackpack', scale: 0.48, continuityKey: 'backpack', label: 'the backpack', labelCap: 'The backpack' },
    pencil: { id: 'pencil', asset: 'objectPencil', scale: 0.07, continuityKey: 'pencil', label: 'the pencil', labelCap: 'The pencil' },
  };

  function blocked(id, verbId, title, reason) {
    return { id: id, verbId: verbId, title: title, assetStatus: 'blocked', blockedReason: reason };
  }
  function ready(id, verbId, title, build) {
    return { id: id, verbId: verbId, title: title, assetStatus: 'ready', build: build };
  }

  // ===== Level 1 — Book Time (fully migrated to the shared engine) =====
  var level1 = {
    id: 'level-01', title: 'Book Time', theme: 'Books', actions: [
      ready('carry-book', 'carry', 'Carry a book', function (roles) {
        return Engine.createCarryAction({ actorRole: roles.actor || 'amir', prop: PROPS.book, verbId: 'carry' });
      }),
      ready('open-book', 'open', 'Open a book', function (roles) {
        return Engine.createTransformAction({
          actorRole: roles.actor || 'aina', verbId: 'open', title: 'Open a book',
          beforeProp: PROPS.book, midProp: PROPS.bookOpen, afterProp: PROPS.bookOpen, midPose: 'idle', restPose: 'hold',
          startLabel: 'Holds the closed book', actionLabel: 'Opens the book', endLabel: 'Reads the open book',
        });
      }),
      ready('put-book', 'put', 'Put a book on the table', function (roles) {
        return Engine.createPutAction({ actorRole: roles.actor || 'aina', prop: PROPS.book, verbId: 'put' });
      }),
      ready('give-book', 'give', 'Give a book', function (roles) {
        return Engine.createGiveAction({ giver: roles.giver || 'aina', receiver: roles.receiver || 'amir', giverName: roles.giverName || 'Aina', receiverName: roles.receiverName || 'Amir', prop: PROPS.book, verbId: 'give' });
      }),
      blocked('read-book', 'read', 'Read a book', 'No distinct "reading" pose exists beyond the open-book hold already used for "open" — would currently just duplicate that scene rather than show a visually distinct action. Needs either a dedicated reading-focused pose or a deliberate decision to treat read=hold(open book) as the same beat.'),
    ],
  };

  // ===== Level 2 — Snack Time (asset-blocked) =====
  var level2 = {
    id: 'level-02', title: 'Snack Time', theme: 'Food & drink', actions: [
      blocked('eat', 'eat', 'Eat a snack', 'No food/snack sprite exists in any vendored pack (Generic Items is tools/electronics/household only — confirmed by opening its full 163-item contact sheet). Needs a CC0 food asset before this level can be built without faking the object.'),
      blocked('drink', 'drink', 'Drink', 'Same blocker as eat — no cup-of-drink or bottle-with-liquid sprite; the closed mug/bottle shapes in Generic Items read as empty containers, not a drinking action.'),
      blocked('take-snack', 'take', 'Take a snack', 'Depends on the same missing food asset.'),
      blocked('give-snack', 'give', 'Give food to another character', 'give() engine is ready and proven (Level 1) — only the prop is missing.'),
      blocked('put-snack', 'put', 'Put food on the table', 'put() engine is ready and proven (Level 1) — only the prop is missing.'),
    ],
    blockedSummary: 'Entire level blocked on one missing asset category: food/snack sprites (e.g. apple, cup of a drink). The give/put/take motion engines are already built and proven in Level 1 — adding this level later is a prop addition, not new engineering, once a food asset is sourced.',
  };

  // ===== Level 3 — Classroom (partially ready) =====
  var level3 = {
    id: 'level-03', title: 'Classroom', theme: 'School', actions: [
      ready('write', 'write', 'Write with a pencil', function (roles) {
        // Not a clean fit for carry/give/put — built directly, reusing the
        // exact pencil asset/scale/rightHand-rotation already proven in the
        // shipped 'doing-homework' story (src/data/stories.js homework-03),
        // now on the real objectTable (Phase B1) instead of the flat-panel
        // placeholder.
        var charId = roles.actor || 'aina';
        var actorX = 44;
        var pencilOnHand = Engine.heldPropLayer(PROPS.pencil, 'p1', 'rightHand', { rotation: 58, attach: { parent: 'p1', anchor: 'rightHand', offsetX: 1, offsetY: 6 } });
        return {
          verbId: 'write', title: 'Write with a pencil',
          states: [
            { id: 'start', label: 'Holds the pencil at the table', scene: { environment: 'park', layers: [Engine.tableLayer(), Engine.actorLayer('p1', charId, 'hold', actorX), pencilOnHand] } },
            { id: 'action', label: 'Writes with the pencil', scene: { environment: 'park', layers: [Engine.tableLayer(), Engine.actorLayer('p1', charId, 'interact', actorX), pencilOnHand] } },
            { id: 'end', label: 'Finishes writing', scene: { environment: 'park', layers: [Engine.tableLayer(), Engine.actorLayer('p1', charId, 'idle', actorX), pencilOnHand] } },
          ],
        };
      }),
      blocked('draw', 'draw', 'Draw a picture', 'Deliberately held per the silent-test audit: write and draw would both currently render as "character + pencil + table" with no distinct paper/mark-making result, so a viewer could not tell the two verbs apart from the animation alone. Needs a visible drawn/written result before shipping as a second verb, not just a pose swap.'),
      blocked('erase', 'erase', 'Erase the board', 'No eraser sprite and no chalk-mark asset to show a "marked -> blank" before/after; faking marks with flat-colour shapes risked looking arbitrary rather than legible, so left for a deliberate design pass instead of guessing.'),
      blocked('sit', 'sit', 'Sit down', 'No sitting pose exists in the vendored character pack (confirmed against the full pose list: idle, walk0-7, run0-2, jump, hold, interact, talk, think, show, duck, hurt, cheer0-1, side, back, climb0-1, hang, drag, attack0-2, attackKick, behindBack, down, fall, fallDown, hit, kick, rope, shove, shoveBack, slide, switch0-1, wide — no "sit"). "stand" alone is just idle and isn\'t a meaningful before/after without it.'),
      blocked('show-work', 'show', 'Show your work', 'Buildable with the existing "show" pose (already used in the-new-phone) — not attempted yet this pass.'),
    ],
  };

  // ===== Level 4 — Play Time (locomotion ready, object actions blocked) ===
  var level4 = {
    id: 'level-04', title: 'Play Time', theme: 'Playground', actions: [
      ready('run', 'run', 'Run', function (roles) {
        return Engine.createLocomotionAction({
          actorRole: roles.actor || 'amir', verbId: 'run', title: 'Run',
          poses: ['idle', 'run0', 'idle'], xs: [38, 50, 62],
          labels: ['Stands still', 'Runs across', 'Stops running'],
        });
      }),
      ready('jump', 'jump', 'Jump', function (roles) {
        return Engine.createLocomotionAction({
          actorRole: roles.actor || 'aina', verbId: 'jump', title: 'Jump',
          poses: ['idle', 'jump', 'idle'], xs: [50, 50, 50], ys: [88, 80, 88],
          labels: ['Stands on the ground', 'Jumps up', 'Lands back down'],
        });
      }),
      blocked('kick', 'kick', 'Kick a ball', 'No ball/sports-equipment sprite exists in any vendored pack (confirmed: no match for "ball" anywhere under assets/vendor). ASSETS.md already flags SPORT as an unavailable category project-wide.'),
      blocked('throw', 'throw', 'Throw a ball', 'Same missing-ball blocker as kick. Also explicitly must not reuse the same static pose for throw and catch once a ball exists — needs the ball sprite to actually move/land differently per instruction.'),
      blocked('catch', 'catch', 'Catch a ball', 'Same missing-ball blocker as kick/throw.'),
    ],
    blockedSummary: 'Locomotion (run, jump) needs no prop and is ready now. Everything ball-based is blocked on one missing asset category: a ball/sports-equipment sprite.',
  };

  // ===== Level 5 — At Home (regular verbs, mostly reuses put/carry) =====
  var level5 = {
    id: 'level-05', title: 'At Home', theme: 'Household', actions: [
      blocked('wash', 'wash', 'Wash something', 'No sink/basin/cloth sprite to show a wash happening — needs a design decision, not attempted this pass.'),
      blocked('clean', 'clean', 'Clean up', 'Same as wash — no cleaning-tool sprite audited yet.'),
      ready('carry-backpack', 'carry', 'Carry the backpack', function (roles) {
        return Engine.createCarryAction({ actorRole: roles.actor || 'amir', prop: PROPS.backpack, attachment: 'worn', anchor: 'back', verbId: 'carry' });
      }),
      blocked('open-close-home', 'open', 'Open/close something at home', 'open()/close() on the book already works via the transform primitive; a home-specific prop (e.g. a door/drawer) hasn\'t been audited yet.'),
      ready('put-backpack', 'put', 'Put the backpack down', function (roles) {
        return Engine.createPutAction({ actorRole: roles.actor || 'amir', prop: PROPS.backpack, verbId: 'put' });
      }),
    ],
  };

  // ===== Level 6 — Garden Day (asset-blocked) =====
  var level6 = {
    id: 'level-06', title: 'Garden Day', theme: 'Outdoors', actions: [
      blocked('pick', 'pick', 'Pick a flower/fruit', 'No plant/flower/fruit sprite in any vendored pack (confirmed: no match for "plant" or "flower" anywhere under assets/vendor).'),
      blocked('plant', 'plant', 'Plant a seed', 'Same missing-plant blocker.'),
      blocked('water', 'water', 'Water the plants', 'Needs both a plant sprite and a watering-can/water-stream element — neither exists.'),
      blocked('dig', 'dig', 'Dig', 'No shovel/spade sprite audited (Generic Items\' tools are household/electronics, not garden tools).'),
      ready('walk-garden', 'walk', 'Walk', function (roles) {
        return Engine.createLocomotionAction({
          actorRole: roles.actor || 'aina', verbId: 'walk', title: 'Walk', env: 'park',
          poses: ['idle', 'walk0', 'idle'], xs: [38, 50, 62],
          labels: ['Stands still', 'Walks across', 'Stops walking'],
        });
      }),
    ],
    blockedSummary: 'Entire level blocked on one missing asset category: plant/garden sprites (flower, seed, watering can, shovel). Only locomotion (walk) is ready, reusing Level 4\'s run/jump pattern.',
  };

  // ===== Level 7 — Getting Ready (sequence-ready via carry+put+worn) =====
  var level7 = {
    id: 'level-07', title: 'Getting Ready', theme: 'Daily routine', actions: [
      ready('pack-backpack', 'put', 'Pack the backpack', function (roles) {
        return Engine.createPutAction({ actorRole: roles.actor || 'amir', prop: PROPS.book, verbId: 'put', title: 'Packs a book into the backpack' });
      }),
      ready('wear-backpack', 'putOn', 'Wear the backpack', function (roles) {
        return Engine.createCarryAction({ actorRole: roles.actor || 'amir', prop: PROPS.backpack, attachment: 'worn', anchor: 'back', verbId: 'putOn', title: 'Wears the backpack' });
      }),
      blocked('take-keys', 'take', 'Take the keys', 'objectKeys exists in the catalog and is already used in the shipped getting-ready story — buildable, just not attempted yet this pass (representative scope).'),
      blocked('open-door', 'open', 'Open the door', 'No door sprite distinct from the house exterior background — needs a design decision.'),
      blocked('close-door', 'close', 'Close the door', 'Same as open-door.'),
    ],
  };

  // ===== Level 8 — Helping Friends (two-character, give() proven) =====
  var level8 = {
    id: 'level-08', title: 'Helping Friends', theme: 'Interaction', actions: [
      ready('give-backpack', 'give', 'Give the backpack', function (roles) {
        return Engine.createGiveAction({ giver: roles.giver || 'amir', receiver: roles.receiver || 'aina', giverName: roles.giverName || 'Amir', receiverName: roles.receiverName || 'Aina', prop: PROPS.backpack, verbId: 'give' });
      }),
      blocked('take-from', 'take', 'Take something from a friend', 'The receiving half of give() already exists (end state) — a dedicated take() reversal (receiver-initiated) hasn\'t been built separately yet.'),
      blocked('show', 'show', 'Show something', 'Buildable with the existing "show" pose (used in the-new-phone) — not attempted this pass.'),
      blocked('help', 'help', 'Help a friend', 'No clear single-pose depiction audited yet — needs a specific scenario decision (help carry? help stand?).'),
      blocked('bring', 'bring', 'Bring something', 'Likely carry() + give() chained (walk toward the other character carrying the prop, then give) — not attempted yet, but both halves already exist.'),
    ],
  };

  // ===== Level 9 — Adventure Day (locomotion-heavy, mostly blocked) =====
  var level9 = {
    id: 'level-09', title: 'Adventure Day', theme: 'Journey', actions: [
      ready('walk-adventure', 'walk', 'Walk', function (roles) {
        return Engine.createLocomotionAction({ actorRole: roles.actor || 'amir', verbId: 'walk', title: 'Walk', poses: ['idle', 'walk0', 'idle'], xs: [38, 50, 62], labels: ['Stands still', 'Walks on', 'Stops'] });
      }),
      ready('run-adventure', 'run', 'Run', function (roles) {
        return Engine.createLocomotionAction({ actorRole: roles.actor || 'amir', verbId: 'run', title: 'Run', poses: ['idle', 'run0', 'idle'], xs: [38, 50, 62], labels: ['Stands still', 'Runs on', 'Stops'] });
      }),
      blocked('see', 'see', 'See something', 'No clear single-pose depiction of "noticing" something audited yet (think/show are candidates, not evaluated this pass).'),
      blocked('find', 'find', 'Find something', 'Needs a hidden/revealed object staging decision.'),
      ready('climb', 'climb', 'Climb', function (roles) {
        return Engine.createLocomotionAction({ actorRole: roles.actor || 'amir', verbId: 'climb', title: 'Climb', env: 'forest', poses: ['idle', 'climb0', 'climb1'], xs: [50, 50, 50], ys: [88, 70, 60], labels: ['Stands at the tree', 'Climbs up', 'Near the top'] });
      }),
    ],
  };

  // ===== Level 10 — Story Challenge (no new mechanic; reuses Story Order) =
  var level10 = {
    id: 'level-10', title: 'Story Challenge', theme: 'Mixed review', actions: [],
    note: 'Explicitly: no new mechanic. Combines Level 1-9 actions into 3-5 event sequences and reuses the existing Story Order infrastructure (src/gameplay/storyOrderController.js, src/scenes/StoryOrderGridScene.js) rather than a second ordering system. Not started — depends on enough Level 1-9 actions being ready first.',
  };

  var Levels = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];

  var api = { levels: Levels, props: PROPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.data.levelManifest = api;
})();
