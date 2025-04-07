import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId, prompt, model, imageUrl } = await request.json()

    // Validate required fields
    if (!userId || !prompt || !model || !imageUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("Saving image for user:", userId)
    console.log("Image details:", {
      model,
      promptLength: prompt.length,
      imageUrlLength: imageUrl ? imageUrl.length : 0,
    })

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
      return NextResponse.json({ success: false, error: "Failed to save image" }, { status: 500 })
    }

    console.log("Image saved successfully with ID:", data.id)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in image API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabaseAdmin
      .from("images")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching images:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch images" }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} images for user ${userId}`)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in image API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

