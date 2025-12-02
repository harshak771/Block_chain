"use client"

import type React from "react"
import { useState } from "react"
import { useWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { uploadToIPFS, uploadImageToIPFS, type RecipeMetadata } from "@/lib/ipfs"
import { mintRecipeNFT } from "@/lib/contract"

export function RecipeMintForm() {
  const { isConnected, wallet } = useWallet()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cuisine: "Other",
    ingredients: "",
    prepTime: 15,
    cookTime: 30,
    difficulty: 2,
    servings: 4,
    royalty: 500,
    steps: "",
    imagePreview: null as string | ArrayBuffer | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "uploading" | "minting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [mintedNFT, setMintedNFT] = useState<{ hash: string; txHash: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Handle numeric inputs
    const numericFields = ["prepTime", "cookTime", "difficulty", "servings", "royalty"]
    const finalValue = numericFields.includes(name) ? Number(value) : value
    
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleImageUpload = (imageUrl: string | ArrayBuffer) => {
    setFormData((prev) => ({ ...prev, imagePreview: imageUrl }))
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !wallet) return

    setIsLoading(true)
    setStatus("uploading")
    setMessage("")

    try {
      let imageIPFSHash = ""
      if (formData.imagePreview) {
        setMessage("Uploading image to IPFS...")
        // Convert data URL to file if needed
        if (typeof formData.imagePreview === "string" && formData.imagePreview.startsWith("data:")) {
          const response = await fetch(formData.imagePreview)
          const blob = await response.blob()
          const file = new File([blob], "recipe-image.png", { type: "image/png" })
          imageIPFSHash = await uploadImageToIPFS(file)
        }
      }

      const ingredientsList = formData.ingredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i)

      const stepsList = formData.steps
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s)

      const metadata: RecipeMetadata = {
        title: formData.title,
        ingredients: ingredientsList,
        steps: stepsList,
        image: imageIPFSHash ? `ipfs://${imageIPFSHash}` : undefined,
        creator: wallet.address,
        createdAt: Date.now(),
      }

      setMessage("Uploading recipe metadata to IPFS...")
      const metadataHash = await uploadToIPFS(metadata)

      setStatus("minting")
      setMessage("Confirming transaction in your wallet...")
      const mintResult = await mintRecipeNFT(metadataHash, {
        name: formData.title,
        description: formData.description,
        cuisine: formData.cuisine,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        difficulty: formData.difficulty,
        servings: formData.servings,
        royalty: formData.royalty,
      })

      setStatus("success")
      setMessage("Recipe NFT minted successfully!")
      setMintedNFT({
        hash: metadataHash,
        txHash: mintResult.transactionHash,
      })

      // Reset form
      setFormData({ 
        title: "", 
        description: "",
        cuisine: "Other",
        ingredients: "", 
        prepTime: 15,
        cookTime: 30,
        difficulty: 2,
        servings: 4,
        royalty: 500,
        steps: "", 
        image: null 
      })

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatus("idle")
        setMintedNFT(null)
      }, 5000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setStatus("error")
      setMessage(errorMessage)
      console.error("Error minting recipe:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="pt-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-amber-800 dark:text-amber-200">Please connect your wallet to mint recipe NFTs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">👨‍🍳</span>
          Create Recipe NFT
        </CardTitle>
        <CardDescription>Turn your culinary creation into a unique NFT on the blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMint} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chocolate Lava Cake"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <Input
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="e.g., Dessert, Italian..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your recipe..."
              rows={2}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ingredients *</label>
            <Textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="List ingredients separated by newlines..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prep Time (minutes)</label>
              <Input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                min="0"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cook Time (minutes)</label>
              <Input
                type="number"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty (1-5)</label>
              <Input
                type="number"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                min="1"
                max="5"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Servings</label>
              <Input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                min="1"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Royalty Percentage (0-100%)</label>
            <Input
              type="number"
              name="royalty"
              value={formData.royalty}
              onChange={handleChange}
              min="0"
              max="10000"
              placeholder="500 = 5%"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">Percentage of sales you'll earn from future resales (in basis points, 100 = 1%)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preparation Steps *</label>
            <Textarea
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              placeholder="Describe the cooking steps..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <ImageUpload
            onImageUpload={handleImageUpload}
            preview={formData.imagePreview}
            onPreviewChange={(preview) => setFormData((prev) => ({ ...prev, imagePreview: preview }))}
          />

          {message && (
            <div
              className={`p-4 rounded-lg text-sm flex items-center gap-3 ${
                status === "success"
                  ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : status === "error"
                    ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                    : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
              }`}
            >
              <span className="flex-shrink-0 text-lg">
                {status === "success" ? "✅" : status === "error" ? "❌" : "⏳"}
              </span>
              {message}
            </div>
          )}

          {mintedNFT && (
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg text-sm space-y-2">
              <p className="font-semibold">✅ NFT Minted Successfully!</p>
              <p>IPFS Hash: {mintedNFT.hash}</p>
              <p className="text-xs opacity-75 break-all">TX: {mintedNFT.txHash}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.description || !formData.ingredients || !formData.steps}
            className="w-full"
          >
            {isLoading
              ? status === "uploading"
                ? "Uploading to IPFS..."
                : status === "minting"
                  ? "Minting Recipe NFT..."
                  : "Processing..."
              : "🚀 Mint Recipe NFT"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
