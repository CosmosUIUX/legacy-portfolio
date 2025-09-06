"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    { 
      icon: Home, 
      label: "Home", 
      href: "/",
      description: "Welcome to Legacy"
    },
    { 
      icon: User, 
      label: "About Us", 
      href: "/about",
      description: "Our story & team"
    },
    { 
      icon: Palette, 
      label: "Interior Design", 
      href: "/interior-design",
      description: "Transform your space"
    },
    { 
      icon: Building, 
      label: "Development", 
      href: "/development",
      description: "Build your dreams"
    },
    { 
      icon: ImageIcon, 
      label: "Portfolio", 
      href: "/portfolio",
      description: "Our latest work"
    },
    { 
      icon: Briefcase, 
      label: "Services", 
      href: "/services",
      description: "What we offer"
    },
    { 
      icon: Phone, 
      label: "Contact", 
      href: "/contact",
      description: "Get in touch"
    },
  ]

  const contactInfo = [
    { icon: Mail, label: "hello@legacy.com" },
    { icon: Phone, label: "+1 (555) 123-4567" },
    { icon: MapPin, label: "New York, NY" },
    { icon: Clock, label: "Mon-Fri 9AM-6PM" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Custom Sidebar */}
          <motion.div
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] max-w-sm z-50 bg-black/90 backdrop-blur-2xl shadow-2xl border-r border-white/10"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.5 
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div 
                className="p-6 border-b border-white/10 bg-gradient-to-r from-black/30 to-black/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src="/legacy-logo.svg"
                        alt="Legacy Logo"
                        width={40}
                        height={40}
                        className="drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                        LEGACY
                      </h2>
                      <p className="text-xs font-semibold text-white/70 tracking-wider uppercase leading-tight mt-0.5">
                        INTERIORS & DEVELOPERS
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} className="text-white/80" />
                  </motion.button>
                </div>
                
                <p className="text-sm text-white/80 leading-relaxed">
                  Creating beautiful spaces that inspire and transform your vision into reality.
                </p>
              </motion.div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.05, 
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      <motion.button
                        onClick={() => {
                          window.location.href = item.href
                          onClose()
                        }}
                        className="w-full flex items-center gap-4 p-3 mx-2 my-1 rounded-xl text-left transition-all duration-200 group hover:bg-white/10 hover:translate-x-1 active:scale-[0.98]"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-200">
                          {React.createElement(item.icon, {
                            size: 18,
                            className: "text-white/80 group-hover:text-white transition-colors duration-200",
                          })}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-base mb-1">
                            {item.label}
                          </span>
                          <span className="text-xs text-white/60 font-medium">
                            {item.description}
                          </span>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Contact Information */}
              <motion.div 
                className="p-6 border-t border-white/10 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                  Get In Touch
                </h3>
                <div className="space-y-3">
                  {contactInfo.map((contact, index) => (
                    <motion.div
                      key={contact.label}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                        {React.createElement(contact.icon, {
                          size: 14,
                          className: "text-white/80",
                        })}
                      </div>
                      <span className="text-white/90 font-medium">
                        {contact.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  className="mt-6 pt-4 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                >
                  <p className="text-xs text-white/60 text-center font-medium">
                    © 2024 Legacy Interiors & Developers
                  </p>
                  <p className="text-xs text-white/40 text-center mt-1">
                    Creating Beautiful Spaces Since 2024
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}