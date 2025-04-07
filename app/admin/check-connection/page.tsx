"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"

export default function CheckConnectionPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const checkConnection = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/check-connection")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error checking connection:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Check</CardTitle>
          <CardDescription>Check if your application can connect to Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-iguana" />
            </div>
          ) : (
            <>
              {result?.success ? (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Connection Failed</AlertTitle>
                  <AlertDescription>{result?.message || error}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Environment Variables Status:</h3>
                <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto">
                  {result?.envVars ? JSON.stringify(result.envVars, null, 2) : "No data available"}
                </pre>
              </div>

              {result?.error && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Error Details:</h3>
                  <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkConnection} disabled={loading} className="w-full bg-iguana hover:bg-iguana-dark">
            {loading ? "Checking..." : "Check Connection Again"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

