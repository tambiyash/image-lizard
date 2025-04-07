"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSetupDatabase = async () => {
    setLoading(true)
    setSuccess(false)
    setError("")
    setErrorDetails("")

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || "Failed to set up database")
        if (data.stack) {
          setErrorDetails(data.stack)
        }
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      setError("An unexpected error occurred")
      if (error instanceof Error) {
        setErrorDetails(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Set up the database schema for the ImageLizard application</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Database setup completed successfully!</AlertDescription>
            </Alert>
          )}
          {error && (
            <div className="mb-4">
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>

              {errorDetails && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Error Details</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <pre className="mt-2 w-full overflow-auto text-xs bg-slate-950 text-slate-50 p-4 rounded-md">
                      {errorDetails}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            This will create the necessary tables, relationships, and security policies for the ImageLizard application.
            This should only be run once when setting up the application.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSetupDatabase}
            disabled={loading || success}
            className="w-full bg-native hover:bg-native-dark"
          >
            {loading ? "Setting up..." : "Set Up Database"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

