(function () {
  function setMotionState(active) {
    var world = document.querySelector('.home-world');
    if (world) world.classList.toggle('is-motion-active', active && !document.hidden);
  }
  function init() {
    var world = document.querySelector('.home-world');
    if (!world) return;
    if (!('IntersectionObserver' in window)) { setMotionState(true); return; }
    var visible = false;
    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setMotionState(visible);
    }, { threshold: 0.15 });
    observer.observe(world);
    document.addEventListener('visibilitychange', function () { setMotionState(visible); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
