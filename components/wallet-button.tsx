"use client"

import { useWallet } from "@/hooks/useWallet"
import { useTransactionHistory } from "@/hooks/useTransactionHistory"
import { switchToHardhat, switchToSepolia, isLocalEnvironment } from "@/lib/web3"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Copy, LogOut, Wallet, Zap, RefreshCw } from "lucide-react"
import { useState } from "react"

const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon",
  80001: "Mumbai Testnet",
  42161: "Arbitrum",
  43114: "Avalanche",
  31337: "Hardhat Local",
}

export function WalletButton() {
  const { wallet, isLoading, error, connect, disconnect, isConnected } = useWallet()
  const { addTransaction, updateTransaction } = useTransactionHistory()
  const [copied, setCopied] = useState(false)
  const [funding, setFunding] = useState(false)
  const [fundingMessage, setFundingMessage] = useState("")

  const handleCopy = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGetTestETH = async () => {
    if (!wallet) return
    
    setFunding(true)
    setFundingMessage("Requesting test ETH...")
    
    try {
      // Add pending transaction
      const txRecord = addTransaction({
        hash: "pending",
        type: "fund",
        status: "pending",
        recipeTitle: "Test ETH Funding",
        amount: "1000",
        from: "0xFaucet",
        to: wallet.address,
        timestamp: Date.now(),
        description: "Requested 1000 test ETH from faucet",
      })

      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: wallet.address,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update with actual hash
        updateTransaction(txRecord.id, {
          hash: data.hash || "completed",
          status: "completed",
        })
        setFundingMessage("✅ 1000 ETH sent! Check your wallet.")
        setTimeout(() => setFundingMessage(""), 3000)
      } else {
        updateTransaction(txRecord.id, {
          status: "failed",
        })
        setFundingMessage("Error: " + (data.error || "Failed to get funds"))
      }
    } catch (error) {
      addTransaction({
        hash: "failed",
        type: "fund",
        status: "failed",
        recipeTitle: "Test ETH Funding",
        amount: "1000",
        from: "0xFaucet",
        to: wallet.address,
        timestamp: Date.now(),
        description: `Failed to get test ETH: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
      setFundingMessage("Error requesting funds: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setFunding(false)
    }
  }

  const handleMintETH = async () => {
    if (!wallet) return
    
    // If not on Hardhat, switch first
    if (wallet.chainId !== 31337) {
      setFunding(true)
      setFundingMessage("Switching to Hardhat network...")
      try {
        await switchToHardhat()
        setFundingMessage("Switched! Now adding ETH...")
        await new Promise(r => setTimeout(r, 1000))
      } catch (err) {
        setFundingMessage("Please switch to Hardhat network manually")
        setFunding(false)
        return
      }
    }
    
    setFunding(true)
    setFundingMessage("Adding 100,000 ETH to your wallet...")
    
    try {
      const response = await fetch("/api/mint-eth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet.address, amount: "100000" }),
      })

      const data = await response.json()

      if (response.ok) {
        addTransaction({
          hash: data.hash || "mint-" + Date.now().toString(16),
          type: "fund",
          status: "completed",
          recipeTitle: "Mint 100,000 ETH",
          amount: "100000",
          from: "Faucet",
          to: wallet.address,
          timestamp: Date.now(),
          description: "Added 100,000 ETH to wallet",
        })
        setFundingMessage("✅ 100,000 ETH added! Refreshing...")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setFundingMessage("Error: " + (data.error || "Failed"))
        setFunding(false)
      }
    } catch (error) {
      setFundingMessage("Error: " + (error instanceof Error ? error.message : "Failed"))
      setFunding(false)
    }
  }

  const handleSwitchNetwork = async () => {
    setFunding(true)
    setFundingMessage("Switching to Hardhat...")
    try {
      await switchToHardhat()
      setFundingMessage("✅ Switched! Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setFundingMessage("Failed to switch network")
      setFunding(false)
    }
  }

  const handleSwitchToSepolia = async () => {
    setFunding(true)
    setFundingMessage("Switching to Sepolia...")
    try {
      await switchToSepolia()
      setFundingMessage("✅ Switched to Sepolia! Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setFundingMessage("Failed to switch to Sepolia")
      setFunding(false)
    }
  }

  const getNetworkName = (chainId: number): string => {
    return NETWORK_NAMES[chainId] || `Network ${chainId}`
  }

  if (error) {
    return (
      <Button variant="destructive" onClick={connect} disabled={isLoading} className="gap-2">
        <Wallet size={16} />
        {isLoading ? "Connecting..." : "Error - Retry"}
      </Button>
    )
  }

  if (isConnected && wallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-fit">
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span className="font-medium text-xs md:text-sm">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Address */}
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <div className="flex items-center justify-between bg-secondary p-2 rounded gap-2">
              <code className="text-xs font-mono break-all">{wallet.address}</code>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy address"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Balance */}
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="font-semibold text-sm flex items-center gap-1">
              {Number.parseFloat(wallet.balance).toFixed(4)} ETH
            </p>
          </div>

          <DropdownMenuSeparator />

          {/* Network */}
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground mb-1">Network</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <p className="font-semibold text-sm">{getNetworkName(wallet.chainId)}</p>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Network Switch & ETH Buttons */}
          <div className="px-2 py-2 space-y-2">
            {/* For deployed app - use Sepolia */}
            {!isLocalEnvironment() && wallet.chainId !== 11155111 && (
              <Button
                onClick={handleSwitchToSepolia}
                disabled={funding}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                size="sm"
              >
                <RefreshCw size={14} />
                {funding ? "Switching..." : "🔗 Switch to Sepolia"}
              </Button>
            )}
            {/* For local development - use Hardhat */}
            {isLocalEnvironment() && wallet.chainId !== 31337 && (
              <Button
                onClick={handleSwitchNetwork}
                disabled={funding}
                className="w-full bg-orange-600 hover:bg-orange-700 gap-2"
                size="sm"
              >
                <RefreshCw size={14} />
                {funding ? "Switching..." : "🔄 Switch to Hardhat"}
              </Button>
            )}
            {/* Mint ETH only works locally */}
            {isLocalEnvironment() && (
              <Button
                onClick={handleMintETH}
                disabled={funding}
                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                size="sm"
              >
                <Zap size={14} />
                {funding ? "Adding ETH..." : "⚡ Mint 100,000 ETH"}
              </Button>
            )}
            {/* Sepolia faucet link for deployed */}
            {!isLocalEnvironment() && (
              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="sm"
                >
                  <Zap size={14} />
                  🚰 Get Free Sepolia ETH
                </Button>
              </a>
            )}
            {wallet.chainId === 31337 && isLocalEnvironment() && (
              <Button
                onClick={handleGetTestETH}
                disabled={funding}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                size="sm"
              >
                <Zap size={14} />
                {funding ? "Processing..." : "Get 1000 Test ETH"}
              </Button>
            )}
            {fundingMessage && (
              <p className="text-xs mt-2 text-center text-green-600 dark:text-green-400 font-medium">
                {fundingMessage}
              </p>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Disconnect */}
          <DropdownMenuItem onClick={disconnect} className="text-red-600 cursor-pointer gap-2">
            <LogOut size={14} />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={connect} disabled={isLoading} className="gap-2">
      <Wallet size={16} />
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
