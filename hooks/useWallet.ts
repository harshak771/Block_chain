"use client"

import { useState, useEffect, useCallback } from "react"
import { connectWallet, getConnectedWallet, disconnectWallet, type WalletInfo } from "@/lib/web3"
import { getDemoBalance, isDemoMode, addDemoETH } from "@/lib/demo-wallet"

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoBalance, setDemoBalance] = useState<number>(0)

  // Refresh demo balance
  const refreshDemoBalance = useCallback(() => {
    if (isDemoMode()) {
      setDemoBalance(getDemoBalance())
    }
  }, [])

  useEffect(() => {
    // Check if wallet was previously connected
    const checkWallet = async () => {
      try {
        const connected = await getConnectedWallet()
        if (connected) {
          // In demo mode, override balance with demo balance
          if (isDemoMode()) {
            const demoBal = getDemoBalance()
            setDemoBalance(demoBal)
            setWallet({
              ...connected,
              balance: demoBal.toFixed(4),
            })
          } else {
            setWallet(connected)
          }
        }
      } catch (err) {
        console.error("Error checking wallet:", err)
      }
    }

    checkWallet()
    refreshDemoBalance()
  }, [refreshDemoBalance])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const walletInfo = await connectWallet()
      
      // In demo mode, use demo balance
      if (isDemoMode()) {
        const demoBal = getDemoBalance()
        setDemoBalance(demoBal)
        setWallet({
          ...walletInfo,
          balance: demoBal.toFixed(4),
        })
      } else {
        setWallet(walletInfo)
      }
      
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

  // Add demo ETH (only works in demo mode)
  const addFreeETH = (amount: number = 1000) => {
    if (isDemoMode() && wallet) {
      const newBalance = addDemoETH(amount)
      setDemoBalance(newBalance)
      setWallet({
        ...wallet,
        balance: newBalance.toFixed(4),
      })
    }
  }

  return {
    wallet,
    isLoading,
    error,
    connect,
    disconnect,
    isConnected: !!wallet,
    isDemoMode: isDemoMode(),
    demoBalance,
    addFreeETH,
    refreshDemoBalance,
  }
}
