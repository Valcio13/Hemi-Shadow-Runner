/**
 * GameScene — the gameplay core.
 *
 * Milestone 1: scrolling ground, running player, responsive jump, landing dust,
 * camera shake.
 * Milestone 2: endless obstacle spawning, collision, and the death sequence
 * (hit flash + slow-motion + shake, then GAME_OVER).
 *
 * Later milestones bolt systems onto this scene (coins, dash, shadow) without
 * rewriting what's here.
 */
import Phaser from 'phaser';
import {
  DEATH,
  MENU,
  POWERUP,
  SPEED,
  TIMESTEP,
  VIEW,
  WORLD,
} from '../config/GameConfig';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { ObstacleManager } from '../systems/ObstacleManager';
import { CoinManager } from '../systems/CoinManager';
import { BarrierManager } from '../systems/BarrierManager';
import { ShadowSystem } from '../systems/ShadowSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ScoreManager } from '../systems/ScoreManager';
import { DashSystem } from '../systems/DashSystem';
import { PowerUpManager, type PowerUpKind } from '../systems/PowerUpManager';
import { SeededRNG } from '../systems/SeededRNG';
import { EventBus, GameEvents } from '../EventBus';
import { registerGameControls, unregisterGameControls } from '../GameController';

type RunState = 'idle' | 'running' | 'dying' | 'over';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  private inputSystem!: InputSystem;
  private obstacles!: ObstacleManager;
  private coins!: CoinManager;
  private barriers!: BarrierManager;
  private shadow!: ShadowSystem;
  private audio!: AudioSystem;
  private scoring!: ScoreManager;
  private dash!: DashSystem;
  private powerups!: PowerUpManager;
  private dashKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private ground!: Phaser.GameObjects.TileSprite;
  private groundBody!: Phaser.GameObjects.Rectangle;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  private speed: number = SPEED.START;
  private elapsed = 0;
  private wasOnGround = true;
  private state: RunState = 'idle';

  // --- Power-up effect state (M8). Timestamps are scene time (ms).
  private genesisUntil = 0; // Genesis Shard: 2x score active until this time
  private chronoUntil = 0; // Chrono Fragment: world slowdown until this time
  private hasRecovery = false; // Recovery Protocol stored (max one)
  private invulnUntil = 0; // post-revive invulnerability until this time
  private chronoTint?: Phaser.GameObjects.Rectangle; // blue screen tint overlay
  
  // Seeded RNG for deterministic gameplay
  private rng!: SeededRNG;
  private currentSeed: number = 0;

  constructor() {
    super('GameScene');
    // Initialize RNG with a temporary seed (will be reset on startRun)
    this.rng = new SeededRNG(Date.now() >>> 0);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(VIEW.BACKGROUND);

    // --- Ground: a TileSprite we scroll horizontally to fake forward motion.
    const groundTop = VIEW.HEIGHT - WORLD.GROUND_HEIGHT;
    this.ground = this.add
      .tileSprite(0, groundTop, VIEW.WIDTH, WORLD.GROUND_HEIGHT, 'ground')
      .setOrigin(0, 0)
      .setDepth(5);

    // Invisible static physics body the player lands on.
    this.groundBody = this.add.rectangle(
      VIEW.WIDTH / 2,
      groundTop + WORLD.GROUND_HEIGHT / 2,
      VIEW.WIDTH,
      WORLD.GROUND_HEIGHT
    );
    this.physics.add.existing(this.groundBody, true);

    // --- Player + input
    this.player = new Player(this);
    this.inputSystem = new InputSystem(this, this.player);
    this.physics.add.collider(this.player.sprite, this.groundBody);

    // --- Scoring
    this.scoring = new ScoreManager();

    // --- Obstacles + collision
    this.obstacles = new ObstacleManager(this, () => this.rng);
    this.physics.add.overlap(
      this.player.sprite,
      this.obstacles.group,
      this.onHitObstacle,
      undefined,
      this
    );

    // --- Coins + collection
    this.coins = new CoinManager(this, () => this.rng);
    // Give coins awareness of obstacles so they never spawn on top of a hazard.
    this.coins.setObstacleGroup(this.obstacles.group);
    this.physics.add.overlap(
      this.player.sprite,
      this.coins.group,
      this.onCollectCoin,
      undefined,
      this
    );

    // --- Shadow planes (the phase mechanic) + plane-locked barriers
    this.shadow = new ShadowSystem(this, this.player);
    this.audio = new AudioSystem();
    this.barriers = new BarrierManager(this, () => this.rng);
    // Barriers avoid spawning on top of ground obstacles.
    this.barriers.setObstacleGroup(this.obstacles.group);
    this.physics.add.overlap(
      this.player.sprite,
      this.barriers.group,
      this.onHitBarrier,
      // Process callback: only treat as a hit when the barrier shares our plane.
      (_p, barObj) => {
        const bar = barObj as Phaser.Physics.Arcade.Sprite;
        return this.shadow.isTangible(bar.getData('plane'));
      },
      this
    );

    // --- Dash (meter, invincibility, magnet, FX)
    this.dash = new DashSystem(this, this.player, this.coins);
    // When a dash ends/resets it clears the gold tint; Shadow re-applies its
    // plane tint through this hook.
    this.dash.refreshTintHook = () => this.shadow.refreshPlayerTint();
    this.dashKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.dashKey.on('down', () => this.tryDash());

    // --- Power-ups (M8): pooled rare collectibles. Effect state lives here so
    // score/time/revival stay single-sourced. Gate spawns on effect state.
    this.powerups = new PowerUpManager(this, () => this.rng);
    this.powerups.setObstacleGroups(this.obstacles.group, this.barriers.group);
    this.powerups.setSpawnGate((kind) => this.canSpawnPowerUp(kind));
    this.physics.add.overlap(
      this.player.sprite,
      this.powerups.group,
      this.onCollectPowerUp,
      undefined,
      this
    );

    // Blue screen tint for the Chrono effect (hidden until active).
    this.chronoTint = this.add
      .rectangle(0, 0, VIEW.WIDTH, VIEW.HEIGHT, 0x4de1ff, 0)
      .setOrigin(0, 0)
      .setDepth(28);

    // --- Phase toggle: SHIFT (or F). Swap planes to pass barriers.
    this.shiftKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );
    this.shiftKey.on('down', () => this.tryPhase());
    this.input.keyboard!
      .addKey(Phaser.Input.Keyboard.KeyCodes.F)
      .on('down', () => this.tryPhase());
    // Right-click / two-finger also phases, so touch players get both verbs.
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.rightButtonDown()) this.tryPhase();
    });

    // --- Mute toggle: M key. React HUD button routes here too.
    this.input.keyboard!
      .addKey(Phaser.Input.Keyboard.KeyCodes.M)
      .on('down', () => this.audio.toggleMute());

    // --- Landing dust emitter (starts off; bursts on touchdown)
    this.dust = this.add.particles(0, 0, 'dust', {
      speed: { min: 60, max: 160 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 380,
      quantity: 10,
      tint: 0x9fb4d8,
      emitting: false,
    });
    this.dust.setDepth(15);

    this.events.on('player:jumped', this.onJump, this);

    // Let React command the game (Play Again, Start).
    registerGameControls({
      restart: () => this.startRun(),
      start: (gameSeed?: number) => this.startRun(gameSeed),
      mainMenu: () => this.showMenu(),
      dash: () => this.tryDash(),
      phase: () => this.tryPhase(),
      toggleMute: () => this.audio.toggleMute(),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unregisterGameControls();
    });

    // Publish initial mute state so the HUD icon matches persisted preference.
    this.audio.emitState();

    // M9: no auto-start. Enter attract mode and let the React main menu drive
    // the first run via requestStart().
    this.showMenu();

    EventBus.emit(GameEvents.READY, this);
  }

  /**
   * Enter attract mode: the world scrolls slowly behind the main menu, but no
   * hazards spawn, scoring is idle, and player input is disabled. Called on
   * boot and when returning from the game-over screen.
   */
  showMenu(): void {
    this.state = 'idle';
    this.speed = SPEED.START;
    this.elapsed = 0;
    this.wasOnGround = true;
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    this.tweens.timeScale = 1;

    // Clear any leftover run state so the menu backdrop is clean.
    this.player.reset();
    this.player.setDead(false);
    this.obstacles.setActive(false);
    this.obstacles.reset();
    this.coins.setActive(false);
    this.coins.reset();
    this.barriers.setActive(false);
    this.barriers.reset();
    this.powerups.setActive(false);
    this.powerups.reset(this.time.now);
    this.shadow.reset();
    this.scoring.reset();
    this.dash.reset();

    this.genesisUntil = 0;
    this.chronoUntil = 0;
    this.hasRecovery = false;
    this.invulnUntil = 0;
    this.chronoTint?.setAlpha(0);

    // Menu owns input; the player shouldn't be able to jump behind the overlay.
    this.inputSystem.setEnabled(false);
    EventBus.emit(GameEvents.MENU_SHOWN);
  }

  private startRun(gameSeed?: number): void {
    // Initialize or re-initialize the RNG with the provided seed
    if (gameSeed !== undefined) {
      this.currentSeed = gameSeed;
      console.log('🎲 Starting game with on-chain seed:', gameSeed);
    } else {
      // Offline mode: use timestamp as seed for variety
      this.currentSeed = Date.now() >>> 0;
      console.log('🎲 Starting offline game with timestamp seed:', this.currentSeed);
    }
    
    // Create new SeededRNG instance
    this.rng = new SeededRNG(this.currentSeed);
    
    this.state = 'running';
    this.speed = SPEED.START;
    this.elapsed = 0;
    this.wasOnGround = true;
    this.time.timeScale = 1;
    this.physics.world.timeScale = 1;
    this.tweens.timeScale = 1;
    this.player.reset();
    this.obstacles.reset();
    this.obstacles.setActive(true);
    this.coins.reset();
    this.coins.setActive(true);
    this.barriers.reset();
    this.barriers.setActive(true);
    this.shadow.reset();
    this.scoring.reset();
    this.dash.reset();
    // Reset power-up state + spawners.
    this.genesisUntil = 0;
    this.chronoUntil = 0;
    this.hasRecovery = false;
    this.invulnUntil = 0;
    this.chronoTint?.setAlpha(0);
    this.powerups.reset(this.time.now);
    this.powerups.setActive(true);
    EventBus.emit(GameEvents.GENESIS_CHANGED, 0);
    EventBus.emit(GameEvents.CHRONO_CHANGED, 0);
    EventBus.emit(GameEvents.RECOVERY_CHANGED, false);
    this.inputSystem.setEnabled(true);
    EventBus.emit(GameEvents.GAME_STARTED);
  }

  /** Public restart entry for the React "Play Again" button (M3+). */
  restart(): void {
    this.startRun();
  }

  private onJump(): void {
    if (this.state !== 'running') return;
    this.dust.emitParticleAt(this.player.sprite.x, this.player.sprite.y, 6);
    this.audio.play('JUMP');
  }

  private onLand(): void {
    this.dust.emitParticleAt(this.player.sprite.x, this.player.sprite.y, 12);
    // Subtle shake scaled small so it reads as "weight", not "earthquake".
    this.cameras.main.shake(90, 0.004);
    this.audio.play('LAND');
  }

  private onHitObstacle: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    obstacleObj
  ) => {
    if (this.state !== 'running') return;
    // Post-revive invulnerability: pass through hazards briefly.
    if (this.time.now < this.invulnUntil) return;
    // Dash grants invincibility: smash through the obstacle instead of dying.
    if (this.dash.isInvincible) {
      const obs = obstacleObj as Phaser.Physics.Arcade.Sprite;
      this.smashObstacle(obs);
      return;
    }
    this.die();
  };

  /** Dash plows through an obstacle: knock it away with a little burst. */
  private smashObstacle(obs: Phaser.Physics.Arcade.Sprite): void {
    this.dust.emitParticleAt(obs.x, obs.y - obs.displayHeight / 2, 10);
    this.cameras.main.shake(80, 0.005);
    this.audio.play('SMASH');
    this.tweens.add({
      targets: obs,
      y: obs.y - 120,
      angle: this.rng.nextInt(-180, 180),
      alpha: 0,
      duration: 300,
      ease: 'Cubic.out',
      onComplete: () => {
        obs.setActive(false).setVisible(false);
        obs.setAlpha(1).setAngle(0);
        (obs.body as Phaser.Physics.Arcade.Body).enable = false;
      },
    });
  }

  private onCollectCoin: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    coinObj
  ) => {
    if (this.state !== 'running') return;
    const coin = coinObj as Phaser.Physics.Arcade.Sprite;
    // Pass the current multiplier so the floating score shows the actual value
    const multiplier = this.time.now < this.genesisUntil ? POWERUP.GENESIS.MULTIPLIER : 1;
    if (this.coins.collect(coin, multiplier)) {
      this.scoring.collectCoin();
      this.dash.addCharge();
      this.audio.play('COIN');
      // Coin-hop: only bounces if the player is pressing jump as they hit the
      // coin mid-air — a deliberate choice, not an auto-jump.
      this.player.coinHop(this.time.now);
    }
  };

  private tryDash(): void {
    if (this.state !== 'running') return;
    if (this.dash.tryActivate(this.time.now)) {
      this.audio.play('DASH');
    }
  }

  /** Toggle plane. Swap planes to pass barriers locked to the other plane. */
  private tryPhase(): void {
    if (this.state !== 'running') return;
    if (this.shadow.tryToggle(this.time.now)) {
      this.audio.play('PHASE');
    }
  }

  // ---- Power-ups (M8) -----------------------------------------------------

  /** Spawn gate: never spawn a kind whose effect is active / already stored. */
  private canSpawnPowerUp(kind: PowerUpKind): boolean {
    const now = this.time.now;
    if (kind === 'genesis') return now >= this.genesisUntil;
    if (kind === 'chrono') return now >= this.chronoUntil;
    return !this.hasRecovery; // recovery: only one may be stored
  }

  private onCollectPowerUp: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    puObj
  ) => {
    if (this.state !== 'running') return;
    const pu = puObj as Phaser.Physics.Arcade.Sprite;
    const kind = this.powerups.collect(pu);
    if (!kind) return;
    if (kind === 'genesis') this.activateGenesis(pu.x, pu.y);
    else if (kind === 'chrono') this.activateChrono(pu.x, pu.y);
    else this.storeRecovery(pu.x, pu.y);
  };

  private activateGenesis(x: number, y: number): void {
    this.genesisUntil = this.time.now + POWERUP.GENESIS.DURATION_MS;
    this.scoring.setMultiplier(POWERUP.GENESIS.MULTIPLIER);
    this.audio.play('GENESIS');
    this.cameras.main.flash(160, 255, 212, 71, false);
    this.spawnFloatingLabel(x, y, '2× SCORE', '#ffd447');
    EventBus.emit(GameEvents.GENESIS_CHANGED, POWERUP.GENESIS.DURATION_MS);
  }

  private activateChrono(x: number, y: number): void {
    this.chronoUntil = this.time.now + POWERUP.CHRONO.DURATION_MS;
    this.audio.play('CHRONO');
    this.chronoTint?.setAlpha(0);
    this.tweens.add({ targets: this.chronoTint, alpha: 0.12, duration: 200 });
    this.spawnFloatingLabel(x, y, 'TIME WARP', '#4de1ff');
    EventBus.emit(GameEvents.CHRONO_CHANGED, POWERUP.CHRONO.DURATION_MS);
  }

  private storeRecovery(x: number, y: number): void {
    this.hasRecovery = true;
    this.audio.play('RECOVERY_PICKUP');
    this.spawnFloatingLabel(x, y, 'REVIVE READY', '#35e08a');
    EventBus.emit(GameEvents.RECOVERY_CHANGED, true);
  }

  /** Consume the stored Recovery Protocol to survive a would-be death. */
  private consumeRecovery(): void {
    this.hasRecovery = false;
    this.invulnUntil = this.time.now + POWERUP.RECOVERY.INVULN_MS;
    this.audio.play('REVIVE');
    this.cameras.main.flash(200, 53, 224, 138, false);
    this.cameras.main.shake(200, 0.008);
    this.spawnFloatingLabel(
      this.player.sprite.x,
      this.player.sprite.y - 40,
      'SECOND CHANCE!',
      '#35e08a'
    );
    // Flash the player for the invuln window.
    this.tweens.add({
      targets: this.player.sprite,
      alpha: 0.35,
      yoyo: true,
      repeat: Math.floor(POWERUP.RECOVERY.INVULN_MS / 160),
      duration: 80,
      onComplete: () => this.player.sprite.setAlpha(1),
    });
    EventBus.emit(GameEvents.RECOVERY_CHANGED, false);
  }

  private spawnFloatingLabel(x: number, y: number, text: string, color: string): void {
    const label = this.add
      .text(x, y, text, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '22px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(32);
    this.tweens.add({
      targets: label,
      y: y - 56,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.out',
      onComplete: () => label.destroy(),
    });
  }

  /** Tick power-up effect timers each frame; expire + notify HUD. */
  private updatePowerUps(now: number): void {
    // Genesis expiry.
    if (this.genesisUntil > 0) {
      const remain = this.genesisUntil - now;
      if (remain <= 0) {
        this.genesisUntil = 0;
        this.scoring.setMultiplier(1);
        EventBus.emit(GameEvents.GENESIS_CHANGED, 0);
      } else {
        EventBus.emit(GameEvents.GENESIS_CHANGED, remain);
      }
    }
    // Chrono expiry.
    if (this.chronoUntil > 0) {
      const remain = this.chronoUntil - now;
      if (remain <= 0) {
        this.chronoUntil = 0;
        this.tweens.add({ targets: this.chronoTint, alpha: 0, duration: 200 });
        EventBus.emit(GameEvents.CHRONO_CHANGED, 0);
      } else {
        EventBus.emit(GameEvents.CHRONO_CHANGED, remain);
      }
    }
  }

  /**
   * Barrier collision. The overlap's process callback already guaranteed the
   * barrier shares our plane (tangible), so reaching here means a real hit —
   * unless we're dashing, which smashes through anything.
   */
  private onHitBarrier: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    barrierObj
  ) => {
    if (this.state !== 'running') return;
    // Post-revive invulnerability: pass through hazards briefly.
    if (this.time.now < this.invulnUntil) return;
    if (this.dash.isInvincible) {
      const bar = barrierObj as Phaser.Physics.Arcade.Sprite;
      this.smashObstacle(bar);
      return;
    }
    this.die();
  };

  private die(): void {
    // Recovery Protocol: consume a stored revive instead of dying.
    if (this.hasRecovery && this.state === 'running') {
      this.consumeRecovery();
      return;
    }
    this.state = 'dying';
    this.inputSystem.setEnabled(false);
    this.obstacles.setActive(false);
    this.coins.setActive(false);
    this.barriers.setActive(false);
    this.powerups.setActive(false);
    this.player.setDead(true);

    // Hit flash: quick red screen flash.
    this.cameras.main.flash(120, 255, 45, 74);
    this.cameras.main.shake(DEATH.SHAKE_MS, DEATH.SHAKE_INTENSITY);
    this.audio.play('DEATH');

    // Slow-motion: drop the whole simulation's time scale, then ease back and
    // emit GAME_OVER. We drive the ramp with a real-time delayed call so it
    // isn't itself slowed by the timeScale it's changing.
    this.time.timeScale = DEATH.SLOWMO_SCALE;
    this.physics.world.timeScale = 1 / DEATH.SLOWMO_SCALE;
    this.tweens.timeScale = DEATH.SLOWMO_SCALE;

    // Use the browser clock (setTimeout) so slow-mo doesn't stretch the wait.
    window.setTimeout(async () => {
      this.time.timeScale = 1;
      this.physics.world.timeScale = 1;
      this.tweens.timeScale = 1;
      this.state = 'over';
      
      const finalScore = this.scoring.score;
      const finalCoins = this.scoring.coinCount;
      
      EventBus.emit(GameEvents.GAME_OVER, {
        score: finalScore,
        coins: finalCoins,
        elapsed: this.elapsed,
      });
      
      // Submit score to blockchain if we have an active session
      const sessionId = (await import('../GameController')).getCurrentSessionId();
      if (sessionId !== null) {
        console.log('📤 Submitting score to blockchain...', {
          sessionId: sessionId.toString(),
          score: finalScore,
        });
        
        EventBus.emit(GameEvents.TX_STARTED, { 
          type: 'submitScore', 
          message: 'Approve score submission...',
        });
        
        const { web3 } = await import('../systems/Web3System');
        const txHash = await web3.submitScoreOnChain(sessionId, finalScore);
        
        if (txHash) {
          console.log('✅ Score submitted! Transaction:', txHash);
          EventBus.emit(GameEvents.TX_SUCCESS, { 
            type: 'submitScore', 
            message: 'Score recorded on-chain!',
            txHash,
          });
        } else {
          console.warn('⚠️ Failed to submit score on-chain');
          EventBus.emit(GameEvents.TX_ERROR, { 
            type: 'submitScore', 
            message: 'Failed to submit score.',
          });
        }
      }
    }, DEATH.SLOWMO_MS);
  }

  update(_time: number, delta: number): void {
    // Clamp the timestep before anything derives distance from it. An
    // unclamped spike teleports obstacles onto the player (see TIMESTEP).
    const dt = Math.min(delta, TIMESTEP.MAX_DELTA_MS) / 1000;

    // M9 attract mode: while the main menu is up, scroll the world slowly so
    // the backdrop is alive. No hazards, no scoring, no player control.
    if (this.state === 'idle') {
      const drift = MENU.ATTRACT_SPEED * dt;
      this.ground.tilePositionX += drift;
      this.shadow.scroll(drift);
      this.player.update(this.time.now);
      return;
    }

    if (this.state !== 'running') return;
    this.elapsed += dt;

    // Difficulty: ramp world speed with survival time, clamped to MAX.
    this.speed = Math.min(
      SPEED.MAX,
      SPEED.START + this.elapsed * SPEED.RAMP_PER_SEC
    );

    // Chrono Fragment slows the WORLD only (distance scroll), never the player's
    // jump/gravity — so controls stay fully responsive during slow-mo.
    const chronoScale = this.time.now < this.chronoUntil ? POWERUP.CHRONO.TIME_SCALE : 1;

    // Dash boosts world speed for a sense of thrust.
    const distance = this.speed * this.dash.speedMultiplier * chronoScale * dt;

    // Scroll the ground to simulate forward running.
    this.ground.tilePositionX += distance;

    // Parallax backdrop (stars + mountains) scrolls slower than the ground.
    this.shadow.scroll(distance);

    // Advance obstacles + coins by the same distance so they lock to the ground.
    this.obstacles.update(distance, this.elapsed);
    this.coins.update(distance);
    this.barriers.update(distance, this.elapsed, this.shadow.currentPlane);
    this.powerups.update(distance, this.time.now);

    // Power-up effect timers (Genesis / Chrono expiry + HUD countdown).
    this.updatePowerUps(this.time.now);

    // Dash: magnet + trail + expiry.
    this.dash.update(this.time.now, dt);

    // Passive score accrual (distance survived).
    this.scoring.addTime(dt);

    // Player physics + control.
    this.player.update(this.time.now);

    // Detect landing edge (was airborne, now grounded) for dust + shake.
    const onGround = this.player.isOnGround;
    if (onGround && !this.wasOnGround) {
      this.onLand();
    }
    this.wasOnGround = onGround;
  }

  /** Exposed for later milestones / debugging. */
  getSpeed(): number {
    return this.speed;
  }

  getElapsed(): number {
    return this.elapsed;
  }

  getState(): RunState {
    return this.state;
  }

  getDash(): DashSystem {
    return this.dash;
  }

  /** Power-up state snapshot (HUD parity + runtime verification). */
  getPowerUpState(): {
    genesisMs: number;
    chronoMs: number;
    hasRecovery: boolean;
    invulnMs: number;
    multiplier: number;
    live: number;
  } {
    const now = this.time.now;
    return {
      genesisMs: Math.max(0, this.genesisUntil - now),
      chronoMs: Math.max(0, this.chronoUntil - now),
      hasRecovery: this.hasRecovery,
      invulnMs: Math.max(0, this.invulnUntil - now),
      multiplier: now < this.genesisUntil ? POWERUP.GENESIS.MULTIPLIER : 1,
      live: (this.powerups.group.getChildren() as Phaser.GameObjects.Sprite[]).filter(
        (s) => s.active
      ).length,
    };
  }

  getPowerUps(): PowerUpManager {
    return this.powerups;
  }

  getScoring(): ScoreManager {
    return this.scoring;
  }
  
  /** Get the seeded RNG for deterministic randomness */
  getRNG(): SeededRNG {
    return this.rng;
  }

  /** Force-spawn a power-up kind for verification/debug (bypasses spawn timers). */
  debugSpawnPowerUp(kind: PowerUpKind): boolean {
    return this.powerups.debugSpawn(kind);
  }
}
