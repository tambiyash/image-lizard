"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { processPayment } from "@/lib/payment-service"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { CREDIT_PACKAGES } from "@/lib/constants"

export default function CheckoutSuccessPage() {
  const { user, updateCredits } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const packageId = searchParams.get("package_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [credits, setCredits] = useState(0)
  const [processed, setProcessed] = useState(false)
  const [newTotalCredits, setNewTotalCredits] = useState(0)

  useEffect(() => {
    if (!sessionId || !user || !packageId) {
      router.push("/credits")
      return
    }

    // Only process the payment once
    if (processed) return

    const completePayment = async () => {
      try {
        // Find the selected package
        const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

        if (!selectedPackage) {
          setError("Invalid package selection")
          setLoading(false)
          return
        }

        const result = await processPayment(sessionId)

        if (result.success) {
          // Calculate new credit total
          const packageCredits = selectedPackage.credits
          const newCredits = user.credits + packageCredits

          // Update user credits
          await updateCredits(newCredits)

          // Set state for display
          setCredits(packageCredits)
          setNewTotalCredits(newCredits)
          setProcessed(true)
        } else {
          setError("Failed to process payment. Please contact support.")
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        setError("An error occurred while processing your payment.")
      } finally {
        setLoading(false)
      }
    }

    completePayment()
  }, [sessionId, user, router, updateCredits, packageId, processed])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Processing Payment</CardTitle>
            <CardDescription>Please wait while we process your payment...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-iguana" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/credits">Return to Credits Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your purchase. Your credits have been added to your account.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="text-4xl font-bold text-iguana mb-2">+{credits}</div>
          <p className="text-muted-foreground">Credits added to your account</p>
          <p className="mt-4 font-medium">New balance: {newTotalCredits} credits</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-iguana hover:bg-iguana-dark">
            <Link href="/playground">Start Creating</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

