"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageCard } from "@/components/image-card"
import type { Image as ImageType, Transaction } from "@/types"
import { formatDate } from "@/lib/utils"
import { CreditCard, Image, Plus, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentImages, setRecentImages] = useState<ImageType[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentImages = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Fetch images from the API
      const response = await fetch(`/api/images?userId=${user.id}`)
      const result = await response.json()

      if (result.success && result.data) {
        const formattedImages: ImageType[] = result.data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          prompt: item.prompt,
          model: item.model,
          imageUrl: item.image_url,
          createdAt: item.created_at,
        }))

        // Sort by date and take the most recent 4
        const sortedImages = formattedImages
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4)

        setRecentImages(sortedImages)
      } else {
        console.error("Error fetching images:", result.error)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  // For demo purposes, let's create some mock transactions
  // In a real app, you would fetch these from the database
  const fetchTransactions = () => {
    if (user) {
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
  }

  useEffect(() => {
    fetchRecentImages()
    fetchTransactions()
  }, [user])

  return (
    <DashboardLayout title="Dashboard" description={user ? `Welcome back, ${user.fullName || user.email}` : ""}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-iguana">{user?.credits}</div>
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
            <div className="text-3xl font-bold">{loading ? "..." : recentImages.length}</div>
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
            <div className="text-3xl font-bold">{user ? formatDate(user.createdAt) : "-"}</div>
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

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-iguana" />
            </div>
          ) : recentImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentImages.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No images yet</h3>
                <p className="text-muted-foreground mb-4">Head over to the Playground to create your first image.</p>
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
    </DashboardLayout>
  )
}

