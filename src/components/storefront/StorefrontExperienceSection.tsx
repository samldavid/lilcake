"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle, RotateCcw, ShieldCheck, Truck } from "lucide-react"

const confidenceItems = [
  {
    title: "Pago protegido",
    text: "Checkout con pasarelas seguras y validacion del lado servidor.",
    icon: ShieldCheck,
  },
  {
    title: "Envios en Colombia",
    text: "Despachos nacionales con seguimiento del pedido desde tu cuenta.",
    icon: Truck,
  },
  {
    title: "Cambios claros",
    text: "Politicas visibles para que el cliente compre con menos dudas.",
    icon: RotateCcw,
  },
  {
    title: "Compra asistida",
    text: "WhatsApp disponible para resolver talla, disponibilidad o pago.",
    icon: MessageCircle,
  },
]

const revealViewport = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -8% 0px",
} as const

export function StorefrontExperienceSection() {
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
              Compra con confianza
            </p>
            <h2 className="max-w-2xl text-3xl font-heading font-bold leading-tight text-lc-white sm:text-5xl">
              Una tienda que deja que la ropa hable.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-lc-gray-light">
              El nuevo storefront prioriza fotografia, precio, categorias y
              rutas de compra. Menos ruido visual, mas claridad para decidir.
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
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
          >
            <div className="relative overflow-hidden rounded-lg border border-lc-border bg-lc-card">
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[16/11]">
                <Image
                  src="/images/zapatos.png"
                  alt="Sneakers LilCake"
                  fill
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-lc-white">
                  Sneakers y prendas faciles de combinar.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-lc-border bg-lc-card">
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[16/9]">
                <Image
                  src="/images/accesorios.png"
                  alt="Accesorios LilCake"
                  fill
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-lc-white">
                  Accesorios que completan sin competir con el outfit.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
