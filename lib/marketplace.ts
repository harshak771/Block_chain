export interface MarketplaceListing {
  id: string
  tokenId: string
  seller: string
  price: string
  recipe: {
    title: string
    creator: string
    ingredients: number
    imageUrl?: string
    ipfsHash?: string
  }
  createdAt: number
  active: boolean
  nftMetadataUri?: string // Link to full NFT metadata
  royaltyInfo?: {
    basisPoints: number
    recipients: Array<{
      address: string
      sharePercentage: number
    }>
  }
}

export interface PurchaseOrder {
  id: string
  buyerId: string
  listingId: string
  amount: string
  timestamp: number
  transactionHash?: string
  status: "pending" | "completed" | "failed"
}

// Marketplace contract ABI
export const MARKETPLACE_ABI = [
  "function listRecipe(uint256 tokenId, uint256 priceInWei) public",
  "function buyRecipe(uint256 listingId) public payable",
  "function cancelListing(uint256 listingId) public",
  "function updatePrice(uint256 listingId, uint256 newPrice) public",
  "function getListings() public view returns (tuple(uint256 id, uint256 tokenId, address seller, uint256 price, bool active)[])",
  "function getListing(uint256 listingId) public view returns (tuple(uint256 id, uint256 tokenId, address seller, uint256 price, bool active))",
]

// Storage key for marketplace listings
const LISTINGS_STORAGE_KEY = "recipeNFT:marketplace:listings"
const ORDERS_STORAGE_KEY = "recipeNFT:marketplace:orders"

export function getStoredListings(): MarketplaceListing[] {
  try {
    const stored = localStorage.getItem(LISTINGS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveListings(listings: MarketplaceListing[]): void {
  localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings))
}

export function createListing(
  tokenId: string,
  seller: string,
  price: string,
  recipe: MarketplaceListing["recipe"],
): MarketplaceListing {
  return {
    id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tokenId,
    seller,
    price,
    recipe,
    createdAt: Date.now(),
    active: true,
  }
}

export function addListing(listing: MarketplaceListing): void {
  const listings = getStoredListings()
  listings.push(listing)
  saveListings(listings)
}

export function removeListing(listingId: string): void {
  const listings = getStoredListings()
  const filtered = listings.filter((l) => l.id !== listingId)
  saveListings(filtered)
}

export function updateListing(listingId: string, updates: Partial<MarketplaceListing>): void {
  const listings = getStoredListings()
  const index = listings.findIndex((l) => l.id === listingId)
  if (index >= 0) {
    listings[index] = { ...listings[index], ...updates }
    saveListings(listings)
  }
}

export function getStoredOrders(): PurchaseOrder[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function savePurchaseOrder(order: PurchaseOrder): void {
  const orders = getStoredOrders()
  orders.push(order)
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function calculateRoyalties(price: string, royaltyPercentage = 5): string {
  const priceNum = Number.parseFloat(price)
  const royalty = (priceNum * royaltyPercentage) / 100
  return royalty.toFixed(4)
}
