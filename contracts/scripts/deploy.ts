import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RecipeNFT contracts...");
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy RecipeNFT
  console.log("\n1. Deploying RecipeNFT...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy();
  await recipeNFT.waitForDeployment();
  const recipeNFTAddress = await recipeNFT.getAddress();
  console.log("RecipeNFT deployed to:", recipeNFTAddress);

  // Deploy RecipeMarketplace
  console.log("\n2. Deploying RecipeMarketplace...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const recipeMarketplace = await RecipeMarketplace.deploy(recipeNFTAddress);
  await recipeMarketplace.waitForDeployment();
  const recipeMarketplaceAddress = await recipeMarketplace.getAddress();
  console.log("RecipeMarketplace deployed to:", recipeMarketplaceAddress);

  // Deploy RoyaltyDistribution
  console.log("\n3. Deploying RoyaltyDistribution...");
  const RoyaltyDistribution = await ethers.getContractFactory("RoyaltyDistribution");
  const royaltyDistribution = await RoyaltyDistribution.deploy();
  await royaltyDistribution.waitForDeployment();
  const royaltyDistributionAddress = await royaltyDistribution.getAddress();
  console.log("RoyaltyDistribution deployed to:", royaltyDistributionAddress);

  // Deploy RecipeCollaboration
  console.log("\n4. Deploying RecipeCollaboration...");
  const RecipeCollaboration = await ethers.getContractFactory("RecipeCollaboration");
  const recipeCollaboration = await RecipeCollaboration.deploy();
  await recipeCollaboration.waitForDeployment();
  const recipeCollaborationAddress = await recipeCollaboration.getAddress();
  console.log("RecipeCollaboration deployed to:", recipeCollaborationAddress);

  // Save addresses
  const deploymentAddresses = {
    recipeNFT: recipeNFTAddress,
    recipeMarketplace: recipeMarketplaceAddress,
    royaltyDistribution: royaltyDistributionAddress,
    recipeCollaboration: recipeCollaborationAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n✅ All contracts deployed successfully!");
  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentAddresses, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const networkName = (await ethers.provider.getNetwork()).name;
  const filename = path.join(deploymentsDir, `${networkName}-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentAddresses, null, 2));
  console.log(`\nDeployment addresses saved to: ${filename}`);

  return deploymentAddresses;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
