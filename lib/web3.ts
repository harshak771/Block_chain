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

    // Get balance using JSON-RPC
    const balanceHex = (await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })) as string

    const balance = weiToEth(balanceHex)

    // Get chain ID
    const chainIdHex = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string

    const chainId = hexToDecimal(chainIdHex)

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

    // Get balance
    const balanceHex = (await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })) as string

    const balance = weiToEth(balanceHex)

    // Get chain ID
    const chainIdHex = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string

    const chainId = hexToDecimal(chainIdHex)

    return {
      address,
      balance,
      chainId,
    }
  } catch (error) {
    console.error("[v0] Error getting connected wallet:", error)
    return null
  }
}

export async function disconnectWallet(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("walletConnected")
  }
}

// Send ETH transaction via MetaMask
export async function sendETH(toAddress: string, amountETH: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  try {
    // Convert ETH to Wei
    const weiAmount = BigInt(Math.floor(Number(amountETH) * 1e18)).toString(16)

    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: (await getConnectedWallet())?.address,
          to: toAddress,
          value: "0x" + weiAmount,
          gas: "0x5208", // 21000 gas for ETH transfer
        },
      ],
    })) as string

    return txHash
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to send transaction")
  }
}

// Buy recipe NFT from marketplace
export async function buyRecipe(marketplaceAddress: string, tokenId: string, priceETH: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected")
  }

  try {
    const weiAmount = BigInt(Math.floor(Number(priceETH) * 1e18)).toString(16)
    const wallet = await getConnectedWallet()

    if (!wallet) {
      throw new Error("No wallet connected")
    }

    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: wallet.address,
          to: marketplaceAddress,
          value: "0x" + weiAmount,
          data: "0x", // Placeholder for contract interaction
        },
      ],
    })) as string

    return txHash
  } catch (error) {
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

// Switch to Hardhat network
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
