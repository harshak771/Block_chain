"use client"

import { useState, useCallback } from "react"
import { uploadRecipeToIPFS, uploadImageToIPFS } from "@/app/actions/ipfs"
import { getIPFSUrl, type RecipeMetadata } from "@/lib/ipfs"

export interface StoredRecipe extends RecipeMetadata {
  ipfsHash: string
  transactionHash: string
}

export function useIPFSStorage() {
  const [recipes, setRecipes] = useState<StoredRecipe[]>(() => {
    // Load recipes from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recipeNFTs")
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveRecipeToStorage = useCallback((recipe: StoredRecipe) => {
    setRecipes((prev) => {
      const updated = [recipe, ...prev]
      localStorage.setItem("recipeNFTs", JSON.stringify(updated))
      return updated
    })
  }, [])

  const uploadRecipe = useCallback(
    async (
      title: string,
      ingredients: string[],
      steps: string[],
      image: File | null,
      creator: string,
    ): Promise<{ ipfsHash: string; imageHash?: string }> => {
      setIsLoading(true)
      setError(null)

      try {
        let imageIPFSHash = ""
        if (image) {
          const formData = new FormData()
          formData.append("file", image)
          imageIPFSHash = await uploadImageToIPFS(formData)
        }

        const metadata: RecipeMetadata = {
          title,
          ingredients,
          steps,
          image: imageIPFSHash ? `ipfs://${imageIPFSHash}` : undefined,
          creator,
          createdAt: Date.now(),
        }

        const ipfsHash = await uploadRecipeToIPFS(metadata)

        return {
          ipfsHash,
          imageHash: imageIPFSHash,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload recipe"
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const retrieveRecipe = useCallback(
    (ipfsHash: string): StoredRecipe | null => {
      return recipes.find((r) => r.ipfsHash === ipfsHash) || null
    },
    [recipes],
  )

  const getAllRecipes = useCallback(() => {
    return recipes
  }, [recipes])

  const getIPFSGatewayUrl = useCallback((hash: string): string => {
    return getIPFSUrl(hash)
  }, [])

  const deleteRecipe = useCallback((ipfsHash: string) => {
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.ipfsHash !== ipfsHash)
      localStorage.setItem("recipeNFTs", JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    recipes,
    isLoading,
    error,
    uploadRecipe,
    retrieveRecipe,
    getAllRecipes,
    saveRecipeToStorage,
    getIPFSGatewayUrl,
    deleteRecipe,
  }
}
