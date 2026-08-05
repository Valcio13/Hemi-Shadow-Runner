/**
 * PhaserGame — builds the Phaser.Game instance and its global config.
 * React calls createGame() with a parent container; destroy on unmount.
 */
import Phaser from 'phaser';
import { VIEW, WORLD } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: VIEW.WIDTH,
    height: VIEW.HEIGHT,
    backgroundColor: VIEW.BACKGROUND,
    pixelArt: false,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: WORLD.GRAVITY_Y },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, GameScene],
  };

  const game = new Phaser.Game(config);

  // Dev-only handle for debugging/automated verification in the browser console.
  if (import.meta.env.DEV) {
    (window as unknown as { __game?: Phaser.Game }).__game = game;
  }

  return game;
}
