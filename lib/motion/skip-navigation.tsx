'use client'

import React, { useEffect, useState } from 'react'
import { useKeyboardNavigation } from './accessibility'

interface SkipNavigationProps {
  links?: Array<{
    href: string
    label: string
  }>
  className?: string
}

/**
 * Skip navigation component for keyboard accessibility
 * Provides quick navigation to main content areas
 */
export function SkipNavigation({ 
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' }
  ],
  className = ''
}: SkipNavigationProps) {
  const { isKeyboardUser } = useKeyboardNavigation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show skip links on Tab key press
      if (event.key === 'Tab' && !event.shiftKey) {
        setIsVisible(true)
      }
    }

    const handleFocusOut = (event: FocusEvent) => {
      // Hide skip links when focus moves away from them
      const target = event.target as HTMLElement
      const relatedTarget = event.relatedTarget as HTMLElement
      
      if (target?.closest('.skip-navigation') && 
          !relatedTarget?.closest('.skip-navigation')) {
        setTimeout(() => setIsVisible(false), 100)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  if (!isKeyboardUser && !isVisible) {
    return null
  }

  return (
    <nav 
      className={`skip-navigation ${className}`}
      aria-label="Skip navigation"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10000,
        background: '#000',
        color: '#fff',
        padding: '8px',
        borderRadius: '0 0 4px 0',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.2s ease',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <ul style={{ 
        listStyle: 'none', 
        margin: 0, 
        padding: 0, 
        display: 'flex', 
        gap: '8px' 
      }}>
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              style={{
                color: '#fff',
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: '2px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onFocus={() => setIsVisible(true)}
              onClick={() => {
                // Ensure target element gets focus
                setTimeout(() => {
                  const target = document.querySelector(link.href)
                  if (target) {
                    (target as HTMLElement).focus()
                  }
                }, 100)
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Hook to manage skip navigation functionality
 */
export function useSkipNavigation() {
  const [skipTargets, setSkipTargets] = useState<Array<{
    id: string
    label: string
    element: HTMLElement
  }>>([])

  const registerSkipTarget = (id: string, label: string, element: HTMLElement) => {
    setSkipTargets(prev => {
      const existing = prev.find(target => target.id === id)
      if (existing) {
        return prev.map(target => 
          target.id === id ? { id, label, element } : target
        )
      }
      return [...prev, { id, label, element }]
    })
  }

  const unregisterSkipTarget = (id: string) => {
    setSkipTargets(prev => prev.filter(target => target.id !== id))
  }

  const skipToTarget = (id: string) => {
    const target = skipTargets.find(t => t.id === id)
    if (target) {
      target.element.focus()
      target.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return {
    skipTargets,
    registerSkipTarget,
    unregisterSkipTarget,
    skipToTarget
  }
}

/**
 * Component to mark content areas as skip targets
 */
export function SkipTarget({ 
  id, 
  label, 
  children, 
  as: Component = 'div',
  ...props 
}: {
  id: string
  label: string
  children: React.ReactNode
  as?: React.ElementType
  [key: string]: any
}) {
  const { registerSkipTarget, unregisterSkipTarget } = useSkipNavigation()
  const elementRef = React.useRef<HTMLElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      registerSkipTarget(id, label, elementRef.current)
      
      // Ensure element is focusable
      if (!elementRef.current.hasAttribute('tabindex')) {
        elementRef.current.setAttribute('tabindex', '-1')
      }
      
      return () => unregisterSkipTarget(id)
    }
  }, [id, label, registerSkipTarget, unregisterSkipTarget])

  return (
    <Component
      ref={elementRef}
      id={id}
      aria-label={label}
      {...props}
    >
      {children}
    </Component>
  )
}