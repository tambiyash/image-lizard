"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCard } from "@/components/image-card"
import type { Image as ImageType } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function GalleryPage() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchImages = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log("Fetching images for user:", user.id)

      // Fetch images from the API
      const response = await fetch(`/api/images?userId=${user.id}`)
      const result = await response.json()

      console.log("API response:", {
        success: result.success,
        dataLength: result.data ? result.data.length : 0,
        error: result.error || "none",
      })

      if (result.success && result.data) {
        const formattedImages: ImageType[] = result.data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          prompt: item.prompt,
          model: item.model,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        }))

        console.log("Formatted images:", formattedImages.length)
        setImages(formattedImages)
      } else {
        console.error("Error fetching images:", result.error)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [user])

  return (
    <DashboardLayout title="Your Gallery">
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Images</TabsTrigger>
          <TabsTrigger value="vivid-fast">Vivid Fast</TabsTrigger>
          <TabsTrigger value="vivid-sketch">Vivid Sketch</TabsTrigger>
          <TabsTrigger value="vivid-pro">Vivid Pro</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-native" />
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-muted-foreground mb-4">Head over to the Playground to create your first image.</p>
                <Button asChild className="bg-native hover:bg-native-dark">
                  <Link href="/playground">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Image
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="vivid-fast">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images
              .filter((image) => image.model === "vivid-fast")
              .map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="vivid-sketch">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images
              .filter((image) => image.model === "vivid-sketch")
              .map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="vivid-pro">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images
              .filter((image) => image.model === "vivid-pro")
              .map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

