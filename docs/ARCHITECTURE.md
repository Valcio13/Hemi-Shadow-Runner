# Architecture Documentation

This document provides a deep dive into the Hemi Shadow Runner architecture, design patterns, and technical decisions.

## 🏗️ System Overview

Hemi Shadow Runner uses a **hybrid architecture** combining React for UI and Phaser 3 for game logic. The two frameworks communicate through a clean, bidirectional bridge pattern.

```
┌─────────────────────────────────────────────────────┐
│                     React Layer                      │
│  ┌──────────┐  ┌─────────┐  ┌──────────────────┐   │
│  │ MainMenu │  │   HUD   │  │ GameOverScreen   │   │
│  └──────────┘  └─────────┘  └──────────────────┘   │
│         │           │                 │             │
│         └───────────┴─────────────────┘             │
│                     │                               │
│            ┌────────▼────────┐                      │
│            │  useGameState   │◄─────────────────┐   │
│            └─────────────────┘                  │   │
└─────────────────────────────────────────────────┼───┘
                                                  │
            ┌─────────────────────────────────────┼───┐
            │              Bridge Layer           │   │
            │                                     │   │
            │  ┌──────────────┐  ┌──────────────┐│   │
            │  │  EventBus    │  │GameController││   │
            │  │  (Phaser→    │  │  (React→     ││   │
            │  │   React)     │  │   Phaser)    ││   │
            │  └──────┬───────┘  └──────▲───────┘│   │
            └─────────┼──────────────────┼────────┘   │
                      │                  │            │
┌─────────────────────┼──────────────────┼────────────┼───┐
│              Phaser Layer              │            │   │
│                                        │            │   │
│  ┌─────────────────────────────────────▼────┐       │   │
│  │            GameScene                     │       │   │
│  │  ┌────────┐  ┌──────────┐  ┌──────────┐ │       │   │
│  │  │ Player │  │ Systems  │  │ Managers │ │       │   │
│  │  └────────┘  └──────────┘  └──────────┘ │       │   │
│  └──────────────────────────────────────────┘       │   │
│                                                     │   │
│  ┌──────────────────────────────────────────┐       │   │
│  │         System Layer                     │       │   │
│  │  • InputSystem    • ObstacleManager      │       │   │
│  │  • ShadowSystem   • CoinManager          │       │   │
│  │  • DashSystem     • BarrierManager       │       │   │
│  │  • AudioSystem    • PowerUpManager       │       │   │
│  │  • ScoreManager   • Web3System           │───────┘   │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## 🔌 React ↔ Phaser Bridge

### EventBus (Phaser → React)

The EventBus is a singleton event emitter that allows Phaser to communicate state changes to React without coupling.

**Location**: `src/game/EventBus.ts`

**Pattern**:
```typescript
// Phaser emits events
EventBus.emit(GameEvents.SCORE_CHANGED, newScore);

// React listens via hooks
useEffect(() => {
  const handler = (score: number) => setScore(score);
  EventBus.on(GameEvents.SCORE_CHANGED, handler);
  return () => EventBus.off(GameEvents.SCORE_CHANGED, handler);
}, []);
```

**Available Events**:
- `READY` - Game scene is initialized
- `GAME_STARTED` - New run began
- `GAME_OVER` - Run ended with score data
- `MENU_SHOWN` - Attract mode active
- `SCORE_CHANGED` - Score updated
- `COINS_CHANGED` - Coin count changed
- `DASH_CHANGED` - Dash meter updated
- `SHADOW_CHANGED` - Plane switched
- `AUDIO_MUTE_CHANGED` - Mute state toggled
- `GENESIS_CHANGED` - Genesis power-up timer
- `CHRONO_CHANGED` - Chrono power-up timer
- `RECOVERY_CHANGED` - Recovery power-up status

### GameController (React → Phaser)

The GameController provides a command interface for React to invoke Phaser actions.

**Location**: `src/game/GameController.ts`

**Pattern**:
```typescript
// GameScene registers handlers
registerGameControls({
  start: () => this.startRun(),
  restart: () => this.startRun(),
  dash: () => this.tryDash(),
  phase: () => this.tryPhase(),
  toggleMute: () => this.audio.toggleMute(),
  mainMenu: () => this.showMenu(),
});

// React calls registered functions
requestStart();  // Triggers start handler in Phaser
```

**Why This Pattern?**

1. **Decoupling**: React never directly touches Phaser internals
2. **Type Safety**: All commands are strongly typed
3. **Single Source of Truth**: Game state lives in Phaser
4. **Clean Testing**: Mock the bridge for isolated tests

## 🎮 Phaser Architecture

### Scene Structure

**BootScene** (`src/game/scenes/BootScene.ts`):
- Generates procedural textures via `TextureFactory`
- Loads no external assets (all graphics are Canvas-generated)
- Transitions to GameScene when complete

**GameScene** (`src/game/scenes/GameScene.ts`):
- Main gameplay scene
- Orchestrates all systems
- Manages run state machine: `idle` → `running` → `dying` → `over`
- Handles frame-time clamping for stability

### System Design

Each system is **self-contained** and **modular**:

```typescript
export class ExampleSystem {
  constructor(scene: Phaser.Scene) {
    // Initialize
  }
  
  update(delta: number): void {
    // Per-frame logic
  }
  
  reset(): void {
    // Clean state for new run
  }
  
  setActive(active: boolean): void {
    // Enable/disable spawning
  }
}
```

#### System Responsibilities

| System | Purpose |
|--------|---------|
| **InputSystem** | Keyboard/pointer input handling, delegates to Player |
| **ShadowSystem** | Plane switching, background parallax, color transitions |
| **AudioSystem** | Procedural Web Audio synthesis, mute persistence |
| **ScoreManager** | Score accumulation, multipliers, coin tracking |
| **DashSystem** | Meter, invincibility, magnet, visual effects |
| **ObstacleManager** | Spawning ground obstacles, collision detection |
| **CoinManager** | Coin cluster spawning, collection, coin-hop |
| **BarrierManager** | Plane-locked barrier spawning, phase detection |
| **PowerUpManager** | Rare collectible spawning, spawn gates, timers |
| **Web3System** | Wallet connection, chain switching, score signing |

### Entity Structure

**Player** (`src/game/entities/Player.ts`):
- Arcade physics sprite
- Jump mechanics with forgiving features:
  - **Coyote Time**: 90ms grace window after leaving ground
  - **Jump Buffering**: 110ms buffer before landing
  - **Coin Hop**: Mid-air bounce on coin collection (requires buffered jump)
- Squash & stretch animation for game feel
- No direct input handling (delegated to InputSystem)

## 📦 Configuration System

All tunable values live in **single-source-of-truth** config files.

### GameConfig.ts

Organized by feature:
```typescript
export const PLAYER = {
  SCREEN_X: 240,
  JUMP_VELOCITY: -880,
  COYOTE_MS: 90,
  // ... all player constants
} as const;

export const SPEED = {
  START: 360,
  MAX: 820,
  RAMP_PER_SEC: 6.5,
} as const;
```

**Benefits**:
- Designers can tune gameplay without touching code
- No magic numbers scattered through systems
- TypeScript enforces readonly values
- Centralized documentation

### Web3Config.ts

Network parameters and Web3 settings:
```typescript
export const HEMI_SEPOLIA: ChainParams = { /* ... */ };
export const HEMI_MAINNET: ChainParams = { /* ... */ };

export const DEFAULT_CHAIN = HEMI_SEPOLIA; // Single line to switch networks
```

## 🎨 Procedural Asset Generation

### TextureFactory

All graphics are generated at runtime using Canvas 2D API.

**Location**: `src/game/systems/TextureFactory.ts`

**Generated Assets**:
- Player square (with tint variations)
- Obstacles (3 archetypes)
- Coins (circle with glow)
- Barriers (tall rectangles)
- Power-ups (3 types with distinct colors)
- Ground tile pattern
- Particle dust

**Advantages**:
- Zero image file dependencies
- Perfect pixel scaling at any resolution
- Tiny bundle size
- Easy to modify colors/shapes

### AudioSystem

All sounds synthesized via Web Audio API.

**Location**: `src/game/systems/AudioSystem.ts`

**Sound Types**:
- Jump, Land, Coin (player actions)
- Phase, Dash, Smash (abilities)
- Death (game over)
- Genesis, Chrono, Recovery (power-ups)

**Synthesis Pattern**:
```typescript
const osc = audioContext.createOscillator();
osc.type = 'square'; // wave shape
osc.frequency.setValueAtTime(startFreq, now);
osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
// ... envelope + gain
```

**Advantages**:
- No audio file downloads
- Instant playback (no loading)
- Consistent across platforms
- Mute state persists via localStorage

## ⚡ Performance Optimizations

### Frame-Time Clamping

Problem: Frame spikes (tab refocus, GC) cause huge delta values, teleporting obstacles onto the player.

Solution: Cap delta time before distance calculations:
```typescript
const dt = Math.min(delta, TIMESTEP.MAX_DELTA_MS) / 1000;
const distance = speed * dt; // Distance never spikes
```

**Location**: `GameScene.update()` first line

### Object Pooling

All gameplay objects use Phaser's built-in object pooling:
```typescript
this.obstacles = this.physics.add.group({
  maxSize: 20,
  // Inactive objects return to pool instead of being destroyed
});
```

Objects are `setActive(false)` rather than destroyed, avoiding GC churn.

### Efficient Collision Detection

**Overlap vs Collider**:
- **Overlap**: Used for coins, power-ups (pass-through collection)
- **Collider**: Used for ground (physical collision)
- **Process Callback**: Barriers check plane match before collision

```typescript
this.physics.add.overlap(
  player,
  barriers,
  this.onHitBarrier,
  (_, barrier) => this.shadow.isTangible(barrier.getData('plane')), // Only collide if tangible
  this
);
```

## 🔐 Web3 Architecture

### Minimal Dependencies

The Web3System uses **zero external libraries** for basic operations:
- Wallet connection via native `window.ethereum`
- Chain switching via EIP-1193 `wallet_switchEthereumChain`
- Signing via `personal_sign`

**Why?** ethers.js v6 is lightweight and provides full contract interaction capabilities.

### On-Chain Score Submission

Scores are submitted as blockchain transactions to the ShadowRunnerGame contract:

```typescript
const message = `
Hemi Shadow Runner — Score Attestation

Player: 0x123...
Score: 1234
Coins: 45
Chain: Hemi Sepolia (743111)
Timestamp: 1234567890

Signing this message costs no gas and authorizes nothing on-chain.
`;

const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, address]
});
```

**Verification** (backend/contract):
```solidity
address signer = ecrecover(messageHash, signature);
// signer == claimed address? Score is valid.
```

**Benefits**:
- Zero gas cost
- Instant (no block confirmation)
- No contract deployment needed
- Can verify offline

### State Management

Web3System is a **singleton** with reactive state:
```typescript
export const web3 = new Web3System();

// React subscribes to updates
web3.subscribe((state) => {
  setWalletState(state);
});
```

**State Shape**:
```typescript
interface WalletState {
  available: boolean;   // Provider exists
  address: string | null;
  chainId: number | null;
  onHemi: boolean;      // On correct network
  connecting: boolean;
  error: string | null;
}
```

## 🎯 Gameplay Systems Deep Dive

### Shadow Plane System

The core mechanic: two parallel planes with independent barriers.

**Planes**: `light` (cyan) and `shadow` (purple)

**Implementation**:
1. Background color changes per plane (visual cue)
2. Barriers have `plane` data property
3. Collision process callback checks `currentPlane === barrier.plane`
4. Opposite-plane barriers render at low alpha (0.16)
5. Toggle has cooldown (220ms) to prevent spam

**Parallax Layers**:
- Stars (far, slow)
- Mountains (mid, medium)
- Ground (near, fast)

Each scrolls at different speeds for depth illusion.

### Dash System

**Meter Filling**:
- Each coin adds 0.14 (≈7 coins to fill)
- Clamped to [0, 1]
- Full meter required to activate

**Active Effects**:
- Duration: 1000ms
- Invincibility: collision callbacks return early
- Speed boost: 1.55× world scroll
- Magnet: pulls coins within 300px radius
- Trail: afterimages spawn every 40ms
- Color: player tints gold

**Reset Behavior**:
- On activation, meter instantly drains
- On death, meter resets
- On new run, starts at 0

### Power-Up System

**Spawn Logic**:
Each power-up has independent spawn timers:
```typescript
Genesis: spawn between 12-20s
Chrono: spawn between 26-38s  
Recovery: spawn between 45-70s
```

**Spawn Gates**:
- Only spawn if effect is not active
- Only one power-up airborne at a time
- Min 3.5s separation between any power-up spawns
- Clears obstacle/barrier collision boxes

**Effect Implementation**:
- **Genesis**: `ScoreManager.setMultiplier(2)` for 10s
- **Chrono**: World time scale × 0.67 (player physics untouched)
- **Recovery**: Stored boolean, consumed on next death

### Coin Hop Mechanic

Players can "bounce" off mid-air coins, but only if:
1. Player is airborne
2. Jump is buffered (pressed within last 110ms)
3. Coin is collected

```typescript
coinHop(now: number): boolean {
  if (this.isDead || this.isOnGround) return false;
  const wantsHop = now - this.lastJumpPressedAt <= PLAYER.JUMP_BUFFER_MS;
  if (!wantsHop) return false;
  this.lastJumpPressedAt = -Infinity; // consume press
  this.body.setVelocityY(PLAYER.COIN_HOP_VELOCITY);
  return true;
}
```

**Design Rationale**: Makes coin chains a deliberate skill, not an auto-jump.

## 📊 State Flow Diagram

```
┌──────────┐
│   BOOT   │ (Loading textures)
└────┬─────┘
     │
     ▼
┌──────────┐
│   IDLE   │ (Menu shown, attract mode scrolling)
└────┬─────┘
     │ requestStart()
     ▼
┌──────────┐
│ RUNNING  │ (Active gameplay)
└────┬─────┘
     │ die() OR consumeRecovery()
     ▼
┌──────────┐
│  DYING   │ (Slow-mo, shake, flash)
└────┬─────┘
     │ after 700ms
     ▼
┌──────────┐
│   OVER   │ (Game over screen, wallet submission)
└────┬─────┘
     │ requestRestart() OR requestMainMenu()
     ▼
   (back to IDLE or RUNNING)
```

## 🧪 Debug Tools

In development mode, global handles are exposed:

```javascript
// Browser console
window.__game                           // Phaser.Game instance
window.__game.scene.scenes[1]           // GameScene
window.__web3                           // Web3System

// Force spawn power-ups
window.__game.scene.scenes[1].debugSpawnPowerUp('genesis')
window.__game.scene.scenes[1].debugSpawnPowerUp('chrono')
window.__game.scene.scenes[1].debugSpawnPowerUp('recovery')

// Check power-up state
window.__game.scene.scenes[1].getPowerUpState()
```

## 🔮 Future Architecture Considerations

### Potential Enhancements

1. **Level System**: Replace time-based difficulty with discrete levels
2. **Leaderboard Contract**: Deploy on-chain ranking with score verification
3. **Skin System**: Player/barrier cosmetics (NFTs?)
4. **Replay System**: Record inputs, deterministic playback
5. **Mobile Touch**: Virtual buttons for dash/phase
6. **Multiplayer**: Race mode with ghost data

### Scaling Considerations

- **Asset Loading**: If adding image/audio files, implement loading screen
- **State Management**: For complex menus, consider zustand/jotai
- **Contract Integration**: Add viem if doing on-chain transactions
- **Testing**: Add Vitest for unit tests, Playwright for E2E

---

This architecture balances **simplicity** (minimal dependencies, clear patterns) with **extensibility** (modular systems, clean boundaries). The codebase is production-ready while remaining approachable for contributors.
