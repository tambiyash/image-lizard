import type { Image as ImageType } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDate, truncateText } from "@/lib/utils"
import Image from "next/image"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MODELS } from "@/lib/constants"

interface ImageCardProps {
  image: ImageType
}

export function ImageCard({ image }: ImageCardProps) {
  const model = MODELS.find((m) => m.id === image.model)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={image.imageUrl || "/placeholder.svg"}
            alt={truncateText(image.prompt, 50)}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-80 hover:opacity-100">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <span className="text-sm">{model?.icon}</span>
            <span className="text-xs text-muted-foreground">{model?.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(image.createdAt)}</span>
        </div>
        <p className="text-sm">{truncateText(image.prompt, 100)}</p>
      </CardFooter>
    </Card>
  )
}

