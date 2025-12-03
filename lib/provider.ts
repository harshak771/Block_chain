import { ethers } from "ethers"

// RPC Configuration with fallbacks
const RPC_CONFIG = {
  // Sepolia Testnet (Chain ID: 11155111)
  sepolia: [
    "https://eth-sepolia.g.alchemy.com/v2/demo", // Alchemy demo
    "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Infura public
    "https://rpc.sepolia.org", // Public RPC
    "https://rpc2.sepolia.org", // Backup public RPC
    "https://ethereum-sepolia.blockpi.network/v1/rpc/public", // BlockPI
  ],
  // Mainnet (Chain ID: 1) - if needed
  mainnet: [
    "https://eth-mainnet.g.alchemy.com/v2/demo",
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    "https://cloudflare-eth.com",
  ],
  // Local Hardhat (Chain ID: 31337)
  local: ["http://127.0.0.1:8545"],
}

/**
 * Get provider with automatic fallback on error
 */
export async function getProvider(chainId?: number): Promise<ethers.JsonRpcProvider> {
  // Determine which RPC endpoints to use
  let rpcUrls: string[]
  
  if (chainId === 31337) {
    rpcUrls = RPC_CONFIG.local
  } else if (chainId === 1) {
    rpcUrls = RPC_CONFIG.mainnet
  } else {
    // Default to Sepolia
    rpcUrls = RPC_CONFIG.sepolia
  }

  // Try each RPC endpoint until one works
  for (const rpcUrl of rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      
      // Test the connection with a simple call
      await provider.getBlockNumber()
      
      console.log("[Provider] Connected to RPC:", rpcUrl)
      return provider
    } catch (error) {
      console.warn(`[Provider] Failed to connect to ${rpcUrl}:`, error)
      continue
    }
  }

  throw new Error("All RPC endpoints failed. Please check your network connection.")
}

/**
 * Get provider from MetaMask with fallback to public RPC
 */
export async function getBrowserProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask extension.")
  }

  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * Get signer with retry logic
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = await getBrowserProvider()
  
  try {
    const signer = await provider.getSigner()
    return signer
  } catch (error) {
    throw new Error(`Failed to get signer: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Execute contract call with retry logic
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")
      console.warn(`[Retry ${attempt}/${maxRetries}] Failed:`, lastError.message)

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError || new Error("Operation failed after retries")
}

/**
 * Get current chain ID from MetaMask
 */
export async function getChainId(): Promise<number> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  const provider = await getBrowserProvider()
  const network = await provider.getNetwork()
  return Number(network.chainId)
}

/**
 * Wait for transaction with better error handling
 */
export async function waitForTransaction(
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  try {
    const chainId = await getChainId()
    const provider = await getProvider(chainId)

    const receipt = await provider.waitForTransaction(txHash, confirmations, 60000) // 60s timeout
    return receipt
  } catch (error) {
    console.error("[Provider] Transaction wait failed:", error)
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
