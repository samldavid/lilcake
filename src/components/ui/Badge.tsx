import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "pink" | "success" | "warning" | "error"
}

export function Badge({ className, variant = "purple", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        `badge-${variant}`,
        className
      )}
      {...props}
    />
  )
}
