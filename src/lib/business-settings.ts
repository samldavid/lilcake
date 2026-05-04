import type { BusinessSettings } from "@prisma/client"
import type { z } from "zod"
import { prisma } from "@/lib/prisma"
import { businessSettingsSchema } from "@/lib/validations"

export const BUSINESS_SETTINGS_ID = "default"

export const DEFAULT_SALES_NOTE_DISCLAIMER =
  "Esta nota de venta es un comprobante interno del pedido. No reemplaza factura electronica de venta ni documento equivalente DIAN. Si el negocio esta obligado a facturar, debe emitir la factura electronica por el medio autorizado correspondiente."

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>

export type BusinessSettingsView = {
  businessName: string
  businessId: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessCity: string
  logoUrl: string
  salesNoteDisclaimer: string
}

export type SalesNoteBusinessDetails = {
  name: string
  identification: string
  email: string
  phone: string
  address: string
  logoUrl: string
  disclaimer: string
}

function emptyToString(value: string | null | undefined) {
  return value?.trim() || ""
}

function fallbackBusinessDetails(): SalesNoteBusinessDetails {
  return {
    name:
      process.env.SALES_NOTE_BUSINESS_NAME ||
      process.env.NEXT_PUBLIC_APP_NAME ||
      "LilCake",
    identification:
      process.env.SALES_NOTE_BUSINESS_ID || "Identificacion no configurada",
    email:
      process.env.SALES_NOTE_BUSINESS_EMAIL ||
      process.env.SMTP_USER ||
      "correo no configurado",
    phone: process.env.SALES_NOTE_BUSINESS_PHONE || "",
    address: process.env.SALES_NOTE_BUSINESS_ADDRESS || "",
    logoUrl: "",
    disclaimer: DEFAULT_SALES_NOTE_DISCLAIMER,
  }
}

export function getDefaultBusinessSettingsView(): BusinessSettingsView {
  const fallback = fallbackBusinessDetails()

  return {
    businessName: fallback.name,
    businessId:
      fallback.identification === "Identificacion no configurada"
        ? ""
        : fallback.identification,
    businessEmail: fallback.email === "correo no configurado" ? "" : fallback.email,
    businessPhone: fallback.phone,
    businessAddress: fallback.address,
    businessCity: "",
    logoUrl: "",
    salesNoteDisclaimer: DEFAULT_SALES_NOTE_DISCLAIMER,
  }
}

function settingsToView(settings: BusinessSettings | null): BusinessSettingsView {
  const fallback = getDefaultBusinessSettingsView()

  if (!settings) {
    return fallback
  }

  return {
    businessName: settings.businessName || fallback.businessName,
    businessId: emptyToString(settings.businessId) || fallback.businessId,
    businessEmail: emptyToString(settings.businessEmail) || fallback.businessEmail,
    businessPhone: emptyToString(settings.businessPhone) || fallback.businessPhone,
    businessAddress:
      emptyToString(settings.businessAddress) || fallback.businessAddress,
    businessCity: emptyToString(settings.businessCity) || fallback.businessCity,
    logoUrl: emptyToString(settings.logoUrl) || fallback.logoUrl,
    salesNoteDisclaimer:
      emptyToString(settings.salesNoteDisclaimer) ||
      fallback.salesNoteDisclaimer,
  }
}

export async function getBusinessSettingsView() {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: BUSINESS_SETTINGS_ID },
    })

    return settingsToView(settings)
  } catch (error) {
    console.error("Business settings read error:", error)
    return getDefaultBusinessSettingsView()
  }
}

export async function getSalesNoteBusinessDetails(): Promise<SalesNoteBusinessDetails> {
  const fallback = fallbackBusinessDetails()
  const settings = await getBusinessSettingsView()
  const address = [settings.businessAddress, settings.businessCity]
    .filter(Boolean)
    .join(", ")

  return {
    name: settings.businessName || fallback.name,
    identification: settings.businessId || fallback.identification,
    email: settings.businessEmail || fallback.email,
    phone: settings.businessPhone || fallback.phone,
    address: address || fallback.address,
    logoUrl: settings.logoUrl || fallback.logoUrl,
    disclaimer: settings.salesNoteDisclaimer || fallback.disclaimer,
  }
}

export async function saveBusinessSettings(
  payload: unknown,
  updatedById?: string
) {
  const result = businessSettingsSchema.safeParse(payload)

  if (!result.success) {
    return {
      ok: false as const,
      error: result.error.issues[0]?.message ?? "Datos invalidos.",
    }
  }

  const data = result.data

  const settings = await prisma.businessSettings.upsert({
    where: { id: BUSINESS_SETTINGS_ID },
    create: {
      id: BUSINESS_SETTINGS_ID,
      businessName: data.businessName,
      businessId: data.businessId,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessAddress: data.businessAddress,
      businessCity: data.businessCity,
      logoUrl: data.logoUrl,
      salesNoteDisclaimer: data.salesNoteDisclaimer,
      updatedById,
    },
    update: {
      businessName: data.businessName,
      businessId: data.businessId,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessAddress: data.businessAddress,
      businessCity: data.businessCity,
      logoUrl: data.logoUrl,
      salesNoteDisclaimer: data.salesNoteDisclaimer,
      updatedById,
    },
  })

  return {
    ok: true as const,
    settings: settingsToView(settings),
  }
}

export function getDemoBusinessSettingsView(): BusinessSettingsView {
  return {
    businessName: "LilCake Demo",
    businessId: "NIT 900.000.000-1",
    businessEmail: "operaciones@demo.lilcake.co",
    businessPhone: "+57 300 000 0000",
    businessAddress: "Cra 10 # 45-20",
    businessCity: "Bogota, Colombia",
    logoUrl: "",
    salesNoteDisclaimer: DEFAULT_SALES_NOTE_DISCLAIMER,
  }
}

export function getDemoSalesNoteBusinessDetails(): SalesNoteBusinessDetails {
  const settings = getDemoBusinessSettingsView()

  return {
    name: settings.businessName,
    identification: settings.businessId,
    email: settings.businessEmail,
    phone: settings.businessPhone,
    address: `${settings.businessAddress}, ${settings.businessCity}`,
    logoUrl: settings.logoUrl,
    disclaimer: settings.salesNoteDisclaimer,
  }
}
