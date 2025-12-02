"use client"

import { useIPFSStorage } from "@/hooks/useIPFSStorage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IPFSRecipeViewer } from "./ipfs-recipe-viewer"

export function RecipeStorageDashboard() {
  const { recipes, isLoading, error, deleteRecipe } = useIPFSStorage()

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="pt-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (recipes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💾</span>
            Recipe Storage
          </CardTitle>
          <CardDescription>Your minted recipes on IPFS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No recipes stored yet. Mint your first recipe NFT to see it here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💾</span>
            Recipe Storage
          </CardTitle>
          <CardDescription>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} stored on IPFS
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <IPFSRecipeViewer key={recipe.ipfsHash} recipe={recipe} onDelete={() => deleteRecipe(recipe.ipfsHash)} />
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading recipes...</div>
        </div>
      )}
    </div>
  )
}
