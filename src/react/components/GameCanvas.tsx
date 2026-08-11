/**
 * GameCanvas — mounts the Phaser game into the React tree exactly once.
 *
 * We guard against React 18 StrictMode's double-invoke in dev by tracking the
 * instance in a ref and only creating/destroying on real mount/unmount.
 * 
 * Also handles mobile tap-to-jump for the entire game frame area.
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

  // Mobile tap-to-jump: Allow tapping anywhere on game frame to trigger jump
  // (except on UI buttons which have their own handlers)
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Only on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth < 768;
    
    if (!isMobile) return;
    
    // Don't trigger if user tapped on a button or interactive element
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' || 
      target.closest('button') ||
      target.closest('.touch-btn') ||
      target.closest('.btn')
    ) {
      return;
    }

    // Forward the tap to Phaser's input system
    // Phaser will handle the actual jump logic
    if (gameRef.current) {
      const scene = gameRef.current.scene.keys.GameScene;
      if (scene) {
        // Trigger a synthetic pointer event on the Phaser scene
        scene.input.emit('pointerdown', { isDown: true });
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="game-canvas"
      onClick={handleTap}
      onTouchStart={handleTap}
    />
  );
}
