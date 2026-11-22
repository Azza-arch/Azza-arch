// Phase B: generalized action-primitive engine.
//
// This is the "give(book)/give(apple) share one engine" layer the level
// manifest is built on. It does NOT define any level content — only motion
// primitives (carry, give, put, transform, locomotion) that take a *prop
// definition* and character roles, and return the same
// { states: [{id,label,scene}] } shape actionTemplates.js already
// established. A new level reuses these factories with a different prop;
// it does not get its own renderer.
//
// Anchors/positions are centralised here (not eyeballed per action):
// SAFE_X is the single-actor-safe zoom-crop window, PAIR_X is the
// approved two-actor give/receive layout, HOLD_OFFSET_Y is the tuned
// bothHands book-height offset from the A1/A2 pilot. Every factory reuses
// these instead of each action re-deriving its own numbers.
(function () {
  var CHAR = { aina: 'characterKidFemale', amir: 'characterKidMale' };
  var ACTOR_SCALE = 1.1;
  var ENV_DEFAULT = 'park';
  var SAFE_X = { start: 38, mid: 50, end: 62 }; // single-actor zoom-crop safe window (~38-62% of frame at the approved 2.15x crop)
  var PAIR_X = { left: 41, right: 59 }; // approved two-actor give/receive layout (A1/A2 pilot)
  var HOLD_OFFSET_Y = 6; // bothHands anchor offset, tuned by screenshot in A1/A2 so a held prop sits between the hands, clear of the face

  function actorLayer(id, charId, pose, x, o) {
    return Object.assign({ id: id, assetId: CHAR[charId], pose: pose, role: 'actor', x: x, y: 88, scale: ACTOR_SCALE, z: 3 }, o || {});
  }

  // propDef = { asset, scale, continuityKey? }
  function heldPropLayer(propDef, parentId, anchor, o) {
    var attach = { parent: parentId, anchor: anchor, offsetX: 0, offsetY: anchor === 'bothHands' ? HOLD_OFFSET_Y : 0 };
    return Object.assign({ id: propDef.continuityKey || propDef.id, assetId: propDef.asset, role: 'heldProp', scale: propDef.scale, z: 4, continuityKey: propDef.continuityKey || propDef.id, attach: attach }, o || {});
  }
  function wornPropLayer(propDef, parentId, anchor, o) {
    var attach = { parent: parentId, anchor: anchor, offsetX: 0, offsetY: 0 };
    return Object.assign({ id: propDef.continuityKey || propDef.id, assetId: propDef.asset, role: 'wornProp', scale: propDef.scale, z: 2, continuityKey: propDef.continuityKey || propDef.id, attach: attach }, o || {});
  }
  function placedPropLayer(propDef, x, y, o) {
    return Object.assign({ id: propDef.continuityKey || propDef.id, assetId: propDef.asset, role: 'placedProp', x: x, y: y, scale: propDef.scale, z: 4, anchor: 'bottom', continuityKey: propDef.continuityKey || propDef.id }, o || {});
  }

  // ===== carry(prop): hold/wear pose translating across the frame =====
  // attachment: 'held' (bothHands, e.g. a book) or 'worn' (e.g. a backpack
  // on the back) — same carry *concept*, two real attachment mechanics,
  // one factory. No walk-cycle pose is used (see actionTemplates.js's
  // carryBook comment for why: walk0/walk1 have no usable hand anchor).
  function createCarryAction(opts) {
    var charId = opts.actorRole, prop = opts.prop, env = opts.env || ENV_DEFAULT;
    var attachment = opts.attachment || 'held';
    var anchor = opts.anchor || (attachment === 'worn' ? 'back' : 'bothHands');
    var pose = opts.pose || 'hold';
    function propLayer(parentId) {
      return attachment === 'worn' ? wornPropLayer(prop, parentId, anchor) : heldPropLayer(prop, parentId, anchor);
    }
    return {
      verbId: opts.verbId, title: opts.title || ('Carry ' + prop.label),
      states: [
        { id: 'start', label: 'Starts carrying ' + prop.label, scene: { environment: env, layers: [actorLayer('p1', charId, pose, SAFE_X.start), propLayer('p1')] } },
        { id: 'action', label: 'Carries ' + prop.label + ' across', scene: { environment: env, layers: [actorLayer('p1', charId, pose, SAFE_X.mid), propLayer('p1')] } },
        { id: 'end', label: 'Finishes carrying ' + prop.label, scene: { environment: env, layers: [actorLayer('p1', charId, pose, SAFE_X.end), propLayer('p1')] } },
      ],
    };
  }

  // ===== give(prop): giver offers, receiver reaches, ownership changes =====
  // Same left-faces-right/right-faces-left + 'drag' mirrored-reach pattern
  // proven in the give-book pilot (A1/A2), now prop-generic.
  function createGiveAction(opts) {
    var giverChar = opts.giver, receiverChar = opts.receiver, prop = opts.prop, env = opts.env || ENV_DEFAULT;
    var giverName = opts.giverName || giverChar, receiverName = opts.receiverName || receiverChar;
    return {
      verbId: opts.verbId, title: opts.title || ('Give ' + prop.label),
      states: [
        { id: 'start', label: giverName + ' holds ' + prop.label, scene: { environment: env, layers: [
          actorLayer('giver', giverChar, 'hold', PAIR_X.left), actorLayer('receiver', receiverChar, 'idle', PAIR_X.right, { flipX: true }),
          heldPropLayer(prop, 'giver', 'bothHands'),
        ] } },
        { id: 'action', label: giverName + ' offers ' + prop.label, scene: { environment: env, layers: [
          actorLayer('giver', giverChar, 'drag', PAIR_X.left), actorLayer('receiver', receiverChar, 'drag', PAIR_X.right, { flipX: true }),
          heldPropLayer(prop, 'giver', 'rightHand'),
        ] } },
        { id: 'end', label: receiverName + ' holds ' + prop.label, scene: { environment: env, layers: [
          actorLayer('receiver', receiverChar, 'hold', PAIR_X.right, { flipX: true }), actorLayer('giver', giverChar, 'idle', PAIR_X.left),
          heldPropLayer(prop, 'receiver', 'bothHands'),
        ] } },
      ],
    };
  }

  // ===== put(prop, surface): hand-held -> resting on a surface =====
  // Phase B1: uses the real objectTable sprite (genericItem_color_109.png
  // — plain front-facing table, flat style, found unused during the A4 prop
  // audit) instead of the hand-built flat-panel placeholder. TABLE_TOP_Y is
  // measured from objectTable's own aspect ratio (118/89) so "on the table"
  // means the object's bottom edge actually meets the drawn tabletop line,
  // not a guessed y value.
  var TABLE_X = 58, TABLE_WIDTH = 24, TABLE_GROUND_Y = 92;
  var TABLE_ASPECT = 118 / 89;
  function tableTopY(frame) {
    var wPx = frame.width * TABLE_WIDTH / 100;
    var hPx = wPx / TABLE_ASPECT;
    return TABLE_GROUND_Y - (hPx / frame.height * 100);
  }
  function tableLayer() {
    return { id: 'table', assetId: 'objectTable', role: 'environment', x: TABLE_X, y: TABLE_GROUND_Y, width: TABLE_WIDTH, z: 2, anchor: 'bottom' };
  }
  function createPutAction(opts) {
    var charId = opts.actorRole, prop = opts.prop, env = opts.env || ENV_DEFAULT;
    var topY = tableTopY({ width: 640, height: 544 }); // matches the fixed frame every scene renders at
    var onSurface = { x: TABLE_X, y: topY };
    var actorX = 44, placePose = opts.placePose || 'idle';
    return {
      verbId: opts.verbId, title: opts.title || ('Put ' + prop.label + ' on the table'),
      states: [
        { id: 'start', label: 'Holds ' + prop.label + ' near the table', scene: { environment: env, layers: [tableLayer(),
          actorLayer('p1', charId, 'hold', actorX), heldPropLayer(prop, 'p1', 'bothHands'),
        ] } },
        { id: 'action', label: 'Puts ' + prop.label + ' on the table', scene: { environment: env, layers: [tableLayer(),
          actorLayer('p1', charId, placePose, actorX), placedPropLayer(prop, onSurface.x, onSurface.y),
        ] } },
        { id: 'end', label: prop.labelCap + ' stays on the table', scene: { environment: env, layers: [tableLayer(),
          actorLayer('p1', charId, placePose, actorX), placedPropLayer(prop, onSurface.x, onSurface.y),
        ] } },
      ],
    };
  }

  // ===== pickUp(prop): object on the ground -> held =====
  // Phase B1. Uses the measured 'down' pose (Phase A4) for the action beat
  // — its leftHand anchor is the lower of its two measured hand points
  // (closer to the ground), so the prop attaches there mid-pickup, then
  // moves to the standard bothHands 'hold' anchor once upright. One
  // factory for any prop: pickUp(book) and pickUp(keys) are the same call
  // with a different prop definition, per the brief.
  var GROUND_Y = 92;
  function createPickUpAction(opts) {
    var charId = opts.actorRole, prop = opts.prop, env = opts.env || ENV_DEFAULT;
    var x = opts.x || SAFE_X.mid, groundX = x + 6;
    return {
      verbId: opts.verbId, title: opts.title || ('Pick up ' + prop.label),
      states: [
        { id: 'start', label: prop.labelCap + ' is on the ground', scene: { environment: env, layers: [actorLayer('p1', charId, 'idle', x), placedPropLayer(prop, groundX, GROUND_Y)] } },
        { id: 'action', label: 'Bends down to pick it up', scene: { environment: env, layers: [actorLayer('p1', charId, 'down', x), heldPropLayer(prop, 'p1', 'leftHand')] } },
        { id: 'end', label: 'Now holds ' + prop.label, scene: { environment: env, layers: [actorLayer('p1', charId, 'hold', x), heldPropLayer(prop, 'p1', 'bothHands')] } },
      ],
    };
  }

  // ===== push(prop): object displaces across the ground as pushed =====
  // Phase B1. Internally uses the 'shove' pose file, but the vocabulary
  // verb exposed to the level manifest is 'push' (opts.verbId), not the
  // Kenney filename — pose names are an implementation detail, not
  // grammar data, per the brief. The prop visibly moves further each
  // state so the push reads from position change, not just the pose.
  function createPushAction(opts) {
    var charId = opts.actorRole, prop = opts.prop, env = opts.env || ENV_DEFAULT;
    var actorXs = opts.actorXs || [40, 46, 52];
    var propXs = opts.propXs || [52, 60, 68];
    return {
      verbId: opts.verbId, title: opts.title || ('Push ' + prop.label),
      states: [
        { id: 'start', label: 'Stands behind ' + prop.label, scene: { environment: env, layers: [actorLayer('p1', charId, 'idle', actorXs[0]), placedPropLayer(prop, propXs[0], GROUND_Y)] } },
        { id: 'action', label: 'Pushes ' + prop.label + ' forward', scene: { environment: env, layers: [actorLayer('p1', charId, 'shove', actorXs[1]), placedPropLayer(prop, propXs[1], GROUND_Y)] } },
        { id: 'end', label: prop.labelCap + ' has moved forward', scene: { environment: env, layers: [actorLayer('p1', charId, 'idle', actorXs[2]), placedPropLayer(prop, propXs[2], GROUND_Y)] } },
      ],
    };
  }

  // ===== transform(prop): same object, before/after asset (e.g. open) ===
  function createTransformAction(opts) {
    var charId = opts.actorRole, env = opts.env || ENV_DEFAULT;
    var before = opts.beforeProp, mid = opts.midProp || opts.afterProp, after = opts.afterProp;
    var midPose = opts.midPose || 'idle', restPose = opts.restPose || 'hold';
    return {
      verbId: opts.verbId, title: opts.title,
      states: [
        { id: 'start', label: opts.startLabel, scene: { environment: env, layers: [actorLayer('p1', charId, restPose, SAFE_X.mid), heldPropLayer(before, 'p1', 'bothHands')] } },
        { id: 'action', label: opts.actionLabel, scene: { environment: env, layers: [actorLayer('p1', charId, midPose, SAFE_X.mid), heldPropLayer(mid, 'p1', 'bothHands')] } },
        { id: 'end', label: opts.endLabel, scene: { environment: env, layers: [actorLayer('p1', charId, restPose, SAFE_X.mid), heldPropLayer(after, 'p1', 'bothHands')] } },
      ],
    };
  }

  // ===== locomotion(pose sequence): walk/run/jump — no prop needed =====
  // Unlike carry/give, locomotion poses (walk0/run0/jump) have no usable
  // hand anchor, but none is needed here — the action is the body motion
  // itself, not an object interaction. Position + pose both change per
  // state so it doesn't read as a single photo copy-pasted three times.
  function createLocomotionAction(opts) {
    var charId = opts.actorRole, env = opts.env || ENV_DEFAULT;
    var poses = opts.poses; // [startPose, midPose, endPose]
    var xs = opts.xs || [SAFE_X.start, SAFE_X.mid, SAFE_X.end];
    var ys = opts.ys || [88, 88, 88];
    var ids = ['start', 'action', 'end'];
    var labels = opts.labels;
    return {
      verbId: opts.verbId, title: opts.title,
      states: ids.map(function (id, i) {
        return { id: id, label: labels[i], scene: { environment: env, layers: [actorLayer('p1', charId, poses[i], xs[i], { y: ys[i] })] } };
      }),
    };
  }

  var api = {
    CHAR: CHAR, SAFE_X: SAFE_X, PAIR_X: PAIR_X,
    createCarryAction: createCarryAction, createGiveAction: createGiveAction,
    createPutAction: createPutAction, createTransformAction: createTransformAction,
    createLocomotionAction: createLocomotionAction,
    createPickUpAction: createPickUpAction, createPushAction: createPushAction,
    tableLayer: tableLayer, tableTopY: tableTopY, TABLE_X: TABLE_X,
    heldPropLayer: heldPropLayer, wornPropLayer: wornPropLayer, placedPropLayer: placedPropLayer, actorLayer: actorLayer,
    frame: { width: 640, height: 544 },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.data.actionEngine = api;
})();
