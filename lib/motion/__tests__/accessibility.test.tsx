import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useReducedMotion,
  useScreenReader,
  useKeyboardNavigation,
  useAriaAnnouncements,
  useAlternativeInteractions,
  getAriaProps,
  getScreenReaderSafeProps,
  validateAnimationSafety,
  getAccessibleAnimationConfig
} from '../accessibility'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
}))

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
})

// Test component for useReducedMotion
function ReducedMotionTest() {
  const reducedMotion = useReducedMotion()
  return <div data-testid="reduced-motion">{reducedMotion.toString()}</div>
}

// Test component for useScreenReader
function ScreenReaderTest() {
  const isScreenReader = useScreenReader()
  return <div data-testid="screen-reader">{String(isScreenReader)}</div>
}

// Test component for useKeyboardNavigation
function KeyboardNavigationTest() {
  const { isKeyboardUser, preserveFocus } = useKeyboardNavigation()
  return (
    <div>
      <div data-testid="keyboard-user">{isKeyboardUser.toString()}</div>
      <button onClick={preserveFocus} data-testid="preserve-focus">
        Preserve Focus
      </button>
    </div>
  )
}

// Test component for useAriaAnnouncements
function AriaAnnouncementsTest() {
  const { announce } = useAriaAnnouncements()
  
  return (
    <div>
      <button
        onClick={() => announce('Test announcement')}
        data-testid="announce-button"
      >
        Announce
      </button>
      <button
        onClick={() => announce('Urgent announcement', 'assertive')}
        data-testid="announce-urgent-button"
      >
        Announce Urgent
      </button>
    </div>
  )
}

// Test component for useAlternativeInteractions
function AlternativeInteractionsTest() {
  const { interactionMode, setInteractionMode, triggerAlternativeAction } = useAlternativeInteractions()
  
  return (
    <div>
      <div data-testid="interaction-mode">{interactionMode}</div>
      <button
        onClick={() => setInteractionMode('audio')}
        data-testid="set-audio-mode"
      >
        Set Audio Mode
      </button>
      <button
        onClick={() => triggerAlternativeAction('test')}
        data-testid="trigger-action"
      >
        Trigger Action
      </button>
    </div>
  )
}

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useReducedMotion', () => {
    it('should detect reduced motion preference', () => {
      render(<ReducedMotionTest />)
      const element = screen.getByTestId('reduced-motion')
      expect(element).toHaveTextContent('true')
    })

    it('should update when preference changes', async () => {
      const mockMatchMedia = window.matchMedia as jest.Mock
      const mockListener = jest.fn()
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockListener,
        removeEventListener: jest.fn(),
      })

      render(<ReducedMotionTest />)
      
      // Simulate preference change
      const changeHandler = mockListener.mock.calls[0][1]
      changeHandler({ matches: true })
      
      await waitFor(() => {
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true')
      })
    })
  })

  describe('useScreenReader', () => {
    it('should detect screen reader usage', () => {
      render(<ScreenReaderTest />)
      const element = screen.getByTestId('screen-reader')
      expect(element).toBeInTheDocument()
    })

    it('should detect keyboard navigation as screen reader indicator', async () => {
      render(<ScreenReaderTest />)
      
      // Simulate focus event that indicates keyboard navigation
      const button = document.createElement('button')
      document.body.appendChild(button)
      fireEvent.focusIn(button)
      
      await waitFor(() => {
        const element = screen.getByTestId('screen-reader')
        expect(element).toBeInTheDocument()
      })
      
      document.body.removeChild(button)
    })
  })

  describe('useKeyboardNavigation', () => {
    it('should detect keyboard usage', async () => {
      render(<KeyboardNavigationTest />)
      
      // Initially should not be keyboard user
      expect(screen.getByTestId('keyboard-user')).toHaveTextContent('false')
      
      // Simulate Tab key press
      fireEvent.keyDown(document, { key: 'Tab' })
      
      await waitFor(() => {
        expect(screen.getByTestId('keyboard-user')).toHaveTextContent('true')
      })
    })

    it('should reset keyboard detection on mouse use', async () => {
      render(<KeyboardNavigationTest />)
      
      // Set keyboard user
      fireEvent.keyDown(document, { key: 'Tab' })
      await waitFor(() => {
        expect(screen.getByTestId('keyboard-user')).toHaveTextContent('true')
      })
      
      // Simulate mouse use
      fireEvent.mouseDown(document)
      
      await waitFor(() => {
        expect(screen.getByTestId('keyboard-user')).toHaveTextContent('false')
      })
    })
  })

  describe('useAriaAnnouncements', () => {
    it('should create ARIA live region', () => {
      render(<AriaAnnouncementsTest />)
      
      // Check if live region was created
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should announce messages', async () => {
      render(<AriaAnnouncementsTest />)
      
      const announceButton = screen.getByTestId('announce-button')
      fireEvent.click(announceButton)
      
      // Check if announcement was made
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).toHaveTextContent('Test announcement')
    })

    it('should handle urgent announcements', async () => {
      render(<AriaAnnouncementsTest />)
      
      const announceUrgentButton = screen.getByTestId('announce-urgent-button')
      fireEvent.click(announceUrgentButton)
      
      // Check if urgent announcement was made
      const liveRegion = document.querySelector('[aria-live="assertive"]')
      expect(liveRegion).toHaveTextContent('Urgent announcement')
    })
  })

  describe('useAlternativeInteractions', () => {
    it('should manage interaction modes', async () => {
      render(<AlternativeInteractionsTest />)
      
      expect(screen.getByTestId('interaction-mode')).toHaveTextContent('visual')
      
      const setAudioButton = screen.getByTestId('set-audio-mode')
      fireEvent.click(setAudioButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('interaction-mode')).toHaveTextContent('audio')
      })
    })

    it('should trigger alternative actions', () => {
      render(<AlternativeInteractionsTest />)
      
      const triggerButton = screen.getByTestId('trigger-action')
      fireEvent.click(triggerButton)
      
      // Should not throw any errors
      expect(triggerButton).toBeInTheDocument()
    })
  })

  describe('getAriaProps', () => {
    it('should return correct ARIA properties for buttons', () => {
      const props = getAriaProps('button', 'idle')
      
      expect(props).toEqual({
        role: 'button',
        'aria-pressed': 'false',
        'aria-busy': 'false'
      })
    })

    it('should handle animating state', () => {
      const props = getAriaProps('button', 'animating')
      
      expect(props).toEqual({
        role: 'button',
        'aria-pressed': 'true',
        'aria-busy': 'true',
        'aria-live': 'polite'
      })
    })

    it('should handle error state', () => {
      const props = getAriaProps('button', 'error')
      
      expect(props).toEqual({
        role: 'button',
        'aria-pressed': 'false',
        'aria-invalid': 'true',
        'aria-live': 'assertive'
      })
    })

    it('should include custom labels', () => {
      const props = getAriaProps('button', 'idle', {
        label: 'Custom Label',
        description: 'Custom Description'
      })
      
      expect(props).toEqual({
        role: 'button',
        'aria-pressed': 'false',
        'aria-busy': 'false',
        'aria-label': 'Custom Label',
        'aria-describedby': 'button-description'
      })
    })
  })

  describe('getScreenReaderSafeProps', () => {
    it('should hide content during animation', () => {
      const props = getScreenReaderSafeProps(true, 'Test content')
      
      expect(props).toEqual({
        'aria-hidden': 'true',
        'aria-label': 'Test content'
      })
    })

    it('should show content when not animating', () => {
      const props = getScreenReaderSafeProps(false, 'Test content')
      
      expect(props).toEqual({
        'aria-hidden': 'false',
        'aria-label': 'Test content'
      })
    })
  })

  describe('validateAnimationSafety', () => {
    it('should validate safe animations', () => {
      const result = validateAnimationSafety({
        flashRate: 2,
        colorChanges: 3,
        contrastRatio: 5.0
      })
      
      expect(result.safe).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect unsafe flash rate', () => {
      const result = validateAnimationSafety({
        flashRate: 5
      })
      
      expect(result.safe).toBe(false)
      expect(result.warnings).toContain('Flash rate exceeds safe threshold (3 flashes/second)')
    })

    it('should detect too many color changes', () => {
      const result = validateAnimationSafety({
        colorChanges: 10
      })
      
      expect(result.safe).toBe(false)
      expect(result.warnings).toContain('Too many rapid color changes detected')
    })

    it('should detect insufficient contrast', () => {
      const result = validateAnimationSafety({
        contrastRatio: 3.0
      })
      
      expect(result.safe).toBe(false)
      expect(result.warnings).toContain('Insufficient color contrast ratio (minimum 4.5:1)')
    })
  })

  describe('getAccessibleAnimationConfig', () => {
    it('should disable animations for reduced motion', () => {
      const baseConfig = { duration: 0.5, opacity: 1 }
      const result = getAccessibleAnimationConfig(baseConfig, true, false, 'balanced')
      
      expect(result.duration).toBe(0)
      expect(result.transition.duration).toBe(0)
    })

    it('should disable animations for screen readers', () => {
      const baseConfig = { duration: 0.5, opacity: 1 }
      const result = getAccessibleAnimationConfig(baseConfig, false, true, 'balanced')
      
      expect(result.duration).toBe(0)
      expect(result.transition.duration).toBe(0)
    })

    it('should adjust duration for performance mode', () => {
      const baseConfig = { duration: 0.5, opacity: 1 }
      const result = getAccessibleAnimationConfig(baseConfig, false, false, 'battery')
      
      expect(result.duration).toBe(0.25) // 50% of original
    })

    it('should preserve full duration in high performance mode', () => {
      const baseConfig = { duration: 0.5, opacity: 1 }
      const result = getAccessibleAnimationConfig(baseConfig, false, false, 'high')
      
      expect(result.duration).toBe(0.5)
    })
  })
})