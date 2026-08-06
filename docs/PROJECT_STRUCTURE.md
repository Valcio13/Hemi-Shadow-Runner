# Project Structure

This document describes the organization of the Hemi Shadow Runner project.

## Root Directory

```
hemi-shadow-runner/
├── contracts/          # Smart contracts
├── docs/              # Documentation
├── public/            # Static assets
├── scripts/           # Deployment and utility scripts
├── src/               # Source code
├── test/              # Contract tests
├── .env.example       # Environment variables template
├── hardhat.config.cjs # Hardhat configuration
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite build configuration
└── README.md          # Project overview
```

## Contracts

```
contracts/
├── ShadowRunnerGame.sol      # Active game contract (DEPLOYED)
├── README.md                 # Contract documentation
└── archive/                  # Old/unused contracts
    └── ShadowRunnerLeaderboard.sol
```

**Active Contract:**
- `ShadowRunnerGame.sol` - Minimal on-chain game session management
- Deployed to: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe` (Hemi Sepolia)
- Verified: https://testnet.explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe

## Documentation

```
docs/
├── PROJECT_STRUCTURE.md         # This file
├── ARCHITECTURE.md              # System architecture
├── CONTRACT_DESIGN.md           # Contract design rationale
├── SEEDED_RNG_INTEGRATION.md   # RNG implementation details
├── DEPLOYMENT.md                # Deployment guide
├── CONTRIBUTING.md              # Contribution guidelines
├── QUICKSTART.md                # Quick start guide
├── CHANGELOG.md                 # Version history
├── SMART_CONTRACT_GUIDE.md      # Contract usage guide
├── SMART_CONTRACT_SUMMARY.md    # Contract summary
├── CONTRACT_DEPLOYMENT.md       # Deployment process
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
└── NEW_CONTRACT_README.md       # New contract guide
```

## Scripts

```
scripts/
├── deploy-game.cjs              # Deploy ShadowRunnerGame (ACTIVE)
├── fetch-leaderboard.cjs        # Fetch on-chain scores (ACTIVE)
├── interact-game.ts             # Interact with game contract
└── archive/                     # Old/unused scripts
    ├── deploy.ts
    ├── deploy-game.ts
    ├── interact.ts
    └── index-leaderboard.ts
```

**Active Scripts:**
- `deploy-game.cjs` - Deploys the game contract
- `fetch-leaderboard.cjs` - Reads `GameFinished` events and builds leaderboard
- `interact-game.ts` - CLI for testing contract interactions

## Source Code

```
src/
├── game/                        # Phaser game code
│   ├── config/                  # Game configuration
│   │   ├── GameConfig.ts        # Gameplay constants
│   │   └── Web3Config.ts        # Blockchain config
│   ├── entities/                # Game entities
│   │   └── Player.ts            # Player sprite
│   ├── scenes/                  # Phaser scenes
│   │   ├── BootScene.ts         # Asset loading
│   │   └── GameScene.ts         # Main gameplay
│   ├── systems/                 # Game systems
│   │   ├── AudioSystem.ts       # Sound management
│   │   ├── BarrierManager.ts    # Plane-locked barriers
│   │   ├── CoinManager.ts       # Coin spawning/collection
│   │   ├── DashSystem.ts        # Dash mechanic
│   │   ├── InputSystem.ts       # Player input
│   │   ├── ObstacleManager.ts   # Obstacle spawning
│   │   ├── PowerUpManager.ts    # Power-up system
│   │   ├── ScoreManager.ts      # Score tracking
│   │   ├── SeededRNG.ts         # Deterministic RNG
│   │   ├── ShadowSystem.ts      # Plane switching
│   │   ├── TextureFactory.ts    # Procedural graphics
│   │   └── Web3System.ts        # Blockchain integration
│   ├── EventBus.ts              # Game events
│   ├── GameController.ts        # React ↔ Phaser bridge
│   └── PhaserGame.ts            # Phaser instance
│
├── react/                       # React UI components
│   ├── components/
│   │   ├── GameCanvas.tsx       # Phaser canvas wrapper
│   │   ├── GameOverScreen.tsx   # Game over overlay
│   │   ├── HUD.tsx              # In-game HUD
│   │   ├── Leaderboard.tsx      # Leaderboard display
│   │   ├── MainMenu.tsx         # Main menu
│   │   └── TransactionStatus.tsx # TX status overlay
│   └── hooks/
│       ├── useGameState.ts      # Game state management
│       └── useWallet.ts         # Wallet connection
│
├── contracts/                   # Contract types/ABIs
│   ├── game-types.ts            # ShadowRunnerGame types
│   └── types.ts                 # Legacy types
│
├── styles/                      # CSS styles
│   └── global.css               # Global styles
│
├── App.tsx                      # Root React component
└── main.tsx                     # App entry point
```

## Tests

```
test/
├── ShadowRunnerGame.test.ts     # Game contract tests (ACTIVE)
└── archive/
    └── ShadowRunnerLeaderboard.test.ts
```

## Public Assets

```
public/
├── leaderboard.json             # Generated leaderboard data
├── favicon.svg                  # Site favicon
├── icons.svg                    # Game icons
└── astronaut-run.png            # Character sprite
```

## Build Artifacts (Ignored)

These directories are generated and not tracked in git:

- `node_modules/` - Dependencies
- `dist/` - Production build
- `cache/` - Hardhat cache
- `artifacts/` - Compiled contracts
- `leaderboard-cache.json` - Leaderboard indexer cache

## Configuration Files

- `.env` - Environment variables (not tracked)
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `.oxlintrc.json` - Linter configuration
- `hardhat.config.cjs` - Hardhat settings
- `tsconfig.json` - TypeScript compiler options
- `vite.config.ts` - Vite build settings
- `package.json` - Project metadata and dependencies

## Key Features by Directory

### `/contracts`
- Minimal smart contract for on-chain game sessions
- Deterministic seed generation
- Event emission for leaderboard indexing

### `/scripts`
- Deployment automation
- Event indexing for leaderboard
- Contract interaction utilities

### `/src/game`
- Full 2D endless runner gameplay
- Shadow plane mechanic
- Deterministic gameplay with SeededRNG
- Web3 integration for on-chain sessions

### `/src/react`
- React UI overlays
- Wallet connection
- Transaction status feedback
- Leaderboard display

### `/docs`
- Comprehensive documentation
- Architecture diagrams
- Implementation guides
- Contribution guidelines

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Compile contracts**: `npm run compile`
3. **Run tests**: `npm run test:game`
4. **Deploy contract**: `npm run deploy:game:testnet`
5. **Fetch leaderboard**: `npm run leaderboard:fetch`
6. **Build for production**: `npm run build`

## Deployment

- **Smart Contract**: Hemi Sepolia Testnet
- **Frontend**: Not yet deployed (local dev only)
- **Leaderboard**: Fetched on-demand from blockchain events

---

**Last Updated**: August 2026  
**Contract Version**: v1.0.0  
**Game Version**: v0.1.0
