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
  accent: string
  text: string
  href: string
  cta: string
  image: string
  imageAlt: string
  imagePosition: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  tone: "purple" | "cyan" | "green"
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
    title: "Paga seguro",
    accent: "en Colombia",
    text: "Elige Wompi, PSE, Nequi o tarjeta con un flujo claro, local y facil de completar.",
    href: "/productos",
    cta: "Comprar ahora",
    image:
      "https://images.pexels.com/photos/7007188/pexels-photo-7007188.jpeg?auto=compress&cs=tinysrgb&w=1600",
    imageAlt: "Compra online con bolsas de colores",
    imagePosition: "68% 50%",
    icon: CreditCard,
    tone: "purple",
    logos: paymentLogos,
  },
  {
    eyebrow: "Envios nacionales",
    title: "Recibe tu pedido",
    accent: "con seguimiento",
    text: "Despachamos a Colombia con datos claros de envio y soporte si necesitas revisar ciudad, tiempos o estado.",
    href: "/ayuda",
    cta: "Ver envios",
    image:
      "https://images.pexels.com/photos/13443801/pexels-photo-13443801.jpeg?auto=compress&cs=tinysrgb&w=1600",
    imageAlt: "Entrega de paquete a domicilio",
    imagePosition: "58% 50%",
    icon: Truck,
    tone: "cyan",
  },
  {
    eyebrow: "Asesoria real",
    title: "Compra con ayuda",
    accent: "por WhatsApp",
    text: "Te acompanamos para confirmar talla, disponibilidad o metodo de pago antes de cerrar tu compra.",
    href: whatsappHref,
    cta: "Hablar por WhatsApp",
    image: "/images/storefront-store.jpg",
    imageAlt: "Interior de tienda urbana con sneakers y ropa",
    imagePosition: "68% 50%",
    icon: MessageCircle,
    tone: "green",
  },
]

const toneClasses = {
  purple: {
    chip: "border-lc-purple/35 bg-lc-purple/15 text-lc-purple-light",
    accent: "text-lc-purple-light",
  },
  cyan: {
    chip: "border-lc-cyan/35 bg-lc-cyan/15 text-lc-cyan",
    accent: "text-lc-cyan",
  },
  green: {
    chip: "border-lc-success/35 bg-lc-success/15 text-lc-success",
    accent: "text-lc-success",
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
      data-trust-carousel
      className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-lc-card sm:min-h-[430px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-lc-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.image}
          alt={activeSlide.imageAlt}
          className="h-full w-full object-cover opacity-95"
          style={{ objectPosition: activeSlide.imagePosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-lc-black/70 to-lc-black/15 sm:bg-gradient-to-r sm:from-lc-card sm:via-lc-card/88 sm:to-lc-card/10" />
        <div className="absolute inset-y-0 left-0 hidden w-[52%] bg-lc-card/70 sm:block" />
      </div>

      <div className="relative z-10 flex min-h-[520px] items-center px-5 py-10 sm:min-h-[430px] sm:px-8 lg:px-10">
        <div className="max-w-[620px]">
          <div
            className={cn(
              "mb-5 inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold uppercase",
              tone.chip
            )}
          >
            <ActiveIcon size={16} />
            {activeSlide.eyebrow}
          </div>

          <h2 className="text-4xl font-heading font-black leading-[1.05] text-lc-white sm:text-5xl lg:text-[58px]">
            {activeSlide.title}
            <span className={cn("block", tone.accent)}>
              {activeSlide.accent}
            </span>
          </h2>

          <p className="mt-5 max-w-[560px] text-base leading-7 text-lc-gray-light sm:text-lg">
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
