# 🎮 Hemi Shadow Runner

A fast-paced endless runner game with full blockchain integration, built on the Hemi network. Master the art of jumping, dashing, and **phasing between shadow planes** while competing on a global leaderboard!

![Hemi Shadow Runner](https://img.shields.io/badge/Phaser-3.80-blue) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Hemi](https://img.shields.io/badge/Hemi-Sepolia-orange) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)

## ✨ What's New

**🎉 Latest Features**:
- ✅ **Player Statistics** - Track your performance, view achievements, and see your rank
- ✅ **Social Sharing** - Share your scores on Twitter/X and challenge friends
- ✅ **Challenge Mode** - Accept challenges and compete directly with friends
- ✅ **Cumulative Leaderboard** - All your scores count toward your total ranking
- ✅ **On-Chain Verification** - Every score is recorded on Hemi blockchain
- ✅ **Deterministic Gameplay** - Seeded RNG ensures fair competition

## 🌟 Features

### Core Gameplay
- **Dual-Plane Mechanic**: Phase between Light and Shadow planes to pass through barriers
- **Dynamic Difficulty**: Speed and obstacle density increase as you survive
- **Dash System**: Fill your meter by collecting coins, unleash speed-boosting dash with invincibility
- **Power-ups**:
  - 🌟 **Genesis Shard**: 2× coin multiplier (10s)
  - ⏱️ **Chrono Fragment**: Slow down time (8s)
  - 💚 **Recovery Protocol**: Extra life with invulnerability (instant)
- **Procedural Assets**: All graphics and audio generated at runtime - zero image/audio files
- **Responsive Controls**: Forgiving mechanics with coyote time and input buffering

### Blockchain Integration
- **On-Chain Scoring**: Every game recorded on Hemi blockchain
- **Smart Contract**: Minimal, gas-optimized game session management
- **Global Leaderboard**: Cumulative scoring system with top 100 rankings
- **Player Stats**: Track games played, best score, total score, and rank
- **Transaction Status**: Real-time feedback during blockchain interactions
- **Deterministic RNG**: On-chain seeds ensure verifiable gameplay

### Social Features
- **Share Scores**: One-click sharing to Twitter/X with formatted text
- **Challenge System**: Generate challenge links for friends to beat your score
- **Challenge Mode**: In-game banner shows target score and live progress
- **On-Chain Proof**: Every shared score includes blockchain verification link
- **Clipboard Sharing**: Copy formatted text for Discord, Telegram, WhatsApp, etc.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or Web3 wallet (for blockchain features)
- Hemi Sepolia testnet ETH ([Get from faucet](https://testnet.explorer.hemi.xyz/faucet))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hemi-shadow-runner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your private key (for deployment only)

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
| Phase Shift | `SHIFT` / `F` | Right-click / Two-finger tap |
| Dash | `E` | (when meter is full) |
| Mute | `M` | Click 🔊 button |

### Game Mechanics

1. **Jump over obstacles** on the ground (red boxes of varying heights)
2. **Phase between planes** to pass through tall barriers:
   - Light plane: Blue barriers visible
   - Shadow plane: Purple barriers visible
3. **Collect coins** (orange circles) to:
   - Increase your score (+25 points each)
   - Fill your dash meter
   - Genesis Shard multiplies coin value by 2×
4. **Activate dash** when meter is full (press `E`) for:
   - Temporary invincibility (smash through obstacles!)
   - Speed boost for extra points
   - Coin magnet effect (auto-collect nearby coins)
5. **Collect power-ups** for special abilities:
   - 🌟 Genesis Shard: 2× coin multiplier (10 seconds)
   - ⏱️ Chrono Fragment: Slow motion (8 seconds)
   - 💚 Recovery Protocol: Extra life + brief invulnerability
6. **Survive as long as possible** - passive score increases with distance

### Advanced Techniques

- **Coin Hopping**: Press jump while collecting an airborne coin for a mid-air bounce
- **Coyote Time**: 90ms grace period after leaving the ground to still jump
- **Jump Buffering**: Press jump slightly before landing - executes on touchdown
- **Strategic Phasing**: 500ms cooldown between phases - plan your switches!
- **Dash Timing**: Use dash to smash obstacles or escape tight situations
- **Power-up Stacking**: Genesis Shard + Dash = massive coin collection

## 🔗 Blockchain Features

### On-Chain Game Sessions

Every game is a verifiable on-chain session:

1. **Start Game** → Contract generates unique session ID + deterministic seed
2. **Play Game** → RNG uses on-chain seed for fair obstacle generation
3. **Submit Score** → Score recorded permanently on blockchain
4. **View Stats** → Track all your games, best scores, and rankings

**Contract Address**: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe` (Hemi Sepolia)

### Player Statistics

Access your stats from the main menu:
- **Games Played**: Total completed games
- **Total Score**: Cumulative score across all games
- **Best Game**: Your highest single-game score  
- **Average Score**: Mean score per game
- **Leaderboard Rank**: Your position in global rankings
- **Recent Games**: Last 5 games with transaction links
- **Achievements**: Unlockable badges based on performance

**Achievements**:
- 🎮 First Blood - Play your first game
- 🔥 Dedicated - Play 10+ games
- ⭐ 1K Club - Score 1,000+ in a single game
- 💎 Elite Player - Score 5,000+ in a single game
- 👑 Top 10 - Reach top 10 on leaderboard
- 🏆 Champion - Rank #1 on leaderboard

### Leaderboard System

**Cumulative Scoring**: Your total score = sum of all games played

The leaderboard displays:
- Rank (with emoji indicators: 🥇🥈🥉🏅⭐)
- Player address (links to Hemi Explorer)
- Total cumulative score
- Best single-game score
- Total games played
- Last played timestamp

Auto-refreshes every 30 seconds while viewing.

### Social Sharing & Challenges

**Share Your Score**:
1. Finish a game
2. Click "🎉 Share Score" button
3. Choose sharing method:
   - **Twitter/X**: Pre-filled tweet with score, challenge link, and on-chain proof
   - **Copy Text**: Formatted text for Discord, Telegram, etc.
   - **Challenge Link**: Direct URL for friends to beat your score

**Challenge Mode**:
- Friends click your challenge link (e.g., `?challenge=1234`)
- In-game banner shows target score during gameplay
- Banner turns green when beating the challenge
- Game over shows challenge result (won/lost)

**Example Share Text**:
```
🎮 I just scored 1,234 points in Shadow Runner on @hemi_xyz!

🪙 Collected 50 coins
⚡ Phase-shifting through light and shadow

Think you can beat my score? 👀

🔗 Challenge link: https://yoursite.com?challenge=1234
✅ Verified on-chain: https://testnet.explorer.hemi.xyz/tx/0x...
```

### Connecting Your Wallet

1. Click "Play" on the main menu
2. Connect MetaMask (or compatible wallet)
3. Game prompts you to switch to **Hemi Sepolia Testnet**
4. Approve the game start transaction
5. Your scores are automatically submitted on-chain

**Need Testnet ETH?** Get it from the [Hemi Sepolia Faucet](https://testnet.explorer.hemi.xyz/faucet)

### Network Configuration

**Current Network**: Hemi Sepolia (Testnet)
- Chain ID: `743111` (`0xb56c7`)
- RPC: `https://testnet.rpc.hemi.network/rpc`
- Explorer: `https://testnet.explorer.hemi.xyz`
- Contract: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`

**Switching to Mainnet**: 
1. Deploy contract to Hemi mainnet
2. Update `DEFAULT_CHAIN` in `src/game/config/Web3Config.ts` to `HEMI_MAINNET`
3. Update `SCORE_CONTRACT` address

### Smart Contract

The **ShadowRunnerGame** smart contract provides:
- ✅ Game session management (start/submit)
- ✅ Deterministic RNG seed generation
- ✅ Player statistics tracking
- ✅ Gas-optimized struct packing (single storage slot)
- ✅ Event emissions for indexing
- ✅ Verifiable on-chain scores

**Contract Features**:
```solidity
// Start a new game session
function startGame() external returns (uint256 sessionId, uint32 gameSeed)

// Submit your final score
function submitScore(uint256 sessionId, uint16 score) external

// View player stats
function getPlayerStats(address player) external view returns (PlayerStats memory)
```

**Deploy Your Own Contract**:
```bash
npm run compile              # Compile contracts
npm run test:contract        # Run contract tests
npm run deploy:game:testnet  # Deploy to Hemi Sepolia
npm run verify              # Verify on block explorer
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Game Engine**: Phaser 3.80
- **Smart Contracts**: Solidity 0.8.20
- **Build Tool**: Vite 5
- **Blockchain**: Hemi Network (Sepolia testnet)
- **Web3**: ethers.js v6
- **Linting**: Oxlint
- **Testing**: Hardhat + Chai

### Project Structure

```
hemi-shadow-runner/
├── contracts/                  # Smart contracts
│   ├── ShadowRunnerGame.sol    # Main game contract
│   └── archive/                # Old contract versions
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── CHANGELOG.md            # Version history
│   ├── CONTRACT_DESIGN.md      # Contract design decisions
│   ├── CONTRACT_DEPLOYMENT.md  # Deployment guide
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── PLAYER_STATS_FEATURE.md # Player stats docs
│   ├── PROJECT_STRUCTURE.md    # Project organization
│   ├── QUICKSTART.md           # Quick start guide
│   ├── SEEDED_RNG_INTEGRATION.md # RNG system docs
│   ├── SMART_CONTRACT_GUIDE.md # Contract integration
│   ├── SMART_CONTRACT_SUMMARY.md
│   └── SOCIAL_FEATURES.md      # Social features docs
├── scripts/                    # Deployment & utility scripts
│   ├── deploy-game.cjs         # Deploy game contract
│   ├── fetch-leaderboard.cjs   # Index blockchain events
│   ├── interact-game.ts        # Contract interaction
│   └── archive/                # Old scripts
├── src/
│   ├── game/                   # Phaser game engine code
│   │   ├── config/
│   │   │   ├── GameConfig.ts   # Gameplay tunables
│   │   │   └── Web3Config.ts   # Network & contract config
│   │   ├── entities/
│   │   │   └── Player.ts       # Player physics & controls
│   │   ├── scenes/
│   │   │   ├── BootScene.ts    # Asset generation
│   │   │   └── GameScene.ts    # Main gameplay scene
│   │   ├── systems/            # Modular game systems
│   │   │   ├── AudioSystem.ts  # Procedural Web Audio
│   │   │   ├── BarrierManager.ts
│   │   │   ├── CoinManager.ts
│   │   │   ├── DashSystem.ts
│   │   │   ├── InputSystem.ts
│   │   │   ├── ObstacleManager.ts
│   │   │   ├── PowerUpManager.ts
│   │   │   ├── ScoreManager.ts
│   │   │   ├── SeededRNG.ts    # Deterministic RNG
│   │   │   ├── ShadowSystem.ts # Plane switching
│   │   │   ├── TextureFactory.ts # Procedural graphics
│   │   │   └── Web3System.ts   # Blockchain integration
│   │   ├── EventBus.ts         # Game event system
│   │   └── GameController.ts   # React ↔ Phaser bridge
│   ├── react/                  # React UI layer
│   │   ├── components/
│   │   │   ├── ChallengeBanner.tsx # In-game challenge display
│   │   │   ├── GameCanvas.tsx  # Phaser container
│   │   │   ├── GameOverScreen.tsx # Game over UI
│   │   │   ├── HUD.tsx         # In-game overlay
│   │   │   ├── Leaderboard.tsx # Global leaderboard
│   │   │   ├── MainMenu.tsx    # Main menu
│   │   │   ├── PlayerStats.tsx # Player statistics
│   │   │   ├── ShareScore.tsx  # Social sharing modal
│   │   │   └── TransactionStatus.tsx # TX feedback
│   │   └── hooks/
│   │       ├── useChallenge.ts # Challenge state
│   │       ├── useGameState.ts # EventBus → React bridge
│   │       ├── usePlayerStats.ts # Stats fetching
│   │       └── useWallet.ts    # Web3 state
│   ├── contracts/              # Contract types & ABIs
│   │   ├── game-types.ts       # ShadowRunnerGame types
│   │   └── types.ts            # Legacy types
│   └── styles/
│       └── global.css          # All styles
├── test/                       # Contract tests
│   ├── ShadowRunnerGame.test.ts
│   └── archive/
├── public/                     # Static assets
│   └── leaderboard.json        # Cached leaderboard data
├── hardhat.config.cjs          # Hardhat configuration
├── package.json                # Dependencies & scripts
└── vite.config.ts              # Vite build config
```

### React ↔ Phaser Bridge

The game uses a clean bidirectional communication pattern via `EventBus` and `GameController`:

**Phaser → React** (EventBus for state updates):
```typescript
// Game systems emit events
EventBus.emit(GameEvents.SCORE_CHANGED, score);
EventBus.emit(GameEvents.GAME_OVER, { score, coins, elapsed });

// React hooks listen and update UI
useGameState() subscribes to events and triggers re-renders
```

**React → Phaser** (GameController for actions):
```typescript
// React components call controller functions
requestStart();        // Start new game
requestDash();         // Trigger dash ability
requestPhase();        // Toggle shadow plane
requestToggleMute();   // Mute/unmute audio
```

### Blockchain Architecture

**Smart Contract → Game Flow**:
```
1. Connect Wallet (React)
   ↓
2. Call startGame() → Get sessionId + gameSeed (Web3System)
   ↓
3. Initialize SeededRNG with gameSeed (GameScene)
   ↓
4. Play game with deterministic obstacles (Game Systems)
   ↓
5. On death, auto-submit score (GameScene)
   ↓
6. Call submitScore(sessionId, score) (Web3System)
   ↓
7. Update leaderboard via event indexing (fetch-leaderboard.cjs)
```

**Event Indexing**:
```
GameFinished events → fetch-leaderboard.cjs → leaderboard.json → React components
```

## 🎨 Design Decisions

### Procedural Assets
All graphics and audio are generated at runtime using Canvas API and Web Audio API. This keeps the bundle tiny (~500KB) and ensures pixel-perfect scaling at any resolution.

### Deterministic Gameplay (Seeded RNG)
Every game session uses an on-chain generated seed (uint32) for obstacle/coin/power-up placement. This ensures:
- Fair competition - same seed = same obstacles
- Verifiable gameplay - can replay with same seed
- No client-side randomness manipulation
- Blockchain-backed fairness

See: `docs/SEEDED_RNG_INTEGRATION.md`

### Frame-Time Safety
The game clamps delta time to prevent "teleport deaths" caused by frame spikes (tab refocus, GC pauses). A 50ms ceiling ensures hazards never spawn on top of the player during lag spikes.

### Cumulative Leaderboard
Unlike traditional leaderboards showing only best scores, we track total cumulative score across all games. This:
- Rewards consistency and dedication
- Encourages multiple playthroughs
- Creates more engaging competition
- Values total contribution over single runs

### On-Chain Score Submission
Scores are automatically submitted when the player dies (if wallet connected). This:
- Removes manual submission step
- Ensures all games are recorded
- Provides immediate blockchain confirmation
- Simplifies UX

### Gas Optimization
Contract uses struct packing to fit entire GameSession in a single storage slot (31 bytes), minimizing gas costs:
```solidity
struct GameSession {
    address player;      // 20 bytes
    uint32 gameSeed;     // 4 bytes
    uint32 startBlock;   // 4 bytes
    uint16 finalScore;   // 2 bytes (max 65,535)
    bool finished;       // 1 byte
}  // Total: 31 bytes (single slot)
```

### Difficulty Tuning
All gameplay values live in `GameConfig.ts` for easy rebalancing:
```typescript
export const SPEED = {
  START: 360,           // Initial scroll speed (px/s)
  MAX: 820,             // Maximum speed
  RAMP_PER_SEC: 6.5,    // Speed increase per second
};
```

## 🛠️ Development

### Available Scripts

**Development**:
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run Oxlint
```

**Smart Contracts**:
```bash
npm run compile              # Compile Solidity contracts
npm run test:contract        # Run contract tests
npm run test:game            # Test specific contract
npm run deploy:game:testnet  # Deploy to Hemi Sepolia
npm run deploy:game:mainnet  # Deploy to Hemi mainnet
npm run verify               # Verify contract on explorer
npm run interact:game        # Interact with deployed contract
```

**Leaderboard**:
```bash
npm run leaderboard:fetch    # Fetch leaderboard from blockchain
npm run leaderboard:watch    # Auto-update on file changes
```

### Environment Variables

Create `.env` file for contract deployment:
```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC endpoints
HEMI_SEPOLIA_RPC=https://testnet.rpc.hemi.network/rpc
HEMI_MAINNET_RPC=https://rpc.hemi.network/rpc
```

### Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration  
- `hardhat.config.cjs` - Hardhat (Solidity) configuration
- `.oxlintrc.json` - Linting rules
- `src/game/config/GameConfig.ts` - All gameplay tunables
- `src/game/config/Web3Config.ts` - Network & contract settings

### Tuning Gameplay

All "magic numbers" are centralized in `GameConfig.ts`:

```typescript
// Speed settings
export const SPEED = {
  START: 360,
  MAX: 820,
  RAMP_PER_SEC: 6.5,
};

// Obstacle spawning
export const OBSTACLES = {
  MIN_DISTANCE: 450,
  MAX_DISTANCE: 850,
  // ... more settings
};

// Power-up durations
export const POWERUP = {
  GENESIS: { DURATION_MS: 10000 },
  CHRONO: { DURATION_MS: 8000, TIME_SCALE: 0.4 },
  // ... more settings
};
```

Modify these values to rebalance difficulty without touching system code.

### Adding Features

The modular system architecture makes adding features straightforward:

1. **Create a new system** in `src/game/systems/`:
```typescript
export class MyNewSystem {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  update(delta: number) {
    // System logic
  }
}
```

2. **Initialize in GameScene**:
```typescript
create() {
  this.mySystem = new MyNewSystem(this);
}
```

3. **Update each frame**:
```typescript
update(time: number, delta: number) {
  this.mySystem.update(delta);
}
```

4. **Emit events** to sync with React UI:
```typescript
EventBus.emit(GameEvents.MY_EVENT, data);
```

### Testing

**Contract Tests**:
```bash
npm run test:contract
```

Tests cover:
- ✅ Game session creation
- ✅ Score submission
- ✅ Player stats tracking
- ✅ Event emissions
- ✅ Access control
- ✅ Edge cases

**Manual Testing Checklist**:
- [ ] Connect wallet and approve network switch
- [ ] Start game and verify sessionId received
- [ ] Play and verify obstacles are consistent per seed
- [ ] Submit score and verify transaction
- [ ] Check leaderboard updates
- [ ] View player stats
- [ ] Share score on Twitter
- [ ] Create and accept challenge
- [ ] Test all power-ups
- [ ] Verify achievements unlock

## 📚 Documentation

Comprehensive documentation in `/docs`:

- **[QUICKSTART.md](docs/QUICKSTART.md)** - Get started quickly
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design overview
- **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - File organization
- **[SMART_CONTRACT_GUIDE.md](docs/SMART_CONTRACT_GUIDE.md)** - Contract integration
- **[CONTRACT_DESIGN.md](docs/CONTRACT_DESIGN.md)** - Design decisions
- **[CONTRACT_DEPLOYMENT.md](docs/CONTRACT_DEPLOYMENT.md)** - Deployment guide
- **[SEEDED_RNG_INTEGRATION.md](docs/SEEDED_RNG_INTEGRATION.md)** - RNG system
- **[PLAYER_STATS_FEATURE.md](docs/PLAYER_STATS_FEATURE.md)** - Stats system
- **[SOCIAL_FEATURES.md](docs/SOCIAL_FEATURES.md)** - Sharing & challenges
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history
- **[IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** - Implementation notes

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel
```

3. **Or deploy to Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Leaderboard Indexer Service

Set up automatic leaderboard updates:

**Option 1: Cron Job (Linux/Mac)**:
```bash
# Edit crontab
crontab -e

# Add line to run every 5 minutes
*/5 * * * * cd /path/to/project && npm run leaderboard:fetch
```

**Option 2: GitHub Actions**:
```yaml
# .github/workflows/update-leaderboard.yml
name: Update Leaderboard
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run leaderboard:fetch
      - run: git add public/leaderboard.json
      - run: git commit -m "Update leaderboard" || exit 0
      - run: git push
```

**Option 3: Serverless Function**:
Deploy `scripts/fetch-leaderboard.cjs` as a serverless function on Vercel/Netlify with scheduled execution.

### Contract Deployment

**Deploy to Hemi Sepolia**:
```bash
npm run deploy:game:testnet
```

**Deploy to Hemi Mainnet**:
```bash
# Update .env with mainnet deployer key
npm run deploy:game:mainnet
```

**Verify on Explorer**:
```bash
npm run verify -- --network hemiSepolia <CONTRACT_ADDRESS>
```

**Update Frontend Config**:
```typescript
// src/game/config/Web3Config.ts
export const WEB3 = {
  SCORE_CONTRACT: '0xYourNewContractAddress',
  // ...
};
```

## 🔒 Security Considerations

- **Contract is immutable** - No upgrade mechanism (by design)
- **No admin functions** - Fully decentralized
- **Score capped at uint16** - Max 65,535 to prevent overflow
- **Session validation** - Only session owner can submit score
- **No reentrancy risk** - No external calls in critical functions
- **Deterministic RNG** - Uses on-chain entropy, not predictable

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

**Areas for contribution**:
- Additional power-ups
- New obstacle types
- Mobile optimization
- Sound effects improvements
- Accessibility features
- Translations
- Bug fixes

## 🙏 Acknowledgments

Built with:
- [Phaser 3](https://phaser.io/) - HTML5 game framework
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Hemi Network](https://hemi.xyz/) - Bitcoin-secured Ethereum rollup
- [ethers.js](https://docs.ethers.org/) - Ethereum library
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [OpenZeppelin](https://www.openzeppelin.com/) - Solidity libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Hemi Docs**: [Hemi Network Documentation](https://docs.hemi.xyz/)
- **Contract**: [`0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`](https://testnet.explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe)

---

**Happy Running! 🏃‍♂️💨**

*Built with ❤️ on Hemi Network*
