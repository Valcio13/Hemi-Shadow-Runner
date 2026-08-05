/**
 * CoinManager — spawns coins in clusters, moves them, and handles collection.
 *
 * Mirrors ObstacleManager's design: distance-based spawning + object pooling.
 * Coins arrive in short clusters (rows on the ground or gentle arcs in the air)
 * so collecting feels like a deliberate line to trace, not random scatter.
 *
 * Collection produces a sparkle burst and a floating "+N" score popup for the
 * "game feel" checklist. Overlap detection is owned by GameScene.
 */
import Phaser from 'phaser';
import { COIN, VIEW, WORLD } from '../config/GameConfig';

export class CoinManager {
  private scene: Phaser.Scene;
  public readonly group: Phaser.Physics.Arcade.Group;
  private sparkle: Phaser.GameObjects.Particles.ParticleEmitter;

  // Optional obstacle group so coins can avoid spawning inside an obstacle.
  private obstacleGroup: Phaser.Physics.Arcade.Group | null = null;

  private distanceSinceLast = 0;
  private nextGap: number = COIN.GAP_START;
  private active = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ allowGravity: false });

    this.sparkle = scene.add.particles(0, 0, 'sparkle', {
      speed: { min: 40, max: 130 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 360,
      quantity: 8,
      tint: [0xffa34d, 0xff6c15, 0xffffff],
      emitting: false,
    });
    this.sparkle.setDepth(22);
    this.rollNextGap();
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  /** Wire in the obstacle group so coins can avoid spawning on top of one. */
  setObstacleGroup(group: Phaser.Physics.Arcade.Group): void {
    this.obstacleGroup = group;
  }

  reset(): void {
    this.group.clear(true, true);
    this.distanceSinceLast = 0;
    this.rollNextGap();
  }

  private rollNextGap(): void {
    this.nextGap = COIN.GAP_START + Phaser.Math.Between(0, COIN.GAP_JITTER);
  }

  update(distance: number): void {
    if (!this.active) return;

    this.distanceSinceLast += distance;
    if (this.distanceSinceLast >= this.nextGap) {
      this.spawnCluster();
      this.distanceSinceLast = 0;
      this.rollNextGap();
    }

    const children = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const coin of children) {
      if (!coin.active) continue;
      coin.x -= distance;
      // Remember how far the world scrolled this frame so the magnet can cancel
      // it out for coins it's actively pulling (see applyMagnet).
      coin.setData('scrolledBy', distance);
      // Cull coins that overlap an obstacle while still at/near the right edge
      // (an obstacle can spawn a few frames after a coin at the same X). We do
      // it before the coin is well into view so the removal reads as "never
      // there" rather than a coin vanishing mid-screen.
      if (coin.x > VIEW.WIDTH - COIN.SPACING && this.collidesWithObstacle(coin.x, coin.y)) {
        this.recycle(coin);
        continue;
      }
      if (coin.x < -coin.displayWidth) {
        this.recycle(coin);
      }
    }
  }

  /**
   * Coin magnet (dash only). Pulls live coins within `radius` toward (tx, ty).
   * Actual collection still happens via GameScene's overlap handler once a coin
   * reaches the player, so scoring stays in one place.
   *
   * Critically, a magnetized coin FIRST has this frame's world scroll cancelled
   * (the scroll already moved it left in update()), so the magnet — not the
   * scroll — has full control. Without this, during dash the world scrolls
   * faster than the magnet can pull, and attracted coins get left behind.
   */
  applyMagnet(
    tx: number,
    ty: number,
    radius: number,
    strength: number,
    dt: number
  ): void {
    const r2 = radius * radius;
    const children = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const coin of children) {
      if (!coin.active) continue;
      const dx = tx - coin.x;
      const dy = ty - coin.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      // Cancel the world scroll applied this frame so the magnet fully owns the
      // coin's motion and it can't be dragged away faster than it's pulled.
      const scrolledBy = (coin.getData('scrolledBy') as number) ?? 0;
      coin.x += scrolledBy;
      // Strong pull that ramps up as the coin nears the player for a snappy
      // "vacuum" feel. Uses the post-scroll-cancel delta.
      const ndx = tx - coin.x;
      const ndy = ty - coin.y;
      const nd = Math.max(1, Math.hypot(ndx, ndy));
      const pull = strength * (1 - Math.min(1, nd / radius) * 0.5) * dt;
      coin.x += (ndx / nd) * pull;
      coin.y += (ndy / nd) * pull;
    }
  }

  private spawnCluster(): void {
    const count = Phaser.Math.Between(COIN.CLUSTER_MIN, COIN.CLUSTER_MAX);
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    const startX = VIEW.WIDTH + COIN.RADIUS * 2;

    // Randomly pick a flat row or a jump-arc for this cluster.
    const isArc = Math.random() < 0.5;
    const baseY = Phaser.Math.Between(COIN.LOW_Y, COIN.HIGH_Y);

    for (let i = 0; i < count; i++) {
      const x = startX + i * COIN.SPACING;
      let y: number;
      if (isArc) {
        // Parabolic arc peaking mid-cluster, matching a natural jump path.
        const t = count > 1 ? i / (count - 1) : 0.5;
        const arc = Math.sin(t * Math.PI); // 0..1..0
        y = groundTop - (COIN.LOW_Y + arc * (COIN.HIGH_Y - COIN.LOW_Y));
      } else {
        y = groundTop - baseY;
      }
      // Skip any coin that would sit inside an obstacle's column — otherwise a
      // ground-row coin can render on top of a tall spike, which looks like a
      // free coin sitting on a hazard.
      if (this.collidesWithObstacle(x, y)) continue;
      this.spawnOne(x, y);
    }
  }

  /**
   * True if a coin centered at (x, y) — in obstacle spawn-space, i.e. the same
   * pre-scroll X the obstacle manager uses — would overlap a pending or live
   * obstacle. We compare against each obstacle's current X plus a small pad so
   * coins clear the hitbox with margin.
   */
  private collidesWithObstacle(x: number, y: number): boolean {
    if (!this.obstacleGroup) return false;
    const pad = COIN.RADIUS + COIN.OBSTACLE_CLEARANCE;
    const children =
      this.obstacleGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const obs of children) {
      if (!obs.active) continue;
      // Both coin (startX) and obstacle share the same rightward spawn edge, so
      // their X values are directly comparable in screen space at spawn time.
      const halfW = obs.displayWidth / 2 + pad;
      const withinX = Math.abs(obs.x - x) < halfW;
      if (!withinX) continue;
      // Obstacle spans from its top (y - height) to the ground (origin bottom).
      const obsTop = obs.y - obs.displayHeight - pad;
      if (y > obsTop) return true; // coin is at/below the obstacle's top → inside
    }
    return false;
  }

  private spawnOne(x: number, y: number): void {
    let coin = this.group.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (coin) {
      coin.setActive(true).setVisible(true);
      coin.setPosition(x, y);
    } else {
      coin = this.scene.physics.add.sprite(x, y, 'coin');
      this.group.add(coin);
    }
    coin.setDepth(16);
    const body = coin.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setCircle(COIN.RADIUS);

    // Gentle bob + spin-ish pulse for life. Stored per-coin tween killed on recycle.
    coin.setScale(1);
    this.scene.tweens.add({
      targets: coin,
      scaleX: 0.82,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: 'Sine.inOut',
    });
  }

  /** Called by GameScene's overlap handler. Returns true if a coin was taken. */
  collect(coin: Phaser.Physics.Arcade.Sprite, multiplier = 1): boolean {
    if (!coin.active) return false;
    this.sparkle.emitParticleAt(coin.x, coin.y, 8);
    this.spawnFloatingScore(coin.x, coin.y, multiplier);
    this.recycle(coin);
    return true;
  }

  private spawnFloatingScore(x: number, y: number, multiplier: number): void {
    const value = Math.round(COIN.SCORE_VALUE * multiplier);
    const label = this.scene.add
      .text(x, y, `+${value}`, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        color: multiplier > 1 ? '#ffd447' : '#ffa34d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.scene.tweens.add({
      targets: label,
      y: y - 44,
      alpha: 0,
      duration: 620,
      ease: 'Cubic.out',
      onComplete: () => label.destroy(),
    });
  }

  private recycle(coin: Phaser.Physics.Arcade.Sprite): void {
    this.scene.tweens.killTweensOf(coin);
    coin.setActive(false).setVisible(false);
    coin.setScale(1);
    (coin.body as Phaser.Physics.Arcade.Body).enable = false;
  }
}
