"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Warehouse, BookOpen, BarChart3, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { RoleGate } from "@/components/role-gate"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Bosh panel", icon: LayoutDashboard, roles: ["admin", "super-admin"] },
  { href: "/pos", label: "Savdo (POS)", icon: ShoppingCart, roles: ["seller", "kassir", "admin", "super-admin"] },
  { href: "/kassa", label: "Kassa", icon: Banknote, roles: ["admin", "super-admin"] },
  { href: "/inventory", label: "Ombor", icon: Warehouse, roles: ["kassir", "admin", "super-admin"] },
  { href: "/products", label: "Mahsulotlar", icon: Package, roles: ["seller", "kassir", "admin", "super-admin"] },
  { href: "/debts", label: "Qarzdorlik", icon: BookOpen, roles: ["seller", "kassir", "admin", "super-admin"] },
  { href: "/reports", label: "Hisobotlar", icon: BarChart3, roles: ["admin", "super-admin"] },
  { href: "/settings", label: "Sozlamalar", icon: Settings, roles: ["admin", "super-admin"] },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">Stroy CRM</h1>
        <p className="text-xs text-sidebar-accent mt-1">Qurilish Material POS</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 bg-sidebar-accent/10 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-accent font-semibold">Foydalanuvchi</p>
          <p className="text-sm font-bold text-sidebar-foreground">{user.name}</p>
          <p className="text-xs text-sidebar-accent mt-1 capitalize">
            {user.role === "super-admin"
              ? "Super Admin"
              : user.role === "admin"
                ? "Admin"
                : user.role === "kassir"
                  ? "Kassir"
                  : user.role === "omborchi"
                    ? "Omborchi"
                    : "Sotuvchi"}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {NAV_ITEMS.filter(item => !user || item.roles.includes(user.role as any)).map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-transparent"
        >
          <LogOut className="w-5 h-5" />
          Chiqish
        </Button>
      </div>
    </aside >
  )
}
