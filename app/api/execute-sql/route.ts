import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Only allow in development mode for security
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          message: "This endpoint is only available in development mode",
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { sql } = body

    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          message: "SQL query is required",
        },
        { status: 400 },
      )
    }

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: "Missing environment variables",
        envVars: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      })
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Try different methods to execute the SQL
    let result = null
    let error = null

    // Method 1: Try using the SQL API directly
    try {
      const data = await supabaseAdmin.sql(sql)
      result = data
    } catch (err1) {
      console.log("SQL API method failed:", err1)

      // Method 2: Try using pg_execute RPC
      try {
        const { data, error: rpcError } = await supabaseAdmin.rpc("pg_execute", { query: sql })

        if (rpcError) {
          throw rpcError
        }

        result = { data }
      } catch (err2) {
        console.log("pg_execute RPC method failed:", err2)
        error = err2 instanceof Error ? err2.message : String(err2)
      }
    }

    if (result) {
      return NextResponse.json({
        success: true,
        result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to execute SQL",
          error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error executing SQL",
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

