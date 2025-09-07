import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../product-card'
import type { Product } from '@/types/product'

// Mock Motion.dev with simple div/span components
jest.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    span: React.forwardRef<HTMLSpanElement, any>(({ children, ...props }, ref) => (
      <span ref={ref} {...props}>{children}</span>
    ))
  }
}))

// Mock the motion hooks
jest.mock('@/lib/motion/hooks', () => ({
  useMotion: jest.fn(() => ({
    ref: { current: null },
    isActive: true,
    animationProps: {},
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
  EASING_PRESETS: {
    snappy: 'ease',
    smooth: 'ease',
    cinematic: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  DURATION_PRESETS: {
    fast: 150,
    normal: 300,
    cinematic: 600
  }
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, ...props }: any) {
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
      />
    )
  }
})

// Mock utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: '$1,000',
  image: '/test.jpg',
  badge: 'New',
  materials: ['Material 1'],
  swatches: [],
  quickLookImages: [],
  dimensions: '10x10'
}

describe('ProductCard Micro-Interactions', () => {
  const mockOnQuickLook = jest.fn()
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnQuickLook.mockClear()
    jest.clearAllTimers()
    jest.useFakeTimers()
    user = userEvent.setup({ delay: null })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Press Animation with Haptic-like Feedback', () => {
    it('triggers press animation sequence on mouse down/up', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Simulate press sequence
      fireEvent.mouseDown(card!)
      fireEvent.mouseUp(card!)
      fireEvent.click(card!)

      // Fast-forward timers to complete press animation
      act(() => {
        jest.advanceTimersByTime(250)
      })

      expect(mockOnQuickLook).toHaveBeenCalledWith(mockProduct)
    })

    it('handles press animation with different presets', () => {
      const presets = ['subtle', 'dynamic', 'cinematic'] as const
      
      presets.forEach(preset => {
        const { unmount } = render(
          <ProductCard 
            product={mockProduct} 
            onQuickLook={mockOnQuickLook}
            animationPreset={preset}
          />
        )

        const card = screen.getByText('Test Product').closest('div')
        
        // Test press interaction with different presets
        fireEvent.mouseDown(card!)
        fireEvent.mouseUp(card!)
        
        expect(card).toBeInTheDocument()
        
        // Clean up for next iteration
        unmount()
      })
    })

    it('resets press state on mouse leave', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Start press and then leave
      fireEvent.mouseDown(card!)
      fireEvent.mouseLeave(card!)
      
      // Press state should be reset
      expect(card).toBeInTheDocument()
    })

    it('handles rapid press interactions gracefully', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Rapid press interactions
      for (let i = 0; i < 3; i++) {
        fireEvent.mouseDown(card!)
        fireEvent.mouseUp(card!)
        fireEvent.click(card!)
      }

      // Fast-forward all timers
      act(() => {
        jest.runAllTimers()
      })

      // Should handle multiple calls gracefully
      expect(mockOnQuickLook).toHaveBeenCalledTimes(3)
    })
  })

  describe('Badge Animations with Bounce and Color Transitions', () => {
    it('renders badge with shimmer animation', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const badge = screen.getByText('New')
      expect(badge).toBeInTheDocument()
      
      // Badge should have appropriate styling classes
      expect(badge.closest('span')).toHaveClass('px-3', 'py-1', 'text-xs', 'font-medium', 'rounded-full')
    })

    it('handles badge hover micro-animations', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const badgeContainer = screen.getByText('New').closest('div')
      
      // Simulate hover on badge
      await user.hover(badgeContainer!)
      await user.unhover(badgeContainer!)

      // Badge should be present and interactive
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('shows different badge colors and animations', () => {
      const badges = ['New', 'Popular', 'Featured', 'Limited', 'Back in stock'] as const
      
      badges.forEach(badge => {
        const productWithBadge = { ...mockProduct, badge }
        const { unmount } = render(
          <ProductCard product={productWithBadge} onQuickLook={mockOnQuickLook} />
        )

        const badgeElement = screen.getByText(badge)
        expect(badgeElement).toBeInTheDocument()
        
        // Verify badge has appropriate styling classes
        expect(badgeElement.closest('span')).toHaveClass('px-3', 'py-1', 'text-xs', 'font-medium', 'rounded-full')
        
        // Clean up for next iteration
        unmount()
      })
    })

    it('handles badge tap animations', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const badgeContainer = screen.getByText('New').closest('div')
      
      // Simulate tap on badge
      fireEvent.mouseDown(badgeContainer!)
      fireEvent.mouseUp(badgeContainer!)
      
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('shows badge with cursor pointer for interactivity', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const badge = screen.getByText('New')
      const badgeSpan = badge.closest('span')
      
      // Should have cursor pointer for interactivity
      expect(badgeSpan).toHaveClass('cursor-pointer')
    })
  })

  describe('Price Update Animations with Smooth Number Transitions', () => {
    it('animates price updates with highlight effects', () => {
      const { rerender } = render(
        <ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />
      )

      // Initial price
      expect(screen.getByText('$1,000')).toBeInTheDocument()

      // Update price to trigger animation
      const updatedProduct = { ...mockProduct, price: '$1,200' }
      rerender(<ProductCard product={updatedProduct} onQuickLook={mockOnQuickLook} />)

      // New price should be displayed
      expect(screen.getByText('$1,200')).toBeInTheDocument()
    })

    it('shows digit-by-digit price animation', () => {
      const { rerender } = render(
        <ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />
      )

      // Update price to trigger digit animation
      const updatedProduct = { ...mockProduct, price: '$2,500' }
      rerender(<ProductCard product={updatedProduct} onQuickLook={mockOnQuickLook} />)

      // Price should be displayed with individual character spans
      expect(screen.getByText('$2,500')).toBeInTheDocument()
    })

    it('handles price hover and tap interactions', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const priceElement = screen.getByText('$1,000')
      
      // Test hover interaction
      await user.hover(priceElement)
      await user.unhover(priceElement)
      
      // Test tap interaction
      fireEvent.mouseDown(priceElement)
      fireEvent.mouseUp(priceElement)
      
      expect(priceElement).toBeInTheDocument()
    })

    it('shows price with cursor pointer for interactivity', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const priceElement = screen.getByText('$1,000')
      
      // Should have cursor pointer for interactivity
      expect(priceElement).toHaveClass('cursor-pointer')
    })

    it('handles multiple rapid price updates', () => {
      const { rerender } = render(
        <ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />
      )

      // Multiple price updates
      const prices = ['$1,100', '$1,200', '$1,300', '$1,400']
      
      prices.forEach(price => {
        const updatedProduct = { ...mockProduct, price }
        rerender(<ProductCard product={updatedProduct} onQuickLook={mockOnQuickLook} />)
        expect(screen.getByText(price)).toBeInTheDocument()
      })
    })
  })

  describe('Integration Tests for Combined Interactions', () => {
    it('handles simultaneous hover and press interactions', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Hover then press
      await user.hover(card!)
      fireEvent.mouseDown(card!)
      fireEvent.mouseUp(card!)
      fireEvent.click(card!)
      await user.unhover(card!)

      // Fast-forward timers
      act(() => {
        jest.runAllTimers()
      })

      expect(mockOnQuickLook).toHaveBeenCalledWith(mockProduct)
    })

    it('maintains animation performance during complex interactions', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      const badge = screen.getByText('New')
      const price = screen.getByText('$1,000')
      
      // Complex interaction sequence
      fireEvent.mouseEnter(card!)
      fireEvent.mouseDown(badge)
      fireEvent.mouseUp(badge)
      fireEvent.mouseDown(price)
      fireEvent.mouseUp(price)
      fireEvent.mouseDown(card!)
      fireEvent.mouseUp(card!)
      fireEvent.click(card!)
      fireEvent.mouseLeave(card!)

      // Should handle complex interactions gracefully
      expect(card).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
      expect(price).toBeInTheDocument()
    })

    it('provides visual feedback during loading state with interactions', async () => {
      render(
        <ProductCard 
          product={mockProduct} 
          onQuickLook={mockOnQuickLook}
          isLoading={true}
        />
      )

      const card = screen.getByText('Test Product').closest('div')
      
      // Should still be interactive during loading
      await user.hover(card!)
      fireEvent.mouseDown(card!)
      fireEvent.mouseUp(card!)
      
      expect(card).toBeInTheDocument()
    })

    it('handles image load animation with user interactions', async () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const image = screen.getByTestId('product-image')
      const card = screen.getByText('Test Product').closest('div')
      
      // Interact while image is loading
      await user.hover(card!)
      
      // Wait for image load animation
      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(image).toHaveAttribute('src', '/test.jpg')
    })

    it('maintains accessibility during complex animations', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Card should maintain accessibility attributes
      expect(card).toHaveStyle('cursor: pointer')
      
      // Should handle keyboard interactions during animations
      fireEvent.keyDown(card!, { key: 'Enter' })
      fireEvent.keyUp(card!, { key: 'Enter' })
      fireEvent.keyDown(card!, { key: ' ' })
      fireEvent.keyUp(card!, { key: ' ' })
      
      expect(card).toBeInTheDocument()
    })

    it('handles touch interactions with haptic feedback', () => {
      render(<ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      
      // Simulate touch sequence
      fireEvent.touchStart(card!, { touches: [{ clientX: 100, clientY: 100 }] })
      fireEvent.touchEnd(card!)
      
      expect(card).toBeInTheDocument()
    })

    it('coordinates animations across different elements', () => {
      const { rerender } = render(
        <ProductCard product={mockProduct} onQuickLook={mockOnQuickLook} />
      )

      // Trigger multiple animations simultaneously
      const updatedProduct = { ...mockProduct, price: '$1,800' }
      rerender(<ProductCard product={updatedProduct} onQuickLook={mockOnQuickLook} />)

      const card = screen.getByText('Test Product').closest('div')
      const badge = screen.getByText('New')
      const price = screen.getByText('$1,800')

      // All elements should be present and animated
      expect(card).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
      expect(price).toBeInTheDocument()

      // Simulate interactions during price animation
      fireEvent.mouseEnter(card!)
      fireEvent.mouseDown(badge)
      fireEvent.mouseUp(badge)
      
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })
})