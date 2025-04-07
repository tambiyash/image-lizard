import type { CreditPackage, ModelInfo } from "@/types"

export const MODELS: ModelInfo[] = [
  {
    id: "vivid-fast",
    name: "Vivid Fast",
    description: "Versatile AI model optimized for rapid image generation with precise style control",
    creditCost: 1,
    icon: "⚡",
  },
  {
    id: "vivid-sketch",
    name: "Vivid Sketch",
    description: "Lightning-fast AI model specialized in creating detailed concept art, sketches, and illustrations",
    creditCost: 8,
    icon: "✏️",
  },
  {
    id: "vivid-pro",
    name: "Vivid Pro",
    description:
      "Premium AI model delivering ultra-realistic images with exceptional detail and professional-quality results",
    creditCost: 16,
    icon: "✨",
  },
]

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: 5,
  },
  {
    id: "popular",
    name: "Popular",
    credits: 150,
    price: 12,
    popular: true,
  },
  {
    id: "pro",
    name: "Professional",
    credits: 400,
    price: 29,
  },
  {
    id: "unlimited",
    name: "Studio",
    credits: 1000,
    price: 59,
  },
]

