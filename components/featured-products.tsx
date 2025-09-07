"use client"

import { useState } from "react"
import { ProductGrid, ProductGridPresets } from "./product-grid"
import { QuickLookModal } from "./quick-look-modal"
import { Reveal } from "./reveal"
import type { Product } from "@/types/product"

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Modern Kitchen Design",
    price: "From $25,000",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    badge: "Popular" as const,
    materials: ["White Oak Cabinets", "Quartz Countertops", "Stainless Steel Appliances"],
    swatches: [
      { name: "Pure White", color: "#FFFFFF" },
      { name: "Natural Oak", color: "#D2B48C" },
      { name: "Charcoal", color: "#36454F" },
    ],
    quickLookImages: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    ],
    dimensions: "12' x 15' Kitchen Space",
  },
  {
    id: "2",
    name: "Elegant Dining Set",
    price: "From $8,500",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80",
    badge: "New" as const,
    materials: ["Solid Walnut", "Leather Upholstery", "Brass Accents"],
    swatches: [
      { name: "Rich Walnut", color: "#8B4513" },
      { name: "Cognac Leather", color: "#A0522D" },
      { name: "Antique Brass", color: "#CD7F32" },
    ],
    quickLookImages: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80",
    ],
    dimensions: "Table: 84\" x 42\" | Chairs: Set of 6",
  },
  {
    id: "3",
    name: "Contemporary Staircase",
    price: "From $15,000",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    badge: "Featured" as const,
    materials: ["Solid Oak Treads", "Steel Frame", "Glass Railings"],
    swatches: [
      { name: "Natural Oak", color: "#DEB887" },
      { name: "Matte Black Steel", color: "#2F2F2F" },
      { name: "Clear Glass", color: "#F0F8FF" },
    ],
    quickLookImages: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    ],
    dimensions: "Custom Design | 14 Steps",
  },
]

export function FeaturedProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleQuickLook = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Get preset configuration for featured products
  const gridPresets = ProductGridPresets()

  return (
    <section className="py-20 lg:py-32" id="featured-products">
      <div className="container-custom">
        <Reveal>
          <div className="text-left mb-16">
            <h2 className="text-4xl text-neutral-900 mb-4 lg:text-6xl">
              Featured <span className="italic font-light">Projects</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Explore our signature interior design and development projects, each showcasing our commitment to exceptional craftsmanship and timeless design.
            </p>
          </div>
        </Reveal>

        <ProductGrid
          products={featuredProducts}
          onQuickLook={handleQuickLook}
          {...gridPresets.standard}
          animationPreset="cinematic"
        />
      </div>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
