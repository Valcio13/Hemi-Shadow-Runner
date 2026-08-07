# 🚀 Mainnet Deployment - Quick Start

## TL;DR - Deploy in 5 Steps

### 1️⃣ Pre-flight Check
```bash
npm run prepare:mainnet
```

### 2️⃣ Run Tests
```bash
npm run test:game
```

### 3️⃣ Deploy Contract
```bash
npm run deploy:game:mainnet
```
**💾 Save the contract address!**

### 4️⃣ Update Config

**File: `src/game/config/Web3Config.ts`**
```typescript
// Line 46
export const DEFAULT_CHAIN: ChainParams = HEMI_MAINNET; // ← Change this

// Line 57
SCORE_CONTRACT: '0xYOUR_MAINNET_ADDRESS', // ← Update this
```

### 5️⃣ Deploy Frontend
```bash
git add .
git commit -m "feat: Deploy to Hemi mainnet"
git push origin main
```

---

## 📝 Full Documentation

For detailed instructions, see: **[docs/MAINNET_DEPLOYMENT.md](docs/MAINNET_DEPLOYMENT.md)**

---

## ⚡ Quick Commands

| Task | Command |
|------|---------|
| Check preparation | `npm run prepare:mainnet` |
| Run tests | `npm run test:game` |
| Deploy to mainnet | `npm run deploy:game:mainnet` |
| Verify contract | `npm run verify:mainnet <ADDRESS>` |
| Fetch leaderboard (mainnet) | `npm run leaderboard:fetch:mainnet` |
| Build frontend | `npm run build` |

---

## 🔧 Files to Update After Deployment

1. **src/game/config/Web3Config.ts**
   - Change `DEFAULT_CHAIN` to `HEMI_MAINNET`
   - Update `SCORE_CONTRACT` address

2. **scripts/fetch-leaderboard.cjs**
   - Update `CONTRACT_ADDRESS` to mainnet address

3. **.github/workflows/update-leaderboard.yml**
   - Change `--network hemiSepolia` to `--network hemi`

4. **README.md**
   - Update contract address in docs

---

## 💰 Cost Estimate

- **Deployment**: ~0.003-0.005 ETH
- **Per Game**: ~0.0003-0.0007 ETH (player pays)

---

## ⚠️ Important

- ✅ Backup your private key
- ✅ Test on testnet first
- ✅ Double-check contract address
- ✅ Verify on block explorer
- ❌ Never commit private keys

---

## 🆘 Need Help?

- Full Guide: [docs/MAINNET_DEPLOYMENT.md](docs/MAINNET_DEPLOYMENT.md)
- Contract Guide: [docs/SMART_CONTRACT_GUIDE.md](docs/SMART_CONTRACT_GUIDE.md)
- Deployment Guide: [docs/CONTRACT_DEPLOYMENT.md](docs/CONTRACT_DEPLOYMENT.md)

---

**Ready? Let's deploy! 🎮**

```bash
npm run prepare:mainnet  # Check everything
npm run deploy:game:mainnet  # Deploy!
```
