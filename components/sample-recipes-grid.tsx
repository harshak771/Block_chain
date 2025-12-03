"use client"

import { useState } from "react"
import { RecipeCard } from "@/components/recipe-card"
import { useWallet } from "@/hooks/useWallet"
import { useTransactionHistory } from "@/hooks/useTransactionHistory"
import { sendETH } from "@/lib/web3"
import { simulatePurchase, isDemoMode } from "@/lib/demo-wallet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Sample recipe data with placeholder food images
export const SAMPLE_RECIPES = [
  {
    id: "1",
    title: "Classic Margherita Pizza",
    creator: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    price: "1.5",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop&q=80",
    ingredients: 8,
    difficulty: "easy" as const,
    isNFT: true,
  },
  {
    id: "2",
    title: "Spaghetti Carbonara",
    creator: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    price: "2.0",
    image: "https://images.unsplash.com/photo-1612874742237-6526221fc9f3?w=500&h=500&fit=crop&q=80",
    ingredients: 6,
    difficulty: "medium" as const,
    isNFT: true,
  },
  {
    id: "3",
    title: "Chocolate Lava Cake",
    creator: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    price: "1.8",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop&q=80",
    ingredients: 7,
    difficulty: "medium" as const,
    isNFT: true,
  },
  {
    id: "4",
    title: "Greek Salad",
    creator: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    price: "0.8",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop&q=80",
    ingredients: 5,
    difficulty: "easy" as const,
    isNFT: false,
  },
  {
    id: "5",
    title: "Beef Tacos",
    creator: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    price: "1.2",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop&q=80",
    ingredients: 10,
    difficulty: "easy" as const,
    isNFT: true,
  },
  {
    id: "6",
    title: "Pad Thai",
    creator: "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
    price: "1.4",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop&q=80",
    ingredients: 9,
    difficulty: "medium" as const,
    isNFT: true,
  },
  {
    id: "7",
    title: "Sushi Platter",
    creator: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
    price: "3.5",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=500&fit=crop&q=80",
    ingredients: 12,
    difficulty: "hard" as const,
    isNFT: true,
  },
  {
    id: "8",
    title: "Tiramisu",
    creator: "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
    price: "2.2",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f80121c?w=500&h=500&fit=crop&q=80",
    ingredients: 8,
    difficulty: "medium" as const,
    isNFT: true,
  },
]

interface SampleRecipesGridProps {
  limit?: number
  onRecipeClick?: (recipe: typeof SAMPLE_RECIPES[0]) => void
}

export function SampleRecipesGrid({ limit, onRecipeClick }: SampleRecipesGridProps) {
  const { isConnected, wallet, refreshDemoBalance } = useWallet()
  const { addTransaction, updateTransaction } = useTransactionHistory()
  const recipes = limit ? SAMPLE_RECIPES.slice(0, limit) : SAMPLE_RECIPES
  const [selectedRecipe, setSelectedRecipe] = useState<typeof SAMPLE_RECIPES[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [txHash, setTxHash] = useState("")

  const handleRecipeClick = (recipe: typeof SAMPLE_RECIPES[0]) => {
    if (onRecipeClick) {
      onRecipeClick(recipe)
    } else {
      alert(`${recipe.title}\n\nPrice: ${recipe.price} ETH\n\nCreator: ${recipe.creator}`)
    }
  }

  const handleBuyClick = (recipe: typeof SAMPLE_RECIPES[0]) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    setSelectedRecipe(recipe)
    setMessage("")
    setTxHash("")
  }

  const handleConfirmPurchase = async () => {
    if (!selectedRecipe || !wallet) return

    setIsProcessing(true)
    setMessage("Processing purchase...")

    try {
      // Check if in demo mode (deployed site)
      if (isDemoMode()) {
        // Use simulated transaction
        const result = simulatePurchase(
          wallet.address,
          selectedRecipe.creator,
          selectedRecipe.price,
          selectedRecipe.title
        )

        if (!result.success) {
          setMessage(`❌ ${result.error}. Click your wallet to get more Demo ETH!`)
          setIsProcessing(false)
          return
        }

        // Add to transaction history
        addTransaction({
          hash: result.transaction!.hash,
          type: "buy",
          status: "completed",
          recipeTitle: selectedRecipe.title,
          amount: selectedRecipe.price,
          from: wallet.address,
          to: selectedRecipe.creator,
          timestamp: Date.now(),
          description: `Demo purchase: ${selectedRecipe.title}`,
        })

        setTxHash(result.transaction!.hash)
        setMessage(`✅ Demo Purchase successful! TX: ${result.transaction!.hash.slice(0, 10)}...`)
        
        // Refresh balance
        if (refreshDemoBalance) refreshDemoBalance()
        
        setTimeout(() => {
          setSelectedRecipe(null)
          setMessage("")
          setTxHash("")
          window.location.reload() // Refresh to update balance
        }, 2000)
      } else {
        // Real transaction via MetaMask
        setMessage("Opening MetaMask for payment...")
        
        // Add pending transaction to history
        const txRecord = addTransaction({
          hash: "pending",
          type: "buy",
          status: "pending",
          recipeTitle: selectedRecipe.title,
          amount: selectedRecipe.price,
          from: wallet.address,
          to: selectedRecipe.creator,
          timestamp: Date.now(),
          description: `Purchasing ${selectedRecipe.title} recipe NFT`,
        })

        // Send ETH via MetaMask
        const hash = await sendETH(selectedRecipe.creator, selectedRecipe.price)
        
        // Update transaction with actual hash and status
        updateTransaction(txRecord.id, {
          hash: hash,
          status: "completed",
        })

        setTxHash(hash)
        setMessage(`✅ Purchase successful! Transaction: ${hash.slice(0, 10)}...`)
        
        setTimeout(() => {
          setSelectedRecipe(null)
          setMessage("")
          setTxHash("")
        }, 3000)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Transaction failed"
      
      // Mark transaction as failed
      addTransaction({
        hash: "failed",
        type: "buy",
        status: "failed",
        recipeTitle: selectedRecipe.title,
        amount: selectedRecipe.price,
        from: wallet.address,
        to: selectedRecipe.creator,
        timestamp: Date.now(),
        description: `Failed: ${errorMsg}`,
      })

      setMessage(`❌ ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            creator={recipe.creator}
            price={recipe.price}
            image={recipe.image}
            ingredients={recipe.ingredients}
            difficulty={recipe.difficulty}
            isNFT={recipe.isNFT}
            isFavorited={index % 3 === 0}
            onClick={() => handleRecipeClick(recipe)}
            onBuy={() => handleBuyClick(recipe)}
            onFavorite={() => alert(`${recipe.title} added to favorites!`)}
          />
        ))}
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Recipe NFT</DialogTitle>
            <DialogDescription>Complete your purchase using MetaMask</DialogDescription>
          </DialogHeader>

          {selectedRecipe && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recipe</p>
                <p className="font-semibold">{selectedRecipe.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Creator</p>
                <p className="font-mono text-sm">
                  {selectedRecipe.creator.slice(0, 6)}...{selectedRecipe.creator.slice(-4)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">{selectedRecipe.price} ETH</p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    txHash
                      ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                      : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isProcessing ? "⏳ Processing..." : "🛒 Confirm Purchase"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
