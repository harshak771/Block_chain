"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserStats } from "@/lib/user-dashboard"

interface DashboardStatsProps {
  stats: UserStats | null
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Recipes Owned",
      value: stats?.recipesOwned || "0",
      emoji: "🍳",
      description: "Total NFT recipes",
    },
    {
      title: "Listed for Sale",
      value: stats?.recipesListed || "0",
      emoji: "📈",
      description: "Active listings",
    },
    {
      title: "Total Sales Volume",
      value: `${stats?.totalSalesVolume || "0"} ETH`,
      emoji: "💰",
      description: "Lifetime volume",
    },
    {
      title: "Total Earnings",
      value: `${stats?.totalEarnings || "0"} ETH`,
      emoji: "💵",
      description: "Revenue earned",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <span className="text-2xl">{card.emoji}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
