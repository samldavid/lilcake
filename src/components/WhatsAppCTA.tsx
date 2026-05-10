"use client"

import { MessageCircle } from "lucide-react"
import { buildWhatsAppLink } from "@/lib/utils"

export function WhatsAppCTA() {
  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.28)] transition-transform hover:scale-105"
      aria-label="Contactanos por WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  )
}
