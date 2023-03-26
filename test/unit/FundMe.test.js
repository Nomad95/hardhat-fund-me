const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1");

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture();
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.getPriceFeed();

      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
    });

    it("updates the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);

      assert.equal(response.toString(), sendValue.toString());
    });

    it("adds funder to array of funders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.getFunder(0);

      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single founder", async () => {
      //given
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //when
      const txResponse = await fundMe.withdraw();
      const transactionReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //then
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw withdraw ETH with multiple funders", async () => {
      //given
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedCOntract = await fundMe.connect(accounts[i]);
        await fundMeConnectedCOntract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //when
      const txResponse = await fundMe.withdraw();
      const transactionReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //then
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.getFunder(0)).to.be.reverted;
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);

      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });

  describe("cheaperWithdraw", async function () {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single founder", async () => {
      //given
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //when
      const txResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //then
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw withdraw ETH with multiple funders", async () => {
      //given
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedCOntract = await fundMe.connect(accounts[i]);
        await fundMeConnectedCOntract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      //when
      const txResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      //then
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.getFunder(0)).to.be.reverted;
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("only allows owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);

      await expect(
        attackerConnectedContract.cheaperWithdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });
});
