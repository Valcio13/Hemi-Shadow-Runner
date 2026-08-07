/**
 * Mainnet Preparation Script
 * 
 * Helps prepare and validate everything before mainnet deployment
 */
const fs = require('fs');
const path = require('path');

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

console.log('\n' + chalk.bold(chalk.blue('🚀 Hemi Shadow Runner - Mainnet Preparation')));
console.log('=' .repeat(60) + '\n');

// Check 1: .env file exists
console.log(chalk.bold('1️⃣  Checking .env configuration...'));
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log(chalk.red('   ❌ .env file not found!'));
  console.log(chalk.yellow('   → Copy .env.example to .env and add your PRIVATE_KEY'));
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
if (envContent.includes('your_private_key_here')) {
  console.log(chalk.red('   ❌ PRIVATE_KEY not set in .env'));
  console.log(chalk.yellow('   → Add your private key to .env file'));
  process.exit(1);
}

if (!envContent.includes('PRIVATE_KEY=')) {
  console.log(chalk.red('   ❌ PRIVATE_KEY not found in .env'));
  process.exit(1);
}

console.log(chalk.green('   ✅ .env file configured\n'));

// Check 2: Hardhat config
console.log(chalk.bold('2️⃣  Checking Hardhat configuration...'));
const hardhatConfig = path.join(__dirname, '..', 'hardhat.config.cjs');
if (!fs.existsSync(hardhatConfig)) {
  console.log(chalk.red('   ❌ hardhat.config.cjs not found!'));
  process.exit(1);
}
console.log(chalk.green('   ✅ Hardhat config found\n'));

// Check 3: Contract exists
console.log(chalk.bold('3️⃣  Checking contract files...'));
const contractPath = path.join(__dirname, '..', 'contracts', 'ShadowRunnerGame.sol');
if (!fs.existsSync(contractPath)) {
  console.log(chalk.red('   ❌ ShadowRunnerGame.sol not found!'));
  process.exit(1);
}
console.log(chalk.green('   ✅ Contract file found\n'));

// Check 4: Current network configuration
console.log(chalk.bold('4️⃣  Checking Web3 configuration...'));
const web3ConfigPath = path.join(__dirname, '..', 'src', 'game', 'config', 'Web3Config.ts');
const web3Config = fs.readFileSync(web3ConfigPath, 'utf-8');

if (web3Config.includes('DEFAULT_CHAIN: ChainParams = HEMI_SEPOLIA')) {
  console.log(chalk.yellow('   ⚠️  Currently configured for TESTNET'));
  console.log(chalk.yellow('   → Change DEFAULT_CHAIN to HEMI_MAINNET before deploying\n'));
} else if (web3Config.includes('DEFAULT_CHAIN: ChainParams = HEMI_MAINNET')) {
  console.log(chalk.green('   ✅ Configured for MAINNET\n'));
} else {
  console.log(chalk.yellow('   ⚠️  Cannot determine network configuration\n'));
}

// Check 5: Tests passing
console.log(chalk.bold('5️⃣  Test suite status...'));
console.log(chalk.yellow('   ℹ️  Run: npm test'));
console.log(chalk.yellow('   ℹ️  Ensure all tests pass before deploying\n'));

// Check 6: Deployment script
console.log(chalk.bold('6️⃣  Checking deployment script...'));
const deployScript = path.join(__dirname, 'deploy-game.cjs');
if (!fs.existsSync(deployScript)) {
  console.log(chalk.red('   ❌ deploy-game.cjs not found!'));
  process.exit(1);
}
console.log(chalk.green('   ✅ Deployment script found\n'));

// Summary
console.log('=' .repeat(60));
console.log(chalk.bold(chalk.blue('\n📋 Pre-Deployment Checklist\n')));

console.log('Before deploying to mainnet, ensure:');
console.log('  1. All tests pass: ' + chalk.yellow('npm test'));
console.log('  2. Contract compiles: ' + chalk.yellow('npx hardhat compile'));
console.log('  3. Have mainnet ETH (~0.005 ETH for deployment)');
console.log('  4. Update Web3Config.ts to HEMI_MAINNET');
console.log('  5. Backup your private key securely');
console.log('  6. Review the contract one final time\n');

console.log(chalk.bold(chalk.green('📖 Read full guide:')));
console.log('   docs/MAINNET_DEPLOYMENT.md\n');

console.log(chalk.bold(chalk.blue('🚀 Deploy command:')));
console.log('   ' + chalk.yellow('npx hardhat run scripts/deploy-game.cjs --network hemi') + '\n');

console.log('=' .repeat(60) + '\n');

console.log(chalk.green('✅ Preparation checks passed!'));
console.log(chalk.yellow('⚠️  Double-check everything before deploying to mainnet\n'));
