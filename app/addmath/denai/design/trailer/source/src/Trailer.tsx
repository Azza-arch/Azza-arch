import React from 'react';
import { AbsoluteFill, Sequence, Audio, Img, staticFile, useCurrentFrame, interpolate, random } from 'remotion';
import { W, H, ease, easeOut, easeIn, clamp, lerp, useFonts, DISPLAY, BODY, Shot, track, remap, localFor, coinFrames, toScreen, Motes, LetterReveal, Scrim, frameSrc, Cam } from './lib';

// ============================ timeline (frames @30 fps; 1 beat = 15 f) ============================
// S1 0–100 hook · S2 96–212 world · S3 186–362 gameplay · S4 362–518 puzzle · S5 498–668 learning
// S6 645–800 payoff · S7 782–900 brand
const follow = (clip: string, s: number | ((f: number) => number), dx = 0, dy = 0) => (f: number, cf: number): Cam => {
  const [x, y] = track(clip, 'p', cf); return { fx: x + dx, fy: y + dy, s: typeof s === 'number' ? s : s(f) };
};

// ---- shot definitions (global start, duration, clip, remap, camera, blur) ----
type ShotDef = { id: string; from: number; dur: number; clip: string; map: (f: number) => number; cam: (f: number, cf: number) => Cam; blur?: (f: number) => number };
const S1: ShotDef = { id: 's1', from: 0, dur: 100, clip: 'l1-start', map: remap([[0, 4], [100, 84]]),
  cam: (f, cf) => { const [x, y] = track('l1-start', 'p', cf, 10); const s = f < 84 ? lerp(f, [0, 72], [2.35, 1.06]) : lerp(f, [84, 100], [1.06, 1.95], easeIn); return { fx: x, fy: y - lerp(f, [0, 72], [10, 70]), s }; },
  blur: (f) => lerp(f, [86, 100], [0, 42], easeIn) };
const S2a: ShotDef = { id: 's2a', from: 96, dur: 56, clip: 'l2-river', map: remap([[0, 2], [56, 58]]),
  cam: (f, cf) => { const [x, y] = track('l2-river', 'p', cf, 10); return { fx: x + lerp(f, [0, 56], [-60, 220], (t) => t), fy: y - 90, s: lerp(f, [0, 14], [1.75, 1.14], easeOut) }; },
  blur: (f) => lerp(f, [0, 12], [42, 0], easeOut) };
const S2b: ShotDef = { id: 's2b', from: 150, dur: 64, clip: 'l3-start', map: remap([[0, 0], [64, 44]]),
  cam: (f, cf) => { const [x, y] = track('l3-start', 'p', cf, 10); return { fx: x + lerp(f, [0, 64], [260, 60], (t) => t), fy: y - 110, s: 1.12 }; } };
const S3a: ShotDef = { id: 's3a', from: 186, dur: 68, clip: 'l1-climb', map: remap([[0, 0], [68, 48]]), cam: follow('l1-climb', 1.16, 60, -50) };
const S3bMap = remap([[0, 0], [14, 18], [30, 26], [48, 44]]);
const S3b: ShotDef = { id: 's3b', from: 254, dur: 46, clip: 'l1-cross', map: S3bMap, cam: follow('l1-cross', (f) => 1.12 + lerp(f, [12, 20], [0, 0.14], easeOut) - lerp(f, [30, 40], [0, 0.1]), 120, -60) };
const S3c: ShotDef = { id: 's3c', from: 300, dur: 30, clip: 'l2-river', map: remap([[0, 68], [30, 98]]), cam: follow('l2-river', (f) => lerp(f, [0, 5], [1.24, 1.15], easeOut), 80, -70) };
const S3d: ShotDef = { id: 's3d', from: 330, dur: 32, clip: 'l1-cross', map: remap([[0, 42], [32, 60]]),
  cam: (f, cf) => { const [x, y] = track('l1-cross', 'p', cf, 3); return { fx: x + lerp(f, [16, 32], [90, 0]), fy: y - lerp(f, [16, 32], [50, 0]), s: lerp(f, [16, 32], [1.15, 1.8], easeIn) }; },
  blur: (f) => lerp(f, [24, 32], [0, 20], easeIn) };
const S4map = remap([[0, 2], [33, 35], [63, 65], [118, 100], [156, 104]]);
const S4cam = (f: number, cf: number): Cam => {
  const wh = track('l3-valve-right', 'wheel', cf, 4), me = track('l3-valve-right', 'meter', cf, 4);
  const mid: [number, number] = [(wh[0] + me[0]) / 2, (wh[1] + me[1]) / 2 + 70];
  const far: [number, number] = [me[0] + 230, me[1] + 170];
  const t1 = lerp(f, [30, 62], [0, 1]), t2 = lerp(f, [66, 124], [0, 1]);
  const fx = wh[0] + (mid[0] - wh[0]) * t1 + (far[0] - mid[0]) * t2;
  const fy = wh[1] + (mid[1] - wh[1]) * t1 + (far[1] - mid[1]) * t2 + lerp(f, [0, 12], [110, 0], easeOut);
  const s = lerp(f, [0, 30], [2.05, 1.8]) - lerp(f, [30, 62], [0, 0.48]) - lerp(f, [66, 124], [0, 0.27]);
  return { fx, fy, s };
};
const S4: ShotDef = { id: 's4', from: 362, dur: 156, clip: 'l3-valve-right', map: S4map, cam: S4cam, blur: (f) => lerp(f, [0, 9], [22, 0], easeOut) };
// S6 payoff (beat cuts at 660 / 690 / 705 / 720 / 735)
const imp = (f: number, at: number) => lerp(f, [at, at + 8], [0.09, 0], easeOut);
const S6a: ShotDef = { id: 's6a', from: 645, dur: 45, clip: 'l2-success', map: remap([[0, 0], [15, 6], [45, 42]]), cam: follow('l2-success', (f) => 1.18 + imp(f, 15), 260, -120) };
const S6b: ShotDef = { id: 's6b', from: 690, dur: 15, clip: 'l3-valve-right', map: remap([[0, 74], [15, 100]]), cam: (f, cf) => { const me = track('l3-valve-right', 'meter', cf); return { fx: me[0] + 160, fy: me[1] + 140, s: 1.16 + imp(f, 0) }; } };
const S6c: ShotDef = { id: 's6c', from: 705, dur: 15, clip: 'l1-repair', map: remap([[0, 94], [15, 112]]), cam: follow('l1-repair', (f) => 1.14 + imp(f, 0), 120, -170) };
const S6d: ShotDef = { id: 's6d', from: 720, dur: 15, clip: 'l1-cross', map: remap([[0, 20], [15, 40]]), cam: follow('l1-cross', (f) => 1.2 + imp(f, 0), 80, -60) };
const S6e: ShotDef = { id: 's6e', from: 735, dur: 70, clip: 'l1-finish', map: remap([[0, 12], [26, 30], [70, 96]]), cam: (f, cf) => { const [x, y] = track('l1-finish', 'p', cf, 8); const s = lerp(f, [0, 30], [1.32, 1.0]) + imp(f, 0); return { fx: x - lerp(f, [0, 30], [0, 400]), fy: y - 60, s }; } };

const SHOTS = [S1, S2a, S2b, S3a, S3b, S3c, S3d, S4, S6a, S6b, S6c, S6d, S6e];
const ShotSeq: React.FC<{ d: ShotDef; style?: React.CSSProperties }> = ({ d, style }) => (
  <Sequence from={d.from} durationInFrames={d.dur} layout="none"><AbsoluteFill style={style}><Shot id={d.id} clip={d.clip} map={d.map} cam={d.cam} blur={d.blur} /></AbsoluteFill></Sequence>
);

// ============================ typography / transitions ============================
const Word: React.FC<{ text: string; inAt: number; outAt: number; size: number; from?: 'left' | 'right' | 'mask'; y?: number; align?: 'center' | 'left' | 'right'; x?: number }> = ({ text, inAt, outAt, size, from = 'left', y = 540, align = 'center', x = 0 }) => {
  const f = useCurrentFrame();
  if (f < inAt - 1 || f > outAt + 12) return null;
  const tin = lerp(f, [inAt, inAt + 12], [0, 1], easeOut), tout = lerp(f, [outAt, outAt + 10], [0, 1], easeIn);
  const dir = from === 'right' ? -1 : 1;
  const tx = from === 'mask' ? 0 : (1 - tin) * -dir * 700 + tout * dir * 1500;
  const blur = from === 'mask' ? 0 : (1 - tin) * 10 + tout * 28;
  const clip = from === 'mask' ? `inset(${(1 - tin) * 100}% 0 0 0)` : undefined;
  const ty = from === 'mask' ? (1 - tin) * size * 0.35 - tout * size * 0.25 : 0;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end', padding: `0 ${x}px` }}>
      <div style={{ position: 'absolute', top: y - size * 0.62, clipPath: clip, opacity: from === 'mask' ? 1 - tout : 1 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: `${0.02 + 0.03 * tin}em`, color: '#fff', transform: `translateX(${tx}px) translateY(${ty}px) scaleX(${1 + (1 - tin) * 0.12 + tout * 0.5})`, filter: `blur(${blur}px)`, textShadow: '0 6px 34px rgba(4,10,22,.55)' }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

/** S2 → S3: "EXPLORE." slides in, becomes a mask showing the next shot inside the letters, then scales up through the E stem. */
const EX = { size: 330, len: 1560, y: 650 };
const exploreGeom = (f: number) => {
  const x0 = lerp(f, [160, 176], [W + 80, (W - EX.len) / 2], easeOut) - lerp(f, [176, 192], [0, 40], (t) => t);
  const sc = f < 192 ? 1 : lerp(f, [192, 214], [1, 46], easeIn);
  const ax = x0 + EX.len * 0.035, ay = EX.y - EX.size * 0.34; // inside the stem of the first E
  return { x0, sc, ax, ay };
};
const ExploreDefs: React.FC = () => {
  const f = useCurrentFrame(); const g = exploreGeom(f);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs><clipPath id="exploreClip" clipPathUnits="userSpaceOnUse">
        <text x={g.x0} y={EX.y} fontFamily="Space Grotesk" fontWeight={700} fontSize={EX.size} textLength={EX.len} lengthAdjust="spacingAndGlyphs" transform={`translate(${g.ax} ${g.ay}) scale(${g.sc}) translate(${-g.ax} ${-g.ay})`}>EXPLORE.</text>
      </clipPath></defs>
    </svg>
  );
};
const ExploreFill: React.FC = () => {
  const f = useCurrentFrame(); const g = exploreGeom(f);
  const op = lerp(f, [184, 192], [1, 0]);
  if (f < 158 || op <= 0) return null;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <text x={g.x0} y={EX.y} fontFamily="Space Grotesk" fontWeight={700} fontSize={EX.size} textLength={EX.len} lengthAdjust="spacingAndGlyphs" fill="#fff" opacity={op} style={{ filter: 'drop-shadow(0 8px 30px rgba(4,10,22,.5))' }}>EXPLORE.</text>
    </svg>
  );
};

/** S4: animated outline on the real valve wheel (tracked). */
const WheelOutline: React.FC = () => {
  const f = useCurrentFrame(); const lf = f - S4.from;
  if (lf < 2 || lf > 48) return null;
  const cf = S4.map(lf), cam = S4.cam(lf, cf);
  const [sx, sy] = toScreen(track('l3-valve-right', 'wheel', cf, 4), cam);
  const r = 62 * cam.s; const draw = lerp(lf, [3, 20], [0, 1], easeOut); const op = lerp(lf, [3, 8], [0, 1]) * lerp(lf, [38, 48], [1, 0]);
  const C = 2 * Math.PI * r; const pulse = 1 + 0.05 * Math.sin(lf / 3);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <circle cx={sx} cy={sy} r={r * pulse} fill="none" stroke="#ffd25a" strokeWidth={5} strokeDasharray={C} strokeDashoffset={C * (1 - draw)} strokeLinecap="round" transform={`rotate(-90 ${sx} ${sy})`} style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,80,.8))' }} />
      <circle cx={sx} cy={sy} r={r * 1.22} fill="none" stroke="rgba(255,236,170,.45)" strokeWidth={2} strokeDasharray="6 14" transform={`rotate(${lf * 4} ${sx} ${sy})`} />
    </svg>
  );
};
const wipeCenter = (): [number, number] => { const lf = 136; const cf = S4.map(lf); return toScreen(track('l3-valve-right', 'wheel', cf, 4), S4.cam(lf, cf)); };
const WipeRing: React.FC = () => {
  const f = useCurrentFrame(); if (f < 498 || f > 520) return null;
  const [cx, cy] = wipeCenter(); const r = lerp(f, [498, 518], [0, 2300], easeIn); const op = lerp(f, [512, 520], [1, 0]);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#5fc8ff" strokeWidth={14} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2b6f9e" strokeWidth={4} strokeDasharray="40 30" transform={`rotate(${f * 9} ${cx} ${cy})`} />
      {[0, 90, 180, 270].map((a) => { const rad = ((a + f * 9) * Math.PI) / 180; return <circle key={a} cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r} r={16} fill="#ffd25a" stroke="#394238" strokeWidth={4} />; })}
    </svg>
  );
};

// ============================ S5: learning showcase ============================
type Card = { clip: string; map: (f: number) => number; crop: [number, number, number, number]; label: string; sub: string; inAt: number; outAt: number };
const CARDS: Card[] = [
  { clip: 'l3-hints', map: remap([[0, 4], [50, 118]]), crop: [600, 285, 720, 500], label: 'HINTS ON REQUEST', sub: 'Three levels — nudge, method, worked step', inAt: 522, outAt: 572 },
  { clip: 'l1-store', map: remap([[0, 14], [47, 72]]), crop: [640, 150, 880, 460], label: 'MATHS YOU CAN TOUCH', sub: 'Plan the cost with a function before you buy', inAt: 574, outAt: 620 },
  { clip: 'l3-math', map: remap([[0, 4], [36, 60]]), crop: [600, 285, 720, 500], label: 'SEE THE WORKING', sub: 'Every answer explains itself', inAt: 622, outAt: 700 },
];
const CARD_BOX = { cx: 1290, cy: 520, w: 900 };
const cardRect = (c: Card) => { const h = Math.min(640, (CARD_BOX.w * c.crop[3]) / c.crop[2]); const w = (h * c.crop[2]) / c.crop[3]; return { x: CARD_BOX.cx - w / 2, y: CARD_BOX.cy - h / 2, w, h }; };
const CardView: React.FC<{ c: Card }> = ({ c }) => {
  const f = useCurrentFrame(); if (f < c.inAt - 2 || f > c.outAt + 14) return null;
  const tin = lerp(f, [c.inAt, c.inAt + 14], [0, 1], easeOut), tout = lerp(f, [c.outAt, c.outAt + 12], [0, 1], easeIn);
  const r = cardRect(c); const lf = f - c.inAt; const cf = c.map(lf);
  const k = r.w / c.crop[2];
  return (
    <>
      <div style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 26, overflow: 'hidden', transform: `translateX(${(1 - tin) * 160 - tout * 200}px) scale(${0.94 + 0.06 * tin})`, opacity: tin * (1 - tout), boxShadow: '0 40px 90px rgba(0,0,0,.5), 0 0 0 1.5px rgba(255,255,255,.14)', clipPath: `inset(0 ${(1 - tin) * 40}% 0 0 round 26px)` }}>
        <Img src={frameSrc(c.clip, cf)} style={{ position: 'absolute', left: -c.crop[0] * k, top: -c.crop[1] * k, width: W * k, height: H * k, imageRendering: 'auto' }} />
      </div>
      <div style={{ position: 'absolute', left: r.x, top: r.y + r.h + 34, opacity: lerp(f, [c.inAt + 8, c.inAt + 18], [0, 1]) * (1 - tout), transform: `translateY(${(1 - lerp(f, [c.inAt + 8, c.inAt + 20], [0, 1], easeOut)) * 16}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 3, background: 'linear-gradient(90deg,#ffd25a,#b8f06a)' }} />
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: '.2em', color: '#ffd25a' }}>{c.label}</div>
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 24, color: '#b9c8d8', marginTop: 10, marginLeft: 60 }}>{c.sub}</div>
      </div>
    </>
  );
};
const Learn: React.FC = () => {
  const f = useCurrentFrame();
  const line = (txt: string, at: number, top: number, size: number, weight = 700, color = '#fff', font = DISPLAY, ls = '0.01em') => {
    const t = lerp(f, [at, at + 16], [0, 1], easeOut);
    return <div style={{ position: 'absolute', left: 150, top, overflow: 'hidden', height: size * 1.18 }}><div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: ls, transform: `translateY(${(1 - t) * size * 1.15}px)`, lineHeight: 1.15 }}>{txt}</div></div>;
  };
  const accent = lerp(f, [536, 560], [0, 300], easeOut);
  const gridShift = (f - 498) * 0.4;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 90% at 70% 50%, #13304a 0%, #0b1b2e 55%, #060f1c 100%)' }}>
      <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)', backgroundSize: '64px 64px', backgroundPosition: `${-gridShift}px ${gridShift * 0.3}px`, maskImage: 'radial-gradient(ellipse 70% 70% at 60% 50%, #000 30%, transparent 100%)' }} />
      <Motes n={26} seed="learn" opacity={0.35} color="160,220,255" />
      {line('DENAI · WORLD 1', 512, 352, 22, 800, '#b8f06a', BODY, '.32em')}
      {line('LEARN', 518, 400, 104)}
      {line('THROUGH', 523, 515, 104)}
      {line('ADVENTURE.', 528, 630, 104, 700, '#ffd25a')}
      <div style={{ position: 'absolute', left: 150, top: 772, width: accent, height: 4, background: 'linear-gradient(90deg,#ffd25a,#b8f06a)', borderRadius: 2 }} />
      {CARDS.map((c) => <CardView key={c.clip} c={c} />)}
    </AbsoluteFill>
  );
};
/** S5 → S6: a parchment UI panel slides in over the last card and opens into the payoff gameplay. */
const PanelOpen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const r = cardRect(CARDS[2]);
  const slide = lerp(f, [638, 650], [0, 1], easeOut), open = lerp(f, [650, 662], [0, 1], ease);
  const x = interpolate(slide, [0, 1], [W + 40, r.x]) * (1 - open), y = r.y * (1 - open);
  const w = r.w + (W - r.w) * open, h = r.h + (H - r.h) * open;
  const content = lerp(f, [640, 649], [0, 1]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26 * (1 - open), overflow: 'hidden', background: '#fdf3dc', boxShadow: `0 40px 90px rgba(0,0,0,${0.5 * (1 - open)})` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `scale(${w / W}, ${h / H})`, opacity: content }}>{children}</div>
    </div>
  );
};

// ============================ S7: brand reveal ============================
const Brand: React.FC = () => {
  const f = useCurrentFrame();
  const bg = lerp(f, [782, 800], [0, 1]);
  const lineX = lerp(f, [790, 818], [-700, W + 100], ease);
  const logoT = lerp(f, [810, 832], [0, 1], easeOut);
  const sweep = lerp(f, [834, 866], [-30, 130], ease);
  const fadeEnd = lerp(f, [892, 900], [1, 0]);
  const halo = lerp(f, [806, 830], [0, 1], easeOut);
  const parts = new Array(34).fill(0).map((_, i) => {
    const a = random('pa' + i) * Math.PI * 2, d = 500 + random('pd' + i) * 700, t = lerp(f, [794 + random('pt' + i) * 8, 814], [0, 1], easeIn);
    return { x: W / 2 + Math.cos(a) * d * (1 - t), y: H / 2 - 30 + Math.sin(a) * d * 0.6 * (1 - t), o: t > 0.98 ? 0 : 0.2 + 0.8 * t, r: 2 + random('pr' + i) * 3 };
  });
  const sub = (txt: string, at: number, size: number, color: string, ls: string, top: number, font = DISPLAY, weight = 700) => {
    const t = lerp(f, [at, at + 18], [0, 1], easeOut);
    return <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: ls, opacity: t, transform: `translateY(${(1 - t) * 18}px)`, filter: `blur(${(1 - t) * 6}px)` }}>{txt}</div>;
  };
  const logoStyle: React.CSSProperties = { fontFamily: 'Inter', fontWeight: 900, fontSize: 250, letterSpacing: '.05em', lineHeight: 1 };
  const outline = '#6f3e43';
  const shadow = [[6, 0], [-6, 0], [0, 6], [0, -6], [6, 6], [-6, 6], [6, -6], [-6, -6], [0, 14]].map(([x, y]) => `${x}px ${y}px 0 ${outline}`).join(',') + ', 10px 22px 40px rgba(0,0,0,.55)';
  return (
    <AbsoluteFill style={{ opacity: fadeEnd }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 46%, #10233d 0%, #081326 55%, #040a15 100%)', opacity: bg }} />
      <Motes n={30} seed="brand" opacity={0.3 * bg} color="255,214,120" />
      <div style={{ position: 'absolute', left: lineX, top: H / 2 - 2, width: 700, height: 3, background: 'linear-gradient(90deg, rgba(255,210,90,0), #ffd25a 60%, #b8f06a)', boxShadow: '0 0 24px rgba(255,210,90,.9)', opacity: bg }} />
      {parts.map((p, i) => <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, width: p.r * 2, height: p.r * 2, borderRadius: '50%', background: '#ffe39a', boxShadow: '0 0 10px #ffd25a', opacity: p.o * bg }} />)}
      <div style={{ position: 'absolute', left: W / 2 - 520, top: H / 2 - 300, width: 1040, height: 460, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,200,90,.28) 0%, rgba(255,200,90,0) 70%)', opacity: halo }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: logoT, transform: `scale(${1.16 - 0.16 * logoT})`, filter: `blur(${(1 - logoT) * 14}px)` }}>
        <span style={{ ...logoStyle, color: '#f4b41b', textShadow: shadow }}>DENAI</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: logoT, transform: `scale(${1.16 - 0.16 * logoT})`, mixBlendMode: 'screen' }}>
        <span style={{ ...logoStyle, color: 'transparent', backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,.9) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>DENAI</span>
      </div>
      {sub('EXPLORE.  THINK.  BUILD.', 836, 44, '#ffffff', '.32em', 620)}
      {sub('A 2D ADD MATH ADVENTURE', 850, 26, '#9fb6cc', '.42em', 696, BODY, 600)}
    </AbsoluteFill>
  );
};

// ============================ audio ============================
const sfxAt = (list: [string, number, number][]) => list.filter(([, at]) => at >= 0).map(([file, at, vol], i) => (
  <Sequence key={file + i + at} from={Math.round(at)} durationInFrames={150} layout="none"><Audio src={staticFile(`audio/${file}`)} volume={vol} /></Sequence>
));
const coinSfx = (d: ShotDef, gate?: [number, number]): [string, number, number][] => coinFrames(d.clip).map((c) => localFor(d.map, c, d.dur)).filter((l) => l >= 0).map((l) => d.from + l).filter((g) => !gate || (g >= gate[0] && g < gate[1])).map((g) => ['coin.wav', g, 0.42] as [string, number, number]);

// ============================ main ============================
export const Trailer: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const showLearnClip = f >= 498 && f < 520;
  const [wcx, wcy] = wipeCenter();
  const wipeR = lerp(f, [498, 518], [0, 2300], easeIn);
  const SFX: [string, number, number][] = [
    ['whoosh.wav', 80, 0.55], ['whoosh-short.wav', 156, 0.45], ['whoosh.wav', 186, 0.5], ['whoosh-short.wav', 260, 0.35], ['whoosh-short.wav', 294, 0.4],
    ['whoosh-short.wav', 350, 0.5], ['clunk.wav', S4.from + localFor(S4map, 14, 156), 0.7], ['clunk.wav', S4.from + localFor(S4map, 33, 156), 0.7],
    ['clunk.wav', S4.from + localFor(S4map, 61, 156), 0.85], ['water.wav', S4.from + localFor(S4map, 70, 156), 0.7], ['ui.wav', S4.from + localFor(S4map, 82, 156), 0.5],
    ['whoosh.wav', 490, 0.55], ['ui.wav', 522, 0.4], ['ui.wav', 574, 0.4], ['ui.wav', 622, 0.4],
    ['ui.wav', 522 + localFor(CARDS[0].map, 21, 50), 0.45], ['ui.wav', 522 + localFor(CARDS[0].map, 43, 50), 0.45], ['ui.wav', 522 + localFor(CARDS[0].map, 65, 50), 0.45],
    ['ui.wav', 574 + localFor(CARDS[1].map, 20, 47), 0.35], ['ui.wav', 574 + localFor(CARDS[1].map, 27, 47), 0.35], ['ui.wav', 574 + localFor(CARDS[1].map, 34, 47), 0.35], ['ui.wav', 574 + localFor(CARDS[1].map, 41, 47), 0.35],
    ['coin.wav', 574 + localFor(CARDS[1].map, 66, 47), 0.4], ['ui.wav', 622 + localFor(CARDS[2].map, 16, 36), 0.45],
    ['whoosh.wav', 636, 0.5], ['hit.wav', 660, 0.55], ['whoosh-short.wav', 686, 0.3], ['whoosh-short.wav', 701, 0.3], ['whoosh-short.wav', 716, 0.3], ['hit.wav', 735, 0.35],
    ['swell.wav', 774, 0.75], ['impact.wav', 810, 0.95], ['whoosh.wav', 786, 0.35],
    ...coinSfx(S3a), ...coinSfx(S3b), ...coinSfx(S3c), ...coinSfx(S3d), ...coinSfx(S2b, [150, 186]), ...coinSfx(S6d), ...coinSfx(S6e),
  ];
  return (
    <AbsoluteFill style={{ background: '#050b16' }}>
      {/* S1 hook */}
      <ShotSeq d={S1} />
      <Sequence from={0} durationInFrames={100} layout="none"><AbsoluteFill><Motes n={34} seed="s1" opacity={0.55} drift={-f * 2} /><Scrim from="bottom" opacity={lerp(f, [10, 24], [0, 1]) * lerp(f, [78, 88], [1, 0])} /></AbsoluteFill></Sequence>
      <Sequence from={0} durationInFrames={100} layout="none"><AbsoluteFill style={{ justifyContent: 'flex-end', paddingBottom: 150 }}><LetterReveal text="AN ADVENTURE BEGINS." start={14} end={84} size={92} /></AbsoluteFill></Sequence>
      {/* S2 world */}
      <ShotSeq d={S2a} /><ShotSeq d={S2b} />
      <Sequence from={96} durationInFrames={118} layout="none"><Motes n={24} seed="s2" opacity={0.4} drift={-(f - 96) * 3} /></Sequence>
      {/* S3 gameplay — first shot revealed through the EXPLORE letters */}
      {f >= 150 && f < 220 && <ExploreDefs />}
      {f >= 184 && f < 214 && <AbsoluteFill style={{ background: '#06101e', opacity: lerp(f, [184, 194], [0, 0.55]) }} />}
      <Sequence from={186} durationInFrames={68} layout="none"><AbsoluteFill style={{ clipPath: f < 214 ? 'url(#exploreClip)' : undefined }}><Shot id={S3a.id} clip={S3a.clip} map={S3a.map} cam={S3a.cam} /></AbsoluteFill></Sequence>
      {f >= 150 && f < 200 && <ExploreFill />}
      <ShotSeq d={S3b} /><ShotSeq d={S3c} /><ShotSeq d={S3d} />
      <Word text="THINK." inAt={262} outAt={296} size={270} from="left" y={250} />
      {/* S4 puzzle */}
      <ShotSeq d={S4} />
      <WheelOutline />
      <Sequence from={430} durationInFrames={80} layout="none"><Scrim from="top" opacity={lerp(f, [436, 448], [0, 1]) * lerp(f, [490, 500], [1, 0])} /></Sequence>
      <Word text="SOLVE." inAt={440} outAt={490} size={230} from="mask" y={250} />
      {/* S5 learning — revealed through a valve-shaped circular wipe */}
      {f >= 498 && f < 668 && <AbsoluteFill style={{ clipPath: showLearnClip ? `circle(${wipeR}px at ${wcx}px ${wcy}px)` : undefined }}><Learn /></AbsoluteFill>}
      <WipeRing />
      {/* S6 payoff — opens from a UI panel */}
      {f >= 636 && f < 660 && <PanelOpen><Shot id="s6a-p" clip={S6a.clip} map={S6a.map} cam={S6a.cam} offset={S6a.from} /></PanelOpen>}
      <ShotSeq d={{ ...S6a, from: 660, dur: 30, map: (x) => S6a.map(x + 15), cam: (x, cf) => S6a.cam(x + 15, cf) }} />
      <ShotSeq d={S6b} /><ShotSeq d={S6c} /><ShotSeq d={S6d} /><ShotSeq d={S6e} />
      <Sequence from={660} durationInFrames={140} layout="none"><AbsoluteFill><Motes n={22} seed="s6" opacity={0.4} drift={-(f - 660) * 4} /></AbsoluteFill></Sequence>
      <Sequence from={694} durationInFrames={60} layout="none"><Scrim from="bottom" opacity={lerp(f, [694, 704], [0, 1]) * lerp(f, [742, 752], [1, 0])} /></Sequence>
      <Sequence from={694} durationInFrames={60} layout="none"><AbsoluteFill style={{ justifyContent: 'flex-end', paddingBottom: 130 }}><LetterReveal text="EVERY STEP MATTERS." start={700 - 694} end={752 - 694} size={96} per={1.2} /></AbsoluteFill></Sequence>
      {/* S7 brand */}
      {f >= 782 && <Brand />}
      {/* audio */}
      <Audio src={staticFile('audio/music.wav')} volume={0.78} />
      {sfxAt(SFX)}
    </AbsoluteFill>
  );
};
