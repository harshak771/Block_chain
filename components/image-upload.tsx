"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string | ArrayBuffer) => void
  preview?: string | ArrayBuffer | null
  onPreviewChange?: (preview: string | ArrayBuffer | null) => void
}

export function ImageUpload({ onImageUpload, preview, onPreviewChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Create local preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result
        if (imageUrl) {
          onPreviewChange?.(imageUrl)
          onImageUpload(imageUrl)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Failed to process image")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onPreviewChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Recipe Image
        </CardTitle>
        <CardDescription>Upload a photo of your recipe (max 5MB)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview ? (
          <div className="relative group">
            <img
              src={typeof preview === "string" ? preview : URL.createObjectURL(new Blob([preview as ArrayBuffer]))}
              alt="Recipe preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload recipe image</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p>
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!preview && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Select Image"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
