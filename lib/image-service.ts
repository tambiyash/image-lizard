import type { ModelType } from "@/types"
import { experimental_generateImage as generateImage } from "ai"
import { fal } from "@ai-sdk/fal"

export async function generateImageWithAI(prompt: string, model: ModelType) {
  // Map our model types to the actual Fal.ai models
  const modelMap = {
    "iguana-fast": "fal-ai/fast-sdxl",
    "iguana-sketch": "fal-ai/recraft-v3",
    "iguana-pro": "fal-ai/stable-diffusion-3.5-large",
  }

  try {
    const { image } = await generateImage({
      model: fal(modelMap[model]),
      prompt,
      // Add any additional parameters based on the model
    })

    // In a real app, you would upload this to storage
    // For this demo, we'll return the base64 data
    return {
      success: true,
      imageData: image.base64,
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return {
      success: false,
      error: "Failed to generate image",
    }
  }
}

