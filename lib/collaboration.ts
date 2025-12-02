export interface Collaborator {
  address: string
  name?: string
  sharePercentage: number
  joinedAt: number
  role: "creator" | "contributor"
}

export interface RecipeVersion {
  versionId: string
  timestamp: number
  modifiedBy: string
  changes: string
  metadata: {
    ingredients: string[]
    instructions: string
    difficulty: "easy" | "medium" | "hard"
    servings: number
    cookTime: number
  }
}

export interface CollaborativeRecipe {
  id: string
  title: string
  description: string
  collaborators: Collaborator[]
  owner: string
  createdAt: number
  status: "draft" | "published" | "completed"
  metadata: {
    ingredients: string[]
    instructions: string
    difficulty: "easy" | "medium" | "hard"
    servings: number
    cookTime: number
  }
  versions: RecipeVersion[] // Track recipe modifications
  attribution: {
    originalCreator: string
    contributors: Array<{
      address: string
      contribution: string
      contributedAt: number
    }>
  }
}

export interface CollaborationInvite {
  id: string
  recipeId: string
  recipeName: string
  invitedBy: string
  invitedAddress: string
  sharePercentage: number
  createdAt: number
  status: "pending" | "accepted" | "declined"
  expiresAt: number
}

export interface RevenueShare {
  recipeId: string
  collaboratorAddress: string
  totalEarnings: string
  lastPayout: number
  payoutHistory: Array<{
    amount: string
    date: number
    saleId: string
  }>
}

const COLLAB_RECIPES_KEY = "recipeNFT:collaboration:recipes"
const INVITES_KEY = "recipeNFT:collaboration:invites"
const REVENUE_SHARES_KEY = "recipeNFT:collaboration:revenue"

export function getCollaborativeRecipes(): CollaborativeRecipe[] {
  try {
    const stored = localStorage.getItem(COLLAB_RECIPES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveCollaborativeRecipes(recipes: CollaborativeRecipe[]): void {
  localStorage.setItem(COLLAB_RECIPES_KEY, JSON.stringify(recipes))
}

export function createCollaborativeRecipe(
  title: string,
  owner: string,
  metadata: CollaborativeRecipe["metadata"],
): CollaborativeRecipe {
  return {
    id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description: "",
    owner,
    collaborators: [{ address: owner, sharePercentage: 100, joinedAt: Date.now(), role: "creator" }],
    createdAt: Date.now(),
    status: "draft",
    metadata,
    versions: [
      {
        versionId: `v1-${Date.now()}`,
        timestamp: Date.now(),
        modifiedBy: owner,
        changes: "Initial version",
        metadata,
      },
    ],
    attribution: {
      originalCreator: owner,
      contributors: [
        {
          address: owner,
          contribution: "Created recipe",
          contributedAt: Date.now(),
        },
      ],
    },
  }
}

export function addCollaborativeRecipe(recipe: CollaborativeRecipe): void {
  const recipes = getCollaborativeRecipes()
  recipes.push(recipe)
  saveCollaborativeRecipes(recipes)
}

export function getPendingInvites(userAddress: string): CollaborationInvite[] {
  try {
    const stored = localStorage.getItem(INVITES_KEY)
    const allInvites: CollaborationInvite[] = stored ? JSON.parse(stored) : []
    return allInvites.filter((i) => i.invitedAddress === userAddress && i.status === "pending")
  } catch {
    return []
  }
}

export function createInvite(
  recipeId: string,
  recipeName: string,
  invitedBy: string,
  invitedAddress: string,
  sharePercentage: number,
): CollaborationInvite {
  return {
    id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    recipeId,
    recipeName,
    invitedBy,
    invitedAddress,
    sharePercentage,
    createdAt: Date.now(),
    status: "pending",
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }
}

export function saveInvite(invite: CollaborationInvite): void {
  const invites = getPendingInvites(invite.invitedAddress) || []
  const stored = localStorage.getItem(INVITES_KEY)
  const allInvites: CollaborationInvite[] = stored ? JSON.parse(stored) : []
  allInvites.push(invite)
  localStorage.setItem(INVITES_KEY, JSON.stringify(allInvites))
}

export function acceptInvite(inviteId: string, userAddress: string): void {
  const stored = localStorage.getItem(INVITES_KEY)
  const allInvites: CollaborationInvite[] = stored ? JSON.parse(stored) : []

  const invite = allInvites.find((i) => i.id === inviteId)
  if (!invite) return

  invite.status = "accepted"

  // Add user as collaborator to the recipe
  const recipes = getCollaborativeRecipes()
  const recipe = recipes.find((r) => r.id === invite.recipeId)
  if (recipe) {
    recipe.collaborators.push({
      address: userAddress,
      sharePercentage: invite.sharePercentage,
      joinedAt: Date.now(),
      role: "contributor",
    })
    // Normalize percentages
    const total = recipe.collaborators.reduce((sum, c) => sum + c.sharePercentage, 0)
    recipe.collaborators.forEach((c) => {
      c.sharePercentage = Math.round((c.sharePercentage / total) * 100)
    })
    saveCollaborativeRecipes(recipes)
  }

  localStorage.setItem(INVITES_KEY, JSON.stringify(allInvites))
}

export function declineInvite(inviteId: string): void {
  const stored = localStorage.getItem(INVITES_KEY)
  const allInvites: CollaborationInvite[] = stored ? JSON.parse(stored) : []

  const invite = allInvites.find((i) => i.id === inviteId)
  if (invite) {
    invite.status = "declined"
  }

  localStorage.setItem(INVITES_KEY, JSON.stringify(allInvites))
}

export function getRevenueShare(recipeId: string, collaboratorAddress: string): RevenueShare {
  try {
    const stored = localStorage.getItem(REVENUE_SHARES_KEY)
    const allShares: RevenueShare[] = stored ? JSON.parse(stored) : []
    return (
      allShares.find((s) => s.recipeId === recipeId && s.collaboratorAddress === collaboratorAddress) || {
        recipeId,
        collaboratorAddress,
        totalEarnings: "0",
        lastPayout: 0,
        payoutHistory: [],
      }
    )
  } catch {
    return {
      recipeId,
      collaboratorAddress,
      totalEarnings: "0",
      lastPayout: 0,
      payoutHistory: [],
    }
  }
}

export function recordSaleRevenue(recipeId: string, saleAmount: string, collaborators: Collaborator[]): void {
  const stored = localStorage.getItem(REVENUE_SHARES_KEY)
  const allShares: RevenueShare[] = stored ? JSON.parse(stored) : []

  collaborators.forEach((collab) => {
    let share = allShares.find((s) => s.recipeId === recipeId && s.collaboratorAddress === collab.address)
    if (!share) {
      share = {
        recipeId,
        collaboratorAddress: collab.address,
        totalEarnings: "0",
        lastPayout: Date.now(),
        payoutHistory: [],
      }
      allShares.push(share)
    }

    const earnings = (Number.parseFloat(saleAmount) * collab.sharePercentage) / 100
    share.totalEarnings = (Number.parseFloat(share.totalEarnings) + earnings).toFixed(4)
    share.lastPayout = Date.now()
    share.payoutHistory.push({
      amount: earnings.toFixed(4),
      date: Date.now(),
      saleId: `sale-${Date.now()}`,
    })
  })

  localStorage.setItem(REVENUE_SHARES_KEY, JSON.stringify(allShares))
}

export function updateRecipeVersion(
  recipeId: string,
  modifiedBy: string,
  changes: string,
  newMetadata: CollaborativeRecipe["metadata"],
): void {
  const recipes = getCollaborativeRecipes()
  const recipe = recipes.find((r) => r.id === recipeId)
  
  if (recipe) {
    const versionNumber = recipe.versions.length + 1
    const newVersion: RecipeVersion = {
      versionId: `v${versionNumber}-${Date.now()}`,
      timestamp: Date.now(),
      modifiedBy,
      changes,
      metadata: newMetadata,
    }
    
    recipe.versions.push(newVersion)
    recipe.metadata = newMetadata
    recipe.attribution.contributors.push({
      address: modifiedBy,
      contribution: changes,
      contributedAt: Date.now(),
    })
    
    saveCollaborativeRecipes(recipes)
  }
}

export function getRecipeHistory(recipeId: string): RecipeVersion[] {
  const recipes = getCollaborativeRecipes()
  const recipe = recipes.find((r) => r.id === recipeId)
  return recipe?.versions || []
}

export function getRecipeAttribution(recipeId: string): CollaborativeRecipe["attribution"] | null {
  const recipes = getCollaborativeRecipes()
  const recipe = recipes.find((r) => r.id === recipeId)
  return recipe?.attribution || null
}
