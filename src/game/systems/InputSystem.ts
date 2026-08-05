/**
 * InputSystem — unifies the three control schemes (Space, mouse click, touch)
 * into a single "jump pressed" signal. One button, three ways to press it.
 *
 * We route everything through Player.queueJump so jump-buffering works
 * identically regardless of input source.
 */
import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class InputSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enabled = true;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    // Keyboard: Space
    this.spaceKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.spaceKey.on('down', this.onPress, this);

    // Pointer: mouse click + touch both surface as pointerdown
    scene.input.on('pointerdown', this.onPress, this);
  }

  private onPress = (): void => {
    if (!this.enabled) return;
    this.player.queueJump(this.scene.time.now);
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  destroy(): void {
    this.spaceKey.off('down', this.onPress, this);
    this.scene.input.off('pointerdown', this.onPress, this);
  }
}
