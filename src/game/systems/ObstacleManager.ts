/**
 * ObstacleManager — spawns, moves, and recycles obstacles.
 *
 * Design choices:
 * - Distance-based spawning (not timers). We track how far the world has
 *   scrolled and drop a new obstacle once we've covered the target gap. This
 *   keeps obstacle spacing consistent regardless of frame rate or speed, and
 *   couples difficulty directly to the world speed.
 * - Object pooling via a physics group. Off-screen obstacles are deactivated
 *   and reused instead of destroyed, so there's zero per-spawn GC churn.
 * - Gaps are clamped to a minimum that a running jump can always clear, so the
 *   game never generates an impossible sequence.
 */
import Phaser from 'phaser';
import { OBSTACLE, VIEW, WORLD } from '../config/GameConfig';

export class ObstacleManager {
  private scene: Phaser.Scene;
  public readonly group: Phaser.Physics.Arcade.Group;

  private distanceSinceLast = 0;
  private nextGap: number = OBSTACLE.GAP_START;
  private active = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.rollNextGap(0);
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  reset(): void {
    this.group.clear(true, true);
    this.distanceSinceLast = 0;
    this.rollNextGap(0);
  }

  /** Current target gap, tightening with survival time but never below GAP_MIN. */
  private currentBaseGap(elapsed: number): number {
    return Math.max(
      OBSTACLE.GAP_MIN,
      OBSTACLE.GAP_START - elapsed * OBSTACLE.GAP_RAMP_PER_SEC
    );
  }

  private rollNextGap(elapsed: number): void {
    const base = this.currentBaseGap(elapsed);
    this.nextGap = base + Phaser.Math.Between(0, OBSTACLE.GAP_JITTER);
  }

  /**
   * @param distance  px the world scrolled this frame (speed * dt)
   * @param elapsed   seconds survived, for difficulty
   */
  update(distance: number, elapsed: number): void {
    if (!this.active) return;

    this.distanceSinceLast += distance;
    if (this.distanceSinceLast >= this.nextGap) {
      this.spawnOne();
      this.distanceSinceLast = 0;
      this.rollNextGap(elapsed);
    }

    // Move + recycle every live obstacle.
    const children = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const obs of children) {
      if (!obs.active) continue;
      obs.x -= distance;
      if (obs.x < -obs.displayWidth) {
        this.recycle(obs);
      }
    }
  }

  private spawnOne(): void {
    const type = Phaser.Utils.Array.GetRandom(
      OBSTACLE.TYPES as unknown as (typeof OBSTACLE.TYPES)[number][]
    );
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    const x = VIEW.WIDTH + type.width;
    const y = groundTop; // origin bottom-center → sits on ground

    let obs = this.group.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (obs) {
      obs.setTexture(type.key);
      obs.setActive(true).setVisible(true);
      obs.setPosition(x, y);
    } else {
      obs = this.scene.physics.add.sprite(x, y, type.key);
      this.group.add(obs);
    }

    obs.setOrigin(0.5, 1);
    obs.setDisplaySize(type.width, type.height);
    obs.setDepth(18);
    const body = obs.body as Phaser.Physics.Arcade.Body;
    body.enable = true; // re-enable if this sprite came from the recycle pool
    body.setAllowGravity(false);
    body.setImmovable(true);
    // Tighten the hitbox slightly so grazes feel fair, not punishing.
    body.setSize(type.width * 0.8, type.height * 0.9);
    body.setOffset(type.width * 0.1, type.height * 0.1);
  }

  private recycle(obs: Phaser.Physics.Arcade.Sprite): void {
    obs.setActive(false).setVisible(false);
    // Disable the body so a dead obstacle can't register collisions; the
    // spawn path re-enables it when the sprite is pulled from the pool.
    (obs.body as Phaser.Physics.Arcade.Body).enable = false;
  }
}
