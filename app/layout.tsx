import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { NavGuard } from "@/components/nav-guard"

const _geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Construction CRM & POS",
  description: "Professional CRM and Point of Sale system for construction materials management",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {/* QZ Tray — USB printer bilan brauzer orqali ishlash uchun */}
        <Script
          src="https://cdn.jsdelivr.net/npm/qz-tray@2.2.3/qz-tray.js"
          strategy="beforeInteractive"
        />
        <NavGuard>
          {children}
        </NavGuard>
        <Analytics />
      </body>
    </html>
  )
}
