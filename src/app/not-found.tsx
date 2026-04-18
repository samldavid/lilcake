import { Navbar } from "@/components/storefront/Navbar"
import { Footer } from "@/components/storefront/Footer"
import { CartProvider } from "@/components/CartProvider"
import Link from "next/link"

export default function NotFound() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full flex items-center justify-center bg-lc-black px-4 animate-fade-in">
          <div className="text-center max-w-lg">
            <h1 className="text-9xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-tr from-lc-purple to-lc-pink mb-4 drop-shadow-[0_0_50px_rgba(111,0,255,0.4)]">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-lc-white mb-6">
              Territorio Desconocido
            </h2>
            <p className="text-lc-gray text-lg mb-10">
              Parece que te has salido del mapa. Este enlace está roto, la prenda ya no existe, o nunca estuvo aquí.
            </p>
            <Link 
              href="/" 
              className="bg-lc-purple hover:bg-lc-purple-light text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg shadow-lc-purple/20 inline-flex items-center gap-2"
            >
              Volver al Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
