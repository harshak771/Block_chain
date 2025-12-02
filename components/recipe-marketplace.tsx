"use client"

import { RecipeCard } from "./recipe-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock marketplace data
const mockRecipes = [
  {
    id: "1",
    title: "Spicy Ramen",
    creator: "0x1234567890abcdef1234567890abcdef12345678",
    price: "0.05",
    ingredients: 12,
  },
  {
    id: "2",
    title: "Truffle Risotto",
    creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    price: "0.08",
    ingredients: 8,
  },
  {
    id: "3",
    title: "Sourdough Bread",
    creator: "0x9876543210fedcba9876543210fedcba98765432",
    price: "0.03",
    ingredients: 4,
  },
  {
    id: "4",
    title: "Sushi Platter",
    creator: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed",
    price: "0.12",
    ingredients: 15,
  },
]

export function RecipeMarketplace() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Recipes</CardTitle>
          <CardDescription>Browse and purchase unique recipe NFTs from talented creators</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link href="/marketplace">
            View Full Marketplace
            <ExternalLink size={16} className="ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
