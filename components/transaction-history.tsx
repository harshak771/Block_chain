"use client"

import { useState, useEffect } from "react"
import { useTransactionHistory } from "@/hooks/useTransactionHistory"
import { useWallet } from "@/hooks/useWallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Transaction {
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
}

export function TransactionHistory({ userAddress: propUserAddress }: { userAddress?: string }) {
  const { wallet } = useWallet()
  const { transactions, loading } = useTransactionHistory()
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all")
  
  const userAddress = propUserAddress || wallet?.address

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "mint":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
      case "buy":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      case "sell":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
      case "list":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
      case "unlist":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
      case "transfer":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "mint":
        return "🎨"
      case "buy":
        return "📥"
      case "sell":
        return "📤"
      case "list":
        return "📌"
      case "unlist":
        return "📍"
      case "transfer":
        return "↔️"
      default:
        return "📦"
    }
  }

  const getTypeLabel = (type: Transaction["type"]) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by user address
    if (userAddress && tx.from !== userAddress && tx.to !== userAddress) {
      return false
    }

    // Filter by transaction type
    if (filter === "all") return true
    if (filter === "sent") return tx.from === userAddress
    if (filter === "received") return tx.to === userAddress
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Transaction History
        </CardTitle>
        <CardDescription>Your recent blockchain transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({transactions.filter((t) => t.from === userAddress).length})</TabsTrigger>
            <TabsTrigger value="received">Received ({transactions.filter((t) => t.to === userAddress).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3 mt-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">📭</span>
                <p>No transactions yet</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getTypeColor(tx.type)}>
                          {getTypeLabel(tx.type)}
                        </Badge>
                        <span className="font-medium text-sm">{tx.recipeTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatAddress(tx.from)}</span>
                        <span>→</span>
                        <span>{formatAddress(tx.to)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2 justify-end">
                      {tx.amount && (
                        <span className="font-semibold text-sm">
                          {tx.type === "buy" || tx.type === "transfer" ? "+" : "-"} {tx.amount} ETH
                        </span>
                      )}
                      <Badge
                        variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {tx.status === "completed" ? "✓" : tx.status === "pending" ? "⏳" : "✗"}{" "}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyHash(tx.hash)}
                        title="Copy transaction hash"
                      >
                        <Copy size={14} />
                      </Button>
                      <a
                        href={`https://localhost:8545/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="View on block explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-2">
          <p>💡 Tip: Click the copy icon to copy transaction hash or external link to view details</p>
          <p>⏱️ Transactions update in real-time as blocks are mined on the local network</p>
        </div>
      </CardContent>
    </Card>
  )
}
