# Quick Reference Guide

Essential commands and information for Hemi Shadow Runner.

## 🎮 Game Information

**Live Game**: https://hemi-shadow-runner.pages.dev  
**Contract**: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`  
**Network**: Hemi Mainnet (Chain ID: 43111)  
**Explorer**: https://explorer.hemi.xyz  

---

## 📦 Installation

```bash
git clone https://github.com/Valcio13/Hemi-Shadow-Runner.git
cd hemi-shadow-runner
npm install
cp .env.example .env
npm run dev
```

---

## ⚡ Quick Commands

### Development
```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
npm test                 # Run tests
```

### Smart Contract
```bash
# Deployment
npm run deploy:game:mainnet        # Deploy to mainnet
npm run deploy:game:testnet        # Deploy to testnet

# Verification
npm run verify:mainnet             # Verify on mainnet explorer

# Utilities
npm run check-player-stats         # Check player on-chain stats
npm run get-deployment-block       # Find contract deployment block
```

### Leaderboard (Optional)
```bash
npm run leaderboard:fetch:mainnet  # Manual fetch (not needed for real-time)
npm run leaderboard:fetch:testnet  # Testnet version
```

---

## 🎯 Game Controls

| Action | Keys | Alternative |
|--------|------|-------------|
| **Jump** | `SPACE` / `UP` / `W` | Left-click / Tap |
| **Phase Shift** | `SHIFT` / `F` | Right-click / 2-finger tap |
| **Dash** | `E` | (when meter full) |
| **Mute** | `M` | Click 🔊 button |

---

## 📊 Key Features

### Blockchain
- ✅ On-chain scoring (Hemi Mainnet)
- ✅ Real-time leaderboard (30s refresh)
- ✅ Deterministic RNG
- ✅ Gas optimized (~150-200k gas/game)

### Gameplay
- ✅ Dual-plane mechanics
- ✅ 3 power-ups
- ✅ Dash system
- ✅ Dynamic difficulty

### Social
- ✅ Twitter/X sharing
- ✅ Challenge mode
- ✅ Player statistics
- ✅ Achievements

---

## 🔧 Configuration

### Environment Variables (.env)
```bash
DEPLOYER_PRIVATE_KEY=your_key_here  # For deployment only
```

### Network Config
```typescript
// src/game/config/Web3Config.ts
export const HEMI_MAINNET = {
  chainId: 43111,
  name: 'Hemi Mainnet',
  rpcUrls: ['https://rpc.hemi.network/rpc'],
  blockExplorerUrls: ['https://explorer.hemi.xyz']
};
```

### Contract Address
```typescript
// src/game/config/Web3Config.ts
export const WEB3 = {
  SCORE_CONTRACT: '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe'
};
```

---

## 📁 Project Structure

```
hemi-shadow-runner/
├── src/
│   ├── game/              # Phaser game code
│   ├── react/             # React UI components
│   └── contracts/         # Contract ABIs & types
├── contracts/             # Solidity contracts
├── scripts/               # Deployment & utility scripts
├── docs/                  # Documentation
├── test/                  # Tests
└── public/                # Static assets
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Main documentation |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current project state |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | This file |
| [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md) | Full docs index |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Getting started |
| [docs/MAINNET_DEPLOYMENT.md](docs/MAINNET_DEPLOYMENT.md) | Deployment guide |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Operations guide |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## 🚨 Troubleshooting

### Leaderboard not loading?
```javascript
// Clear cache in browser console
localStorage.removeItem('leaderboard-cache');
```

### Transaction failing?
- Check you're on Hemi Mainnet (Chain ID: 43111)
- Ensure you have enough ETH for gas
- Verify wallet is connected

### Build errors?
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Can't connect wallet?
- Install MetaMask
- Add Hemi network manually:
  - RPC: https://rpc.hemi.network/rpc
  - Chain ID: 43111
  - Currency: ETH

---

## 🔗 Quick Links

- **Play**: https://hemi-shadow-runner.pages.dev
- **Contract**: https://explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe
- **GitHub**: https://github.com/Valcio13/Hemi-Shadow-Runner
- **Hemi Network**: https://hemi.xyz
- **Hemi Bridge**: https://app.hemi.xyz/en/bridge
- **Docs**: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)

---

## 📊 Contract Functions (Read)

```typescript
// Get player stats
contract.getPlayerStats(address) 
// Returns: { bestScore, gamesPlayed }

// Get session info
contract.sessions(sessionId)
// Returns: { player, gameSeed, startBlock, score, completed }

// Check if paused
contract.paused()
// Returns: boolean
```

## 📊 Contract Functions (Write)

```typescript
// Start new game
contract.startGame()
// Generates session with RNG seed

// Submit score
contract.submitScore(sessionId, score)
// Records score on-chain
```

---

## 💡 Tips

### For Players
- Collect coins to fill dash meter
- Use phase shift to pass through barriers
- Power-ups stack and combine
- Share scores to challenge friends

### For Developers
- All graphics are procedural (no image files)
- Deterministic RNG ensures fair play
- Events are indexed by client in real-time
- Contract is non-upgradeable

### For Deployers
- Always test on testnet first
- Verify contract after deployment
- Update frontend config with new address
- Announce to community before migration

---

## 🎓 Learning Resources

### Game Development
- [Phaser Docs](https://photonstorm.github.io/phaser3-docs/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Blockchain
- [Hemi Docs](https://docs.hemi.xyz/)
- [ethers.js Docs](https://docs.ethers.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

### Web3 Integration
- [docs/SMART_CONTRACT_GUIDE.md](docs/SMART_CONTRACT_GUIDE.md)
- [docs/SEEDED_RNG_INTEGRATION.md](docs/SEEDED_RNG_INTEGRATION.md)

---

## 📈 Performance

### Metrics
- **Initial Load**: 2-5s (first time) / <100ms (cached)
- **Leaderboard Refresh**: 30 seconds auto / instant manual
- **Player Stats Refresh**: 30 seconds
- **Gas per Game**: ~150-200k

### Optimization
- Browser localStorage caching
- Incremental event scanning
- Efficient contract design
- No server dependencies

---

## 🛡️ Security

### Contract
- ✅ Verified source code
- ✅ Ownable (emergency functions)
- ✅ Pausable (emergency stop)
- ✅ ReentrancyGuard
- ✅ No arbitrary external calls

### Frontend
- ✅ HTTPS only
- ✅ No private keys in code
- ✅ Read-only RPC access
- ✅ User signs own transactions

---

## 🎯 Next Steps

1. **Play the Game**: https://hemi-shadow-runner.pages.dev
2. **Read Docs**: [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)
3. **Check Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md)
4. **Deploy Own**: [docs/MAINNET_DEPLOYMENT.md](docs/MAINNET_DEPLOYMENT.md)
5. **Contribute**: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

**Last Updated**: August 7, 2026  
**Version**: 1.1.0  
**Status**: Production - Live on Mainnet
