"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCollaboration } from "@/hooks/useCollaboration"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InviteCollaboratorProps {
  recipeId: string
  recipeName: string
  userAddress: string | null
}

export function InviteCollaborator({ recipeId, recipeName, userAddress }: InviteCollaboratorProps) {
  const [collaboratorAddress, setCollaboratorAddress] = useState("")
  const [sharePercentage, setSharePercentage] = useState("50")
  const [success, setSuccess] = useState(false)
  const { inviteCollaborator, loading, error } = useCollaboration(userAddress)

  const handleInvite = async () => {
    if (!collaboratorAddress || !userAddress) {
      alert("Please provide a collaborator address")
      return
    }

    try {
      inviteCollaborator(recipeId, collaboratorAddress, Number.parseInt(sharePercentage))
      setSuccess(true)
      setCollaboratorAddress("")
      setSharePercentage("50")

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Invite error:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Collaborator</CardTitle>
        <CardDescription>Add creators to share revenue from {recipeName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <span className="mr-2">❌</span>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <span className="mr-2">✅</span>
            <AlertDescription className="text-green-800">Invitation sent successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="collab-address">Collaborator Address</Label>
          <Input
            id="collab-address"
            placeholder="0x..."
            value={collaboratorAddress}
            onChange={(e) => setCollaboratorAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="share-percentage">Revenue Share (%)</Label>
          <Input
            id="share-percentage"
            type="number"
            min="1"
            max="99"
            value={sharePercentage}
            onChange={(e) => setSharePercentage(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button onClick={handleInvite} disabled={loading} className="w-full">
          {loading ? "⏳ Sending..." : "📤 Send Invitation"}
        </Button>
      </CardContent>
    </Card>
  )
}
