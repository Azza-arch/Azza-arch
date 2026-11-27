// One camera zoom rule for every DENAI level (World 1 in main.html and the World 2 / 3 pages).
// Whole 1/3 steps keep the pixel art crisp; aim for ~610 visible world units tall. Short frames
// (phone landscape with the browser bar, under 420 CSS px) use 1/6 steps (still whole device pixels
// on 2× screens) and a closer ~480-unit view, so Chill Boy keeps the same size on every phone.
export function responsiveZoom(height) {
  const h = height || 700, short = h < 420, STEP = short ? 6 : 3, TARGET = short ? 480 : 610, MIN = short ? 380 : 480, MAX = short ? 560 : 740;
  let best = null;
  for (let n = 1; n <= STEP * 8; n++) { const k = n / STEP, view = h / k; if (view < MIN || view > MAX) continue; if (!best || Math.abs(view - TARGET) < Math.abs(h / best - TARGET)) best = k; }
  return best ?? Math.max(1 / STEP, Math.round(h / TARGET * STEP) / STEP);
}
