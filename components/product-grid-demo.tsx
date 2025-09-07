"use client"

import React, { useState } from 'react'
import { ProductGrid } from './product-grid'
import type { Product } from '@/types/product'

// Demo products for testing the grid animations
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Modern Kitchen Island',
    price: '$25,000',
    image: '/placeholder-product.svg',
    badge: 'New',
    materials: ['Oak', 'Quartz', 'Steel'],
    swatches: [
      { name: 'Oak', color: '#8B4513' },
      { name: 'Beige', color: '#F5F5DC' },
      { name: 'Silver', color: '#C0C0C0' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: '120x60x36'
  },
  {
    id: '2',
    name: 'Elegant Dining Set',
    price: '$8,500',
    image: '/placeholder-product.svg',
    badge: 'Popular',
    materials: ['Walnut', 'Leather'],
    swatches: [
      { name: 'Walnut', color: '#654321' },
      { name: 'Oak', color: '#8B4513' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: '84x42x30'
  },
  {
    id: '3',
    name: 'Contemporary Staircase',
    price: '$15,000',
    image: '/placeholder-product.svg',
    badge: 'Featured',
    materials: ['Oak', 'Steel', 'Glass'],
    swatches: [
      { name: 'Oak', color: '#8B4513' },
      { name: 'Steel', color: '#C0C0C0' },
      { name: 'Glass', color: '#E6E6FA' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: 'Custom'
  },
  {
    id: '4',
    name: 'Luxury Bathroom Vanity',
    price: '$12,000',
    image: '/placeholder-product.svg',
    badge: 'Limited',
    materials: ['Marble', 'Brass'],
    swatches: [
      { name: 'Marble', color: '#F8F8FF' },
      { name: 'Brass', color: '#B8860B' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: '72x24x36'
  },
  {
    id: '5',
    name: 'Custom Bookshelf',
    price: '$3,500',
    image: '/placeholder-product.svg',
    materials: ['Pine', 'Oak'],
    swatches: [
      { name: 'Pine', color: '#DEB887' },
      { name: 'Oak', color: '#8B4513' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: '96x12x84'
  },
  {
    id: '6',
    name: 'Designer Coffee Table',
    price: '$2,800',
    image: '/placeholder-product.svg',
    badge: 'New',
    materials: ['Glass', 'Chrome'],
    swatches: [
      { name: 'Glass', color: '#E6E6FA' },
      { name: 'Chrome', color: '#C0C0C0' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: '48x24x18'
  }
]

// Generate additional products for large collection testing
const generateLargeCollection = (count: number): Product[] => {
  const badges = ['New', 'Popular', 'Featured', 'Limited', undefined]
  const materials = [
    ['Oak', 'Steel'], ['Walnut', 'Brass'], ['Pine', 'Glass'], 
    ['Marble', 'Chrome'], ['Mahogany', 'Copper']
  ]
  
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 7}`,
    name: `Product ${i + 7}`,
    price: `$${(Math.random() * 20000 + 1000).toFixed(0)}`,
    image: '/placeholder-product.svg',
    badge: badges[Math.floor(Math.random() * badges.length)],
    materials: materials[Math.floor(Math.random() * materials.length)],
    swatches: [
      { name: 'Oak', color: '#8B4513' },
      { name: 'Steel', color: '#C0C0C0' }
    ],
    quickLookImages: ['/placeholder-product.svg'],
    dimensions: `${Math.floor(Math.random() * 100 + 20)}x${Math.floor(Math.random() * 50 + 10)}x${Math.floor(Math.random() * 40 + 15)}`
  }))
}

export function ProductGridDemo() {
  const [selectedPreset, setSelectedPreset] = useState<'small' | 'medium' | 'large'>('medium')
  const [animationPreset, setAnimationPreset] = useState<'subtle' | 'dynamic' | 'cinematic'>('dynamic')
  const [isLoading, setIsLoading] = useState(false)

  // Get products based on selected preset
  const getProducts = () => {
    switch (selectedPreset) {
      case 'small':
        return demoProducts.slice(0, 3)
      case 'medium':
        return demoProducts
      case 'large':
        return [...demoProducts, ...generateLargeCollection(20)]
      default:
        return demoProducts
    }
  }

  const products = getProducts()

  const handleQuickLook = (product: Product) => {
    console.log('Quick look:', product.name)
    alert(`Quick look: ${product.name}`)
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Grid Animation Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Test the enhanced product grid with staggered entrance animations, 
            smooth layout transitions, and performance optimizations.
          </p>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Collection Size:
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="small">Small (3 items)</option>
                <option value="medium">Medium (6 items)</option>
                <option value="large">Large (26 items)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Animation Style:
              </label>
              <select
                value={animationPreset}
                onChange={(e) => setAnimationPreset(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="subtle">Subtle</option>
                <option value="dynamic">Dynamic</option>
                <option value="cinematic">Cinematic</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Actions:
              </label>
              <button
                onClick={simulateLoading}
                disabled={isLoading}
                className="px-4 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Simulate Loading'}
              </button>
            </div>
          </div>

          {/* Performance Info */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Performance Features:
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Staggered entrance animations with row-based timing</li>
              <li>• Optimized animations for collections over 20 items</li>
              <li>• Smooth layout transitions for filtering and sorting</li>
              <li>• GPU-accelerated transforms with will-change optimization</li>
              <li>• Reduced motion support for accessibility</li>
            </ul>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          onQuickLook={handleQuickLook}
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
          animationPreset={animationPreset}
          enableFiltering={true}
          enableSorting={true}
          isLoading={isLoading}
          loadingCount={6}
        />
      </div>
    </div>
  )
}