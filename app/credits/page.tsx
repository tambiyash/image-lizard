"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { CreditPackageCard } from "@/components/credit-package-card"
import { CREDIT_PACKAGES } from "@/lib/constants"
import type { CreditPackage } from "@/types"
import { createCheckoutSession } from "@/lib/payment-service"
import { Loader2 } from "lucide-react"

const MODELS = [
  {
    id: "model-1",
    name: "Basic Model",
    description: "Generate simple images with this model.",
    creditCost: 1,
    icon: "🖼️",
  },
  {
    id: "model-2",
    name: "Advanced Model",
    description: "Generate high-quality images with more detail.",
    creditCost: 3,
    icon: "✨",
  },
  {
    id: "model-3",
    name: "Realistic Model",
    description: "Generate photorealistic images.",
    creditCost: 5,
    icon: "📸",
  },
]

export default function CreditsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
  }

  const handleCheckout = async () => {
    if (!user || !selectedPackage) return

    setLoading(true)
    try {
      const result = await createCheckoutSession(user.id, selectedPackage)

      if (result.success) {
        // In a real app, this would redirect to Stripe
        // For demo, we'll redirect to a success page
        router.push(result.url)
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block w-64 border-r">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Buy Credits</h1>
          <p className="text-muted-foreground mb-8">Purchase credits to generate more images with our AI models.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackageCard key={pkg.id} package={pkg} onSelect={handleSelectPackage} />
            ))}
          </div>

          {selectedPackage && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Selected: {selectedPackage.name} Package</h3>
                    <p className="text-muted-foreground">
                      {selectedPackage.credits} credits for ${selectedPackage.price}
                    </p>
                  </div>
                  <Button
                    className="bg-iguana hover:bg-iguana-dark w-full md:w-auto"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold">How Credits Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MODELS.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{model.icon}</span>
                      <h3 className="font-medium">{model.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <div className="text-sm font-medium">Cost: {model.creditCost} credits per image</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

