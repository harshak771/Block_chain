# Quick Start: MetaMask Transactions

## 🔧 Setup (One-Time)

### 1. Install MetaMask
- Download from https://metamask.io/
- Install as browser extension

### 2. Add Hardhat Network
In MetaMask, go to Settings → Networks → Add Network:
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

### 3. Start Services
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Start Next.js dev server
npm run dev
```

### 4. Import Test Account (Optional)
In MetaMask → Import Account, use any private key from Hardhat output:
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c65f...
```

---

## 💰 Get Test ETH (Before Buying)

1. Go to http://localhost:3000
2. Click **Connect Wallet** (top right)
3. Approve MetaMask connection
4. Click wallet address in top right → dropdown
5. Click **Get 1000 Test ETH**
6. Approve transaction in MetaMask
7. ✅ See "✅ 1000 ETH sent!"

**Result:** Your wallet now has 1000+ ETH for testing

---

## 🛒 Buy a Recipe

### From Featured Recipes Tab
1. Navigate to **Marketplace** (sidebar)
2. Click **Featured Recipes** tab
3. Click **Buy** on any recipe card
4. Review price (e.g., "1.5 ETH")
5. Click **Confirm Purchase**
6. Approve MetaMask popup
7. ✅ See "✅ Purchase successful!"

### From Smart Contract Listings Tab
1. Navigate to **Marketplace** 
2. Click **Smart Contract Listings** tab
3. Click on a recipe to see details
4. Click **Confirm Purchase**
5. Approve MetaMask popup
6. ✅ Transaction completes

**Result:** ETH sent to recipe creator, recipe added to your collection

---

## 🍳 Mint Your Own Recipe

1. Go to **Dashboard** (sidebar)
2. Fill in recipe details:
   - Title, description, ingredients, steps
   - Prep/cook times, difficulty, servings
   - Upload an image
3. Click **Mint Recipe NFT**
4. Approve IPFS uploads + MetaMask transaction
5. ✅ See success with TX hash

**Result:** Your recipe becomes an NFT on the blockchain!

---

## 💡 Quick Reference

| Action | Location | Cost |
|--------|----------|------|
| Get Test ETH | Wallet Menu | 1000 ETH |
| Buy Recipe | Recipe Card | Varies (0.8-3.5 ETH) |
| Mint Recipe | Dashboard Tab | Gas only |
| List Recipe | Dashboard Tab | Gas only |

---

## 🐛 Troubleshooting

### "Please connect your wallet"
→ Click **Connect Wallet**, approve MetaMask

### "User denied transaction"
→ You clicked "Reject" in MetaMask - try again and click "Approve"

### MetaMask shows wrong network
→ Switch to "Hardhat Local" in MetaMask network dropdown

### Balance doesn't update
→ Wait 2-3 seconds, balance updates automatically

### "Cannot read property 'ethereum'"
→ MetaMask not installed - download from metamask.io

### Hardhat node keeps stopping
→ Make sure port 8545 isn't in use: `netstat -ano | findstr :8545`

---

## ✨ Pro Tips

- **Free transactions:** On Hardhat, gas is free!
- **Instant transactions:** Local blockchain is instant
- **Unlimited funds:** Get 1000 ETH as many times as you want
- **Multiple accounts:** Import different Hardhat accounts to test
- **Inspect TX:** Look up transaction hash on "Hardhat Chain"

---

## 📊 Example Prices

| Recipe | Price | Creator |
|--------|-------|---------|
| Margherita Pizza | 1.5 ETH | 0xf39fd6... |
| Spaghetti Carbonara | 2.0 ETH | 0x70997... |
| Chocolate Lava Cake | 1.8 ETH | 0x3c44c... |
| Greek Salad | 0.8 ETH | 0x90f79... |
| Beef Tacos | 1.2 ETH | 0x15d34... |

---

## 🎯 Next Steps

After testing purchases:
1. Try minting your own recipe
2. List your recipe for sale
3. Explore marketplace filters
4. Check transaction history
5. Share your recipes! 🍽️

---

**Happy cooking & trading! 👨‍🍳🚀**

*Remember: All transactions are on local Hardhat network - no real ETH spent!*
