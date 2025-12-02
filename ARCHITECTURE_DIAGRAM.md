# 🏗️ MetaMask Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     RecipeNFT dApp Architecture                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Frontend (Next.js 16 + React)                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Pages & Components                                       │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • app/marketplace/page.tsx                              │ │
│  │   ├─ MarketplaceBrowser (Top)                           │ │
│  │   │  ├─ SampleRecipesGrid (Featured Tab) ✨            │ │
│  │   │  │  └─ RecipeCard[] → Buy → Dialog → sendETH       │ │
│  │   │  └─ Smart Contract Listings (Listings Tab) ✨      │ │
│  │   │     └─ RecipeCard[] → Buy → Dialog → sendETH       │ │
│  │                                                         │ │
│  │ • app/dashboard/page.tsx                               │ │
│  │   ├─ RecipeMintForm                                    │ │
│  │   │  └─ Mint → IPFS → Contract → MetaMask → Success   │ │
│  │                                                         │ │
│  │ • Layout                                               │ │
│  │   └─ WalletButton ✨                                   │ │
│  │      ├─ Connect Wallet                                 │ │
│  │      ├─ Show Balance & Network                         │ │
│  │      └─ Get 1000 Test ETH (Hardhat only)             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Hooks (State Management)                                │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • useWallet                                             │ │
│  │   ├─ wallet.address                                    │ │
│  │   ├─ wallet.balance                                    │ │
│  │   ├─ wallet.chainId                                    │ │
│  │   ├─ isConnected                                       │ │
│  │   ├─ connect()                                         │ │
│  │   └─ disconnect()                                      │ │
│  │                                                         │ │
│  │ • useMarketplace                                        │ │
│  │   ├─ listings[]                                         │ │
│  │   ├─ purchaseRecipe()                                  │ │
│  │   └─ loading state                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Web3 Utilities ✨ ENHANCED                              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ lib/web3.ts                                             │ │
│  │ ├─ connectWallet()         → ethers BrowserProvider    │ │
│  │ ├─ getConnectedWallet()    → wallet info               │ │
│  │ ├─ getWalletBalance()      → balance query             │ │
│  │ ├─ watchWalletChanges()    → chain/account changed    │ │
│  │ ├─ sendETH() ✨ NEW        → eth_sendTransaction      │ │
│  │ ├─ buyRecipe() ✨ NEW      → marketplace payment       │ │
│  │ └─ requestTestFunds() ✨ NEW → /api/faucet call      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Contract Utilities                                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ lib/contract.ts                                         │ │
│  │ ├─ mintRecipeNFT()      → Uses ethers + MetaMask       │ │
│  │ ├─ getRecipeNFTBalance()                               │ │
│  │ ├─ listRecipeForSale()                                 │ │
│  │ └─ getRecipeListing()                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              ↓ HTTP/RPC
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ Backend Services                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Next.js API Routes                                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • /api/faucet ✨ NEW (POST)                             │ │
│  │   │                                                     │ │
│  │   ├─ Request: { address: "0x..." }                     │ │
│  │   ├─ Response: { success, message, hash }              │ │
│  │   └─ Action: Sends 1000 ETH via Hardhat RPC           │ │
│  │                                                         │ │
│  │ • /api/actions/ipfs (optional)                         │ │
│  │   └─ Handles IPFS uploads                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              ↓ RPC Calls
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ Blockchain Layer (Hardhat Local Network)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Network: http://127.0.0.1:8545                              │
│  Chain ID: 31337                                             │
│  Accounts: 20 pre-funded with 10,000 ETH each               │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Smart Contracts (Deployed)                              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • RecipeNFT (ERC721) ✨ ← mintRecipe() called here    │ │
│  │   ├─ Mints recipe as NFT                               │ │
│  │   ├─ Stores IPFS hash                                  │ │
│  │   └─ Tracks royalties                                  │ │
│  │                                                         │ │
│  │ • RecipeMarketplace ✨ ← buyRecipe() called here      │ │
│  │   ├─ Lists recipes for sale                            │ │
│  │   ├─ Handles purchases                                 │ │
│  │   └─ Escrow & royalty distribution                    │ │
│  │                                                         │ │
│  │ • RoyaltyDistribution                                  │ │
│  │   └─ Manages creator royalties                         │ │
│  │                                                         │ │
│  │ • RecipeCollaboration                                  │ │
│  │   └─ Handles recipe modifications                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ RPC Methods Called                                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • eth_sendTransaction ← sendETH() & Minting            │ │
│  │ • eth_getBalance ← Balance queries                     │ │
│  │ • eth_chainId ← Network detection                      │ │
│  │ • eth_call ← Read-only contract calls                  │ │
│  │ • eth_getTransactionReceipt ← TX confirmation          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              ↓ Signed by
                              ↓
┌──────────────────────────────────────────────────────────────┐
│ User's Wallet (MetaMask)                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  • Extension running in browser                              │
│  • Manages private keys (never exposed to app)               │
│  • Signs all transactions                                    │
│  • Shows confirmation popup to user                          │
│  • Broadcasts signed transactions to Hardhat               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow for Purchase Transaction

```
USER INTERACTION                    FRONTEND                    BLOCKCHAIN
═════════════════════════════════════════════════════════════════════════════

User clicks "Buy"
      ↓
      └──→ RecipeCard.onBuy()
            └──→ setSelectedListing(id)
                  └──→ Dialog opens

Review price
      ↓
      └──→ User sees:
            • Recipe: "Margherita Pizza"
            • Creator: "0xf39f..."
            • Price: "1.5 ETH"

Click "Confirm Purchase"
      ↓
      └──→ handleBuyClick()
            ├─ Check: isConnected? ✓
            ├─ Check: wallet? ✓
            └──→ setIsProcessing(true)
                  └──→ setMessage("Processing...")

                      ┌─ Call: sendETH()
                      │
                      └──→ window.ethereum.request()
                            {
                              method: "eth_sendTransaction",
                              params: [{
                                from: wallet.address,
                                to: creator.address,
                                value: "0x" + weiAmount,
                                gas: "0x5208"
                              }]
                            }
                                  ↓
                                  └──→ MetaMask Popup
                                        └──→ User Reviews & Approves

                                              ↓
                                              └──→ MetaMask Signs TX
                                                    └──→ Broadcasts to
                                                         Hardhat Node
                                                         
                                                    Receipt:
                                                    • hash: "0xabc123..."
                                                    • status: 1 (success)
                                                    • from: user_address
                                                    • to: creator_address
                                                    • value: "1500000000000000000" (1.5 ETH in Wei)
                                                    • blockNumber: 12345
                                                    • gasUsed: 21000

                      ← Return: txHash

Display Success
      ↓
      └──→ setTxHash("0xabc123...")
            setMessage("✅ Purchase successful!")
            └──→ Dialog shows:
                  • "✅ Purchase successful!"
                  • TX Hash: 0xabc123...

Auto-close Dialog
      ↓
      └──→ setTimeout 3000ms
            setSelectedListing(null)
            ← Clean UI state
```

---

## Component Communication

```
WalletButton (Header)
├─ Connects wallet
├─ Shows balance
├─ Provides useWallet hook
└─ "Get 1000 Test ETH" button
     │
     ├─→ POST /api/faucet
     │    └─→ Hardhat RPC sends 1000 ETH
     │
     └─→ useWallet updates balance


MarketplaceBrowser (Main)
├─ Featured Recipes Tab
│  └─ SampleRecipesGrid
│     ├─ Map over SAMPLE_RECIPES
│     ├─ Each RecipeCard has onBuy callback
│     └─ Buy → sendETH(creator, price)
│
├─ Smart Contract Listings Tab
│  ├─ Map over listings from useMarketplace
│  ├─ Each RecipeCard has onBuy callback
│  └─ Buy → sendETH(seller, price)
│
└─ Purchase Dialog (shared)
   ├─ Shows recipe details
   ├─ Displays price
   ├─ "Confirm Purchase" button
   └─ TX feedback display


RecipeMintForm (Dashboard)
├─ Fill in recipe details
├─ Upload image → IPFS
├─ Upload metadata → IPFS
├─ Click "Mint Recipe NFT"
├─ mintRecipeNFT(metadataHash)
│  └─ Uses ethers + window.ethereum
│     └─ MetaMask confirmation
└─ Success with TX hash


Hooks (State Management)
├─ useWallet
│  ├─ wallet data
│  ├─ connection status
│  └─ update on chain/account change
│
└─ useMarketplace
   ├─ listings data
   └─ purchase function
```

---

## Web3 Integration Points

```
┌─────────────────┐
│  User's Action  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Component Event Handler                     │
│ (handleBuyClick, handleConfirmPurchase)     │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Web3 Utility Function                       │
│ sendETH(toAddress, amountETH)               │
│  ├─ Convert ETH → Wei                       │
│  ├─ Get connected wallet                    │
│  └─ Call eth_sendTransaction                │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ window.ethereum                             │
│ (MetaMask Provider)                         │
│  └─ .request({                              │
│      method: "eth_sendTransaction",         │
│      params: [tx]                           │
│    })                                       │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ MetaMask UI                                 │
│ (User Confirms Transaction)                 │
│  ├─ Shows TX details                        │
│  ├─ User clicks Approve/Reject              │
│  └─ Signs with private key                  │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Hardhat Node                                │
│ (Local Blockchain)                          │
│  ├─ Validates TX                            │
│  ├─ Executes contract code                  │
│  ├─ Updates state                           │
│  └─ Returns TX hash & receipt               │
└────────┬────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│ Response Handler                            │
│ (Component State Update)                    │
│  ├─ setTxHash(hash)                         │
│  ├─ setMessage("Success!")                  │
│  ├─ Update balance                          │
│  └─ Close dialog after 3s                   │
└─────────────────────────────────────────────┘
```

---

## State Management Flow

```
useWallet Hook
├─ isConnected: boolean
├─ wallet: {
│   address: string
│   balance: string (in ETH)
│   chainId: number (31337 for Hardhat)
│ }
├─ isLoading: boolean
├─ error: string | null
├─ connect(): Promise<void>
└─ disconnect(): Promise<void>

Component Local State
├─ selectedRecipe: Recipe | null
├─ isProcessing: boolean
├─ txMessage: string
└─ txHash: string

Component Effects
├─ useEffect → subscribe to wallet changes
└─ useEffect → refetch balance on change
```

---

## Error Handling Paths

```
Try to buy recipe
    ├─ Wallet not connected?
    │  └─ Show: "Please connect your wallet first"
    │
    ├─ No MetaMask?
    │  └─ Show: "MetaMask not detected"
    │
    ├─ Wrong network?
    │  └─ Show: Network mismatch error
    │
    ├─ User denies MetaMask?
    │  └─ Show: "Transaction cancelled"
    │
    ├─ Insufficient balance?
    │  └─ Show: "Insufficient ETH balance"
    │
    ├─ Transaction fails?
    │  └─ Show: "Transaction failed: [reason]"
    │
    └─ Success!
       └─ Show: "✅ Purchase successful!"
          + Display TX hash
```

---

## Transaction Processing Timeline

```
Timeline (milliseconds from Click)
├─ 0ms:     User clicks "Confirm Purchase"
├─ 10ms:    handleConfirmPurchase() starts
├─ 20ms:    setIsProcessing(true)
├─ 30ms:    sendETH() called
├─ 50ms:    MetaMask popup appears
├─ 1000ms:  (User reviews & clicks Approve)
├─ 1500ms:  MetaMask signs transaction
├─ 2000ms:  Transaction sent to Hardhat
├─ 2500ms:  Hardhat processes transaction
├─ 2600ms:  Receipt returned
├─ 2650ms:  setTxHash(hash) updates
├─ 2700ms:  setMessage("✅ Success!") 
├─ 2750ms:  Dialog shows feedback
├─ 5750ms:  setTimeout triggers
├─ 5800ms:  Dialog closes
└─ 6000ms:  State fully reset
```

---

## Files Modified Visual

```
components/
├── 📝 sample-recipes-grid.tsx
│   └─ +45 lines: Added useWallet, sendETH, Dialog, Purchase flow
│
├── 📝 marketplace-browser.tsx
│   └─ +38 lines: Added useWallet, sendETH, TX feedback
│
├── 📝 wallet-button.tsx
│   ├─ +15 lines: Added funding handler & button
│   ├─ -95 lines: Removed duplicate function
│   └─ = 80 net lines added
│
└── 📝 image-upload.tsx
    └─ Fixed: ArrayBuffer → Blob conversion

lib/
├── 📝 web3.ts
│   └─ +50 lines: Added sendETH, buyRecipe, requestTestFunds
│
app/
└── api/
    └── faucet/
        └── 🆕 route.ts
            └─ +30 lines: New faucet API endpoint
```

---

**Architecture Status: ✅ COMPLETE**

All components properly integrated with MetaMask, web3 utilities, and blockchain layer!

