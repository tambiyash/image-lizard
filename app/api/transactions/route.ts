import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, amount, credits, paymentIntent = "cash" } = await request.json()

    // Validate required fields
    if (!userId || amount === undefined || credits === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    console.log("Creating transaction for user:", userId)
    console.log("Transaction details:", { amount, credits, paymentIntent })

    // Check if a transaction with this payment intent already exists to prevent duplicates
    if (paymentIntent) {
      const { data: existingTransaction, error: checkError } = await supabaseAdmin
        .from("transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("payment_intent", paymentIntent)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking for existing transaction:", checkError)
      } else if (existingTransaction) {
        console.log("Transaction already exists for this payment intent:", existingTransaction.id)

        // Get the current user credits
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
          return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 })
        }

        // Return success with the existing transaction
        return NextResponse.json({
          success: true,
          data: {
            transaction: existingTransaction,
            newCreditBalance: profile.credits,
            alreadyProcessed: true,
          },
        })
      }
    }

    // Start a transaction to ensure both operations complete or fail together
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        amount,
        credits,
        status: "completed",
        payment_intent: paymentIntent,
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      return NextResponse.json({ success: false, error: "Failed to create transaction" }, { status: 500 })
    }

    console.log("Transaction created successfully with ID:", transaction.id)

    // Update user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 })
    }

    const currentCredits = profile.credits || 0
    const newCredits = currentCredits + credits

    const { error: updateError } = await supabaseAdmin.from("profiles").update({ credits: newCredits }).eq("id", userId)

    if (updateError) {
      console.error("Error updating user credits:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update user credits" }, { status: 500 })
    }

    console.log(`Credits updated for user ${userId}: ${currentCredits} → ${newCredits}`)

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        newCreditBalance: newCredits,
      },
    })
  } catch (error) {
    console.error("Error in transaction API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
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
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
    }

    console.log(`Fetched ${data?.length || 0} transactions for user ${userId}`)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in transaction API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

