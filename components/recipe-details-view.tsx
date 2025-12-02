"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CollaborativeRecipe } from "@/lib/collaboration"
import { Clock, Users, History, Award, Flame } from "lucide-react"

interface RecipeDetailsViewProps {
  recipe: CollaborativeRecipe
  onClose?: () => void
}

export function RecipeDetailsView({ recipe, onClose }: RecipeDetailsViewProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [showAttribution, setShowAttribution] = useState(false)

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{recipe.title}</CardTitle>
              <CardDescription>{recipe.description || "A delicious recipe"}</CardDescription>
            </div>
            <Badge
              className={`${getDifficultyColor(recipe.metadata.difficulty)} whitespace-nowrap ml-2`}
            >
              {recipe.metadata.difficulty.charAt(0).toUpperCase() + recipe.metadata.difficulty.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Cook Time</span>
              </div>
              <p className="text-2xl font-bold">{recipe.metadata.cookTime} min</p>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={18} className="text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">Servings</span>
              </div>
              <p className="text-2xl font-bold">{recipe.metadata.servings}</p>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Contributors</span>
              </div>
              <p className="text-2xl font-bold">{recipe.collaborators.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="versions">History</TabsTrigger>
            </TabsList>

            {/* Ingredients */}
            <TabsContent value="ingredients" className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.metadata.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Instructions */}
            <TabsContent value="instructions" className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg space-y-3">
                <h3 className="font-semibold">Instructions</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{recipe.metadata.instructions}</p>
              </div>
            </TabsContent>

            {/* Collaborators */}
            <TabsContent value="collaborators" className="space-y-4">
              <div className="space-y-3">
                {recipe.collaborators.map((collab) => (
                  <div key={collab.address} className="bg-secondary p-4 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm">
                        {collab.address.slice(0, 6)}...{collab.address.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(collab.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{collab.sharePercentage}%</p>
                      <Badge variant="outline" className="mt-2">
                        {collab.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowAttribution(true)} className="w-full gap-2">
                <Award size={16} />
                View Full Attribution
              </Button>
            </TabsContent>

            {/* Version History */}
            <TabsContent value="versions" className="space-y-4">
              <div className="space-y-3">
                {recipe.versions.map((version) => (
                  <div key={version.versionId} className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{version.versionId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Modified by: {version.modifiedBy.slice(0, 6)}...{version.modifiedBy.slice(-4)}
                    </p>
                    <p className="text-sm">{version.changes}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recipe Status</p>
              <Badge variant={recipe.status === "published" ? "default" : "secondary"}>
                {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Created: {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attribution Dialog */}
      <Dialog open={showAttribution} onOpenChange={setShowAttribution}>
        <DialogContent className="max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award size={20} />
              Recipe Attribution
            </DialogTitle>
            <DialogDescription>Full contribution history and recognition</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Original Creator</h4>
              <p className="text-sm font-mono bg-secondary p-3 rounded">
                {recipe.attribution.originalCreator.slice(0, 10)}...{recipe.attribution.originalCreator.slice(-8)}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">All Contributors ({recipe.attribution.contributors.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recipe.attribution.contributors.map((contributor, idx) => (
                  <div key={idx} className="bg-secondary p-3 rounded">
                    <p className="text-sm font-mono">
                      {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{contributor.contribution}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contributor.contributedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
