"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { RevenueShare, Collaborator } from "@/lib/collaboration"
import { TrendingUp, DollarSign } from "lucide-react"

interface RoyaltyTrackerProps {
  collaborators: Collaborator[]
  revenueShares: RevenueShare[]
  recipeName: string
}

export function RoyaltyTracker({ collaborators, revenueShares, recipeName }: RoyaltyTrackerProps) {
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  // Prepare data for pie chart
  const pieData = collaborators.map((collab) => ({
    name: `${collab.address.slice(0, 6)}...${collab.address.slice(-4)}`,
    value: collab.sharePercentage,
    address: collab.address,
  }))

  // Prepare data for payout history
  const payoutData = revenueShares
    .flatMap((share) =>
      share.payoutHistory.map((payout) => ({
        date: new Date(payout.date).toLocaleDateString(),
        collaborator: share.collaboratorAddress.slice(0, 6),
        amount: parseFloat(payout.amount),
      })),
    )
    .slice(-10) // Last 10 payouts

  const totalEarnings = revenueShares.reduce((sum, share) => sum + parseFloat(share.totalEarnings), 0)

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Revenue & Royalty Distribution
          </CardTitle>
          <CardDescription>Total earnings: {totalEarnings.toFixed(4)} ETH</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Total Earnings Card */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Recipe Earnings</p>
                <p className="text-4xl font-bold">{totalEarnings.toFixed(4)} ETH</p>
              </div>
              <DollarSign size={40} className="text-green-500 opacity-50" />
            </div>
          </div>

          {/* Revenue Share Pie Chart */}
          <div>
            <h3 className="font-semibold mb-4">Revenue Share Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Individual Collaborator Earnings */}
          <div>
            <h3 className="font-semibold mb-4">Collaborator Earnings</h3>
            <div className="space-y-3">
              {revenueShares.map((share) => {
                const collaborator = collaborators.find((c) => c.address === share.collaboratorAddress)
                return (
                  <div key={share.collaboratorAddress} className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono font-semibold text-sm">
                          {share.collaboratorAddress.slice(0, 6)}...{share.collaboratorAddress.slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Role: <Badge variant="outline" className="ml-1">{collaborator?.role || "unknown"}</Badge>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{share.totalEarnings} ETH</p>
                        <p className="text-xs text-muted-foreground">
                          {collaborator?.sharePercentage}% share
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(parseFloat(share.totalEarnings) / totalEarnings) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payout History Chart */}
          {payoutData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Recent Payouts</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payoutData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Last Payout Info */}
          {revenueShares.length > 0 && (
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Last Payout</p>
              <p className="font-semibold">
                {new Date(Math.max(...revenueShares.map((s) => s.lastPayout))).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
