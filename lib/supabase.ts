import { createClient, User, Session } from "@supabase/supabase-js"

export type { User, Session };

// Create a single supabase client for interacting with your database
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Log the environment variables for debugging (redacted for security)
console.log("SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

