// Respects the OS-level "reduce motion" preference so we can shorten or
// skip decorative tweens for players who asked for less animation.

function prefersReducedMotion() {
  try {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (err) {
    return false;
  }
}
