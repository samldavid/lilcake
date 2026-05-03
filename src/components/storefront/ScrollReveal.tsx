"use client"

import * as React from "react"

type ScrollRevealProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  once = true,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current

    if (!node || !("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)

          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}
