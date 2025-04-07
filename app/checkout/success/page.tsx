"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { CREDIT_PACKAGES } from "@/lib/constants"

export default function CheckoutSuccessPage() {
  const { user, refreshUserData } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const packageId = searchParams.get("package_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [credits, setCredits] = useState(0)
  const [processed, setProcessed] = useState(false)
  const [newTotalCredits, setNewTotalCredits] = useState(0)

  // Use a ref to track if the payment has been processed
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Redirect if missing parameters
    if (!sessionId || !packageId) {
      router.push("/credits")
      return
    }

    // Redirect if no user
    if (!user) {
      router.push("/login")
      return
    }

    // Prevent duplicate processing
    if (hasProcessedRef.current || processed) {
      return
    }

    const completePayment = async () => {
      // Set the ref immediately to prevent concurrent calls
      hasProcessedRef.current = true

      try {
        // Find the selected package
        const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

        if (!selectedPackage) {
          setError("Invalid package selection")
          setLoading(false)
          return
        }

        console.log("Processing payment for package:", selectedPackage)

        // Create a transaction record in Supabase
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            amount: selectedPackage.price,
            credits: selectedPackage.credits,
            paymentIntent: `session_${sessionId}`,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to process transaction")
        }

        const result = await response.json()

        if (result.success) {
          console.log("Transaction created successfully:", result.data)

          // Set state for display
          setCredits(selectedPackage.credits)
          setNewTotalCredits(result.data.newCreditBalance)
          setProcessed(true)

          // Refresh user data to get updated credit balance
          await refreshUserData()
        } else {
          console.error("Failed to create transaction:", result.error)
          throw new Error(result.error || "Failed to process payment")
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        setError(error instanceof Error ? error.message : "An error occurred while processing your payment.")
      } finally {
        setLoading(false)
      }
    }

    completePayment()
  }, [sessionId, user, router, packageId, processed, refreshUserData])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Processing Payment</CardTitle>
            <CardDescription>Please wait while we process your payment...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-native" />
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
          <div className="text-4xl font-bold text-native mb-2">+{credits}</div>
          <p className="text-muted-foreground">Credits added to your account</p>
          <p className="mt-4 font-medium">New balance: {newTotalCredits} credits</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-native hover:bg-native-dark">
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

