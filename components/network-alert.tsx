"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Gift } from "lucide-react"
import { switchToSepolia, isLocalEnvironment, switchToHardhat } from "@/lib/web3"
import { isDemoMode, getDemoBalance } from "@/lib/demo-wallet"

export function NetworkAlert() {
  const [chainId, setChainId] = useState<number | null>(null)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window === "undefined" || !window.ethereum) return

      try {
        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        }) as string
        const currentChainId = parseInt(chainIdHex, 16)
        setChainId(currentChainId)

        // Show demo info on deployed sites
        if (isDemoMode()) {
          setShowDemoInfo(true)
        }
      } catch (err) {
        console.error("Error checking network:", err)
      }
    }

    checkNetwork()

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }
  }, [])

  // Show demo mode banner on deployed sites
  if (isDemoMode() && showDemoInfo) {
    const demoBalance = getDemoBalance()
    return (
      <Alert className="mb-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <Gift className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800 dark:text-purple-200">🎮 Demo Mode Active</AlertTitle>
        <AlertDescription className="mt-2 text-purple-700 dark:text-purple-300">
          <p className="mb-2">
            You have <strong>{demoBalance.toFixed(2)} Demo ETH</strong> to test the marketplace!
            Connect your wallet and click it to get more free Demo ETH anytime.
          </p>
          <p className="text-sm opacity-80">
            Demo transactions are simulated and don&apos;t require real ETH or gas fees.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // Don't show anything for local development
  return null
}
