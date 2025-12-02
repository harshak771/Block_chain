# RecipeNFT - Decentralized Recipe Marketplace dApp

A cutting-edge Web3 application that transforms culinary creations into NFTs, enabling creators to mint, trade, collaborate, and monetize their recipes on the blockchain.

## 🎯 Project Overview

RecipeNFT addresses the complete lifecycle of digital recipe ownership:

1. **Create** - Mint recipes as unique NFTs with full metadata
2. **Store** - Secure recipes on IPFS for decentralized storage
3. **Trade** - List and sell recipes on our marketplace
4. **Collaborate** - Work with other creators on recipes
5. **Earn** - Automatic royalty distribution to all contributors

## ✨ Key Features

### 🔗 Wallet Connection
- **MetaMask Integration** with enhanced UI
- Real-time balance & network display
- One-click connect/disconnect
- Multi-network support (Ethereum, Polygon, Arbitrum, Avalanche)

### 🎨 NFT Creation
- User-friendly recipe minting form
- Support for title, ingredients, instructions, images
- IPFS storage with Pinata integration
- ERC721 metadata standards compliance

### 💾 IPFS Storage
- Decentralized recipe storage on IPFS
- Image and metadata uploads
- Gateway URL generation
- Pinata API integration (with mock fallback for development)

### 🛒 Marketplace
- List recipes with custom pricing
- Advanced search and filtering
- Price range categories (Budget/Mid/Premium)
- Purchase order tracking
- Royalty calculations

### 👥 Collaboration Features
- Create collaborative recipes
- Invite collaborators with share percentages
- Automatic revenue distribution
- Role management (Creator/Contributor)
- Transparent share tracking

### 📜 Attribution & Version Control
- Track all recipe modifications
- Complete contributor history
- Version-based recipe iterations
- Contribution details with timestamps
- Visual attribution display

### 💰 Royalty Tracking
- Real-time revenue distribution
- Contributor earnings dashboard
- Payout history analytics
- Revenue share pie charts
- Per-collaborator earnings tracking

### 📊 User Dashboard
- Portfolio view of all recipes
- Sales analytics and history
- Total earnings tracking
- User statistics
- Recipe management

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 with React 19
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Radix UI for accessible components

**Web3:**
- MetaMask wallet integration
- Ethereum JSON-RPC
- ERC721 NFT standards
- ERC2981 Royalty standards

**Storage:**
- IPFS (via Pinata)
- LocalStorage for client-side data
- Mock IPFS for development

**UI/UX:**
- Shadcn UI components
- Lucide React icons
- Recharts for analytics
- React Hook Form for forms

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone the repository**
```bash
cd c:\Users\konda\Downloads\btp
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Environment Variables (Optional)

Create a `.env.local` file for production IPFS uploads:

```env
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
```

Without these variables, the app will use mock IPFS hashes for development.

## 📋 How to Use

### 1. Connect Your Wallet
```
Click "Connect Wallet" → Approve in MetaMask
```

### 2. Mint a Recipe NFT
```
1. Navigate to "Mint Recipe" tab
2. Fill in recipe details (title, ingredients, instructions)
3. Upload recipe image (optional)
4. Approve transaction in MetaMask
5. Your recipe NFT is created!
```

### 3. List Recipe on Marketplace
```
1. Go to Marketplace tab
2. Click on your recipe
3. Set price in ETH
4. List for sale
5. Other users can now purchase
```

### 4. Collaborate on Recipe
```
1. Go to Collaborations page
2. Create new collaborative recipe
3. Invite other wallet addresses
4. Set share percentages (auto-normalized)
5. Invitees accept/decline
6. On acceptance, they become collaborators
```

### 5. Request Recipe Modification
```
1. Open recipe details
2. Click "Request Modification"
3. Describe proposed changes
4. Collaborators vote
5. On approval, version is recorded
```

### 6. Track Earnings
```
1. Go to Dashboard
2. View sales history
3. Check Revenue Tracker for breakdowns
4. See individual collaborator earnings
```

## 📁 Project Structure

```
btp/
├── app/
│   ├── page.tsx (Homepage)
│   ├── dashboard/page.tsx (User dashboard)
│   ├── collaborate/page.tsx (Collaboration)
│   ├── storage/page.tsx (IPFS storage)
│   ├── layout.tsx (Root layout)
│   └── actions/
│       └── ipfs.ts (Server-side IPFS)
├── components/
│   ├── wallet-button.tsx (Enhanced wallet UI)
│   ├── recipe-mint-form.tsx (NFT minting)
│   ├── marketplace-browser.tsx (Marketplace)
│   ├── recipe-details-view.tsx (Recipe viewer)
│   ├── recipe-card.tsx (Recipe card with attribution)
│   ├── royalty-tracker.tsx (Revenue analytics)
│   ├── recipe-modification-manager.tsx (Voting)
│   ├── collaboration-invites.tsx (Collaboration UI)
│   └── ui/ (40+ Radix UI components)
├── lib/
│   ├── web3.ts (MetaMask integration)
│   ├── contract.ts (NFT minting)
│   ├── ipfs.ts (IPFS uploads)
│   ├── marketplace.ts (Marketplace logic)
│   ├── collaboration.ts (Collaboration + versioning)
│   ├── user-dashboard.ts (Dashboard data)
│   ├── nft-metadata.ts (Metadata standards)
│   └── utils.ts (Utilities)
├── hooks/
│   ├── useWallet.ts (Wallet management)
│   ├── useMarketplace.ts (Marketplace hook)
│   ├── useCollaboration.ts (Collaboration hook)
│   ├── useDashboard.ts (Dashboard hook)
│   └── useIPFSStorage.ts (IPFS hook)
└── public/

```

## 🔄 Data Models

### Recipe NFT
```typescript
{
  id: string
  title: string
  creator: string
  collaborators: Collaborator[]
  metadata: {
    ingredients: string[]
    instructions: string
    difficulty: "easy" | "medium" | "hard"
    cookTime: number
    servings: number
  }
  versions: RecipeVersion[] // Track modifications
  attribution: {
    originalCreator: string
    contributors: Contributor[]
  }
}
```

### Marketplace Listing
```typescript
{
  id: string
  tokenId: string
  seller: string
  price: string (in ETH)
  recipe: RecipeInfo
  royaltyInfo: RoyaltyDetails
  active: boolean
}
```

### Collaboration Invite
```typescript
{
  id: string
  recipeId: string
  invitedBy: string
  invitedAddress: string
  sharePercentage: number
  status: "pending" | "accepted" | "declined"
  expiresAt: number (30 days from creation)
}
```

## 🎨 Supported Features

### ✅ All Required Features
- [x] NFT Creation with recipe metadata
- [x] IPFS Storage (decentralized)
- [x] Marketplace Integration (buy/sell/trade)
- [x] Recipe Collaboration (multi-creator)
- [x] Attribution & Version Control
- [x] Wallet Connection (MetaMask)

### ✅ Additional Features
- [x] Royalty Distribution System
- [x] Modification Voting
- [x] Revenue Tracking & Analytics
- [x] User Portfolio & Dashboard
- [x] Recipe Difficulty Levels
- [x] Price-based Marketplace Filtering
- [x] Creative Commons Licensing
- [x] ERC721 Metadata Standards

## 🔐 Security Considerations

- **IPFS Content Hashing** ensures data integrity
- **ERC721 Immutability** prevents unauthorized changes
- **Share Normalization** prevents rounding errors
- **Invite Expiration** (30 days) prevents stale invites
- **Role-based Access** (Creator/Contributor)
- **Transparent Audit Trail** via version history

## 💡 Smart Contract Integration (Production)

To connect to real smart contracts:

1. Deploy Recipe NFT ERC721 contract
2. Deploy Marketplace contract with royalty support
3. Update contract addresses in `lib/contract.ts`
4. Implement actual Web3 calls in place of mock functions
5. Configure real IPFS API keys in `.env.local`

## 📊 API Endpoints Used

- `eth_requestAccounts` - Request wallet connection
- `eth_getBalance` - Get wallet balance
- `eth_chainId` - Get network chain ID
- `eth_accounts` - Get connected accounts
- Pinata API - IPFS uploads

## 🐛 Troubleshooting

### MetaMask Not Detected
- Ensure MetaMask extension is installed
- Refresh the page
- Check browser console for errors

### IPFS Upload Fails
- Verify Pinata API keys in environment
- App will fall back to mock hashes if keys missing
- Check network connectivity

### Transaction Fails
- Ensure wallet has sufficient ETH for gas
- Check MetaMask is connected to correct network
- Verify recipe data is complete

## 📝 Environment Setup

```bash
# Clone repo
git clone <repo>
cd btp

# Install dependencies (use legacy-peer-deps due to React 19)
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎓 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Ethereum Development](https://ethereum.org/developers)
- [IPFS Documentation](https://docs.ipfs.io)
- [ERC721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC2981 Royalties](https://eips.ethereum.org/EIPS/eip-2981)

## 📞 Support

For issues or questions:
1. Check `FEATURES.md` for detailed feature documentation
2. Review component prop interfaces in TypeScript
3. Check browser console for error messages
4. Verify MetaMask is properly configured

## 📄 License

Creative Commons Attribution-ShareAlike (CC-BY-SA)
- Allows commercial use
- Allows derivative works  
- Requires attribution
- Share-alike requirement

## 🎉 Summary

RecipeNFT is a **production-ready dApp scaffold** that implements all required features plus additional functionality for a complete decentralized recipe marketplace experience. All components are fully typed, optimized for UX, and ready for smart contract integration.

**Current Status:** Development mode with mock IPFS
**Ready for:** Smart contract deployment and production IPFS integration

Start minting your culinary creations into NFTs today! 🍳🎨
