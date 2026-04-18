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
        <Navbar />
        <main className="flex-1 w-full bg-lc-black">
          {children}
        </main>
        <Footer />
        <WhatsAppCTA />
      </div>
    </CartProvider>
  )
}
