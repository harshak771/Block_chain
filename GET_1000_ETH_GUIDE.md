# How to Get 1000 Test ETH for Your MetaMask Wallet

Your wallet button already has a built-in faucet feature! Here's how to use it:

## Quick Steps:

1. **Open the app** at `http://localhost:3000`

2. **Click the Wallet Button** (top right corner)
   - It will show your connected address or "Connect Wallet" if not connected
   - First click to connect MetaMask

3. **Make sure you're on Hardhat Network**
   - MetaMask should show "Hardhat (127.0.0.1:8545)" or similar
   - Chain ID should be 31337
   - If not, add the network manually:
     - Network Name: `Hardhat`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency: `ETH`

4. **Click Wallet Button Again** after connecting
   - You'll see "Get 1000 Test ETH" option
   - Click it and approve the MetaMask popup

5. **Wait 2-3 seconds**
   - The transaction will be confirmed
   - Your balance will update to 1000 ETH+

6. **Now you can buy recipes!**

## If that doesn't work:

### Option A: Manual CLI Funding (Windows PowerShell)

```powershell
cd c:\Users\konda\Downloads\btp\contracts

# Create a temporary funding script
@"
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = provider.getSigner(0);  // Use default account #0

// Your MetaMask address - REPLACE THIS
const YOUR_ADDRESS = "0x...";

const tx = await signer.sendTransaction({
  to: YOUR_ADDRESS,
  value: ethers.parseEther("1000")
});

console.log("Transaction sent:", tx.hash);
await tx.wait();
console.log("✅ 1000 ETH sent to", YOUR_ADDRESS);
"@ | Out-File -FilePath temp-fund.js -Encoding utf8

node temp-fund.js
```

### Option B: Use Your Hardhat Account Directly

Hardhat creates funded test accounts automatically. You can import one into MetaMask:

**Account #0 (10,000 ETH):**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476caded74ee3a5514e49ba8d0c`

Steps:
1. In MetaMask, click the account avatar (top right)
2. Select "Import Account"
3. Paste the private key
4. Now this account has 10,000 ETH!

## Verification

Check your balance in the app:
- Dashboard → Transactions should show funding transaction
- MetaMask should display ~1000 ETH (minus gas fees)
- You can now buy recipes worth up to 1000 ETH

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Button doesn't appear | Make sure MetaMask is connected to Hardhat network (Chain 31337) |
| MetaMask shows wrong network | Manually add Hardhat network as described above |
| Transaction fails | Restart Hardhat node: `cd contracts` then `npx hardhat node` |
| Still no balance | Use Option B and import Hardhat Account #0 |

## Restart Everything (Nuclear Option)

```powershell
# Terminal 1: Kill and restart Hardhat
cd c:\Users\konda\Downloads\btp\contracts
taskkill /IM node.exe /F  # Kill all node processes
npx hardhat node

# Terminal 2: Restart dev server
cd c:\Users\konda\Downloads\btp
npm run dev
```

Then refresh your browser at `http://localhost:3000` and try the wallet button again.
