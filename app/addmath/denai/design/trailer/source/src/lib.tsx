import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender } from 'remotion';
import TRACKS from './tracks.json';
import COINS from './coins.json';

export const W = 1920, H = 1080;
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const lerp = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { ...clamp, easing: e });

// ---------- fonts (local woff2, render waits for them) ----------
const FONTS: [string, string, string][] = [
  ['Space Grotesk', '700', 'space-grotesk-latin-700-normal.woff2'],
  ['Space Grotesk', '500', 'space-grotesk-latin-500-normal.woff2'],
  ['Inter', '500', 'inter-latin-500-normal.woff2'],
  ['Inter', '600', 'inter-latin-600-normal.woff2'],
  ['Inter', '800', 'inter-latin-800-normal.woff2'],
  ['Inter', '900', 'inter-latin-900-normal.woff2'],
];
let fontsQueued = false;
export const useFonts = () => {
  if (fontsQueued || typeof document === 'undefined') return;
  fontsQueued = true;
  const h = delayRender('fonts');
  Promise.all(FONTS.map(([fam, wt, file]) => { const f = new FontFace(fam, `url(${staticFile('fonts/' + file)})`, { weight: wt }); document.fonts.add(f); return f.load(); }))
    .then(() => continueRender(h)).catch(() => continueRender(h));
};
export const DISPLAY = '"Space Grotesk", Inter, sans-serif';
export const BODY = 'Inter, sans-serif';

// ---------- clip frames + tracking ----------
type Track = { frames: number; p: ([number, number] | null)[]; wheel: ([number, number] | null)[]; meter: ([number, number] | null)[] };
const T = TRACKS as unknown as Record<string, Track>;
export const clipLen = (clip: string) => T[clip].frames;
export const frameSrc = (clip: string, n: number) => staticFile(`frames/${clip}/${String(Math.max(0, Math.min(clipLen(clip) - 1, Math.round(n)))).padStart(5, '0')}.jpg`);
/** Smoothed screen-space position (source px) of a tracked object. */
export const track = (clip: string, key: 'p' | 'wheel' | 'meter', n: number, win = 7): [number, number] => {
  const arr = T[clip][key]; let sx = 0, sy = 0, c = 0;
  for (let i = Math.round(n) - win; i <= Math.round(n) + win; i++) { const v = arr[Math.max(0, Math.min(arr.length - 1, i))]; if (v) { sx += v[0]; sy += v[1]; c++; } }
  return c ? [sx / c, sy / c] : [W / 2, H / 2];
};
export const coinFrames = (clip: string): number[] => ((COINS as Record<string, number[]>)[clip] || []);

/** Piecewise-linear time remap: [[local, clipFrame], ...]. */
export const remap = (pts: [number, number][]) => (f: number) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) { const [a, x] = pts[i - 1], [b, y] = pts[i]; return x + (y - x) * (f - a) / (b - a); }
  const [a, x] = pts[pts.length - 2], [b, y] = pts[pts.length - 1]; return y + (f - b) * (y - x) / (b - a);
};
/** Local frames at which a clip frame is shown (first time), for SFX sync. */
export const localFor = (map: (f: number) => number, clipFrame: number, dur: number) => { for (let f = 0; f < dur; f++) if (map(f) >= clipFrame) return f; return -1; };

export type Cam = { fx: number; fy: number; s: number };
export const camTransform = ({ fx, fy, s }: Cam) => {
  let tx = W / 2 - fx * s, ty = H / 2 - fy * s;
  tx = Math.min(0, Math.max(W - W * s, tx)); ty = Math.min(0, Math.max(H - H * s, ty));
  return { tx, ty, s };
};

// ---------- grade + depth ----------
export const Grade: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,214,150,.10) 0%, rgba(0,0,0,0) 38%, rgba(10,30,60,.16) 100%)', mixBlendMode: 'soft-light', opacity: strength }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(6,12,24,.42) 100%)', opacity: strength }} />
  </>
);

/** One gameplay shot: real capture frames, camera (scale/focus) and optional directional blur. */
export const Shot: React.FC<{ clip: string; map: (f: number) => number; cam: (f: number, cf: number) => Cam; blur?: (f: number) => number; id: string; style?: React.CSSProperties; offset?: number }> = ({ clip, map, cam, blur, id, style, offset = 0 }) => {
  const f = useCurrentFrame() - offset; const cf = map(f); const c = camTransform(cam(f, cf)); const b = blur ? blur(f) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#0b1622', ...style }}>
      {b > 0.4 && <svg width="0" height="0" style={{ position: 'absolute' }}><filter id={`db-${id}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${b} ${b * 0.12}`} /></filter></svg>}
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${c.tx}px, ${c.ty}px) scale(${c.s})`, filter: `${b > 0.4 ? `url(#db-${id}) ` : ''}contrast(1.05) saturate(1.08)` }}>
        <Img src={frameSrc(clip, cf)} style={{ width: W, height: H, imageRendering: 'pixelated' }} />
      </div>
      <Grade />
    </AbsoluteFill>
  );
};
/** Screen position of a source point under a camera. */
export const toScreen = (pt: [number, number], cam: Cam): [number, number] => { const c = camTransform(cam); return [c.tx + pt[0] * c.s, c.ty + pt[1] * c.s]; };

// ---------- atmosphere: drifting light motes in two parallax layers ----------
export const Motes: React.FC<{ n?: number; seed?: string; opacity?: number; drift?: number; color?: string }> = ({ n = 36, seed = 'm', opacity = 0.5, drift = 0, color = '255,236,180' }) => {
  const f = useCurrentFrame();
  const pts = useMemo(() => new Array(n).fill(0).map((_, i) => ({ x: random(seed + 'x' + i) * W, y: random(seed + 'y' + i) * H, r: 1.5 + random(seed + 'r' + i) * 4.5, z: 0.35 + random(seed + 'z' + i) * 1.1, ph: random(seed + 'p' + i) * 6.28 })), [n, seed]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      {pts.map((p, i) => {
        const x = ((p.x + f * 0.9 * p.z + drift * p.z) % (W + 40) + W + 40) % (W + 40) - 20;
        const y = ((p.y - f * 0.55 * p.z) % (H + 40) + H + 40) % (H + 40) - 20;
        const tw = 0.55 + 0.45 * Math.sin(f / 14 + p.ph);
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: p.r * 2 * p.z, height: p.r * 2 * p.z, borderRadius: '50%', background: `radial-gradient(circle, rgba(${color},${0.95 * tw}) 0%, rgba(${color},0) 70%)`, filter: p.z > 1.1 ? 'blur(1.5px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- typography ----------
/** Sequential letter reveal with tracking expansion (no bounce). */
export const LetterReveal: React.FC<{ text: string; start: number; end: number; size: number; style?: React.CSSProperties; color?: string; per?: number }> = ({ text, start, end, size, style, color = '#fff', per = 1.6 }) => {
  const f = useCurrentFrame();
  const track = interpolate(f, [start, end], [0.04, 0.2], clamp);
  const out = lerp(f, [end - 10, end], [1, 0], easeIn);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: `${track}em`, color, opacity: out, textShadow: '0 4px 24px rgba(0,0,0,.45)', whiteSpace: 'pre', ...style }}>
      {text.split('').map((ch, i) => {
        const t = lerp(f, [start + i * per, start + i * per + 12], [0, 1], easeOut);
        return <span key={i} style={{ opacity: t, transform: `translateY(${(1 - t) * 0.22 * size}px)`, filter: `blur(${(1 - t) * 8}px)`, display: 'inline-block' }}>{ch}</span>;
      })}
    </div>
  );
};

export const Scrim: React.FC<{ from?: 'bottom' | 'top' | 'center'; opacity?: number }> = ({ from = 'bottom', opacity = 1 }) => (
  <AbsoluteFill style={{ opacity, background: from === 'bottom' ? 'linear-gradient(0deg, rgba(5,12,24,.62) 0%, rgba(5,12,24,.0) 48%)' : from === 'top' ? 'linear-gradient(180deg, rgba(5,12,24,.55) 0%, rgba(5,12,24,0) 45%)' : 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(5,12,24,.5) 0%, rgba(5,12,24,0) 100%)' }} />
);
