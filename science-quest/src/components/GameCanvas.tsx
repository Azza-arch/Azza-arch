
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MagnetScene } from '../game/scenes/MagnetScene';

export default function GameCanvas() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#EAF8FF',
      scene: [MagnetScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={gameRef}
      style={{
        width: '100%',
        maxWidth: '1280px',
        aspectRatio: '16 / 9',
        margin: '0 auto',
        overflow: 'hidden',
        borderRadius: '16px',
      }}
    />
  );
}
