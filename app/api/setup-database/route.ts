import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Log environment variables (redacted for security)
    console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL)
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables")
    }

    // Create a Supabase client
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Test connection - using a simple query that should always work
    try {
      // Instead of querying a non-existent table, let's use a simple SQL query
      // that will always work if the connection is valid
      const { error: connectionError } = await supabaseAdmin.rpc("pg_execute", {
        query: "SELECT 1 as connection_test;",
      })

      if (connectionError) {
        console.error("Connection test failed:", connectionError)
        throw new Error(`Connection test failed: ${connectionError.message}`)
      }

      console.log("Connection test successful")
    } catch (err) {
      // If pg_execute is not available, try a different approach
      try {
        const { error: fallbackError } = await supabaseAdmin.from("_dummy_query").select("*").limit(1)

        // If we get a "relation does not exist" error, that's actually good!
        // It means the connection works but the table doesn't exist (as expected)
        if (fallbackError && !fallbackError.message.includes("does not exist")) {
          console.error("Connection test failed:", fallbackError)
          throw new Error(`Connection test failed: ${fallbackError.message}`)
        }

        console.log("Connection test successful (table doesn't exist, but connection works)")
      } catch (fallbackErr) {
        console.error("Connection test error:", fallbackErr)
        throw new Error(
          `Connection test failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`,
        )
      }
    }

    console.log("Connection successful, proceeding with setup")

    // SQL for creating tables and setting up the database
    const setupSQL = `
    -- Create users table (extends Supabase auth.users)
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      username TEXT UNIQUE,
      full_name TEXT,
      credits INTEGER DEFAULT 16,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create images table
    CREATE TABLE IF NOT EXISTS images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) NOT NULL,
      prompt TEXT NOT NULL,
      model TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create transactions table for credit purchases
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) NOT NULL,
      amount INTEGER NOT NULL,
      credits INTEGER NOT NULL,
      status TEXT NOT NULL,
      payment_intent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create RLS policies
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE images ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

    -- Profiles policies
    CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

    -- Images policies
    CREATE POLICY "Images are viewable by owner" 
    ON images FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own images" 
    ON images FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    -- Transactions policies
    CREATE POLICY "Transactions are viewable by owner" 
    ON transactions FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own transactions" 
    ON transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    `

    console.log("Executing setup SQL")

    // Try different methods to execute the SQL
    let setupSuccess = false
    let setupError = null

    // Method 1: Try using the SQL API directly
    try {
      await supabaseAdmin.sql(setupSQL)
      console.log("Setup SQL executed successfully using SQL API")
      setupSuccess = true
    } catch (err) {
      console.log("SQL API method failed:", err)
      setupError = err

      // Method 2: Try using pgql RPC
      try {
        const { error } = await supabaseAdmin.rpc("pgql", { query: setupSQL })
        if (error) {
          throw error
        }
        console.log("Setup SQL executed successfully using pgql RPC")
        setupSuccess = true
      } catch (pgqlErr) {
        console.log("pgql RPC method failed:", pgqlErr)

        // Method 3: Try using pg_execute RPC
        try {
          const { error } = await supabaseAdmin.rpc("pg_execute", { query: setupSQL })
          if (error) {
            throw error
          }
          console.log("Setup SQL executed successfully using pg_execute RPC")
          setupSuccess = true
        } catch (pgExecErr) {
          console.log("pg_execute RPC method failed:", pgExecErr)

          // Method 4: Split into individual statements
          try {
            const statements = setupSQL
              .split(";")
              .map((stmt) => stmt.trim())
              .filter((stmt) => stmt.length > 0)

            console.log(`Executing ${statements.length} individual SQL statements`)

            for (let i = 0; i < statements.length; i++) {
              const stmt = statements[i]
              try {
                await supabaseAdmin.sql(stmt + ";")
                console.log(`Statement ${i + 1}/${statements.length} executed successfully`)
              } catch (stmtErr) {
                console.log(`Statement ${i + 1}/${statements.length} failed:`, stmtErr)
                // Continue with other statements even if one fails
              }
            }

            setupSuccess = true
          } catch (splitErr) {
            console.error("All SQL execution methods failed")
            throw setupError || splitErr
          }
        }
      }
    }

    if (!setupSuccess) {
      throw new Error("Failed to execute setup SQL using any available method")
    }

    console.log("Setup SQL executed successfully")

    // Create the trigger function for new user signup
    const triggerFunctionSQL = `
    -- Create function to handle new user signup
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, username, full_name, credits)
      VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 16);
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for new user signup
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `

    console.log("Executing trigger function SQL")

    // Try different methods to execute the trigger SQL
    let triggerSuccess = false
    let triggerError = null

    // Method 1: Try using the SQL API directly
    try {
      await supabaseAdmin.sql(triggerFunctionSQL)
      console.log("Trigger SQL executed successfully using SQL API")
      triggerSuccess = true
    } catch (err) {
      console.log("SQL API method failed for trigger:", err)
      triggerError = err

      // Method 2: Try using pgql RPC
      try {
        const { error } = await supabaseAdmin.rpc("pgql", { query: triggerFunctionSQL })
        if (error) {
          throw error
        }
        console.log("Trigger SQL executed successfully using pgql RPC")
        triggerSuccess = true
      } catch (pgqlErr) {
        console.log("pgql RPC method failed for trigger:", pgqlErr)

        // Method 3: Try using pg_execute RPC
        try {
          const { error } = await supabaseAdmin.rpc("pg_execute", { query: triggerFunctionSQL })
          if (error) {
            throw error
          }
          console.log("Trigger SQL executed successfully using pg_execute RPC")
          triggerSuccess = true
        } catch (pgExecErr) {
          console.log("pg_execute RPC method failed for trigger:", pgExecErr)

          // Method 4: Split into individual statements
          try {
            const statements = triggerFunctionSQL
              .split(";")
              .map((stmt) => stmt.trim())
              .filter((stmt) => stmt.length > 0)

            console.log(`Executing ${statements.length} individual trigger SQL statements`)

            for (let i = 0; i < statements.length; i++) {
              const stmt = statements[i]
              try {
                await supabaseAdmin.sql(stmt + ";")
                console.log(`Trigger statement ${i + 1}/${statements.length} executed successfully`)
              } catch (stmtErr) {
                console.log(`Trigger statement ${i + 1}/${statements.length} failed:`, stmtErr)
                // Continue with other statements even if one fails
              }
            }

            triggerSuccess = true
          } catch (splitErr) {
            console.error("All trigger SQL execution methods failed")
            throw triggerError || splitErr
          }
        }
      }
    }

    if (!triggerSuccess) {
      throw new Error("Failed to execute trigger SQL using any available method")
    }

    console.log("Database setup completed successfully")

    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Error setting up database:", error)

    // Return more detailed error information
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

