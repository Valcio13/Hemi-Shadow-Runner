# Mainnet Deployment Guide

## 🎯 Pre-Deployment Checklist

### 1. Contract Review ✅
- [x] Contract fully tested on testnet
- [x] No critical security issues
- [x] Gas optimization complete
- [x] Contract is immutable (no upgradeability needed)
- [x] All events properly indexed

**Current Testnet Contract:**
- Address: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`
- Network: Hemi Sepolia (Chain ID: 743111)
- Status: ✅ Working perfectly

### 2. Code Audit
- [ ] **Review contract code one final time**
- [ ] **Run all tests**: `npm test`
- [ ] **Check for compiler warnings**
- [ ] **Verify gas costs are acceptable**

### 3. Wallet Preparation
- [ ] **Create/use dedicated deployment wallet**
- [ ] **Fund wallet with mainnet ETH** (estimate: ~0.005 ETH for deployment)
- [ ] **Backup private key securely**
- [ ] **NEVER commit private key to git**

### 4. Environment Setup
- [ ] **Copy `.env.example` to `.env`**
- [ ] **Add PRIVATE_KEY to `.env`**
- [ ] **Verify HEMI_RPC is correct**

---

## 📋 Deployment Steps

### Step 1: Final Testing on Testnet

```bash
# Run full test suite
npm test

# Compile contracts
npx hardhat compile

# Verify no warnings or errors
```

### Step 2: Deploy to Hemi Mainnet

```bash
# Deploy the contract
npx hardhat run scripts/deploy-game.cjs --network hemi
```

**Expected Output:**
```
🚀 Deploying ShadowRunnerGame to Hemi Mainnet...
✅ Contract deployed to: 0x... (SAVE THIS ADDRESS!)
⛽ Gas used: ~XXX,XXX
💰 Deployment cost: ~0.00X ETH
🔍 Verify at: https://explorer.hemi.xyz/address/0x...
```

### Step 3: Verify Contract on Explorer

```bash
# Verify contract source code
npx hardhat verify --network hemi <CONTRACT_ADDRESS>
```

### Step 4: Update Frontend Configuration

Update `src/game/config/Web3Config.ts`:

```typescript
// Change from testnet to mainnet
export const DEFAULT_CHAIN: ChainParams = HEMI_MAINNET; // ← Change this

export const WEB3 = {
  SUBMISSION_MODE: 'contract' as 'attestation' | 'contract',
  APP_TAG: 'Hemi Shadow Runner',
  SCORE_CONTRACT: '0xYOUR_MAINNET_CONTRACT_ADDRESS', // ← Update this
} as const;
```

### Step 5: Test Mainnet Integration Locally

```bash
# Build the frontend
npm run build

# Test locally with mainnet config
npm run dev
```

**Test checklist:**
- [ ] Connect wallet to Hemi mainnet
- [ ] Start a game (creates on-chain session)
- [ ] Complete a game (submits score on-chain)
- [ ] Verify transaction on explorer
- [ ] Check leaderboard updates

### Step 6: Update Leaderboard Script

Update `scripts/fetch-leaderboard.cjs`:

```javascript
// Change contract address to mainnet
const CONTRACT_ADDRESS = '0xYOUR_MAINNET_CONTRACT_ADDRESS';
```

Update `.github/workflows/update-leaderboard.yml`:

```yaml
# Change network from hemiSepolia to hemi
- name: Fetch leaderboard from blockchain
  run: npx hardhat run scripts/fetch-leaderboard.cjs --network hemi
```

### Step 7: Deploy Frontend to Production

```bash
# Commit changes
git add .
git commit -m "feat: Deploy to Hemi mainnet"
git push origin main

# Cloudflare Pages will auto-deploy
```

### Step 8: Verify Production

1. **Visit your production URL**
2. **Connect wallet** (ensure it's on Hemi mainnet)
3. **Play a test game**
4. **Verify score on explorer**
5. **Check leaderboard updates** (wait ~10 min for GitHub Actions)

---

## 🔧 Configuration Files to Update

### 1. Web3Config.ts
```typescript
// Line 46: Change network
export const DEFAULT_CHAIN: ChainParams = HEMI_MAINNET;

// Line 57: Update contract address
SCORE_CONTRACT: '0xYOUR_MAINNET_ADDRESS',
```

### 2. fetch-leaderboard.cjs
```javascript
// Line 10: Update contract address
const CONTRACT_ADDRESS = '0xYOUR_MAINNET_ADDRESS';

// Optional: Update deployment block for faster first sync
const DEPLOYMENT_BLOCK = 1234567; // Your mainnet deployment block
```

### 3. .github/workflows/update-leaderboard.yml
```yaml
# Line 23: Change network
run: npx hardhat run scripts/fetch-leaderboard.cjs --network hemi
```

### 4. README.md
```markdown
# Update contract address in setup instructions
Contract Address: `0xYOUR_MAINNET_ADDRESS` (Hemi Mainnet)
```

---

## 💰 Cost Estimates

### Deployment Costs (Hemi Mainnet)
- **Contract Deployment**: ~0.003-0.005 ETH
- **Verification**: Free

### Player Costs Per Game
- **Start Game**: ~0.0001-0.0003 ETH (~30k gas)
- **Submit Score**: ~0.0002-0.0004 ETH (~60k gas)
- **Total Per Game**: ~0.0003-0.0007 ETH

**Note:** Hemi has very low gas fees compared to Ethereum mainnet!

---

## 🚨 Important Security Notes

### Private Key Safety
- ✅ **DO**: Store in `.env` (gitignored)
- ✅ **DO**: Use environment variables in CI/CD
- ✅ **DO**: Use a dedicated deployment wallet
- ❌ **DON'T**: Commit to git
- ❌ **DON'T**: Share in Discord/Telegram
- ❌ **DON'T**: Use your main wallet

### Contract Immutability
- Contract **CANNOT** be upgraded
- Contract **CANNOT** be paused
- Any bugs require new deployment
- Double-check everything before deploying!

---

## 📊 Post-Deployment Monitoring

### Day 1
- [ ] Monitor first 10 games
- [ ] Check gas costs are as expected
- [ ] Verify leaderboard updates correctly
- [ ] Watch for any error reports

### Week 1
- [ ] Check contract balance (should be 0)
- [ ] Monitor gas usage trends
- [ ] Review player feedback
- [ ] Check leaderboard integrity

### Ongoing
- [ ] GitHub Actions runs every 10 minutes
- [ ] Leaderboard auto-updates
- [ ] Monitor block explorer for activity

---

## 🔄 Rollback Plan

If issues are found after mainnet deployment:

### Option 1: Deploy New Contract
1. Fix the issue in code
2. Deploy new contract to mainnet
3. Update frontend config
4. Redeploy frontend
5. Announce migration to users

### Option 2: Keep Both
- Keep old contract running
- Deploy new contract alongside
- Let users choose (migration period)
- Eventually sunset old contract

**Note:** All existing scores on old contract will remain on-chain forever (blockchain is permanent).

---

## 📞 Support

After deployment, monitor these channels:
- GitHub Issues: Bug reports
- Discord/Community: User feedback
- Block Explorer: Transaction monitoring
- GitHub Actions: Leaderboard updates

---

## ✅ Final Checklist

Before clicking deploy:

- [ ] All tests passing
- [ ] Contract reviewed
- [ ] Wallet funded
- [ ] Environment variables set
- [ ] Gas estimates acceptable
- [ ] Team notified
- [ ] Backup plan ready

### After deployment:

- [ ] Contract verified on explorer
- [ ] Frontend config updated
- [ ] Leaderboard script updated
- [ ] GitHub Actions updated
- [ ] Frontend redeployed
- [ ] Production tested
- [ ] Team notified
- [ ] Documentation updated
- [ ] Users announced

---

## 🎉 You're Ready!

When you're confident everything is tested and ready:

```bash
# Deploy to mainnet
npx hardhat run scripts/deploy-game.cjs --network hemi
```

Good luck! 🚀
