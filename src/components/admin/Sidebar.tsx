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
  Command
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/productos", label: "Productos", icon: Package },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/clientes", label: "Clientes", icon: Users },
    { href: "/admin/cupones", label: "Cupones", icon: TicketPercent },
  ]

  return (
    <aside className="w-64 flex flex-col justify-between bg-lc-card border-r border-lc-border hidden md:flex">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <div className="bg-lc-purple p-1.5 rounded-lg">
            <Command size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold font-heading tracking-tighter text-lc-white">
            LilCake <span className="text-lc-purple text-xs tracking-normal">ADMIN</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-lc-purple/10 text-lc-purple font-bold border border-lc-purple/20" 
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
      <div className="p-6 border-t border-lc-border">
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center w-full px-4 py-3 text-lc-gray hover:bg-lc-error/10 hover:text-lc-error rounded-xl transition-colors"
        >
          <LogOut size={20} className="mr-3 shrink-0" />
          <span className="font-semibold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
