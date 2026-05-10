import Link from "next/link"
import { ArrowRight, MessageCircle, ShieldCheck, Truck } from "lucide-react"

const trustItems = [
  { label: "Envios nacionales", icon: Truck },
  { label: "Pagos seguros", icon: ShieldCheck },
  { label: "Asesoria por WhatsApp", icon: MessageCircle },
]

const categoryLinks = [
  { label: "Ropa", href: "/productos?categoria=ropa" },
  { label: "Zapatos", href: "/productos?categoria=zapatos" },
  { label: "Accesorios", href: "/productos?categoria=accesorios" },
]

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[76vh] overflow-hidden bg-lc-black">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ropa.png"
          alt="Prenda urbana destacada de LilCake"
          className="h-full w-full object-cover object-[58%_center] opacity-[0.68] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lc-black via-lc-black/82 to-lc-black/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-lc-black/18 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-end px-4 pb-8 pt-16 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
        <div className="max-w-2xl animate-slide-up">
          <p className="mb-4 inline-flex rounded-md border border-white/12 bg-lc-black/45 px-3 py-1.5 text-xs font-semibold text-lc-gray-light backdrop-blur">
            Drop activo en Colombia
          </p>

          <h1 className="text-5xl font-heading font-bold leading-none text-lc-white sm:text-7xl lg:text-8xl">
            LilCake
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-lc-gray-light sm:text-xl">
            Ropa urbana seleccionada para armar looks con presencia, calidad y
            una compra simple desde cualquier ciudad del pais.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/productos"
              className="btn-primary group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden px-5 text-sm sm:px-6"
            >
              Ver catalogo
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/productos?categoria=ropa"
              className="btn-secondary inline-flex min-h-12 items-center justify-center px-5 text-sm sm:px-6"
            >
              Explorar ropa
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:max-w-3xl">
          {trustItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 text-sm font-medium text-lc-gray-light"
              >
                <Icon size={18} className="text-lc-white" />
                {item.label}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categoryLinks.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="rounded-md border border-white/12 bg-lc-black/42 px-3 py-2 text-sm font-semibold text-lc-white backdrop-blur transition-colors hover:border-lc-white/28 hover:bg-lc-white/8"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
