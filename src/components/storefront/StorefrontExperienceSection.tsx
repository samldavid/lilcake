"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react"
import {
  HeroProductCarousel,
  type HeroCarouselProduct,
} from "@/components/storefront/HeroProductCarousel"

const confidenceItems = [
  {
    title: "Pago protegido",
    text: "Pasarelas seguras y confirmacion clara antes de finalizar.",
    icon: ShieldCheck,
  },
  {
    title: "Envios en Colombia",
    text: "Despachos nacionales con seguimiento y soporte cercano.",
    icon: Truck,
  },
  {
    title: "Cambios claros",
    text: "Reglas visibles para elegir talla y comprar con menos dudas.",
    icon: RotateCcw,
  },
  {
    title: "Compra asistida",
    text: "WhatsApp disponible para resolver talla, disponibilidad o pago.",
    icon: MessageCircle,
  },
]

const lookbookSlides = [
  {
    image: "/images/storefront-store.jpg",
    title: "Tienda con energia urbana",
    text: "Un ambiente visual que conecta ropa, sneakers y accesorios.",
  },
  {
    image: "/images/ropa.png",
    title: "Prendas con presencia",
    text: "Siluetas faciles de combinar para looks de uso diario.",
  },
  {
    image: "/images/zapatos.png",
    title: "Sneakers que sostienen el outfit",
    text: "Producto visible, proporciones claras y compra directa.",
  },
  {
    image: "/images/accesorios.png",
    title: "Detalles que completan",
    text: "Accesorios, gorras y piezas pequenas con protagonismo justo.",
  },
]

const revealViewport = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -8% 0px",
} as const

type StorefrontExperienceSectionProps = {
  products: HeroCarouselProduct[]
}

function LookbookCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (isPaused || lookbookSlides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % lookbookSlides.length)
    }, 4600)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const activeSlide = lookbookSlides[activeIndex]

  function goToPrevious() {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + lookbookSlides.length) % lookbookSlides.length
    )
  }

  function goToNext() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % lookbookSlides.length)
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-lc-border bg-lc-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-lc-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeSlide.image}
          src={activeSlide.image}
          alt={activeSlide.title}
          className="h-full w-full object-cover object-center text-transparent transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-lc-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xs font-semibold text-lc-purple-light">Lookbook</p>
          <h3 className="mt-1 font-heading text-xl font-bold text-lc-white">
            {activeSlide.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-lc-gray-light">
            {activeSlide.text}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={goToPrevious}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lc-border text-lc-white transition-colors hover:border-lc-purple-light hover:bg-lc-purple/16"
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-1 justify-center gap-2">
          {lookbookSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-gradient-to-r from-lc-purple to-lc-pink"
                  : "w-2.5 bg-white/24 hover:bg-white/45"
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToNext}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lc-border text-lc-white transition-colors hover:border-lc-purple-light hover:bg-lc-purple/16"
          aria-label="Imagen siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export function StorefrontExperienceSection({
  products,
}: StorefrontExperienceSectionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const initial = shouldReduceMotion ? false : { opacity: 0, y: 18 }
  const whileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 }

  return (
    <section className="bg-lc-black py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={initial}
            whileInView={whileInView}
            viewport={revealViewport}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="mb-3 text-sm font-semibold text-lc-purple-light">
              Mira, elige y compra
            </p>
            <h2 className="max-w-2xl text-3xl font-heading font-bold leading-tight text-lc-white sm:text-5xl">
              Producto al frente, compra sin vueltas.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-lc-gray-light">
              Fotos claras, precios visibles y categorias faciles de recorrer.
              Todo esta pensado para que el look se entienda rapido y el pedido
              salga sin friccion.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {confidenceItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.title}
                    initial={initial}
                    whileInView={whileInView}
                    viewport={revealViewport}
                    transition={{
                      duration: 0.45,
                      delay: shouldReduceMotion ? 0 : index * 0.05,
                      ease: "easeOut",
                    }}
                    className="rounded-lg border border-lc-border bg-lc-card p-4"
                  >
                    <Icon size={20} className="text-lc-white" />
                    <h3 className="mt-4 font-heading text-lg font-bold text-lc-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                      {item.text}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"
              >
                Ir al catalogo <ArrowRight size={17} />
              </Link>
              <Link
                href="/ayuda"
                className="btn-secondary inline-flex min-h-12 items-center justify-center px-5 text-sm"
              >
                Ver ayuda
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={initial}
            whileInView={whileInView}
            viewport={revealViewport}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
          >
            <HeroProductCarousel products={products} />
            <LookbookCarousel />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
