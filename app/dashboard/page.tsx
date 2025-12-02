"use client"

import { useEffect, useState } from "react"
import { WalletButton } from "@/components/wallet-button"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecipeCollection } from "@/components/recipe-collection"
import { SalesHistory } from "@/components/sales-history"
import { TransactionHistory } from "@/components/transaction-history"
import { useDashboard } from "@/hooks/useDashboard"
import { useWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { wallet, isConnected } = useWallet()
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalRecipesMinted: 5,
    totalRecipesSold: 2,
    totalEarnings: 8.5,
    totalSpent: 4.2,
    favoritesCounts: 12,
  })

  useEffect(() => {
    if (wallet?.address) {
      setUserAddress(wallet.address)
    }
  }, [wallet])

  const { portfolio, salesHistory, loading } = useDashboard(userAddress)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">← Back</Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h1 className="text-2xl font-bold">Your Dashboard</h1>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          {/* User Info */}
          {userAddress && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Connected Wallet</p>
                    <p className="font-mono text-lg">
                      {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
                    </p>
                  </div>
                  <WalletButton />
                </div>
              </CardContent>
            </Card>
          )}

          {!userAddress ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Please connect your wallet to view your dashboard</p>
                <WalletButton />
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-2xl mr-2">⏳</span>
              <span>Loading your dashboard...</span>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <DashboardStats stats={stats} />

              {/* Tabs for Collections, Transactions, and Sales */}
              <Tabs defaultValue="collection" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="collection">Your Collection</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="sales">Sales History</TabsTrigger>
                </TabsList>

                {/* Collection Tab */}
                <TabsContent value="collection" className="mt-6">
                  <RecipeCollection portfolio={portfolio} userAddress={userAddress} />
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TransactionHistory />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sales History Tab */}
                <TabsContent value="sales" className="mt-6">
                  <SalesHistory salesHistory={salesHistory} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/50 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RecipeNFT Dashboard © 2025 - Manage your culinary NFT collection</p>
        </div>
      </footer>
    </div>
  )
}
