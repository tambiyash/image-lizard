import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
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

    // Check if tables exist using direct queries instead of pg_execute
    const tables = ["profiles", "images", "transactions"]
    const tableResults = {}

    for (const table of tables) {
      try {
        // Try to get a single row from each table
        const { data, error } = await supabaseAdmin.from(table).select("*").limit(1)

        if (error && !error.message.includes("permission denied")) {
          tableResults[table] = {
            exists: false,
            error: error.message,
          }
        } else {
          tableResults[table] = {
            exists: true,
            rowCount: data ? data.length : 0,
          }
        }
      } catch (err) {
        tableResults[table] = {
          exists: false,
          error: err instanceof Error ? err.message : String(err),
        }
      }
    }

    // Check if trigger function exists using direct SQL
    let triggerExists = false
    let triggerError = null

    try {
      // Use the SQL API instead of pg_execute
      const { data, error } = await supabaseAdmin.sql(`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_proc 
          WHERE proname = 'handle_new_user'
        );
      `)

      if (error) {
        triggerError = error.message
      } else {
        triggerExists = data && data.length > 0 && data[0].exists
      }
    } catch (err) {
      // If SQL API fails, try a different approach
      try {
        // Try using the rpc method if available
        const { data, error } = await supabaseAdmin.rpc("pgql", {
          query: `
            SELECT EXISTS (
              SELECT 1 
              FROM pg_proc 
              WHERE proname = 'handle_new_user'
            );
          `,
        })

        if (error) {
          triggerError = error.message
        } else {
          triggerExists = data && data.length > 0 && data[0].exists
        }
      } catch (rpcErr) {
        triggerError = err instanceof Error ? err.message : String(err)
      }
    }

    // Check database schemas using direct SQL
    let schemas = []
    let schemasError = null

    try {
      // Use the SQL API instead of pg_execute
      const { data, error } = await supabaseAdmin.sql(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT LIKE 'pg_%' 
        AND schema_name != 'information_schema';
      `)

      if (error) {
        schemasError = error.message
      } else {
        schemas = data ? data.map((row) => row.schema_name) : []
      }
    } catch (err) {
      // If SQL API fails, try a different approach
      try {
        // Try using the rpc method if available
        const { data, error } = await supabaseAdmin.rpc("pgql", {
          query: `
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT LIKE 'pg_%' 
            AND schema_name != 'information_schema';
          `,
        })

        if (error) {
          schemasError = error.message
        } else {
          schemas = data ? data.map((row) => row.schema_name) : []
        }
      } catch (rpcErr) {
        schemasError = err instanceof Error ? err.message : String(err)
      }
    }

    // Try direct SQL query to list tables
    let directTableList = []
    let directTableError = null

    try {
      // Use the SQL API instead of pg_execute
      const { data, error } = await supabaseAdmin.sql(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `)

      if (error) {
        directTableError = error.message
      } else {
        directTableList = data || []
      }
    } catch (err) {
      // If SQL API fails, try a different approach
      try {
        // Try using the rpc method if available
        const { data, error } = await supabaseAdmin.rpc("pgql", {
          query: `
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
          `,
        })

        if (error) {
          directTableError = error.message
        } else {
          directTableList = data || []
        }
      } catch (rpcErr) {
        directTableError = err instanceof Error ? err.message : String(err)
      }
    }

    return NextResponse.json({
      success: true,
      tables: tableResults,
      trigger: {
        exists: triggerExists,
        error: triggerError,
      },
      schemas: {
        list: schemas,
        error: schemasError,
      },
      directTableList: {
        tables: directTableList,
        error: directTableError,
      },
      message: "Database diagnostics completed",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error running diagnostics",
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
    })
  }
}

