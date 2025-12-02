"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipeCard } from "./recipe-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { MarketplaceListForm } from "./marketplace-list-form"
import type { UserPortfolio } from "@/lib/user-dashboard"

interface RecipeCollectionProps {
  portfolio: UserPortfolio | null
  userAddress: string | null
}

export function RecipeCollection({ portfolio, userAddress }: RecipeCollectionProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)

  if (!portfolio || portfolio.recipes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Recipe Collection</CardTitle>
          <CardDescription>Recipes you own and have minted</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No recipes yet. Start by minting your first recipe!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Recipe Collection</CardTitle>
          <CardDescription>Manage and list your recipe NFTs</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {portfolio.recipes.map((recipe) => (
          <div key={recipe.id} className="relative">
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              creator={userAddress || ""}
              ingredients={0}
              image={`/placeholder.svg?height=200&width=200&query=recipe NFT`}
            />
            <Button
              variant="outline"
              className="absolute bottom-4 right-4 left-4 bg-transparent"
              size="sm"
              onClick={() => setSelectedRecipe(recipe.id)}
            >
              List for Sale
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>List Recipe on Marketplace</DialogTitle>
            <DialogDescription>Set a price and make your recipe available for sale</DialogDescription>
          </DialogHeader>
          {selectedRecipe && userAddress && (
            <MarketplaceListForm
              tokenId={selectedRecipe}
              recipeName={portfolio.recipes.find((r) => r.id === selectedRecipe)?.title || ""}
              walletAddress={userAddress}
              onSuccess={() => setSelectedRecipe(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
