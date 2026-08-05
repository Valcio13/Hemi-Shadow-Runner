/**
 * GameConfig — single source of truth for tunable gameplay values.
 *
 * Keeping every "magic number" here means designers can rebalance the game
 * without hunting through system code. Systems import from this file only.
 */

export const VIEW = {
  WIDTH: 960,
  HEIGHT: 540,
  BACKGROUND: 0x11131a,
} as const;

export const WORLD = {
  GRAVITY_Y: 2200,
  GROUND_HEIGHT: 96,
} as const;

export const PLAYER = {
  // Horizontal position is fixed; the world scrolls past the player.
  SCREEN_X: 240,
  WIDTH: 44,
  HEIGHT: 56,
  JUMP_VELOCITY: -880,
  // Coin-hop: collecting a coin while airborne gives an upward bounce. Slightly
  // weaker than a full jump so bouncing along a coin trail reads as "hopping",
  // and it's self-limiting since each coin is consumed on contact.
  COIN_HOP_VELOCITY: -720,
  // Small grace window (ms) after leaving the ground where a jump still counts.
  COYOTE_MS: 150,  // Increased from 90 - more forgiving jump timing
  // Buffer a jump press slightly before landing so it fires on touchdown.
  JUMP_BUFFER_MS: 180, // Increased from 110 - easier to queue jumps
  COLOR: 0x4de1ff,
  COLOR_DASH: 0xfff27a,
} as const;

export const SPEED = {
  // World scroll speed in px/sec. This is the heartbeat of difficulty scaling.
  START: 340,      // Slightly slower start for easier entry
  MAX: 800,        // High ceiling for experienced players
  // Added per second of survival.
  RAMP_PER_SEC: 4, // Moderate difficulty ramp
} as const;

export const OBSTACLE = {
  // Obstacle archetypes. Heights kept below the player's max jump arc (~176px)
  // with margin so nothing is ever an impossible jump.
  TYPES: [
    { key: 'obstacle-low', width: 34, height: 44, color: 0xff5d73 },
    { key: 'obstacle-tall', width: 30, height: 74, color: 0xff7a45 },
    { key: 'obstacle-wide', width: 68, height: 40, color: 0xff5d73 },
  ],
  // Spawn cadence expressed as a gap distance (px) between obstacles. Shrinks
  // with difficulty but is clamped so a running jump always clears the gap.
  GAP_START: 650,  // Increased from 520 - more space between obstacles
  GAP_MIN: 400,    // Increased from 300 - maintains larger minimum gap
  // Randomness added to each gap so the rhythm never feels metronomic.
  GAP_JITTER: 150, // Increased from 120 - more varied spacing
  // How much the base gap tightens per second of survival.
  GAP_RAMP_PER_SEC: 2, // Reduced from 3.2 - gap closes more slowly
  COLOR_GLOW: 0xff2d4a,
} as const;

export const COIN = {
  RADIUS: 13,
  // Hemi brand orange — coins are "Hemi tokens".
  COLOR: 0xff6c15,
  COLOR_GLOW: 0xffa34d,
  // Score awarded per coin collected.
  SCORE_VALUE: 25,
  // Coins arrive in short arcs/rows. This is how many per cluster.
  CLUSTER_MIN: 3,
  CLUSTER_MAX: 6,
  SPACING: 46,
  // Vertical placement band (px above ground) — low rows are grab-on-the-run,
  // high arcs reward a well-timed jump. Kept within jump reach.
  LOW_Y: 40,
  HIGH_Y: 150,
  // Distance-based spawn cadence, independent of obstacle cadence.
  GAP_START: 420,
  GAP_JITTER: 260,
  // Extra clearance (px) kept between a coin and any obstacle so coins never
  // render sitting on top of a hazard.
  OBSTACLE_CLEARANCE: 26,
} as const;

export const SCORE = {
  // Passive score accrues with distance so surviving always ticks the number.
  PER_SECOND: 10,
} as const;

export const DASH = {
  // Meter fills 0..1. Each coin adds this fraction, so ~7 coins → full.
  FILL_PER_COIN: 0.14,
  // Dash cannot be activated below this (must be full).
  ACTIVATE_THRESHOLD: 1,
  DURATION_MS: 1000,
  // While dashing the world speeds up for a sense of thrust.
  SPEED_MULTIPLIER: 1.55,
  // Coin magnet: coins within this radius get pulled toward the player.
  MAGNET_RADIUS: 300,
  MAGNET_STRENGTH: 1400,
  // Trail afterimages spawned per second while dashing.
  TRAIL_RATE_MS: 40,
  COLOR: 0xfff27a,
} as const;

export const DEATH = {
  // Slow-motion ramp on death for a punchy "oof" moment.
  SLOWMO_SCALE: 0.15,
  SLOWMO_MS: 700,
  FLASH_COLOR: 0xff2d4a,
  SHAKE_MS: 260,
  SHAKE_INTENSITY: 0.012,
} as const;

/**
 * The two planes the runner can exist in. The signature "shadow" mechanic:
 * the player phases between them to pass plane-locked barriers.
 */
export const PLANE = {
  LIGHT: 'light',
  SHADOW: 'shadow',
} as const;

export type PlaneId = (typeof PLANE)[keyof typeof PLANE];

export const SHADOW = {
  // Instant plane toggle, gated by a short cooldown so it feels snappy but the
  // player can't mash through everything.
  TOGGLE_COOLDOWN_MS: 150, // Reduced from 220 - faster phase toggling
  // Per-plane accent colors: player tint + barrier body + background wash.
  LIGHT_COLOR: 0x4de1ff,
  SHADOW_COLOR: 0xb46bff,
  // Background base per plane — an at-a-glance readout of which plane you're in.
  LIGHT_BG: 0x0d1b2e,
  SHADOW_BG: 0x1a0e2a,
  // Top-of-gradient sky tint per plane (deep space fading to the bg above).
  LIGHT_SKY: 0x071019,
  SHADOW_SKY: 0x0c0716,
  // Distant mountain silhouette tint per plane.
  LIGHT_MTN: 0x14324d,
  SHADOW_MTN: 0x2a1a42,
  // Alpha of a barrier when it's on the opposite (safe, passable) plane.
  SAFE_ALPHA: 0.16,
  // Brief camera flash on toggle for tactile feedback.
  FLASH_MS: 130,
} as const;

export const BARRIER = {
  WIDTH: 30,
  // Tall enough that it CANNOT be jumped (player max jump arc ≈ 176px). The
  // only way past is to be on the opposite plane — this is what gives the
  // phase mechanic teeth: jump for ground obstacles, phase for barriers.
  HEIGHT: 320,
  // Distance-based cadence, sparser than obstacles so barriers read as events.
  GAP_START: 1600,  // Increased from 1250 - barriers appear less frequently
  GAP_MIN: 1000,    // Increased from 760 - maintains larger minimum spacing
  GAP_JITTER: 500,  // Increased from 480 - more varied barrier placement
  GAP_RAMP_PER_SEC: 4, // Reduced from 6 - barriers get denser more slowly
  // Slim hitbox so a phase timed a hair late still feels fair.
  HITBOX_SCALE_X: 0.6, // Reduced from 0.7 - even more forgiving hitbox
  // Min clearance (px) kept between a barrier's spawn column and any obstacle.
  OBSTACLE_CLEARANCE: 120, // Increased from 90 - more breathing room
  // Small score reward for cleanly phasing past a barrier.
  PHASE_BONUS: 40,
} as const;

/**
 * AUDIO — all SFX are synthesized procedurally via the Web Audio API (no binary
 * assets, mirroring TextureFactory). Each cue is a short oscillator envelope.
 * `master` scales everything; per-cue gains balance the mix.
 */
export const AUDIO = {
  MASTER_GAIN: 0.35,
  MUTE_KEY: 'hsr:muted',
  JUMP: { type: 'square', startFreq: 440, endFreq: 760, dur: 0.12, gain: 0.5 },
  LAND: { type: 'sine', startFreq: 180, endFreq: 90, dur: 0.1, gain: 0.35 },
  COIN: { type: 'triangle', startFreq: 880, endFreq: 1320, dur: 0.1, gain: 0.4 },
  PHASE: { type: 'sawtooth', startFreq: 300, endFreq: 620, dur: 0.16, gain: 0.4 },
  DASH: { type: 'sawtooth', startFreq: 220, endFreq: 880, dur: 0.32, gain: 0.5 },
  SMASH: { type: 'square', startFreq: 200, endFreq: 60, dur: 0.18, gain: 0.5 },
  DEATH: { type: 'sawtooth', startFreq: 400, endFreq: 55, dur: 0.7, gain: 0.55 },
  // Power-up cues (M8).
  GENESIS: { type: 'triangle', startFreq: 660, endFreq: 1760, dur: 0.28, gain: 0.5 },
  CHRONO: { type: 'sine', startFreq: 900, endFreq: 300, dur: 0.4, gain: 0.45 },
  RECOVERY_PICKUP: { type: 'triangle', startFreq: 520, endFreq: 990, dur: 0.22, gain: 0.45 },
  REVIVE: { type: 'sawtooth', startFreq: 300, endFreq: 1200, dur: 0.5, gain: 0.55 },
} as const;

/**
 * POWERUP (M8) — three rare collectibles. Each is a pooled sprite spawned on a
 * randomized time window, gated so at most one of each is ever pending/active.
 * All tunables live here so spawn rates and durations rebalance without code.
 */
export const POWERUP = {
  // Shared spawn placement: sit within jump/phase reach, off the ground.
  // MAX_Y is bounded by the player's measured max jump height (~169px above
  // ground). Anything higher is physically uncollectable — verified in-engine,
  // so keep a margin below that ceiling rather than tuning by eye.
  MIN_Y: 55,
  MAX_Y: 150,
  // Distance clearance from obstacles/barriers so a power-up is never trapped
  // inside an impossible pattern.
  OBSTACLE_CLEARANCE: 70,
  // Only one power-up sprite may be airborne at a time (avoid clustered pickups).
  MIN_SEPARATION_MS: 3500,

  GENESIS: {
    key: 'pu-genesis',
    // First eligible spawn + repeat window (ms). Randomized in [MIN, MAX].
    // Tuned against real run length: world speed maxes out at ~60s, so windows
    // beyond that meant most players never saw a power-up at all. Genesis is
    // the "common" one and should show up in almost every run.
    SPAWN_MIN_MS: 12000,
    SPAWN_MAX_MS: 20000,
    // 2x score for this long.
    DURATION_MS: 10000,
    MULTIPLIER: 2,
    COLOR: 0xffd447,
    COLOR_GLOW: 0xfff27a,
    RADIUS: 18,
  },
  CHRONO: {
    key: 'pu-chrono',
    // Uncommon: lands mid-run, once the speed ramp starts to bite.
    SPAWN_MIN_MS: 26000,
    SPAWN_MAX_MS: 38000,
    DURATION_MS: 3500,
    // World runs at this fraction of normal speed. Player input is untouched.
    TIME_SCALE: 0.67,
    COLOR: 0x4de1ff,
    COLOR_GLOW: 0xaef2ff,
    RADIUS: 18,
  },
  RECOVERY: {
    key: 'pu-recovery',
    // Rare: the extra life. Deliberately the longest window so it feels like a
    // reward for a good run, but still reachable inside a strong one.
    SPAWN_MIN_MS: 45000,
    SPAWN_MAX_MS: 70000,
    // Invulnerability window granted after a revive.
    INVULN_MS: 2000,
    COLOR: 0x35e08a,
    COLOR_GLOW: 0x9dffcf,
    RADIUS: 18,
  },
} as const;

/**
 * MENU (M9) — the pre-run attract mode. Rather than freezing on a static
 * frame, the idle state keeps the world scrolling slowly behind the menu so
 * the game reads as "alive" before the player presses Play. No hazards spawn
 * and the player idles on the ground; only the parallax + ground move.
 */
export const MENU = {
  // World scroll speed (px/s) while the menu is up. Slow enough to feel
  // ambient, fast enough to show the parallax depth.
  ATTRACT_SPEED: 120,
} as const;

/**
 * Frame-time safety. Phaser reports the real elapsed delta, which spikes after
 * a long frame (React overlay unmount, tab refocus, GC pause, slow device). A
 * spiked delta scrolls the world by a huge single-frame distance, which can
 * teleport a freshly-spawned obstacle on top of the player — an unavoidable
 * death with no input possible. Clamping the timestep costs a little world
 * speed during a hitch, which is strictly better than a phantom death.
 */
export const TIMESTEP = {
  // 50ms == a 20fps floor. Anything slower is treated as a 50ms frame.
  MAX_DELTA_MS: 50,
} as const;

export type GameConfigShape = {
  view: typeof VIEW;
  world: typeof WORLD;
  player: typeof PLAYER;
  speed: typeof SPEED;
};
