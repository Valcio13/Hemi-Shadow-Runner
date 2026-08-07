# Maintenance Guide

This document provides guidelines for maintaining Hemi Shadow Runner in production.

## 📋 Table of Contents
- [Regular Maintenance Tasks](#regular-maintenance-tasks)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Updates and Upgrades](#updates-and-upgrades)
- [Emergency Procedures](#emergency-procedures)

---

## Regular Maintenance Tasks

### Daily
- ✅ **No daily tasks required** - System is fully automated

### Weekly
- Check contract activity on [Hemi Explorer](https://explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe)
- Monitor game performance metrics (if analytics enabled)
- Review user feedback and bug reports

### Monthly
- Review and update dependencies
- Check for security advisories
- Update documentation if needed
- Review gas usage patterns

### Quarterly
- Comprehensive security audit
- Performance optimization review
- Update roadmap based on feedback
- Community engagement and updates

---

## Monitoring

### Smart Contract
```bash
# Check contract on explorer
https://explorer.hemi.xyz/address/0xD2c7C67721F155424A24c148D15bCeba36F5dfEe

# View recent transactions
# Monitor gas usage
# Check event emissions
```

### Leaderboard Performance
```bash
# The leaderboard is fully client-side
# Performance depends on:
# - Hemi RPC availability
# - Number of GameFinished events
# - Browser localStorage capacity

# To monitor:
# 1. Check browser console for errors
# 2. Test loading time in different browsers
# 3. Verify cache is working (fast reload)
```

### Frontend Deployment
```bash
# Cloudflare Pages auto-deploys on push
# Check deployment status:
https://dash.cloudflare.com/

# Verify build succeeded
# Test deployed site functionality
```

---

## Troubleshooting

### Leaderboard Not Loading

**Symptoms**: Spinning loader, no scores displayed

**Possible Causes**:
1. Hemi RPC is down or slow
2. Browser localStorage is full
3. Network connectivity issues

**Solutions**:
```javascript
// Clear cache in browser console
localStorage.removeItem('leaderboard-cache');

// Check RPC endpoint
fetch('https://rpc.hemi.network/rpc')
  .then(r => r.json())
  .then(console.log);

// Verify contract address in Web3Config.ts
```

### Player Stats Not Updating

**Symptoms**: Stats panel shows old data

**Possible Causes**:
1. Contract call failing
2. Wrong wallet connected
3. Network mismatch

**Solutions**:
```bash
# Verify player stats on-chain
npm run check-player-stats

# Check wallet is on Hemi Mainnet
# Verify contract address is correct
```

### Transaction Failures

**Symptoms**: Score submission fails

**Possible Causes**:
1. Insufficient gas
2. Network congestion
3. Contract paused (emergency only)

**Solutions**:
```bash
# Check contract is not paused
npx hardhat console --network hemi
> const contract = await ethers.getContractAt('ShadowRunnerGame', '0xD2c7...dfEe')
> await contract.paused()  // Should return false

# Check player has enough ETH for gas
# Verify transaction on explorer
```

### Build Failures

**Symptoms**: `npm run build` fails

**Solutions**:
```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
rm -rf dist .cache
npm install
npm run build

# Check Node.js version
node --version  # Should be 18+

# Check TypeScript compilation
npm run tsc -b
```

---

## Updates and Upgrades

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update non-breaking changes
npm update

# Update major versions (careful!)
npm install ethers@latest
npm install phaser@latest

# Always test after updates
npm run build
npm run preview
```

### Smart Contract Upgrades

⚠️ **The contract is NOT upgradeable**. To deploy new version:

1. **Deploy new contract**:
```bash
npm run deploy:game:mainnet
```

2. **Update frontend config**:
```typescript
// src/game/config/Web3Config.ts
export const WEB3 = {
  SCORE_CONTRACT: '0x_NEW_CONTRACT_ADDRESS',
  // ...
};
```

3. **Update documentation**:
- README.md
- PROJECT_STATUS.md
- MAINNET_DEPLOYMENT.md

4. **Announce migration** to users
5. **Archive old leaderboard data** if needed

### Frontend Updates

```bash
# Make changes
# Test locally
npm run dev

# Build for production
npm run build

# Commit and push (auto-deploys)
git add .
git commit -m "feat: your changes"
git push
```

Cloudflare Pages will auto-deploy within 2-3 minutes.

---

## Emergency Procedures

### Contract Pause (Emergency Only)

If critical bug is discovered:

```bash
# Pause contract (owner only)
npx hardhat console --network hemi
> const contract = await ethers.getContractAt('ShadowRunnerGame', '0xD2c7...dfEe')
> await contract.pause()

# This prevents:
# - New game starts
# - Score submissions
# (Existing sessions can still be queried)
```

### Unpause After Fix

```bash
# After deploying fix or new contract
> await contract.unpause()

# Announce to community
# Monitor for issues
```

### RPC Failover

If Hemi RPC is down, users can add custom RPC in MetaMask:

```
Network Name: Hemi (Custom)
RPC URL: <alternative RPC>
Chain ID: 43111
Currency: ETH
Explorer: https://explorer.hemi.xyz
```

### Cache Issues

If many users report stale leaderboard:

1. **Increment deployment block**:
```typescript
// src/react/hooks/useLeaderboard.ts
const DEPLOYMENT_BLOCK = 5020400 + 10000; // Force rescan
```

2. **Announce cache clear**:
```
Users: Clear browser data or localStorage
Key: 'leaderboard-cache'
```

### Data Recovery

Blockchain data is immutable and always available:

```bash
# Rebuild leaderboard from scratch
npm run leaderboard:fetch:mainnet

# Query specific player
npm run check-player-stats

# Export all events
npx hardhat run scripts/export-events.cjs --network hemi
```

---

## Backup and Recovery

### Smart Contract
- **Code**: Backed up in GitHub repository
- **Verified**: Source code on Hemi Explorer
- **Data**: Permanently on blockchain (no backup needed)

### Frontend
- **Code**: GitHub repository (version controlled)
- **Deployment**: Cloudflare Pages (Git-backed)
- **Cache**: No critical data (rebuilt from blockchain)

### Documentation
- **Location**: `/docs` directory
- **Backup**: GitHub repository + local clones
- **Format**: Markdown (portable)

---

## Performance Optimization

### If Leaderboard Becomes Slow

**Option 1: Increase Cache Duration**
```typescript
// Reduce refresh frequency
const interval = setInterval(fetchLeaderboard, 60000); // 1 minute
```

**Option 2: Limit Event Range**
```typescript
// Only scan recent blocks
const MAX_BLOCKS = 100000;
const fromBlock = Math.max(DEPLOYMENT_BLOCK, currentBlock - MAX_BLOCKS);
```

**Option 3: Deploy Subgraph**
- Use The Graph protocol
- Indexed queries
- Much faster than RPC

**Option 4: Server-Side Cache**
- Re-enable GitHub Actions workflow
- Generate static leaderboard.json
- Faster for users, but less real-time

---

## Security Best Practices

### Private Keys
- ✅ Never commit `.env` file
- ✅ Use environment variables in CI/CD
- ✅ Rotate keys if exposed
- ✅ Use separate keys for testnet/mainnet

### Smart Contract
- ✅ Contract is verified on explorer
- ✅ Owner functions are protected
- ✅ Pausable in emergency
- ✅ ReentrancyGuard enabled
- ✅ No arbitrary external calls

### Frontend
- ✅ No API keys in client code
- ✅ All user input validated
- ✅ RPC requests are read-only (except user transactions)
- ✅ HTTPS only (Cloudflare enforces)

---

## Monitoring Checklist

Weekly monitoring checklist:

- [ ] Check contract transactions on explorer
- [ ] Verify leaderboard is loading
- [ ] Test score submission
- [ ] Review any user-reported issues
- [ ] Check gas prices and transaction costs
- [ ] Monitor RPC endpoint uptime
- [ ] Review deployment logs on Cloudflare

---

## Contact and Escalation

For critical issues:

1. **Check documentation** first
2. **Review GitHub issues** for similar problems
3. **Test in development** environment
4. **Create backup** before making changes
5. **Announce maintenance** if taking game offline
6. **Document the fix** for future reference

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Smart Contract
npm run deploy:game:mainnet    # Deploy contract
npm run verify:mainnet         # Verify on explorer

# Leaderboard (Optional)
npm run leaderboard:fetch:mainnet  # Manual fetch

# Testing
npm test                        # Run tests
npm run lint                    # Check code quality

# Utilities
npm run check-player-stats      # Check player data
npm run get-deployment-block    # Find deployment block
```

---

**Last Updated**: August 7, 2026  
**Review Schedule**: Quarterly or after major updates
