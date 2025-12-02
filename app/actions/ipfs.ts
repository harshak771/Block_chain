"use server"

export async function uploadRecipeToIPFS(metadata: any): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_API_KEY

    if (!apiKey || !secretKey) {
      console.warn("Pinata API keys not configured, using mock IPFS hash")
      // Generate a mock IPFS hash for development
      const hash = "QmVxe7D" + Math.random().toString(36).substring(2, 15)
      return hash
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
      body: JSON.stringify({ pinataContent: metadata }),
    })

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.IpfsHash
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function uploadImageToIPFS(formData: FormData): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_API_KEY

    if (!apiKey || !secretKey) {
      console.warn("Pinata API keys not configured, using mock image hash")
      // Generate mock image hash for development
      const imageHash = "QmImage" + Math.random().toString(36).substring(2, 15)
      return imageHash
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.IpfsHash
  } catch (error) {
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
