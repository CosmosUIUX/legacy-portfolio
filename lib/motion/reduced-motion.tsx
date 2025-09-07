'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useReducedMotion } from './accessibility'

interface ReducedMotionContextType {
  reducedMotion: boolean
  motionPreference: 'no-preference' | 'reduce'
  setMotionPreference: (preference: 'no-preference' | 'reduce') => void
  respectSystemPreference: boolean
  setRespectSystemPreference: (respect: boolean) => void
}

const ReducedMotionContext = createContext<ReducedMotionContextType | null>(null)

interface ReducedMotionProviderProps {
  children: React.ReactNode
  defaultRespectSystem?: boolean
  fallbackToStatic?: boolean
}

/**
 * Provider for managing reduced motion preferences
 */
export function ReducedMotionProvider({
  children,
  defaultRespectSystem = true,
  fallbackToStatic = true
}: ReducedMotionProviderProps) {
  const systemReducedMotion = useReducedMotion()
  const [respectSystemPreference, setRespectSystemPreference] = useState(defaultRespectSystem)
  const [userMotionPreference, setUserMotionPreference] = useState<'no-preference' | 'reduce'>('no-preference')

  // Load user preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('motion-preference')
    if (stored === 'reduce' || stored === 'no-preference') {
      setUserMotionPreference(stored)
    }

    const storedRespectSystem = localStorage.getItem('respect-system-motion')
    if (storedRespectSystem !== null) {
      setRespectSystemPreference(storedRespectSystem === 'true')
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('motion-preference', userMotionPreference)
    localStorage.setItem('respect-system-motion', respectSystemPreference.toString())
  }, [userMotionPreference, respectSystemPreference])

  const effectiveReducedMotion = respectSystemPreference 
    ? systemReducedMotion 
    : userMotionPreference === 'reduce'

  const contextValue: ReducedMotionContextType = {
    reducedMotion: effectiveReducedMotion,
    motionPreference: respectSystemPreference 
      ? (systemReducedMotion ? 'reduce' : 'no-preference')
      : userMotionPreference,
    setMotionPreference: setUserMotionPreference,
    respectSystemPreference,
    setRespectSystemPreference
  }

  // Apply global CSS class for reduced motion
  useEffect(() => {
    if (effectiveReducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }

    return () => {
      document.documentElement.classList.remove('reduced-motion')
    }
  }, [effectiveReducedMotion])

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

/**
 * Hook to access reduced motion context
 */
export function useReducedMotionContext() {
  const context = useContext(ReducedMotionContext)
  if (!context) {
    throw new Error('useReducedMotionContext must be used within a ReducedMotionProvider')
  }
  return context
}

/**
 * Component for conditionally rendering content based on motion preference
 */
export function MotionPreference({
  children,
  fallback,
  showFallbackOnReduce = true
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  showFallbackOnReduce?: boolean
}) {
  const { reducedMotion } = useReducedMotionContext()

  if (reducedMotion && showFallbackOnReduce && fallback) {
    return <>{fallback}</>
  }

  if (reducedMotion && showFallbackOnReduce && !fallback) {
    return null
  }

  return <>{children}</>
}

/**
 * Hook for creating motion-safe animation configurations
 */
export function useMotionSafeAnimation<T extends Record<string, any>>(
  animationConfig: T,
  staticConfig?: Partial<T>
): T {
  const { reducedMotion } = useReducedMotionContext()

  if (reducedMotion) {
    return {
      ...animationConfig,
      ...staticConfig,
      duration: 0,
      transition: { duration: 0 },
      animate: staticConfig?.animate || animationConfig.animate,
      initial: staticConfig?.initial || animationConfig.animate // Use end state as initial
    } as T
  }

  return animationConfig
}

/**
 * Component for motion preference settings UI
 */
export function MotionPreferenceSettings({ 
  className = '',
  showSystemToggle = true 
}: {
  className?: string
  showSystemToggle?: boolean
}) {
  const {
    motionPreference,
    setMotionPreference,
    respectSystemPreference,
    setRespectSystemPreference,
    reducedMotion
  } = useReducedMotionContext()

  return (
    <div className={`motion-preference-settings ${className}`}>
      <fieldset>
        <legend>Animation Preferences</legend>
        
        {showSystemToggle && (
          <div className="preference-option">
            <label>
              <input
                type="checkbox"
                checked={respectSystemPreference}
                onChange={(e) => setRespectSystemPreference(e.target.checked)}
              />
              Respect system preference
            </label>
            <p className="preference-description">
              Use your operating system's motion preference setting
            </p>
          </div>
        )}

        {!respectSystemPreference && (
          <div className="preference-option">
            <label>
              <input
                type="radio"
                name="motion-preference"
                value="no-preference"
                checked={motionPreference === 'no-preference'}
                onChange={() => setMotionPreference('no-preference')}
              />
              Enable animations
            </label>
            <label>
              <input
                type="radio"
                name="motion-preference"
                value="reduce"
                checked={motionPreference === 'reduce'}
                onChange={() => setMotionPreference('reduce')}
              />
              Reduce animations
            </label>
          </div>
        )}

        <div className="current-status">
          <p>
            Current status: <strong>{reducedMotion ? 'Reduced motion' : 'Animations enabled'}</strong>
          </p>
        </div>
      </fieldset>

      <style jsx>{`
        .motion-preference-settings {
          padding: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #f9f9f9;
        }

        fieldset {
          border: none;
          padding: 0;
          margin: 0;
        }

        legend {
          font-weight: bold;
          margin-bottom: 12px;
        }

        .preference-option {
          margin-bottom: 12px;
        }

        .preference-option label {
          display: block;
          margin-bottom: 4px;
          cursor: pointer;
        }

        .preference-option input {
          margin-right: 8px;
        }

        .preference-description {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0 24px;
        }

        .current-status {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
        }

        .current-status p {
          margin: 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

/**
 * Hook for detecting motion capability and performance
 */
export function useMotionCapability() {
  const [motionCapability, setMotionCapability] = useState<{
    supportsAnimations: boolean
    supportsTransforms: boolean
    supportsGPUAcceleration: boolean
    performanceLevel: 'high' | 'medium' | 'low'
  }>({
    supportsAnimations: true,
    supportsTransforms: true,
    supportsGPUAcceleration: true,
    performanceLevel: 'high'
  })

  useEffect(() => {
    // Test animation support
    const testElement = document.createElement('div')
    const supportsAnimations = 'animate' in testElement || 'webkitAnimate' in testElement
    
    // Test transform support
    const supportsTransforms = 'transform' in testElement.style || 
                              'webkitTransform' in testElement.style

    // Test GPU acceleration (simplified check)
    const supportsGPUAcceleration = 'transform3d' in testElement.style ||
                                   'webkitTransform3d' in testElement.style

    // Estimate performance level based on various factors
    let performanceLevel: 'high' | 'medium' | 'low' = 'high'
    
    // Check for performance hints
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        performanceLevel = 'low'
      } else if (connection.effectiveType === '3g') {
        performanceLevel = 'medium'
      }
    }

    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
      const deviceMemory = (navigator as any).deviceMemory
      if (deviceMemory < 2) {
        performanceLevel = 'low'
      } else if (deviceMemory < 4) {
        performanceLevel = 'medium'
      }
    }

    // Check hardware concurrency
    if (navigator.hardwareConcurrency < 2) {
      performanceLevel = 'low'
    } else if (navigator.hardwareConcurrency < 4) {
      performanceLevel = 'medium'
    }

    setMotionCapability({
      supportsAnimations,
      supportsTransforms,
      supportsGPUAcceleration,
      performanceLevel
    })
  }, [])

  return motionCapability
}

/**
 * Component that automatically adjusts animations based on device capability
 */
export function AdaptiveMotion({
  children,
  highPerformanceConfig,
  mediumPerformanceConfig,
  lowPerformanceConfig
}: {
  children: (config: any) => React.ReactNode
  highPerformanceConfig: any
  mediumPerformanceConfig: any
  lowPerformanceConfig: any
}) {
  const { performanceLevel } = useMotionCapability()
  const { reducedMotion } = useReducedMotionContext()

  let config = highPerformanceConfig
  
  if (reducedMotion) {
    config = { ...config, duration: 0, transition: { duration: 0 } }
  } else {
    switch (performanceLevel) {
      case 'medium':
        config = mediumPerformanceConfig
        break
      case 'low':
        config = lowPerformanceConfig
        break
      default:
        config = highPerformanceConfig
    }
  }

  return <>{children(config)}</>
}