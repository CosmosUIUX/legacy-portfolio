import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  renderWithMotion,
  AnimationTestUtils,
  AccessibilityTestUtils,
  PerformanceTestUtils,
  setupAnimationTestEnvironment
} from '../test-utils'
import { AccessibilityWrapper } from '../accessibility-wrapper'
import { MotionProvider } from '../provider'

// Setup test environment
setupAnimationTestEnvironment()

// Mock Motion.dev components
jest.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props} data-testid="motion-div">
        {children}
      </div>
    )),
    button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
      <button ref={ref} {...props} data-testid="motion-button">
        {children}
      </button>
    ))
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMotionValue: jest.fn(() => ({ set: jest.fn(), get: jest.fn() })),
  useAnimation: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() }))
}))

// Test component that uses animations
function AnimatedTestComponent({
  onAnimationStart,
  onAnimationComplete,
  enableAccessibility = true
}: {
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
  enableAccessibility?: boolean
}) {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [animationState, setAnimationState] = React.useState<'idle' | 'animating' | 'complete'>('idle')

  const handleStartAnimation = () => {
    setIsAnimating(true)
    setAnimationState('animating')
    onAnimationStart?.()
    
    // Simulate animation duration
    setTimeout(() => {
      setIsAnimating(false)
      setAnimationState('complete')
      onAnimationComplete?.()
    }, 500)
  }

  if (enableAccessibility) {
    return (
      <AccessibilityWrapper
        elementType="button"
        animationState={animationState}
        ariaLabel="Animated test button"
        ariaDescription="This button triggers a test animation"
        announcement="Animation started"
        onAnimationStart={onAnimationStart}
        onAnimationComplete={onAnimationComplete}
      >
        <button onClick={handleStartAnimation} disabled={isAnimating}>
          {isAnimating ? 'Animating...' : 'Start Animation'}
        </button>
      </AccessibilityWrapper>
    )
  }

  return (
    <button onClick={handleStartAnimation} disabled={isAnimating} data-testid="basic-button">
      {isAnimating ? 'Animating...' : 'Start Animation'}
    </button>
  )
}

describe('Animation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Animation Interactions', () => {
    it('should handle animation lifecycle correctly', async () => {
      const onAnimationStart = jest.fn()
      const onAnimationComplete = jest.fn()

      renderWithMotion(
        <AnimatedTestComponent
          onAnimationStart={onAnimationStart}
          onAnimationComplete={onAnimationComplete}
        />
      )

      const button = screen.getByRole('button')
      
      // Start animation
      fireEvent.click(button)
      
      expect(onAnimationStart).toHaveBeenCalled()
      expect(button).toHaveTextContent('Animating...')
      expect(button).toBeDisabled()

      // Wait for animation to complete
      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled()
      }, { timeout: 1000 })

      expect(button).toHaveTextContent('Start Animation')
      expect(button).not.toBeDisabled()
    })

    it('should work with different performance modes', async () => {
      const { rerender } = renderWithMotion(
        <AnimatedTestComponent />,
        {
          providerProps: { performanceMode: 'high' }
        }
      )

      let button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      // Test battery mode
      rerender(
        <MotionProvider performanceMode="battery">
          <AnimatedTestComponent />
        </MotionProvider>
      )

      button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      // Test balanced mode
      rerender(
        <MotionProvider performanceMode="balanced">
          <AnimatedTestComponent />
        </MotionProvider>
      )

      button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle reduced motion preference', async () => {
      renderWithMotion(
        <AnimatedTestComponent />,
        {
          providerProps: { reducedMotion: true }
        }
      )

      const button = screen.getByRole('button')
      
      // Animation should still work but be instant
      fireEvent.click(button)
      
      // Should immediately show animating state
      expect(button).toHaveTextContent('Animating...')
    })
  })

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA attributes during animations', async () => {
      renderWithMotion(<AnimatedTestComponent />)

      const button = screen.getByRole('button')
      
      // Check initial ARIA state
      const initialAria = AccessibilityTestUtils.testAriaAttributes(button)
      expect(initialAria.hasAriaLabel).toBe(true)
      expect(initialAria.isBusy).toBe(false)

      // Start animation
      fireEvent.click(button)

      // Check ARIA state during animation
      await waitFor(() => {
        const animatingAria = AccessibilityTestUtils.testAriaAttributes(button)
        expect(animatingAria.isBusy).toBe(true)
      })

      // Wait for completion
      await waitFor(() => {
        const completedAria = AccessibilityTestUtils.testAriaAttributes(button)
        expect(completedAria.isBusy).toBe(false)
      }, { timeout: 1000 })
    })

    it('should handle keyboard navigation correctly', async () => {
      const user = userEvent.setup()
      
      renderWithMotion(<AnimatedTestComponent />)

      const button = screen.getByRole('button')
      
      // Test keyboard navigation
      const keyboardResults = await AccessibilityTestUtils.testKeyboardNavigation(button)
      expect(keyboardResults.Tab).toBeDefined()
      expect(keyboardResults.Enter).toBeDefined()

      // Test Enter key activation
      await user.type(button, '{Enter}')
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Animating...')
      })
    })

    it('should preserve focus during animations', async () => {
      renderWithMotion(<AnimatedTestComponent />)

      const button = screen.getByRole('button')
      button.focus()
      
      expect(document.activeElement).toBe(button)

      // Start animation
      fireEvent.click(button)

      // Focus should be preserved during animation
      const focusResult = await AccessibilityTestUtils.testFocusManagement(
        () => {}, // Animation already started
        button
      )

      expect(focusResult.focusPreserved).toBe(true)
    })

    it('should work with screen readers', async () => {
      renderWithMotion(<AnimatedTestComponent />)

      // Check for screen reader announcements
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)

      const button = screen.getByLabelText('Animated test button')
      fireEvent.click(button)

      // Should announce animation start
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]')
        expect(liveRegion).toBeInTheDocument()
      })
    })
  })

  describe('Performance Integration', () => {
    it('should maintain 60fps during animations', async () => {
      const { container } = renderWithMotion(<AnimatedTestComponent enableAccessibility={false} />)
      
      const button = screen.getByTestId('basic-button')
      
      // Test frame rate during animation
      const performanceResult = await PerformanceTestUtils.validate60FPS(
        () => {
          // Simulate animation work
          const element = container.querySelector('button')
          if (element) {
            element.style.transform = `translateX(${Math.random() * 10}px)`
          }
        },
        500, // Test for 500ms
        10   // Allow 10fps tolerance
      )

      expect(performanceResult.passes).toBe(true)
      expect(performanceResult.averageFPS).toBeGreaterThan(50)
    })

    it('should not have memory leaks', async () => {
      const memoryResult = await PerformanceTestUtils.testMemoryLeaks(
        () => {
          const { unmount } = renderWithMotion(<AnimatedTestComponent />)
          
          // Simulate animation activity
          const button = screen.getByLabelText('Animated test button')
          fireEvent.click(button)
          
          return () => {
            unmount()
          }
        },
        5 // Test 5 iterations
      )

      expect(memoryResult.hasMemoryLeak).toBe(false)
      expect(memoryResult.memoryGrowth).toBeLessThan(5) // Less than 5MB growth
    })

    it('should perform well under load', async () => {
      const { container } = renderWithMotion(<AnimatedTestComponent enableAccessibility={false} />)
      
      const performanceResult = await PerformanceTestUtils.testPerformanceUnderLoad(
        () => {
          // Animation callback
          const element = container.querySelector('button')
          if (element) {
            element.style.transform = `scale(${1 + Math.sin(Date.now() / 100) * 0.1})`
          }
        },
        () => {
          // Load simulation - create DOM elements
          const div = document.createElement('div')
          div.innerHTML = 'Load test'
          document.body.appendChild(div)
          setTimeout(() => document.body.removeChild(div), 1)
        },
        1000
      )

      // Performance should not degrade by more than 30%
      expect(performanceResult.performanceDegradation).toBeLessThan(30)
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work without Motion.dev available', () => {
      // Mock Motion.dev as unavailable
      jest.doMock('motion/react', () => {
        throw new Error('Motion.dev not available')
      })

      // Should still render without errors
      expect(() => {
        renderWithMotion(<AnimatedTestComponent enableAccessibility={false} />)
      }).not.toThrow()

      const button = screen.getByTestId('basic-button')
      expect(button).toBeInTheDocument()
    })

    it('should handle missing browser APIs gracefully', () => {
      // Mock missing IntersectionObserver
      const originalIO = global.IntersectionObserver
      delete (global as any).IntersectionObserver

      expect(() => {
        renderWithMotion(<AnimatedTestComponent />)
      }).not.toThrow()

      // Restore
      global.IntersectionObserver = originalIO
    })

    it('should work with different viewport sizes', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ]

      viewports.forEach(viewport => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height
        })

        expect(() => {
          renderWithMotion(<AnimatedTestComponent />)
        }).not.toThrow()

        const button = screen.getByLabelText('Animated test button')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle animation errors gracefully', async () => {
      const onAnimationError = jest.fn()
      
      renderWithMotion(
        <AccessibilityWrapper
          elementType="button"
          animationState="error"
          onAnimationError={onAnimationError}
        >
          <button>Error Test</button>
        </AccessibilityWrapper>
      )

      await waitFor(() => {
        expect(onAnimationError).toHaveBeenCalled()
      })

      // Should still be functional
      const button = screen.getByText('Error Test')
      expect(button).toBeInTheDocument()
    })

    it('should recover from performance issues', async () => {
      // Simulate performance degradation
      const mockRAF = AnimationTestUtils.mockAnimationFrame()
      
      renderWithMotion(<AnimatedTestComponent />)
      
      const button = screen.getByLabelText('Animated test button')
      fireEvent.click(button)

      // Simulate slow frames
      mockRAF.tick(100) // 100ms frame (very slow)
      mockRAF.tick(50)  // 50ms frame (still slow)
      mockRAF.tick(16)  // Normal frame

      // Should still complete animation
      await waitFor(() => {
        expect(button).toHaveTextContent('Start Animation')
      }, { timeout: 2000 })

      mockRAF.restore()
    })
  })
})