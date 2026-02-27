"use client"

import type React from "react"


import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"

export function NavGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Agar loading bo'lsa yoki login sahifasida bo'lsa, hech narsa qilmaymiz
    if (loading || pathname === "/") return

    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-600">Yuklanyapti...</p>
        </div>
      </div>
    )
  }

  // Login sahifasi uchun Sidebar kerak emas
  if (pathname === "/") {
    return <main className="flex-1 h-screen overflow-auto">{children}</main>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
