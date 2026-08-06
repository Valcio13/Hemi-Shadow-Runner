/**
 * Fetch Leaderboard - Event Indexer for ShadowRunnerGame
 * 
 * Reads GameFinished events from the blockchain and builds a leaderboard.
 * Outputs to public/leaderboard.json for the client to fetch.
 */
import { ethers } from 'ethers';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Contract config
const CONTRACT_ADDRESS = '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe';
const RPC_URL = process.env.HEMI_SEPOLIA_RPC || 'https://testnet.rpc.hemi.network/rpc';

// Simple ABI for the events we need
const ABI = [
  'event GameStarted(uint256 indexed sessionId, address indexed player, uint32 gameSeed, uint32 startBlock)',
  'event GameFinished(uint256 indexed sessionId, address indexed player, uint16 score, uint16 gamesPlayed)',
  'event NewHighScore(address indexed player, uint16 newBestScore, uint16 previousBestScore)',
  'function getPlayerStats(address player) external view returns (tuple(uint16 bestScore, uint16 gamesPlayed))',
];

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  gamesPlayed: number;
  lastPlayed: number;
  bestSessionId?: string;
}

interface CachedData {
  lastBlock: number;
  entries: Map<string, Omit<LeaderboardEntry, 'rank'>>;
}

const CACHE_FILE = join(__dirname, '..', 'leaderboard-cache.json');
const OUTPUT_FILE = join(__dirname, '..', 'public', 'leaderboard.json');

async function main() {
  console.log('🔍 Fetching leaderboard data from Hemi Sepolia...');
  console.log('📜 Contract:', CONTRACT_ADDRESS);
  
  // Connect to provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  // Load cached data
  let cachedData: CachedData = { lastBlock: 0, entries: new Map() };
  if (existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
      cachedData.lastBlock = cached.lastBlock || 0;
      cachedData.entries = new Map(Object.entries(cached.entries || {}));
      console.log(`📂 Loaded cache from block ${cachedData.lastBlock}`);
    } catch (err) {
      console.warn('⚠️  Failed to load cache, starting fresh');
    }
  }
  
  // Get current block
  const currentBlock = await provider.getBlockNumber();
  console.log(`⛓️  Current block: ${currentBlock}`);
  
  // Fetch new events since last check
  const fromBlock = cachedData.lastBlock + 1;
  
  if (fromBlock <= currentBlock) {
    console.log(`🔄 Fetching events from block ${fromBlock} to ${currentBlock}...`);
    
    // Fetch GameFinished events
    const filter = contract.filters.GameFinished();
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    
    console.log(`📥 Found ${events.length} new GameFinished events`);
    
    // Process events
    for (const event of events) {
      const { sessionId, player, score, gamesPlayed } = event.args as any;
      const block = await event.getBlock();
      
      const existing = cachedData.entries.get(player);
      
      // Only update if this score is better OR player doesn't exist
      if (!existing || score > existing.score) {
        cachedData.entries.set(player, {
          player,
          score: Number(score),
          gamesPlayed: Number(gamesPlayed),
          lastPlayed: block.timestamp,
          bestSessionId: sessionId.toString(),
        });
        
        console.log(`  ✨ ${player.slice(0, 8)}... - New best: ${score}`);
      } else {
        // Update games played and last played time
        existing.gamesPlayed = Number(gamesPlayed);
        existing.lastPlayed = block.timestamp;
        cachedData.entries.set(player, existing);
      }
    }
    
    // Update last processed block
    cachedData.lastBlock = currentBlock;
  } else {
    console.log('✅ Already up to date');
  }
  
  // Convert to array and sort by score
  const leaderboard: LeaderboardEntry[] = Array.from(cachedData.entries.values())
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
    const date = new Date(entry.lastPlayed * 1000).toISOString().split('T')[0];
    console.log(
      `${entry.rank.toString().padStart(2)}.  ${addr}  ${entry.score.toString().padStart(5)} pts  (${entry.gamesPlayed} games)  ${date}`
    );
  });
  console.log('═'.repeat(70));
  
  // Save cache
  const cacheOutput = {
    lastBlock: cachedData.lastBlock,
    entries: Object.fromEntries(cachedData.entries),
  };
  writeFileSync(CACHE_FILE, JSON.stringify(cacheOutput, null, 2));
  console.log(`\n💾 Cache saved to ${CACHE_FILE}`);
  
  // Save public leaderboard
  const leaderboardOutput = {
    lastUpdated: Date.now(),
    lastBlock: cachedData.lastBlock,
    entries: leaderboard,
  };
  writeFileSync(OUTPUT_FILE, JSON.stringify(leaderboardOutput, null, 2));
  console.log(`📤 Leaderboard published to ${OUTPUT_FILE}`);
  
  console.log(`\n✅ Done! ${leaderboard.length} players indexed`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
