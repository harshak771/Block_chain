"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { StoredRecipe } from "@/hooks/useIPFSStorage"
import { useState } from "react"

interface IPFSRecipeViewerProps {
  recipe: StoredRecipe
  onDelete?: (ipfsHash: string) => void
}

export function IPFSRecipeViewer({ recipe, onDelete }: IPFSRecipeViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${recipe.ipfsHash}`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
            <CardDescription>
              by {recipe.creator.slice(0, 6)}...{recipe.creator.slice(-4)}
            </CardDescription>
          </div>
          <Badge variant="outline">IPFS</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Ingredients ({recipe.ingredients.length})</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <li key={idx} className="truncate">
                • {ing}
              </li>
            ))}
            {recipe.ingredients.length > 3 && <li className="text-xs">+ {recipe.ingredients.length - 3} more</li>}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">Steps ({recipe.steps.length})</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.steps[0] || "No steps"}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-muted p-2 rounded text-xs break-all">
            <code className="flex-1 font-mono">{recipe.ipfsHash.slice(0, 20)}...</code>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(recipe.ipfsHash)} className="h-6 w-6 p-0">
              📋
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
              <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                🔗 View on IPFS
              </a>
            </Button>
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(recipe.ipfsHash)}>
                🗑️
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Created: {new Date(recipe.createdAt).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  )
}
