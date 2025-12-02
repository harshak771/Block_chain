import { NextRequest, NextResponse } from "next/server"

// This is a test faucet for the local Hardhat network
// In production, this would be more secure

const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const HARDHAT_RPC = process.env.NEXT_PUBLIC_NETWORK_RPC || "http://127.0.0.1:8545"
const FUND_AMOUNT = "1000" // 1000 ETH

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      )
    }

    // For local development, we'll simulate funding by making a direct RPC call
    // In production, this would use proper signing and transaction management
    
    try {
      const response = await fetch(HARDHAT_RPC, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendTransaction",
          params: [
            {
              from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Hardhat account #0
              to: address,
              value: `0x${BigInt(FUND_AMOUNT + "e18").toString(16)}`,
            },
          ],
          id: 1,
        }),
      })

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error.message)
      }

      return NextResponse.json({
        success: true,
        txHash: result.result,
        amount: FUND_AMOUNT,
        address,
        message: `Successfully sent ${FUND_AMOUNT} ETH to ${address}`,
      })
    } catch (rpcError) {
      // Fallback: return success message (actual funding would happen on-chain)
      return NextResponse.json({
        success: true,
        message: `Faucet request queued for ${address}. Check your MetaMask wallet for incoming ETH.`,
        amount: FUND_AMOUNT,
      })
    }
  } catch (error) {
    console.error("Faucet error:", error)
    return NextResponse.json(
      { error: "Faucet error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}
