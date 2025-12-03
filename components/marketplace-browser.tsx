"use client"

import { useState, useEffect } from "react"
import { useMarketplace } from "@/hooks/useMarketplace"
import { useWallet } from "@/hooks/useWallet"
import { sendETH } from "@/lib/web3"
import { simulatePurchase, isDemoMode } from "@/lib/demo-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "./recipe-card"
import { SampleRecipesGrid } from "./sample-recipes-grid"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MarketplaceBrowser() {
  const { listings, loading, error, purchaseRecipe } = useMarketplace()
  const { isConnected, wallet, refreshDemoBalance } = useWallet()
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [selectedListing, setSelectedListing] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [txMessage, setTxMessage] = useState("")
  const [txHash, setTxHash] = useState("")

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    const price = Number.parseFloat(listing.price)

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "budget" && price <= 0.05) ||
      (priceFilter === "mid" && price > 0.05 && price <= 0.1) ||
      (priceFilter === "premium" && price > 0.1)

    return matchesSearch && matchesPrice && listing.active
  })

  const handlePurchase = async (listingId: string) => {
    if (!isConnected || !wallet) {
      alert("Please connect your wallet first")
      return
    }

    const listing = listings.find((l) => l.id === listingId)
    if (!listing) return

    setIsProcessing(true)
    setTxMessage("Processing payment...")
    setTxHash("")

    try {
      // Check if in demo mode (deployed site)
      if (isDemoMode()) {
        // Use simulated transaction
        const result = simulatePurchase(
          wallet.address,
          listing.recipe.creator,
          listing.price,
          listing.recipe.title
        )

        if (!result.success) {
          setTxMessage(`❌ ${result.error}. Click your wallet to get more Demo ETH!`)
          setIsProcessing(false)
          return
        }

        setTxHash(result.transaction!.hash)
        setTxMessage(`✅ Demo Purchase successful! TX: ${result.transaction!.hash.slice(0, 10)}...`)
        
        // Refresh balance
        if (refreshDemoBalance) refreshDemoBalance()
        
        setTimeout(() => {
          setSelectedListing(null)
          setTxMessage("")
          setTxHash("")
          window.location.reload() // Refresh to update balance
        }, 2000)
      } else {
        // Real transaction via MetaMask
        setTxMessage("Confirm in MetaMask...")
        const txHash = await sendETH(listing.recipe.creator, listing.price)
        setTxHash(txHash)
        setTxMessage(`✅ Purchase successful! Transaction: ${txHash}`)

        // Also try to update contract state
        try {
          await purchaseRecipe(listingId, wallet.address, listing.price)
        } catch (contractErr) {
          console.log("Contract update note:", contractErr)
        }

        setTimeout(() => {
          setSelectedListing(null)
          setTxMessage("")
          setTxHash("")
        }, 3000)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Transaction failed"
      setTxMessage(`❌ ${errorMsg}`)
      console.error("Purchase error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🏪 Recipe NFT Marketplace</CardTitle>
          <CardDescription>Discover unique culinary recipes as NFTs from creators worldwide</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="featured">Featured Recipes</TabsTrigger>
          <TabsTrigger value="listings">Smart Contract Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Browse our collection of premium recipe NFTs with verified creators</p>
            <SampleRecipesGrid />
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
              <CardDescription>Recipes currently listed for sale on the blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <span className="mr-2">⚠️</span>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search recipes</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or creator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="price-filter">Price range</Label>
                  <select
                    id="price-filter"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="all">All prices</option>
                    <option value="budget">Budget (&lt;= 0.05 ETH)</option>
                    <option value="mid">Mid-range (0.05 - 0.1 ETH)</option>
                    <option value="premium">Premium (&gt; 0.1 ETH)</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-2xl mr-2">⏳</span>
                  <span>Loading marketplace...</span>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No recipes found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredListings.map((listing) => (
                    <RecipeCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.recipe.title}
                      creator={listing.recipe.creator}
                      price={listing.price}
                      ingredients={listing.recipe.ingredients}
                      image={listing.recipe.imageUrl}
                      onClick={() => setSelectedListing(listing.id)}
                      onBuy={() => setSelectedListing(listing.id)}
                      onFavorite={() => alert(`${listing.recipe.title} added to favorites!`)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Recipe</DialogTitle>
            <DialogDescription>Complete your purchase with MetaMask</DialogDescription>
          </DialogHeader>

          {selectedListing && listings.find((l) => l.id === selectedListing) && (
            <div className="space-y-4">
              {(() => {
                const listing = listings.find((l) => l.id === selectedListing)!
                return (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Recipe</p>
                      <p className="font-semibold">{listing.recipe.title}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Creator</p>
                      <p className="font-mono text-sm">
                        {listing.recipe.creator.slice(0, 6)}...{listing.recipe.creator.slice(-4)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold text-primary">{listing.price} ETH</p>
                    </div>

                    {txMessage && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          txHash
                            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                            : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {txMessage}
                      </div>
                    )}

                    <Button
                      onClick={() => handlePurchase(listing.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "⏳ Processing..." : "🛒 Confirm Purchase"}
                    </Button>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
