"use client"

import { RecipeStorageDashboard } from "@/components/recipe-storage-dashboard"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import Link from "next/link"

export default function StoragePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">← Back</Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💾</span>
              <div>
                <h1 className="text-2xl font-bold">IPFS Recipe Storage</h1>
                <p className="text-sm text-muted-foreground">Manage and view your stored recipe metadata</p>
              </div>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          <RecipeStorageDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/50 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RecipeNFT Storage © 2025 - Decentralized recipe metadata storage powered by IPFS</p>
        </div>
      </footer>
    </div>
  )
}
