import type * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { buildWhatsAppLink } from "@/lib/utils"

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
  { href: "/cuenta", label: "Rastrear pedido" },
]

const trustLinks = [
  { label: "Pago protegido", icon: ShieldCheck },
  { label: "Envios en Colombia", icon: Truck },
  { label: "PSE, Nequi y tarjetas", icon: CreditCard },
]

const paymentLogos = [
  { label: "Wompi", src: "/images/payments/wompi.svg", wide: true },
  { label: "PSE", src: "/images/payments/pse.png" },
  { label: "Nequi", src: "/images/payments/nequi.svg" },
  { label: "Visa", src: "/images/payments/visa.svg" },
  { label: "Mastercard", src: "/images/payments/mastercard.svg" },
]

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M14 8h2V5h-2c-2.3 0-4 1.7-4 4v2H8v3h2v7h3v-7h2.4l.6-3h-3V9c0-.6.4-1 1-1Z" />
    </svg>
  )
}

type SocialIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>

const socialLinks: { href: string; label: string; icon: SocialIcon }[] = [
  { href: "#", label: "Instagram", icon: InstagramIcon },
  { href: "#", label: "Facebook", icon: FacebookIcon },
  { href: "#", label: "TikTok", icon: Music2 },
  { href: buildWhatsAppLink(), label: "WhatsApp", icon: MessageCircle },
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
                Lil<span className="gradient-text">Cake</span>
              </span>
            </Link>
            <p className="text-sm leading-6 text-lc-gray-light">
              Ropa urbana, sneakers y accesorios seleccionados para comprar en
              Colombia con una experiencia clara y segura.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-lc-border bg-lc-black/35 text-lc-gray-light transition-colors hover:border-lc-purple-light/55 hover:bg-lc-purple/16 hover:text-lc-white"
                    aria-label={social.label}
                  >
                    <Icon size={18} className="h-[18px] w-[18px]" />
                  </a>
                )
              })}
              <a
                href="mailto:info@lilcake.co"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-lc-border bg-lc-black/35 text-lc-gray-light transition-colors hover:border-lc-purple-light/55 hover:bg-lc-purple/16 hover:text-lc-white"
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
            <div className="mt-5 space-y-2">
              {trustLinks.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs font-semibold text-lc-gray-light"
                  >
                    <Icon size={15} className="text-lc-purple-light" />
                    {item.label}
                  </div>
                )
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {paymentLogos.map((logo) => (
                <span
                  key={logo.label}
                  className={`inline-flex h-8 items-center justify-center rounded-md border border-white/80 bg-white px-2 ${
                    logo.wide ? "min-w-[76px]" : "min-w-[48px]"
                  }`}
                  title={logo.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.src}
                    alt={logo.label}
                    className="max-h-4 max-w-full object-contain"
                  />
                </span>
              ))}
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
