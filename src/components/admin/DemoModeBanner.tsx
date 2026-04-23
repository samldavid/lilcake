"use client"

import Link from "next/link"
import { FlaskConical, ShieldCheck } from "lucide-react"

type DemoModeBannerProps = {
  title?: string
  description?: string
}

export function DemoModeBanner({
  title = "Modo Demo - Ningun cambio sera guardado",
  description = "Explora el panel, prueba formularios y simula acciones sin afectar datos reales ni la operacion productiva.",
}: DemoModeBannerProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-lc-warning/20 bg-lc-card/95 px-6 py-4 backdrop-blur lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl border border-lc-warning/20 bg-lc-warning/10 p-2 text-lc-warning">
            <FlaskConical size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-lc-warning">{title}</p>
            <p className="mt-1 text-sm text-lc-gray-light">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-lc-success/20 bg-lc-success/10 px-3 py-1.5 text-lc-success">
            <ShieldCheck size={14} />
            Sandbox seguro
          </span>
          <Link
            href="/"
            className="rounded-full border border-lc-border px-4 py-2 text-lc-gray transition-colors hover:text-lc-white"
          >
            Ver storefront
          </Link>
        </div>
      </div>
    </div>
  )
}
