"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelCard } from "@/components/model-card"
import { MODELS } from "@/lib/constants"
import type { ModelType } from "@/types"
import { Sparkles, Loader2, Download, Share2, Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { generateImageWithAI } from "@/lib/image-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

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
  const [progress, setProgress] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

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
      } else if (prompt.trim().length === 0) {
        setError("Please enter a prompt to generate images.")
      }
      return
    }

    setError("")
    setGenerating(true)
    setGeneratedImages([])
    setProgress(0)
    setCurrentImageIndex(0)

    // Create a new AbortController for this generation
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      // Generate images based on the count
      const images = []
      const count = Number.parseInt(imageCount)

      for (let i = 0; i < count; i++) {
        // Check if the operation was aborted
        if (signal.aborted) {
          break
        }

        setCurrentImageIndex(i + 1)

        // Calculate progress
        const progressPerImage = 100 / count
        const baseProgress = i * progressPerImage
        setProgress(baseProgress)

        // Generate the image
        const result = await generateImageWithAI(prompt, selectedModel, autoEnhance)

        if (result.success && result.imageData) {
          images.push(result.imageData)

          // Update progress
          setProgress(baseProgress + progressPerImage)
        } else {
          throw new Error(result.error || "Failed to generate image")
        }
      }

      setGeneratedImages(images)

      // Only update credits if we successfully generated at least one image
      if (images.length > 0) {
        // Calculate actual cost based on how many images were successfully generated
        const actualCost = selectedModelInfo.creditCost * images.length
        await updateCredits(user.credits - actualCost)
      }
    } catch (error) {
      console.error("Error generating images:", error)
      setError(error instanceof Error ? error.message : "Failed to generate images. Please try again.")
    } finally {
      setGenerating(false)
      setProgress(100) // Ensure progress bar completes
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setError("Image generation cancelled.")
      setGenerating(false)
    }
  }

  const handleDownload = (imageData: string, index: number) => {
    // Create a temporary link element
    const link = document.createElement("a")
    link.href = imageData
    link.download = `iguana-image-${Date.now()}-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // For authenticated users, show the dashboard layout
  if (user) {
    return (
      <DashboardLayout title="Image Playground">
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
                disabled={generating}
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
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value as ModelType)}
                    disabled={generating}
                  >
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
                  <Select value={imageCount} onValueChange={setImageCount} disabled={generating}>
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
                <Switch
                  id="auto-enhance"
                  checked={autoEnhance}
                  onCheckedChange={setAutoEnhance}
                  disabled={generating}
                />
                <Label htmlFor="auto-enhance" className="flex items-center gap-1">
                  Auto Enhance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Automatically enhances your prompt with model-specific optimizations for better results.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </div>

            {generating && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    Generating image {currentImageIndex} of {imageCount}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm">
                Cost: <span className="font-medium text-iguana">{totalCost} credits</span>
                {user && <span className="text-muted-foreground ml-2">(You have {user.credits} credits)</span>}
              </div>
              {generating ? (
                <Button variant="destructive" className="w-full sm:w-auto" onClick={handleCancel}>
                  Cancel Generation
                </Button>
              ) : (
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
              )}
            </div>
          </CardContent>
        </Card>

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
                          onClick={() => handleDownload(imageData, index)}
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
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedModelInfo.icon}</span>
                        <span className="text-sm font-medium">{selectedModelInfo.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {autoEnhance ? "Auto-enhanced" : "Standard"}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{prompt}</p>
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
      </DashboardLayout>
    )
  }

  // For unauthenticated users, show a simplified version
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Image Playground</h1>

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
                <Label htmlFor="auto-enhance" className="flex items-center gap-1">
                  Auto Enhance
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Automatically enhances your prompt with model-specific optimizations for better results.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-muted/50">
          <CardHeader>
            <CardTitle>Sign in to generate images</CardTitle>
            <CardDescription>Create an account to get 16 free credits and start generating images.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-iguana hover:bg-iguana-dark w-full sm:w-auto" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

