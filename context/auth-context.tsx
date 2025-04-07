"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateCredits: (newCredits: number) => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Exception fetching user profile:", error)
      return null
    }
  }

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      console.log("Refreshing user data...")

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session during refresh:", sessionError)
        return
      }

      if (!session) {
        console.log("No session found during refresh")
        return
      }

      console.log("Session found during refresh:", session.user.id)

      const profile = await fetchUserProfile(session.user.id)

      if (profile) {
        console.log("Profile found during refresh:", profile)
        console.log("Current credits:", profile.credits)

        setUser({
          id: profile.id,
          email: session.user.email!,
          username: profile.username,
          fullName: profile.full_name,
          credits: profile.credits,
          createdAt: profile.created_at,
        })
        console.log("User profile refreshed:", profile.id)
      } else {
        console.error("No profile found for user during refresh:", session.user.id)
      }
    } catch (error) {
      console.error("Error in refreshUserData:", error)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setLoading(false)
          return
        }

        if (session) {
          console.log("Session found:", session.user.id)

          // Fetch the user profile
          const profile = await fetchUserProfile(session.user.id)

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email!,
              username: profile.username,
              fullName: profile.full_name,
              credits: profile.credits,
              createdAt: profile.created_at,
            })
            console.log("User profile loaded:", profile.id)
          } else {
            console.error("No profile found for user:", session.user.id)
          }
        } else {
          console.log("No session found")
        }
      } catch (error) {
        console.error("Error in fetchUser:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session) {
        // Fetch the user profile
        const profile = await fetchUserProfile(session.user.id)

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            username: profile.username,
            fullName: profile.full_name,
            credits: profile.credits,
            createdAt: profile.created_at,
          })
          console.log("User profile loaded after sign in:", profile.id)
        } else {
          console.error("No profile found for user after sign in:", session.user.id)

          // Wait a moment and try again - the trigger might need time to create the profile
          setTimeout(async () => {
            const retryProfile = await fetchUserProfile(session.user.id)
            if (retryProfile) {
              setUser({
                id: retryProfile.id,
                email: session.user.email!,
                username: retryProfile.username,
                fullName: retryProfile.full_name,
                credits: retryProfile.credits,
                createdAt: retryProfile.created_at,
              })
              console.log("User profile loaded after retry:", retryProfile.id)
            } else {
              console.error("Still no profile found after retry")
            }
          }, 2000)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        console.log("User signed out")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error("Sign in error:", error)
      throw error
    }

    console.log("Signed in successfully:", data.user?.id)
    return data
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      throw error
    }

    console.log("Signed up successfully:", data.user?.id)
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      throw error
    }

    console.log("Signed out successfully")
  }

  const updateCredits = async (newCredits: number): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id)

      if (error) {
        console.error("Error updating credits:", error)
        throw error
      }

      // Only update the local state after successful DB update
      setUser({ ...user, credits: newCredits })
      console.log("Credits updated successfully:", newCredits)

      return true
    } catch (error) {
      console.error("Failed to update credits:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateCredits, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

