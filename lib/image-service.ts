import type { ModelType } from "@/types"

export async function generateImageWithAI(prompt: string, model: ModelType, autoEnhance = false) {
  try {
    // Call our API route to generate the image
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
        autoEnhance,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to generate image")
    }

    return {
      success: true,
      imageData: result.imageData,
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate image",
    }
  }
}

// Function to save generated image to the database
export async function saveGeneratedImage(userId: string, prompt: string, model: ModelType, imageUrl: string) {
  try {
    const { data, error } = await fetch("/api/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        prompt,
        model,
        imageUrl,
      }),
    }).then((res) => res.json())

    if (error) {
      throw new Error(error)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error saving image:", error)
    return { success: false, error: "Failed to save image" }
  }
}

