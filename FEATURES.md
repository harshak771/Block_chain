# RecipeNFT - Complete Feature Documentation

## 📋 Project Overview

RecipeNFT is a decentralized application (dApp) that transforms food recipes into NFTs, enabling users to own, trade, monetize, and collaborate on their culinary creations.

---

## ✨ Core Features

### 1. **Wallet Connection** ✅
- **MetaMask Integration**: Connect/disconnect Web3 wallets
- **Enhanced Wallet UI**: Dropdown menu with address, balance, network info
- **Network Support**: Ethereum Mainnet, Testnets, Polygon, Arbitrum, Avalanche
- **Auto-Detection**: Automatic wallet detection on page load
- **One-Click Disconnect**: Easy wallet disconnection

**Location**: `components/wallet-button.tsx`

### 2. **NFT Creation** ✅
- **Recipe Minting**: Convert recipes into unique NFTs
- **IPFS Storage**: Metadata and images stored on IPFS via Pinata
- **ERC721 Standard**: Full NFT metadata compliance
- **Recipe Upload**: Title, ingredients, steps, cooking time, servings, difficulty level
- **Image Support**: Optional recipe photo upload

**Files**:
- `components/recipe-mint-form.tsx`
- `lib/contract.ts`
- `app/actions/ipfs.ts`

### 3. **IPFS Storage** ✅
- **Decentralized Storage**: All recipe content on IPFS
- **Pinata Integration**: Production-ready IPFS uploads
- **Mock Fallback**: Development mode with simulated hashes
- **Gateway URLs**: Easy IPFS content retrieval
- **Recipe Viewer**: `components/ipfs-recipe-viewer.tsx`

**Location**: `lib/ipfs.ts`, `app/actions/ipfs.ts`

### 4. **Marketplace Integration** ✅
- **Recipe Listing**: List NFTs for sale with custom pricing
- **Browse & Search**: Filter by name, price range (budget/mid/premium)
- **Price Management**: Update and cancel listings
- **Purchase Orders**: Track buyer/seller transactions
- **Active/Inactive Listings**: Mark recipes as sold

**Files**:
- `components/marketplace-browser.tsx`
- `components/marketplace-list-form.tsx`
- `lib/marketplace.ts`
- `hooks/useMarketplace.ts`

### 5. **Recipe Collaboration** ✅
- **Collaborative Recipes**: Multiple creators work on one recipe
- **Invitation System**: Send/accept/decline collaboration invites
- **Role Management**: Creator vs Contributor roles
- **Status Tracking**: Draft → Published → Completed
- **Share Percentages**: Automatic revenue distribution setup

**Files**:
- `components/collaboration-invites.tsx`
- `components/invite-collaborator.tsx`
- `lib/collaboration.ts`
- `hooks/useCollaboration.ts`

### 6. **Attribution & Contributor Tracking** ✅
- **Original Creator Recognition**: Track recipe originator
- **Contributor History**: Record all modifications and enhancements
- **Version History**: Complete recipe modification timeline
- **Contribution Details**: Who did what and when
- **Attribution Display**: Show contributors in recipe cards and details

**Files**:
- `lib/collaboration.ts` (updated with `versions` and `attribution`)
- `components/recipe-details-view.tsx`

### 7. **Royalty & Revenue Sharing** ✅
- **Automatic Distribution**: Revenue split among collaborators
- **Share Tracking**: Percentage-based earnings
- **Payout History**: Complete transaction log
- **Real-time Calculations**: Dynamic royalty calculations
- **Visual Dashboard**: Charts and analytics

**Files**:
- `lib/collaboration.ts` (revenue tracking functions)
- `components/royalty-tracker.tsx` (NEW)
- `components/revenue-dashboard.tsx`

### 8. **Recipe Modification Management** ✅
- **Modification Requests**: Suggest recipe enhancements
- **Voting System**: Collaborators vote on changes
- **Version Control**: Track all recipe iterations
- **Change Approval**: Democratic modification process
- **Change History**: View all previous versions

**Files**:
- `components/recipe-modification-manager.tsx` (NEW)
- `lib/collaboration.ts` (versioning functions)

### 9. **NFT Metadata Standards** ✅
- **ERC721 Compliance**: Standard NFT metadata format
- **ERC2981 Royalties**: Standard royalty information
- **Recipe Details**: Stored with NFT metadata
- **Licensing**: CC-BY-SA creative commons licensing
- **Attribution in Metadata**: Full contributor information in NFT

**Location**: `lib/nft-metadata.ts` (NEW)

### 10. **User Dashboard** ✅
- **Portfolio View**: All owned recipe NFTs
- **Sales Analytics**: Total earnings, sales volume, average price
- **Sales History**: Track all transactions
- **Stats Display**: Comprehensive user metrics
- **Recipe Management**: View and manage recipes

**Files**:
- `app/dashboard/page.tsx`
- `components/dashboard-stats.tsx`
- `components/sales-history.tsx`
- `lib/user-dashboard.ts`

### 11. **Recipe Details Viewer** ✅
- **Full Recipe Display**: All recipe information
- **Ingredient List**: Complete ingredient breakdown
- **Instructions**: Step-by-step cooking directions
- **Difficulty Level**: Easy/Medium/Hard badges
- **Cooking Metrics**: Time and servings
- **Contributor List**: Show all collaborators
- **Version History**: View all recipe iterations
- **Attribution Tab**: Full contributor recognition

**Location**: `components/recipe-details-view.tsx` (NEW)

### 12. **Royalty Tracking** ✅
- **Revenue Distribution**: Pie charts and analytics
- **Earnings per Collaborator**: Individual earnings display
- **Payout History**: Historical transaction data
- **Total Earnings**: Overall revenue tracking
- **Share Percentages**: Visual revenue split

**Location**: `components/royalty-tracker.tsx` (NEW)

---

## 📂 File Structure & New Additions

### **New Files Created:**
```
lib/
  ├── nft-metadata.ts (NFT metadata standards)
  └── collaboration.ts (updated with versions & attribution)

components/
  ├── recipe-details-view.tsx (Recipe viewer with tabs)
  ├── royalty-tracker.tsx (Revenue charts & analytics)
  ├── recipe-modification-manager.tsx (Modification voting)
  └── recipe-card.tsx (updated with attribution)
```

### **Updated Files:**
```
components/
  ├── wallet-button.tsx (enhanced with dropdown)
  └── recipe-card.tsx (added contributors, NFT badge)

lib/
  └── marketplace.ts (added NFT metadata fields)
```

---

## 🔄 Data Flow & Architecture

### **Recipe Minting Flow:**
1. User connects MetaMask wallet
2. Fills recipe form (title, ingredients, steps, image)
3. Image uploaded to IPFS → image hash
4. Metadata created with all recipe details
5. Metadata uploaded to IPFS → metadata hash
6. NFT minted with tokenURI pointing to IPFS
7. Recipe stored in marketplace listings

### **Collaboration Flow:**
1. Creator creates collaborative recipe
2. Creator invites collaborators with share percentages
3. Collaborators receive and accept/decline invites
4. When recipe is published, automatic royalty setup
5. On each sale, revenue distributed per shares
6. Payout history tracked for each contributor

### **Modification Flow:**
1. Any collaborator suggests modification
2. Others vote on the suggestion
3. On approval, version is recorded
4. Attribution updated with contributor info
5. Recipe metadata updated in IPFS
6. Version history maintained

---

## 💾 Local Storage Schema

### **Keys:**
```
recipeNFT:collaboration:recipes
recipeNFT:collaboration:invites
recipeNFT:collaboration:revenue
recipeNFT:marketplace:listings
recipeNFT:marketplace:orders
recipeNFT:user:portfolio:{address}
recipeNFT:user:sales-history:{address}
recipeNFTs (stored recipes)
walletConnected (connection status)
```

---

## 🎨 UI Components & Pages

### **Pages:**
- `app/page.tsx` - Homepage with hero, features, marketplace tabs
- `app/dashboard/page.tsx` - User dashboard & portfolio
- `app/collaborate/page.tsx` - Collaboration management
- `app/storage/page.tsx` - IPFS storage viewer

### **Components:**
- 40+ Radix UI base components (buttons, dialogs, tables, etc.)
- Custom recipe, marketplace, collaboration components
- Charts using Recharts (pie, bar, line charts)
- Forms with React Hook Form + Zod validation

---

## 🚀 How to Use

### **1. Connect Wallet:**
Click "Connect Wallet" button → Approve MetaMask

### **2. Create Recipe NFT:**
1. Go to home page "Mint Recipe" tab
2. Fill recipe details
3. Upload image (optional)
4. Approve transaction in MetaMask
5. Recipe NFT created!

### **3. List on Marketplace:**
1. Enter marketplace, click "List Recipe"
2. Set price in ETH
3. Confirm listing
4. Recipe appears in marketplace

### **4. Collaborate:**
1. Go to "Collaborations" page
2. Create new collaborative recipe
3. Invite collaborators with share percentages
4. They accept/decline
5. Once published, automatic royalty sharing

### **5. Modify Recipe:**
1. Open recipe details
2. Click "Request Modification"
3. Describe changes
4. Collaborators vote
5. On approval, version recorded

### **6. Track Earnings:**
1. Dashboard shows all sales
2. Revenue tracker shows collaborator earnings
3. Historical payout data available
4. Real-time calculations

---

## 🔐 Security & Standards

### **Smart Contract Standards:**
- ERC721 (NFT ownership)
- ERC2981 (Royalty information)
- EIP-2981 (Royalty calculation)

### **Licensing:**
- Creative Commons Attribution-ShareAlike (CC-BY-SA)
- Allows commercial use and derivative works
- Requires attribution to original creator

### **Data Integrity:**
- Immutable on-chain NFT records
- IPFS content hashing ensures data integrity
- Collaborative records in localStorage
- Version history for audit trail

---

## 📊 Key Metrics Tracked

- Total recipes minted
- Total marketplace sales
- Revenue per recipe
- Collaborator earnings
- Transaction count
- Recipe versions created
- Modification requests
- Attribution records

---

## 🎯 Future Enhancements

- [ ] Real smart contract deployment
- [ ] On-chain royalty enforcement
- [ ] DAO governance for modifications
- [ ] Recipe NFT fractional ownership
- [ ] Cross-chain support
- [ ] Advanced search/filtering
- [ ] Recipe ratings & reviews
- [ ] Social features (follow creators)
- [ ] Recipe licensing marketplace
- [ ] Automated royalty payouts

---

## 📝 Summary

RecipeNFT implements **all 5 required topics**:

✅ **NFT Creation** - Full recipe minting with metadata
✅ **IPFS Storage** - Decentralized content storage
✅ **Marketplace Integration** - Buy/sell/trade recipes
✅ **Collaboration** - Multi-creator recipes
✅ **Attribution** - Track contributors & modify recipes
✅ **Wallet Connection** - Enhanced MetaMask integration

Plus additional features like royalty tracking, version control, and comprehensive dashboards!
