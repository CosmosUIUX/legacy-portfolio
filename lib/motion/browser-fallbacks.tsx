/**
 * Browser fallback components for Motion.dev animations
 * Provides graceful degradation for unsupported browsers
 */

import React, { useEffect, useState } from 'react'
import { detectBrowser, checkFeatureSupport, getBrowserClasses, prefersReducedMotion } from './browser-detection'
import type { BrowserInfo, FeatureSupport } from './browser-detection'

interface FallbackProviderProps {
  children: React.ReactNode
}

interface FallbackContextValue {
  browser: BrowserInfo
  features: FeatureSupport
  shouldUseFallbacks: boolean
  cssClasses: string[]
}

const FallbackContext = React.createContext<FallbackContextValue | null>(null)

/**
 * Provider that detects browser capabilities and provides fallback context
 */
export function BrowserFallbackProvider({ children }: FallbackProviderProps) {
  const [browser] = useState(() => detectBrowser())
  const [features] = useState(() => checkFeatureSupport())
  const [shouldUseFallbacks, setShouldUseFallbacks] = useState(false)

  useEffect(() => {
    // Determine if fallbacks should be used based on browser support
    const needsFallbacks = 
      !features.intersectionObserver ||
      !features.requestAnimationFrame ||
      !browser.supportsModernCSS ||
      prefersReducedMotion()

    setShouldUseFallbacks(needsFallbacks)

    // Add browser classes to document
    const cssClasses = getBrowserClasses(browser)
    document.documentElement.classList.add(...cssClasses)

    return () => {
      document.documentElement.classList.remove(...cssClasses)
    }
  }, [browser, features])

  const contextValue: FallbackContextValue = {
    browser,
    features,
    shouldUseFallbacks,
    cssClasses: getBrowserClasses(browser)
  }

  return (
    <FallbackContext.Provider value={contextValue}>
      {children}
    </FallbackContext.Provider>
  )
}

/**
 * Hook to access browser fallback context
 */
export function useBrowserFallbacks() {
  const context = React.useContext(FallbackContext)
  if (!context) {
    throw new Error('useBrowserFallbacks must be used within BrowserFallbackProvider')
  }
  return context
}

/**
 * Fallback animated text component for browsers without full animation support
 */
export function FallbackAnimatedText({ 
  text, 
  className = '' 
}: { 
  text: string
  className?: string 
}) {
  const { shouldUseFallbacks } = useBrowserFallbacks()
  
  if (shouldUseFallbacks) {
    return (
      <div 
        className={`fallback-animated-text ${className}`}
        style={{
          opacity: 1,
          transform: 'none',
          transition: 'opacity 0.3s ease'
        }}
      >
        {text}
      </div>
    )
  }

  // Return null to let the main component handle animation
  return null
}

/**
 * Fallback product card component with CSS-only animations
 */
export function FallbackProductCard({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const { shouldUseFallbacks, features } = useBrowserFallbacks()
  
  if (shouldUseFallbacks) {
    return (
      <div 
        className={`fallback-product-card ${className}`}
        style={{
          transition: features.transforms3d 
            ? 'transform 0.2s ease, box-shadow 0.2s ease'
            : 'box-shadow 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (features.transforms3d) {
            e.currentTarget.style.transform = 'scale(1.02)'
          }
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          if (features.transforms3d) {
            e.currentTarget.style.transform = 'scale(1)'
          }
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        {children}
      </div>
    )
  }

  return null
}

/**
 * Fallback parallax component with CSS-only effects
 */
export function FallbackParallax({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const { shouldUseFallbacks, features } = useBrowserFallbacks()
  
  useEffect(() => {
    if (!shouldUseFallbacks || !features.transforms3d) return

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallaxElements = document.querySelectorAll('.fallback-parallax')
      
      parallaxElements.forEach((element) => {
        const rate = scrolled * -0.5
        ;(element as HTMLElement).style.transform = `translateY(${rate}px)`
      })
    }

    // Use throttled scroll for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [shouldUseFallbacks, features.transforms3d])
  
  if (shouldUseFallbacks) {
    return (
      <div 
        className={`fallback-parallax ${className}`}
        style={{
          willChange: features.transforms3d ? 'transform' : 'auto',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </div>
    )
  }

  return null
}

/**
 * Fallback sidebar component with CSS transitions
 */
export function FallbackSidebar({ 
  isOpen, 
  children, 
  onClose,
  className = '' 
}: { 
  isOpen: boolean
  children: React.ReactNode
  onClose: () => void
  className?: string 
}) {
  const { shouldUseFallbacks, features } = useBrowserFallbacks()
  
  if (shouldUseFallbacks) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fallback-sidebar-backdrop"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: features.backdropFilter 
                ? 'rgba(0, 0, 0, 0.5)'
                : 'rgba(0, 0, 0, 0.7)',
              backdropFilter: features.backdropFilter ? 'blur(4px)' : 'none',
              zIndex: 998,
              transition: 'opacity 0.3s ease'
            }}
            onClick={onClose}
          />
        )}
        
        {/* Sidebar */}
        <div
          className={`fallback-sidebar ${className}`}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '300px',
            backgroundColor: '#fff',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            zIndex: 999,
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            overflow: 'auto'
          }}
        >
          {children}
        </div>
      </>
    )
  }

  return null
}

/**
 * Fallback page transition component
 */
export function FallbackPageTransition({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const { shouldUseFallbacks } = useBrowserFallbacks()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    if (shouldUseFallbacks) {
      // Simple fade-in effect
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    }
  }, [shouldUseFallbacks])
  
  if (shouldUseFallbacks) {
    return (
      <div 
        className={`fallback-page-transition ${className}`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          transform: 'none'
        }}
      >
        {children}
      </div>
    )
  }

  return null
}

/**
 * Higher-order component that provides fallback behavior
 */
export function withBrowserFallback<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    const { shouldUseFallbacks } = useBrowserFallbacks()
    
    if (shouldUseFallbacks) {
      return <FallbackComponent {...props} />
    }
    
    return <Component {...props} />
  }
}

/**
 * Conditional rendering based on browser capabilities
 */
export function BrowserConditional({
  feature,
  fallback,
  children
}: {
  feature: keyof FeatureSupport
  fallback: React.ReactNode
  children: React.ReactNode
}) {
  const { features } = useBrowserFallbacks()
  
  return features[feature] ? <>{children}</> : <>{fallback}</>
}

/**
 * Performance-aware component that adjusts based on device capabilities
 */
export function PerformanceAware({
  high,
  medium,
  low
}: {
  high: React.ReactNode
  medium: React.ReactNode
  low: React.ReactNode
}) {
  const { browser } = useBrowserFallbacks()
  const [performanceTier, setPerformanceTier] = useState<'high' | 'medium' | 'low'>('medium')
  
  useEffect(() => {
    // Simple performance detection based on browser and hardware
    const cores = navigator.hardwareConcurrency || 2
    const memory = (navigator as any).deviceMemory || 4
    
    if (browser.supportsModernCSS && cores >= 8 && memory >= 8) {
      setPerformanceTier('high')
    } else if (cores >= 4 && memory >= 4) {
      setPerformanceTier('medium')
    } else {
      setPerformanceTier('low')
    }
  }, [browser])
  
  switch (performanceTier) {
    case 'high':
      return <>{high}</>
    case 'medium':
      return <>{medium}</>
    case 'low':
      return <>{low}</>
    default:
      return <>{medium}</>
  }
}