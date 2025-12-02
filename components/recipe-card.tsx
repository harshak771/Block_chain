"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Award, ShoppingCart, Heart } from "lucide-react"
import { useState } from "react"

interface RecipeCardProps {
  id: string
  title: string
  creator: string
  price?: string
  image?: string
  ingredients: number
  isFavorited?: boolean
  contributors?: number
  difficulty?: "easy" | "medium" | "hard"
  isNFT?: boolean
  onClick?: () => void
  onBuy?: () => void
  onFavorite?: () => void
}

export function RecipeCard({
  id,
  title,
  creator,
  price,
  image,
  ingredients,
  isFavorited = false,
  contributors = 1,
  difficulty,
  isNFT = false,
  onClick,
  onBuy,
  onFavorite,
}: RecipeCardProps) {
  const [favorite, setFavorite] = useState(isFavorited)
  const [imageError, setImageError] = useState(false)

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorite(!favorite)
    onFavorite?.()
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBuy?.()
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-muted overflow-hidden group">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-4xl opacity-30">🍳</div>
          </div>
        )}
        {isNFT && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white gap-1">
              <Award size={12} />
              NFT
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          by {creator.slice(0, 6)}...{creator.slice(-4)}
        </p>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="space-y-2">
          {/* Ingredients & Difficulty */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{ingredients} ingredients</span>
            {difficulty && <Badge className={`text-xs ${getDifficultyColor(difficulty)}`}>{difficulty}</Badge>}
          </div>

          {/* Contributors */}
          {contributors > 1 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={14} />
              <span>{contributors} contributors</span>
            </div>
          )}

          {/* Price */}
          {price && <div className="text-lg font-bold text-primary pt-2">{price} ETH</div>}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-transparent"
          onClick={handleFavoriteClick}
          title="Add to favorites"
        >
          {favorite ? "❤️" : "🤍"}
        </Button>
        {price && (
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleBuyClick}
            title="Buy this recipe"
          >
            <ShoppingCart size={14} className="mr-1" />
            Buy
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-transparent" 
          title="View details"
        >
          📖
        </Button>
      </CardFooter>
    </Card>
  )
}
