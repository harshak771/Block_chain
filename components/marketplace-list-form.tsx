"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMarketplace } from "@/hooks/useMarketplace"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MarketplaceListFormProps {
  tokenId: string
  recipeName: string
  walletAddress: string
  onSuccess?: () => void
}

export function MarketplaceListForm({ tokenId, recipeName, walletAddress, onSuccess }: MarketplaceListFormProps) {
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState(false)
  const { createAndListRecipe, loading, error } = useMarketplace()

  const handleList = async () => {
    if (!price) {
      alert("Please enter a price")
      return
    }

    try {
      await createAndListRecipe(tokenId, walletAddress, price, {
        title: recipeName,
        creator: walletAddress,
        ingredients: 0,
        imageUrl: `/placeholder.svg?height=200&width=200&query=recipe NFT`,
      })

      setSuccess(true)
      setPrice("")
      setDescription("")
      onSuccess?.()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Listing error:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List Recipe on Marketplace</CardTitle>
        <CardDescription>Set your price and start selling your recipe NFT</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <span className="mr-2">❌</span>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <span className="mr-2">✅</span>
            <AlertDescription className="text-green-800">
              Recipe listed successfully! Now available on the marketplace.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Recipe Name</Label>
          <Input value={recipeName} disabled className="bg-muted" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (ETH)</Label>
          <Input
            id="price"
            type="number"
            step="0.0001"
            placeholder="0.05"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            rows={3}
            placeholder="Describe your recipe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button onClick={handleList} disabled={loading} className="w-full">
          {loading ? "⏳ Listing..." : "📋 List Recipe"}
        </Button>
      </CardContent>
    </Card>
  )
}
