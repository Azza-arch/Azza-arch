// Final Kenney asset inventory (Phase 1.7). Every entry points to a real,
// already-downloaded Kenney PNG — nothing here is drawn, generated, or a
// cross-perspective substitute. Scenes must look up sprites through this
// catalog by logical ID; never hardcode a vendor path inline in a scene.
//
// Primary family (2D flat vector, front-facing, confirmed style-compatible
// with each other): Toon Characters + Generic Items + Background Elements.
// See ASSETS.md for full pack details, license, and rejected alternatives.
//
// Categories with NO entry below (SCHOOL, TRANSPORT, SPORT, ANIMALS,
// bedroom furniture) are confirmed unavailable in this family — see
// "Unavailable categories" at the bottom of this file and in ASSETS.md.
// Per the asset-reality rule, stories must not be designed around them.

const AssetCatalog = {
  // ===== CHARACTERS =====
  // "Adventurer" is Kenney's folder name — visually these read as an
  // ordinary boy/girl in everyday clothes, not fantasy warriors. 45 poses
  // each; only the ones with a clear grammar-story use are listed, but
  // every pose file exists under the same folder for future use.
  characterKidMale: {
    id: 'characterKidMale',
    pack: 'Toon Characters',
    type: '2d',
    perspective: 'front-facing',
    category: 'character',
    aspectRatio: 0.75,
    referenceFrameWidth: 20,
    visibleBounds: { x: 0.08, y: 0.03, width: 0.84, height: 0.94 },
    poses: {
      idle: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_idle.png',
      walk0: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_walk0.png',
      walk1: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_walk1.png',
      run0: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_run0.png',
      jump: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_jump.png',
      hold: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_hold.png',
      interact: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_interact.png',
      talk: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_talk.png',
      think: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_think.png',
      show: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_show.png',
      duck: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_duck.png',
      hurt: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_hurt.png',
      cheer0: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_cheer0.png',
      side: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_side.png',
      back: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_back.png',
      climb0: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_climb0.png',
      climb1: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_climb1.png',
      hang: 'assets/vendor/kenney-toon-characters/Male adventurer/Poses/character_maleAdventurer_hang.png',
    },
  },
  characterKidFemale: {
    id: 'characterKidFemale',
    pack: 'Toon Characters',
    type: '2d',
    perspective: 'front-facing',
    category: 'character',
    aspectRatio: 0.75,
    referenceFrameWidth: 20,
    visibleBounds: { x: 0.08, y: 0.03, width: 0.84, height: 0.94 },
    poses: {
      idle: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_idle.png',
      walk0: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_walk0.png',
      walk1: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_walk1.png',
      run0: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_run0.png',
      jump: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_jump.png',
      hold: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_hold.png',
      interact: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_interact.png',
      talk: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_talk.png',
      think: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_think.png',
      show: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_show.png',
      duck: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_duck.png',
      hurt: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_hurt.png',
      cheer0: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_cheer0.png',
      side: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_side.png',
      back: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_back.png',
      climb0: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_climb0.png',
      hang: 'assets/vendor/kenney-toon-characters/Female adventurer/Poses/character_femaleAdventurer_hang.png',
    },
  },

  // ===== HOME EXTERIORS =====
  homeHouseBeigeFront: {
    id: 'homeHouseBeigeFront',
    path: 'assets/vendor/kenney-background-elements/PNG/house_beige_front.png',
    pack: 'Background Elements',
    type: '2d',
    perspective: 'front-facing (flat)',
    category: 'home',
    usage: 'Establishing outdoor home shots (leaves house / arrives home).',
  },
  homeHouseGreyFront: {
    id: 'homeHouseGreyFront',
    path: 'assets/vendor/kenney-background-elements/PNG/house_grey_front.png',
    pack: 'Background Elements',
    type: '2d',
    perspective: 'front-facing (flat)',
    category: 'home',
  },

  // ===== FOOD / KITCHEN (generic only — no specific breakfast items) =====
  foodBowl: {
    id: 'foodBowl',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_128.png',
    pack: 'Generic Items',
    type: '2d',
    perspective: 'icon/front view',
    category: 'food',
    usage: 'Generic bowl of food — no cereal/toast/egg sprite exists in this family.',
  },
  foodMug: {
    id: 'foodMug',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_126.png',
    pack: 'Generic Items',
    type: '2d',
    perspective: 'icon/front view',
    category: 'food',
    usage: 'Generic mug/drink.',
  },

  // ===== EVERYDAY OBJECTS =====
  objectBookOpen: {
    id: 'objectBookOpen',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_033.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'mediumHandheld', critical: true, aspectRatio: 1.35, visibleBounds: { x: 0.05, y: 0.08, width: 0.9, height: 0.84 },
  },
  objectBookClosed: {
    id: 'objectBookClosed',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_034.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'mediumHandheld', critical: true, aspectRatio: 0.78, visibleBounds: { x: 0.08, y: 0.06, width: 0.84, height: 0.88 },
  },
  objectFolder: {
    id: 'objectFolder',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_036.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'mediumHandheld', critical: true, aspectRatio: 1.15, visibleBounds: { x: 0.06, y: 0.06, width: 0.88, height: 0.88 },
  },
  objectBackpack: {
    id: 'objectBackpack',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_146.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'worn', critical: true, aspectRatio: 0.78, visibleBounds: { x: 0.08, y: 0.04, width: 0.84, height: 0.92 },
    usage: 'Green backpack/bag.',
  },
  objectBriefcase: {
    id: 'objectBriefcase',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_141.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
  },
  objectPhone: {
    id: 'objectPhone',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_062.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'smallHandheld', critical: true, aspectRatio: 0.58, visibleBounds: { x: 0.12, y: 0.04, width: 0.76, height: 0.92 },
  },
  objectTablet: {
    id: 'objectTablet',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_060.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
  },
  objectLaptop: {
    id: 'objectLaptop',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_060.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'mediumHandheld', critical: true,
    sourceDimensions: { width: 141, height: 68 },
    aspectRatio: 141 / 68,
    visibleBounds: { x: 0.04, y: 0.12, width: 0.92, height: 0.78 },
    usage: 'Kenney screen device used as the closest approved laptop silhouette; no exact laptop asset exists in the approved inventory.',
  },
  objectWallet: {
    id: 'objectWallet',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_157.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'smallHandheld', critical: true,
  },
  objectMoney: {
    id: 'objectMoney',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_158.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
  },
  objectKeys: {
    id: 'objectKeys',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_154.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'smallHandheld', critical: true, aspectRatio: 1.2, visibleBounds: { x: 0.06, y: 0.06, width: 0.88, height: 0.88 },
  },
  objectPencil: {
    id: 'objectPencil',
    path: 'assets/vendor/kenney-generic-items/Colored/genericItem_color_024.png',
    pack: 'Generic Items',
    type: '2d',
    category: 'object',
    sizeClass: 'smallHandheld', critical: true,
    sourceDimensions: { width: 42, height: 74 },
    aspectRatio: 42 / 74,
    visibleBounds: { x: 0.02, y: 0.18, width: 0.96, height: 0.64 },
  },

  // ===== OUTDOOR / NATURE / SKY =====
  outdoorSky: {
    id: 'outdoorSky',
    path: 'assets/vendor/kenney-background-elements/PNG/sky.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
    usage: 'Solid tileable sky colour AS AN ASSET FILE (not a CSS colour) per the asset-only-scenes rule.',
  },
  outdoorSun: {
    id: 'outdoorSun',
    path: 'assets/vendor/kenney-background-elements/PNG/sun.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
  },
  outdoorCloud1: {
    id: 'outdoorCloud1',
    path: 'assets/vendor/kenney-background-elements/PNG/cloud1.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
  },
  outdoorHills1: {
    id: 'outdoorHills1',
    path: 'assets/vendor/kenney-background-elements/PNG/hills1.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
  },
  outdoorHills2: {
    id: 'outdoorHills2',
    path: 'assets/vendor/kenney-background-elements/PNG/hills2.png',
    pack: 'Background Elements', type: '2d', category: 'background',
  },
  outdoorGrass1: {
    id: 'outdoorGrass1',
    path: 'assets/vendor/kenney-background-elements/PNG/grass1.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
    usage: 'Brown dirt/rock tuft — NOT green. Kept for reference; use outdoorGrassGreen for a grass-coloured tuft.',
  },
  outdoorGrassGreen: {
    id: 'outdoorGrassGreen',
    path: 'assets/vendor/kenney-background-elements/PNG/grass4.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'background',
    usage: 'Green grass tuft — the one actually used as ground decoration in story-prototypes.html.',
  },
  outdoorTreePine: {
    id: 'outdoorTreePine',
    path: 'assets/vendor/kenney-background-elements/PNG/tree08.png',
    pack: 'Background Elements',
    type: '2d',
    category: 'outdoor',
  },

  // ===== REMASTERED ENVIRONMENT ACCENTS =====
  remCloud2: { id: 'remCloud2', path: 'assets/vendor/kenney-background-elements-remastered/PNG/cloud2.png', pack: 'Background Elements Remastered', type: '2d', category: 'background' },
  remCloud6: { id: 'remCloud6', path: 'assets/vendor/kenney-background-elements-remastered/PNG/cloud6.png', pack: 'Background Elements Remastered', type: '2d', category: 'background' },
  remBush1: { id: 'remBush1', path: 'assets/vendor/kenney-background-elements-remastered/PNG/bush1.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },
  remBush2: { id: 'remBush2', path: 'assets/vendor/kenney-background-elements-remastered/PNG/bush2.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },
  remBushAlt2: { id: 'remBushAlt2', path: 'assets/vendor/kenney-background-elements-remastered/PNG/bushAlt2.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },
  remFence: { id: 'remFence', path: 'assets/vendor/kenney-background-elements-remastered/PNG/fence.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },
  remHouseSmall: { id: 'remHouseSmall', path: 'assets/vendor/kenney-background-elements-remastered/PNG/houseSmallAlt2.png', pack: 'Background Elements Remastered', type: '2d', category: 'home' },
  remTree: { id: 'remTree', path: 'assets/vendor/kenney-background-elements-remastered/PNG/tree.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },
  remTreeSmall: { id: 'remTreeSmall', path: 'assets/vendor/kenney-background-elements-remastered/PNG/treeSmall_green2.png', pack: 'Background Elements Remastered', type: '2d', category: 'outdoor' },

  // ===== STUDY ROOM =====
  studyDesk: { id: 'studyDesk', path: 'assets/vendor/glitch-furniture/furniture_desk.svg', pack: 'Glitch Furniture', type: '2d-vector', category: 'furniture' },
  studyChair: { id: 'studyChair', path: 'assets/vendor/glitch-furniture/furniture_chair_basic_padded_chair.svg', pack: 'Glitch Furniture', type: '2d-vector', category: 'furniture' },
  studyBookcase: { id: 'studyBookcase', path: 'assets/vendor/glitch-furniture/furniture_bookcase.svg', pack: 'Glitch Furniture', type: '2d-vector', category: 'furniture' },
  studyWindow: { id: 'studyWindow', path: 'assets/vendor/glitch-furniture/furniture_largewindow.svg', pack: 'Glitch Furniture', type: '2d-vector', category: 'furniture' },
  studyFloorLamp: { id: 'studyFloorLamp', path: 'assets/vendor/glitch-furniture/furniture_floorlamp_powdered_blue_floor_lamp.svg', pack: 'Glitch Furniture', type: '2d-vector', category: 'furniture' },

  // ===== UI =====
  // Optional — CSS buttons/panels remain compliant per the interface-element
  // exception. This is available if a Kenney-sprite button look is wanted.
  uiButtonBlue: {
    id: 'uiButtonBlue',
    path: 'assets/vendor/kenney-ui-pack/PNG/Blue/button_rectangle_depth_border.png',
    pack: 'UI Pack',
    type: '2d',
    category: 'ui',
  },
};

// ===== Unavailable categories (confirmed — do not force a substitute) =====
// SCHOOL: no school-tagged or school-building asset exists in any audited
//   Kenney pack (kenney.nl/assets/tag:school returns zero results).
// TRANSPORT: no bus/car/bicycle exists in this family's perspective. Every
//   vehicle pack found (Pixel Vehicle Pack, Racing Pack, Car Kit) is
//   top-down or 3D — rejected per the no-cross-perspective rule.
// HOME (Kenney interior): no compatible front-facing room pack exists.
//   Level 5 therefore uses a small, audited CC0 Glitch Furniture subset.
// SPORT: no ball/sports-equipment sprite found in Generic Items.
// ANIMALS: no animal pack sourced/selected in this phase.
// BREAKFAST-SPECIFIC FOOD: no cereal/toast/egg sprite in Generic Items —
//   only a generic bowl and mug are available.

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetCatalog;
} else if (typeof window !== 'undefined' && window.TenseTales) {
  // No legacy name collision (nothing legacy is called AssetCatalog), but
  // namespaced anyway for consistency with the rest of the new system.
  window.TenseTales.data.assetCatalog = AssetCatalog;
}
