"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DbDiagnosticsPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [setupLoading, setSetupLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/db-diagnostics")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error running diagnostics:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const runSetup = async () => {
    setSetupLoading(true)
    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (data.success) {
        // Re-run diagnostics after setup
        await runDiagnostics()
      } else {
        setError(data.error || "Failed to set up database")
      }
    } catch (error) {
      console.error("Error setting up database:", error)
      setError("An unexpected error occurred during setup")
    } finally {
      setSetupLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const allTablesExist = results?.tables && Object.values(results.tables).every((table: any) => table.exists)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Database Diagnostics</CardTitle>
          <CardDescription>Check the status of your database tables and setup</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-native" />
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Database Tables Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results?.tables &&
                    Object.entries(results.tables).map(([tableName, tableInfo]: [string, any]) => (
                      <Card key={tableName} className={tableInfo.exists ? "border-green-500" : "border-red-500"}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{tableName}</span>
                            {tableInfo.exists ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          {tableInfo.exists ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              Table exists with {tableInfo.rowCount} row(s)
                            </p>
                          ) : (
                            <p className="text-sm text-red-500 mt-1">{tableInfo.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              <Tabs defaultValue="schemas">
                <TabsList>
                  <TabsTrigger value="schemas">Schemas</TabsTrigger>
                  <TabsTrigger value="tables">Direct Table List</TabsTrigger>
                  <TabsTrigger value="trigger">Trigger Function</TabsTrigger>
                </TabsList>

                <TabsContent value="schemas">
                  <Card>
                    <CardHeader>
                      <CardTitle>Database Schemas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results?.schemas?.error ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{results.schemas.error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div>
                          <h4 className="font-medium mb-2">Available Schemas:</h4>
                          <ul className="list-disc pl-5">
                            {results?.schemas?.list?.map((schema: string) => (
                              <li key={schema}>{schema}</li>
                            ))}
                          </ul>
                          {results?.schemas?.list?.length === 0 && (
                            <p className="text-muted-foreground">No schemas found</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tables">
                  <Card>
                    <CardHeader>
                      <CardTitle>Direct Table List</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results?.directTableList?.error ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{results.directTableList.error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div>
                          <h4 className="font-medium mb-2">Tables in Public Schema:</h4>
                          {results?.directTableList?.tables?.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {results.directTableList.tables.map((table: any, index: number) => (
                                <li key={index}>
                                  {table.table_schema}.{table.table_name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">No tables found in public schema</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trigger">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trigger Function</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results?.trigger?.error ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{results.trigger.error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>handle_new_user function:</span>
                          {results?.trigger?.exists ? (
                            <span className="text-green-500 font-medium flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Exists
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" /> Not found
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button onClick={runDiagnostics} disabled={loading} variant="outline" className="w-full sm:w-auto">
            {loading ? "Running..." : "Run Diagnostics Again"}
          </Button>

          <Button
            onClick={runSetup}
            disabled={loading || setupLoading || allTablesExist}
            className="w-full sm:w-auto bg-native hover:bg-native-dark"
          >
            {setupLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Run Database Setup Again"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

