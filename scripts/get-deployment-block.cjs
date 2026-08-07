/**
 * Get the deployment block of the contract
 */
const { ethers } = require('hardhat');

const CONTRACT_ADDRESS = '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe';

async function main() {
  const provider = ethers.provider;
  const currentBlock = await provider.getBlockNumber();
  
  console.log(`Current block: ${currentBlock}`);
  console.log(`Searching for contract deployment...`);
  
  // Check if contract exists
  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (code === '0x') {
    console.log('Contract not found at this address!');
    return;
  }
  
  console.log('Contract found. Checking recent blocks for events...');
  
  // Get contract instance
  const ABI = [
    'event GameStarted(uint256 indexed sessionId, address indexed player, uint32 gameSeed, uint32 startBlock)',
    'event GameFinished(uint256 indexed sessionId, address indexed player, uint16 score, uint16 gamesPlayed)',
  ];
  const contract = await ethers.getContractAt(ABI, CONTRACT_ADDRESS);
  
  // Try to find the first event in recent blocks
  const searchStart = Math.max(0, currentBlock - 100000); // Search last 100k blocks
  console.log(`Searching from block ${searchStart} to ${currentBlock}...`);
  
  try {
    const filter = contract.filters.GameStarted();
    const events = await contract.queryFilter(filter, searchStart, currentBlock);
    
    if (events.length > 0) {
      const firstEvent = events[0];
      console.log(`\nFirst GameStarted event found at block ${firstEvent.blockNumber}`);
      console.log(`Deployment block is likely: ${firstEvent.blockNumber} or earlier`);
      console.log(`\nRecommended DEPLOYMENT_BLOCK: ${firstEvent.blockNumber - 100}`);
    } else {
      console.log('No GameStarted events found in recent blocks.');
      console.log(`Try starting from block ${searchStart}`);
    }
  } catch (error) {
    console.error('Error querying events:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
