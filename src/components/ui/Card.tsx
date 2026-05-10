import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
}

export function Card({ className, glass, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        glass ? "glass" : "card",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-lc-border", className)}
      {...props}
    />
  )
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />
}
