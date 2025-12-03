import { NextResponse } from "next/server"
import { ethers } from "ethers"

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

    // Connect to Sepolia via public RPC
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org")
    
    // For demo purposes, we'll use a funded wallet
    // In production, you'd use environment variables
    const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    
    const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

    // Send 1 Sepolia ETH
    const tx = await wallet.sendTransaction({
      to: address,
      value: ethers.parseEther("1.0"), // 1 ETH
    })

    await tx.wait()

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      amount: "1.0 ETH",
      message: "Sent 1 Sepolia ETH to your wallet!",
    })
  } catch (error) {
    console.error("Faucet error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to send ETH",
        note: "This requires a funded faucet wallet on Sepolia"
      },
      { status: 500 }
    )
  }
}
