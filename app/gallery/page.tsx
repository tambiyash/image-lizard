"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { ImageCard } from "@/components/image-card"
import type { Image as ImageType } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

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
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching images:", error)
        return
      }

      if (data) {
        const formattedImages: ImageType[] = data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          prompt: item.prompt,
          model: item.model,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        }))

        setImages(formattedImages)
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

  // For demo purposes, let's create some mock images
  useEffect(() => {
    if (images.length === 0 && !loading) {
      const mockImages: ImageType[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `mock-${i}`,
        userId: user?.id || "mock-user",
        prompt:
          i % 2 === 0
            ? "A beautiful sunset over a calm ocean with palm trees in the foreground"
            : "A futuristic cityscape with flying cars and neon lights at night",
        model: i % 3 === 0 ? "iguana-fast" : i % 3 === 1 ? "iguana-sketch" : "iguana-pro",
        imageUrl: `/placeholder.svg?height=512&width=512`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      setImages(mockImages)
    }
  }, [images.length, loading, user])

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block w-64 border-r">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Gallery</h1>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Images</TabsTrigger>
              <TabsTrigger value="iguana-fast">Iguana Fast</TabsTrigger>
              <TabsTrigger value="iguana-sketch">Iguana Sketch</TabsTrigger>
              <TabsTrigger value="iguana-pro">Iguana Pro</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-iguana" />
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
                    <p className="text-muted-foreground">Head over to the Playground to create your first image.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="iguana-fast">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images
                  .filter((image) => image.model === "iguana-fast")
                  .map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="iguana-sketch">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images
                  .filter((image) => image.model === "iguana-sketch")
                  .map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="iguana-pro">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images
                  .filter((image) => image.model === "iguana-pro")
                  .map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

