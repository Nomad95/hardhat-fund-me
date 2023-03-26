const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "address1",
  },
  31337: {
    name: "hardhat",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  1337: {
    name: "ganache",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

const developmentChains = ["hardhat", "ganache"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
