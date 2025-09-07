"use client"

import { useMotion } from "@/lib/motion"
import type { ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, animationProps, eventHandlers } = useMotion({
    trigger: 'viewport',
    duration: 600,
    delay: delay * 1000,
    easing: [0.21, 0.47, 0.32, 0.98]
  })

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      {...eventHandlers}
      className={className}
    >
      {children}
    </div>
  )
}
