import { ethers } from "ethers";

const HARDHAT_RPC = "http://127.0.0.1:8545";
const HARDHAT_CHAIN_ID = 31337;

// Hardhat test account #0 private key
const ACCOUNT_0_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb476caded74ee3a5514e49ba8d0c";

async function main() {
  console.log("🚀 Starting wallet funding...\n");

  const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
  const sourceAccount = new ethers.Wallet(ACCOUNT_0_PK, provider);

  console.log("📤 Funding from:", sourceAccount.address);
  const balance = await provider.getBalance(sourceAccount.address);
  console.log("Initial balance:", ethers.formatEther(balance), "ETH\n");

  // Fund 10 test addresses
  const testAddresses = [
    "0x70997970C51812e339D9B73b0245ad59419D51E1", // Account 1
    "0x3C44CdDdB6a900c6671B6e3Fa119e1213cb53dCc", // Account 2
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account 3
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Account 4
    "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec", // Account 5
  ];

  for (let i = 0; i < testAddresses.length; i++) {
    const targetAddress = testAddresses[i];
    console.log(`📥 Funding Account ${i + 1}: ${targetAddress}`);

    try {
      const tx = await sourceAccount.sendTransaction({
        to: targetAddress,
        value: ethers.parseEther("1000"),
      });

      const receipt = await tx.wait();
      const newBalance = await provider.getBalance(targetAddress);
      console.log(`   ✅ Sent 1000 ETH | Hash: ${receipt.hash}`);
      console.log(`   New balance: ${ethers.formatEther(newBalance)} ETH\n`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }

  console.log("✨ Funding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
