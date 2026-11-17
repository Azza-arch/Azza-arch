import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { useFonts, DISPLAY } from './lib';
// Clean product plate: same navy background, title and layout as the trailer's 17–21 s
// showcase, minus the decorative accent line, grid, particles and extra labels.
// The journal is a real 2.5x screenshot of the in-game Journal (hint 3 open).
export const Plate: React.FC<{ bgOnly?: boolean }> = ({ bgOnly }) => {
  useFonts();
  const t = (txt: string, top: number, color = '#fff') => <div style={{ position: 'absolute', left: 150, top, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, color, letterSpacing: '0.01em', lineHeight: 1.15 }}>{txt}</div>;
  const w = 830, h = Math.round(830 * 795 / 1150);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 90% at 70% 50%, #13304a 0%, #0b1b2e 55%, #060f1c 100%)' }}>
      {!bgOnly && <>{t('LEARN', 400)}{t('THROUGH', 515)}{t('ADVENTURE.', 630, '#ffd25a')}
      <Img src={staticFile('journal-hint3.png')} style={{ position: 'absolute', left: 1290 - w / 2, top: 520 - h / 2, width: w, height: h }} /></>}
    </AbsoluteFill>
  );
};
