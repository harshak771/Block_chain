"use client"

import { useState, useEffect } from "react"
import { connectWallet, getConnectedWallet, disconnectWallet, type WalletInfo } from "@/lib/web3"

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if wallet was previously connected
    const checkWallet = async () => {
      try {
        const connected = await getConnectedWallet()
        if (connected) {
          setWallet(connected)
        }
      } catch (err) {
        console.error("Error checking wallet:", err)
      }
    }

    checkWallet()
  }, [])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const walletInfo = await connectWallet()
      setWallet(walletInfo)
      localStorage.setItem("walletConnected", "true")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    await disconnectWallet()
    setWallet(null)
  }

  return {
    wallet,
    isLoading,
    error,
    connect,
    disconnect,
    isConnected: !!wallet,
  }
}
