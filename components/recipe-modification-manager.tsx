"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, Plus, Send } from "lucide-react"
import type { CollaborativeRecipe } from "@/lib/collaboration"

interface ModificationRequest {
  id: string
  proposedBy: string
  title: string
  description: string
  suggestedChanges: string
  status: "pending" | "approved" | "rejected"
  createdAt: number
  votes?: {
    approve: number
    reject: number
  }
}

interface RecipeModificationManagerProps {
  recipe: CollaborativeRecipe
  userAddress?: string
  onModificationRequested?: (request: ModificationRequest) => void
}

export function RecipeModificationManager({
  recipe,
  userAddress,
  onModificationRequested,
}: RecipeModificationManagerProps) {
  const [modifications, setModifications] = useState<ModificationRequest[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    suggestedChanges: "",
  })

  const handleSubmitModification = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userAddress || !newRequest.title || !newRequest.suggestedChanges) return

    const request: ModificationRequest = {
      id: `mod-${Date.now()}`,
      proposedBy: userAddress,
      title: newRequest.title,
      description: newRequest.description,
      suggestedChanges: newRequest.suggestedChanges,
      status: "pending",
      createdAt: Date.now(),
      votes: {
        approve: 0,
        reject: 0,
      },
    }

    setModifications((prev) => [request, ...prev])
    onModificationRequested?.(request)
    setNewRequest({ title: "", description: "", suggestedChanges: "" })
    setShowDialog(false)
  }

  const handleVote = (requestId: string, voteType: "approve" | "reject") => {
    setModifications((prev) =>
      prev.map((mod) => {
        if (mod.id === requestId && mod.votes) {
          if (voteType === "approve") {
            mod.votes.approve += 1
            // Auto-approve if all collaborators approve
            if (mod.votes.approve >= recipe.collaborators.length / 2) {
              mod.status = "approved"
            }
          } else {
            mod.votes.reject += 1
          }
        }
        return mod
      }),
    )
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recipe Modifications</span>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus size={16} />
                  Request Modification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Recipe Modification</DialogTitle>
                  <DialogDescription>Suggest enhancements or modifications to this recipe</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitModification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Modification Title</label>
                    <Input
                      placeholder="e.g., Add vegan alternative"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description (optional)</label>
                    <Input
                      placeholder="Brief description of why this change is beneficial..."
                      value={newRequest.description}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Suggested Changes</label>
                    <Textarea
                      placeholder="Describe the specific changes you're proposing..."
                      value={newRequest.suggestedChanges}
                      onChange={(e) => setNewRequest((prev) => ({ ...prev, suggestedChanges: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send size={16} />
                    Submit Modification Request
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Pending and approved recipe enhancements</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {modifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No modification requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {modifications.map((mod) => (
                <div key={mod.id} className="bg-secondary p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{mod.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Proposed by: {mod.proposedBy.slice(0, 6)}...{mod.proposedBy.slice(-4)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        mod.status === "approved"
                          ? "default"
                          : mod.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {mod.status.charAt(0).toUpperCase() + mod.status.slice(1)}
                    </Badge>
                  </div>

                  {mod.description && <p className="text-sm text-muted-foreground mb-2">{mod.description}</p>}

                  <div className="bg-background p-2 rounded mb-3">
                    <p className="text-sm whitespace-pre-wrap">{mod.suggestedChanges}</p>
                  </div>

                  {mod.status === "pending" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Votes:</span>
                        <Badge variant="outline">✓ {mod.votes?.approve || 0}</Badge>
                        <Badge variant="outline">✗ {mod.votes?.reject || 0}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(mod.id, "approve")}
                          className="gap-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(mod.id, "reject")}
                          className="gap-1 text-red-600"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {mod.status === "approved" && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <AlertCircle size={16} />
                      <span>This modification has been approved and implemented</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
