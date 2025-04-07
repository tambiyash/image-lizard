"use client"

import Link from "next/link"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { ModelCard } from "@/components/model-card"
import { MODELS } from "@/lib/constants"
import type { ModelType } from "@/types"
import { Sparkles, Loader2, Download, Share2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { generateImageWithAI } from "@/lib/image-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PlaygroundPage() {
  const { user, updateCredits } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelType>("iguana-fast")
  const [autoEnhance, setAutoEnhance] = useState(false)
  const [imageCount, setImageCount] = useState("1")
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState("")

  const selectedModelInfo = MODELS.find((m) => m.id === selectedModel)!
  const totalCost = selectedModelInfo.creditCost * Number.parseInt(imageCount)
  const canGenerate = user && user.credits >= totalCost && prompt.trim().length > 0

  const handleGenerate = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!canGenerate) {
      if (user.credits < totalCost) {
        setError("Not enough credits. Please purchase more credits to continue.")
      }
      return
    }

    setError("")
    setGenerating(true)

    try {
      // Generate images based on the count
      const images = []
      for (let i = 0; i < Number.parseInt(imageCount); i++) {
        const enhancedPrompt = autoEnhance ? `${prompt} (high quality, detailed, professional photography)` : prompt

        const result = await generateImageWithAI(enhancedPrompt, selectedModel)

        if (result.success && result.imageData) {
          images.push(result.imageData)
        } else {
          throw new Error("Failed to generate image")
        }
      }

      setGeneratedImages(images)

      // Update user credits
      updateCredits(user.credits - totalCost)
    } catch (error) {
      console.error("Error generating images:", error)
      setError("Failed to generate images. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block w-64 border-r">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Image Playground</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {MODELS.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                selected={selectedModel === model.id}
                onClick={() => setSelectedModel(model.id)}
              />
            ))}
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-4">
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  className="min-h-[120px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{prompt.length} characters</span>
                  <span>Max 500 characters</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="model">Model</Label>
                  <div className="flex-1">
                    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as ModelType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="count">Images</Label>
                  <div className="flex-1">
                    <Select value={imageCount} onValueChange={setImageCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Image count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 image</SelectItem>
                        <SelectItem value="2">2 images</SelectItem>
                        <SelectItem value="4">4 images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-enhance" checked={autoEnhance} onCheckedChange={setAutoEnhance} />
                  <Label htmlFor="auto-enhance">Auto Enhance</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                  Cost: <span className="font-medium text-iguana">{totalCost} credits</span>
                  {user && <span className="text-muted-foreground ml-2">(You have {user.credits} credits)</span>}
                </div>
                <Button
                  className="bg-iguana hover:bg-iguana-dark w-full sm:w-auto"
                  disabled={!canGenerate || generating}
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {!user && (
            <Card className="mb-8 bg-muted/50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Sign in to generate images</h3>
                <p className="text-muted-foreground mb-4">
                  Create an account to get 16 free credits and start generating images.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="bg-iguana hover:bg-iguana-dark" asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedImages.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Generated Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((imageData, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={imageData || "/placeholder.svg"}
                          alt={`Generated image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!generatedImages.length && !generating && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No generations yet</h3>
              <p className="text-muted-foreground">Start by entering a prompt above and clicking Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

