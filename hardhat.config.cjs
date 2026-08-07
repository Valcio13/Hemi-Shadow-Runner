require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv/config");

// Register ts-node with Hardhat-specific tsconfig
require("ts-node").register({
  transpileOnly: true,
  project: "./tsconfig.hardhat.json",
  compilerOptions: {
    module: "commonjs",
  },
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Hemi Sepolia Testnet
    hemiSepolia: {
      url: process.env.HEMI_SEPOLIA_RPC || "https://testnet.rpc.hemi.network/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 743111,
    },
    // Hemi Mainnet
    hemi: {
      url: process.env.HEMI_RPC || "https://rpc.hemi.network/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 43111,
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      hemiSepolia: process.env.HEMI_EXPLORER_API_KEY || "not-needed",
      hemi: process.env.HEMI_EXPLORER_API_KEY || "not-needed",
    },
    customChains: [
      {
        network: "hemiSepolia",
        chainId: 743111,
        urls: {
          apiURL: "https://testnet.explorer.hemi.xyz/api",
          browserURL: "https://testnet.explorer.hemi.xyz",
        },
      },
      {
        network: "hemi",
        chainId: 43111,
        urls: {
          apiURL: "https://explorer.hemi.xyz/api",
          browserURL: "https://explorer.hemi.xyz",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
