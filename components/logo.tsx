import { cn } from "@/lib/utils"
import { Leaf } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Leaf className="h-6 w-6 text-native" />
      <span className="font-bold text-xl">
        Image<span className="text-native">Vivid</span>
      </span>
    </Link>
  )
}

