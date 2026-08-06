import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ShadowRunnerLeaderboard contract...");

  // Get the contract factory
  const ShadowRunnerLeaderboard = await ethers.getContractFactory("ShadowRunnerLeaderboard");

  // Game version (update this for each deployment)
  const gameVersion = "0.1.0";

  console.log(`📦 Deploying with game version: ${gameVersion}`);

  // Deploy the contract
  const leaderboard = await ShadowRunnerLeaderboard.deploy(gameVersion);

  await leaderboard.waitForDeployment();

  const address = await leaderboard.getAddress();

  console.log("✅ ShadowRunnerLeaderboard deployed to:", address);
  console.log("🔍 View on explorer:");
  
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 743111n) {
    console.log(`   https://testnet.explorer.hemi.xyz/address/${address}`);
  } else if (network.chainId === 43111n) {
    console.log(`   https://explorer.hemi.xyz/address/${address}`);
  } else {
    console.log(`   Local network - Chain ID: ${network.chainId}`);
  }

  console.log("\n📝 Contract configuration:");
  console.log(`   Game Version: ${await leaderboard.gameVersion()}`);
  console.log(`   Minimum Score: ${await leaderboard.minimumScore()}`);
  console.log(`   Max Leaderboard Size: ${await leaderboard.MAX_LEADERBOARD_SIZE()}`);
  console.log(`   Owner: ${await leaderboard.owner()}`);

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Verify the contract on block explorer
  if (network.chainId !== 31337n) {
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [gameVersion],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("❌ Verification failed:", error.message);
      }
    }
  }

  console.log("\n🎮 Next steps:");
  console.log("1. Update src/game/config/Web3Config.ts with the contract address:");
  console.log(`   SCORE_CONTRACT: '${address}'`);
  console.log("2. Update SUBMISSION_MODE to 'contract' in Web3Config.ts");
  console.log("3. Update src/game/systems/Web3System.ts to use the contract");
  console.log("4. Test on testnet before switching to mainnet");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
