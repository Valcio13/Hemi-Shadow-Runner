# Smart Contract Documentation

## ShadowRunnerLeaderboard Contract

The `ShadowRunnerLeaderboard` smart contract provides on-chain score tracking and leaderboard management for Hemi Shadow Runner.

### Features

- **Score Submission**: Players can submit their game scores on-chain
- **Global Leaderboard**: Top 100 all-time scores across all players
- **Daily Leaderboards**: Reset every 24 hours for daily competitions
- **Player Statistics**: Track high scores, total games, coins collected
- **Anti-Cheat**: Prevent duplicate submissions via session IDs
- **Signature Verification**: Optional off-chain signature validation
- **Admin Controls**: Pause, remove fraudulent scores, adjust settings
- **Gas Optimized**: Efficient storage and sorting algorithms

### Contract Architecture

```
ShadowRunnerLeaderboard
├── Score Submission
│   ├── submitScore(score, coins, sessionId)
│   └── submitScoreWithSignature(score, coins, sessionId, signature)
├── Leaderboards
│   ├── Global (all-time top 100)
│   ├── Daily (resets every 24h)
│   └── Historical daily leaderboards
├── Player Stats
│   ├── High score
│   ├── Total games played
│   ├── Total coins collected
│   └── Last played timestamp
└── Admin Functions
    ├── Pause/unpause
    ├── Remove fraudulent scores
    ├── Update minimum score
    └── Update game version
```

### Deployment

#### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Add your private key** to `.env`:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

4. **Get testnet ETH**:
   - Visit [Hemi Discord](https://discord.gg/hemixyz)
   - Request testnet tokens in #faucet channel

#### Deploy to Hemi Sepolia Testnet

```bash
npm run deploy:testnet
```

Example output:
```
🚀 Deploying ShadowRunnerLeaderboard contract...
📦 Deploying with game version: 0.1.0
✅ ShadowRunnerLeaderboard deployed to: 0x1234...5678
🔍 View on explorer:
   https://testnet.explorer.hemi.xyz/address/0x1234...5678
```

#### Deploy to Hemi Mainnet

```bash
npm run deploy:mainnet
```

⚠️ **Warning**: Deploying to mainnet costs real ETH. Test thoroughly on testnet first!

### Contract Interface

#### Core Functions

##### `submitScore(uint256 _score, uint256 _coins, bytes32 _gameSessionId)`

Submit a game score to the leaderboard.

**Parameters**:
- `_score`: Player's final score (must be > 0)
- `_coins`: Number of coins collected (must be > 0)
- `_gameSessionId`: Unique identifier for this game session (prevents duplicates)

**Events Emitted**:
- `ScoreSubmitted(player, score, coins, timestamp, gameSessionId)`
- `NewHighScore(player, newHighScore, previousHighScore)` (if applicable)
- `LeaderboardUpdated(player, rank, score)` (if on leaderboard)

**Example**:
```solidity
bytes32 sessionId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
leaderboard.submitScore(1234, 45, sessionId);
```

##### `getGlobalLeaderboard(uint256 _offset, uint256 _limit)`

Retrieve the global leaderboard with pagination.

**Parameters**:
- `_offset`: Starting index (0-based)
- `_limit`: Number of entries to return

**Returns**: Array of `Score` structs

**Example**:
```solidity
// Get top 10
Score[] memory topTen = leaderboard.getGlobalLeaderboard(0, 10);

// Get next 10 (11-20)
Score[] memory nextTen = leaderboard.getGlobalLeaderboard(10, 10);
```

##### `getPlayerStats(address _player)`

Get comprehensive statistics for a player.

**Returns**: `PlayerStats` struct containing:
- `highScore`: Player's all-time high score
- `totalGames`: Total number of games played
- `totalCoins`: Total coins collected across all games
- `lastPlayedAt`: Unix timestamp of last game

**Example**:
```solidity
PlayerStats memory stats = leaderboard.getPlayerStats(playerAddress);
console.log("High Score:", stats.highScore);
```

##### `getPlayerRank(address _player)`

Get player's current rank on the global leaderboard.

**Returns**: Rank (1-based), or 0 if not on leaderboard

**Example**:
```solidity
uint256 rank = leaderboard.getPlayerRank(msg.sender);
if (rank > 0) {
    console.log("You are rank #", rank);
}
```

#### View Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getDailyLeaderboard(offset, limit)` | Get today's daily leaderboard | `Score[]` |
| `getHistoricalDailyLeaderboard(day, offset, limit)` | Get a specific day's leaderboard | `Score[]` |
| `getPlayerScores(player, offset, limit)` | Get player's score history | `Score[]` |
| `getGlobalLeaderboardSize()` | Total entries on global leaderboard | `uint256` |
| `getDailyLeaderboardSize()` | Total entries on today's daily leaderboard | `uint256` |
| `getCurrentDay()` | Current day number since Unix epoch | `uint256` |

#### Admin Functions (Owner Only)

| Function | Description | Emits |
|----------|-------------|-------|
| `setMinimumScore(uint256)` | Update minimum score for leaderboard | `MinimumScoreUpdated` |
| `setGameVersion(string)` | Update game version string | `GameVersionUpdated` |
| `pause()` | Pause score submissions | `Paused` |
| `unpause()` | Resume score submissions | `Unpaused` |
| `removeScore(address, bytes32)` | Remove fraudulent score | - |

### Testing

#### Run Tests

```bash
npm run test:contract
```

#### Test Coverage

The test suite covers:
- ✅ Score submission and validation
- ✅ Duplicate prevention
- ✅ Leaderboard sorting and pagination
- ✅ Player statistics tracking
- ✅ Daily leaderboard functionality
- ✅ Admin controls
- ✅ Gas optimization
- ✅ Edge cases and error handling

#### Example Test Output

```
  ShadowRunnerLeaderboard
    Deployment
      ✓ Should set the right owner
      ✓ Should set the correct game version
      ✓ Should set the correct minimum score
    Score Submission
      ✓ Should submit a score successfully
      ✓ Should update player stats after submission
      ✓ Should prevent duplicate session submissions
      ✓ Should reject zero score
    Leaderboard Management
      ✓ Should maintain leaderboard in descending order
      ✓ Should return correct player rank
      ✓ Should handle pagination correctly
```

### Integration with Game

After deploying the contract, integrate it with the game:

#### 1. Update Web3Config.ts

```typescript
export const WEB3 = {
  SUBMISSION_MODE: 'contract' as 'attestation' | 'contract',
  APP_TAG: 'Hemi Shadow Runner',
  SCORE_CONTRACT: '0xYourContractAddress', // Add deployed address
} as const;
```

#### 2. Update Web3System.ts

Add contract interaction logic:

```typescript
import { ethers } from 'ethers';

// ABI for submitScore function
const ABI = [
  "function submitScore(uint256 _score, uint256 _coins, bytes32 _gameSessionId)"
];

async submitScore(score: number, coins: number): Promise<boolean> {
  if (WEB3.SUBMISSION_MODE === 'contract') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(WEB3.SCORE_CONTRACT, ABI, signer);
    
    // Generate unique session ID
    const sessionId = ethers.id(`${address}-${score}-${Date.now()}`);
    
    // Submit transaction
    const tx = await contract.submitScore(score, coins, sessionId);
    await tx.wait();
    
    return true;
  }
  // ... existing attestation code
}
```

#### 3. Update GameOverScreen.tsx

Add leaderboard display:

```typescript
// Fetch leaderboard data
const [leaderboard, setLeaderboard] = useState<Score[]>([]);

useEffect(() => {
  async function fetchLeaderboard() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const data = await contract.getGlobalLeaderboard(0, 10);
    setLeaderboard(data);
  }
  fetchLeaderboard();
}, []);
```

### Gas Costs (Estimated)

| Operation | Gas Cost | USD (at 30 gwei, $2000 ETH) |
|-----------|----------|------------------------------|
| Deploy Contract | ~2,500,000 | $150 |
| Submit Score (first time) | ~150,000 | $9 |
| Submit Score (subsequent) | ~80,000 | $4.80 |
| Get Leaderboard (read) | 0 (free) | $0 |
| Get Player Stats (read) | 0 (free) | $0 |

**Note**: Hemi gas prices are typically much lower than mainnet Ethereum.

### Security Considerations

1. **Duplicate Prevention**: Each game session ID can only be submitted once
2. **Input Validation**: Scores and coins must be > 0
3. **Access Control**: Admin functions restricted to contract owner
4. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
5. **Pause Mechanism**: Emergency stop for score submissions
6. **Fraud Detection**: Owner can remove suspicious scores

### Anti-Cheat Measures

The contract includes several anti-cheat mechanisms:

1. **Session IDs**: Prevent replaying the same score multiple times
2. **Timestamp Tracking**: Detect impossible time-based exploits
3. **Coin-to-Score Ratio**: Can be analyzed off-chain for anomalies
4. **Manual Review**: Owner can remove fraudulent entries
5. **Optional Signature Verification**: Validate scores were generated by the game

### Future Enhancements

Potential upgrades for v2:

- [ ] **Proof of Play**: Zero-knowledge proofs for score validation
- [ ] **Staking**: Players stake tokens to submit scores (slashed if fraudulent)
- [ ] **NFT Rewards**: Mint achievement NFTs for milestones
- [ ] **Token Rewards**: Distribute tokens based on leaderboard position
- [ ] **Tournaments**: Time-boxed competitions with prize pools
- [ ] **Team Leaderboards**: Clan/guild-based rankings

### Troubleshooting

#### "Insufficient funds for gas"
- Ensure you have enough ETH in your wallet
- Get testnet ETH from Hemi Discord faucet

#### "Session already submitted"
- Each game session can only be submitted once
- Generate a new unique session ID for each game

#### "Execution reverted: Score must be greater than 0"
- Ensure score is not zero
- Check game logic is calculating score correctly

#### Contract not verifying on explorer
- Wait 30-60 seconds after deployment
- Run: `npm run verify -- <contract-address> "0.1.0"`

### Resources

- [Hemi Documentation](https://docs.hemi.xyz/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

### Support

For issues or questions:
- Open an issue on GitHub
- Join [Hemi Discord](https://discord.gg/hemixyz)
- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines

---

**Built with ❤️ for the Hemi Network**
