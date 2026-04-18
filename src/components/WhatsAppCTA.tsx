"use client"

import { buildWhatsAppLink } from "@/lib/utils"

export function WhatsAppCTA() {
  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform flex items-center justify-center animate-float group"
      aria-label="Contáctanos por WhatsApp"
    >
      <svg 
        className="w-8 h-8 group-hover:animate-pulse" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M11.99 2C6.47 2 2 6.48 2 12c0 1.84.5 3.56 1.36 5.05L2 22l5.05-1.35A9.97 9.97 0 0011.99 22c5.52 0 10-4.48 10-10S17.51 2 11.99 2zm5.42 14.18c-.23.65-1.35 1.25-1.89 1.35-.5.09-1.16.21-3.32-.69-2.61-1.09-4.31-3.77-4.44-3.95-.13-.18-1.07-1.42-1.07-2.71 0-1.29.68-1.92.92-2.18.24-.26.65-.33.87-.33.22 0 .44 0 .63.45.2.46.68 1.66.74 1.78.06.13.11.28.02.46-.09.18-.13.29-.26.43-.13.14-.28.31-.38.41-.1.11-.22.23-.1.45.12.22.54.91 1.17 1.47.81.72 1.48.94 1.7 1.05.22.11.35.09.48-.06.13-.15.56-.65.71-.87.15-.22.3-.18.5-.11.2.07 1.28.61 1.5 71.22.11.36.18.41.31s-.05.58-.28 1.23z"/>
      </svg>
    </a>
  )
}
