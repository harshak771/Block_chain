"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCollaboration } from "@/hooks/useCollaboration"
import { format } from "date-fns"

interface CollaborationInvitesProps {
  userAddress: string | null
}

export function CollaborationInvites({ userAddress }: CollaborationInvitesProps) {
  const { invites, respondToInvite } = useCollaboration(userAddress)

  if (invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Invites</CardTitle>
          <CardDescription>Invitations to collaborate on recipes</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No pending invitations</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Invites</CardTitle>
        <CardDescription>{invites.length} pending invitation(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => (
          <div key={invite.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{invite.recipeName}</p>
                <p className="text-sm text-muted-foreground">
                  Invited by {invite.invitedBy.slice(0, 6)}...{invite.invitedBy.slice(-4)}
                </p>
              </div>
              <Badge>{invite.sharePercentage}% share</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Expires {format(new Date(invite.expiresAt), "MMM dd, yyyy")}
            </p>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => respondToInvite(invite.id, true)} className="flex-1">
                ✅ Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => respondToInvite(invite.id, false)} className="flex-1">
                ❌ Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
