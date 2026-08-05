/**
 * GameCanvas — mounts the Phaser game into the React tree exactly once.
 *
 * We guard against React 18 StrictMode's double-invoke in dev by tracking the
 * instance in a ref and only creating/destroying on real mount/unmount.
 */
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGame } from '../../game/PhaserGame';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = createGame(containerRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
