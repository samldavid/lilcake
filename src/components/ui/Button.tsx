import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          variant === "danger" && "bg-lc-error text-white hover:bg-red-600",
          variant === "ghost" && "hover:bg-lc-dark text-lc-white",
          size === "sm" && "h-8 px-4 text-xs",
          size === "md" && "h-11 px-8 text-sm",
          size === "lg" && "h-14 px-10 text-base",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
