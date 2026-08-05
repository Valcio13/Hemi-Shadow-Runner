# 🚀 Quick Start Guide

Get your Hemi Shadow Runner game up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- MetaMask wallet
- Hemi Sepolia testnet ETH ([get from Discord](https://discord.gg/hemixyz))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Compile & Test Contract

```bash
# Compile the smart contract
npm run compile

# Run tests (should all pass)
npm run test:game
```

Expected output:
```
  ShadowRunnerGame
    ✓ Deployment
    ✓ Starting Game (12 tests)
    ✓ Submitting Score (9 tests)
    ✓ View Functions (5 tests)
    
  30 passing (2s)
```

## Step 3: Deploy to Testnet

```bash
# Add your private key to .env
cp .env.example .env
# Edit .env and add PRIVATE_KEY=your_key_here

# Deploy to Hemi Sepolia
npm run deploy:game:testnet
```

Save the contract address from the output!

## Step 4: Test Contract Interaction

```bash
# Test the deployed contract
CONTRACT_ADDRESS=0xYourAddress npm run interact:game
```

This will:
- Start a game session
- Get a random seed
- Submit a test score
- Display your stats

## Step 5: Index the Leaderboard

```bash
# Create leaderboard from on-chain events
CONTRACT_ADDRESS=0xYourAddress npm run index:leaderboard
```

This exports all game scores to a JSON file for your database.

## Step 6: Integrate with Game

Update `src/game/config/Web3Config.ts`:

```typescript
export const WEB3 = {
  SUBMISSION_MODE: 'contract',
  APP_TAG: 'Hemi Shadow Runner',
  SCORE_CONTRACT: '0xYourDeployedAddress', // Add this!
} as const;
```

## Step 7: Use the Seeded RNG

In your game code:

```typescript
import { SeededRNG } from './game/systems/SeededRNG';

// After startGame() transaction
const { sessionId, gameSeed } = await contract.startGame();

// Initialize deterministic RNG
const rng = new SeededRNG(gameSeed);

// Use in gameplay
const obstacleX = rng.nextInt(100, 800);
const coinY = rng.nextFloat() * 200;
```

## Step 8: Submit Scores

At game over:

```typescript
// Submit score to contract
const tx = await contract.submitScore(sessionId, finalScore);
await tx.wait();

// Fetch updated stats
const stats = await contract.getPlayerStats(playerAddress);
console.log('Best Score:', stats.bestScore);
console.log('Games Played:', stats.gamesPlayed);
```

## 🎮 Ready to Play!

Your game is now connected to the blockchain!

### What Just Happened?

✅ **Smart contract deployed** - Manages game sessions on-chain  
✅ **Deterministic RNG** - Seeds from blockchain for fair gameplay  
✅ **Player stats tracked** - Best score and games played on-chain  
✅ **Leaderboard indexed** - All scores available via events  

### Gas Costs

- **Start Game**: ~$1-2 (creates session + gets seed)
- **Submit Score**: ~$1-2 (updates stats)
- **Total per game**: ~$2-4

### Next Steps

1. **Build your game** - Use the seeded RNG for deterministic gameplay
2. **Set up leaderboard API** - Import indexed data to database
3. **Deploy to mainnet** - When ready, use `npm run deploy:game:mainnet`
4. **Enter contest** - Submit your project!

## 📚 Documentation

- **Contract Design**: [CONTRACT_DESIGN.md](CONTRACT_DESIGN.md)
- **Full Deployment Guide**: [CONTRACT_DEPLOYMENT.md](CONTRACT_DEPLOYMENT.md)
- **Smart Contract Guide**: [SMART_CONTRACT_GUIDE.md](SMART_CONTRACT_GUIDE.md)

## 🆘 Troubleshooting

### "Insufficient funds"
Get testnet ETH from [Hemi Discord](https://discord.gg/hemixyz) #faucet channel

### "Session already finished"
Each session can only submit once. Start a new game with `startGame()`

### "Not your session"
You can only submit scores for sessions you created

### Tests failing?
```bash
# Clean and reinstall
rm -rf node_modules cache artifacts
npm install
npm run compile
npm run test:game
```

## 🎯 Pro Tips

1. **Save sessionId in localStorage** - So players don't lose progress on refresh
2. **Cache the RNG state** - For pause/resume functionality
3. **Test determinism** - Same seed should give same gameplay
4. **Monitor gas costs** - Optimize if needed
5. **Index events continuously** - Keep leaderboard up-to-date

---

**Happy building!** 🚀 Need help? Check the docs or ask in [Hemi Discord](https://discord.gg/hemixyz).
