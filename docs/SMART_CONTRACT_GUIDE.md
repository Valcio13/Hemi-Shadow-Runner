# 🎮 Smart Contract Integration Guide

Complete guide for integrating the ShadowRunnerLeaderboard smart contract with your Hemi Shadow Runner game.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Contract Features](#contract-features)
4. [Deployment](#deployment)
5. [Integration](#integration)
6. [Testing](#testing)
7. [FAQs](#faqs)

## Overview

The **ShadowRunnerLeaderboard** smart contract provides on-chain score tracking for Hemi Shadow Runner. Players can submit scores, view leaderboards, and track their stats - all stored permanently on the Hemi blockchain.

### Why On-Chain?

- **Transparency**: Scores are publicly verifiable
- **Permanence**: Data never disappears
- **Trust**: No central authority can manipulate scores
- **Composability**: Other apps can use your leaderboard data
- **Innovation**: Foundation for NFT rewards, tournaments, etc.

### Architecture

```
Player → Game → Web3System → Smart Contract → Hemi Blockchain
                                     ↓
                              Leaderboard Data
```

## Quick Start

### 1. Install Contract Dependencies

```bash
npm install
```

### 2. Compile Contract

```bash
npm run compile
```

### 3. Run Tests

```bash
npm run test:contract
```

### 4. Deploy to Testnet

```bash
# Set up .env with your PRIVATE_KEY
npm run deploy:testnet
```

### 5. Test Interaction

```bash
CONTRACT_ADDRESS=0xYourAddress npm run interact
```

## Contract Features

### ✅ Implemented

- [x] **Score Submission** - Players submit scores with coin count
- [x] **Global Leaderboard** - Top 100 all-time scores
- [x] **Daily Leaderboards** - Reset every 24 hours
- [x] **Player Statistics** - High score, total games, coins
- [x] **Anti-Cheat** - Session ID prevents duplicates
- [x] **Admin Controls** - Pause, remove scores, configure
- [x] **Gas Optimized** - Efficient storage patterns
- [x] **Signature Verification** - Optional off-chain validation

### 🔮 Potential Future Features

- [ ] **NFT Achievements** - Mint NFTs for milestones
- [ ] **Token Rewards** - Distribute tokens to top players
- [ ] **Tournaments** - Time-boxed competitions with prizes
- [ ] **Team Leaderboards** - Clan/guild rankings
- [ ] **Proof of Play** - ZK proofs for score validation
- [ ] **Staking** - Stake tokens to submit (anti-cheat)

## Deployment

### Prerequisites

- MetaMask wallet with ETH on Hemi Sepolia
- Node.js 18+
- Basic understanding of smart contracts

### Step-by-Step

**1. Environment Setup**

```bash
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

**2. Get Testnet Tokens**

Visit [Hemi Discord](https://discord.gg/hemixyz) → #faucet:
```
/faucet your_wallet_address
```

**3. Deploy Contract**

```bash
npm run deploy:testnet
```

**4. Save Contract Address**

Copy the deployed address from console output:
```
✅ ShadowRunnerLeaderboard deployed to: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3
```

**5. Verify Contract**

Auto-verifies during deployment. Manual verification:
```bash
npx hardhat verify --network hemiSepolia \
  0xYourAddress \
  "0.1.0"
```

### Deployment Costs

| Network | Cost (ETH) | Cost (USD)* |
|---------|-----------|-------------|
| Testnet | 0.00 | $0 (free testnet tokens) |
| Mainnet | ~0.075 | ~$150 |

*Assuming $2000/ETH

## Integration

### Step 1: Update Configuration

**File**: `src/game/config/Web3Config.ts`

```typescript
export const WEB3 = {
  SUBMISSION_MODE: 'contract' as 'attestation' | 'contract', // Change this
  APP_TAG: 'Hemi Shadow Runner',
  SCORE_CONTRACT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3', // Add your address
} as const;
```

### Step 2: Add Contract Types

The types are already created in `src/contracts/types.ts`. Import them:

```typescript
import { LEADERBOARD_ABI, generateSessionId } from '../contracts/types';
```

### Step 3: Update Web3System

**File**: `src/game/systems/Web3System.ts`

Add contract submission method:

```typescript
import { ethers } from 'ethers';
import { LEADERBOARD_ABI, generateSessionId } from '../../contracts/types';

async submitScore(score: number, coins: number): Promise<Attestation | null> {
  if (WEB3.SUBMISSION_MODE === 'contract') {
    return this.submitScoreToContract(score, coins);
  }
  // ... existing attestation code
}

private async submitScoreToContract(
  score: number, 
  coins: number
): Promise<Attestation | null> {
  if (!this.provider || !this.state.address) {
    this.patch({ error: 'Connect a wallet first.' });
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      WEB3.SCORE_CONTRACT,
      LEADERBOARD_ABI,
      signer
    );

    // Generate unique session ID
    const sessionId = generateSessionId(
      this.state.address,
      score,
      Date.now()
    );

    // Submit transaction
    const tx = await contract.submitScore(
      BigInt(score),
      BigInt(coins),
      sessionId
    );

    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed:', receipt.hash);
    
    this.patch({ error: null });
    
    return {
      address: this.state.address,
      score,
      coins,
      timestamp: Date.now(),
      message: `Score ${score} submitted on-chain`,
      signature: receipt.hash, // Use tx hash as signature
      chainId: this.state.chainId ?? DEFAULT_CHAIN.chainId,
    };
  } catch (err) {
    console.error('Contract submission failed:', err);
    this.patch({ error: this.describe(err) });
    return null;
  }
}
```

### Step 4: Add ethers.js Dependency

```bash
npm install ethers
```

Update `package.json`:
```json
{
  "dependencies": {
    "ethers": "^6.10.0",
    "phaser": "^3.80.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### Step 5: Display Leaderboard (Optional)

Create a new component `src/react/components/Leaderboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { LEADERBOARD_ABI, Score, formatScore, shortenAddress } from '../../contracts/types';
import { WEB3 } from '../../game/config/Web3Config';
import { DEFAULT_CHAIN } from '../../game/config/Web3Config';

export function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const provider = new ethers.JsonRpcProvider(DEFAULT_CHAIN.rpcUrls[0]);
        const contract = new ethers.Contract(
          WEB3.SCORE_CONTRACT,
          LEADERBOARD_ABI,
          provider
        );

        const data = await contract.getGlobalLeaderboard(0, 10);
        setScores(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    if (WEB3.SCORE_CONTRACT) {
      fetchLeaderboard();
    }
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (!scores.length) return <div>No scores yet!</div>;

  return (
    <div className="leaderboard">
      <h2>🏆 Global Leaderboard</h2>
      <ol>
        {scores.map((score, index) => (
          <li key={index}>
            <span className="rank">#{index + 1}</span>
            <span className="player">{shortenAddress(score.player)}</span>
            <span className="score">{formatScore(score.score)}</span>
            <span className="coins">{formatScore(score.coins)} 🪙</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

## Testing

### Unit Tests

Test the smart contract:

```bash
npm run test:contract
```

Expected output:
```
  ShadowRunnerLeaderboard
    Deployment
      ✓ Should set the right owner
      ✓ Should set the correct game version
    Score Submission
      ✓ Should submit a score successfully
      ✓ Should prevent duplicate submissions
    Leaderboard Management
      ✓ Should maintain correct order
      ✓ Should handle pagination
      
  37 passing (2s)
```

### Integration Testing

**1. Test Contract Interaction**

```bash
CONTRACT_ADDRESS=0xYourAddress npm run interact
```

**2. Test Game with Contract**

```bash
# Update Web3Config with contract address
# Set SUBMISSION_MODE to 'contract'
npm run dev
```

Play the game and verify:
- Score submission transaction appears in wallet
- Transaction confirms on-chain
- Score appears on leaderboard
- Player stats update correctly

**3. Test Edge Cases**

- Submit with same session ID (should fail)
- Submit with score = 0 (should fail)
- Submit without wallet connected (should fail)
- Check gas costs are reasonable

### Testnet vs. Mainnet

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Cost | Free | Real ETH |
| Speed | Same | Same |
| Permanence | May reset | Forever |
| Users | Developers | Real players |
| Use for | Testing | Production |

**Always test on testnet first!**

## FAQs

### Q: How much does it cost to submit a score?

**A**: On Hemi Sepolia testnet, it's free (test tokens). On mainnet, approximately $3-5 per submission depending on gas prices.

### Q: Can I edit or delete a score after submission?

**A**: No, scores are permanent once on-chain. Only the contract owner can remove fraudulent scores.

### Q: What prevents cheating?

**A**: 
1. Session IDs prevent duplicate submissions
2. Timestamp tracking
3. Manual review by contract owner
4. (Future) Zero-knowledge proofs

### Q: Do I need the contract for the game to work?

**A**: No! The game works with gasless signatures (attestation mode). The contract is optional but adds on-chain leaderboards.

### Q: Can I upgrade the contract later?

**A**: This contract is not upgradeable. To upgrade, deploy a new contract and update the game config.

### Q: What if the contract has a bug?

**A**: The owner can pause submissions. For serious issues, deploy a new contract.

### Q: How do I switch from testnet to mainnet?

**A**:
1. Deploy to mainnet: `npm run deploy:mainnet`
2. Update `Web3Config.ts` with mainnet contract address
3. Change `DEFAULT_CHAIN` to `HEMI_MAINNET`
4. Test thoroughly!
5. Deploy game to production

### Q: Can other games use my leaderboard?

**A**: Yes! The contract is publicly accessible. Other developers can read your leaderboard data.

### Q: How do I add prize rewards?

**A**: The current contract doesn't handle rewards. For v2, consider:
- Sending tokens to top players
- Minting achievement NFTs
- Tournament prize pools

### Q: What about privacy?

**A**: All data is public on-chain. Player addresses and scores are visible to anyone.

## 🔗 Resources

- **Contract Source**: `contracts/ShadowRunnerLeaderboard.sol`
- **Contract Docs**: `contracts/README.md`
- **Deployment Guide**: `CONTRACT_DEPLOYMENT.md`
- **Type Definitions**: `src/contracts/types.ts`
- **Hemi Docs**: https://docs.hemi.xyz/
- **Discord**: https://discord.gg/hemixyz

## 🆘 Need Help?

1. Check contract docs: `contracts/README.md`
2. Review deployment guide: `CONTRACT_DEPLOYMENT.md`
3. Search existing issues on GitHub
4. Ask in Hemi Discord #dev-support
5. Open a new issue with:
   - What you're trying to do
   - What happened
   - Error messages
   - Network (testnet/mainnet)

## ✅ Checklist

Before going to production:

- [ ] Contract tested on testnet
- [ ] All contract tests passing
- [ ] Game integration tested
- [ ] Score submission working
- [ ] Leaderboard display working
- [ ] Gas costs acceptable
- [ ] Error handling robust
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on contract admin
- [ ] Emergency procedures documented
- [ ] Community announcement prepared

---

**Built with ❤️ for the Hemi Network**

*Happy building!* 🚀
