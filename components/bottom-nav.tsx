"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Warehouse, BarChart3, Package, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function BottomNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    if (!user) return null

    // Seller uchun: Savdo, Mahsulotlar, Qarzlar
    // Boshqalar uchun: Savdo, Ombor, Hisobot/Qarzlar
    const isSeller = user.role === "seller"

    const navItems = isSeller
        ? [
            { label: "Savdo", icon: ShoppingCart, href: "/pos", roles: ["seller"] },
            { label: "Mahsulotlar", icon: Package, href: "/products", roles: ["seller"] },
            { label: "Qarzlar", icon: BookOpen, href: "/debts", roles: ["seller"] },
        ]
        : [
            { label: "Savdo", icon: ShoppingCart, href: "/pos", roles: ["kassir", "admin", "super-admin"] },
            { label: "Ombor", icon: Warehouse, href: "/inventory", roles: ["kassir", "omborchi", "admin", "super-admin"] },
            {
                label: user.role === "kassir" ? "Qarzlar" : "Hisobot",
                icon: user.role === "kassir" ? BookOpen : BarChart3,
                href: user.role === "kassir" ? "/debts" : "/reports",
                roles: ["kassir", "admin", "super-admin"],
            },
        ]

    const filteredItems = navItems.filter((item) =>
        item.roles.includes(user.role as any)
    )

    return (
        <div className="md:hidden fixed bottom-1 left-0 right-0 z-[60] px-4 pb-4">
            <nav className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 flex justify-around items-center h-16 rounded-2xl shadow-2xl overflow-hidden">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-90",
                                isActive ? "text-amber-500" : "text-slate-400"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "animate-in zoom-in duration-300")} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
