import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductGrid, ProductGridPresets, useProductGrid } from '../product-grid'
import type { Product } from '@/types/product'

// Mock Motion.dev
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>
}))

// Mock the motion hooks
jest.mock('@/lib/motion/hooks', () => ({
  useStaggerAnimation: jest.fn(() => ({
    ref: { current: null },
    eventHandlers: {},
    getItemProps: jest.fn(() => ({
      animate: 'visible',
      initial: 'hidden'
    }))
  }))
}))

// Mock the motion config
jest.mock('@/lib/motion/config', () => ({
  ANIMATION_PRESETS: {
    staggerFadeIn: { duration: 300, easing: 'ease' }
  },
  EASING_PRESETS: {
    smooth: 'ease',
    cinematic: 'ease'
  },
  DURATION_PRESETS: {
    fast: 150,
    normal: 300
  }
}))

// Mock ProductCard
jest.mock('../product-card', () => ({
  ProductCard: ({ product, onQuickLook, isLoading }: any) => (
    <div 
      data-testid={`product-card-${product.id}`}
      onClick={() => onQuickLook(product)}
    >
      {isLoading ? (
        <div data-testid="loading-skeleton">Loading...</div>
      ) : (
        <>
          <div>{product.name}</div>
          <div>{product.price}</div>
          {product.badge && <div data-testid="badge">{product.badge}</div>}
        </>
      )}
    </div>
  )
}))

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Modern Kitchen',
    price: '$25,000',
    image: '/kitchen.jpg',
    badge: 'New',
    materials: ['Oak', 'Quartz'],
    swatches: [],
    quickLookImages: [],
    dimensions: '12x15'
  },
  {
    id: '2',
    name: 'Elegant Dining Set',
    price: '$8,500',
    image: '/dining.jpg',
    badge: 'Popular',
    materials: ['Walnut', 'Leather'],
    swatches: [],
    quickLookImages: [],
    dimensions: '84x42'
  },
  {
    id: '3',
    name: 'Contemporary Staircase',
    price: '$15,000',
    image: '/staircase.jpg',
    badge: 'Featured',
    materials: ['Oak', 'Steel', 'Glass'],
    swatches: [],
    quickLookImages: [],
    dimensions: 'Custom'
  }
]

describe('ProductGrid', () => {
  const mockOnQuickLook = jest.fn()

  beforeEach(() => {
    mockOnQuickLook.mockClear()
  })

  it('renders products in grid layout', () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook} 
      />
    )

    expect(screen.getByText('Modern Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Elegant Dining Set')).toBeInTheDocument()
    expect(screen.getByText('Contemporary Staircase')).toBeInTheDocument()
  })

  it('handles product click events', () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook} 
      />
    )

    const productCard = screen.getByTestId('product-card-1')
    fireEvent.click(productCard)

    expect(mockOnQuickLook).toHaveBeenCalledWith(mockProducts[0])
  })

  it('shows loading state correctly', () => {
    render(
      <ProductGrid 
        products={[]} 
        onQuickLook={mockOnQuickLook}
        isLoading={true}
        loadingCount={3}
      />
    )

    const loadingSkeletons = screen.getAllByTestId('loading-skeleton')
    expect(loadingSkeletons).toHaveLength(3)
  })

  it('renders filter controls when enabled', () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableFiltering={true}
      />
    )

    expect(screen.getByText('Filter by:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Popular' })).toBeInTheDocument()
  })

  it('renders sort controls when enabled', () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableSorting={true}
      />
    )

    expect(screen.getByText('Sort by:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument()
  })

  it('filters products correctly with smooth transitions', async () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableFiltering={true}
      />
    )

    // Click on "New" filter
    const newFilter = screen.getByRole('button', { name: 'New' })
    fireEvent.click(newFilter)

    // Should show transition state briefly
    expect(screen.getByText('Updating view...')).toBeInTheDocument()

    // Should only show products with "New" badge after transition
    await waitFor(() => {
      expect(screen.getByText('Modern Kitchen')).toBeInTheDocument()
      expect(screen.queryByText('Elegant Dining Set')).not.toBeInTheDocument()
      expect(screen.queryByText('Contemporary Staircase')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('sorts products correctly', async () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableSorting={true}
      />
    )

    // Change sort to name
    const sortSelect = screen.getByDisplayValue('Newest First')
    fireEvent.change(sortSelect, { target: { value: 'name' } })

    await waitFor(() => {
      // Products should be sorted alphabetically
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveTextContent('Contemporary Staircase')
      expect(productCards[1]).toHaveTextContent('Elegant Dining Set')
      expect(productCards[2]).toHaveTextContent('Modern Kitchen')
    })
  })

  it('shows enhanced empty state when no products match filter', async () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableFiltering={true}
      />
    )

    // Click on "Limited" filter (no products have this badge)
    const limitedFilter = screen.getByRole('button', { name: 'Limited' })
    fireEvent.click(limitedFilter)

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument()
      expect(screen.getByText('No products match the "limited" filter')).toBeInTheDocument()
      expect(screen.getByText('Show All Products')).toBeInTheDocument()
    })

    // Test reset filter button
    const resetButton = screen.getByText('Show All Products')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Modern Kitchen')).toBeInTheDocument()
    })
  })

  it('applies different animation presets', () => {
    const presets = ['subtle', 'dynamic', 'cinematic'] as const
    
    presets.forEach(preset => {
      const { rerender } = render(
        <ProductGrid 
          products={mockProducts} 
          onQuickLook={mockOnQuickLook}
          animationPreset={preset}
        />
      )

      expect(screen.getByText('Modern Kitchen')).toBeInTheDocument()
      
      // Clean up for next iteration
      rerender(<div />)
    })
  })

  it('optimizes animations for large product collections', () => {
    // Create a large collection of products
    const largeProductCollection = Array.from({ length: 25 }, (_, i) => ({
      ...mockProducts[0],
      id: `product-${i}`,
      name: `Product ${i}`
    }))

    render(
      <ProductGrid 
        products={largeProductCollection} 
        onQuickLook={mockOnQuickLook}
        animationPreset="dynamic"
      />
    )

    // Should render all products
    expect(screen.getByText('Product 0')).toBeInTheDocument()
    expect(screen.getByText('Product 24')).toBeInTheDocument()

    // Performance info should indicate large collection
    if (process.env.NODE_ENV === 'development') {
      expect(screen.getByText(/Showing 25 of 25 products/)).toBeInTheDocument()
    }
  })

  it('handles sort changes with smooth transitions', async () => {
    render(
      <ProductGrid 
        products={mockProducts} 
        onQuickLook={mockOnQuickLook}
        enableSorting={true}
      />
    )

    // Change sort to price
    const sortSelect = screen.getByDisplayValue('Newest First')
    fireEvent.change(sortSelect, { target: { value: 'price' } })

    // Should show transition state
    expect(screen.getByText('Updating view...')).toBeInTheDocument()

    await waitFor(() => {
      // Products should be sorted by price (Elegant Dining Set: $8,500 should be first)
      const productCards = screen.getAllByTestId(/product-card-/)
      expect(productCards[0]).toHaveTextContent('Elegant Dining Set')
    }, { timeout: 1000 })
  })
})

describe('ProductGridPresets', () => {
  it('returns correct preset configurations', () => {
    const presets = ProductGridPresets()

    expect(presets.minimal).toEqual({
      columns: { mobile: 1, tablet: 2, desktop: 2 },
      gap: 12,
      animationPreset: 'cinematic',
      enableFiltering: false,
      enableSorting: false
    })

    expect(presets.standard).toEqual({
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      gap: 8,
      animationPreset: 'dynamic',
      enableFiltering: true,
      enableSorting: true
    })

    expect(presets.dense).toEqual({
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      gap: 6,
      animationPreset: 'subtle',
      enableFiltering: true,
      enableSorting: true
    })

    expect(presets.gallery).toEqual({
      columns: { mobile: 1, tablet: 1, desktop: 2 },
      gap: 16,
      animationPreset: 'cinematic',
      enableFiltering: false,
      enableSorting: false
    })
  })
})

describe('useProductGrid', () => {
  it('manages product state correctly', () => {
    const TestComponent = () => {
      const {
        products,
        addProduct,
        removeProduct,
        updateProduct
      } = useProductGrid(mockProducts)

      return (
        <div>
          <div data-testid="product-count">{products.length}</div>
          <button 
            onClick={() => addProduct({
              id: '4',
              name: 'New Product',
              price: '$1000',
              image: '/new.jpg',
              materials: [],
              swatches: [],
              quickLookImages: [],
              dimensions: ''
            })}
          >
            Add Product
          </button>
          <button onClick={() => removeProduct('1')}>
            Remove Product
          </button>
          <button onClick={() => updateProduct('2', { name: 'Updated Name' })}>
            Update Product
          </button>
          {products.map(product => (
            <div key={product.id} data-testid={`product-${product.id}`}>
              {product.name}
            </div>
          ))}
        </div>
      )
    }

    render(<TestComponent />)

    // Initial state
    expect(screen.getByTestId('product-count')).toHaveTextContent('3')

    // Add product
    fireEvent.click(screen.getByText('Add Product'))
    expect(screen.getByTestId('product-count')).toHaveTextContent('4')
    expect(screen.getByText('New Product')).toBeInTheDocument()

    // Remove product
    fireEvent.click(screen.getByText('Remove Product'))
    expect(screen.getByTestId('product-count')).toHaveTextContent('3')
    expect(screen.queryByTestId('product-1')).not.toBeInTheDocument()

    // Update product
    fireEvent.click(screen.getByText('Update Product'))
    expect(screen.getByText('Updated Name')).toBeInTheDocument()
  })
})