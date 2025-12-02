#!/usr/bin/env node

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Change to contracts directory
process.chdir(path.join(__dirname, ".."));

// Import hardhat
const hardhat = require("hardhat");
const ethers = hardhat.ethers;

async function deploy() {
  console.log("\n🚀 Starting contract deployment...\n");

  try {
    // Get signers
    const [deployer, ...otherAccounts] = await ethers.getSigners();
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

    // Mint sample recipe
    console.log("🎨 Minting sample recipe...");
    const mintTx = await recipeNFT.mintRecipe(
      "QmSampleIPFSHash123",
      "Chocolate Cake",
      "A delicious chocolate cake",
      "Dessert",
      15,
      30,
      2,
      8,
      500
    );
    await mintTx.wait();
    console.log(`✅ Recipe minted!\n`);

    // Get recipe details
    const recipe = await recipeNFT.getRecipeMetadata(0);
    console.log("📖 Recipe Details:");
    console.log(`  Name: ${recipe.name}`);
    console.log(`  Cuisine: ${recipe.cuisine}`);
    console.log(`  Difficulty: ${recipe.difficulty}/5\n`);

    // Fund test accounts
    console.log("💸 Funding test accounts...\n");
    const fundAmount = ethers.parseEther("100");
    
    for (let i = 0; i < Math.min(5, otherAccounts.length); i++) {
      const tx = await deployer.sendTransaction({
        to: otherAccounts[i].address,
        value: fundAmount,
      });
      await tx.wait();
      const bal = await ethers.provider.getBalance(otherAccounts[i].address);
      console.log(`✅ Account #${i + 1}: ${otherAccounts[i].address}`);
      console.log(`   Balance: ${ethers.formatEther(bal)} ETH\n`);
    }

    // Summary
    console.log("================================================================================");
    console.log("🎉 DEPLOYMENT COMPLETE!\n");
    console.log("📋 CONTRACT ADDRESSES:");
    console.log(`  RecipeNFT:           ${recipeNFTAddr}`);
    console.log(`  RecipeCollaboration: ${recipeCollah}`);
    console.log(`  RoyaltyDistribution: ${royaltyAddr}`);
    console.log(`  RecipeMarketplace:   ${marketplaceAddr}\n`);
    console.log("🔗 Blockchain: http://127.0.0.1:8545/");
    console.log("🌐 Frontend:    http://localhost:3000/\n");
    console.log("================================================================================\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

deploy();
