// scripts/deploy.js - FINAL CORRECTED VERSION FOR HARDHAT v6
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");
  
  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy MockERC20
  console.log("\nDeploying MockERC20...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy();
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockERC20 deployed to:", mockTokenAddress);
  
  // Deploy TokenGuard
  console.log("\nDeploying TokenGuard...");
  const TokenGuard = await ethers.getContractFactory("TokenGuard");
  const tokenGuard = await TokenGuard.deploy();
  await tokenGuard.waitForDeployment();
  const tokenGuardAddress = await tokenGuard.getAddress();
  console.log("TokenGuard deployed to:", tokenGuardAddress);
  
  // Check deployer's token balance
  const deployerBalance = await mockToken.balanceOf(deployer.address);
  console.log("\nDeployer MOCK balance:", ethers.formatEther(deployerBalance));
  
  // Transfer tokens to test account (only if multiple accounts available)
  const accounts = await ethers.getSigners();
  
  if (accounts.length > 1) {
    // Multiple accounts available (local network)
    const testAccount = accounts[1];
    const transferAmount = ethers.parseEther("1000");
    console.log(`\nTransferring 1000 MOCK to test account: ${testAccount.address}`);
    const tx = await mockToken.transfer(testAccount.address, transferAmount);
    await tx.wait();
    
    const testBalance = await mockToken.balanceOf(testAccount.address);
    console.log("Test account MOCK balance:", ethers.formatEther(testBalance));
  } else {
    // Single account (testnet/mainnet)
    console.log("\n⚠️  Single account detected (Sepolia testnet deployment)");
    console.log("All tokens are held by deployer");
    console.log("You can transfer tokens manually after deployment");
  }
  
  // Save addresses
  const fs = require("fs");
  const network = await ethers.provider.getNetwork();
  
  const addresses = {
    network: network.name,
    chainId: Number(network.chainId),
    mockToken: mockTokenAddress,
    tokenGuard: tokenGuardAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync("deployed.json", JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment complete! Addresses saved to deployed.json");
  
  console.log("\n=== DEPLOYED CONTRACT ADDRESSES ===");
  console.log("Network:", network.name);
  console.log("MockERC20:", mockTokenAddress);
  console.log("TokenGuard:", tokenGuardAddress);
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Update your frontend config with these addresses");
  console.log("2. You can mint more tokens: mockToken.mint(address, amount)");
  console.log("3. Transfer tokens to test accounts as needed");
  console.log("4. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${mockTokenAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${tokenGuardAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });