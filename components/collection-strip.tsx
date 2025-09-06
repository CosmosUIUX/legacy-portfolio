"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { Reveal } from "./reveal"

const collections = [
  {
    id: "modern-living",
    name: "MODERN LIVING",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "15+ projects",
  },
  {
    id: "minimalist-spaces",
    name: "MINIMALIST SPACES",
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "12+ projects",
  },
  {
    id: "luxury-interiors",
    name: "LUXURY INTERIORS",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "20+ projects",
  },
  {
    id: "scandinavian-design",
    name: "SCANDINAVIAN DESIGN",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "18+ projects",
  },
  {
    id: "contemporary-homes",
    name: "CONTEMPORARY HOMES",
    image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "25+ projects",
  },
  {
    id: "industrial-chic",
    name: "INDUSTRIAL CHIC",
    image: "https://images.unsplash.com/photo-1616137466211-f939a420be84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "10+ projects",
  },
  {
    id: "cozy-retreats",
    name: "COZY RETREATS",
    image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "14+ projects",
  },
  {
    id: "open-concept",
    name: "OPEN CONCEPT",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "22+ projects",
  },
  {
    id: "boutique-spaces",
    name: "BOUTIQUE SPACES",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "8+ projects",
  },
  {
    id: "timeless-elegance",
    name: "TIMELESS ELEGANCE",
    image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    count: "16+ projects",
  },
]

export function CollectionStrip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -100])

  const itemWidth = 320 // 320px (w-80) + 32px gap = 352px per item
  const totalWidth = collections.length * (itemWidth + 32) - 32 // subtract last gap
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 1200
  const maxDrag = Math.max(0, totalWidth - containerWidth + 48) // add padding

  return (
    <section ref={containerRef} className="py-12 sm:py-16 lg:py-32 overflow-hidden">
      <div className="mb-8 sm:mb-12">
        <Reveal>
          <div className="container-custom text-center px-4 sm:px-6">
            <h2 className="text-neutral-900 mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal">Design Collections</h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto px-2">
              Discover our signature interior design styles, each crafted to transform spaces into extraordinary experiences.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.1}
        >
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              className="flex-shrink-0 w-64 sm:w-72 lg:w-80 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden mb-4">
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ filter: "blur(1px)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <motion.div
                    className="text-center text-white"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider mb-2 leading-tight">{collection.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{collection.count}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="text-center mt-6 sm:mt-8 px-4">
        <p className="text-xs sm:text-sm text-neutral-500">← Drag to explore collections →</p>
      </div>
    </section>
  )
}
