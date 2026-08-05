import { ethers } from "hardhat";

/**
 * Interaction script for testing the ShadowRunnerLeaderboard contract
 * Usage: npx hardhat run scripts/interact.ts --network hemiSepolia
 */

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set CONTRACT_ADDRESS environment variable");
  }

  console.log("🎮 Interacting with ShadowRunnerLeaderboard at:", CONTRACT_ADDRESS);

  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // Get contract instance
  const ShadowRunnerLeaderboard = await ethers.getContractFactory("ShadowRunnerLeaderboard");
  const leaderboard = ShadowRunnerLeaderboard.attach(CONTRACT_ADDRESS);

  // Check contract info
  console.log("\n📊 Contract Info:");
  console.log("   Game Version:", await leaderboard.gameVersion());
  console.log("   Minimum Score:", await leaderboard.minimumScore());
  console.log("   Owner:", await leaderboard.owner());
  console.log("   Paused:", await leaderboard.paused());

  // Submit a test score
  console.log("\n🎯 Submitting test score...");
  const testScore = 1234;
  const testCoins = 45;
  const testSessionId = ethers.id(`test-session-${Date.now()}`);

  const tx = await leaderboard.submitScore(testScore, testCoins, testSessionId);
  console.log("   Transaction hash:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("   ✅ Score submitted! Gas used:", receipt?.gasUsed.toString());

  // Get player stats
  console.log("\n📈 Player Stats:");
  const stats = await leaderboard.getPlayerStats(deployer.address);
  console.log("   High Score:", stats.highScore.toString());
  console.log("   Total Games:", stats.totalGames.toString());
  console.log("   Total Coins:", stats.totalCoins.toString());
  console.log("   Last Played:", new Date(Number(stats.lastPlayedAt) * 1000).toLocaleString());

  // Get player rank
  const rank = await leaderboard.getPlayerRank(deployer.address);
  console.log("\n🏆 Player Rank:", rank > 0 ? rank.toString() : "Not on leaderboard");

  // Get leaderboard size
  const leaderboardSize = await leaderboard.getGlobalLeaderboardSize();
  console.log("   Global Leaderboard Size:", leaderboardSize.toString());

  // Get top 10 scores
  if (leaderboardSize > 0) {
    console.log("\n🏅 Top 10 Scores:");
    const limit = leaderboardSize < 10 ? leaderboardSize : 10;
    const topScores = await leaderboard.getGlobalLeaderboard(0, limit);
    
    topScores.forEach((score: any, index: number) => {
      console.log(`   ${index + 1}. ${score.player}`);
      console.log(`      Score: ${score.score} | Coins: ${score.coins}`);
      console.log(`      Date: ${new Date(Number(score.timestamp) * 1000).toLocaleString()}`);
    });
  }

  // Get player score history
  console.log("\n📜 Your Score History:");
  const playerScores = await leaderboard.getPlayerScores(deployer.address, 0, 10);
  playerScores.forEach((score: any, index: number) => {
    console.log(`   ${index + 1}. Score: ${score.score} | Coins: ${score.coins}`);
    console.log(`      Date: ${new Date(Number(score.timestamp) * 1000).toLocaleString()}`);
  });

  // Get daily leaderboard
  const dailySize = await leaderboard.getDailyLeaderboardSize();
  console.log("\n📅 Today's Daily Leaderboard Size:", dailySize.toString());
  
  if (dailySize > 0) {
    const dailyLimit = dailySize < 5 ? dailySize : 5;
    const dailyScores = await leaderboard.getDailyLeaderboard(0, dailyLimit);
    console.log("   Top scores today:");
    dailyScores.forEach((score: any, index: number) => {
      console.log(`   ${index + 1}. ${score.player.substring(0, 10)}... - ${score.score} points`);
    });
  }

  console.log("\n✅ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
