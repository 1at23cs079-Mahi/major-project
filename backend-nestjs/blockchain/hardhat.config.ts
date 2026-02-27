import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development network (default)
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 1000, // Mine every second for dev
      },
    },
    // Local node for testing
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Ganache (alternative local chain)
    ganache: {
      url: process.env.GANACHE_URL || "http://127.0.0.1:7545",
      chainId: 1337,
    },
    // Sepolia testnet (for staging)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "../src/modules/blockchain/typechain",
    target: "ethers-v6",
  },
};

export default config;
