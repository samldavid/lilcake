import { Suspense } from "react"
import { Navbar } from "@/components/storefront/Navbar"
import { Footer } from "@/components/storefront/Footer"
import { WhatsAppCTA } from "@/components/WhatsAppCTA"
import { CartProvider } from "@/components/CartProvider"

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Suspense
          fallback={
            <div className="sticky top-0 z-40 h-16 w-full border-b border-lc-border bg-lc-black/[0.94] sm:h-[72px]" />
          }
        >
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full bg-lc-black">
          {children}
        </main>
        <Footer />
        <WhatsAppCTA />
      </div>
    </CartProvider>
  )
}
