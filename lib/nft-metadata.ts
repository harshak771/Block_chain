/**
 * NFT Metadata Standards for Recipe NFTs
 * Follows ERC721 and ERC1155 metadata standards
 */

export interface NFTMetadata {
  // ERC721 Standard Fields
  name: string
  description: string
  image: string // IPFS URI or external URL
  external_url?: string

  // Recipe-Specific Fields
  attributes: Array<{
    trait_type: string
    value: string | number
  }>

  // Ownership & Attribution
  properties: {
    creator: string
    originalCreator: string
    contributors: Array<{
      address: string
      role: "creator" | "contributor"
      sharePercentage: number
      contribution: string
    }>
  }

  // Recipe Details
  recipe: {
    title: string
    difficulty: "easy" | "medium" | "hard"
    servings: number
    cookTime: number
    ingredients: string[]
    instructions: string
    cuisine?: string
    allergens?: string[]
  }

  // Licensing & Rights
  licensing: {
    license: string // "CC0", "CC-BY", "CC-BY-SA", "Proprietary", etc.
    commercialUse: boolean
    derivativeWorks: boolean
    sharingAllowed: boolean
  }

  // Royalties (EIP-2981 compatible)
  royalties: {
    basisPoints: number // e.g., 500 = 5%
    recipients: Array<{
      address: string
      sharePercentage: number
    }>
  }

  // Metadata
  createdAt: number // Timestamp
  updatedAt: number // Last modification timestamp
  version: string // Semantic versioning
}

export function createNFTMetadata(
  recipeName: string,
  recipeDescription: string,
  imageUri: string,
  creator: string,
  recipe: any,
  contributors: any[] = [],
  royaltyBasisPoints: number = 500, // 5%
): NFTMetadata {
  const allContributors = [
    {
      address: creator,
      role: "creator" as const,
      sharePercentage: 100 - contributors.reduce((sum, c) => sum + c.sharePercentage, 0),
      contribution: "Original recipe creation",
    },
    ...contributors,
  ]

  return {
    name: recipeName,
    description: recipeDescription || `A delicious recipe: ${recipeName}`,
    image: imageUri,
    external_url: `https://recipenft.app/recipe/${recipeName.toLowerCase().replace(/\s+/g, "-")}`,

    attributes: [
      { trait_type: "Difficulty", value: recipe.difficulty },
      { trait_type: "Cooking Time", value: recipe.cookTime },
      { trait_type: "Servings", value: recipe.servings },
      { trait_type: "Ingredients Count", value: recipe.ingredients.length },
      { trait_type: "Contributors", value: allContributors.length },
      { trait_type: "License", value: "CC-BY-SA" },
    ],

    properties: {
      creator,
      originalCreator: creator,
      contributors: allContributors,
    },

    recipe: {
      title: recipeName,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      cookTime: recipe.cookTime,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      allergens: recipe.allergens,
    },

    licensing: {
      license: "CC-BY-SA", // Creative Commons Attribution-ShareAlike
      commercialUse: true,
      derivativeWorks: true, // Allow remixes/modifications
      sharingAllowed: true,
    },

    royalties: {
      basisPoints: royaltyBasisPoints,
      recipients: allContributors.map((c) => ({
        address: c.address,
        sharePercentage: c.sharePercentage,
      })),
    },

    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: "1.0.0",
  }
}

export function validateNFTMetadata(metadata: Partial<NFTMetadata>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!metadata.name) errors.push("Name is required")
  if (!metadata.image) errors.push("Image is required")
  if (!metadata.properties?.creator) errors.push("Creator address is required")
  if (!metadata.recipe) errors.push("Recipe details are required")

  // Validate royalty percentages add up to 100
  if (metadata.royalties?.recipients) {
    const totalPercentage = metadata.royalties.recipients.reduce((sum, r) => sum + r.sharePercentage, 0)
    if (totalPercentage !== 100) {
      errors.push(`Royalty percentages must sum to 100%, got ${totalPercentage}%`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function generateTokenURI(metadata: NFTMetadata, ipfsHash: string): string {
  return `ipfs://${ipfsHash}`
}

/**
 * Generate a standardized filename for IPFS storage
 */
export function generateMetadataFilename(recipeName: string, creator: string): string {
  const timestamp = Date.now()
  const creatorShort = creator.slice(0, 6).toLowerCase()
  const recipeSanitized = recipeName.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30)
  return `recipe-${recipeSanitized}-${creatorShort}-${timestamp}.json`
}
