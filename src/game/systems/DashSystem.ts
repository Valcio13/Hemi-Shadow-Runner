/**
 * DashSystem — the meter, the dash, the feel.
 *
 * Responsibilities:
 *  - Own the 0..1 dash meter; coins fill it.
 *  - Activate a ~1s dash when the meter is full and the player presses dash.
 *  - Expose `isInvincible` so the collision handler can skip obstacle deaths.
 *  - Drive the coin magnet each frame while active (delegates the pull to
 *    CoinManager).
 *  - Own all dash visuals: player recolor, afterimage trail, activation
 *    shockwave, chromatic screen flash.
 *
 * The world-speed boost is applied by GameScene (it owns speed), which reads
 * `speedMultiplier`. Keeping speed authority in one place avoids fighting over
 * the value.
 */
import Phaser from 'phaser';
import { DASH } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { CoinManager } from './CoinManager';
import { EventBus, GameEvents } from '../EventBus';

export class DashSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private coins: CoinManager;

  private meter = 0; // 0..1
  private active = false;
  private endsAt = 0;
  private lastTrailAt = 0;

  /** Optional hook so another system (Shadow) can re-apply its player tint
   *  once the dash's gold look is cleared. Set by GameScene. */
  refreshTintHook: (() => void) | null = null;

  constructor(scene: Phaser.Scene, player: Player, coins: CoinManager) {
    this.scene = scene;
    this.player = player;
    this.coins = coins;
  }

  reset(): void {
    this.meter = 0;
    this.active = false;
    this.endsAt = 0;
    this.player.sprite.setTexture('player');
    this.player.sprite.clearTint();
    this.refreshTintHook?.();
    this.emitMeter();
  }

  get isActive(): boolean {
    return this.active;
  }

  get isInvincible(): boolean {
    return this.active;
  }

  get speedMultiplier(): number {
    return this.active ? DASH.SPEED_MULTIPLIER : 1;
  }

  get isReady(): boolean {
    return this.meter >= DASH.ACTIVATE_THRESHOLD;
  }

  /** Coins call this to charge the meter. */
  addCharge(): void {
    if (this.active) return; // don't refill mid-dash
    this.meter = Phaser.Math.Clamp(this.meter + DASH.FILL_PER_COIN, 0, 1);
    this.emitMeter();
  }

  /** Player/UI requests a dash. Returns true if it fired. */
  tryActivate(now: number): boolean {
    if (this.active || !this.isReady) return false;
    this.active = true;
    this.endsAt = now + DASH.DURATION_MS;
    this.meter = 0;
    this.emitMeter();

    // Player goes gold. Clear any plane tint so the gold reads cleanly.
    this.player.sprite.setTexture('player-dash');
    this.player.sprite.clearTint();

    // Screen punch: brief zoom + gold flash + shockwave ring.
    this.scene.cameras.main.flash(160, 255, 242, 122, false);
    this.scene.cameras.main.shake(140, 0.006);
    this.spawnShockwave();

    EventBus.emit(GameEvents.DASH_ACTIVATED);
    this.emitMeter();
    return true;
  }

  private spawnShockwave(): void {
    const ring = this.scene.add
      .image(this.player.sprite.x, this.player.sprite.y - 24, 'shock-ring')
      .setDepth(25)
      .setTint(DASH.COLOR)
      .setScale(0.2)
      .setAlpha(0.9);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.6,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.out',
      onComplete: () => ring.destroy(),
    });
  }

  private spawnTrail(now: number): void {
    if (now - this.lastTrailAt < DASH.TRAIL_RATE_MS) return;
    this.lastTrailAt = now;
    const s = this.player.sprite;
    
    // Polished: More vibrant trail with better fade and slight scale
    const ghost = this.scene.add
      .image(s.x, s.y, s.texture.key)
      .setOrigin(s.originX, s.originY)
      .setDisplaySize(s.displayWidth, s.displayHeight)
      .setDepth(19)
      .setTint(DASH.COLOR)
      .setAlpha(0.7) // Start more visible
      .setScale(s.scaleX, s.scaleY); // Match current scale (squash/stretch)
    
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: s.scaleX * 0.85, // Shrink slightly for motion blur effect
      scaleY: s.scaleY * 0.85,
      duration: 300,
      ease: 'Cubic.out', // Smoother ease
      onComplete: () => ghost.destroy(),
    });
  }

  update(now: number, dt: number): void {
    if (!this.active) return;

    // Coin magnet toward the player.
    this.coins.applyMagnet(
      this.player.sprite.x,
      this.player.sprite.y,
      DASH.MAGNET_RADIUS,
      DASH.MAGNET_STRENGTH,
      dt
    );

    this.spawnTrail(now);

    if (now >= this.endsAt) {
      this.endDash();
    }
  }

  private endDash(): void {
    this.active = false;
    this.player.sprite.setTexture('player');
    // Restore the plane tint the dash overrode.
    this.refreshTintHook?.();
    EventBus.emit(GameEvents.DASH_CHANGED, this.meter);
  }

  private emitMeter(): void {
    EventBus.emit(GameEvents.DASH_CHANGED, this.meter);
  }
}
