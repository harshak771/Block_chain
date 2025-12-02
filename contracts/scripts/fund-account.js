#!/usr/bin/env node

/**
 * Script to fund test accounts with ETH on Hardhat local network
 * This allows users to test transactions and purchases
 */

const hre = require("hardhat");

async function fundAccount() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    
    // Get the account to fund from command line or use a default test account
    const targetAddress = process.argv[2] || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    
    const fundAmount = hre.ethers.parseEther("1000"); // 1000 ETH
    
    console.log(`\n💰 Funding account: ${targetAddress}`);
    console.log(`📊 Amount: 1000 ETH`);
    
    // Check current balance
    let balance = await hre.ethers.provider.getBalance(targetAddress);
    console.log(`💳 Current balance: ${hre.ethers.formatEther(balance)} ETH\n`);
    
    // Send ETH
    const tx = await deployer.sendTransaction({
      to: targetAddress,
      value: fundAmount,
    });
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    
    // Check new balance
    balance = await hre.ethers.provider.getBalance(targetAddress);
    console.log(`\n✅ Account funded successfully!`);
    console.log(`💳 New balance: ${hre.ethers.formatEther(balance)} ETH`);
    console.log(`📝 Block: ${receipt.blockNumber}\n`);
    
  } catch (error) {
    console.error("❌ Error funding account:", error.message);
    process.exit(1);
  }
}

fundAccount();
