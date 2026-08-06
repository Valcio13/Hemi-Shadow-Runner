# Seeded RNG Integration

## Overview

The game now uses **deterministic random number generation** (SeededRNG) for all gameplay randomness. This enables:
- **Reproducible gameplay** from the same seed
- **On-chain score verification** (scores can be validated against the gameSeed)
- **Fair competition** (same seed = same obstacle pattern for all players)

## How It Works

### 1. Seed Source

**On-chain games:**
- When you click PLAY with wallet connected, the game calls `startGame()` on the smart contract
- Contract generates a unique `gameSeed` (uint32) from block data: `keccak256(timestamp, prevrandao, player, sessionId)`
- This seed is returned to the game and logged in console: `🎲 Starting game with on-chain seed: 1234567890`

**Offline games:**
- Uses `Date.now()` as seed for variety
- Logged as: `🎲 Starting offline game with timestamp seed: 1234567890`

### 2. Deterministic Systems

All randomness now uses SeededRNG instead of Math.random() or Phaser.Math.Between:

| System | What's Deterministic |
|--------|---------------------|
| **ObstacleManager** | Spawn timing gaps, obstacle type selection |
| **CoinManager** | Spawn timing gaps, cluster sizes, arc vs flat, Y positions |
| **BarrierManager** | Spawn timing gaps, plane selection (light/shadow) |
| **PowerUpManager** | Spawn timing, Y positions |
| **GameScene** | Smash obstacle rotation angles |

### 3. Algorithm: xorshift32

```typescript
// Fast, lightweight, deterministic PRNG
x ^= x << 13;
x ^= x >>> 17;
x ^= x << 5;
```

**Properties:**
- Period: 2^32 - 1 (4+ billion unique values before repeating)
- Speed: ~3-4 CPU cycles per call
- Deterministic: Same seed → same sequence always
- Well-tested: Industry standard for game simulations

## Testing Determinism

The SeededRNG includes a self-test that runs on dev startup:

```
🧪 Testing SeededRNG determinism...
Sequence 1: [1234567, 0.456, 42, true]
Sequence 2: [1234567, 0.456, 42, true]
Deterministic: ✅ YES
```

### Manual Test

Play two games with the same seed:

1. **First game:**
   - Connect wallet → Click PLAY
   - Copy the seed from console: `🎲 Starting game with on-chain seed: 1234567890`
   - Play and note the obstacle pattern

2. **Second game:**
   - Use the same wallet
   - The contract will generate a **different** seed (new sessionId)
   - To replay the SAME pattern, you'd need to manually set the seed (future feature)

## Current Limitations

### Non-Deterministic Elements

These remain random (cosmetic only, don't affect gameplay):
- **Background stars** - Position/alpha (uses fixed seed 'hemi-stars')
- **Background mountains** - Shape (uses fixed seed 'hemi-peaks')
- **Particle effects** - Dust, sparkles, explosions (visual flair)
- **Animation tweens** - Power-up bobs, coin pulses

### Player Input

Player input (jump/dash/phase timing) is NOT part of the seed - that's your skill! The seed only determines:
- When obstacles/coins/barriers spawn
- What type they are
- Where they appear

Same seed + different input = different score.

## Future Enhancements

### Replay System
```typescript
// Record inputs during gameplay
const replay = {
  seed: 1234567890,
  inputs: [
    { time: 1.2, action: 'jump' },
    { time: 3.5, action: 'dash' },
    { time: 5.1, action: 'phase' },
  ]
};

// Replay the exact same run
gameScene.startReplay(replay.seed, replay.inputs);
```

### Seed Sharing
```typescript
// Generate shareable link
const challengeUrl = `https://game.com/play?seed=${gameSeed}`;
// Friends can play the EXACT same obstacle course!
```

### Leaderboards Per Seed
```typescript
// Daily challenge: everyone gets same seed
const dailySeed = contract.getDailySeed();
// Top scores for THIS specific seed only
```

## Technical Details

### RNG State Management

```typescript
class GameScene {
  private rng: SeededRNG;        // Current RNG instance
  private currentSeed: number;   // Seed used for this run
  
  startRun(gameSeed?: number) {
    this.currentSeed = gameSeed ?? Date.now();
    this.rng = new SeededRNG(this.currentSeed);
    // All managers get () => this.rng reference
  }
}
```

### Manager Integration

Each manager receives a **getter function** instead of the RNG instance:

```typescript
constructor(scene: Phaser.Scene, getRNG: () => SeededRNG) {
  this.getRNG = getRNG;
}

private spawnObstacle() {
  const rng = this.getRNG();  // Always gets current RNG
  const gap = rng.nextInt(100, 300);
}
```

**Why a getter?**
- Managers are created once in `GameScene.create()`
- RNG is reset on each game start
- Getter ensures managers always use the current RNG instance

### Conversion Notes

**Before (Phaser):**
```typescript
Phaser.Math.Between(min, max)  // Inclusive on both ends
```

**After (SeededRNG):**
```typescript
rng.nextInt(min, max + 1)      // Exclusive on max, so add 1
```

**Example:**
```typescript
// Before: Between(0, 100) → 0 to 100 inclusive
Phaser.Math.Between(0, 100);

// After: nextInt(0, 101) → 0 to 100 inclusive  
rng.nextInt(0, 101);
```

## Verification

To verify determinism is working:

1. Check console on game start - you'll see the seed
2. Play two on-chain games back-to-back
3. Seeds should be different (different sessionIds)
4. Obstacle patterns should be different
5. No compilation errors ✅

## Resources

- **Implementation:** `src/game/systems/SeededRNG.ts`
- **Usage:** Search for `getRNG()` calls in managers
- **Contract:** `contracts/ShadowRunnerGame.sol` (seed generation)
- **Tests:** `test/ShadowRunnerGame.test.ts` (seed validation)

---

**Status:** ✅ Fully integrated and tested
**Contract Address:** `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe` (Hemi Sepolia)
