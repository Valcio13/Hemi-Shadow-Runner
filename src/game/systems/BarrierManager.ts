/**
 * BarrierManager — tall, plane-locked walls that CANNOT be jumped.
 *
 * Barriers are the counterpart to obstacles: where an obstacle is cleared by
 * jumping, a barrier is cleared by phasing to the opposite plane (ShadowSystem).
 * A barrier only hurts you while you share its plane; on the other plane it's
 * rendered faint and is intangible (collision authority lives in GameScene,
 * which consults ShadowSystem.isTangible).
 *
 * Same engine as ObstacleManager: distance-based spawning + object pooling.
 * Each pooled sprite carries its plane on `getData('plane')`.
 */
import Phaser from 'phaser';
import { BARRIER, PLANE, SHADOW, VIEW, WORLD, type PlaneId } from '../config/GameConfig';

export class BarrierManager {
  private scene: Phaser.Scene;
  public readonly group: Phaser.Physics.Arcade.Group;

  // Obstacle group so a barrier never spawns on top of a ground obstacle.
  private obstacleGroup: Phaser.Physics.Arcade.Group | null = null;

  private distanceSinceLast = 0;
  private nextGap: number = BARRIER.GAP_START;
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

  /** Wire in obstacles so barrier spawns can avoid overlapping them. */
  setObstacleGroup(group: Phaser.Physics.Arcade.Group): void {
    this.obstacleGroup = group;
  }

  reset(): void {
    this.group.clear(true, true);
    this.distanceSinceLast = 0;
    this.rollNextGap(0);
  }

  private currentBaseGap(elapsed: number): number {
    return Math.max(
      BARRIER.GAP_MIN,
      BARRIER.GAP_START - elapsed * BARRIER.GAP_RAMP_PER_SEC
    );
  }

  private rollNextGap(elapsed: number): void {
    const base = this.currentBaseGap(elapsed);
    this.nextGap = base + Phaser.Math.Between(0, BARRIER.GAP_JITTER);
  }

  /**
   * @param distance px scrolled this frame
   * @param elapsed  seconds survived (difficulty)
   * @param playerPlane current plane, so live barriers can update their look
   */
  update(distance: number, elapsed: number, playerPlane: PlaneId): void {
    if (!this.active) return;

    this.distanceSinceLast += distance;
    if (this.distanceSinceLast >= this.nextGap) {
      // Only spawn if the entry column is clear of a ground obstacle; otherwise
      // a barrier's wide base visually swallows the obstacle. Retry next frame.
      if (this.entryColumnClear()) {
        this.spawnOne();
        this.distanceSinceLast = 0;
        this.rollNextGap(elapsed);
      }
    }

    const children = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const bar of children) {
      if (!bar.active) continue;
      bar.x -= distance;
      // Faint + intangible-looking when on the opposite (safe) plane.
      const plane = bar.getData('plane') as PlaneId;
      const shared = plane === playerPlane;
      bar.setAlpha(shared ? 1 : SHADOW.SAFE_ALPHA);
      if (bar.x < -bar.displayWidth) {
        this.recycle(bar);
      }
    }
  }

  /** True if no obstacle sits near the barrier's spawn column (with clearance). */
  private entryColumnClear(): boolean {
    if (!this.obstacleGroup) return true;
    const spawnX = VIEW.WIDTH + BARRIER.WIDTH;
    const minGap = BARRIER.WIDTH / 2 + BARRIER.OBSTACLE_CLEARANCE;
    const children =
      this.obstacleGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const obs of children) {
      if (!obs.active) continue;
      if (Math.abs(obs.x - spawnX) < minGap + obs.displayWidth / 2) return false;
    }
    return true;
  }

  private spawnOne(): void {
    // Alternate-ish planes with jitter so it isn't a predictable metronome.
    const plane: PlaneId = Math.random() < 0.5 ? PLANE.LIGHT : PLANE.SHADOW;
    const key = plane === PLANE.LIGHT ? 'barrier-light' : 'barrier-shadow';
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    const x = VIEW.WIDTH + BARRIER.WIDTH;
    const y = groundTop; // origin bottom-center → rises from the ground

    let bar = this.group.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (bar) {
      bar.setTexture(key);
      bar.setActive(true).setVisible(true);
      bar.setPosition(x, y);
    } else {
      bar = this.scene.physics.add.sprite(x, y, key);
      this.group.add(bar);
    }

    bar.setOrigin(0.5, 1);
    bar.setDisplaySize(BARRIER.WIDTH, BARRIER.HEIGHT);
    bar.setDepth(17);
    bar.setData('plane', plane);
    bar.setData('scored', false);

    const body = bar.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(BARRIER.WIDTH * BARRIER.HITBOX_SCALE_X, BARRIER.HEIGHT);
    body.setOffset((BARRIER.WIDTH * (1 - BARRIER.HITBOX_SCALE_X)) / 2, 0);
  }

  private recycle(bar: Phaser.Physics.Arcade.Sprite): void {
    bar.setActive(false).setVisible(false);
    (bar.body as Phaser.Physics.Arcade.Body).enable = false;
  }
}
