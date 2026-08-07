/**
 * Check player stats from contract
 */
const { ethers } = require('hardhat');

const CONTRACT_ADDRESS = '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe';
const PLAYER_ADDRESS = '0x8cc769177F7991dcB3C36AF1F7D64F1E9259b418'; // Your address from leaderboard

const ABI = [
  'function getPlayerStats(address player) external view returns (tuple(uint16 bestScore, uint16 gamesPlayed))',
];

async function main() {
  console.log('🔍 Checking player stats from contract...');
  console.log('Player:', PLAYER_ADDRESS);
  
  const contract = await ethers.getContractAt(ABI, CONTRACT_ADDRESS);
  
  try {
    const stats = await contract.getPlayerStats(PLAYER_ADDRESS);
    console.log('\n✅ On-chain stats:');
    console.log('  Best Score:', Number(stats.bestScore));
    console.log('  Games Played:', Number(stats.gamesPlayed));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
