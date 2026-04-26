"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Command,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  TicketPercent,
  Users,
  X,
} from "lucide-react"

type SidebarProps = {
  basePath?: string
  demoMode?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}

type SidebarLink = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export function Sidebar({
  basePath = "/admin",
  demoMode = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  const links: SidebarLink[] = [
    { href: basePath, label: "Dashboard", icon: LayoutDashboard },
    { href: `${basePath}/productos`, label: "Productos", icon: Package },
    { href: `${basePath}/pedidos`, label: "Pedidos", icon: ShoppingCart },
    { href: `${basePath}/clientes`, label: "Clientes", icon: Users },
    { href: `${basePath}/cupones`, label: "Cupones", icon: TicketPercent },
  ]

  React.useEffect(() => {
    onMobileClose?.()
  }, [pathname, onMobileClose])

  const navLinks = links.map((link) => {
    const isActive =
      pathname === link.href ||
      (link.href !== basePath && pathname.startsWith(link.href))

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => onMobileClose?.()}
        className={`flex items-center rounded-xl px-4 py-3 transition-all ${
          isActive
            ? "border border-lc-purple/20 bg-lc-purple/10 font-bold text-lc-purple"
            : "text-lc-gray hover:bg-lc-darker hover:text-lc-white"
        }`}
      >
        <link.icon size={20} className="mr-3 shrink-0" />
        {link.label}
      </Link>
    )
  })

  const footerAction = demoMode ? (
    <Link
      href="/"
      onClick={() => onMobileClose?.()}
      className="flex w-full items-center rounded-xl px-4 py-3 text-lc-gray transition-colors hover:bg-lc-purple/10 hover:text-lc-purple"
    >
      <LogOut size={20} className="mr-3 shrink-0" />
      <span className="font-semibold">Salir de demo</span>
    </Link>
  ) : (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center rounded-xl px-4 py-3 text-lc-gray transition-colors hover:bg-lc-error/10 hover:text-lc-error"
    >
      <LogOut size={20} className="mr-3 shrink-0" />
      <span className="font-semibold">Cerrar Sesion</span>
    </button>
  )

  const content = (
    <>
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href={basePath}
            onClick={() => onMobileClose?.()}
            className="flex min-w-0 items-center gap-2"
          >
            <div className="rounded-lg bg-lc-purple p-1.5">
              <Command size={20} className="text-white" />
            </div>
            <span className="truncate text-xl font-heading font-bold tracking-tighter text-lc-white">
              LilCake{" "}
              <span className="text-xs tracking-normal text-lc-purple">
                {demoMode ? "ADMIN DEMO" : "ADMIN"}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => onMobileClose?.()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-lc-border text-lc-gray transition-colors hover:text-lc-white md:hidden"
            aria-label="Cerrar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1">{navLinks}</nav>
      </div>

      <div className="border-t border-lc-border p-6">{footerAction}</div>
    </>
  )

  return (
    <>
      <aside className="hidden w-64 flex-col justify-between border-r border-lc-border bg-lc-card md:flex">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => onMobileClose?.()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Cerrar menu administrativo"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[88vw] max-w-xs flex-col justify-between border-r border-lc-border bg-lc-card shadow-2xl animate-slide-down">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  )
}
