const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ShadowRunnerGame contract...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying contract...");
  const ShadowRunnerGame = await ethers.getContractFactory("ShadowRunnerGame");
  const game = await ShadowRunnerGame.deploy();
  
  await game.waitForDeployment();
  const address = await game.getAddress();

  console.log("✅ ShadowRunnerGame deployed to:", address);
  console.log("");

  // Display network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network Information:");
  console.log("   Chain ID:", network.chainId.toString());
  
  if (network.chainId === 743111n) {
    console.log("   Network: Hemi Sepolia Testnet");
    console.log("   Explorer: https://testnet.explorer.hemi.xyz/address/" + address);
  } else if (network.chainId === 43111n) {
    console.log("   Network: Hemi Mainnet");
    console.log("   Explorer: https://explorer.hemi.xyz/address/" + address);
  } else if (network.chainId === 31337n) {
    console.log("   Network: Local Hardhat Network");
  } else {
    console.log("   Network: Unknown (Chain ID: " + network.chainId.toString() + ")");
  }
  console.log("");

  // Display contract info
  console.log("📊 Contract Information:");
  console.log("   Initial Session ID:", await game.nextSessionId());
  console.log("");

  // Calculate deployment cost
  const deployTx = game.deploymentTransaction();
  if (deployTx) {
    const receipt = await deployTx.wait();
    if (receipt) {
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      console.log("⛽ Deployment Costs:");
      console.log("   Gas Used:", receipt.gasUsed.toString());
      console.log("   Gas Price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
      console.log("   Total Cost:", ethers.formatEther(gasCost), "ETH");
      console.log("");
    }
  }

  console.log("🎯 Next Steps:");
  console.log("1. Update src/game/config/Web3Config.ts:");
  console.log(`   SCORE_CONTRACT: '${address}'`);
  console.log("");
  console.log("2. Test the contract:");
  console.log(`   CONTRACT_ADDRESS=${address} npm run interact:game`);
  console.log("");
  console.log("3. Verify on block explorer (after 30 seconds):");
  if (network.chainId !== 31337n) {
    console.log(`   npx hardhat verify --network ${network.name} ${address}`);
  }
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: deployTx?.blockNumber || 0,
  };

  console.log("💾 Deployment Info (save this):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
