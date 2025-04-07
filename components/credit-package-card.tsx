"use client"

import type { CreditPackage } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CreditPackageCardProps {
  package: CreditPackage
  onSelect: (pkg: CreditPackage) => void
}

export function CreditPackageCard({ package: pkg, onSelect }: CreditPackageCardProps) {
  return (
    <Card className={cn("flex flex-col transition-all hover:border-iguana", pkg.popular && "border-2 border-iguana")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{pkg.name}</CardTitle>
          {pkg.popular && <Badge className="bg-iguana text-white">Popular</Badge>}
        </div>
        <CardDescription>{pkg.credits} credits</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-3xl font-bold">${pkg.price}</div>
        <div className="text-sm text-muted-foreground mt-1">
          ${((pkg.price / pkg.credits) * 100).toFixed(2)} per 100 credits
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-iguana hover:bg-iguana-dark" onClick={() => onSelect(pkg)}>
          Select
        </Button>
      </CardFooter>
    </Card>
  )
}

