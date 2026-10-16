(function () {
  var base = {
    idle: { head:[.50,.20], chest:[.50,.48], leftHand:[.27,.55], rightHand:[.73,.55], back:[.31,.50], feet:[.50,.96], center:[.50,.52] },
    side: { head:[.52,.20], chest:[.50,.49], leftHand:[.39,.55], rightHand:[.64,.55], back:[.34,.49], feet:[.50,.96], center:[.50,.52] },
    hold: { head:[.50,.20], chest:[.50,.48], leftHand:[.38,.57], rightHand:[.62,.57], back:[.30,.50], feet:[.50,.96], center:[.50,.52] },
    think: { head:[.50,.20], chest:[.50,.48], leftHand:[.34,.58], rightHand:[.66,.47], back:[.30,.50], feet:[.50,.96], center:[.50,.52] },
    show: { head:[.50,.20], chest:[.50,.48], leftHand:[.30,.56], rightHand:[.82,.51], back:[.29,.50], feet:[.50,.96], center:[.50,.52] },
    interact: { head:[.50,.20], chest:[.50,.49], leftHand:[.34,.61], rightHand:[.67,.61], back:[.29,.51], feet:[.50,.96], center:[.50,.53] },
    cheer0: { head:[.50,.22], chest:[.50,.50], leftHand:[.23,.34], rightHand:[.77,.34], back:[.30,.51], feet:[.50,.96], center:[.50,.53] },
    back: { head:[.50,.20], chest:[.50,.49], leftHand:[.28,.56], rightHand:[.72,.56], back:[.50,.48], feet:[.50,.96], center:[.50,.52] },
    climb0: { head:[.52,.18], chest:[.50,.47], leftHand:[.29,.35], rightHand:[.72,.31], back:[.50,.49], feet:[.50,.91], center:[.50,.51] },
    climb1: { head:[.48,.18], chest:[.50,.47], leftHand:[.28,.31], rightHand:[.71,.35], back:[.50,.49], feet:[.50,.91], center:[.50,.51] },
    hang: { head:[.50,.24], chest:[.50,.50], leftHand:[.31,.18], rightHand:[.69,.18], back:[.50,.51], feet:[.50,.94], center:[.50,.54] },
    jump: { head:[.50,.23], chest:[.50,.50], leftHand:[.28,.45], rightHand:[.72,.45], back:[.50,.51], feet:[.50,.89], center:[.50,.53] }
  };
  Object.keys(base).forEach(function (pose) {
    var p = base[pose];
    p.bothHands = [(p.leftHand[0] + p.rightHand[0]) / 2, (p.leftHand[1] + p.rightHand[1]) / 2];
  });
  function resolve(pose, anchor, flipX) {
    var point = base[pose] && base[pose][anchor];
    if (!point) return null;
    return { x: flipX ? 1 - point[0] : point[0], y: point[1] };
  }
  var api = { catalog: { characterKidMale: base, characterKidFemale: base }, resolve: resolve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.utils.characterAnchors = api;
})();
