"use client"

import * as React from "react"
import { Command, Menu } from "lucide-react"
import { Sidebar } from "@/components/admin/Sidebar"

type AdminLayoutShellProps = {
  children: React.ReactNode
  basePath?: string
  demoMode?: boolean
  mobileTitle?: string
  banner?: React.ReactNode
}

export function AdminLayoutShell({
  children,
  basePath = "/admin",
  demoMode = false,
  mobileTitle = "Admin",
  banner,
}: AdminLayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-lc-black font-body text-lc-white selection:bg-lc-purple/30">
      <Sidebar
        basePath={basePath}
        demoMode={demoMode}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-lc-border bg-lc-card/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-lc-purple p-2">
              <Command size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-heading font-bold text-lc-white">
                {mobileTitle}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-lc-gray">
                LilCake
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-lc-border text-lc-gray transition-colors hover:text-lc-white"
            aria-label="Abrir menu administrativo"
          >
            <Menu size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {banner}
          <div className="px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
