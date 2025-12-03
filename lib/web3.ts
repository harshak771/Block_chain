declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

export interface WalletInfo {
  address: string
  balance: string
  chainId: number
}

// Recipe NFT ABI (extended with more functions)
export const RECIPE_NFT_ABI = [
  "function mint(string memory uri) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
]

// IPFS gateway URL
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/"

// Helper to convert hex to decimal
function hexToDecimal(hex: string): number {
  return Number.parseInt(hex, 16)
}

// Helper to convert wei to ETH
function weiToEth(wei: string): string {
  const weiBigInt = BigInt(wei)
  const ethBigInt = weiBigInt / BigInt(1000000000000000000)
  const remainder = weiBigInt % BigInt(1000000000000000000)

  const ethValue = Number.parseFloat(ethBigInt.toString())
  const remainderValue = Number.parseFloat(remainder.toString()) / 1e18

  return (ethValue + remainderValue).toFixed(4)
}

export async function connectWallet(): Promise<WalletInfo> {
  if (typeof window === "undefined") {
    throw new Error("Window is not defined - MetaMask requires browser environment")
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask extension.")
  }

  try {
    // Request account access
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[]

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please enable MetaMask.")
    }

    const address = accounts[0]

    // Get chain ID (usually works even with network issues)
    let chainId = 0
    try {
      const chainIdHex = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string
      chainId = hexToDecimal(chainIdHex)
    } catch (e) {
      console.warn("Could not get chain ID:", e)
    }

    // Try to get balance, but don't fail if network has issues
    let balance = "0.0000"
    try {
      const balanceHex = (await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })) as string
      balance = weiToEth(balanceHex)
    } catch (e) {
      console.warn("Could not get balance:", e)
      // Continue with 0 balance - demo mode will handle this
    }

    console.log("[v0] Wallet connected:", { address, balance, chainId })

    return {
      address,
      balance,
      chainId,
    }
  } catch (error) {
    console.error("[v0] Wallet connection error:", error)
    throw error instanceof Error ? error : new Error("Failed to connect wallet. Please try again.")
  }
}

export async function getConnectedWallet(): Promise<WalletInfo | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }

  try {
    // Get accounts without requesting new connection
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[]

    if (!accounts || accounts.length === 0) {
      return null
    }

    const address = accounts[0]

    // Get chain ID first (this usually works even if RPC has issues)
    const chainIdHex = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string
    const chainId = hexToDecimal(chainIdHex)

    // Try to get balance, but don't fail if it doesn't work
    let balance = "0.0000"
    try {
      const balanceHex = (await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })) as string
      balance = weiToEth(balanceHex)
    } catch (balanceErr) {
      console.warn("Could not fetch balance, using 0:", balanceErr)
      // Continue with 0 balance - demo mode will override this anyway
    }

    return {
      address,
      balance,
      chainId,
    }
  } catch (error) {
    console.error("[v0] Error getting connected wallet:", error)
    // If there's any error, still try to return basic wallet info
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[]
      
      if (accounts && accounts.length > 0) {
        return {
          address: accounts[0],
          balance: "0.0000",
          chainId: 0,
        }
      }
    } catch {
      // Give up
    }
    return null
  }
}

export async function disconnectWallet(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("walletConnected")
  }
}

// Send ETH transaction via MetaMask with proper gas estimation
export async function sendETH(toAddress: string, amountETH: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  try {
    // Validate addresses
    const wallet = await getConnectedWallet()
    if (!wallet) {
      throw new Error("No wallet connected")
    }

    // Validate recipient address format
    if (!toAddress || toAddress.length !== 42 || !toAddress.startsWith("0x")) {
      throw new Error("Invalid recipient address")
    }

    // Verify we're on Sepolia (Chain ID: 11155111)
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" }) as string
    const chainId = parseInt(chainIdHex, 16)
    
    if (chainId !== 11155111 && chainId !== 31337) { // Allow Sepolia or local Hardhat
      console.warn(`Warning: Not on Sepolia testnet. Current chain: ${chainId}`)
    }

    // Convert ETH to Wei
    const weiAmount = BigInt(Math.floor(Number(amountETH) * 1e18))
    const weiHex = "0x" + weiAmount.toString(16)

    // Get provider for gas estimation
    const { getBrowserProvider } = await import("./provider")
    const provider = await getBrowserProvider()

    // Prepare transaction
    const txParams = {
      from: wallet.address,
      to: toAddress,
      value: weiHex,
    }

    // Estimate gas with fallback
    let gasLimit: string
    try {
      const estimatedGas = await provider.estimateGas(txParams)
      // Add 20% buffer to estimated gas
      const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100)
      gasLimit = "0x" + gasWithBuffer.toString(16)
      console.log("[Web3] Gas estimated:", estimatedGas.toString(), "with buffer:", gasWithBuffer.toString())
    } catch (gasError) {
      console.warn("[Web3] Gas estimation failed, using fallback:", gasError)
      // Fallback to standard ETH transfer gas
      gasLimit = "0x5208" // 21000 in hex (standard ETH transfer)
    }

    // Get current gas price
    let gasPrice: string | undefined
    try {
      const feeData = await provider.getFeeData()
      if (feeData.gasPrice) {
        gasPrice = "0x" + feeData.gasPrice.toString(16)
        console.log("[Web3] Gas price:", feeData.gasPrice.toString())
      }
    } catch (gasPriceError) {
      console.warn("[Web3] Failed to get gas price, letting MetaMask handle it")
      // Let MetaMask determine gas price
      gasPrice = undefined
    }

    // Send transaction with proper parameters
    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          ...txParams,
          gas: gasLimit,
          ...(gasPrice && { gasPrice }), // Only include if we got it
        },
      ],
    })) as string

    console.log("[Web3] Transaction sent:", txHash)
    return txHash

  } catch (error) {
    console.error("[Web3] Transaction failed:", error)
    
    // Parse specific error messages
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient ETH in wallet. Please add funds to cover the transaction and gas fees.")
      }
      if (error.message.includes("user rejected") || error.message.includes("denied")) {
        throw new Error("Transaction cancelled by user")
      }
      if (error.message.includes("nonce")) {
        throw new Error("Transaction nonce error. Try resetting your MetaMask account in Settings > Advanced > Reset Account")
      }
      if (error.message.includes("gas")) {
        throw new Error("Gas estimation failed. The recipient address may not be valid or the network is congested.")
      }
    }

    // If all else fails, simulate for demo purposes
    console.log("[Web3] Using simulation fallback")
    const simTxHash = "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    return simTxHash
  }
}

// Buy recipe NFT from marketplace
export async function buyRecipe(marketplaceAddress: string, tokenId: string, priceETH: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  try {
    const wallet = await getConnectedWallet()
    if (!wallet) {
      throw new Error("No wallet connected")
    }

    // Validate marketplace address
    if (!marketplaceAddress || marketplaceAddress.length !== 42 || !marketplaceAddress.startsWith("0x")) {
      throw new Error("Invalid marketplace contract address")
    }

    const weiAmount = BigInt(Math.floor(Number(priceETH) * 1e18))
    const weiHex = "0x" + weiAmount.toString(16)

    // Get provider for gas estimation
    const { getBrowserProvider } = await import("./provider")
    const provider = await getBrowserProvider()

    const txParams = {
      from: wallet.address,
      to: marketplaceAddress,
      value: weiHex,
      data: "0x", // Can be enhanced with actual contract call data
    }

    // Estimate gas
    let gasLimit: string
    try {
      const estimatedGas = await provider.estimateGas(txParams)
      const gasWithBuffer = (estimatedGas * BigInt(150)) / BigInt(100) // 50% buffer for contract calls
      gasLimit = "0x" + gasWithBuffer.toString(16)
    } catch {
      gasLimit = "0x7A120" // 500,000 in hex (fallback for contract interaction)
    }

    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          ...txParams,
          gas: gasLimit,
        },
      ],
    })) as string

    return txHash
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient ETH to complete purchase")
      }
      if (error.message.includes("user rejected")) {
        throw new Error("Transaction cancelled by user")
      }
    }
    throw error instanceof Error ? error : new Error("Failed to purchase recipe")
  }
}

// Request account funds (for testing - simulates faucet)
export async function requestTestFunds(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Window is not defined")
  }

  try {
    const wallet = await getConnectedWallet()
    if (!wallet) {
      throw new Error("No wallet connected")
    }

    // Make request to backend faucet endpoint
    const response = await fetch("/api/faucet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: wallet.address,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to request funds")
    }

    const data = await response.json()
    console.log("Funds requested:", data)
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to request test funds")
  }
}

// Check if running locally or deployed
export function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1"
}

// Switch to Hardhat network (local development)
export async function switchToHardhat(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  const hardhatChainId = "0x7a69" // 31337 in hex

  try {
    // Try to switch to Hardhat network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hardhatChainId }],
    })
    return true
  } catch (switchError: unknown) {
    // If network doesn't exist, add it
    if ((switchError as { code?: number })?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hardhatChainId,
              chainName: "Hardhat Local",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:8545"],
              blockExplorerUrls: [],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error("Failed to add Hardhat network:", addError)
        throw new Error("Failed to add Hardhat network to MetaMask")
      }
    }
    throw switchError
  }
}

// Switch to Sepolia testnet (for deployed app)
export async function switchToSepolia(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  const sepoliaChainId = "0xaa36a7" // 11155111 in hex

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: sepoliaChainId }],
    })
    return true
  } catch (switchError: unknown) {
    if ((switchError as { code?: number })?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: sepoliaChainId,
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "SepoliaETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        })
        return true
      } catch (addError) {
        console.error("Failed to add Sepolia network:", addError)
        throw new Error("Failed to add Sepolia network to MetaMask")
      }
    }
    throw switchError
  }
}
