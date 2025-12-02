const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  console.log("🚀 Starting contract deployment...\n");

  // Get signers
  const [deployer, ...otherAccounts] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy RecipeNFT
  console.log("📦 Deploying RecipeNFT...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy();
  await recipeNFT.waitForDeployment();
  const recipeNFTAddress = await recipeNFT.getAddress();
  console.log(`✅ RecipeNFT deployed to: ${recipeNFTAddress}\n`);

  // Deploy RecipeCollaboration
  console.log("📦 Deploying RecipeCollaboration...");
  const RecipeCollaboration = await ethers.getContractFactory("RecipeCollaboration");
  const recipeCollaboration = await RecipeCollaboration.deploy();
  await recipeCollaboration.waitForDeployment();
  const recipeCollaborationAddress = await recipeCollaboration.getAddress();
  console.log(`✅ RecipeCollaboration deployed to: ${recipeCollaborationAddress}\n`);

  // Deploy RoyaltyDistribution
  console.log("📦 Deploying RoyaltyDistribution...");
  const RoyaltyDistribution = await ethers.getContractFactory("RoyaltyDistribution");
  const royaltyDistribution = await RoyaltyDistribution.deploy();
  await royaltyDistribution.waitForDeployment();
  const royaltyDistributionAddress = await royaltyDistribution.getAddress();
  console.log(`✅ RoyaltyDistribution deployed to: ${royaltyDistributionAddress}\n`);

  // Deploy RecipeMarketplace
  console.log("📦 Deploying RecipeMarketplace...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const recipeMarketplace = await RecipeMarketplace.deploy(recipeNFTAddress);
  await recipeMarketplace.waitForDeployment();
  const recipeMarketplaceAddress = await recipeMarketplace.getAddress();
  console.log(`✅ RecipeMarketplace deployed to: ${recipeMarketplaceAddress}\n`);

  // Mint a sample recipe NFT
  console.log("🎨 Minting sample recipe NFT...");
  const tx = await recipeNFT.mintRecipe(
    "QmSampleIPFSHash123456789", // IPFS hash
    "Chocolate Cake",             // name
    "A delicious chocolate cake", // description
    "Dessert",                    // cuisine
    15,                           // prepTime (minutes)
    30,                           // cookTime (minutes)
    2,                            // difficulty (1-5)
    8,                            // servings
    500                           // royaltyPercentage (5%)
  );
  await tx.wait();
  console.log(`✅ Recipe NFT minted! Transaction hash: ${tx.hash}\n`);

  // Get recipe details
  const tokenId = 0;
  const recipe = await recipeNFT.getRecipeMetadata(tokenId);
  console.log("📖 Recipe Details:");
  console.log(`  Name: ${recipe.name}`);
  console.log(`  Description: ${recipe.description}`);
  console.log(`  Cuisine: ${recipe.cuisine}`);
  console.log(`  Prep Time: ${recipe.prepTime} minutes`);
  console.log(`  Cook Time: ${recipe.cookTime} minutes`);
  console.log(`  Difficulty: ${recipe.difficulty}/5`);
  console.log(`  Servings: ${recipe.servings}\n`);

  // Fund test accounts with ETH
  console.log("💸 Funding test accounts with ETH...\n");
  const fundAmount = ethers.parseEther("100"); // 100 ETH per account

  for (let i = 0; i < Math.min(5, otherAccounts.length); i++) {
    const tx = await deployer.sendTransaction({
      to: otherAccounts[i].address,
      value: fundAmount,
    });
    await tx.wait();
    const balance = await ethers.provider.getBalance(otherAccounts[i].address);
    console.log(`✅ Account #${i + 1}: ${otherAccounts[i].address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);
  }

  // Summary
  console.log("================================================================================");
  console.log("🎉 DEPLOYMENT COMPLETE!\n");
  console.log("📋 CONTRACT ADDRESSES:");
  console.log(`  RecipeNFT:           ${recipeNFTAddress}`);
  console.log(`  RecipeCollaboration: ${recipeCollaborationAddress}`);
  console.log(`  RoyaltyDistribution: ${royaltyDistributionAddress}`);
  console.log(`  RecipeMarketplace:   ${recipeMarketplaceAddress}\n`);
  console.log("🔗 Blockchain Network:");
  console.log(`  RPC: http://127.0.0.1:8545/\n`);
  console.log("🌐 Frontend:");
  console.log(`  URL: http://localhost:3000/\n`);
  console.log("================================================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
