"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0">
      <div 
        className="fixed inset-0 bg-lc-black/80 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className={cn(
        "relative rounded-2xl bg-lc-card border border-lc-border shadow-2xl p-6 w-full max-w-md mx-auto transform transition-all animate-scale-in",
        className
      )}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-lc-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-lc-gray hover:text-lc-white hover:bg-lc-dark transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-lc-gray hover:text-lc-white hover:bg-lc-dark transition-colors"
          >
            <X size={20} />
          </button>
        )}
        
        <div>{children}</div>
      </div>
    </div>
  )
}
