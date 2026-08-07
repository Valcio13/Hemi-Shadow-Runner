/**
 * Fetch Leaderboard - Event Indexer for ShadowRunnerGame
 * 
 * Reads GameFinished events from the blockchain and builds a leaderboard.
 * Outputs to public/leaderboard.json for the client to fetch.
 */
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Contract config
const CONTRACT_ADDRESS = '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe';

// Simple ABI for the events we need
const ABI = [
  'event GameStarted(uint256 indexed sessionId, address indexed player, uint32 gameSeed, uint32 startBlock)',
  'event GameFinished(uint256 indexed sessionId, address indexed player, uint16 score, uint16 gamesPlayed)',
  'event NewHighScore(address indexed player, uint16 newBestScore, uint16 previousBestScore)',
  'function getPlayerStats(address player) external view returns (tuple(uint16 bestScore, uint16 gamesPlayed))',
];

const CACHE_FILE = path.join(__dirname, '..', 'leaderboard-cache.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'leaderboard.json');

async function main() {
  console.log('🔍 Fetching leaderboard data from Hemi Mainnet...');
  console.log('📜 Contract:', CONTRACT_ADDRESS);
  
  // Get contract instance
  const contract = await ethers.getContractAt(ABI, CONTRACT_ADDRESS);
  const provider = ethers.provider;
  
  // Load cached data
  let cachedData = { lastBlock: 0, entries: {} };
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      console.log(`📂 Loaded cache from block ${cachedData.lastBlock}`);
    } catch (err) {
      console.warn('⚠️  Failed to load cache, starting fresh');
    }
  }
  
  // Get current block
  const currentBlock = await provider.getBlockNumber();
  console.log(`⛓️  Current block: ${currentBlock}`);
  
  // Determine starting block (use deployment block if cache is empty)
  const DEPLOYMENT_BLOCK = 5020400; // Mainnet deployment block
  const fromBlock = cachedData.lastBlock === 0 ? DEPLOYMENT_BLOCK : cachedData.lastBlock + 1;
  
  if (fromBlock <= currentBlock) {
    console.log(`🔄 Fetching events from block ${fromBlock} to ${currentBlock}...`);
    
    // Fetch GameFinished events
    const filter = contract.filters.GameFinished();
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    
    console.log(`📥 Found ${events.length} new GameFinished events`);
    
    // Process events
    for (const event of events) {
      const { sessionId, player, score, gamesPlayed } = event.args;
      const block = await event.getBlock();
      
      const existing = cachedData.entries[player];
      
      if (!existing) {
        // New player
        cachedData.entries[player] = {
          player,
          score: Number(score), // First score
          bestScore: Number(score),
          gamesPlayed: Number(gamesPlayed),
          lastPlayed: block.timestamp,
          bestSessionId: sessionId.toString(),
        };
        console.log(`  ✨ ${player.slice(0, 8)}... - New player: ${score} pts`);
      } else {
        // Existing player - add to cumulative score
        const newScore = Number(score);
        existing.score += newScore; // Cumulative total
        existing.gamesPlayed = Number(gamesPlayed);
        existing.lastPlayed = block.timestamp;
        
        // Track best single score
        if (newScore > (existing.bestScore || 0)) {
          existing.bestScore = newScore;
          existing.bestSessionId = sessionId.toString();
        }
        
        cachedData.entries[player] = existing;
        console.log(`  📈 ${player.slice(0, 8)}... - +${newScore} pts (total: ${existing.score})`);
      }
    }
    
    // Update last processed block
    cachedData.lastBlock = currentBlock;
  } else {
    console.log('✅ Already up to date');
  }
  
  // Convert to array and sort by score
  const leaderboard = Object.values(cachedData.entries)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100) // Top 100 only
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  
  console.log(`\n🏆 Top 10 Leaderboard:`);
  console.log('═'.repeat(70));
  leaderboard.slice(0, 10).forEach((entry) => {
    const addr = `${entry.player.slice(0, 6)}...${entry.player.slice(-4)}`;
    const date = new Date(Number(entry.lastPlayed) * 1000).toISOString().split('T')[0];
    console.log(
      `${entry.rank.toString().padStart(2)}.  ${addr}  ${entry.score.toString().padStart(5)} pts  (${entry.gamesPlayed} games)  ${date}`
    );
  });
  console.log('═'.repeat(70));
  
  // Save cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedData, null, 2));
  console.log(`\n💾 Cache saved to ${CACHE_FILE}`);
  
  // Save public leaderboard
  const leaderboardOutput = {
    lastUpdated: Date.now(),
    lastBlock: cachedData.lastBlock,
    entries: leaderboard,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(leaderboardOutput, null, 2));
  console.log(`📤 Leaderboard published to ${OUTPUT_FILE}`);
  
  console.log(`\n✅ Done! ${leaderboard.length} players indexed`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
