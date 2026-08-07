# Changelog

All notable changes to Hemi Shadow Runner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Current Development

### Added

**Player Statistics System**
- Comprehensive stats tracking (games played, total score, best score, average)
- 6 unlockable achievements (First Blood, Dedicated, 1K Club, Elite Player, Top 10, Champion)
- Recent games history with transaction links
- Leaderboard rank display with emoji indicators
- Auto-refresh stats every 30 seconds
- "📊 Your Stats" button in main menu

**Social Features**
- Score sharing to Twitter/X with one click
- Challenge mode with shareable links (`?challenge=score`)
- In-game challenge banner showing live progress
- Challenge result display on game over (won/lost)
- Multiple sharing options (Twitter, clipboard, challenge link)
- On-chain proof links in shared content
- Formatted share text with emojis and hashtags

**Challenge Mode**
- URL parameter parsing for challenge links
- Dynamic in-game banner with progress indicator  
- Color-coded feedback (red when chasing, green when winning)
- Challenge result celebration on game over
- Target score tracking and comparison

**Transaction Status UI**
- Real-time transaction feedback (started, pending, success, error)
- Positioned in top-right corner during gameplay
- Auto-dismiss after completion (3s success, 5s error)
- Links to Hemi Explorer for each transaction
- Event-driven updates (TX_STARTED, TX_PENDING, TX_SUCCESS, TX_ERROR)

**Cumulative Leaderboard**
- Total score tracking across all games (not just best)
- Event indexer script (`fetch-leaderboard.cjs`)
- Top 100 rankings with cumulative and best scores
- Auto-refresh every 30 seconds
- Player search and rank display
- npm scripts: `leaderboard:fetch` and `leaderboard:watch`

**Deterministic RNG System**
- Seeded RNG using xorshift32 algorithm
- On-chain seed generation from smart contract
- Verifiable gameplay with consistent obstacle patterns
- All game systems use deterministic randomness (ObstacleManager, CoinManager, BarrierManager, PowerUpManager)
- RNG passed via getter function to systems
- Comprehensive documentation in SEEDED_RNG_INTEGRATION.md

### Changed

**Score Submission Flow**
- Changed from manual button to automatic submission on death
- Removed old attestation UI from game over screen
- Simplified game over screen to focus on replay and sharing
- TransactionStatus component now shows all transaction feedback
- Scores automatically submitted when player dies (if wallet connected)

**GameOverScreen Simplification**
- Removed wallet connection UI (now in main menu only)
- Added "🎉 Share Score" button
- Added challenge result display
- Removed manual submit button
- Streamlined for better UX

**Contract Mode**
- Switched from signature-based attestation to full on-chain submission
- Every game creates blockchain session with unique ID
- All scores permanently recorded on Hemi blockchain
- SessionId and txHash tracked for sharing

**Project Organization**
- Moved all documentation to `/docs` folder
- Archived old contracts to `contracts/archive/`
- Archived old scripts to `scripts/archive/`
- Archived old tests to `test/archive/`
- Added `leaderboard-cache.json` to .gitignore
- Created PROJECT_STRUCTURE.md documentation

### Documentation

- Added `PLAYER_STATS_FEATURE.md` - Complete player stats documentation
- Added `SOCIAL_FEATURES.md` - Social sharing and challenge system docs
- Added `SEEDED_RNG_INTEGRATION.md` - Deterministic RNG implementation
- Updated `README.md` with all new features
- Updated `PROJECT_STRUCTURE.md` with new files
- Enhanced `CHANGELOG.md` with detailed version history
- Reorganized all docs to `/docs` folder

### Fixed

- Transaction confirmation edge cases
- Event parsing for sessionId and gameSeed
- Network switching UX
- Leaderboard refresh race conditions
- Stats display for new players (0 games)

---

## [0.2.0] - 2024-12-XX

### Added

**Smart Contract Integration**
- Deployed `ShadowRunnerGame` contract on Hemi Sepolia
- Contract address: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`
- On-chain game session management (startGame/submitScore)
- Deterministic RNG seed generation from blockchain
- Player statistics tracking in contract
- Event emissions for leaderboard indexing (GameStarted, GameFinished, NewHighScore)
- Gas-optimized struct packing (31 bytes per session)

**Blockchain Event Indexer**
- `fetch-leaderboard.cjs` script to index GameFinished events
- Generates `leaderboard.json` from blockchain data
- Reads last 10,000 blocks for recent games
- Cumulative score calculation
- npm scripts for manual and watch mode
- Caching system to avoid re-fetching same events

**Contract Verification**
- Verified contract on Hemi Sepolia explorer
- Readable method names and events
- Public source code visibility
- Used: `npx hardhat verify --network hemiSepolia <address>`

**Enhanced Web3System**
- `startGame()` - Create on-chain session
- `submitScoreOnChain()` - Submit score with session validation
- Session ID management
- Game seed extraction from events
- Error handling for all contract interactions

### Changed

- Updated Web3System to use contract interactions instead of attestations
- Switched from attestation to on-chain submission
- Enhanced GameController for session management
- Improved transaction flow with status updates
- GameScene now uses on-chain seed for RNG initialization

### Technical Details

**Contract Design**
```solidity
struct GameSession {
    address player;      // 20 bytes
    uint32 gameSeed;     // 4 bytes
    uint32 startBlock;   // 4 bytes
    uint16 finalScore;   // 2 bytes (max 65,535)
    bool finished;       // 1 byte
}  // Total: 31 bytes (single storage slot)
```

**Event Indexing**
- Processes GameFinished events
- Builds cumulative leaderboard
- Sorts by total score (descending)
- Updates `public/leaderboard.json`

### Fixed

- Transaction confirmation edge cases
- Event parsing for sessionId and gameSeed
- Network switching UX
- Session validation in contract

---

## [0.1.0] - 2024-11-XX

### 🎮 Initial Release

The first playable version of Hemi Shadow Runner featuring core gameplay mechanics and blockchain foundation.

#### Added

**Core Gameplay**
- Endless runner mechanics with responsive jump controls
- Dual-plane shadow system with phase toggle (SHIFT/F)
- Dash system with meter charging via coin collection
- Obstacle spawning with difficulty scaling
- Coin collection with score rewards (+25 per coin)
- Plane-locked barriers requiring phase to pass
- High score tracking with localStorage persistence
- Dynamic difficulty (speed increases over time)

**Controls**
- Jump with SPACE, UP arrow, W, or left-click
- Phase between planes with SHIFT, F, or right-click
- Dash with E key (when meter is full)
- Mute toggle with M key
- Responsive touch/mouse controls

**Power-ups**
- Genesis Shard: 2× coin multiplier (10s duration)
- Chrono Fragment: World time slowdown to 40% (8s duration)
- Recovery Protocol: Extra life with invulnerability window

**Visual & Audio**
- Procedurally generated graphics (TextureFactory)
- Procedurally synthesized audio (Web Audio API)
- Squash & stretch player animation
- Landing dust particle effects
- Camera shake on impact
- Plane-specific color schemes
- Parallax scrolling backgrounds (stars, mountains)
- Dash trail afterimages

**UI Components**
- Main menu with attract mode
- In-game HUD showing score, coins, dash meter, plane indicator
- Power-up status indicators
- Game over screen with score breakdown
- High score display
- Mute button

**Web3 Integration**
- Wallet connection via MetaMask (EIP-1193)
- Hemi Sepolia testnet support (default)
- Hemi Mainnet configuration (ready to enable)
- Automatic chain switching
- EIP-1193 provider integration for wallet connection
- Transaction signing and submission
- Error handling for wallet interactions

**Developer Experience**
- TypeScript throughout
- React 18 + Phaser 3.80 architecture
- Clean React ↔ Phaser bridge pattern (EventBus + GameController)
- Modular system design
- Centralized configuration (GameConfig.ts, Web3Config.ts)
- Vite for fast builds
- Oxlint for linting
- Comprehensive code documentation

**Game Feel Improvements**
- Coyote time (90ms grace window after leaving ground)
- Jump buffering (110ms buffer before landing)
- Coin hop mechanic (mid-air bounce on collection)
- Frame-time clamping to prevent teleport deaths (50ms max delta)
- Object pooling for performance
- Invincibility during dash and post-revive

**Configuration**
- All gameplay values in GameConfig.ts
- Network settings in Web3Config.ts
- Mute state persistence
- High score persistence

### Technical Details

**Bundle Size**
- Total: ~450KB (uncompressed)
- Zero image assets (all procedural)
- Zero audio assets (all synthesized)
- Minimal Web3 dependencies (ethers.js v6)

**Performance**
- Steady 60fps on modern devices
- Frame-time safety via delta clamping
- Efficient collision detection
- Object pooling for all game entities

**Browser Support**
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers with touch support

**Blockchain**
- Hemi Sepolia testnet (default)
- Hemi Mainnet ready
- EIP-1193 provider support

---

## Version History Summary

- **v0.1.0** - Initial release with core gameplay and Web3 foundation
- **v0.2.0** - Smart contract integration, on-chain sessions, and leaderboard
- **vNext (Unreleased)** - Social features, player stats, and enhanced UX

---

## Upgrade Guide

### From v0.1.0 to v0.2.0
1. Update `.env` with private key for contract deployment
2. Run `npm install` to get latest dependencies  
3. Deploy contract: `npm run deploy:game:testnet`
4. Update `SCORE_CONTRACT` in `Web3Config.ts`
5. Run leaderboard indexer: `npm run leaderboard:fetch`
6. Update frontend config to use contract mode

### From v0.2.0 to vNext
1. No contract redeployment needed (immutable contract)
2. Run `npm install` for new dependencies
3. Test new features (stats, sharing, challenges)
4. Set up leaderboard auto-update (cron job or GitHub Actions)
5. No breaking changes - fully backward compatible

---

## Known Issues

- Mobile touch controls need optimization
- Leaderboard refresh on slow connections may timeout
- Challenge URL persists in browser until manually cleared
- Very high scores (>65,535) are capped by uint16 contract limit
- Power-up Recovery Protocol sometimes triggers slightly late

---

## Roadmap

See GitHub issues for planned features and improvements.

**Upcoming (v0.3.0)**:
- NFT rewards for achievements
- Tournament system
- Discord bot integration
- Mobile app (React Native)
- Additional power-ups
- More obstacle types

**Future (v1.0.0)**:
- Mainnet deployment
- Token rewards system
- Multiplayer race mode
- Character customization
- Seasonal events

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to help improve Hemi Shadow Runner.

## License

MIT License - see LICENSE file for details.

