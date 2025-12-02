"use client"

import { useState, useCallback } from "react"
import {
  getStoredListings,
  addListing,
  removeListing,
  updateListing,
  createListing,
  savePurchaseOrder,
  type MarketplaceListing,
  type PurchaseOrder,
} from "@/lib/marketplace"

export function useMarketplace() {
  const [listings, setListings] = useState<MarketplaceListing[]>(getStoredListings())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshListings = useCallback(() => {
    setListings(getStoredListings())
  }, [])

  const createAndListRecipe = useCallback(
    async (tokenId: string, seller: string, price: string, recipe: MarketplaceListing["recipe"]) => {
      setLoading(true)
      setError(null)
      try {
        const listing = createListing(tokenId, seller, price, recipe)
        addListing(listing)
        setListings((prev) => [...prev, listing])
        return listing
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create listing"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const cancelListing = useCallback((listingId: string) => {
    removeListing(listingId)
    setListings((prev) => prev.filter((l) => l.id !== listingId))
  }, [])

  const updateListingPrice = useCallback((listingId: string, newPrice: string) => {
    updateListing(listingId, { price: newPrice })
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, price: newPrice } : l)))
  }, [])

  const purchaseRecipe = useCallback(
    async (listingId: string, buyerId: string, amount: string) => {
      setLoading(true)
      setError(null)
      try {
        // Create purchase order
        const order: PurchaseOrder = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          buyerId,
          listingId,
          amount,
          timestamp: Date.now(),
          status: "completed",
        }

        savePurchaseOrder(order)

        // Mark listing as inactive
        updateListing(listingId, { active: false })
        refreshListings()

        return order
      } catch (err) {
        const message = err instanceof Error ? err.message : "Purchase failed"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refreshListings],
  )

  return {
    listings,
    loading,
    error,
    refreshListings,
    createAndListRecipe,
    cancelListing,
    updateListingPrice,
    purchaseRecipe,
  }
}
