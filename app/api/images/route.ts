import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId, prompt, model, imageUrl } = await request.json()

    // Validate required fields
    if (!userId || !prompt || !model || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Insert the image into the database
    const { data, error } = await supabaseAdmin
      .from("images")
      .insert({
        user_id: userId,
        prompt,
        model,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving image:", error)
      return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in image API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching images:", error)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in image API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

