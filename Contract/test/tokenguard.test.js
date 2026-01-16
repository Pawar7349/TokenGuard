const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenGuard + MockERC20", function () {
  let MockERC20, mockToken, mockTokenAddress;
  let TokenGuard, tokenGuard, tokenGuardAddress;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy MockERC20
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy();
    await mockToken.waitForDeployment(); // CHANGED: deployed() → waitForDeployment()
    mockTokenAddress = await mockToken.getAddress(); // CHANGED: .address → getAddress()

    // Deploy TokenGuard
    TokenGuard = await ethers.getContractFactory("TokenGuard");
    tokenGuard = await TokenGuard.deploy();
    await tokenGuard.waitForDeployment();
    tokenGuardAddress = await tokenGuard.getAddress();

    // Transfer tokens to test accounts
    const amount = ethers.parseEther("1000"); // CHANGED: utils.parseEther → parseEther
    await mockToken.transfer(user1.address, amount);
    await mockToken.transfer(user2.address, amount);
    await mockToken.transfer(user3.address, amount);

    // User2 approves TokenGuard
    const mockTokenUser2 = mockToken.connect(user2);
    await mockTokenUser2.approve(tokenGuardAddress, amount);
  });

  describe("MockERC20", function () {
    it("Should deploy with correct values", async function () {
      expect(await mockToken.name()).to.equal("Mock Token");
      expect(await mockToken.symbol()).to.equal("MOCK");
      expect(await mockToken.totalSupply()).to.equal(ethers.parseEther("1000000"));
    });

    it("Should transfer tokens correctly", async function () {
      const amount = ethers.parseEther("100");
      await mockToken.transfer(user1.address, amount);
      expect(await mockToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1100"));
    });

    it("Should approve and transferFrom correctly", async function () {
      const amount = ethers.parseEther("100");
      await mockToken.connect(user1).approve(user2.address, amount);
      await mockToken.connect(user2).transferFrom(user1.address, user3.address, amount);
      expect(await mockToken.balanceOf(user3.address)).to.equal(ethers.parseEther("1100"));
    });
  });

  describe("TokenGuard - Basic Functions", function () {
    it("Should deploy with correct owner", async function () {
      expect(await tokenGuard.owner()).to.equal(owner.address);
    });

    it("Should have correct initial reward percent", async function () {
      expect(await tokenGuard.rewardPercent()).to.equal(5);
    });

    it("Should allow owner to change reward percent", async function () {
      await tokenGuard.setRewardPercent(10);
      expect(await tokenGuard.rewardPercent()).to.equal(10);
    });

    it("Should not allow non-owner to change reward percent", async function () {
      await expect(
        tokenGuard.connect(user1).setRewardPercent(10)
      ).to.be.revertedWith("Only owner");
    });

    it("Should not allow reward percent above 20%", async function () {
      await expect(
        tokenGuard.setRewardPercent(21)
      ).to.be.revertedWith("Reward too high");
    });
  });

  describe("TokenGuard - Report Lost Tokens", function () {
    const txHash = "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12345";
    const amount = ethers.parseEther("100");

    it("Should report lost tokens successfully", async function () {
      await tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount);
      
      const status = await tokenGuard.checkStatus(txHash);
      expect(status.reporter).to.equal(user1.address);
      expect(status.token).to.equal(mockTokenAddress);
      expect(status.amount).to.equal(amount);
      expect(status.reward).to.equal(amount * 5n / 100n); // CHANGED: Use BigInt
      expect(status.resolved).to.equal(false);
      expect(status.disputed).to.equal(false);
      expect(status.returnedBy).to.equal(ethers.ZeroAddress); // CHANGED: constants.AddressZero → ZeroAddress
    });

    it("Should calculate correct reward (5%)", async function () {
      await tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount);
      const status = await tokenGuard.checkStatus(txHash);
      expect(status.reward).to.equal(ethers.parseEther("5")); // 5% of 100
    });

    it("Should not allow reporting same transaction twice", async function () {
      await tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount);
      
      await expect(
        tokenGuard.connect(user2).reportLost(txHash, mockTokenAddress, amount)
      ).to.be.revertedWith("Already reported");
    });

    it("Should not allow reporting zero amount", async function () {
      await expect(
        tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, 0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should emit TokenReported event", async function () {
      await expect(tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount))
        .to.emit(tokenGuard, "TokenReported")
        .withArgs(txHash, user1.address, amount, amount * 5n / 100n);
    });
  });

  describe("TokenGuard - Return Lost Tokens", function () {
    const txHash = "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12345";
    const amount = ethers.parseEther("100");

    beforeEach(async function () {
      await tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount);
    });

    it("Should return lost tokens successfully", async function () {
      const initialUser1Balance = await mockToken.balanceOf(user1.address);
      const initialUser2Balance = await mockToken.balanceOf(user2.address);
      
      await tokenGuard.connect(user2).returnTokens(txHash);
      
      const finalUser1Balance = await mockToken.balanceOf(user1.address);
      const finalUser2Balance = await mockToken.balanceOf(user2.address);
      
      expect(finalUser1Balance).to.equal(initialUser1Balance + amount);
      expect(finalUser2Balance).to.equal(initialUser2Balance - amount);
      
      const status = await tokenGuard.checkStatus(txHash);
      expect(status.resolved).to.equal(true);
      expect(status.returnedBy).to.equal(user2.address);
    });

    it("Should not allow returning unreported tokens", async function () {
      await expect(
        tokenGuard.connect(user2).returnTokens("0xnonexistent")
      ).to.be.revertedWith("Token not reported");
    });

    it("Should not allow returning already returned tokens", async function () {
      await tokenGuard.connect(user2).returnTokens(txHash);
      
      await expect(
        tokenGuard.connect(user3).returnTokens(txHash)
      ).to.be.revertedWith("Already returned");
    });

    it("Should not allow reporter to return their own tokens", async function () {
      await expect(
        tokenGuard.connect(user1).returnTokens(txHash)
      ).to.be.revertedWith("Cannot return your own token");
    });

    it("Should emit TokenReturned event", async function () {
      await expect(tokenGuard.connect(user2).returnTokens(txHash))
        .to.emit(tokenGuard, "TokenReturned")
        .withArgs(txHash, user2.address, amount * 5n / 100n);
    });

    it("Should fail if returner doesn't have enough allowance", async function () {
      // User3 hasn't approved TokenGuard
      await expect(
        tokenGuard.connect(user3).returnTokens(txHash)
      ).to.be.revertedWith("Not approved");
    });
  });

  describe("TokenGuard - Disputes", function () {
    const txHash = "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef12345";
    const amount = ethers.parseEther("100");

    beforeEach(async function () {
      await tokenGuard.connect(user1).reportLost(txHash, mockTokenAddress, amount);
      await tokenGuard.connect(user2).returnTokens(txHash);
    });

    it("Should allow reporter to file dispute", async function () {
      await tokenGuard.connect(user1).fileDispute(txHash, "Wrong tokens returned");
      
      const status = await tokenGuard.checkStatus(txHash);
      expect(status.disputed).to.equal(true);
    });

    it("Should not allow non-reporter to file dispute", async function () {
      await expect(
        tokenGuard.connect(user3).fileDispute(txHash, "I want to dispute")
      ).to.be.revertedWith("Only reporter can dispute");
    });

    it("Should not allow dispute before return", async function () {
      const txHash2 = "0x2222222222222222222222222222222222222222222222222222222222222222";
      await tokenGuard.connect(user1).reportLost(txHash2, mockTokenAddress, amount);
      
      await expect(
        tokenGuard.connect(user1).fileDispute(txHash2, "Too early")
      ).to.be.revertedWith("Token not returned yet");
    });

    it("Should not allow duplicate disputes", async function () {
      await tokenGuard.connect(user1).fileDispute(txHash, "First dispute");
      
      await expect(
        tokenGuard.connect(user1).fileDispute(txHash, "Second dispute")
      ).to.be.revertedWith("Already disputed");
    });

    it("Should emit DisputeFiled event", async function () {
      await expect(tokenGuard.connect(user1).fileDispute(txHash, "These are fake tokens"))
        .to.emit(tokenGuard, "DisputeFiled")
        .withArgs(txHash, user1.address, "These are fake tokens");
    });
  });

  describe("TokenGuard - Edge Cases", function () {
    it("Should handle multiple lost token reports", async function () {
      const txHash1 = "0x1111111111111111111111111111111111111111111111111111111111111111";
      const txHash2 = "0x2222222222222222222222222222222222222222222222222222222222222222";
      const amount = ethers.parseEther("100");
      
      await tokenGuard.connect(user1).reportLost(txHash1, mockTokenAddress, amount);
      await tokenGuard.connect(user2).reportLost(txHash2, mockTokenAddress, amount);
      
      const status1 = await tokenGuard.checkStatus(txHash1);
      const status2 = await tokenGuard.checkStatus(txHash2);
      
      expect(status1.reporter).to.equal(user1.address);
      expect(status2.reporter).to.equal(user2.address);
    });

    it("Should allow different users to return different lost tokens", async function () {
      const txHash1 = "0x1111111111111111111111111111111111111111111111111111111111111111";
      const txHash2 = "0x2222222222222222222222222222222222222222222222222222222222222222";
      const amount = ethers.parseEther("100");
      
      await tokenGuard.connect(user1).reportLost(txHash1, mockTokenAddress, amount);
      await tokenGuard.connect(user2).reportLost(txHash2, mockTokenAddress, amount);
      
      // User2 approves for returning txHash1
      await mockToken.connect(user2).approve(tokenGuardAddress, amount);
      // User3 approves for returning txHash2
      await mockToken.connect(user3).approve(tokenGuardAddress, amount);
      
      await tokenGuard.connect(user2).returnTokens(txHash1);
      await tokenGuard.connect(user3).returnTokens(txHash2);
      
      const status1 = await tokenGuard.checkStatus(txHash1);
      const status2 = await tokenGuard.checkStatus(txHash2);
      
      expect(status1.returnedBy).to.equal(user2.address);
      expect(status2.returnedBy).to.equal(user3.address);
    });
  });
});