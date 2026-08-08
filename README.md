# 🎮 Hemi Shadow Runner

A fast-paced endless runner with blockchain integration on Hemi Network. Phase between light and shadow planes, collect coins, compete on-chain.

![Hemi Shadow Runner](https://img.shields.io/badge/Phaser-3.80-blue) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Hemi](https://img.shields.io/badge/Hemi-Mainnet-green)

> 🎮 **[Play Now](https://hemi-shadow-runner.valcio222.workers.dev/)** | 📜 **[View Contract](https://explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe)** | 📚 **[Full Docs](docs/DOCUMENTATION_INDEX.md)**

## ✨ Key Features

- **� Dual-Plane Mechanic** - Phase between Light and Shadow to pass through barriers
- **💨 Dash System** - Collect coins to unleash speed boost with invincibility
- **🎯 Power-ups** - Genesis Shard (2× coins), Chrono Fragment (slow-mo), Recovery Protocol (extra life)
- **⛓️ On-Chain Scoring** - Every game recorded on Hemi blockchain with deterministic RNG
- **🏆 Global Leaderboard** - Real-time cumulative rankings, top 100 players
- **📊 Player Stats** - Track games played, best score, rank, and achievements
- **🤝 Social Features** - Share scores and challenge friends on Twitter/X
- **📱 Mobile Support** - Full touch controls and mobile wallet integration
- **🎨 100% Procedural** - All graphics and audio generated at runtime (no asset files)

## 🚀 Quick Start

### For Players

**Desktop:**
1. Open [the game](https://hemi-shadow-runner.valcio222.workers.dev/)
2. Connect MetaMask (game will prompt you to add Hemi Network)
3. Click Play to start
4. Use `SPACE` to jump, `SHIFT` to phase shift, `E` to dash

**Mobile:**
1. Install [MetaMask Mobile](https://metamask.io/download/) or [Trust Wallet](https://trustwallet.com/)
2. Open game in wallet's browser or connect when prompted
3. Tap screen to jump, use buttons for phase shift and dash

**Need ETH?** Bridge from Ethereum at [Hemi Bridge](https://app.hemi.xyz/en/bridge)

### For Developers

```bash
# Clone and install
git clone <repository-url>
cd hemi-shadow-runner
npm install

# Start dev server
npm run dev
```

**Deploy contracts:**
```bash
npm run compile              # Compile Solidity
npm run test:contract        # Run tests
npm run deploy:game:mainnet  # Deploy to mainnet
```

## 🎯 How to Play

| Action | Desktop | Mobile |
|--------|---------|--------|
| Jump | `SPACE` / `UP` / `W` / Click | Tap screen |
| Phase Shift | `SHIFT` / `F` / Right-click | ⚡ Button |
| Dash | `E` (when meter full) | � Button |

**Gameplay Tips:**
- Jump over ground obstacles (red boxes)
- Phase between planes to pass through tall barriers (blue/purple)
- Collect coins (+25 points, fills dash meter)
- Use dash for invincibility and speed boost
- Power-ups: 🌟 2× coins, ⏱️ slow-mo, 💚 extra life

**Advanced:** Coyote time (90ms grace), jump buffering, coin hopping mid-air

📖 **Detailed guide:** [docs/QUICKSTART.md](docs/QUICKSTART.md)

## ⛓️ Blockchain Features

**Contract:** [`0xD2c7...dfEe`](https://explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe) on Hemi Mainnet

- **On-chain sessions:** Every game uses blockchain-generated seed for fair RNG
- **Auto-submission:** Scores automatically recorded when you die
- **Real-time leaderboard:** Updates every 30s directly from blockchain
- **Cumulative scoring:** Total score across all games determines rank
- **Player stats:** Games played, best score, achievements, rank history
- **Gas optimized:** Entire game session fits in single storage slot (31 bytes)

📖 **Deep dive:** [docs/SMART_CONTRACT_GUIDE.md](docs/SMART_CONTRACT_GUIDE.md)

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Game Engine:** Phaser 3.80
- **Blockchain:** Hemi Network (Mainnet)
- **Smart Contracts:** Solidity 0.8.20 + Hardhat + OpenZeppelin
- **Web3:** ethers.js v6
- **Testing:** Hardhat + Chai

**Architecture highlights:**
- EventBus for Phaser → React communication
- GameController for React → Phaser commands
- Modular game systems (AudioSystem, DashSystem, etc.)
- Deterministic SeededRNG for fair gameplay
- 100% procedural graphics (no image files)

📖 **Full architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🛠️ Development

**Available Scripts:**
```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run linter

# Smart Contracts
npm run compile                # Compile contracts
npm run test:contract          # Run contract tests
npm run deploy:game:mainnet    # Deploy to Hemi mainnet
npm run deploy:game:testnet    # Deploy to testnet
npm run verify                 # Verify on explorer
```

**Environment Setup:**
```bash
# .env (only needed for contract deployment)
PRIVATE_KEY=your_private_key_here
```

**Tune Gameplay:**
All settings in `src/game/config/GameConfig.ts`:
```typescript
export const SPEED = {
  START: 360,      // Initial speed (px/s)
  MAX: 820,        // Max speed
  RAMP_PER_SEC: 6.5
};
```

📖 **Contributing guide:** [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 📚 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get playing fast
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design
- **[Smart Contract Guide](docs/SMART_CONTRACT_GUIDE.md)** - Blockchain integration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Host your own
- **[Full Documentation Index](docs/DOCUMENTATION_INDEX.md)** - All docs

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional power-ups or obstacles
- Mobile optimization
- Accessibility features
- Translations
- Bug fixes

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

For third-party assets and their licenses, see [ATTRIBUTION.md](ATTRIBUTION.md).

## 🙏 Acknowledgments

Built with [Phaser](https://phaser.io/), [React](https://react.dev/), [Hemi Network](https://hemi.xyz/), [ethers.js](https://docs.ethers.org/), [Hardhat](https://hardhat.org/), and [OpenZeppelin](https://www.openzeppelin.com/).

Music: "Gameotoon" by [slimeyfox](https://pixabay.com/users/slimeyfox-40601508/) (Pixabay License)

---

**🎮 [Play Now](https://hemi-shadow-runner.valcio222.workers.dev/)** | Built with ❤️ on Hemi Network
