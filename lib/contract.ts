import { ethers } from "ethers";

export interface MintResult {
  transactionHash: string
  tokenId?: string
  ipfsHash: string
}

// Contract addresses - these will be updated after deployment
const RECIPE_NFT_CONTRACT = process.env.NEXT_PUBLIC_RECIPE_NFT_ADDRESS || "0x0000000000000000000000000000000000000000"
const RECIPE_MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000"

// Recipe NFT ABI
const RECIPE_NFT_ABI = [
  "function mintRecipe(string memory ipfsHash, string memory name, string memory description, string memory cuisine, uint256 prepTime, uint256 cookTime, uint8 difficulty, uint256 servings, uint16 royaltyPercentage) public returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function recipeIPFSHashes(uint256 tokenId) public view returns (string memory)",
  "function recipeMetadata(uint256 tokenId) public view returns (tuple(string name, string description, string cuisine, uint256 prepTime, uint256 cookTime, uint8 difficulty, uint256 servings, bool isPublic, uint256 createdAt))",
]

// Marketplace ABI
const MARKETPLACE_ABI = [
  "function listRecipe(uint256 tokenId, uint256 price) public",
  "function unlistRecipe(uint256 tokenId) public",
  "function buyRecipe(uint256 tokenId) public payable",
  "function getListing(uint256 tokenId) public view returns (tuple(address seller, uint256 price, bool isActive, uint256 listedAt))",
]

export async function mintRecipeNFT(ipfsHash: string, recipeData: {
  name: string
  description: string
  cuisine: string
  prepTime: number
  cookTime: number
  difficulty: number
  servings: number
  royalty: number
}): Promise<MintResult> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    // Get provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Create contract instance
    const contract = new ethers.Contract(RECIPE_NFT_CONTRACT, RECIPE_NFT_ABI, signer)

    // Call mint function
    const tx = await contract.mintRecipe(
      ipfsHash,
      recipeData.name,
      recipeData.description,
      recipeData.cuisine,
      recipeData.prepTime,
      recipeData.cookTime,
      recipeData.difficulty,
      recipeData.servings,
      recipeData.royalty
    )

    // Wait for transaction confirmation
    const receipt = await tx.wait()

    console.log("[Contract] Minted recipe NFT:", { 
      txHash: receipt?.hash, 
      ipfsHash, 
      blockNumber: receipt?.blockNumber 
    })

    return {
      transactionHash: receipt?.hash || tx.hash,
      ipfsHash,
    }
  } catch (error) {
    throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getRecipeNFTBalance(address: string): Promise<number> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(RECIPE_NFT_CONTRACT, RECIPE_NFT_ABI, provider)

    const balance = await contract.balanceOf(address)
    return Number(balance)
  } catch (error) {
    console.error("Failed to get balance:", error)
    return 0
  }
}

export async function listRecipeForSale(tokenId: number, price: string): Promise<string> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(RECIPE_MARKETPLACE_CONTRACT, MARKETPLACE_ABI, signer)

    const priceInWei = ethers.parseEther(price)
    const tx = await contract.listRecipe(tokenId, priceInWei)
    const receipt = await tx.wait()

    return receipt?.hash || tx.hash
  } catch (error) {
    throw new Error(`Failed to list recipe: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getRecipeListing(tokenId: number) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(RECIPE_MARKETPLACE_CONTRACT, MARKETPLACE_ABI, provider)

    const listing = await contract.getListing(tokenId)
    return {
      seller: listing[0],
      price: ethers.formatEther(listing[1]),
      isActive: listing[2],
      listedAt: Number(listing[3]),
    }
  } catch (error) {
    console.error("Failed to get listing:", error)
    return null
  }
}
