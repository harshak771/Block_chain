import ethers from "ethers";

async function main() {
  // Connect to localhost
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get default signer account (first account from hardhat node)
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const deployer = new ethers.Wallet(privateKey, provider);
  
  console.log("\n🚀 Deploying Contracts...\n");
  console.log(`📝 Deployer: ${deployer.address}`);
  
  const balance = await provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Create contract factory
  const { abi: RecipeNFTAbi, bytecode: RecipeNFTBytecode } = require("../artifacts/src/RecipeNFT.sol/RecipeNFT.json");
  const recipeNFTFactory = new ethers.ContractFactory(RecipeNFTAbi, RecipeNFTBytecode, deployer);
  
  console.log("📦 Deploying RecipeNFT...");
  const recipeNFT = await recipeNFTFactory.deploy();
  await recipeNFT.waitForDeployment();
  const recipeNFTAddr = await recipeNFT.getAddress();
  console.log(`✅ RecipeNFT deployed to: ${recipeNFTAddr}\n`);

  // Deploy other contracts similarly...
  console.log("✅ Deployment setup complete!\n");
  console.log("🌐 Frontend: http://localhost:3000/");
  console.log("🔗 Blockchain: http://127.0.0.1:8545/\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
