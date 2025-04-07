import { NextResponse } from "next/server"
import { experimental_generateImage as generateImage } from "ai"
import { fal } from "@ai-sdk/fal"
import type { ModelType } from "@/types"

// Define model-specific parameters
type ModelParams = {
  [key in ModelType]: {
    modelId: string
    params: Record<string, any>
  }
}

// Map our model types to Fal.ai models with appropriate parameters
const MODEL_CONFIG: ModelParams = {
  "iguana-fast": {
    modelId: "fast-sdxl",
    params: {
      width: 1024,
      height: 1024,
      num_inference_steps: 15,
    },
  },
  "iguana-sketch": {
    modelId: "playground-v25",
    params: {
      width: 1024,
      height: 1024,
      num_inference_steps: 25,
      guidance_scale: 3,
    },
  },
  "iguana-pro": {
    modelId: "stable-diffusion-v35-large",
    params: {
      width: 1024,
      height: 1024,
      num_inference_steps: 50,
      guidance_scale: 4.5,
    },
  },
}

export async function POST(request: Request) {
  try {
    const { prompt, model, autoEnhance } = await request.json()

    // Validate required fields
    if (!prompt || !model) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get model configuration
    const modelConfig = MODEL_CONFIG[model as ModelType]

    // Apply auto-enhance if requested
    let enhancedPrompt = prompt
    if (autoEnhance) {
      const enhancementsByModel: Record<ModelType, string> = {
        "iguana-fast": "high quality, detailed, professional photography, sharp focus",
        "iguana-sketch": "detailed sketch, fine lines, professional illustration, concept art",
        "iguana-pro": "ultra-realistic, cinematic lighting, 8k resolution, professional photography, detailed textures",
      }

      enhancedPrompt = `${prompt} (${enhancementsByModel[model as ModelType]})`
    }

    console.log(`Generating image with model: ${modelConfig.modelId}`)
    console.log(`Prompt: ${enhancedPrompt}`)

    // Generate the image using the AI SDK with Fal.ai
    const { image } = await generateImage({
      model: fal.image(`fal-ai/${modelConfig.modelId}`),
      prompt: enhancedPrompt,
      providerOptions: {
        fal: modelConfig.params,
      },
    })

    // Return the image data
    return NextResponse.json({
      success: true,
      imageData: `data:image/png;base64,${image.base64}`,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 },
    )
  }
}

