require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("dotenv").config();

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL || "https://something:1234";
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY || "0xkey";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.18" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    ganache: {
      url: GANACHE_RPC_URL,
      accounts: [GANACHE_PRIVATE_KEY],
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    rinkeby: {
      url: "RINKEBY_URL",
      accounts: [GANACHE_PRIVATE_KEY], //add your private key
      chainId: 4,
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
  },
};
