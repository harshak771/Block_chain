"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { connectWallet, getConnectedWallet, disconnectWallet, type WalletInfo } from "@/lib/web3"
import { getDemoBalance, isDemoMode, addDemoETH } from "@/lib/demo-wallet"

interface WalletContextType {
  wallet: WalletInfo | null
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  isConnected: boolean
  isDemoMode: boolean
  demoBalance: number
  addFreeETH: (amount?: number) => void
  refreshDemoBalance: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
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

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accs = accounts as string[]
        if (accs.length === 0) {
          setWallet(null)
        } else {
          checkWallet()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
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

  // Add demo ETH - works everywhere now
  const addFreeETH = (amount: number = 1000) => {
    if (wallet) {
      const currentBalance = parseFloat(wallet.balance) || 0
      const newBalance = currentBalance + amount
      setDemoBalance(newBalance)
      setWallet({
        ...wallet,
        balance: newBalance.toFixed(4),
      })
      // Also update localStorage
      addDemoETH(amount)
    }
  }

  return (
    <WalletContext.Provider
      value={{
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
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}
