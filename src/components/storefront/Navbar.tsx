"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, User, Search, Menu, X } from "lucide-react"
import { useCart } from "@/components/CartProvider"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { StorefrontSearchPanel } from "@/components/storefront/StorefrontSearchPanel"

export function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  const navLinks = [
    { href: "/productos?categoria=ropa", label: "Ropa" },
    { href: "/productos?categoria=zapatos", label: "Zapatos" },
    { href: "/productos?categoria=accesorios", label: "Accesorios" },
  ]

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-lc-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-lc-gray hover:text-lc-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center w-14 h-14 rounded-xl border border-lc-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/iconolilcake.png" alt="LilCake Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold font-heading tracking-tighter text-lc-white">
                Lil<span className="text-lc-purple">Cake</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-lc-purple",
                  pathname.includes(link.href) ? "text-lc-purple" : "text-lc-gray-light"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Abrir búsqueda"
              className="text-lc-gray hover:text-lc-white transition-colors"
            >
              <Search size={22} />
            </button>
            
            <Link 
              href={session ? "/cuenta" : "/login"} 
              className="text-lc-gray hover:text-lc-white transition-colors"
            >
              {session?.user?.role === "ADMIN" ? (
                <div className="flex items-center gap-2">
                   <User size={22} className="text-lc-purple" />
                   <span className="text-xs font-bold text-lc-purple hidden sm:block">ADMIN</span>
                </div>
              ) : (
                <User size={22} />
              )}
            </Link>
            
            <Link href="/carrito" className="text-lc-gray hover:text-lc-white transition-colors relative group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-lc-pink text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(233,30,140,0.5)]">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-lc-border animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-lc-white hover:bg-lc-dark/50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <StorefrontSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </nav>
  )
}
