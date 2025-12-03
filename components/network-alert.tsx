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

  // Hide demo mode banner - always return null
  return null
}
