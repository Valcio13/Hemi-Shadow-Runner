# 🎮 Hemi Shadow Runner

A fast-paced endless runner game with blockchain integration, built on the Hemi network. Master the art of jumping, dashing, and **phasing between shadow planes** to survive as long as possible!

![Hemi Shadow Runner](https://img.shields.io/badge/Phaser-3.80-blue) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Hemi](https://img.shields.io/badge/Hemi-Sepolia-orange)

## 🌟 Features

- **Dual-Plane Mechanic**: Phase between Light and Shadow planes to pass through barriers
- **Dynamic Difficulty**: Speed and obstacle density increase as you survive
- **Dash System**: Fill your meter by collecting coins, then unleash a speed-boosting dash with invincibility
- **Power-ups**:
  - 🌟 **Genesis Shard**: 2× score multiplier
  - ⏱️ **Chrono Fragment**: Slow down time
  - 💚 **Recovery Protocol**: Extra life with invulnerability
- **Web3 Integration**: Sign your score on the Hemi network (gasless!)
- **Procedural Assets**: All graphics and audio generated at runtime - no image/audio files needed
- **Responsive Controls**: Forgiving jump mechanics with coyote time and input buffering

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or another Web3 wallet (optional, for score attestation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hemi-shadow-runner

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Controls

| Action | Key(s) | Alternative |
|--------|--------|-------------|
| Jump | `SPACE` / `UP` / `W` | Left-click / Tap screen |
| Phase | `SHIFT` / `F` | Right-click / Two-finger tap |
| Dash | `E` | (when meter is full) |
| Mute | `M` | Click 🔊 button |

### Game Mechanics

1. **Jump over obstacles** on the ground (red boxes of varying heights)
2. **Phase between planes** to pass through tall barriers (light blue or purple walls)
3. **Collect coins** (orange circles) to:
   - Increase your score (+25 points each)
   - Fill your dash meter
4. **Activate dash** when meter is full for:
   - Temporary invincibility (smash through obstacles!)
   - Speed boost
   - Coin magnet effect
5. **Survive as long as possible** - passive score increases with distance

### Advanced Techniques

- **Coin Hopping**: Press jump while collecting an airborne coin for a mid-air bounce
- **Coyote Time**: You have 90ms after leaving the ground to still jump
- **Jump Buffering**: Press jump slightly before landing and it executes on touchdown
- **Strategic Phasing**: Use the cooldown wisely - you can't spam through everything!

## 🔗 Web3 Integration

### Score Submission Modes

The game supports **two modes** for score submission:

#### 1. Gasless Attestation (Default)
- Sign a message with your score (no gas fees!)
- No blockchain transaction required
- Instant submission
- Perfect for testing and casual play

#### 2. On-Chain Leaderboard (Optional)
- Submit scores to a smart contract on Hemi
- Permanent, publicly verifiable leaderboard
- Costs a small amount of ETH per submission (~$3-5)
- Foundation for NFT rewards, tournaments, etc.

See **[SMART_CONTRACT_GUIDE.md](SMART_CONTRACT_GUIDE.md)** for smart contract integration.

### Connecting Your Wallet

After a game ends, you can:
1. Click "Connect Wallet" on the game-over screen
2. Connect MetaMask (or compatible wallet)
3. The game will prompt you to switch to **Hemi Sepolia Testnet**
4. Sign your score (gasless in attestation mode!)

### Network Configuration

**Current Network**: Hemi Sepolia (Testnet)
- Chain ID: `743111` (`0xb56c7`)
- RPC: `https://testnet.rpc.hemi.network/rpc`
- Explorer: `https://testnet.explorer.hemi.xyz`

**Switching to Mainnet**: Change `DEFAULT_CHAIN` in `src/game/config/Web3Config.ts` to `HEMI_MAINNET`

### Smart Contract

The optional **ShadowRunnerLeaderboard** smart contract provides:
- ✅ Global leaderboard (top 100 all-time)
- ✅ Daily leaderboards
- ✅ Player statistics tracking
- ✅ Anti-cheat mechanisms
- ✅ Admin controls

**Deploy Your Own Contract**:
```bash
npm run compile
npm run test:contract
npm run deploy:testnet
```

See full documentation:
- **[SMART_CONTRACT_GUIDE.md](SMART_CONTRACT_GUIDE.md)** - Integration guide
- **[CONTRACT_DEPLOYMENT.md](CONTRACT_DEPLOYMENT.md)** - Deployment guide
- **[contracts/README.md](contracts/README.md)** - Contract API docs

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Game Engine**: Phaser 3.80
- **Build Tool**: Vite 5
- **Linting**: Oxlint
- **Web3**: Native EIP-1193 (no heavy libraries!)

### Project Structure

```
src/
├── game/                    # Phaser game engine code
│   ├── config/              # Game configuration & Web3 settings
│   │   ├── GameConfig.ts    # All gameplay tunables
│   │   └── Web3Config.ts    # Network params & attestation
│   ├── entities/            # Game entities
│   │   └── Player.ts        # Player physics & controls
│   ├── scenes/              # Phaser scenes
│   │   ├── BootScene.ts     # Asset generation
│   │   └── GameScene.ts     # Main gameplay scene
│   └── systems/             # Modular game systems
│       ├── AudioSystem.ts   # Procedural Web Audio
│       ├── BarrierManager.ts
│       ├── CoinManager.ts
│       ├── DashSystem.ts
│       ├── InputSystem.ts
│       ├── ObstacleManager.ts
│       ├── PowerUpManager.ts
│       ├── ScoreManager.ts
│       ├── ShadowSystem.ts  # Plane switching logic
│       ├── TextureFactory.ts # Procedural graphics
│       └── Web3System.ts    # Wallet integration
├── react/                   # React UI layer
│   ├── components/
│   │   ├── GameCanvas.tsx   # Phaser container
│   │   ├── GameOverScreen.tsx
│   │   ├── HUD.tsx          # In-game overlay
│   │   └── MainMenu.tsx
│   └── hooks/
│       ├── useGameState.ts  # EventBus → React bridge
│       └── useWallet.ts     # Web3 state management
└── styles/
    └── global.css
```

### React ↔ Phaser Bridge

The game uses a clean bidirectional communication pattern:

**Phaser → React** (EventBus):
```typescript
EventBus.emit(GameEvents.SCORE_CHANGED, score);
// React hooks listen and update UI
```

**React → Phaser** (GameController):
```typescript
requestStart();    // Start game
requestDash();     // Trigger dash
requestPhase();    // Phase planes
```

## 🎨 Design Decisions

### Procedural Assets
All graphics and audio are generated at runtime using Canvas API and Web Audio API. This keeps the bundle tiny and ensures pixel-perfect scaling.

### Frame-Time Safety
The game clamps delta time to prevent "teleport deaths" caused by frame spikes (tab refocus, GC pauses). A 50ms ceiling ensures hazards never spawn on top of the player.

### Gasless Scoring
Uses `personal_sign` instead of transactions, making score submission free and instant. The signature proves the score without requiring gas or a deployed contract.

### Difficulty Tuning
All gameplay values live in `GameConfig.ts` for easy rebalancing without hunting through code.

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run Oxlint
```

### Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `.oxlintrc.json` - Linting rules
- `src/game/config/GameConfig.ts` - All gameplay tunables
- `src/game/config/Web3Config.ts` - Network settings

### Tuning Gameplay

All "magic numbers" are centralized in `GameConfig.ts`:

```typescript
export const SPEED = {
  START: 360,           // Initial scroll speed
  MAX: 820,             // Maximum speed
  RAMP_PER_SEC: 6.5,    // Speed increase per second
};
```

Modify these values to rebalance difficulty without touching system code.

### Adding Features

The modular system architecture makes adding features straightforward:
1. Create a new system in `src/game/systems/`
2. Initialize it in `GameScene.create()`
3. Update it in `GameScene.update()`
4. Emit events to sync with React UI

## 📝 License

[Add your license here]

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with:
- [Phaser 3](https://phaser.io/) - Game framework
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Hemi Network](https://hemi.xyz/) - Blockchain infrastructure

---

**Happy Running! 🏃‍♂️💨**
