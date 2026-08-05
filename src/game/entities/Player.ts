/**
 * Player — the runner. Fixed horizontal screen position; the world scrolls
 * past it. Handles jump physics with coyote-time and jump-buffering so the
 * one-button control feels forgiving and responsive.
 */
import Phaser from 'phaser';
import { PLAYER, VIEW, WORLD } from '../config/GameConfig';

export class Player {
  public readonly sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;

  private lastGroundedAt = 0;
  private lastJumpPressedAt = -Infinity;
  private isDead = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    this.sprite = scene.physics.add.sprite(
      PLAYER.SCREEN_X,
      groundTop - PLAYER.HEIGHT,
      'player'
    );
    this.sprite.setDisplaySize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.sprite.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setDepth(20);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(WORLD.GRAVITY_Y - scene.physics.world.gravity.y);
    body.setAllowGravity(true);
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get isOnGround(): boolean {
    // Only the static ground body counts as "ground". We check blocked.down
    // (set by collisions with immovable/static bodies) rather than touching.down,
    // because coins are movable overlap bodies that would otherwise set
    // touching.down and be misread as a floor — the source of the old
    // accidental coin double-jump. Coin bounces are now driven explicitly via
    // coinHop() instead.
    return this.body.blocked.down;
  }

  /** Called by input systems when the jump control is pressed. */
  queueJump(now: number): void {
    this.lastJumpPressedAt = now;
  }

  /**
   * Coin-hop: an upward bounce when a coin is collected mid-air — but ONLY if
   * the player is actively asking to jump (a jump press buffered within the
   * grace window). This makes the hop a deliberate choice: press jump as you
   * hit a coin to bounce off it, or stay silent to just collect and keep
   * falling. Grounded pickups never bounce. The buffered press is consumed so
   * one tap yields at most one hop.
   */
  coinHop(now: number): boolean {
    if (this.isDead || this.isOnGround) return false;
    const wantsHop = now - this.lastJumpPressedAt <= PLAYER.JUMP_BUFFER_MS;
    if (!wantsHop) return false;
    this.lastJumpPressedAt = -Infinity; // consume the press
    this.body.setVelocityY(PLAYER.COIN_HOP_VELOCITY);
    this.scene.events.emit('player:jumped');
    return true;
  }

  update(now: number): void {
    if (this.isDead) return;

    if (this.isOnGround) {
      this.lastGroundedAt = now;
    }

    const withinCoyote = now - this.lastGroundedAt <= PLAYER.COYOTE_MS;
    const bufferedJump = now - this.lastJumpPressedAt <= PLAYER.JUMP_BUFFER_MS;

    if (bufferedJump && withinCoyote) {
      this.performJump();
      // Consume both so we can't chain a second jump from one press.
      this.lastJumpPressedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
    }

    // Squash & stretch for game feel: tall on the way up, flat on the way down.
    const vy = this.body.velocity.y;
    if (!this.isOnGround) {
      const stretch = Phaser.Math.Clamp(1 + vy * -0.00025, 0.82, 1.18);
      this.sprite.setScale(
        (PLAYER.WIDTH / this.sprite.width) * (2 - stretch),
        (PLAYER.HEIGHT / this.sprite.height) * stretch
      );
    } else {
      this.sprite.setDisplaySize(PLAYER.WIDTH, PLAYER.HEIGHT);
    }
  }

  private performJump(): void {
    this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
    this.scene.events.emit('player:jumped');
  }

  setDead(dead: boolean): void {
    this.isDead = dead;
    if (dead) {
      this.body.setVelocity(0, 0);
      this.body.setAllowGravity(false);
    }
  }

  reset(): void {
    this.isDead = false;
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    this.sprite.setPosition(PLAYER.SCREEN_X, groundTop - PLAYER.HEIGHT);
    this.sprite.setDisplaySize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.body.setAllowGravity(true);
    this.body.setVelocity(0, 0);
    this.lastGroundedAt = 0;
    this.lastJumpPressedAt = -Infinity;
  }
}
