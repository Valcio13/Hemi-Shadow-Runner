import { ethers } from "hardhat";

/**
 * Event Indexer for Leaderboard
 * 
 * This script indexes GameFinished events from the blockchain
 * and stores them in a database for leaderboard queries.
 * 
 * In production, this would run continuously as a backend service.
 * For development, run it manually to populate/update your leaderboard.
 */

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

interface ScoreEntry {
  sessionId: string;
  player: string;
  score: number;
  gamesPlayed: number;
  blockNumber: number;
  timestamp: number;
  txHash: string;
}

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set CONTRACT_ADDRESS environment variable");
  }

  console.log("📊 Indexing Leaderboard Events\n");
  console.log("📍 Contract:", CONTRACT_ADDRESS);
  console.log("");

  const provider = ethers.provider;
  const ShadowRunnerGame = await ethers.getContractFactory("ShadowRunnerGame");
  const game = ShadowRunnerGame.attach(CONTRACT_ADDRESS);

  // Get deployment block (or start from 0)
  const currentBlock = await provider.getBlockNumber();
  const fromBlock = 0; // Index from beginning (adjust if needed)
  
  console.log("🔍 Scanning blocks", fromBlock, "to", currentBlock);
  console.log("");

  // Query all GameFinished events
  console.log("📥 Fetching GameFinished events...");
  const filter = game.filters.GameFinished();
  const events = await game.queryFilter(filter, fromBlock, currentBlock);
  
  console.log(`✅ Found ${events.length} game sessions\n`);

  if (events.length === 0) {
    console.log("No games played yet. Play a game first!");
    return;
  }

  // Process events into leaderboard entries
  const scores: ScoreEntry[] = [];
  
  for (const event of events) {
    const block = await event.getBlock();
    
    const entry: ScoreEntry = {
      sessionId: event.args.sessionId.toString(),
      player: event.args.player,
      score: Number(event.args.score),
      gamesPlayed: Number(event.args.gamesPlayed),
      blockNumber: event.blockNumber,
      timestamp: block.timestamp,
      txHash: event.transactionHash,
    };
    
    scores.push(entry);
  }

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  // Display leaderboard
  console.log("🏆 LEADERBOARD (Top 10)");
  console.log("━".repeat(80));
  console.log("Rank | Player                                     | Score  | Games");
  console.log("━".repeat(80));
  
  const topScores = scores.slice(0, 10);
  topScores.forEach((entry, index) => {
    const rank = (index + 1).toString().padStart(4);
    const player = entry.player.substring(0, 42).padEnd(42);
    const score = entry.score.toString().padStart(6);
    const games = entry.gamesPlayed.toString().padStart(5);
    
    console.log(`${rank} | ${player} | ${score} | ${games}`);
  });
  console.log("━".repeat(80));
  console.log("");

  // Player rankings (deduplicate by player, show best score)
  console.log("👥 PLAYER RANKINGS (Best Score Per Player)");
  console.log("━".repeat(80));
  console.log("Rank | Player                                     | Best   | Games");
  console.log("━".repeat(80));
  
  const playerBest = new Map<string, ScoreEntry>();
  for (const entry of scores) {
    const current = playerBest.get(entry.player);
    if (!current || entry.score > current.score) {
      playerBest.set(entry.player, entry);
    }
  }
  
  const playerRankings = Array.from(playerBest.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  playerRankings.forEach((entry, index) => {
    const rank = (index + 1).toString().padStart(4);
    const player = entry.player.substring(0, 42).padEnd(42);
    const score = entry.score.toString().padStart(6);
    const games = entry.gamesPlayed.toString().padStart(5);
    
    console.log(`${rank} | ${player} | ${score} | ${games}`);
  });
  console.log("━".repeat(80));
  console.log("");

  // Statistics
  console.log("📊 STATISTICS");
  console.log("   Total Games:", scores.length);
  console.log("   Unique Players:", playerBest.size);
  console.log("   Highest Score:", Math.max(...scores.map(s => s.score)));
  console.log("   Average Score:", Math.floor(scores.reduce((sum, s) => sum + s.score, 0) / scores.length));
  console.log("");

  // Export data (for database import)
  console.log("💾 EXPORT TO DATABASE");
  console.log("Copy this JSON to import into your database:\n");
  
  const exportData = {
    indexedAt: new Date().toISOString(),
    contractAddress: CONTRACT_ADDRESS,
    fromBlock,
    toBlock: currentBlock,
    totalGames: scores.length,
    scores: scores.map(s => ({
      session_id: s.sessionId,
      player: s.player,
      score: s.score,
      games_played: s.gamesPlayed,
      block_number: s.blockNumber,
      timestamp: s.timestamp,
      tx_hash: s.txHash,
      date: new Date(s.timestamp * 1000).toISOString(),
    })),
  };

  console.log(JSON.stringify(exportData, null, 2));
  console.log("");

  // Save to file (optional)
  const fs = await import('fs');
  const filename = `leaderboard-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  console.log(`✅ Exported to: ${filename}`);
  console.log("");

  console.log("🎯 Next Steps:");
  console.log("1. Import this data into your database (Supabase, PostgreSQL, etc.)");
  console.log("2. Create an API endpoint to serve leaderboard data");
  console.log("3. Set up a cron job to run this script periodically");
  console.log("4. Or use a real-time event listener in production");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:");
    console.error(error);
    process.exit(1);
  });
