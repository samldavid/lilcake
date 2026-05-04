import Link from "next/link"
import { ArrowRight, Flame, Layers, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden bg-lc-black pb-16 pt-10 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,60,225,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(233,30,140,0.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(245,245,247,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,247,0.6)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-lc-purple/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[30%] rounded-full bg-lc-pink/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-20 hidden h-20 w-20 rounded-full border border-lc-purple/20 bg-lc-purple/10 blur-sm animate-drift lg:block" />
      <div className="pointer-events-none absolute bottom-24 left-[8%] hidden h-12 w-12 rounded-2xl border border-lc-cyan/20 bg-lc-cyan/10 rotate-12 animate-drift-delayed lg:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-2xl animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lc-border bg-lc-dark px-3 py-1.5 sm:mb-8">
              <Sparkles size={14} className="text-lc-warning sm:size-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lc-gray-light sm:text-sm">
                Nueva Colección Drop #04
              </span>
            </div>

            <h1 className="mb-5 text-4xl font-heading font-extrabold leading-[1.05] tracking-tighter text-lc-white sm:mb-6 sm:text-6xl lg:text-7xl">
              TU ESTILO. <br />
              <span className="gradient-text">TU REGLA.</span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-7 text-lc-gray-light sm:mb-10 sm:text-lg sm:leading-relaxed">
              Descubre la nueva ola del streetwear en Colombia. Piezas
              exclusivas, diseños que rompen el molde y la mejor calidad para
              los que no siguen tendencias, las crean.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/productos"
                className="btn-primary group relative inline-flex items-center justify-center gap-2 overflow-hidden px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
              >
                <span className="button-shine" />
                Ver Colección
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/productos?categoria=zapatos"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
              >
                Sneakers
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-lc-border/50 pt-6 sm:mt-16 sm:gap-6 sm:pt-8">
              <div>
                <p className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
                  500+
                </p>
                <p className="mt-1 text-xs text-lc-gray sm:text-sm">Productos</p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
                  24h
                </p>
                <p className="mt-1 text-xs text-lc-gray sm:text-sm">
                  Envíos rápidos
                </p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
                  100%
                </p>
                <p className="mt-1 text-xs text-lc-gray sm:text-sm">Garantía</p>
              </div>
            </div>

            <div className="mt-10 hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-lc-gray sm:flex">
              <span className="h-px w-10 bg-lc-border" />
              Baja y descubre el drop
              <span className="h-8 w-4 rounded-full border border-lc-border p-1">
                <span className="block h-1.5 w-1.5 rounded-full bg-lc-purple animate-scroll-dot" />
              </span>
            </div>
          </div>

          <div className="hero-collage hidden h-[600px] grid-cols-2 gap-4 animate-fade-in delay-200 lg:grid">
            <div className="mt-12 flex flex-col gap-4">
              <div className="relative h-2/5 overflow-hidden rounded-3xl border border-lc-border bg-lc-dark group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/accesorios.png"
                  alt="Streetwear accesory"
                  className="h-full w-full bg-lc-black object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Layers size={16} className="text-lc-pink" />
                  <span className="text-sm font-bold tracking-wide">ACCESORIOS</span>
                </div>
              </div>
              <div className="relative h-3/5 overflow-hidden rounded-3xl border border-lc-border bg-lc-dark group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/ropa.png"
                  alt="Streetwear clothing"
                  className="h-full w-full bg-lc-black object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Flame size={16} className="text-lc-purple-light" />
                  <span className="text-sm font-bold tracking-wide">PIEZAS ÚNICAS</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative h-3/5 overflow-hidden rounded-3xl border border-lc-border bg-lc-dark group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/zapatos.png"
                  alt="Streetwear model"
                  className="h-full w-full bg-lc-black object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-lc-white/10 px-3 py-1 text-xs text-white backdrop-blur-md">
                  HOT OUTFITS
                </div>
              </div>
              <div className="relative flex h-2/5 flex-col items-center justify-center overflow-hidden rounded-3xl border border-lc-border bg-lc-dark p-8 text-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-lc-purple/20 to-lc-pink/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <h3 className="relative z-10 mb-2 text-2xl font-heading font-bold">
                  ¿Listo para el cambio?
                </h3>
                <p className="relative z-10 text-sm text-lc-gray">
                  Únete a la revolución urbana y lleva tu estilo al siguiente
                  nivel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
