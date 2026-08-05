/**
 * ShadowSystem — the signature "shadow" mechanic that names the game.
 *
 * The runner exists in one of two planes: LIGHT or SHADOW. Tall barriers are
 * locked to a plane and can only be passed while the player is on the OPPOSITE
 * plane (the barrier is intangible to you then). Jump handles ground obstacles;
 * phase handles barriers. Two verbs, two threat types — that's the core loop.
 *
 * Responsibilities:
 *  - Own the current plane and the toggle (with a short cooldown).
 *  - Recolor the player and wash the background per plane for instant readout.
 *  - Emit PLANE_CHANGED so the React HUD can mirror it.
 *
 * Collision authority stays in GameScene: it asks `isTangible(barrierPlane)`
 * to decide whether a barrier overlap is lethal.
 */
import Phaser from 'phaser';
import { PLANE, SHADOW, VIEW, WORLD, type PlaneId } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { EventBus, GameEvents } from '../EventBus';

export class ShadowSystem {
  private scene: Phaser.Scene;
  private player: Player;

  private plane: PlaneId = PLANE.LIGHT;
  private lastToggleAt = -Infinity;

  // Parallax backdrop, back-to-front: gradient sky wash, stars, mountains.
  private bgWash: Phaser.GameObjects.Rectangle;
  private stars: Phaser.GameObjects.TileSprite;
  private mountains: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.bgWash = scene.add
      .rectangle(0, 0, VIEW.WIDTH, VIEW.HEIGHT, SHADOW.LIGHT_BG)
      .setOrigin(0, 0)
      .setDepth(-30);

    this.stars = scene.add
      .tileSprite(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 'stars')
      .setOrigin(0, 0)
      .setDepth(-20);

    const mtnH = 260;
    this.mountains = scene.add
      .tileSprite(0, VIEW.HEIGHT - WORLD.GROUND_HEIGHT - mtnH, VIEW.WIDTH, mtnH, 'mountains')
      .setOrigin(0, 0)
      .setDepth(-10);
  }

  get currentPlane(): PlaneId {
    return this.plane;
  }

  /** Scroll the parallax layers. Called each frame by GameScene with world px. */
  scroll(distance: number): void {
    this.stars.tilePositionX += distance * 0.12;
    this.mountains.tilePositionX += distance * 0.35;
  }

  /** True if a barrier on `barrierPlane` can hit the player right now. */
  isTangible(barrierPlane: PlaneId): boolean {
    return barrierPlane === this.plane;
  }

  reset(): void {
    this.plane = PLANE.LIGHT;
    this.lastToggleAt = -Infinity;
    this.applyPlaneVisuals(false);
    EventBus.emit(GameEvents.SHADOW_CHANGED, this.plane);
  }

  /** Player/UI requests a phase toggle. Returns true if it fired. */
  tryToggle(now: number): boolean {
    if (now - this.lastToggleAt < SHADOW.TOGGLE_COOLDOWN_MS) return false;
    this.lastToggleAt = now;
    this.plane = this.plane === PLANE.LIGHT ? PLANE.SHADOW : PLANE.LIGHT;
    this.applyPlaneVisuals(true);
    EventBus.emit(GameEvents.SHADOW_CHANGED, this.plane);
    return true;
  }

  private applyPlaneVisuals(withFx: boolean): void {
    const isLight = this.plane === PLANE.LIGHT;
    const accent = isLight ? SHADOW.LIGHT_COLOR : SHADOW.SHADOW_COLOR;
    const bg = isLight ? SHADOW.LIGHT_BG : SHADOW.SHADOW_BG;
    const mtn = isLight ? SHADOW.LIGHT_MTN : SHADOW.SHADOW_MTN;

    // Recolor the parallax backdrop for the plane's mood.
    this.bgWash.setFillStyle(bg, 1);
    this.mountains.setTint(mtn);
    this.stars.setTint(accent);

    // Player tint — only when not dashing (dash owns the gold look).
    if (this.player.sprite.texture.key !== 'player-dash') {
      this.player.sprite.setTint(accent);
    }

    if (withFx) {
      const [r, g, b] = this.hexToRgb(accent);
      this.scene.cameras.main.flash(SHADOW.FLASH_MS, r, g, b, false);
      this.scene.cameras.main.shake(80, 0.004);
      this.spawnPhaseRing(accent);
    }
  }

  /** A quick expanding ring at the player on phase, matching the plane color. */
  private spawnPhaseRing(color: number): void {
    const s = this.player.sprite;
    const ring = this.scene.add
      .image(s.x, s.y - 24, 'shock-ring')
      .setDepth(24)
      .setTint(color)
      .setScale(0.15)
      .setAlpha(0.85);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.2,
      alpha: 0,
      duration: 320,
      ease: 'Cubic.out',
      onComplete: () => ring.destroy(),
    });
  }

  private hexToRgb(hex: number): [number, number, number] {
    return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
  }

  /** Re-apply the plane tint after dash ends (dash clears tint on exit). */
  refreshPlayerTint(): void {
    if (this.player.sprite.texture.key !== 'player-dash') {
      const accent =
        this.plane === PLANE.LIGHT ? SHADOW.LIGHT_COLOR : SHADOW.SHADOW_COLOR;
      this.player.sprite.setTint(accent);
    }
  }
}
