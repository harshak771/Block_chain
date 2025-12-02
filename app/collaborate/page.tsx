"use client"

import { useEffect, useState } from "react"
import { WalletButton } from "@/components/wallet-button"
import { CollaborationInvites } from "@/components/collaboration-invites"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CollaboratePage() {
  const [userAddress, setUserAddress] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("walletConnected")
    setUserAddress(stored)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={28} />
              <h1 className="text-2xl font-bold">Collaborations</h1>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <CollaborationInvites userAddress={userAddress} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/50 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RecipeNFT Collaborations © 2025 - Create together, earn together</p>
        </div>
      </footer>
    </div>
  )
}
