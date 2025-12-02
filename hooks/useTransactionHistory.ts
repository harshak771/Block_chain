"use client"

import { useState, useEffect, useCallback } from "react"

export interface StoredTransaction {
  id: string
  hash: string
  type: "mint" | "buy" | "sell" | "list" | "unlist" | "transfer" | "fund"
  status: "pending" | "completed" | "failed"
  recipeTitle: string
  amount?: string
  from: string
  to: string
  timestamp: number
  blockNumber?: number
  description?: string
}

const STORAGE_KEY = "recipenft_transactions"

export function useTransactionHistory(userAddress?: string) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([])
  const [loading, setLoading] = useState(true)

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setTransactions(parsed)
      }
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add a new transaction
  const addTransaction = useCallback(
    (transaction: Omit<StoredTransaction, "id">) => {
      const newTx: StoredTransaction = {
        ...transaction,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }

      setTransactions((prev) => {
        const updated = [newTx, ...prev]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Failed to save transaction:", error)
        }
        return updated
      })

      return newTx
    },
    []
  )

  // Update a transaction
  const updateTransaction = useCallback(
    (id: string, updates: Partial<StoredTransaction>) => {
      setTransactions((prev) => {
        const updated = prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Failed to update transaction:", error)
        }
        return updated
      })
    },
    []
  )

  // Get transactions for current user
  const getUserTransactions = useCallback(
    (address?: string) => {
      if (!address) return transactions

      return transactions.filter((tx) => tx.from === address || tx.to === address)
    },
    [transactions]
  )

  // Get sent transactions
  const getSentTransactions = useCallback(
    (address?: string) => {
      if (!address) return []
      return transactions.filter((tx) => tx.from === address)
    },
    [transactions]
  );

  // Get received transactions
  const getReceivedTransactions = useCallback(
    (address?: string) => {
      if (!address) return []
      return transactions.filter((tx) => tx.to === address)
    },
    [transactions]
  )

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    getUserTransactions,
    getSentTransactions,
    getReceivedTransactions,
  }
}
