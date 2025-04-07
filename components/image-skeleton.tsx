import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function ImageSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted animate-pulse-slow flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="w-24 h-5 bg-muted rounded animate-pulse-slow"></div>
          <div className="w-16 h-4 bg-muted rounded animate-pulse-slow"></div>
        </div>
        <div className="w-full h-4 bg-muted rounded mt-2 animate-pulse-slow"></div>
        <div className="w-2/3 h-4 bg-muted rounded mt-1 animate-pulse-slow"></div>
      </CardContent>
    </Card>
  )
}