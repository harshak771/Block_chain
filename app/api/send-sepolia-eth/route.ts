import { NextResponse } from "next/server"
import { ethers } from "ethers"

// RPC endpoints with fallbacks
const SEPOLIA_RPC_URLS = [
  "https://eth-sepolia.g.alchemy.com/v2/demo",
  "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  "https://rpc.sepolia.org",
  "https://rpc2.sepolia.org",
  "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
]

async function getSepoliaProvider(): Promise<ethers.JsonRpcProvider> {
  for (const rpcUrl of SEPOLIA_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      await provider.getBlockNumber() // Test connection
      return provider
    } catch (error) {
      console.warn(`Failed to connect to ${rpcUrl}:`, error)
      continue
    }
  }
  throw new Error("All Sepolia RPC endpoints failed")
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 })
    }

    // Validate address
    if (!ethers.isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Connect to Sepolia with fallback support
    const provider = await getSepoliaProvider()
    
    // For demo purposes, we'll use a funded wallet
    // In production, you'd use environment variables
    const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    
    const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

    // Send 1 Sepolia ETH
    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.parseEther("1.0"), // 1 ETH
      gasLimit: 21000,
    })

    // Wait with timeout
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction timeout")), 60000)
      ),
    ]) as ethers.TransactionReceipt

    return NextResponse.json({
      success: true,
      hash: receipt.hash,
      amount: "1.0 ETH",
      message: "Sent 1 Sepolia ETH to your wallet!",
    })
  } catch (error) {
    console.error("Faucet error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send ETH",
        note: "This requires a funded faucet wallet on Sepolia. Use a public faucet instead: https://sepoliafaucet.com",
      },
      { status: 500 }
    )
  }
}
