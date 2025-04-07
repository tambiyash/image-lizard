import type { CreditPackage, ModelInfo } from "@/types"

export const MODELS: ModelInfo[] = [
  {
    id: "iguana-fast",
    name: "Iguana Fast",
    description: "Versatile AI model optimized for rapid image generation with precise style control",
    creditCost: 4,
    icon: "⚡",
  },
  {
    id: "iguana-sketch",
    name: "Iguana Sketch",
    description: "Lightning-fast AI model specialized in creating detailed concept art, sketches, and illustrations",
    creditCost: 32,
    icon: "✏️",
  },
  {
    id: "iguana-pro",
    name: "Iguana Pro",
    description:
      "Premium AI model delivering ultra-realistic images with exceptional detail and professional-capability",
    creditCost: 63,
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

