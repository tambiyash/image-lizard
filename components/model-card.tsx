"use client"

import type { ModelInfo } from "@/types"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ModelCardProps {
  model: ModelInfo
  selected?: boolean
  onClick?: () => void
}

export function ModelCard({ model, selected, onClick }: ModelCardProps) {
  return (
    <Card
      className={cn("cursor-pointer transition-all hover:border-iguana", selected && "border-2 border-iguana")}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{model.icon}</span>
            {model.name}
          </CardTitle>
          <Badge variant="outline" className="bg-muted">
            {model.creditCost} credits
          </Badge>
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

