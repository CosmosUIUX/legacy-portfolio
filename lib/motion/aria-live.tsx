'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

interface AriaLiveContextType {
  announce: (message: string, priority?: 'polite' | 'assertive', delay?: number) => void
  announceWithId: (id: string, message: string, priority?: 'polite' | 'assertive') => void
  clearAnnouncement: (id?: string) => void
  setAnnouncementFilter: (filter: (message: string) => boolean) => void
}

const AriaLiveContext = createContext<AriaLiveContextType | null>(null)

interface AriaLiveProviderProps {
  children: React.ReactNode
  maxAnnouncements?: number
  announcementDelay?: number
}

/**
 * Provider for managing ARIA live announcements
 */
export function AriaLiveProvider({
  children,
  maxAnnouncements = 5,
  announcementDelay = 100
}: AriaLiveProviderProps) {
  const politeRegionRef = useRef<HTMLDivElement>(null)
  const assertiveRegionRef = useRef<HTMLDivElement>(null)
  const [announcements, setAnnouncements] = useState<Map<string, {
    message: string
    priority: 'polite' | 'assertive'
    timestamp: number
  }>>(new Map())
  const [announcementFilter, setAnnouncementFilter] = useState<((message: string) => boolean) | null>(null)
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clean up old announcements
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      setAnnouncements(prev => {
        const filtered = new Map()
        for (const [id, announcement] of prev) {
          if (now - announcement.timestamp < 30000) { // Keep for 30 seconds
            filtered.set(id, announcement)
          }
        }
        return filtered
      })
    }, 5000)

    return () => clearInterval(cleanup)
  }, [])

  const announce = (
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    delay: number = announcementDelay
  ) => {
    // Apply filter if set
    if (announcementFilter && !announcementFilter(message)) {
      return
    }

    const id = `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    announceWithId(id, message, priority)
  }

  const announceWithId = (
    id: string,
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    // Clear existing timeout for this ID
    const existingTimeout = timeoutRefs.current.get(id)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Add announcement
    setAnnouncements(prev => {
      const newMap = new Map(prev)
      newMap.set(id, {
        message,
        priority,
        timestamp: Date.now()
      })
      
      // Limit number of announcements
      if (newMap.size > maxAnnouncements) {
        const oldest = Array.from(newMap.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
        newMap.delete(oldest[0])
      }
      
      return newMap
    })

    // Update the appropriate live region
    const timeout = setTimeout(() => {
      const region = priority === 'assertive' ? assertiveRegionRef.current : politeRegionRef.current
      if (region) {
        region.textContent = message
        
        // Clear the region after a delay to allow for repeated announcements
        setTimeout(() => {
          if (region.textContent === message) {
            region.textContent = ''
          }
        }, 1000)
      }
      
      timeoutRefs.current.delete(id)
    }, announcementDelay)

    timeoutRefs.current.set(id, timeout)
  }

  const clearAnnouncement = (id?: string) => {
    if (id) {
      const timeout = timeoutRefs.current.get(id)
      if (timeout) {
        clearTimeout(timeout)
        timeoutRefs.current.delete(id)
      }
      
      setAnnouncements(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    } else {
      // Clear all announcements
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current.clear()
      setAnnouncements(new Map())
      
      if (politeRegionRef.current) politeRegionRef.current.textContent = ''
      if (assertiveRegionRef.current) assertiveRegionRef.current.textContent = ''
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  const contextValue: AriaLiveContextType = {
    announce,
    announceWithId,
    clearAnnouncement,
    setAnnouncementFilter
  }

  return (
    <AriaLiveContext.Provider value={contextValue}>
      {children}
      
      {/* ARIA Live Regions */}
      <div
        ref={politeRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      />
      
      <div
        ref={assertiveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      />
    </AriaLiveContext.Provider>
  )
}

/**
 * Hook to access ARIA live announcements
 */
export function useAriaLive() {
  const context = useContext(AriaLiveContext)
  if (!context) {
    throw new Error('useAriaLive must be used within an AriaLiveProvider')
  }
  return context
}

/**
 * Component for announcing animation states
 */
export function AnimationAnnouncer({
  animationState,
  messages,
  priority = 'polite'
}: {
  animationState: 'idle' | 'animating' | 'complete' | 'error' | 'loading'
  messages?: {
    animating?: string
    complete?: string
    error?: string
    loading?: string
  }
  priority?: 'polite' | 'assertive'
}) {
  const { announce } = useAriaLive()
  const previousStateRef = useRef<string>('')

  const defaultMessages = {
    animating: 'Animation started',
    complete: 'Animation completed',
    error: 'Animation error occurred',
    loading: 'Content is loading'
  }

  const effectiveMessages = { ...defaultMessages, ...messages }

  useEffect(() => {
    if (previousStateRef.current !== animationState) {
      const message = effectiveMessages[animationState as keyof typeof effectiveMessages]
      if (message) {
        const effectivePriority = animationState === 'error' ? 'assertive' : priority
        announce(message, effectivePriority)
      }
      previousStateRef.current = animationState
    }
  }, [animationState, effectiveMessages, priority, announce])

  return null
}

/**
 * Component for announcing route changes
 */
export function RouteAnnouncer() {
  const { announce } = useAriaLive()
  const previousPathRef = useRef<string>('')

  useEffect(() => {
    const currentPath = window.location.pathname
    
    if (previousPathRef.current && previousPathRef.current !== currentPath) {
      const pageTitle = document.title || 'New page'
      announce(`Navigated to ${pageTitle}`, 'polite', 500) // Slight delay for route transitions
    }
    
    previousPathRef.current = currentPath
  })

  return null
}

/**
 * Component for announcing form validation results
 */
export function FormValidationAnnouncer({
  errors,
  isValid,
  isSubmitting,
  submitSuccess,
  submitError
}: {
  errors?: Record<string, string>
  isValid?: boolean
  isSubmitting?: boolean
  submitSuccess?: boolean
  submitError?: string
}) {
  const { announce } = useAriaLive()
  const previousErrorsRef = useRef<Record<string, string>>({})
  const previousSubmittingRef = useRef<boolean>(false)

  // Announce validation errors
  useEffect(() => {
    if (errors) {
      const newErrors = Object.entries(errors).filter(
        ([field, error]) => previousErrorsRef.current[field] !== error
      )
      
      if (newErrors.length > 0) {
        const errorMessages = newErrors.map(([field, error]) => `${field}: ${error}`)
        announce(`Form validation errors: ${errorMessages.join(', ')}`, 'assertive')
      }
      
      previousErrorsRef.current = errors
    }
  }, [errors, announce])

  // Announce form submission states
  useEffect(() => {
    if (isSubmitting && !previousSubmittingRef.current) {
      announce('Form is being submitted', 'polite')
    } else if (!isSubmitting && previousSubmittingRef.current) {
      if (submitSuccess) {
        announce('Form submitted successfully', 'polite')
      } else if (submitError) {
        announce(`Form submission failed: ${submitError}`, 'assertive')
      }
    }
    
    previousSubmittingRef.current = isSubmitting || false
  }, [isSubmitting, submitSuccess, submitError, announce])

  return null
}

/**
 * Hook for creating contextual announcements
 */
export function useContextualAnnouncements() {
  const { announce, announceWithId, clearAnnouncement } = useAriaLive()

  const announceInteraction = (
    interaction: 'hover' | 'focus' | 'click' | 'select' | 'expand' | 'collapse',
    target: string,
    additionalInfo?: string
  ) => {
    const messages = {
      hover: `Hovering over ${target}`,
      focus: `Focused on ${target}`,
      click: `Clicked ${target}`,
      select: `Selected ${target}`,
      expand: `Expanded ${target}`,
      collapse: `Collapsed ${target}`
    }

    const message = additionalInfo 
      ? `${messages[interaction]}. ${additionalInfo}`
      : messages[interaction]

    announce(message, 'polite')
  }

  const announceProgress = (
    current: number,
    total: number,
    label?: string
  ) => {
    const percentage = Math.round((current / total) * 100)
    const message = label 
      ? `${label}: ${percentage}% complete (${current} of ${total})`
      : `Progress: ${percentage}% complete (${current} of ${total})`
    
    announceWithId('progress', message, 'polite')
  }

  const announceStatus = (
    status: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => {
    const priority = status === 'error' ? 'assertive' : 'polite'
    const prefixedMessage = `${status.charAt(0).toUpperCase() + status.slice(1)}: ${message}`
    
    announce(prefixedMessage, priority)
  }

  return {
    announceInteraction,
    announceProgress,
    announceStatus,
    announce,
    announceWithId,
    clearAnnouncement
  }
}