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
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track scroll
  useEffect(() => {
    if (!mounted) return
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [mounted])

  // ESC + body scroll lock
  useEffect(() => {
    if (!mounted) return
    
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", onEsc)
    } else {
      document.body.style.overflow = ""
    }
    
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onEsc)
    }
  }, [isMenuOpen, mounted])

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[100] border-b bg-black/10 backdrop-blur-md">
        <div className="container-custom relative">
          <div className="flex items-center justify-center h-12 lg:h-16">
            <div className="flex items-center gap-3 flex-shrink-0">
              <a href="#" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/legacy-logo.svg"
                    alt="Legacy Logo"
                    width={48}
                    height={48}
                    className="w-8 h-8 lg:w-12 lg:h-12"
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-lg lg:text-xl font-bold tracking-tight leading-tight text-white">
                    LEGACY
                  </span>
                  <span className="text-xs lg:text-sm font-medium tracking-wide leading-tight text-white/70">
                    INTERIORS AND DEVELOPERS
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <motion.header
        className={cn("fixed top-0 left-0 right-0 z-[100] border-b")}
        initial={{ y: -100 }}
        animate={{
          y: 0,
          backgroundColor: isScrolled 
            ? "rgba(255, 255, 255, 0.95)" 
            : "rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(12px)",
        }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="container-custom relative">
          <div className="flex items-center justify-center h-12 lg:h-16">
            {/* Menu Button - Screen Corner */}
            {!isMenuOpen && (
              <motion.button
                className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20"
                onClick={() => setIsMenuOpen(true)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </motion.button>
            )}

            {/* Logo - Center */}
            <motion.div
              className="flex items-center gap-3 flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <a href="#" className="flex items-center gap-3 group" aria-label="Legacy Interiors and Developers Home">
                {/* Logo Image */}
                <motion.div
                  className="relative"
                  whileHover={{
                    scale: 1.05,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Image
                    src="/legacy-logo.svg"
                    alt="Legacy Interiors and Developers Logo"
                    width={48}
                    height={48}
                    className="w-8 h-8 lg:w-12 lg:h-12 transition-all duration-300"
                    priority
                  />
                </motion.div>

                {/* Text Logo */}
                <div className="flex flex-col leading-none">
                  <motion.span
                    className="text-lg lg:text-xl font-bold tracking-tight leading-tight"
                    animate={{
                      color: isScrolled
                        ? "rgb(23, 23, 23)"
                        : "rgb(255, 255, 255)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    LEGACY
                  </motion.span>
                  <motion.span
                    className="text-xs lg:text-sm font-medium tracking-wide leading-tight"
                    animate={{
                      color: isScrolled
                        ? "rgb(82, 82, 82)"
                        : "rgba(255, 255, 255, 0.7)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    INTERIORS AND DEVELOPERS
                  </motion.span>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Modern Sidebar */}
      <ModernSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
