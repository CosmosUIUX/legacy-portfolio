'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Hook to detect user's reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return reducedMotion
}

/**
 * Hook to detect if screen reader is active
 */
export function useScreenReader(): boolean {
  const [isScreenReader, setIsScreenReader] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for screen reader indicators
    const checkScreenReader = () => {
      // Check for common screen reader user agents or accessibility APIs
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        // @ts-ignore - speechSynthesis is not in all TypeScript definitions
        (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0)

      setIsScreenReader(hasScreenReader)
    }

    checkScreenReader()

    // Listen for focus events that might indicate keyboard navigation
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target && (event.target as HTMLElement).matches(':focus-visible')) {
        setIsScreenReader(true)
      }
    }

    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  return isScreenReader
}

/**
 * Utility to get accessibility-safe animation duration
 */
export function getAccessibleDuration(
  baseDuration: number,
  reducedMotion: boolean,
  performanceMode: 'high' | 'balanced' | 'battery' = 'balanced'
): number {
  if (reducedMotion) {
    return 0 // No animation for reduced motion
  }

  switch (performanceMode) {
    case 'battery':
      return baseDuration * 0.5 // Reduce duration for battery saving
    case 'high':
      return baseDuration
    case 'balanced':
    default:
      return baseDuration * 0.8 // Slightly reduce for balanced performance
  }
}

/**
 * Utility to check if animations should be disabled
 */
export function shouldDisableAnimations(
  reducedMotion: boolean,
  isScreenReader: boolean,
  performanceMode: 'high' | 'balanced' | 'battery'
): boolean {
  if (reducedMotion || isScreenReader) {
    return true
  }

  // Disable complex animations in battery mode
  if (performanceMode === 'battery') {
    return false // Still allow simple animations
  }

  return false
}

/**
 * Hook to manage keyboard navigation during animations
 */
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([])
  const focusedElementRef = useRef<HTMLElement | null>(null)
  const focusTrapRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab key indicates keyboard navigation
      if (event.key === 'Tab') {
        setIsKeyboardUser(true)
      }

      // Handle Escape key for dismissing animations/modals
      if (event.key === 'Escape') {
        // Allow components to handle escape
        const escapeEvent = new CustomEvent('animation-escape', {
          bubbles: true,
          cancelable: true,
          detail: { originalEvent: event }
        })
        
        if (focusedElementRef.current) {
          focusedElementRef.current.dispatchEvent(escapeEvent)
        } else {
          document.dispatchEvent(escapeEvent)
        }
      }

      // Handle arrow keys for navigation within animated components
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const navigationEvent = new CustomEvent('animation-navigate', {
          bubbles: true,
          cancelable: true,
          detail: { 
            direction: event.key.replace('Arrow', '').toLowerCase(),
            originalEvent: event 
          }
        })
        
        if (focusedElementRef.current) {
          focusedElementRef.current.dispatchEvent(navigationEvent)
        }
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      focusedElementRef.current = target
      
      // Update focus history (keep last 5 elements)
      setFocusHistory(prev => {
        const newHistory = [target, ...prev.filter(el => el !== target)].slice(0, 5)
        return newHistory
      })
    }

    const handleFocusOut = (event: FocusEvent) => {
      // Small delay to check if focus moved to another element
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          // Focus was lost, try to restore to last known good element
          const lastFocusable = focusHistory.find(el => 
            document.contains(el) && 
            !el.hasAttribute('disabled') &&
            el.tabIndex >= 0
          )
          
          if (lastFocusable) {
            lastFocusable.focus()
          }
        }
      }, 10)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [focusHistory])

  const preserveFocus = useCallback(() => {
    if (focusedElementRef.current && document.contains(focusedElementRef.current)) {
      focusedElementRef.current.focus()
    }
  }, [])

  const restoreFocus = useCallback(() => {
    const lastFocusable = focusHistory.find(el => 
      document.contains(el) && 
      !el.hasAttribute('disabled') &&
      el.tabIndex >= 0
    )
    
    if (lastFocusable) {
      lastFocusable.focus()
    }
  }, [focusHistory])

  const trapFocus = useCallback((container: HTMLElement) => {
    focusTrapRef.current = container
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTrapKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTrapKeyDown)
    
    // Focus first element
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleTrapKeyDown)
      focusTrapRef.current = null
    }
  }, [])

  const releaseFocusTrap = useCallback(() => {
    if (focusTrapRef.current) {
      focusTrapRef.current = null
      restoreFocus()
    }
  }, [restoreFocus])

  const getFocusableElements = useCallback((container: HTMLElement = document.body) => {
    return Array.from(container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )) as HTMLElement[]
  }, [])

  const getNextFocusableElement = useCallback((direction: 'next' | 'previous' = 'next') => {
    const focusableElements = getFocusableElements()
    const currentIndex = focusableElements.indexOf(focusedElementRef.current!)
    
    if (currentIndex === -1) return null

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length

    return focusableElements[nextIndex]
  }, [getFocusableElements])

  return {
    isKeyboardUser,
    focusedElement: focusedElementRef.current,
    focusHistory,
    preserveFocus,
    restoreFocus,
    trapFocus,
    releaseFocusTrap,
    getFocusableElements,
    getNextFocusableElement
  }
}

/**
 * Hook to manage ARIA announcements for animations
 */
export function useAriaAnnouncements() {
  const announcementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create ARIA live region for announcements
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    
    document.body.appendChild(liveRegion)
    announcementRef.current = liveRegion

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current)
      }
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority)
      announcementRef.current.textContent = message
      
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  return { announce }
}

/**
 * Hook to provide alternative interaction methods for animations
 */
export function useAlternativeInteractions() {
  const [interactionMode, setInteractionMode] = useState<'visual' | 'audio' | 'haptic' | 'text'>('visual')
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isHapticEnabled, setIsHapticEnabled] = useState(false)

  // Detect available interaction methods
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for audio support
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        setIsAudioEnabled(true)
      }
    } catch (e) {
      setIsAudioEnabled(false)
    }

    // Check for haptic support
    if ('vibrate' in navigator) {
      setIsHapticEnabled(true)
    }
  }, [])

  const triggerAlternativeAction = useCallback((
    action: string,
    element?: HTMLElement,
    options?: {
      audioFeedback?: boolean
      hapticFeedback?: boolean
      visualFeedback?: boolean
      textFeedback?: string
      intensity?: 'low' | 'medium' | 'high'
    }
  ) => {
    const { 
      audioFeedback = true, 
      hapticFeedback = true, 
      visualFeedback = true,
      textFeedback,
      intensity = 'medium'
    } = options || {}

    // Audio feedback with different tones for different actions
    if (audioFeedback && isAudioEnabled && (interactionMode === 'audio' || interactionMode === 'visual')) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Different frequencies for different actions
        let frequency = 800
        let duration = 0.1
        
        switch (action) {
          case 'activate':
          case 'click':
            frequency = 800
            duration = 0.1
            break
          case 'hover':
          case 'focus':
            frequency = 600
            duration = 0.05
            break
          case 'complete':
          case 'success':
            frequency = 1000
            duration = 0.15
            break
          case 'error':
          case 'warning':
            frequency = 400
            duration = 0.2
            break
          case 'navigation':
            frequency = 700
            duration = 0.08
            break
          default:
            frequency = 800
            duration = 0.1
        }

        // Adjust for intensity
        const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1
        duration *= intensityMultiplier

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (e) {
        console.warn('Audio feedback failed:', e)
      }
    }

    // Haptic feedback with different patterns
    if (hapticFeedback && isHapticEnabled && (interactionMode === 'haptic' || interactionMode === 'visual')) {
      try {
        let pattern: number | number[] = 50

        switch (action) {
          case 'activate':
          case 'click':
            pattern = intensity === 'low' ? 30 : intensity === 'high' ? 100 : 50
            break
          case 'hover':
          case 'focus':
            pattern = [20]
            break
          case 'complete':
          case 'success':
            pattern = [50, 50, 50]
            break
          case 'error':
          case 'warning':
            pattern = [100, 50, 100]
            break
          case 'navigation':
            pattern = [30, 30]
            break
          default:
            pattern = 50
        }

        navigator.vibrate(pattern)
      } catch (e) {
        console.warn('Haptic feedback failed:', e)
      }
    }

    // Enhanced visual feedback
    if (visualFeedback && element) {
      const originalOutline = element.style.outline
      const originalBoxShadow = element.style.boxShadow
      const originalTransform = element.style.transform

      // Different visual feedback for different actions
      switch (action) {
        case 'activate':
        case 'click':
          element.style.outline = '2px solid #007acc'
          element.style.boxShadow = '0 0 0 4px rgba(0, 122, 204, 0.3)'
          element.style.transform = 'scale(0.98)'
          break
        case 'hover':
        case 'focus':
          element.style.outline = '2px solid #007acc'
          element.style.boxShadow = '0 0 0 2px rgba(0, 122, 204, 0.2)'
          break
        case 'complete':
        case 'success':
          element.style.outline = '2px solid #22c55e'
          element.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.3)'
          break
        case 'error':
        case 'warning':
          element.style.outline = '2px solid #ef4444'
          element.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.3)'
          break
        default:
          element.style.outline = '2px solid #007acc'
          element.style.boxShadow = '0 0 0 2px rgba(0, 122, 204, 0.2)'
      }

      // Reset after feedback duration
      const resetDuration = intensity === 'low' ? 150 : intensity === 'high' ? 300 : 200
      setTimeout(() => {
        element.style.outline = originalOutline
        element.style.boxShadow = originalBoxShadow
        element.style.transform = originalTransform
      }, resetDuration)
    }

    // Text feedback for screen readers
    if (textFeedback && interactionMode === 'text') {
      // This would be handled by the announcement system
      return textFeedback
    }
  }, [interactionMode, isAudioEnabled, isHapticEnabled])

  const getAvailableInteractionMethods = useCallback(() => {
    const methods = ['visual']
    if (isAudioEnabled) methods.push('audio')
    if (isHapticEnabled) methods.push('haptic')
    methods.push('text')
    return methods
  }, [isAudioEnabled, isHapticEnabled])

  return {
    interactionMode,
    setInteractionMode,
    triggerAlternativeAction,
    availableInteractionMethods: getAvailableInteractionMethods(),
    isAudioEnabled,
    isHapticEnabled
  }
}

/**
 * Utility to add proper ARIA labels and descriptions to animated elements
 */
export function getAriaProps(
  element: 'button' | 'link' | 'card' | 'modal' | 'menu' | 'form' | 'navigation' | 'banner' | 'main' | 'complementary',
  state: 'idle' | 'animating' | 'complete' | 'error' | 'loading' | 'disabled',
  customLabels?: {
    label?: string
    description?: string
    announcement?: string
    instructions?: string
  }
) {
  const baseProps: Record<string, string> = {}

  // Base ARIA properties based on element type
  switch (element) {
    case 'button':
      baseProps['role'] = 'button'
      baseProps['aria-pressed'] = state === 'animating' || state === 'complete' ? 'true' : 'false'
      break
    case 'link':
      baseProps['role'] = 'link'
      break
    case 'card':
      baseProps['role'] = 'article'
      baseProps['tabIndex'] = state === 'disabled' ? '-1' : '0'
      break
    case 'modal':
      baseProps['role'] = 'dialog'
      baseProps['aria-modal'] = 'true'
      if (state === 'animating') {
        baseProps['aria-hidden'] = 'false'
      }
      break
    case 'menu':
      baseProps['role'] = 'menu'
      baseProps['aria-expanded'] = state === 'animating' || state === 'complete' ? 'true' : 'false'
      break
    case 'form':
      baseProps['role'] = 'form'
      break
    case 'navigation':
      baseProps['role'] = 'navigation'
      break
    case 'banner':
      baseProps['role'] = 'banner'
      break
    case 'main':
      baseProps['role'] = 'main'
      break
    case 'complementary':
      baseProps['role'] = 'complementary'
      break
  }

  // State-specific properties
  switch (state) {
    case 'animating':
      baseProps['aria-busy'] = 'true'
      baseProps['aria-live'] = 'polite'
      break
    case 'loading':
      baseProps['aria-busy'] = 'true'
      baseProps['aria-live'] = 'polite'
      baseProps['aria-label'] = customLabels?.label ? `${customLabels.label} (loading)` : 'Loading'
      break
    case 'error':
      baseProps['aria-invalid'] = 'true'
      baseProps['aria-live'] = 'assertive'
      break
    case 'disabled':
      baseProps['aria-disabled'] = 'true'
      baseProps['tabIndex'] = '-1'
      break
    case 'complete':
      baseProps['aria-busy'] = 'false'
      if (element === 'button') {
        baseProps['aria-pressed'] = 'true'
      }
      break
    case 'idle':
    default:
      baseProps['aria-busy'] = 'false'
      break
  }

  // Custom labels and descriptions
  if (customLabels?.label) {
    baseProps['aria-label'] = customLabels.label
  }

  if (customLabels?.description) {
    baseProps['aria-describedby'] = `${element}-description`
  }

  if (customLabels?.instructions) {
    baseProps['aria-describedby'] = baseProps['aria-describedby'] 
      ? `${baseProps['aria-describedby']} ${element}-instructions`
      : `${element}-instructions`
  }

  // Add keyboard shortcuts information
  if (element === 'modal') {
    baseProps['aria-describedby'] = baseProps['aria-describedby']
      ? `${baseProps['aria-describedby']} modal-keyboard-instructions`
      : 'modal-keyboard-instructions'
  }

  return baseProps
}

/**
 * Utility to ensure animations don't interfere with screen readers
 */
export function getScreenReaderSafeProps(
  isAnimating: boolean,
  content?: string
) {
  const props: Record<string, string> = {}

  if (isAnimating) {
    props['aria-hidden'] = 'true' // Hide from screen readers during animation
  } else {
    props['aria-hidden'] = 'false'
  }

  if (content) {
    props['aria-label'] = content
  }

  return props
}

/**
 * Accessibility-aware animation configuration
 */
export function getAccessibleAnimationConfig(
  baseConfig: any,
  reducedMotion: boolean,
  isScreenReader: boolean,
  performanceMode: 'high' | 'balanced' | 'battery' = 'balanced'
) {
  if (shouldDisableAnimations(reducedMotion, isScreenReader, performanceMode)) {
    return {
      ...baseConfig,
      duration: 0,
      transition: { duration: 0 }
    }
  }

  const accessibleDuration = getAccessibleDuration(
    baseConfig.duration || 0.3,
    reducedMotion,
    performanceMode
  )

  return {
    ...baseConfig,
    duration: accessibleDuration,
    transition: {
      ...baseConfig.transition,
      duration: accessibleDuration
    }
  }
}

/**
 * Generate accessibility instructions for animated components
 */
export function generateAccessibilityInstructions(
  componentType: string,
  interactions: string[] = [],
  customInstructions?: string
): {
  keyboardInstructions: string
  screenReaderInstructions: string
  generalInstructions: string
} {
  const baseKeyboardInstructions = [
    'Use Tab to navigate between elements',
    'Use Enter or Space to activate buttons',
    'Use Escape to close modals or cancel actions'
  ]

  const baseScreenReaderInstructions = [
    'Animation states will be announced automatically',
    'Use your screen reader\'s navigation commands to explore content',
    'Interactive elements will provide audio feedback when available'
  ]

  const componentSpecificInstructions: Record<string, {
    keyboard: string[]
    screenReader: string[]
  }> = {
    modal: {
      keyboard: [
        'Press Escape to close the modal',
        'Focus is trapped within the modal while open',
        'Tab cycles through focusable elements in the modal'
      ],
      screenReader: [
        'Modal opening and closing will be announced',
        'Focus will be moved to the modal when opened',
        'Focus will return to the trigger element when closed'
      ]
    },
    menu: {
      keyboard: [
        'Use Arrow keys to navigate menu items',
        'Press Enter to select a menu item',
        'Press Escape to close the menu'
      ],
      screenReader: [
        'Menu state changes will be announced',
        'Current menu item will be announced as you navigate',
        'Menu items count and position will be provided'
      ]
    },
    carousel: {
      keyboard: [
        'Use Arrow keys to navigate between slides',
        'Press Home to go to first slide',
        'Press End to go to last slide'
      ],
      screenReader: [
        'Slide changes will be announced with position information',
        'Auto-play will pause when focused',
        'Slide content will be read when navigated to'
      ]
    },
    form: {
      keyboard: [
        'Use Tab to move between form fields',
        'Use Shift+Tab to move backwards',
        'Press Enter to submit the form'
      ],
      screenReader: [
        'Field validation errors will be announced immediately',
        'Form submission status will be announced',
        'Required fields will be identified'
      ]
    },
    card: {
      keyboard: [
        'Press Enter or Space to interact with the card',
        'Use Tab to navigate to interactive elements within the card'
      ],
      screenReader: [
        'Card content and state will be announced',
        'Interactive elements within the card will be identified',
        'Loading and error states will be announced'
      ]
    }
  }

  // Get component-specific instructions
  const componentInstructions = componentSpecificInstructions[componentType] || {
    keyboard: [],
    screenReader: []
  }

  // Add interaction-specific instructions
  const interactionInstructions: Record<string, string[]> = {
    hover: ['Hover effects are also available via keyboard focus'],
    drag: ['Drag interactions can be performed using keyboard shortcuts'],
    swipe: ['Swipe gestures can be performed using arrow keys'],
    pinch: ['Zoom functionality is available via keyboard shortcuts']
  }

  const additionalKeyboardInstructions = interactions.flatMap(
    interaction => interactionInstructions[interaction] || []
  )

  // Combine all instructions
  const keyboardInstructions = [
    ...baseKeyboardInstructions,
    ...componentInstructions.keyboard,
    ...additionalKeyboardInstructions
  ].join('. ') + '.'

  const screenReaderInstructions = [
    ...baseScreenReaderInstructions,
    ...componentInstructions.screenReader
  ].join('. ') + '.'

  const generalInstructions = [
    'This component supports reduced motion preferences',
    'Alternative interaction methods are available',
    customInstructions || 'Use your preferred input method to interact with this component'
  ].join('. ') + '.'

  return {
    keyboardInstructions,
    screenReaderInstructions,
    generalInstructions
  }
}

/**
 * Create hidden instruction elements for screen readers
 */
export function createAccessibilityInstructions(
  elementId: string,
  componentType: string,
  interactions: string[] = [],
  customInstructions?: string
): HTMLElement[] {
  const instructions = generateAccessibilityInstructions(
    componentType,
    interactions,
    customInstructions
  )

  const elements: HTMLElement[] = []

  // Keyboard instructions
  const keyboardElement = document.createElement('div')
  keyboardElement.id = `${elementId}-keyboard-instructions`
  keyboardElement.className = 'sr-only'
  keyboardElement.textContent = `Keyboard navigation: ${instructions.keyboardInstructions}`
  elements.push(keyboardElement)

  // Screen reader instructions
  const screenReaderElement = document.createElement('div')
  screenReaderElement.id = `${elementId}-screenreader-instructions`
  screenReaderElement.className = 'sr-only'
  screenReaderElement.textContent = `Screen reader information: ${instructions.screenReaderInstructions}`
  elements.push(screenReaderElement)

  // General instructions
  const generalElement = document.createElement('div')
  generalElement.id = `${elementId}-general-instructions`
  generalElement.className = 'sr-only'
  generalElement.textContent = `General accessibility: ${instructions.generalInstructions}`
  elements.push(generalElement)

  return elements
}

/**
 * Utility to check for seizure-inducing animations
 */
export function validateAnimationSafety(config: {
  flashRate?: number
  colorChanges?: number
  contrastRatio?: number
}): { safe: boolean; warnings: string[] } {
  const warnings: string[] = []
  let safe = true

  // Check flash rate (should be less than 3 flashes per second)
  if (config.flashRate && config.flashRate > 3) {
    warnings.push('Flash rate exceeds safe threshold (3 flashes/second)')
    safe = false
  }

  // Check rapid color changes
  if (config.colorChanges && config.colorChanges > 5) {
    warnings.push('Too many rapid color changes detected')
    safe = false
  }

  // Check contrast ratio
  if (config.contrastRatio && config.contrastRatio < 4.5) {
    warnings.push('Insufficient color contrast ratio (minimum 4.5:1)')
    safe = false
  }

  return { safe, warnings }
}