const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports.default = async ({ getNamedAccounts, deployment }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //deploy a mock of chainlink aggregator if on a dev chain
  let ethUsdPriceFeeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  log("Deploying FundMe contract");
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeeedAddress],
    log: true,
    blockConfirmations: network.config.blockConfirmations || 1,
  });
  log("FundMe contract deployed");
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeeedAddress]);
  }
  log("------------------------");
};
