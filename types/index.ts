export type User = {
  id: string
  email: string
  username?: string
  fullName?: string
  credits: number
  createdAt: string
}

export type Image = {
  id: string
  userId: string
  prompt: string
  model: ModelType
  imageUrl: string
  createdAt: string
}

export type Transaction = {
  id: string
  userId: string
  amount: number
  credits: number
  status: "pending" | "completed" | "failed"
  paymentIntent?: string
  createdAt: string
}

export type ModelType = "iguana-fast" | "iguana-sketch" | "iguana-pro"

export type ModelInfo = {
  id: ModelType
  name: string
  description: string
  creditCost: number
  icon: string
}

export type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number
  popular?: boolean
}

