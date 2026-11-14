// Interactive visuals shared by all chapters. Each visual is described by a
// plain data spec in the content files and mounted into a <figure>. Every
// figure also carries a text alternative (spec.alt) for pupils who cannot use
// the interactive version.
import { renderMath, tex } from './math.js';
import { fmt } from './expr.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.append(e); return e; };
const COLORS = ['#3467D4', '#D9534F', '#2E9E6B', '#B7791F', '#7B4FC9'];

// ---------------------------------------------------------------- plot
// spec: { type:'plot', x:[min,max], y:[min,max], params:[{name,label,min,max,step,value}],
//   curves:[{ f:(x,p)=>y, label, color, dashed, domain:[a,b] | (p)=>[a,b], exclude:[x..] | (p)=>[..],
//             closedEnds?:true }],
//   relations:[{ ys:(x,p)=>[y..], label }]            // non-function curves (vertical-line test)
//   points:[{ at:(p)=>[x,y], label, open }], vline:'paramName', hline:'paramName',
//   shade:{ f, g?, from:(p)=>a, to:(p)=>b }, readout:(p, api)=>html }
function mountPlot(host, spec) {
  const W = 360, H = 300, pad = 28;
  const [x0, x1] = spec.x, [y0, y1] = spec.y;
  // left margin grows with the longest y-axis label so big numbers are not cut off
  const yLabLen = Math.max(String(Math.round(y0)).length, String(Math.round(y1)).length);
  const padL = Math.max(pad, 10 + yLabLen * 6.5);
  const sx = (x) => padL + ((x - x0) / (x1 - x0)) * (W - padL - pad);
  const sy = (y) => H - pad - ((y - y0) / (y1 - y0)) * (H - 2 * pad);
  const p = Object.fromEntries((spec.params || []).map((q) => [q.name, q.value]));
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot-svg', role: 'img', 'aria-label': spec.ariaLabel || 'Graf interaktif' });
  host.append(svg);
  const controls = document.createElement('div'); controls.className = 'plot-controls'; host.append(controls);
  const readout = document.createElement('div'); readout.className = 'plot-readout'; readout.setAttribute('aria-live', 'polite'); host.append(readout);
  const val = (v) => (typeof v === 'function' ? v(p) : v);

  function axes(g) {
    const step = spec.grid || 1, gx = spec.gridX || step, gy = spec.gridY || step;
    for (let x = Math.ceil(x0 / gx) * gx; x <= x1 + 1e-9; x += gx) el('line', { x1: sx(x), y1: sy(y0), x2: sx(x), y2: sy(y1), class: 'plot-grid' }, g);
    for (let y = Math.ceil(y0 / gy) * gy; y <= y1 + 1e-9; y += gy) el('line', { x1: sx(x0), y1: sy(y), x2: sx(x1), y2: sy(y), class: 'plot-grid' }, g);
    if (y0 <= 0 && y1 >= 0) el('line', { x1: sx(x0), y1: sy(0), x2: sx(x1), y2: sy(0), class: 'plot-axis' }, g);
    if (x0 <= 0 && x1 >= 0) el('line', { x1: sx(0), y1: sy(y0), x2: sx(0), y2: sy(y1), class: 'plot-axis' }, g);
    const lab = spec.labelStep || (step * 2), lx = spec.labelStepX || (spec.gridX ? gx * 2 : lab), ly = spec.labelStepY || (spec.gridY ? gy * 2 : lab);
    for (let x = Math.ceil(x0 / lx) * lx; x <= x1 + 1e-9; x += lx) if (Math.abs(x) > 1e-9) { const t = el('text', { x: sx(x), y: sy(Math.max(y0, Math.min(0, y1))) + 13, class: 'plot-tick' }, g); t.textContent = fmt(x); }
    for (let y = Math.ceil(y0 / ly) * ly; y <= y1 + 1e-9; y += ly) if (Math.abs(y) > 1e-9) { const t = el('text', { x: sx(Math.max(x0, Math.min(0, x1))) - 5, y: sy(y) + 4, class: 'plot-tick plot-tick-y' }, g); t.textContent = fmt(y); }
    const tx = el('text', { x: W - pad, y: sy(Math.max(y0, Math.min(0, y1))) - 6, class: 'plot-axis-label', 'text-anchor': 'end' }, g); tx.textContent = spec.xLabel || 'x';
    const ty = el('text', { x: sx(Math.max(x0, Math.min(0, x1))) + 6, y: pad - 10, class: 'plot-axis-label' }, g); ty.textContent = spec.yLabel || 'y';
  }
  function pathFor(f, domain, exclude) {
    const [a, b] = domain || [x0, x1];
    const N = 480; let d = '', pen = false, prev = null;
    for (let k = 0; k <= N; k++) {
      const x = a + ((b - a) * k) / N;
      if ((exclude || []).some((e) => Math.abs(x - e) < (b - a) / N * 0.6)) { pen = false; prev = null; continue; }
      let y; try { y = f(x, p); } catch { y = NaN; }
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) * 3 || y > y1 + (y1 - y0) * 3 || (prev !== null && Math.abs(y - prev) > (y1 - y0) * 1.5)) { pen = false; prev = Number.isFinite(y) ? y : null; continue; }
      const m = (y1 - y0) * 0.2; const yc = Math.max(y0 - m, Math.min(y1 + m, y));
      d += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(yc).toFixed(1)}`; pen = true; prev = y;
    }
    return d;
  }
  function draw() {
    svg.replaceChildren();
    const clip = el('clipPath', { id: `clip-${uid}` }, el('defs', {}, svg)); el('rect', { x: padL, y: pad, width: W - padL - pad, height: H - 2 * pad }, clip);
    const g = el('g', {}, svg); axes(g);
    const plot = el('g', { 'clip-path': `url(#clip-${uid})` }, svg);
    if (spec.shade) {
      const { f, g: gfn, from, to } = spec.shade; const a = val(from), b = val(to); let d = '';
      const N = 120; for (let k = 0; k <= N; k++) { const x = a + ((b - a) * k) / N; d += `${k ? 'L' : 'M'}${sx(x)},${sy(f(x, p))}`; }
      for (let k = N; k >= 0; k--) { const x = a + ((b - a) * k) / N; d += `L${sx(x)},${sy(gfn ? gfn(x, p) : 0)}`; }
      el('path', { d: d + 'Z', class: 'plot-shade' }, plot);
    }
    (spec.curves || []).forEach((c, i) => {
      const color = c.color || COLORS[i % COLORS.length];
      el('path', { d: pathFor(c.f, val(c.domain), val(c.exclude)), stroke: color, class: `plot-curve${c.dashed ? ' is-dashed' : ''}` }, plot);
      for (const e of val(c.exclude) || []) { const yl = c.f(e - 1e-6, p), yr = c.f(e + 1e-6, p); if (Number.isFinite(yl) && Math.abs(yl - yr) < 1e-3) el('circle', { cx: sx(e), cy: sy(yl), r: 4, class: 'plot-open', stroke: color }, plot); }
      const dom = val(c.domain);
      if (dom && c.closedEnds) for (const e of dom) el('circle', { cx: sx(e), cy: sy(c.f(e, p)), r: 3.5, fill: color }, plot);
    });
    (spec.relations || []).forEach((r, i) => {
      const color = r.color || COLORS[(i + 1) % COLORS.length]; const N = 400; const branches = {};
      for (let k = 0; k <= N; k++) { const x = x0 + ((x1 - x0) * k) / N; (r.ys(x, p) || []).forEach((y, j) => { (branches[j] ||= []).push([x, y]); }); }
      for (const pts of Object.values(branches)) el('path', { d: pts.map(([x, y], k) => `${k ? 'L' : 'M'}${sx(x)},${sy(y)}`).join(''), stroke: color, class: 'plot-curve' }, plot);
    });
    for (const v of spec.vlinesAt || []) { const x = v.at(p); if (Number.isFinite(x)) { el('line', { x1: sx(x), y1: sy(y0), x2: sx(x), y2: sy(y1), class: 'plot-axisline' }, plot); if (v.label) { const t = el('text', { x: sx(x) + 4, y: pad + 12, class: 'plot-point-label' }, plot); t.textContent = v.label; } } }
    if (spec.vline) el('line', { x1: sx(p[spec.vline]), y1: sy(y0), x2: sx(p[spec.vline]), y2: sy(y1), class: 'plot-testline' }, plot);
    if (spec.hline) el('line', { x1: sx(x0), y1: sy(p[spec.hline]), x2: sx(x1), y2: sy(p[spec.hline]), class: 'plot-testline' }, plot);
    (spec.points || []).forEach((pt) => {
      const r = pt.at(p); if (!r || !r.every(Number.isFinite)) return; const [x, y] = r;
      el('circle', { cx: sx(x), cy: sy(y), r: 4.5, class: pt.open ? 'plot-open' : 'plot-point' }, plot);
      if (pt.label) { const t = el('text', { x: sx(x) + 7, y: sy(y) - 7, class: 'plot-point-label' }, plot); t.textContent = typeof pt.label === 'function' ? pt.label(p) : pt.label; }
    });
    readout.innerHTML = spec.readout ? renderMath(spec.readout(p, { fmt })) : '';
  }
  const uid = Math.random().toString(36).slice(2, 8);
  (spec.params || []).forEach((q) => {
    const id = `pr-${uid}-${q.name}`; const row = document.createElement('div'); row.className = 'plot-param';
    row.innerHTML = `<label for="${id}">${renderMath(q.label || q.name)} = <output>${fmt(p[q.name])}</output></label><input id="${id}" type="range" min="${q.min}" max="${q.max}" step="${q.step || 1}" value="${q.value}">`;
    const input = row.querySelector('input'), out = row.querySelector('output');
    input.addEventListener('input', () => { p[q.name] = Number(input.value); out.textContent = fmt(p[q.name]); draw(); });
    controls.append(row);
  });
  draw();
}

// ---------------------------------------------------------------- mapping
// spec: { type:'mapping', sets:[{ label, domain:[..], codomain:[..], pairs:[[a,b]..], note }] }
// Several sets → toggle buttons to compare (e.g. function vs not a function).
function mountMapping(host, spec) {
  const sets = spec.sets; let idx = 0;
  const bar = document.createElement('div'); bar.className = 'diagram-toggle'; bar.setAttribute('role', 'group');
  const stage = document.createElement('div'); stage.className = 'mapping-stage';
  const note = document.createElement('p'); note.className = 'mapping-note'; note.setAttribute('aria-live', 'polite');
  if (sets.length > 1) host.append(bar); host.append(stage, note);
  function draw() {
    const s = sets[idx]; const W = 320, rowH = 38, n = Math.max(s.domain.length, s.codomain.length), H = n * rowH + 40;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'mapping-svg', role: 'img', 'aria-label': s.label });
    const yA = (i) => 30 + i * rowH + (n - s.domain.length) * rowH / 2, yB = (i) => 30 + i * rowH + (n - s.codomain.length) * rowH / 2;
    el('rect', { x: 30, y: 8, width: 70, height: H - 16, rx: 30, class: 'mapping-oval' }, svg); el('rect', { x: 220, y: 8, width: 70, height: H - 16, rx: 30, class: 'mapping-oval' }, svg);
    const defs = el('defs', {}, svg); const m = el('marker', { id: `ar-${idx}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); el('path', { d: 'M0,0L10,5L0,10z', class: 'mapping-head' }, m);
    for (const [a, b] of s.pairs) { const i = s.domain.indexOf(a), j = s.codomain.indexOf(b); el('line', { x1: 86, y1: yA(i), x2: 232, y2: yB(j), class: 'mapping-arrow-line', 'marker-end': `url(#ar-${idx})` }, svg); }
    s.domain.forEach((a, i) => { const t = el('text', { x: 65, y: yA(i) + 5, class: 'mapping-label' }, svg); t.textContent = a; });
    s.codomain.forEach((b, j) => { const t = el('text', { x: 255, y: yB(j) + 5, class: 'mapping-label' }, svg); t.textContent = b; });
    stage.replaceChildren(svg); note.innerHTML = renderMath(s.note || '');
    [...bar.children].forEach((b, k) => b.classList.toggle('is-active', k === idx));
  }
  sets.forEach((s, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'toggle-btn'; b.textContent = s.label; b.addEventListener('click', () => { idx = k; draw(); }); bar.append(b); });
  draw();
}

// ---------------------------------------------------------------- table
// spec: { type:'table', columns:[{ head:'x' , f?:(x)=>.. }], xs:[..], input:true }
function mountTable(host, spec) {
  const xs = [...spec.xs];
  const wrap = document.createElement('div'); wrap.className = 'value-table-wrap'; host.append(wrap);
  function draw() {
    wrap.innerHTML = `<table class="value-table"><thead><tr>${spec.columns.map((c) => `<th scope="col">${renderMath(c.head)}</th>`).join('')}</tr></thead><tbody>${xs.map((x) => `<tr>${spec.columns.map((c) => { let v; try { v = c.f ? c.f(x) : x; } catch { v = NaN; } return `<td>${Number.isFinite(v) ? fmt(v) : (c.undefinedText || 'tak tertakrif')}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
  }
  if (spec.input) {
    const id = 'tb-' + Math.random().toString(36).slice(2, 7);
    const row = document.createElement('div'); row.className = 'value-table-add';
    row.innerHTML = `<label for="${id}">Cuba nilai x sendiri</label><input id="${id}" type="number" step="any" inputmode="decimal"><button type="button" class="btn-ghost">Tambah</button>`;
    const inp = row.querySelector('input');
    const add = () => { const v = Number(inp.value); if (inp.value !== '' && Number.isFinite(v) && !xs.includes(v)) { xs.push(v); xs.sort((a, b) => a - b); draw(); } inp.value = ''; };
    row.querySelector('button').addEventListener('click', add); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    host.append(row);
  }
  draw();
}

const MOUNTERS = { plot: mountPlot, mapping: mountMapping, table: mountTable };
export function mountVisual(host, spec) { const m = MOUNTERS[spec.type]; if (!m) throw new Error(`unknown visual ${spec.type}`); m(host, spec); }
export { tex };
