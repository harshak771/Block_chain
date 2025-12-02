# RecipeNFT Marketplace

A decentralized marketplace for recipe NFTs built with Next.js, Solidity, and MetaMask integration.

## Features

- 🍳 **Recipe NFTs** - Mint and trade unique recipe tokens
- 💰 **Marketplace** - Buy and sell recipes with ETH
- 👥 **Collaboration** - Work together on recipes with royalty sharing
- 📊 **Dashboard** - Track your recipes, sales, and revenue
- 🦊 **MetaMask Integration** - Seamless wallet connection and transactions

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Solidity, Hardhat, ethers.js
- **Storage**: IPFS for recipe metadata

## Smart Contracts

Located in `contracts/src/`:
- `RecipeNFT.sol` - ERC721 token for recipes
- `RecipeMarketplace.sol` - Marketplace for buying/selling
- `RecipeCollaboration.sol` - Collaboration management
- `RoyaltyDistribution.sol` - Royalty payments

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Install contract dependencies
cd contracts && npm install && cd ..
```

### Run Local Blockchain

```bash
cd contracts
npx hardhat node
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Connect MetaMask

1. Open MetaMask
2. Add Hardhat Network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH
3. Use the "Mint 100K ETH" button in the wallet dropdown for test funds

## Project Structure

```
├── app/                 # Next.js app router pages
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── contracts/          # Solidity contracts
│   └── src/            # Contract source files
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── public/             # Static assets
```

## License

MIT
