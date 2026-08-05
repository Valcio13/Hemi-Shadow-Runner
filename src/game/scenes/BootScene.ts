/**
 * BootScene — generates procedural textures, then starts the GameScene.
 * Kept intentionally tiny; it exists so texture generation happens exactly
 * once before any gameplay scene needs those keys.
 */
import Phaser from 'phaser';
import { generateTextures } from '../systems/TextureFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    generateTextures(this);
    this.scene.start('GameScene');
  }
}
