"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { cn } from "@/lib/utils"

type CommerceSlide = {
  eyebrow: string
  title: string
  highlight: string
  text: string
  href: string
  cta: string
  image: string
  imageAlt: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  tone: "purple" | "pink" | "green"
  logos?: { label: string; src: string; wide?: boolean }[]
}

const whatsappHref = `https://wa.me/${
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573000000000"
}?text=${encodeURIComponent("Hola, quiero comprar en LilCake y necesito asesoria.")}`

const paymentLogos = [
  { label: "Wompi", src: "/images/payments/wompi.svg", wide: true },
  { label: "PSE", src: "/images/payments/pse.png" },
  { label: "Nequi", src: "/images/payments/nequi.svg" },
  { label: "Visa", src: "/images/payments/visa.svg" },
]

const slides: CommerceSlide[] = [
  {
    eyebrow: "Pagos locales",
    title: "Paga como compras",
    highlight: "en Colombia",
    text: "Wompi, PSE, Nequi y tarjetas en un checkout claro, con el boton de pago protegido por validaciones del servidor.",
    href: "/productos",
    cta: "Ver tienda",
    image:
      "https://images.pexels.com/photos/7007188/pexels-photo-7007188.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Compra online desde celular",
    icon: CreditCard,
    tone: "purple",
    logos: paymentLogos,
  },
  {
    eyebrow: "Envios nacionales",
    title: "Tu pedido sale",
    highlight: "con seguimiento",
    text: "Despachos en Colombia y soporte cercano si necesitas confirmar ciudad, tiempos o estado del envio.",
    href: "/ayuda",
    cta: "Ver ayuda",
    image:
      "https://images.pexels.com/photos/6699402/pexels-photo-6699402.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Entrega de paquete a cliente",
    icon: Truck,
    tone: "green",
  },
  {
    eyebrow: "Asesoria real",
    title: "Elige talla y paga",
    highlight: "sin dudas",
    text: "Si una prenda, talla o metodo de pago no te queda claro, el asesor por WhatsApp te ayuda antes de comprar.",
    href: whatsappHref,
    cta: "Hablar por WhatsApp",
    image:
      "https://images.pexels.com/photos/4914811/pexels-photo-4914811.jpeg?auto=compress&cs=tinysrgb&w=1400",
    imageAlt: "Interior de una tienda de ropa",
    icon: MessageCircle,
    tone: "pink",
  },
]

const toneClasses = {
  purple: {
    chip: "border-lc-purple/35 bg-lc-purple/15 text-lc-purple-light",
    highlight: "bg-lc-purple text-white",
  },
  pink: {
    chip: "border-lc-pink/35 bg-lc-pink/15 text-lc-pink",
    highlight: "bg-lc-pink text-white",
  },
  green: {
    chip: "border-lc-success/35 bg-lc-success/15 text-lc-success",
    highlight: "bg-lc-success text-lc-black",
  },
}

export function CommerceTrustCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const activeSlide = slides[activeIndex]
  const tone = toneClasses[activeSlide.tone]
  const ActiveIcon = activeSlide.icon
  const ctaClassName =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-lc-white px-5 text-sm font-black uppercase text-lc-black transition-colors hover:bg-lc-purple hover:text-white"
  const isExternalCta = activeSlide.href.startsWith("http")

  function goToSlide(nextIndex: number) {
    setActiveIndex((nextIndex + slides.length) % slides.length)
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-white/10 bg-lc-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid min-h-[360px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div
            className={cn(
              "mb-5 inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold uppercase",
              tone.chip
            )}
          >
            <ActiveIcon size={16} />
            {activeSlide.eyebrow}
          </div>

          <h2 className="max-w-2xl text-4xl font-heading font-black leading-[1.02] text-lc-white sm:text-5xl lg:text-6xl">
            {activeSlide.title}{" "}
            <span
              className={cn(
                "box-decoration-clone px-2 leading-[1.12]",
                tone.highlight
              )}
            >
              {activeSlide.highlight}
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-lc-gray-light sm:text-lg">
            {activeSlide.text}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {isExternalCta ? (
              <a
                href={activeSlide.href}
                target="_blank"
                rel="noreferrer"
                className={ctaClassName}
              >
                <ShieldCheck size={17} />
                {activeSlide.cta}
              </a>
            ) : (
              <Link href={activeSlide.href} className={ctaClassName}>
                <ShieldCheck size={17} />
                {activeSlide.cta}
              </Link>
            )}

            {activeSlide.logos ? (
              <div className="flex flex-wrap gap-2">
                {activeSlide.logos.map((logo) => (
                  <span
                    key={logo.label}
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-md border border-white/80 bg-white px-2",
                      logo.wide ? "min-w-[78px]" : "min-w-[48px]"
                    )}
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
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden bg-lc-black lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSlide.image}
            alt={activeSlide.imageAlt}
            className="h-full w-full object-cover opacity-90 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-lc-black/15 to-transparent lg:bg-gradient-to-r lg:from-lc-card lg:via-lc-card/20 lg:to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.eyebrow}
            type="button"
            onClick={() => goToSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === activeIndex
                ? "w-10 bg-lc-white"
                : "w-5 bg-lc-white/35 hover:bg-lc-white/70"
            )}
            aria-label={`Ver ${slide.eyebrow}`}
          />
        ))}
      </div>

      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToSlide(activeIndex - 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-lc-black/55 text-lc-white backdrop-blur transition-colors hover:border-lc-purple hover:text-lc-purple-light"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => goToSlide(activeIndex + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-lc-black/55 text-lc-white backdrop-blur transition-colors hover:border-lc-purple hover:text-lc-purple-light"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
