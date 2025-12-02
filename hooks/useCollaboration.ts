"use client"

import { useState, useCallback } from "react"
import {
  getCollaborativeRecipes,
  createCollaborativeRecipe,
  addCollaborativeRecipe,
  getPendingInvites,
  createInvite,
  saveInvite,
  acceptInvite,
  declineInvite,
  getRevenueShare,
  type CollaborativeRecipe,
  type CollaborationInvite,
  type RevenueShare,
} from "@/lib/collaboration"

export function useCollaboration(userAddress: string | null) {
  const [recipes, setRecipes] = useState<CollaborativeRecipe[]>(getCollaborativeRecipes())
  const [invites, setInvites] = useState<CollaborationInvite[]>(userAddress ? getPendingInvites(userAddress) : [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRecipe = useCallback(
    (title: string, metadata: CollaborativeRecipe["metadata"]) => {
      if (!userAddress) throw new Error("Not connected")

      const recipe = createCollaborativeRecipe(title, userAddress, metadata)
      addCollaborativeRecipe(recipe)
      setRecipes((prev) => [...prev, recipe])
      return recipe
    },
    [userAddress],
  )

  const inviteCollaborator = useCallback(
    (recipeId: string, invitedAddress: string, sharePercentage: number) => {
      setLoading(true)
      try {
        const recipe = recipes.find((r) => r.id === recipeId)
        if (!recipe) throw new Error("Recipe not found")

        const invite = createInvite(recipeId, recipe.title, userAddress!, invitedAddress, sharePercentage)
        saveInvite(invite)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invite")
      } finally {
        setLoading(false)
      }
    },
    [recipes, userAddress],
  )

  const respondToInvite = useCallback(
    (inviteId: string, accept: boolean) => {
      if (!userAddress) return

      if (accept) {
        acceptInvite(inviteId, userAddress)
      } else {
        declineInvite(inviteId)
      }

      setInvites((prev) => prev.filter((i) => i.id !== inviteId))
    },
    [userAddress],
  )

  const getRecipeRevenue = useCallback((recipeId: string, collaboratorAddress: string): RevenueShare => {
    return getRevenueShare(recipeId, collaboratorAddress)
  }, [])

  return {
    recipes,
    invites,
    loading,
    error,
    createRecipe,
    inviteCollaborator,
    respondToInvite,
    getRecipeRevenue,
  }
}
