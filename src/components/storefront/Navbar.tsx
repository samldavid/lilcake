"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Menu, Search, ShoppingCart, User, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/CartProvider"
import { StorefrontSearchPanel } from "@/components/storefront/StorefrontSearchPanel"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.toString()
  const currentCategory = searchParams.get("categoria")
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  const navLinks = [
    { href: "/productos?categoria=ropa", label: "Ropa", category: "ropa" },
    { href: "/productos?categoria=zapatos", label: "Zapatos", category: "zapatos" },
    {
      href: "/productos?categoria=accesorios",
      label: "Accesorios",
      category: "accesorios",
    },
  ]

  React.useEffect(() => {
    setIsMenuOpen(false)
    setIsSearchOpen(false)
  }, [currentSearch, pathname])

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-lc-border bg-lc-black/[0.94] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-[72px]">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md border border-transparent p-2.5 text-lc-gray transition-colors hover:border-lc-border hover:text-lc-white"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex flex-1 shrink-0 items-center justify-center md:flex-none md:justify-start">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-lc-border transition-transform group-hover:scale-[1.03] sm:h-11 sm:w-11">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/iconolilcake.png"
                  alt="LilCake Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-heading font-bold text-lc-white sm:text-2xl">
                Lil<span className="text-lc-purple">Cake</span>
              </span>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b border-transparent py-1 text-sm font-semibold transition-colors hover:border-lc-gray-light hover:text-lc-white",
                  pathname === "/productos" && currentCategory === link.category
                    ? "border-lc-purple text-lc-white"
                    : "text-lc-gray-light"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Abrir busqueda"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-lc-gray transition-colors hover:border-lc-border hover:text-lc-white"
            >
              <Search size={22} />
            </button>

            <Link
              href={session ? "/cuenta" : "/login"}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-transparent text-lc-gray transition-colors hover:border-lc-border hover:text-lc-white"
              aria-label="Cuenta"
            >
              {session?.user?.role === "ADMIN" ? (
                <div className="flex items-center gap-2">
                  <User size={22} className="text-lc-purple" />
                  <span className="hidden text-xs font-bold text-lc-purple sm:block">
                    ADMIN
                  </span>
                </div>
              ) : (
                <User size={22} />
              )}
            </Link>

            <Link
              href="/carrito"
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-lc-gray transition-colors hover:border-lc-border hover:text-lc-white"
              aria-label="Carrito"
            >
              <ShoppingCart
                size={22}
                className="transition-transform group-hover:scale-105"
              />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-lc-purple text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-lc-border bg-lc-black animate-slide-down md:hidden">
          <div className="space-y-2 px-4 py-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-4 py-3 text-base font-semibold text-lc-white hover:bg-lc-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <StorefrontSearchPanel open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  )
}
