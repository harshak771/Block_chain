"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { switchToSepolia, isLocalEnvironment, switchToHardhat } from "@/lib/web3"

export function NetworkAlert() {
  const [chainId, setChainId] = useState<number | null>(null)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
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

        // Check if on wrong network
        const isLocal = isLocalEnvironment()
        if (isLocal) {
          // Local: should be on Hardhat (31337)
          setIsWrongNetwork(currentChainId !== 31337)
        } else {
          // Deployed: should be on Sepolia (11155111) or any mainnet (1)
          // Hardhat (31337) won't work on deployed site
          setIsWrongNetwork(currentChainId === 31337)
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

  const handleSwitchNetwork = async () => {
    setSwitching(true)
    setError("")
    try {
      const isLocal = isLocalEnvironment()
      if (isLocal) {
        await switchToHardhat()
      } else {
        await switchToSepolia()
      }
      // Page will reload on chain change
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch network")
      setSwitching(false)
    }
  }

  // Don't show if no ethereum or network is correct
  if (!isWrongNetwork || chainId === null) {
    return null
  }

  const isLocal = isLocalEnvironment()
  const targetNetwork = isLocal ? "Hardhat Local" : "Sepolia Testnet"
  const currentNetwork = chainId === 31337 ? "Hardhat Local" : 
                         chainId === 11155111 ? "Sepolia" :
                         chainId === 1 ? "Ethereum Mainnet" : `Chain ${chainId}`

  return (
    <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50 dark:bg-red-950">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Wrong Network Detected</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          You are connected to <strong>{currentNetwork}</strong>, but this app 
          {isLocal ? " requires " : " works best on "}
          <strong>{targetNetwork}</strong>.
          {!isLocal && chainId === 31337 && (
            <span className="block mt-1 text-sm">
              Hardhat Local only works when running the app locally with a Hardhat node.
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            onClick={handleSwitchNetwork} 
            disabled={switching}
            size="sm"
            variant="outline"
            className="bg-white dark:bg-gray-800"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${switching ? 'animate-spin' : ''}`} />
            {switching ? "Switching..." : `Switch to ${targetNetwork}`}
          </Button>
          {!isLocal && (
            <a 
              href="https://sepoliafaucet.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Get free Sepolia ETH →
            </a>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </AlertDescription>
    </Alert>
  )
}
