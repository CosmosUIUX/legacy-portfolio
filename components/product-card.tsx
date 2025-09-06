"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  onQuickLook: (product: Product) => void
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      className="group relative bg-white overflow-hidden"
      style={{
        borderRadius: "24px",
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
      }}
      layout
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm",
              product.badge === "New" && "bg-green-500/90 text-white",
              product.badge === "Back in stock" && "bg-blue-500/90 text-white",
              product.badge === "Limited" && "bg-amber-500/90 text-white",
              product.badge === "Popular" && "bg-purple-500/90 text-white",
              product.badge === "Featured" && "bg-indigo-500/90 text-white",
            )}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "25/36" }}>
        <div className="relative w-full h-full">
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </div>
      </div>

      {/* Product Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0 backdrop-blur-lg"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
              {product.name}
            </h3>
            <p className="text-sm text-white/90 mb-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {product.materials.join(", ")}
            </p>
            <span className="text-xl font-bold text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
              {product.price}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
