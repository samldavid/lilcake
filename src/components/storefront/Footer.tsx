import Link from "next/link"
import { ArrowRight, Mail, MapPin } from "lucide-react"

const shopLinks = [
  { href: "/productos?categoria=ropa", label: "Ropa" },
  { href: "/productos?categoria=zapatos", label: "Zapatos" },
  { href: "/productos?categoria=accesorios", label: "Accesorios" },
  { href: "/productos", label: "Todo el catalogo" },
]

const helpLinks = [
  { href: "/ayuda", label: "Envios y entregas" },
  { href: "/ayuda", label: "Cambios y devoluciones" },
  { href: "/ayuda", label: "Guia de tallas" },
  { href: "/ayuda", label: "Contacto" },
]

export function Footer() {
  return (
    <footer className="border-t border-lc-border bg-lc-darker pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-lc-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/iconolilcake.png"
                  alt="LilCake Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-heading font-bold text-lc-white">
                Lil<span className="text-lc-purple">Cake</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-lc-gray-light">
              Ropa urbana, sneakers y accesorios seleccionados para comprar en
              Colombia con una experiencia clara y segura.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-lc-border text-xs font-bold text-lc-gray transition-colors hover:text-lc-white"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-lc-border text-xs font-bold text-lc-gray transition-colors hover:text-lc-white"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="mailto:info@lilcake.co"
                className="rounded-md border border-lc-border p-2 text-lc-gray transition-colors hover:text-lc-white"
                aria-label="Correo"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-heading font-bold text-lc-white">Tienda</h2>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-lc-gray-light transition-colors hover:text-lc-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-heading font-bold text-lc-white">Ayuda</h2>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-lc-gray-light transition-colors hover:text-lc-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-heading font-bold text-lc-white">
              Actualizaciones
            </h2>
            <p className="mb-4 text-sm leading-6 text-lc-gray-light">
              Recibe novedades de catalogo, reposiciones y promociones puntuales.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="input-field h-11 text-sm"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-lc-white text-lc-black transition-colors hover:bg-lc-purple hover:text-white"
                aria-label="Suscribirme"
              >
                <ArrowRight size={18} />
              </button>
            </form>
            <div className="mt-5 flex items-center gap-2 text-sm text-lc-gray">
              <MapPin size={16} />
              Colombia
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-lc-border pt-6 text-sm text-lc-gray md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} LilCake. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <Link href="/privacidad" className="hover:text-lc-white">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-lc-white">
              Terminos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
