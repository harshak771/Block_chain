import hre from "hardhat";

async function main() {
  console.log("\n🚀 Starting contract deployment...\n");

  try {
    const ethers = hre.ethers;
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying with: ${deployer.address}`);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Deploy RecipeNFT
    console.log("📦 Deploying RecipeNFT...");
    const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    const recipeNFT = await RecipeNFT.deploy();
    await recipeNFT.waitForDeployment();
    const recipeNFTAddr = await recipeNFT.getAddress();
    console.log(`✅ RecipeNFT: ${recipeNFTAddr}\n`);

    // Deploy RecipeCollaboration
    console.log("📦 Deploying RecipeCollaboration...");
    const RecipeCollaboration = await ethers.getContractFactory("RecipeCollaboration");
    const recipeCollab = await RecipeCollaboration.deploy();
    await recipeCollab.waitForDeployment();
    const recipeCollah = await recipeCollab.getAddress();
    console.log(`✅ RecipeCollaboration: ${recipeCollah}\n`);

    // Deploy RoyaltyDistribution
    console.log("📦 Deploying RoyaltyDistribution...");
    const RoyaltyDistribution = await ethers.getContractFactory("RoyaltyDistribution");
    const royalty = await RoyaltyDistribution.deploy();
    await royalty.waitForDeployment();
    const royaltyAddr = await royalty.getAddress();
    console.log(`✅ RoyaltyDistribution: ${royaltyAddr}\n`);

    // Deploy RecipeMarketplace
    console.log("📦 Deploying RecipeMarketplace...");
    const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
    const marketplace = await RecipeMarketplace.deploy(recipeNFTAddr);
    await marketplace.waitForDeployment();
    const marketplaceAddr = await marketplace.getAddress();
    console.log(`✅ RecipeMarketplace: ${marketplaceAddr}\n`);

    // Summary
    console.log("=".repeat(80));
    console.log("🎉 DEPLOYMENT COMPLETE!\n");
    console.log("📋 CONTRACT ADDRESSES (with correct checksums):");
    console.log(`NEXT_PUBLIC_RECIPE_NFT_ADDRESS=${recipeNFTAddr}`);
    console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddr}`);
    console.log(`NEXT_PUBLIC_COLLABORATION_ADDRESS=${recipeCollah}`);
    console.log(`NEXT_PUBLIC_ROYALTY_ADDRESS=${royaltyAddr}\n`);
    console.log("=".repeat(80) + "\n");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
