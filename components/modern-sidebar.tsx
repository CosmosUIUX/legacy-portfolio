"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TransitionLink } from "./transition-layout"
import Image from "next/image"
import { 
  Home, 
  User, 
  Briefcase, 
  ImageIcon, 
  Phone, 
  Building, 
  Palette,
  X,
  Mail,
  MapPin,
  Clock
} from "lucide-react"

interface ModernSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ModernSidebar({ isOpen, onClose }: ModernSidebarProps) {
  const menuItems = [
    { icon: Home, label: "Home", href: "/", description: "Welcome to Legacy" },
    { icon: User, label: "About Us", href: "/about", description: "Our story & team" },
    { icon: Palette, label: "Interior Design", href: "/interior-design", description: "Transform your space" },
    { icon: Building, label: "Development", href: "/development", description: "Build your dreams" },
    { icon: ImageIcon, label: "Portfolio", href: "/portfolio", description: "Our latest work" },
    { icon: Briefcase, label: "Services", href: "/services", description: "What we offer" },
    { icon: Phone, label: "Contact", href: "/contact", description: "Get in touch" },
  ]

  const contactInfo = [
    { icon: Mail, label: "hello@legacy.com" },
    { icon: Phone, label: "+1 (555) 123-4567" },
    { icon: MapPin, label: "New York, NY" },
    { icon: Clock, label: "Mon-Fri 9AM-6PM" },
  ]

  // Parent variants with staggerChildren
  const menuVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.25 
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -60, y: 20, scale: 0.8, rotateY: -25 },
    visible: { 
      opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0,
      transition: { type: "spring", damping: 20, stiffness: 300, mass: 0.8 }
    }
  }

  const contactVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.45 
      }
    }
  }

  const contactItemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.8 },
    visible: { 
      opacity: 1, x: 0, scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 400 }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0, backdropFilter: "blur(0px)", scale: 1.05 }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)", scale: 1 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] max-w-sm z-50 bg-black/90 backdrop-blur-2xl shadow-2xl border-r border-white/10"
            initial={{ x: "-100%", opacity: 0, scale: 0.92, rotateY: -15 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ x: "-100%", opacity: 0, scale: 0.95, rotateY: -8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.7 }}
            style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div 
                className="p-6 border-b border-white/10 bg-gradient-to-r from-black/30 to-black/20"
                initial={{ opacity: 0, y: -40, scale: 0.85, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Image src="/legacy-logo.svg" alt="Legacy Logo" width={40} height={40} className="drop-shadow-sm" />
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none">LEGACY</h2>
                      <p className="text-xs font-semibold text-white/70 tracking-wider uppercase leading-tight mt-0.5">
                        INTERIORS & DEVELOPERS
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.15, rotate: 90, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.85, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <X size={20} className="text-white/80" />
                  </motion.button>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Creating beautiful spaces that inspire and transform your vision into reality.
                </p>
              </motion.div>

              {/* Menu */}
              <motion.nav
                className="flex-1 overflow-y-auto py-4 px-4"
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {menuItems.map((item, index) => (
                  <motion.div key={item.label} variants={itemVariants}>
                    <TransitionLink href={item.href} onClick={onClose} className="w-full block">
                      <motion.div
                        className="w-full flex items-center gap-4 p-3 mx-2 my-1 rounded-xl text-left transition-all duration-200 group hover:bg-white/10 hover:translate-x-1 active:scale-[0.98] cursor-pointer"
                        whileHover={{ x: 12, scale: 1.03 }}
                        whileTap={{ scale: 0.95, x: 6 }}
                      >
                        <motion.div 
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-200"
                          whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                          whileTap={{ scale: 0.9, rotate: 15 }}
                        >
                          {React.createElement(item.icon, { size: 18, className: "text-white/80 group-hover:text-white" })}
                        </motion.div>
                        <div className="flex flex-col">
                          <motion.span className="font-semibold text-white text-base mb-1">{item.label}</motion.span>
                          <motion.span className="text-xs text-white/60 font-medium">{item.description}</motion.span>
                        </div>
                      </motion.div>
                    </TransitionLink>
                  </motion.div>
                ))}
              </motion.nav>

              {/* Contact Info */}
              <motion.div 
                className="p-6 border-t border-white/10 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm"
                variants={contactVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                  Get In Touch
                </motion.h3>
                <div className="space-y-3">
                  {contactInfo.map((contact) => (
                    <motion.div
                      key={contact.label}
                      className="flex items-center gap-3 text-sm"
                      variants={contactItemVariants}
                    >
                      <motion.div 
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10"
                        whileHover={{ scale: 1.25, rotate: [0, -5, 5, 0] }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {React.createElement(contact.icon, { size: 14, className: "text-white/80" })}
                      </motion.div>
                      <motion.span className="text-white/90 font-medium">
                        {contact.label}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
                <motion.div className="mt-6 pt-4 border-t border-white/10">
                  <motion.p className="text-xs text-white/60 text-center font-medium">
                    © 2024 Legacy Interiors & Developers
                  </motion.p>
                  <motion.p className="text-xs text-white/40 text-center mt-1">
                    Creating Beautiful Spaces Since 2024
                  </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
