import { ethers } from "ethers"
import { getSigner, executeWithRetry, waitForTransaction, getChainId } from "./provider"

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
      throw new Error("MetaMask not detected. Please install MetaMask extension.")
    }

    // Get signer with retry logic
    const signer = await executeWithRetry(async () => await getSigner(), 2, 500)

    // Create contract instance
    const contract = new ethers.Contract(RECIPE_NFT_CONTRACT, RECIPE_NFT_ABI, signer)

    console.log("[Contract] Minting recipe NFT:", { ipfsHash, name: recipeData.name })

    // Call mint function with retry logic
    const tx = await executeWithRetry(
      async () =>
        await contract.mintRecipe(
          ipfsHash,
          recipeData.name,
          recipeData.description,
          recipeData.cuisine,
          recipeData.prepTime,
          recipeData.cookTime,
          recipeData.difficulty,
          recipeData.servings,
          recipeData.royalty,
          {
            gasLimit: 500000, // Set reasonable gas limit
          }
        ),
      3, // Max 3 retries
      2000 // 2 second delay
    )

    console.log("[Contract] Transaction sent:", tx.hash)

    // Wait for transaction confirmation with proper error handling
    const receipt = await waitForTransaction(tx.hash, 1)

    if (!receipt) {
      throw new Error("Transaction receipt not received")
    }

    console.log("[Contract] Minted recipe NFT successfully:", {
      txHash: receipt.hash,
      ipfsHash,
      blockNumber: receipt.blockNumber,
    })

    return {
      transactionHash: receipt.hash,
      ipfsHash,
    }
  } catch (error) {
    console.error("[Contract] Mint failed:", error)
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes("user rejected")) {
        throw new Error("Transaction cancelled by user")
      }
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient ETH for transaction. Please add funds to your wallet.")
      }
      if (error.message.includes("nonce")) {
        throw new Error("Transaction nonce issue. Please reset your MetaMask account or try again.")
      }
      throw new Error(`Failed to mint NFT: ${error.message}`)
    }
    throw new Error("Failed to mint NFT: Unknown error")
  }
}

export async function getRecipeNFTBalance(address: string): Promise<number> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const chainId = await getChainId()
    const { getProvider } = await import("./provider")
    const provider = await getProvider(chainId)
    const contract = new ethers.Contract(RECIPE_NFT_CONTRACT, RECIPE_NFT_ABI, provider)

    const balance = await executeWithRetry(async () => await contract.balanceOf(address), 2, 1000)
    return Number(balance)
  } catch (error) {
    console.error("[Contract] Failed to get balance:", error)
    return 0
  }
}

export async function listRecipeForSale(tokenId: number, price: string): Promise<string> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const signer = await getSigner()
    const contract = new ethers.Contract(RECIPE_MARKETPLACE_CONTRACT, MARKETPLACE_ABI, signer)

    const priceInWei = ethers.parseEther(price)
    
    const tx = await executeWithRetry(
      async () =>
        await contract.listRecipe(tokenId, priceInWei, {
          gasLimit: 300000,
        }),
      3,
      2000
    )

    const receipt = await waitForTransaction(tx.hash, 1)
    
    if (!receipt) {
      throw new Error("Transaction receipt not received")
    }

    return receipt.hash
  } catch (error) {
    console.error("[Contract] Failed to list recipe:", error)
    throw new Error(`Failed to list recipe: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getRecipeListing(tokenId: number) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected")
    }

    const chainId = await getChainId()
    const { getProvider } = await import("./provider")
    const provider = await getProvider(chainId)
    const contract = new ethers.Contract(RECIPE_MARKETPLACE_CONTRACT, MARKETPLACE_ABI, provider)

    const listing = await executeWithRetry(async () => await contract.getListing(tokenId), 2, 1000)
    
    return {
      seller: listing[0],
      price: ethers.formatEther(listing[1]),
      isActive: listing[2],
      listedAt: Number(listing[3]),
    }
  } catch (error) {
    console.error("[Contract] Failed to get listing:", error)
    return null
  }
}
