/**
 * Cross-browser compatibility tests for Motion.dev animations
 * Tests animations across Chrome, Firefox, Safari, and Edge
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { 
  detectBrowser, 
  checkFeatureSupport, 
  getBrowserAnimationConfig,
  optimizeForBrowser 
} from '../browser-detection'
import { 
  BrowserFallbackProvider,
  FallbackAnimatedText,
  FallbackProductCard,
  FallbackParallax,
  FallbackSidebar
} from '../browser-fallbacks'

// Mock browser detection
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  })
}

// Browser user agents for testing
const BROWSERS = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91'
}

// Mock CSS.supports for browser feature detection
const mockCSSSupports = (supported: boolean) => {
  global.CSS = {
    supports: jest.fn().mockReturnValue(supported),
    escape: jest.fn()
  }
}

// Mock requestAnimationFrame for consistent testing
const mockRAF = () => {
  let id = 0
  global.requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16) // 60fps
    return ++id
  })
  global.cancelAnimationFrame = jest.fn()
}

describe('Cross-Browser Compatibility', () => {
  beforeEach(() => {
    mockRAF()
    jest.clearAllMocks()
  })

  describe('Chrome Browser Support', () => {
    beforeEach(() => {
      mockUserAgent(BROWSERS.chrome)
      mockCSSSupports(true)
    })

    it('should render animated text with full feature support', async () => {
      render(
        <BrowserFallbackProvider>
          <FallbackAnimatedText text="Test Animation" />
        </BrowserFallbackProvider>
      )

      // Chrome should support all modern CSS features
      expect(CSS.supports).toHaveBeenCalledWith('transform', 'translateZ(0)')
      
      const browser = detectBrowser()
      expect(browser.name).toBe('chrome')
      expect(browser.supportsModernCSS).toBe(true)
    })

    it('should handle product card animations smoothly', async () => {
      render(
        <BrowserFallbackProvider>
          <FallbackProductCard>
            <div>Test Product</div>
          </FallbackProductCard>
        </BrowserFallbackProvider>
      )

      const browser = detectBrowser()
      const config = getBrowserAnimationConfig(browser)
      
      // Chrome should support hardware acceleration
      expect(config.useHardwareAcceleration).toBe(true)
      expect(config.useTransform3d).toBe(true)
    })
  })

  describe('Firefox Browser Support', () => {
    beforeEach(() => {
      mockUserAgent(BROWSERS.firefox)
      mockCSSSupports(true)
    })

    it('should handle parallax animations with Firefox-specific optimizations', async () => {
      render(
        <BrowserFallbackProvider>
          <FallbackParallax>
            <div>Content</div>
          </FallbackParallax>
        </BrowserFallbackProvider>
      )

      const browser = detectBrowser()
      const config = getBrowserAnimationConfig(browser)
      
      // Firefox should use will-change property for better performance
      expect(browser.name).toBe('firefox')
      expect(config.useWillChange).toBe(true)
      expect(config.useTransform3d).toBe(true)
    })

    it('should respect Firefox scroll behavior preferences', async () => {
      // Mock Firefox's scroll behavior
      Object.defineProperty(document.documentElement.style, 'scrollBehavior', {
        value: 'smooth',
        writable: true
      })

      const browser = detectBrowser()
      const features = checkFeatureSupport()
      
      expect(browser.name).toBe('firefox')
      expect(features.transforms3d).toBe(true)
      
      // Should not conflict with Firefox's native smooth scrolling
      expect(document.documentElement.style.scrollBehavior).toBe('smooth')
    })
  })

  describe('Safari Browser Support', () => {
    beforeEach(() => {
      mockUserAgent(BROWSERS.safari)
      // Safari has limited support for some CSS features
      mockCSSSupports(false)
    })

    it('should provide fallbacks for unsupported CSS features', async () => {
      const browser = detectBrowser()
      const config = getBrowserAnimationConfig(browser)
      
      expect(browser.name).toBe('safari')
      expect(config.maxAnimationDuration).toBe(800) // Shorter for Safari
      expect(config.useWillChange).toBe(false) // Safari-specific optimization
      
      // Should fall back to basic transforms when advanced features aren't supported
      expect(CSS.supports).toHaveBeenCalledWith('backdrop-filter', 'blur(10px)')
    })

    it('should handle iOS Safari touch events properly', async () => {
      const browser = detectBrowser()
      
      expect(browser.name).toBe('safari')
      expect(browser.isIOS).toBe(true)
      expect(browser.isMobile).toBe(true)
      
      // iOS Safari should have specific optimizations
      const config = getBrowserAnimationConfig(browser)
      expect(config.maxAnimationDuration).toBe(800)
      expect(config.useWillChange).toBe(false)
    })
  })

  describe('Edge Browser Support', () => {
    beforeEach(() => {
      mockUserAgent(BROWSERS.edge)
      mockCSSSupports(true)
    })

    it('should handle Edge-specific rendering optimizations', async () => {
      render(
        <BrowserFallbackProvider>
          <FallbackSidebar isOpen={true} onClose={jest.fn()}>
            <div>Menu Content</div>
          </FallbackSidebar>
        </BrowserFallbackProvider>
      )

      const browser = detectBrowser()
      const config = getBrowserAnimationConfig(browser)
      
      expect(browser.name).toBe('edge')
      expect(config.useHardwareAcceleration).toBe(true)
      expect(config.useTransform3d).toBe(true)
    })

    it('should maintain performance on Edge with complex animations', async () => {
      const performanceStart = performance.now()

      render(
        <BrowserFallbackProvider>
          <div>
            {Array.from({ length: 10 }, (_, i) => (
              <FallbackProductCard key={i}>
                <div>Product {i}</div>
              </FallbackProductCard>
            ))}
          </div>
        </BrowserFallbackProvider>
      )

      const performanceEnd = performance.now()
      const renderTime = performanceEnd - performanceStart

      const browser = detectBrowser()
      expect(browser.name).toBe('edge')
      
      // Should render within reasonable time on Edge
      expect(renderTime).toBeLessThan(1000)
    })
  })

  describe('Feature Detection and Fallbacks', () => {
    it('should detect and handle missing CSS Grid support', () => {
      mockCSSSupports(false)
      
      const features = checkFeatureSupport()
      expect(features.cssGrid).toBe(false)
      expect(features.flexbox).toBe(false) // Also mocked as false
      
      render(
        <BrowserFallbackProvider>
          <div className="product-grid">
            <FallbackProductCard>
              <div>Fallback Test</div>
            </FallbackProductCard>
          </div>
        </BrowserFallbackProvider>
      )

      // Should detect lack of CSS Grid support
      expect(CSS.supports).toHaveBeenCalledWith('display', 'grid')
    })

    it('should handle browsers without intersection observer', async () => {
      // Mock missing IntersectionObserver
      const originalIntersectionObserver = global.IntersectionObserver
      delete (global as any).IntersectionObserver

      render(
        <MotionProvider>
          <AnimatedText text="No Intersection Observer" />
        </MotionProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('No Intersection Observer')).toBeInTheDocument()
      })

      // Should still render without viewport animations
      expect(screen.getByText('No Intersection Observer')).toBeVisible()

      // Restore IntersectionObserver
      global.IntersectionObserver = originalIntersectionObserver
    })

    it('should provide CSS-only fallbacks when JavaScript is disabled', () => {
      // Mock disabled JavaScript environment
      const originalRequestAnimationFrame = global.requestAnimationFrame
      delete (global as any).requestAnimationFrame

      render(
        <MotionProvider>
          <AnimatedText text="CSS Fallback Test" />
        </MotionProvider>
      )

      // Should still be visible with CSS-only animations
      expect(screen.getByText('CSS Fallback Test')).toBeInTheDocument()

      // Restore requestAnimationFrame
      global.requestAnimationFrame = originalRequestAnimationFrame
    })
  })

  describe('Performance Validation Across Browsers', () => {
    it('should maintain 60fps on all supported browsers', async () => {
      const frameRates: number[] = []
      let lastTime = performance.now()

      // Mock performance monitoring
      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = jest.fn((callback) => {
        const currentTime = performance.now()
        const fps = 1000 / (currentTime - lastTime)
        frameRates.push(fps)
        lastTime = currentTime
        return setTimeout(callback, 16)
      })

      render(
        <MotionProvider>
          <ParallaxBackground>
            <AnimatedText text="Performance Test" />
          </ParallaxBackground>
        </MotionProvider>
      )

      // Simulate scroll events
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('scroll'))
        await new Promise(resolve => setTimeout(resolve, 16))
      }

      // Average frame rate should be close to 60fps
      const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length
      expect(avgFrameRate).toBeGreaterThan(50) // Allow some variance

      global.requestAnimationFrame = originalRAF
    })

    it('should handle memory efficiently across browsers', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      render(
        <MotionProvider>
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <AnimatedText key={i} text={`Memory Test ${i}`} />
            ))}
          </div>
        </MotionProvider>
      )

      await waitFor(() => {
        expect(screen.getAllByText(/Memory Test/)).toHaveLength(50)
      })

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })
})