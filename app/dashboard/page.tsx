"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/image-card"
import type { Image as ImageType, Transaction } from "@/types"
import { formatDate } from "@/lib/utils"
import { CreditCard, Image, Plus, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentImages, setRecentImages] = useState<ImageType[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // For demo purposes, let's create some mock data
  useEffect(() => {
    if (user) {
      // Mock recent images
      const mockImages: ImageType[] = Array.from({ length: 4 }).map((_, i) => ({
        id: `mock-${i}`,
        userId: user.id,
        prompt:
          i % 2 === 0
            ? "A beautiful sunset over a calm ocean with palm trees in the foreground"
            : "A futuristic cityscape with flying cars and neon lights at night",
        model: i % 3 === 0 ? "iguana-fast" : i % 3 === 1 ? "iguana-sketch" : "iguana-pro",
        imageUrl: `/placeholder.svg?height=512&width=512`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }))

      setRecentImages(mockImages)

      // Mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: "txn-1",
          userId: user.id,
          amount: 12,
          credits: 150,
          status: "completed",
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          id: "txn-2",
          userId: user.id,
          amount: 5,
          credits: 50,
          status: "completed",
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        },
      ]

      setTransactions(mockTransactions)
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full bg-iguana hover:bg-iguana-dark">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block w-64 border-r">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user.fullName || user.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-iguana">{user.credits}</div>
                <Button asChild variant="link" className="p-0 h-auto text-iguana">
                  <Link href="/credits">
                    <Plus className="h-4 w-4 mr-1" />
                    Buy more credits
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentImages.length}</div>
                <Button asChild variant="link" className="p-0 h-auto">
                  <Link href="/gallery">
                    <Image className="h-4 w-4 mr-1" />
                    View gallery
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatDate(user.createdAt)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Images</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/gallery">View All</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentImages.slice(0, 4).map((image) => (
                  <ImageCard key={image.id} image={image} />
                ))}
              </div>

              {recentImages.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">No images yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Head over to the Playground to create your first image.
                    </p>
                    <Button asChild className="bg-iguana hover:bg-iguana-dark">
                      <Link href="/playground">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Image
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Transactions</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/credits">Buy Credits</Link>
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {transactions.length > 0 ? (
                    <div className="divide-y">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.credits} Credits</p>
                              <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${transaction.amount}</p>
                            <p className="text-xs text-green-500 uppercase">{transaction.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                      <p className="text-muted-foreground mb-4">Purchase credits to generate images.</p>
                      <Button asChild className="bg-iguana hover:bg-iguana-dark">
                        <Link href="/credits">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Buy Credits
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

