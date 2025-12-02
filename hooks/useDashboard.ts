"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getUserPortfolio,
  getSalesHistory,
  calculateUserStats,
  type UserPortfolio,
  type SaleHistory,
  type UserStats,
} from "@/lib/user-dashboard"

export function useDashboard(userAddress: string | null) {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null)
  const [salesHistory, setSalesHistory] = useState<SaleHistory[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshDashboard = useCallback(() => {
    if (!userAddress) return

    const p = getUserPortfolio(userAddress)
    const s = getSalesHistory(userAddress)
    const st = calculateUserStats(userAddress)

    setPortfolio(p)
    setSalesHistory(s)
    setStats(st)
    setLoading(false)
  }, [userAddress])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  return {
    portfolio,
    salesHistory,
    stats,
    loading,
    refreshDashboard,
  }
}
