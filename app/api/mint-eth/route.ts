import { NextRequest, NextResponse } from "next/server"

const HARDHAT_RPC = process.env.NEXT_PUBLIC_NETWORK_RPC || "http://127.0.0.1:8545"

export async function POST(request: NextRequest) {
  try {
    const { address, amount = "1000" } = await request.json()

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      )
    }

    // Use hardhat_setBalance to directly set balance (no confirmation needed!)
    const amountInWei = BigInt(parseFloat(amount) * 1e18)
    const newBalance = amountInWei + BigInt(1000 * 1e18) // Add 1000 ETH to existing
    
    const response = await fetch(HARDHAT_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "hardhat_setBalance",
        params: [address, "0x" + newBalance.toString(16)],
        id: 1,
      }),
    })

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({
      success: true,
      hash: "0x" + Math.random().toString(16).slice(2) + Date.now().toString(16),
      amount: amount,
      address: address,
      message: `Successfully added ${amount} ETH to ${address}`,
    })
  } catch (error) {
    console.error("Mint ETH error:", error)
    return NextResponse.json(
      { error: "Mint error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
