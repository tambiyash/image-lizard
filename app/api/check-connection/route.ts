import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Log environment variables (redacted for security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceRoleKey,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
    }

    // Check if required environment variables are present
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required environment variables",
          envVars,
        },
        { status: 500 },
      )
    }

    // Create a Supabase client with anon key (public)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test connection using a simple query that should always work if connection is valid
    let connectionSuccess = false
    let connectionMessage = ""
    let connectionError = null

    // Method 1: Try a simple SQL query
    try {
      const { error } = await supabase.rpc("pg_execute", {
        query: "SELECT 1 as connection_test;",
      })

      if (error) {
        throw error
      }

      connectionSuccess = true
      connectionMessage = "Connection successful using pg_execute"
    } catch (err1) {
      console.log("pg_execute method failed:", err1)

      // Method 2: Try querying a non-existent table
      try {
        const { error } = await supabase.from("_dummy_query").select("*").limit(1)

        // If we get a "relation does not exist" error, that's actually good!
        // It means the connection works but the table doesn't exist (as expected)
        if (error && (error.message.includes("does not exist") || error.code === "PGRST116")) {
          connectionSuccess = true
          connectionMessage = "Connection successful (table doesn't exist, but connection works)"
        } else if (error) {
          connectionError = error
          connectionMessage = `Connection failed: ${error.message}`
        } else {
          connectionSuccess = true
          connectionMessage = "Connection successful"
        }
      } catch (err2) {
        console.log("Dummy query method failed:", err2)
        connectionError = err2 instanceof Error ? err2 : new Error(String(err2))
        connectionMessage = `Connection failed: ${connectionError.message}`
      }
    }

    return NextResponse.json({
      success: connectionSuccess,
      message: connectionMessage,
      envVars,
      error: connectionError
        ? {
            message: connectionError.message || "Unknown error",
            code: connectionError.code || "UNKNOWN",
          }
        : null,
    })
  } catch (error) {
    console.error("Error checking connection:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

