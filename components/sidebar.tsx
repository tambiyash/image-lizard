"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Image, Settings, CreditCard, Sparkles } from "lucide-react"

interface SidebarProps {
  className?: string
}

// Define routes in a way that can be exported and shared with Header
export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Playground",
    icon: Sparkles,
    href: "/playground",
  },
  {
    label: "Gallery",
    icon: Image,
    href: "/gallery",
  },
  {
    label: "Buy Credits",
    icon: CreditCard,
    href: "/credits",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main Menu</h2>
          <div className="space-y-1">
            {routes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Button
                  key={route.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("w-full justify-start", isActive && "bg-muted")}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

