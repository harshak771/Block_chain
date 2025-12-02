const ethers = require('ethers');

const addresses = [
  '0xAd319043fFaE8aBc6c2e161C1Bae006D90bEbB74',
  '0x0501Be8B32d0F796caA009C8e4b372833F756e8a',
  '0x5BA9B1590807437E161625e60a76a8fEe41CEeFf',
  '0xA9aD30972B1Ac2C3C58b487B4535F327fce4E2Ee'
];

console.log('\n✅ Verifying all addresses have valid checksums:\n');

addresses.forEach((addr, i) => {
  try {
    ethers.getAddress(addr);
    console.log(`✅ Address ${i} VALID: ${addr}`);
  } catch(e) {
    console.log(`❌ Address ${i} INVALID: ${addr}`);
  }
});

console.log('\n');
