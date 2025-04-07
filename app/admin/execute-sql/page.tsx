"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function ExecuteSqlPage() {
  const [sql, setSql] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const executeSql = async () => {
    if (!sql.trim()) {
      setError("SQL query is required")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)
    setResults(null)

    try {
      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setResults(data.result)
      } else {
        setError(data.error || data.message || "Failed to execute SQL")
      }
    } catch (error) {
      console.error("Error executing SQL:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Execute SQL</CardTitle>
          <CardDescription>Run SQL queries directly against your database</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>SQL executed successfully</AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <Textarea
              placeholder="Enter SQL query..."
              className="min-h-[200px] font-mono text-sm"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
            />
          </div>

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={executeSql} disabled={loading || !sql.trim()} className="bg-iguana hover:bg-iguana-dark">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute SQL"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

