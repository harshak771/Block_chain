"use client"

import { WalletButton } from "@/components/wallet-button"
import { RecipeMintForm } from "@/components/recipe-mint-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MarketplaceBrowser } from "@/components/marketplace-browser"
import { NetworkAlert } from "@/components/network-alert"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Network Warning Banner */}
      <NetworkAlert />
      
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl font-bold">RecipeNFT</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/collaborate">👥 Collab</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">📊 Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/storage">💾 Storage</Link>
            </Button>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-transparent py-16 md:py-24">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-balance">Turn Your Recipes Into Digital Collectibles</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Mint, trade, and monetize your culinary creations as NFTs. Secure your recipes on the blockchain with IPFS
            storage and collaborate with other creators.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="#mint">Start Minting</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-2xl">
                ✨
              </div>
              <h3 className="font-semibold">Create NFTs</h3>
              <p className="text-sm text-muted-foreground">
                Mint your recipes as unique NFTs with metadata stored on IPFS
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-2xl">
                📈
              </div>
              <h3 className="font-semibold">Trade & Sell</h3>
              <p className="text-sm text-muted-foreground">
                List your recipes on the marketplace and earn from your creations
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
              <h3 className="font-semibold">Collaborate</h3>
              <p className="text-sm text-muted-foreground">
                Work with other creators and split royalties automatically
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h3 className="font-semibold">Earn Revenue</h3>
              <p className="text-sm text-muted-foreground">
                Automatic revenue sharing with transparent on-chain tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="mint">Mint Recipe</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" id="marketplace">
              <MarketplaceBrowser />
            </TabsContent>

            <TabsContent value="mint" id="mint">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RecipeMintForm />
                </div>
                <div className="space-y-4">
                  <div className="bg-secondary text-secondary-foreground p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">How It Works</h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-3">
                        <span className="font-bold min-w-6">1.</span>
                        <span>Connect your MetaMask wallet</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold min-w-6">2.</span>
                        <span>Fill in your recipe details</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold min-w-6">3.</span>
                        <span>Upload recipe image (optional)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold min-w-6">4.</span>
                        <span>Confirm transaction in MetaMask</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold min-w-6">5.</span>
                        <span>Your recipe NFT is minted and stored on IPFS</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RecipeNFT © 2025 - Decentralized recipe marketplace powered by blockchain and IPFS</p>
        </div>
      </footer>
    </div>
  )
}
