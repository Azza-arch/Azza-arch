// Reusable action-scene templates — Phase A small action library.
//
// Each template is a function(roles) -> { states: [{ id, label, scene }] }.
// Roles are explicit character ids ('aina'/'amir' mapped to their assetId),
// never hardcoded inside a template, so the same "give" template renders
// correctly with roles reversed (Amir gives Aina the book) without any
// branching — only the role→position/asset mapping changes.
//
// All four templates share one approved visual standard (same background,
// actor scale, zoom/crop) carried over unchanged from the approved
// give-book-preview pilot, plus — as of A3.1 — one centralised book
// definition (see BOOK below) so every action reads as the same physical
// object.
(function () {
  var CHAR = { aina: 'characterKidFemale', amir: 'characterKidMale' };
  var LEFT_X = 41, RIGHT_X = 59;
  var ACTOR_SCALE = 1.1;
  var ENV = 'park';

  // ===== A3.1: one canonical book, requested as closed/open only =====
  // objectBookClosed (genericItem_color_034, Kenney Generic Items, CC0) is
  // yellow. The pack's only open-book art (genericItem_color_033) is a
  // differently-shaped orange/red asset — confirmed by opening both files
  // directly, not assumed. Side by side they read as two different books,
  // which is exactly the continuity bug this pass exists to fix. Per
  // instructions, rather than silently picking the mismatched orange asset,
  // a project-local recolour (assets/derived/book_open_yellow.png, see its
  // README) shifts that same open-book artwork's hue/saturation to match
  // the closed book's yellow, keeping its original shading. Registered as
  // objectBookOpenCanon — the original objectBookOpen is untouched and
  // still used by the shipped 'reading-under-the-tree' story.
  //
  // One scale for the closed book everywhere (held or placed): held-prop
  // and placed-prop sizing both resolve against the same actor-height
  // formula in sceneComposition.js when an actor is present in the scene,
  // so a single BOOK.scale keeps it the same apparent size in Carry, Put
  // and Give. Only Give's 'action' state swaps the hand anchor (still the
  // same scale) to depict the hand-off — never a resize.
  var BOOK = {
    closedAsset: 'objectBookClosed',
    openAsset: 'objectBookOpenCanon',
    scale: 0.17,
    holdOffsetY: 6, // bothHands anchor, tuned against real screenshots (A1/A2) so the book sits between the hands, clear of the face
  };

  function actor(id, charId, pose, x, o) {
    return Object.assign({ id: id, assetId: CHAR[charId], pose: pose, role: 'actor', x: x, y: 88, scale: ACTOR_SCALE, z: 3 }, o || {});
  }
  // Centralised book layers: callers pass 'closed'|'open' and a parent +
  // anchor, never a raw assetId/scale, so no template can drift onto a
  // different asset or size.
  function heldBook(state, parentId, anchor, o) {
    var assetId = state === 'open' ? BOOK.openAsset : BOOK.closedAsset;
    var attach = { parent: parentId, anchor: anchor, offsetX: 0, offsetY: anchor === 'bothHands' ? BOOK.holdOffsetY : 0 };
    return Object.assign({ id: 'bookStack', assetId: assetId, role: 'heldProp', scale: BOOK.scale, z: 4, continuityKey: 'bookStack', attach: attach }, o || {});
  }
  function placedBook(x, y, o) {
    return Object.assign({ id: 'bookStack', assetId: BOOK.closedAsset, role: 'placedProp', x: x, y: y, scale: BOOK.scale, z: 4, anchor: 'bottom', continuityKey: 'bookStack' }, o || {});
  }

  // ===== 1. Carry a book =====
  // No walk-cycle pose is used: the walk0/walk1 art swings both arms down
  // at the sides (inspected directly as PNGs), which has nowhere believable
  // to attach a held book. 'hold' reads correctly standing still (the
  // approved give-book pilot's own pose), so "carry" is the same hold pose
  // translating across the frame, feet re-grounded at every state — honest
  // about not having a walk-cycle, not faking one.
  // x range kept inside the zoom-crop's safe window (~38%-62% of frame,
  // accounting for the actor's own half-width at this 2.15x crop).
  function carryBook(role) {
    var charId = role.actor;
    return {
      states: [
        { id: 'start', label: 'Starts carrying the book', scene: { environment: ENV, layers: [
          actor('p1', charId, 'hold', 38), heldBook('closed', 'p1', 'bothHands'),
        ] } },
        { id: 'action', label: 'Carries the book across', scene: { environment: ENV, layers: [
          actor('p1', charId, 'hold', 50), heldBook('closed', 'p1', 'bothHands'),
        ] } },
        { id: 'end', label: 'Finishes carrying the book', scene: { environment: ENV, layers: [
          actor('p1', charId, 'hold', 62), heldBook('closed', 'p1', 'bothHands'),
        ] } },
      ],
    };
  }

  // ===== 2. Open a book =====
  // start/end keep 'hold' (matches Carry/Give's closed-book holding pose).
  // The middle state previously used 'interact', which — checked directly
  // against the other registered poses — has raised eyebrows and an open
  // "oh" mouth that reads as surprised/alarmed, not neutral; wrong for a
  // calm "opens the book" beat. Swapped to 'idle': closed-mouth, relaxed
  // brows, the calmest face in the registered set, and its anchors are
  // already centred enough for a two-handed book (bothHands ≈ .50,.55).
  function openBook(role) {
    var charId = role.actor;
    return {
      states: [
        { id: 'start', label: 'Holds the closed book', scene: { environment: ENV, layers: [
          actor('p1', charId, 'hold', 50), heldBook('closed', 'p1', 'bothHands'),
        ] } },
        { id: 'action', label: 'Opens the book', scene: { environment: ENV, layers: [
          actor('p1', charId, 'idle', 50), heldBook('open', 'p1', 'bothHands'),
        ] } },
        { id: 'end', label: 'Reads the open book', scene: { environment: ENV, layers: [
          actor('p1', charId, 'hold', 50), heldBook('open', 'p1', 'bothHands'),
        ] } },
      ],
    };
  }

  // ===== 3. Put a book on the table =====
  // A3.1 rebuild: the Kenney desk SVG is a detailed, differently-styled
  // desk+chair illustration (confirmed by opening it), and the studyRoom
  // preset bakes that same desk into the background regardless of what's
  // layered on top — so A3 replaced it with a flat strip. Per this pass,
  // that strip "didn't read as a table" on its own, so it now has a
  // tabletop plus two simple legs, built from the same flat-surface
  // primitive already used for studyRoom's own floor/wall/chalkboard —
  // still no new illustrated asset, just a second quiet shape under it.
  // Table x range (38–74) and the actor's x (44) are both kept inside the
  // same safe zoom window as everything else.
  function tableLayers() {
    return [
      { id: 'tableLegL', role: 'surface', surface: { color: '#9c7343' }, x: 40, y: 82, width: 3, height: 6, scale: 1, z: 1, anchor: 'top-left' },
      { id: 'tableLegR', role: 'surface', surface: { color: '#9c7343' }, x: 71, y: 82, width: 3, height: 6, scale: 1, z: 1, anchor: 'top-left' },
      { id: 'tableTop', role: 'surface', surface: { color: '#c9955d' }, x: 38, y: 78, width: 36, height: 4, scale: 1, z: 2, anchor: 'top-left' },
    ];
  }
  function putBookOnTable(role) {
    var charId = role.actor;
    var onTable = { x: 56, y: 78 }; // sits on the tabletop's top edge (y matches tableTop's y, anchor 'bottom')
    return {
      states: [
        { id: 'start', label: 'Holds the book near the table', scene: { environment: ENV, layers: tableLayers().concat([
          actor('p1', charId, 'hold', 44), heldBook('closed', 'p1', 'bothHands'),
        ]) } },
        { id: 'action', label: 'Puts the book on the table', scene: { environment: ENV, layers: tableLayers().concat([
          actor('p1', charId, 'idle', 44), placedBook(onTable.x, onTable.y),
        ]) } },
        { id: 'end', label: 'Book stays on the table', scene: { environment: ENV, layers: tableLayers().concat([
          actor('p1', charId, 'idle', 44), placedBook(onTable.x, onTable.y),
        ]) } },
      ],
    };
  }

  // ===== 4. Give a book (approved pilot, now role-parametric) =====
  // roles = { giver, receiver } (character ids). The giver always renders
  // on the left (unflipped, facing right) and the receiver on the right
  // (flipX, facing left) — the convention every two-actor scene in
  // stories.js already uses. Reversing roles swaps which sprite goes on
  // which side and which one ends up holding the book, with no branching
  // beyond that lookup — verified by screenshot with roles reversed.
  function giveBook(roles) {
    var giverChar = roles.giver, receiverChar = roles.receiver;
    return {
      states: [
        { id: 'start', label: (roles.giverName || giverChar) + ' holds the book', scene: { environment: ENV, layers: [
          actor('giver', giverChar, 'hold', LEFT_X), actor('receiver', receiverChar, 'idle', RIGHT_X, { flipX: true }),
          heldBook('closed', 'giver', 'bothHands'),
        ] } },
        { id: 'action', label: (roles.giverName || giverChar) + ' offers the book', scene: { environment: ENV, layers: [
          actor('giver', giverChar, 'drag', LEFT_X), actor('receiver', receiverChar, 'drag', RIGHT_X, { flipX: true }),
          heldBook('closed', 'giver', 'rightHand'),
        ] } },
        { id: 'end', label: (roles.receiverName || receiverChar) + ' holds the book', scene: { environment: ENV, layers: [
          actor('receiver', receiverChar, 'hold', RIGHT_X, { flipX: true }), actor('giver', giverChar, 'idle', LEFT_X),
          heldBook('closed', 'receiver', 'bothHands'),
        ] } },
      ],
    };
  }

  var api = { carryBook: carryBook, openBook: openBook, putBookOnTable: putBookOnTable, giveBook: giveBook, book: BOOK, frame: { width: 640, height: 544 } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.data.actionTemplates = api;
})();
