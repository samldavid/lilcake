"use client"

import { buildWhatsAppLink } from "@/lib/utils"

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-8 w-8"
      fill="currentColor"
    >
      <path d="M16 .4C7.2.4.1 7.5.1 16.3c0 2.8.7 5.6 2.1 8L.1 31.6l7.5-2c2.5 1.3 5.3 2 8.2 2h.1c8.8 0 15.9-7.1 15.9-15.9C31.8 7.5 24.7.4 16 .4Zm0 28.4h-.1c-2.4 0-4.7-.6-6.8-1.8l-.5-.3-4.5 1.2 1.2-4.3-.3-.5c-1.3-2.1-2-4.4-2-6.8C3 9.1 8.8 3.3 16 3.3c3.5 0 6.8 1.4 9.2 3.8 2.5 2.5 3.8 5.7 3.8 9.2 0 7.2-5.8 12.5-13 12.5Zm7.1-9.4c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3.1-1.9-1.2-1-1.9-2.2-2.2-2.6-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.8 1.6 4.1c.2.3 2.8 4.2 6.7 5.9.9.4 1.7.6 2.2.8.9.3 1.8.2 2.5.1.8-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.9-.1-.1-.4-.2-.8-.4Z" />
    </svg>
  )
}

export function WhatsAppCTA() {
  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#25D366] text-white shadow-[0_18px_48px_rgba(37,211,102,0.36)] ring-4 ring-[#25D366]/14 transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      aria-label="Contactanos por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  )
}
