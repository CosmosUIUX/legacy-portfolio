import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { render } from './test-utils'
import { ProductCard } from '../product-card'
import type { Product } from '@/types/product'

// Mock Motion.dev
jest.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(({ children, animate, variants, transition, whileHover, whileTap, layoutId, style, className, onClick, onMouseEnter, onMouseLeave, initial, ...props }: any, ref: any) => (
      <div 
        ref={ref}
        className={className}
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-animate={animate}
        data-layout-id={layoutId}
        {...props}
      >
        {children}
      </div>
    )),
    span: React.forwardRef(({ children, animate, variants, transition, whileHover, whileTap, style, className, ...props }: any, ref: any) => (
      <span 
        ref={ref}
        className={className}
        style={style}
        data-animate={animate}
        {...props}
      >
        {children}
      </span>
    ))
  }
}))

// Mock the motion hooks
jest.mock('@/lib/motion/hooks', () => ({
  useMotion: jest.fn(() => ({
    ref: { current: null },
    isActive: true,
    animationProps: {
      animate: 'visible',
      initial: 'hidden',
      variants: {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }
    },
    eventHandlers: {
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn()
    },
    isHovered: false,
    isInView: true
  }))
}))

// Mock the motion config
jest.mock('@/lib/motion/config', () => ({
  ANIMATION_PRESETS: {
    fadeIn: { duration: 300, easing: 'ease' }
  },
  EASING_PRESETS: {
    snappy: 'ease',
    smooth: 'ease',
    bounce: 'ease',
    cinematic: 'ease'
  },
  DURATION_PRESETS: {
    fast: 150,
    normal: 300,
    cinematic: 1000
  }
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, fill, ...props }: any) {
    React.useEffect(() => {
      if (onLoad) {
        setTimeout(() => onLoad(), 100)
      }
    }, [onLoad])
    
    return (
      <img
        src={src}
        alt={alt}
        {...props}
        data-testid="product-image"
        style={{ width: fill ? '100%' : 'auto', height: fill ? '100%' : 'auto' }}
      />
    )
  }
})

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: '$1,000',
  image: '/test-image.jpg',
  badge: 'New',
  materials: ['Oak', 'Steel'],
  swatches: [
    { name: 'Natural Oak', color: '#D2B48C' },
    { name: 'Steel Gray', color: '#708090' }
  ],
  quickLookImages: ['/test-image-1.jpg', '/test-image-2.jpg'],
  dimensions: '10ft x 3ft'
}

describe('ProductCard', () => {
  const mockOnQuickLook = jest.fn()

  beforeEach(() => {
    mockOnQuickLook.mockClear()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
    expect(screen.getByText('Oak, Steel')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('renders product image with correct attributes', () => {
    render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

    const image = screen.getByTestId('product-image')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Test Product')
  })

  it('calls onQuickLook when clicked', () => {
    render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

    const card = screen.getByText('Test Product').closest('div')
    fireEvent.click(card!)

    expect(mockOnQuickLook).toHaveBeenCalledWith(mockProduct)
  })

  it('renders without badge when badge is not provided', () => {
    const productWithoutBadge = { ...mockProduct, badge: undefined }
    render(<ProductCard product={productWithoutBadge} onQuickLook={mockOnQuickLook} />)

    expect(screen.queryByText('New')).not.toBeInTheDocument()
  })

  it('handles loading state correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onQuickLook={mockOnQuickLook} 
        isLoading={true}
      />
    )

    // Loading skeleton should be present
    const loadingSkeleton = document.querySelector('.bg-gradient-to-r')
    expect(loadingSkeleton).toBeInTheDocument()
  })

  it('handles fallback image when product image is not provided', () => {
    const productWithoutImage = { ...mockProduct, image: '' }
    render(<ProductCard product={productWithoutImage} onQuickLook={mockOnQuickLook} />)

    const image = screen.getByTestId('product-image')
    expect(image).toHaveAttribute('src', '/placeholder-product.svg')
  })

  it('renders materials list correctly', () => {
    const productWithMultipleMaterials = {
      ...mockProduct,
      materials: ['Oak', 'Steel', 'Glass', 'Aluminum']
    }
    
    render(<ProductCard product={productWithMultipleMaterials} onQuickLook={mockOnQuickLook} />)

    expect(screen.getByText('Oak, Steel, Glass, Aluminum')).toBeInTheDocument()
  })
})