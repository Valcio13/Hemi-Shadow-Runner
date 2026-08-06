# Smart Contract Deployment Guide

This guide walks you through deploying the ShadowRunnerLeaderboard smart contract to the Hemi network.

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] MetaMask or compatible Web3 wallet
- [x] ETH on Hemi Sepolia testnet (for testing)
- [x] ETH on Hemi Mainnet (for production)
- [x] Basic understanding of smart contracts

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Hardhat (Ethereum development environment)
- OpenZeppelin contracts (security-audited base contracts)
- TypeChain (TypeScript bindings for contracts)
- Testing libraries (Chai, Mocha)

### Step 2: Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```bash
PRIVATE_KEY=your_metamask_private_key_here
```

**⚠️ IMPORTANT**: 
- NEVER commit `.env` to version control
- Use a dedicated wallet for deployment (not your main wallet)
- For mainnet, use a hardware wallet

**How to get your private key from MetaMask**:
1. Open MetaMask
2. Click the three dots menu
3. Account Details → Show Private Key
4. Enter password → Copy private key

### Step 3: Get Testnet Tokens

Visit the [Hemi Discord](https://discord.gg/hemixyz) and request testnet tokens in the `#faucet` channel:

```
/faucet <your-wallet-address>
```

You'll receive test ETH on Hemi Sepolia within a few minutes.

### Step 4: Compile Contract

```bash
npm run compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### Step 5: Run Tests

```bash
npm run test:contract
```

All tests should pass:
```
  ShadowRunnerLeaderboard
    ✓ Deployment
    ✓ Score Submission  
    ✓ Leaderboard Management
    ✓ Admin Functions
    
  37 passing (2s)
```

### Step 6: Deploy to Testnet

```bash
npm run deploy:testnet
```

Expected output:
```
🚀 Deploying ShadowRunnerLeaderboard contract...
📦 Deploying with game version: 0.1.0
✅ ShadowRunnerLeaderboard deployed to: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3
🔍 View on explorer:
   https://testnet.explorer.hemi.xyz/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3

📝 Contract configuration:
   Game Version: 0.1.0
   Minimum Score: 100
   Max Leaderboard Size: 100
   Owner: 0xYourAddress

✅ Contract verified successfully!

🎮 Next steps:
1. Update src/game/config/Web3Config.ts with the contract address:
   SCORE_CONTRACT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3'
2. Update SUBMISSION_MODE to 'contract' in Web3Config.ts
3. Update src/game/systems/Web3System.ts to use the contract
4. Test on testnet before switching to mainnet
```

**Save this contract address!** You'll need it to integrate with the game.

### Step 7: Verify Contract (Optional)

The deployment script auto-verifies, but if it fails, manually verify:

```bash
npx hardhat verify --network hemiSepolia 0xYourContractAddress "0.1.0"
```

### Step 8: Test Contract Interaction

```bash
CONTRACT_ADDRESS=0xYourContractAddress npm run interact
```

This will:
- Submit a test score
- Display your player stats
- Show the leaderboard
- Verify everything works

## 🎯 Deploy to Mainnet

**⚠️ CRITICAL**: Only deploy to mainnet after thorough testing on testnet!

### Pre-Mainnet Checklist

- [ ] All tests pass
- [ ] Contract tested extensively on testnet
- [ ] Game tested with testnet contract
- [ ] No bugs or exploits found
- [ ] Adequate ETH in deployment wallet
- [ ] Backup of private key (secure location)
- [ ] Team reviewed contract code

### Mainnet Deployment

```bash
npm run deploy:mainnet
```

**Costs**: Deployment costs approximately $150-200 (depends on gas prices).

After deployment:
1. Update `Web3Config.ts` with mainnet contract address
2. Change `DEFAULT_CHAIN` to `HEMI_MAINNET`
3. Deploy updated game to production
4. Announce to community

## 🔧 Configuration

### Adjust Minimum Score

If you want to change the minimum score required for leaderboard:

```bash
npx hardhat run scripts/setMinimumScore.ts --network hemiSepolia
```

Or interact via contract:

```javascript
const leaderboard = await ethers.getContractAt(
  "ShadowRunnerLeaderboard",
  "0xYourContractAddress"
);
await leaderboard.setMinimumScore(500);
```

### Update Game Version

When releasing a new game version:

```javascript
await leaderboard.setGameVersion("0.2.0");
```

This helps track which version of the game produced which scores.

### Pause Contract (Emergency)

If you detect an exploit or need to pause submissions:

```javascript
await leaderboard.pause();
```

Resume when ready:

```javascript
await leaderboard.unpause();
```

## 🧪 Advanced Testing

### Local Hardhat Network

Test locally before deploying:

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy to local node
npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Run interaction script
CONTRACT_ADDRESS=0xLocalAddress npm run interact
```

### Gas Profiling

Enable gas reporting:

```bash
REPORT_GAS=true npm run test:contract
```

Output:
```
·----------------------------------------|---------------------------|-------------|-----------------------------·
|  Solc version: 0.8.20                  ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·········································|···························|·············|······························
|  Methods                                                                                                        │
························|····················|··············|·············|·············|···············|··············
|  Contract             ·  Method            ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
························|····················|··············|·············|·············|···············|··············
|  ShadowRunnerLeaderboard  ·  submitScore       ·      80,234  ·    150,567  ·     98,432  ·            5  ·       4.92  │
```

### Coverage Report

Generate test coverage:

```bash
npx hardhat coverage
```

Aim for >90% coverage before mainnet deployment.

## 🔐 Security Best Practices

### Private Key Management

**DO**:
- ✅ Use a dedicated deployment wallet
- ✅ Store private key in password manager
- ✅ Use hardware wallet for mainnet
- ✅ Keep `.env` in `.gitignore`

**DON'T**:
- ❌ Commit private keys to Git
- ❌ Share private keys
- ❌ Use your main wallet for deployment
- ❌ Store keys in plaintext files

### Contract Security

The contract uses:
- ✅ OpenZeppelin audited base contracts
- ✅ ReentrancyGuard protection
- ✅ Access control (Ownable)
- ✅ Pausable mechanism
- ✅ Input validation
- ✅ Event emission for transparency

### Post-Deployment Security

After deployment:
1. **Transfer ownership** to a multi-sig wallet
2. **Monitor** contract for suspicious activity
3. **Set up alerts** for large transactions
4. **Document** admin actions
5. **Plan** for emergency response

## 📊 Monitoring

### Track Contract Activity

Monitor your contract on Hemi Explorer:

**Testnet**: `https://testnet.explorer.hemi.xyz/address/0xYourAddress`
**Mainnet**: `https://explorer.hemi.xyz/address/0xYourAddress`

### Set Up Alerts

Use services like:
- **Tenderly**: Transaction monitoring and alerting
- **Defender**: OpenZeppelin's security monitoring
- **Custom scripts**: Poll contract events

### Analytics

Track metrics:
- Daily active players
- Total scores submitted
- Average score
- Top players
- Gas costs

## 🐛 Troubleshooting

### "Insufficient funds"

**Problem**: Not enough ETH for deployment.

**Solution**:
```bash
# Check balance
npx hardhat run scripts/checkBalance.ts --network hemiSepolia

# Get testnet tokens
# Visit Hemi Discord #faucet channel
```

### "Nonce too high"

**Problem**: Transaction nonce out of sync.

**Solution**:
```bash
# Reset account in MetaMask
# Settings → Advanced → Clear Activity Tab Data
```

### "Contract deployment failed"

**Problem**: Various deployment issues.

**Solutions**:
1. Check your private key is correct
2. Ensure you have enough ETH
3. Verify RPC endpoint is responding
4. Try increasing gas limit in hardhat.config.ts

### "Verification failed"

**Problem**: Block explorer can't verify contract.

**Solution**:
```bash
# Wait 30 seconds, then manually verify
npx hardhat verify --network hemiSepolia \
  0xContractAddress \
  "0.1.0"
```

### "Transaction underpriced"

**Problem**: Gas price too low.

**Solution**: Add to `hardhat.config.ts`:
```typescript
networks: {
  hemiSepolia: {
    // ... existing config
    gasPrice: 20000000000, // 20 gwei
  }
}
```

## 📚 Contract Upgrade Path

This contract is **not upgradeable** by design (security/simplicity). 

If you need to upgrade:

1. **Deploy new contract** with updated code
2. **Pause old contract** to prevent new submissions
3. **Update game** to point to new contract
4. **Optional**: Migrate data (if feasible)
5. **Announce** to community

Consider making v2 upgradeable using:
- OpenZeppelin Upgradeable Contracts
- Transparent Proxy Pattern
- UUPS Proxy Pattern

## 🎓 Learning Resources

- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [OpenZeppelin Learn](https://docs.openzeppelin.com/learn/)
- [Ethereum Development Documentation](https://ethereum.org/en/developers/)
- [Solidity by Example](https://solidity-by-example.org/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)

## 🤝 Support

Need help?

1. Check [contracts/README.md](contracts/README.md) for detailed API docs
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. Open an issue on GitHub
4. Ask in [Hemi Discord](https://discord.gg/hemixyz)

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Contract address saved securely
- [ ] Contract verified on block explorer
- [ ] Test transaction sent successfully
- [ ] Leaderboard reads working
- [ ] Game config updated with contract address
- [ ] Frontend tested with contract
- [ ] Documentation updated
- [ ] Team notified
- [ ] Community announcement prepared
- [ ] Monitoring set up
- [ ] Emergency procedures documented

---

**Congratulations!** 🎉 Your leaderboard contract is now live on Hemi!
