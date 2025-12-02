"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCollaboration } from "@/hooks/useCollaboration"

interface RevenueDashboardProps {
  userAddress: string | null
  recipeId: string
}

export function RevenueDashboard({ userAddress, recipeId }: RevenueDashboardProps) {
  const { recipes, getRecipeRevenue } = useCollaboration(userAddress)

  const recipe = recipes.find((r) => r.id === recipeId)
  if (!recipe) return null

  const userShare = recipe.collaborators.find((c) => c.address === userAddress)
  const revenue = userAddress ? getRecipeRevenue(recipeId, userAddress) : null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Revenue Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Share</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userShare?.sharePercentage || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue?.totalEarnings || "0"} ETH</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <span className="text-2xl">💼</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipe.collaborators.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>All contributors to this recipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recipe.collaborators.map((collab) => (
              <div key={collab.address} className="flex items-center justify-between p-2 bg-muted rounded">
                <div>
                  <p className="font-mono text-sm">
                    {collab.address.slice(0, 10)}...{collab.address.slice(-8)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{collab.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{collab.sharePercentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
