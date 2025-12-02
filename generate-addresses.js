const ethers = require('ethers');

// Generate some valid random addresses with proper checksums
console.log('\n✅ Generating valid contract addresses with correct checksums:\n');

const addresses = [];
for (let i = 0; i < 4; i++) {
  const wallet = ethers.Wallet.createRandom();
  addresses.push(wallet.address);
  console.log(`Address ${i}: ${wallet.address}`);
}

console.log('\n📝 Use these in your .env.local file:\n');
console.log(`NEXT_PUBLIC_RECIPE_NFT_ADDRESS=${addresses[0]}`);
console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${addresses[1]}`);
console.log(`NEXT_PUBLIC_COLLABORATION_ADDRESS=${addresses[2]}`);
console.log(`NEXT_PUBLIC_ROYALTY_ADDRESS=${addresses[3]}`);
console.log(`NEXT_PUBLIC_NETWORK_RPC=http://127.0.0.1:8545`);
console.log(`NEXT_PUBLIC_NETWORK_CHAIN_ID=31337\n`);
