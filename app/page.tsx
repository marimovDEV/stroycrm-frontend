"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import {
  Warehouse,
  Lock,
  Delete,
  Circle,
  ChevronRight,
  Wifi,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleLogin = useCallback(async (currentPin: string) => {
    if (currentPin.length < 4) return

    setIsSubmitting(true)
    setError(false)

    try {
      const success = await login({ pin: currentPin })
      if (success) {
        window.location.href = "/dashboard"
      } else {
        setError(true)
        setPin("")
        // Reset error after animation
        setTimeout(() => setError(false), 500)
      }
    } catch (e) {
      setError(true)
      setPin("")
    } finally {
      setIsSubmitting(false)
    }
  }, [login])

  const handleKeyPress = (val: string) => {
    if (isSubmitting) return

    if (val === "delete") {
      setPin(prev => prev.slice(0, -1))
      return
    }

    if (pin.length < 6) {
      const newPin = pin + val
      setPin(newPin)
      if (newPin.length >= 4) {
        // Option: Auto-submit on 4/6 digits depending on system
        // For now, let user press Enter/✓ or wait
      }
    }
  }

  const handleAction = () => {
    if (pin.length >= 4) {
      handleLogin(pin)
    }
  }

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleKeyPress(e.key)
      if (e.key === "Backspace") handleKeyPress("delete")
      if (e.key === "Enter") handleAction()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pin, isSubmitting])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 font-sans select-none">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 mb-2">
            <Warehouse className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
            Stroy Material POS
          </h1>
          <p className="text-slate-500 font-medium">Professional Boshqaruv Tizimi</p>
        </div>

        {/* Main Card */}
        <Card className={cn(
          "border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-300",
          error && "animate-shake border-2 border-red-500"
        )}>
          <CardContent className="p-8 space-y-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">PIN kodni kiriting</span>
              </div>

              {/* PIN Dots Display */}
              <div className="flex justify-center gap-4 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-200 border-2",
                      pin.length >= i
                        ? "bg-slate-800 border-slate-800 scale-125"
                        : "bg-transparent border-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-2xl font-bold text-slate-700 transition-colors flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress("delete")}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-red-50 active:bg-red-100 border border-slate-200 text-slate-500 transition-colors flex items-center justify-center"
              >
                <Delete className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-2xl font-bold text-slate-700 transition-colors flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleAction}
                disabled={pin.length < 4 || isSubmitting}
                className={cn(
                  "h-16 rounded-2xl border flex items-center justify-center transition-all",
                  pin.length >= 4
                    ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                    : "bg-slate-100 border-slate-200 text-slate-300 pointer-events-none"
                )}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-600 text-sm font-bold animate-pulse">
                PIN noto&apos;g&apos;ri. Qayta urinib ko&apos;ring.
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleAction}
              disabled={pin.length < 4 || isSubmitting}
              className="w-full h-14 text-lg font-black uppercase tracking-tight rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? "Yuklanmoqda..." : "Tizimga Kirish"}
            </Button>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Online Status */}
          <div className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border",
            isOnline
              ? "bg-green-50 text-green-600 border-green-100"
              : "bg-red-50 text-red-600 border-red-100 animate-pulse"
          )}>
            {isOnline ? (
              <><Wifi className="w-3 h-3" /> Online</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline Mode</>
            )}
          </div>

          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            V 1.0.4 • © 2026 Stroy CRM
          </p>
        </div>
      </div>
    </div>
  )
}
