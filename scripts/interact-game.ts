import { ethers } from "hardhat";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Please set CONTRACT_ADDRESS environment variable");
  }

  console.log("🎮 Interacting with ShadowRunnerGame\n");
  console.log("📍 Contract:", CONTRACT_ADDRESS);
  console.log("");

  const [player] = await ethers.getSigners();
  console.log("👤 Player:", player.address);
  console.log("");

  // Get contract instance
  const ShadowRunnerGame = await ethers.getContractFactory("ShadowRunnerGame");
  const game = ShadowRunnerGame.attach(CONTRACT_ADDRESS);

  // =============================================
  // 1. START GAME
  // =============================================
  console.log("🎯 Starting new game...");
  const startTx = await game.startGame();
  console.log("   Transaction hash:", startTx.hash);
  
  const startReceipt = await startTx.wait();
  console.log("   ✅ Game started!");
  console.log("   Gas used:", startReceipt?.gasUsed.toString());
  console.log("");

  // Extract session info from event
  const startEvent = startReceipt?.logs
    .map(log => {
      try {
        return game.interface.parseLog({
          topics: [...log.topics],
          data: log.data
        });
      } catch {
        return null;
      }
    })
    .find(e => e && e.name === "GameStarted");

  if (!startEvent) {
    throw new Error("GameStarted event not found");
  }

  const sessionId = startEvent.args.sessionId;
  const gameSeed = startEvent.args.gameSeed;
  const startBlock = startEvent.args.startBlock;

  console.log("📊 Session Information:");
  console.log("   Session ID:", sessionId.toString());
  console.log("   Game Seed:", gameSeed.toString());
  console.log("   Start Block:", startBlock.toString());
  console.log("");

  // Get session from contract
  const session = await game.getSession(sessionId);
  console.log("🔍 Verifying session data:");
  console.log("   Player:", session.player);
  console.log("   Seed:", session.gameSeed.toString());
  console.log("   Finished:", session.finished);
  console.log("   Active:", await game.isSessionActive(sessionId));
  console.log("");

  // =============================================
  // 2. SIMULATE GAMEPLAY
  // =============================================
  console.log("🎮 Simulating gameplay...");
  console.log("   (In real game, player would play using seed:", gameSeed.toString() + ")");
  
  // Simulate a score
  const finalScore = Math.floor(Math.random() * 5000) + 1000;
  console.log("   Final score:", finalScore);
  console.log("");

  // Wait a moment (simulate gameplay time)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // =============================================
  // 3. SUBMIT SCORE
  // =============================================
  console.log("📤 Submitting score...");
  const submitTx = await game.submitScore(sessionId, finalScore);
  console.log("   Transaction hash:", submitTx.hash);
  
  const submitReceipt = await submitTx.wait();
  console.log("   ✅ Score submitted!");
  console.log("   Gas used:", submitReceipt?.gasUsed.toString());
  console.log("");

  // =============================================
  // 4. CHECK PLAYER STATS
  // =============================================
  console.log("📈 Player Statistics:");
  const stats = await game.getPlayerStats(player.address);
  console.log("   Best Score:", stats.bestScore.toString());
  console.log("   Games Played:", stats.gamesPlayed.toString());
  console.log("");

  // =============================================
  // 5. VERIFY SESSION FINISHED
  // =============================================
  const finalSession = await game.getSession(sessionId);
  console.log("✅ Final Session State:");
  console.log("   Session ID:", sessionId.toString());
  console.log("   Final Score:", finalSession.finalScore.toString());
  console.log("   Finished:", finalSession.finished);
  console.log("   Active:", await game.isSessionActive(sessionId));
  console.log("");

  // =============================================
  // 6. TOTAL COSTS
  // =============================================
  const startGas = startReceipt?.gasUsed || 0n;
  const submitGas = submitReceipt?.gasUsed || 0n;
  const totalGas = startGas + submitGas;
  
  const gasPrice = startReceipt?.gasPrice || 0n;
  const totalCost = totalGas * gasPrice;

  console.log("💰 Transaction Costs:");
  console.log("   Start Game:", startGas.toString(), "gas");
  console.log("   Submit Score:", submitGas.toString(), "gas");
  console.log("   Total Gas:", totalGas.toString(), "gas");
  console.log("   Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
  console.log("   Total Cost:", ethers.formatEther(totalCost), "ETH");
  console.log("");

  // =============================================
  // 7. PLAY ANOTHER GAME
  // =============================================
  console.log("🎮 Want to play another game? Run this script again!");
  console.log("");
  console.log("📊 Current Stats:");
  console.log("   Next Session ID:", await game.nextSessionId());
  console.log("   Your Best Score:", stats.bestScore.toString());
  console.log("   Your Total Games:", stats.gamesPlayed.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:");
    console.error(error);
    process.exit(1);
  });
