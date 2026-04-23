"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TicketPercent,
  LogOut,
  Command,
} from "lucide-react"

type SidebarProps = {
  basePath?: string
  demoMode?: boolean
}

export function Sidebar({
  basePath = "/admin",
  demoMode = false,
}: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: basePath, label: "Dashboard", icon: LayoutDashboard },
    { href: `${basePath}/productos`, label: "Productos", icon: Package },
    { href: `${basePath}/pedidos`, label: "Pedidos", icon: ShoppingCart },
    { href: `${basePath}/clientes`, label: "Clientes", icon: Users },
    { href: `${basePath}/cupones`, label: "Cupones", icon: TicketPercent },
  ]

  return (
    <aside className="hidden w-64 flex-col justify-between border-r border-lc-border bg-lc-card md:flex">
      <div className="p-6">
        <Link href={basePath} className="mb-8 flex items-center gap-2">
          <div className="rounded-lg bg-lc-purple p-1.5">
            <Command size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tighter text-lc-white">
            LilCake{" "}
            <span className="text-xs tracking-normal text-lc-purple">
              {demoMode ? "ADMIN DEMO" : "ADMIN"}
            </span>
          </span>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== basePath && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
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
          })}
        </nav>
      </div>
      <div className="border-t border-lc-border p-6">
        {demoMode ? (
          <Link
            href="/"
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
        )}
      </div>
    </aside>
  )
}
