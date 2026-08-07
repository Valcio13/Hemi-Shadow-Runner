/**
 * PowerUpManager — spawns the three rare M8 collectibles, following the same
 * distance-scroll + object-pooling architecture as ObstacleManager/CoinManager.
 *
 * Design:
 *  - One pooled physics group holds all power-up sprites; each carries its
 *    `kind` on getData('kind').
 *  - Each kind has an independent randomized spawn timer. A kind won't spawn
 *    while its effect is active (or, for Recovery, while one is stored) — that
 *    "already-has-one" gate is owned by GameScene, queried via canSpawn().
 *  - Spawn placement avoids obstacles/barriers (clearance) so a power-up is
 *    never trapped in an impossible pattern, and only one power-up may be in
 *    flight at a time (MIN_SEPARATION_MS) so pickups never cluster.
 *
 * Collection + effect application live in GameScene (single source of truth for
 * score/time/state), exactly like coin collection. This manager only handles
 * spawning, motion, pooling, and the idle bob/rotate visuals.
 * 
 * Uses SeededRNG for deterministic spawning when playing on-chain games.
 */
import Phaser from 'phaser';
import { POWERUP, VIEW, WORLD } from '../config/GameConfig';
import type { SeededRNG } from './SeededRNG';

export type PowerUpKind = 'genesis' | 'chrono' | 'recovery';

interface KindTimer {
  kind: PowerUpKind;
  key: string;
  nextAt: number; // scene time (ms) of next eligible spawn
  spawnMin: number;
  spawnMax: number;
}

export class PowerUpManager {
  private scene: Phaser.Scene;
  public readonly group: Phaser.Physics.Arcade.Group;

  private obstacleGroup: Phaser.Physics.Arcade.Group | null = null;
  private barrierGroup: Phaser.Physics.Arcade.Group | null = null;

  private active = false;
  private timers: KindTimer[] = [];
  // Timestamp of the last spawn of ANY power-up, to enforce separation.
  private lastSpawnAt = -Infinity;
  // Gate callback: GameScene decides if a kind may spawn right now (not active
  // / not already stored). Keeps effect-state ownership in one place.
  private canSpawn: (kind: PowerUpKind) => boolean = () => true;
  
  // RNG reference from GameScene
  private getRNG: () => SeededRNG;

  constructor(scene: Phaser.Scene, getRNG: () => SeededRNG) {
    this.scene = scene;
    this.getRNG = getRNG;
    this.group = scene.physics.add.group({ allowGravity: false });
  }

  setObstacleGroups(
    obstacles: Phaser.Physics.Arcade.Group,
    barriers: Phaser.Physics.Arcade.Group
  ): void {
    this.obstacleGroup = obstacles;
    this.barrierGroup = barriers;
  }

  setSpawnGate(fn: (kind: PowerUpKind) => boolean): void {
    this.canSpawn = fn;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  reset(now: number): void {
    // Recycle first so follow-emitters are torn down before sprites are destroyed.
    const kids = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const pu of [...kids]) this.recycle(pu);
    this.group.clear(true, true);
    this.lastSpawnAt = -Infinity;
    this.timers = [
      {
        kind: 'genesis',
        key: POWERUP.GENESIS.key,
        spawnMin: POWERUP.GENESIS.SPAWN_MIN_MS,
        spawnMax: POWERUP.GENESIS.SPAWN_MAX_MS,
        nextAt: 0,
      },
      {
        kind: 'chrono',
        key: POWERUP.CHRONO.key,
        spawnMin: POWERUP.CHRONO.SPAWN_MIN_MS,
        spawnMax: POWERUP.CHRONO.SPAWN_MAX_MS,
        nextAt: 0,
      },
      {
        kind: 'recovery',
        key: POWERUP.RECOVERY.key,
        spawnMin: POWERUP.RECOVERY.SPAWN_MIN_MS,
        spawnMax: POWERUP.RECOVERY.SPAWN_MAX_MS,
        nextAt: 0,
      },
    ];
    for (const t of this.timers) this.rollNext(t, now);
  }

  private rollNext(t: KindTimer, now: number): void {
    const rng = this.getRNG();
    t.nextAt = now + rng.nextInt(t.spawnMin, t.spawnMax + 1);
  }

  /**
   * @param distance px scrolled this frame
   * @param now      scene time (ms)
   */
  update(distance: number, now: number): void {
    if (!this.active) return;

    // Spawn checks (each kind independent, but respect global separation).
    for (const t of this.timers) {
      if (now < t.nextAt) continue;
      if (now - this.lastSpawnAt < POWERUP.MIN_SEPARATION_MS) continue;
      if (!this.canSpawn(t.kind)) {
        // Effect active / already stored — retry a bit later, don't spam.
        t.nextAt = now + 2000;
        continue;
      }
      const y = this.pickClearY();
      if (y === null) {
        t.nextAt = now + 800; // column blocked; retry shortly
        continue;
      }
      this.spawn(t.kind, t.key, y);
      this.lastSpawnAt = now;
      this.rollNext(t, now);
    }

    // Move + recycle live power-ups.
    const children = this.group.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const pu of children) {
      if (!pu.active) continue;
      pu.x -= distance;
      pu.rotation += 0.04; // slow rotate for life
      if (pu.x < -pu.displayWidth) this.recycle(pu);
    }
  }

  /**
   * Find a spawn Y whose entry column is clear of obstacles/barriers. Returns
   * null if the column is currently blocked (caller retries next frame).
   */
  private pickClearY(): number | null {
    const spawnX = VIEW.WIDTH + 40;
    // Reject if any obstacle/barrier is near the spawn column.
    const blocked = (grp: Phaser.Physics.Arcade.Group | null): boolean => {
      if (!grp) return false;
      const kids = grp.getChildren() as Phaser.Physics.Arcade.Sprite[];
      for (const o of kids) {
        if (!o.active) continue;
        if (Math.abs(o.x - spawnX) < POWERUP.OBSTACLE_CLEARANCE + o.displayWidth / 2) {
          return true;
        }
      }
      return false;
    };
    if (blocked(this.obstacleGroup) || blocked(this.barrierGroup)) return null;
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    const rng = this.getRNG();
    const offset = rng.nextInt(POWERUP.MIN_Y, POWERUP.MAX_Y + 1);
    return groundTop - offset;
  }

  private spawn(kind: PowerUpKind, key: string, y: number): void {
    const x = VIEW.WIDTH + 40;
    let pu = this.group.getFirstDead(false) as Phaser.Physics.Arcade.Sprite | null;
    if (pu) {
      pu.setTexture(key);
      pu.setActive(true).setVisible(true);
      pu.setPosition(x, y);
    } else {
      pu = this.scene.physics.add.sprite(x, y, key);
      this.group.add(pu);
    }
    pu.setDepth(19);
    pu.setRotation(0);
    pu.setData('kind', kind);
    const body = pu.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    const rad = pu.displayWidth * 0.4;
    body.setCircle(rad, pu.width / 2 - rad, pu.height / 2 - rad);

    // Gentle vertical bob for life; killed on recycle.
    this.scene.tweens.add({
      targets: pu,
      y: y - 12,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.inOut',
    });

    // Per-kind sparkle particles so each power-up reads as "rare/special".
    this.emitSparkle(pu, kind);
  }

  /**
   * Attach a short-lived sparkle emitter that follows the power-up. Reuses the
   * existing 'sparkle' texture; tinted per kind. Destroyed with the sprite on
   * recycle so no emitters leak across the pool.
   */
  private emitSparkle(pu: Phaser.Physics.Arcade.Sprite, kind: PowerUpKind): void {
    const tint =
      kind === 'genesis'
        ? POWERUP.GENESIS.COLOR_GLOW
        : kind === 'chrono'
          ? POWERUP.CHRONO.COLOR_GLOW
          : POWERUP.RECOVERY.COLOR_GLOW;
    
    // Polished: More magical/rare feel with better motion
    const em = this.scene.add.particles(0, 0, 'sparkle', {
      speed: { min: 15, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 600,
      frequency: 90, // Slightly faster emission
      quantity: 2, // More particles per emission
      tint: [tint, 0xffffff], // Mix of color + white sparkles
      blendMode: Phaser.BlendModes.ADD, // Glow effect
      rotate: { min: 0, max: 360 }, // Particles spin
      gravityY: -20, // Float upward slightly
    });
    em.setDepth(18);
    em.startFollow(pu);
    pu.setData('emitter', em);
  }

  /**
   * Force-spawn a kind immediately, bypassing timers. Used for runtime
   * verification of power-up effects (spawn windows are 45s–3min otherwise).
   */
  debugSpawn(kind: PowerUpKind): boolean {
    const t = this.timers.find((x) => x.kind === kind);
    if (!t) return false;
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    this.spawn(kind, t.key, groundTop - POWERUP.MIN_Y);
    return true;
  }

  /** Collect a power-up sprite: recycle it and report which kind it was. */
  collect(pu: Phaser.Physics.Arcade.Sprite): PowerUpKind | null {
    if (!pu.active) return null;
    const kind = pu.getData('kind') as PowerUpKind;
    this.recycle(pu);
    return kind;
  }

  private recycle(pu: Phaser.Physics.Arcade.Sprite): void {
    this.scene.tweens.killTweensOf(pu);
    // Tear down the follow-emitter so pooled sprites don't accumulate emitters.
    const em = pu.getData('emitter') as
      | Phaser.GameObjects.Particles.ParticleEmitter
      | undefined;
    if (em) {
      em.stop();
      em.destroy();
      pu.setData('emitter', undefined);
    }
    pu.setActive(false).setVisible(false);
    pu.setRotation(0);
    (pu.body as Phaser.Physics.Arcade.Body).enable = false;
  }
}
