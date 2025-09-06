"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Menu } from "lucide-react"
import { ModernSidebar } from "./modern-sidebar"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])



  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          "backdrop-blur-md border-b border-white/[0.02]",
          isScrolled ? "bg-white/[0.02]" : "bg-white/[0.02]",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-center h-12 lg:h-16 relative">
            <motion.div
              className="flex items-center gap-3 flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <a href="#" className="flex items-center gap-3 group" aria-label="Legacy Interiors and Developers Home">
                {/* Logo Image with opacity effect */}
                <div className="relative">
                  <Image
                    src="/legacy-logo.svg"
                    alt="Legacy Interiors and Developers Logo"
                    width={48}
                    height={48}
                    className={cn(
                      "transition-opacity duration-300",
                      isScrolled ? "opacity-80 group-hover:opacity-100" : "opacity-70 group-hover:opacity-90",
                    )}
                  />
                </div>

                {/* Company Name */}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-lg lg:text-xl font-bold tracking-tight transition-colors leading-tight",
                      isScrolled
                        ? "text-neutral-900 group-hover:text-neutral-700"
                        : "text-white group-hover:text-white/80",
                    )}
                  >
                    LEGACY
                  </span>
                  <span
                    className={cn(
                      "text-xs lg:text-sm font-medium tracking-wide transition-colors leading-tight",
                      isScrolled
                        ? "text-neutral-600 group-hover:text-neutral-500"
                        : "text-white/70 group-hover:text-white/60",
                    )}
                  >
                    INTERIORS AND DEVELOPERS
                  </span>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Menu Button - Vertically centered with header */}
      {!isMenuOpen && (
        <motion.button
          className={cn(
            "fixed top-0 left-4 z-[100] flex items-center justify-center w-12 transition-all duration-200",
            "hover:bg-white/10 active:scale-95 rounded-lg",
            "h-12 lg:h-16", // Match header height
            isScrolled ? "text-neutral-900 hover:text-neutral-700" : "text-white hover:text-white/80",
          )}
          onClick={() => setIsMenuOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open menu"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <Menu size={22} />
        </motion.button>
      )}

      {/* Modern Sidebar */}
      <ModernSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  )
}
