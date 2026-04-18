import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "LilCake — Ropa Urbana",
    template: "%s | LilCake",
  },
  description:
    "Tu estilo, tu regla. Ropa urbana, sneakers y accesorios para la nueva generación. 🎂",
  keywords: ["ropa urbana", "streetwear", "sneakers", "accesorios", "colombia", "lilcake"],
  openGraph: {
    title: "LilCake — Ropa Urbana",
    description: "Tu estilo, tu regla. Ropa urbana, sneakers y accesorios.",
    type: "website",
    locale: "es_CO",
  },
}

import { Providers } from "@/components/Providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen bg-lc-black text-lc-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
