"use client"

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Sparkles, Truck } from "lucide-react"

const experienceSteps = [
  {
    step: "01",
    title: "Descubre el drop",
    text: "Productos destacados, categorias y fotos con movimiento suave para que la exploracion se sienta viva.",
    accent: "from-lc-purple/35 via-lc-purple/10 to-transparent",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Encuentra la pieza",
    text: "Cards con entrada escalonada, hover mas premium y jerarquia clara para precio, categoria y novedades.",
    accent: "from-lc-pink/35 via-lc-pink/10 to-transparent",
    icon: CheckCircle2,
  },
  {
    step: "03",
    title: "Compra con confianza",
    text: "El flujo mantiene Wompi, Stripe y asesoria por WhatsApp sin tocar la logica segura del checkout.",
    accent: "from-lc-cyan/30 via-lc-cyan/10 to-transparent",
    icon: Truck,
  },
] as const

export function StorefrontExperienceSection() {
  const shouldReduceMotion = useReducedMotion()

  const sectionInitial = shouldReduceMotion ? false : { opacity: 0, y: 24 }
  const sectionVisible = shouldReduceMotion ? undefined : { opacity: 1, y: 0 }

  return (
    <section
      id="experiencia"
      className="relative isolate overflow-hidden bg-lc-black py-16 sm:py-24"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-lc-pink/10 blur-[120px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 28, -12, 0],
                y: [0, -18, 22, 0],
                opacity: [0.55, 0.9, 0.7, 0.55],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8rem] bottom-6 h-80 w-80 rounded-full bg-lc-purple/15 blur-[110px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -24, 18, 0],
                y: [0, 18, -14, 0],
                opacity: [0.45, 0.75, 0.6, 0.45],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <motion.div
          className="lg:sticky lg:top-28 lg:self-start"
          initial={sectionInitial}
          whileInView={sectionVisible}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lc-purple/30 bg-lc-purple/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-lc-purple-light shadow-[0_0_40px_rgba(108,60,225,0.12)]">
            <span className="h-2 w-2 rounded-full bg-lc-success shadow-[0_0_18px_rgba(0,230,118,0.7)]" />
            Experiencia LilCake
          </div>

          <h2 className="max-w-2xl text-3xl font-heading font-bold leading-tight text-lc-white sm:text-5xl">
            Baja, elige y arma tu outfit sin perder el ritmo.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-lc-gray-light">
            La tienda ahora acompana el recorrido como una vitrina: cada bloque
            aparece con intencion para guiar al cliente desde inspiracion hasta
            compra.
          </p>

          <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-3xl border border-lc-border bg-lc-card/60 text-center backdrop-blur">
            {[
              ["3", "pasos"],
              ["24/7", "vitrina"],
              ["0", "friccion"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-r border-lc-border/70 px-3 py-4 last:border-r-0"
              >
                <p className="font-heading text-2xl font-bold text-lc-white">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-lc-gray">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative space-y-4 sm:space-y-5">
          <div
            aria-hidden="true"
            className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-lc-purple via-lc-pink to-lc-cyan opacity-50 sm:block"
          />

          {experienceSteps.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.step}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, x: 48, scale: 0.96 }
                }
                whileInView={
                  shouldReduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }
                }
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -6,
                        scale: 1.01,
                      }
                }
                className="group relative overflow-hidden rounded-3xl border border-lc-border bg-lc-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur transition-colors hover:border-lc-purple/60 hover:bg-lc-card sm:p-7"
              >
                <motion.div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-70`}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: [0.45, 0.85, 0.55],
                        }
                  }
                  transition={{
                    duration: 4 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-lc-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                  <motion.span
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-lc-purple/35 bg-lc-black/35 font-heading text-xl font-bold text-lc-purple-light shadow-[0_0_35px_rgba(108,60,225,0.18)] backdrop-blur"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              "0 0 22px rgba(108,60,225,0.16)",
                              "0 0 42px rgba(233,30,140,0.22)",
                              "0 0 22px rgba(108,60,225,0.16)",
                            ],
                          }
                    }
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {item.step}
                  </motion.span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-lc-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-lc-gray-light backdrop-blur">
                      <Icon size={13} className="text-lc-white" />
                      Momento {item.step}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-lc-white sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-lc-gray-light sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
