export interface RecipeMetadata {
  title: string
  ingredients: string[]
  steps: string[]
  image?: string
  creator: string
  createdAt: number
}

// Mock IPFS upload - replace with actual Pinata/Web3.Storage in production
export async function uploadToIPFS(metadata: RecipeMetadata): Promise<string> {
  try {
    // Simulate IPFS upload delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a mock IPFS hash
    const hash = "QmVxe7D" + Math.random().toString(36).substring(2, 15)
    return hash
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function uploadImageToIPFS(file: File): Promise<string> {
  try {
    // Simulate image upload
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Generate mock image hash
    const imageHash = "QmImage" + Math.random().toString(36).substring(2, 15)
    return imageHash
  } catch (error) {
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function getIPFSUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`
}
