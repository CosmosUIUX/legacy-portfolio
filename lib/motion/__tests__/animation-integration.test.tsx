// Integration tests for Motion.dev animation component interactions
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { motion } from '@/lib/motion'
import { renderWithMotion, AnimationTestUtils, setupAnimationTestEnvironment } from '../test-utils'
import { MotionProvider } from '../provider'
import { useMotion, useStaggerAnimation, useScrollAnimation } from '../hooks'

// Setup test environment
setupAnimationTestEnvironment()

// Mock components for integration testing
function TestAnimatedComponent({ trigger = 'viewport', onAnimationComplete }: {
  trigger?: 'viewport' | 'hover' | 'click'
  onAnimationComplete?: () => void
}) {
  const { ref, animationProps, eventHandlers, isActive } = useMotion({
    trigger,
    duration: 300,
    easing: 'easeOut'
  })

  React.useEffect(() => {
    if (isActive && onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 300)
      return () => clearTimeout(timer)
    }
  }, [isActive, onAnimationComplete])

  return (
    <motion.div
      ref={ref}
      data-testid="animated-component"
      {...animationProps}
      {...eventHandlers}
      className="w-32 h-32 bg-blue-500"
    >
      Animated Content
    </motion.div>
  )
}

function TestStaggeredList({ items, onComplete }: {
  items: string[]
  onComplete?: () => void
}) {
  const { ref, getItemProps, isComplete } = useStaggerAnimation({
    items,
    staggerDelay: 100,
    trigger: 'viewport',
    onComplete
  })

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  return (
    <div ref={ref} data-testid="staggered-list">
      {items.map((item, index) => {
        const itemProps = getItemProps(index)
        return (
          <motion.div
            key={index}
            data-testid={`stagger-item-${index}`}
            {...itemProps}
            className="p-2 bg-gray-200 mb-2"
          >
            {item}
          </motion.div>
        )
      })}
    </div>
  )
}

function TestScrollAnimatedComponent() {
  const { ref, style } = useScrollAnimation({
    transform: {
      y: [0, -100],
      opacity: [1, 0.5]
    }
  })

  return (
    <motion.div
      ref={ref}
      style={style}
      data-testid="scroll-animated"
      className="w-32 h-32 bg-green-500"
    >
      Scroll Content
    </motion.div>
  )
}

function TestComplexAnimationSequence() {
  const [step, setStep] = React.useState(0)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleStepComplete = React.useCallback(() => {
    setStep(prev => prev + 1)
    setIsAnimating(false)
  }, [])

  const startSequence = React.useCallback(() => {
    setIsAnimating(true)
    setStep(1)
  }, [])

  return (
    <div data-testid="complex-sequence">
      <button 
        onClick={startSequence}
        data-testid="start-sequence"
        disabled={isAnimating}
      >
        Start Animation
      </button>
      
      {step >= 1 && (
        <TestAnimatedComponent 
          trigger="viewport"
          onAnimationComplete={handleStepComplete}
        />
      )}
      
      {step >= 2 && (
        <TestStaggeredList 
          items={['Item 1', 'Item 2', 'Item 3']}
          onComplete={handleStepComplete}
        />
      )}
      
      {step >= 3 && (
        <TestScrollAnimatedComponent />
      )}
      
      <div data-testid="sequence-step">{step}</div>
    </div>
  )
}

describe('Animation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset any global animation state
    AnimationTestUtils.mockAnimationFrame().restore()
  })

  describe('Component Animation Interactions', () => {
    it('should handle multiple animated components without conflicts', async () => {
      const onComplete1 = jest.fn()
      const onComplete2 = jest.fn()

      renderWithMotion(
        <div>
          <TestAnimatedComponent 
            trigger="viewport" 
            onAnimationComplete={onComplete1}
          />
          <TestAnimatedComponent 
            trigger="hover" 
            onAnimationComplete={onComplete2}
          />
        </div>
      )

      const components = screen.getAllByTestId('animated-component')
      expect(components).toHaveLength(2)

      // First component should animate on viewport
      await waitFor(() => {
        expect(onComplete1).toHaveBeenCalled()
      }, { timeout: 1000 })

      // Second component should animate on hover
      await userEvent.hover(components[1])
      
      await waitFor(() => {
        expect(onComplete2).toHaveBeenCalled()
      }, { timeout: 1000 })
    })

    it('should handle nested animation components', async () => {
      const ParentComponent = () => {
        const parentMotion = useMotion({ trigger: 'viewport', duration: 200 })
        const childMotion = useMotion({ trigger: 'hover', duration: 150 })

        return (
          <motion.div
            ref={parentMotion.ref}
            {...parentMotion.animationProps}
            data-testid="parent-animated"
            className="p-4 bg-blue-100"
          >
            <motion.div
              ref={childMotion.ref}
              {...childMotion.animationProps}
              {...childMotion.eventHandlers}
              data-testid="child-animated"
              className="p-2 bg-red-100"
            >
              Child Content
            </motion.div>
          </motion.div>
        )
      }

      renderWithMotion(<ParentComponent />)

      const parent = screen.getByTestId('parent-animated')
      const child = screen.getByTestId('child-animated')

      expect(parent).toBeInTheDocument()
      expect(child).toBeInTheDocument()

      // Test child hover animation
      await userEvent.hover(child)
      
      // Both animations should work independently
      expect(parent).toHaveStyle('opacity: 1')
      expect(child).toBeInTheDocument()
    })

    it('should handle animation state changes during interaction', async () => {
      const StateChangeComponent = () => {
        const [isVisible, setIsVisible] = React.useState(true)
        const motion = useMotion({ trigger: 'hover' })

        return (
          <div>
            <button 
              onClick={() => setIsVisible(!isVisible)}
              data-testid="toggle-visibility"
            >
              Toggle
            </button>
            {isVisible && (
              <motion.div
                ref={motion.ref}
                {...motion.animationProps}
                {...motion.eventHandlers}
                data-testid="state-animated"
              >
                Content
              </motion.div>
            )}
          </div>
        )
      }

      renderWithMotion(<StateChangeComponent />)

      const toggleButton = screen.getByTestId('toggle-visibility')
      let animatedElement = screen.getByTestId('state-animated')

      // Hover the element
      await userEvent.hover(animatedElement)

      // Toggle visibility while hovering
      await userEvent.click(toggleButton)

      // Element should be removed
      expect(screen.queryByTestId('state-animated')).not.toBeInTheDocument()

      // Toggle back
      await userEvent.click(toggleButton)

      // Element should be back
      animatedElement = screen.getByTestId('state-animated')
      expect(animatedElement).toBeInTheDocument()
    })

    it('should handle rapid interaction changes', async () => {
      const user = userEvent.setup({ delay: null })
      
      renderWithMotion(
        <TestAnimatedComponent trigger="hover" />
      )

      const component = screen.getByTestId('animated-component')

      // Rapid hover/unhover
      for (let i = 0; i < 5; i++) {
        await user.hover(component)
        await user.unhover(component)
      }

      // Component should still be responsive
      expect(component).toBeInTheDocument()
    })
  })

  describe('Animation Sequence Integration', () => {
    it('should execute complex animation sequences correctly', async () => {
      renderWithMotion(<TestComplexAnimationSequence />)

      const startButton = screen.getByTestId('start-sequence')
      const stepIndicator = screen.getByTestId('sequence-step')

      expect(stepIndicator).toHaveTextContent('0')

      // Start the sequence
      await userEvent.click(startButton)

      // Wait for first animation to complete
      await waitFor(() => {
        expect(stepIndicator).toHaveTextContent('1')
      }, { timeout: 1000 })

      // Wait for stagger animation to complete
      await waitFor(() => {
        expect(stepIndicator).toHaveTextContent('2')
      }, { timeout: 2000 })

      // Final step should be reached
      await waitFor(() => {
        expect(stepIndicator).toHaveTextContent('3')
      }, { timeout: 1000 })

      // All components should be present
      expect(screen.getByTestId('animated-component')).toBeInTheDocument()
      expect(screen.getByTestId('staggered-list')).toBeInTheDocument()
      expect(screen.getByTestId('scroll-animated')).toBeInTheDocument()
    })

    it('should handle animation interruptions gracefully', async () => {
      const InterruptibleComponent = () => {
        const [isRunning, setIsRunning] = React.useState(false)
        const [step, setStep] = React.useState(0)

        const startAnimation = () => {
          setIsRunning(true)
          setStep(1)
          setTimeout(() => setStep(2), 200)
          setTimeout(() => setStep(3), 400)
          setTimeout(() => {
            setStep(0)
            setIsRunning(false)
          }, 600)
        }

        const stopAnimation = () => {
          setIsRunning(false)
          setStep(0)
        }

        return (
          <div>
            <button 
              onClick={startAnimation}
              data-testid="start-animation"
              disabled={isRunning}
            >
              Start
            </button>
            <button 
              onClick={stopAnimation}
              data-testid="stop-animation"
            >
              Stop
            </button>
            <div data-testid="animation-step">{step}</div>
            {step > 0 && (
              <motion.div
                data-testid="animated-element"
                animate={{ opacity: step / 3 }}
                transition={{ duration: 0.2 }}
              >
                Step {step}
              </motion.div>
            )}
          </div>
        )
      }

      renderWithMotion(<InterruptibleComponent />)

      const startButton = screen.getByTestId('start-animation')
      const stopButton = screen.getByTestId('stop-animation')
      const stepIndicator = screen.getByTestId('animation-step')

      // Start animation
      await userEvent.click(startButton)

      // Wait for animation to progress
      await waitFor(() => {
        expect(stepIndicator).toHaveTextContent('1')
      })

      // Interrupt animation
      await userEvent.click(stopButton)

      // Animation should stop
      expect(stepIndicator).toHaveTextContent('0')
      expect(screen.queryByTestId('animated-element')).not.toBeInTheDocument()
    })
  })

  describe('Performance Mode Integration', () => {
    it('should adapt animations based on performance mode', async () => {
      const PerformanceModeTest = ({ mode }: { mode: 'high' | 'balanced' | 'battery' }) => {
        const motion = useMotion({ 
          trigger: 'viewport',
          duration: 1000 // Long duration to test performance adjustments
        })

        return (
          <motion.div
            ref={motion.ref}
            {...motion.animationProps}
            data-testid={`performance-${mode}`}
          >
            Content
          </motion.div>
        )
      }

      // Test high performance mode
      const { rerender } = renderWithMotion(
        <PerformanceModeTest mode="high" />,
        { providerProps: { performanceMode: 'high' } }
      )

      let element = screen.getByTestId('performance-high')
      expect(element).toBeInTheDocument()

      // Test battery mode
      rerender(
        <MotionProvider performanceMode="battery">
          <PerformanceModeTest mode="battery" />
        </MotionProvider>
      )

      element = screen.getByTestId('performance-battery')
      expect(element).toBeInTheDocument()
    })

    it('should handle reduced motion preferences', async () => {
      const ReducedMotionTest = () => {
        const motion = useMotion({ trigger: 'viewport' })

        return (
          <motion.div
            ref={motion.ref}
            {...motion.animationProps}
            data-testid="reduced-motion-test"
          >
            Content
          </motion.div>
        )
      }

      // Test with reduced motion enabled
      renderWithMotion(
        <ReducedMotionTest />,
        { providerProps: { reducedMotion: true } }
      )

      const element = screen.getByTestId('reduced-motion-test')
      expect(element).toBeInTheDocument()
      
      // Animation should be disabled or significantly reduced
      // The exact behavior depends on the implementation
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle animation errors gracefully', async () => {
      const ErrorProneComponent = () => {
        const [shouldError, setShouldError] = React.useState(false)

        const motion = useMotion({ 
          trigger: 'viewport',
          duration: shouldError ? -1 : 300 // Invalid duration to trigger error
        })

        return (
          <div>
            <button 
              onClick={() => setShouldError(true)}
              data-testid="trigger-error"
            >
              Trigger Error
            </button>
            <motion.div
              ref={motion.ref}
              {...motion.animationProps}
              data-testid="error-prone"
            >
              Content
            </motion.div>
          </div>
        )
      }

      renderWithMotion(<ErrorProneComponent />)

      const triggerButton = screen.getByTestId('trigger-error')
      const element = screen.getByTestId('error-prone')

      expect(element).toBeInTheDocument()

      // Trigger error condition
      await userEvent.click(triggerButton)

      // Component should still be rendered despite error
      expect(element).toBeInTheDocument()
    })

    it('should handle missing animation dependencies', async () => {
      const MissingDepsComponent = () => {
        // Simulate missing ref
        const motion = useMotion({ trigger: 'viewport' })

        return (
          <motion.div
            // Intentionally not passing ref
            {...motion.animationProps}
            data-testid="missing-deps"
          >
            Content
          </motion.div>
        )
      }

      renderWithMotion(<MissingDepsComponent />)

      const element = screen.getByTestId('missing-deps')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Memory Management Integration', () => {
    it('should clean up animations on component unmount', async () => {
      const CleanupTest = ({ show }: { show: boolean }) => {
        if (!show) return null

        return <TestAnimatedComponent trigger="viewport" />
      }

      const { rerender } = renderWithMotion(<CleanupTest show={true} />)

      expect(screen.getByTestId('animated-component')).toBeInTheDocument()

      // Unmount component
      rerender(<CleanupTest show={false} />)

      expect(screen.queryByTestId('animated-component')).not.toBeInTheDocument()

      // Remount component
      rerender(<CleanupTest show={true} />)

      expect(screen.getByTestId('animated-component')).toBeInTheDocument()
    })

    it('should handle multiple mount/unmount cycles', async () => {
      const CycleTest = ({ cycle }: { cycle: number }) => (
        <TestAnimatedComponent key={cycle} trigger="viewport" />
      )

      const { rerender } = renderWithMotion(<CycleTest cycle={0} />)

      // Cycle through multiple mounts
      for (let i = 1; i <= 5; i++) {
        rerender(<CycleTest cycle={i} />)
        expect(screen.getByTestId('animated-component')).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain accessibility during animations', async () => {
      const AccessibleAnimatedComponent = () => {
        const motion = useMotion({ trigger: 'hover' })

        return (
          <motion.button
            ref={motion.ref}
            {...motion.animationProps}
            {...motion.eventHandlers}
            data-testid="accessible-animated"
            aria-label="Animated button"
          >
            Click me
          </motion.button>
        )
      }

      renderWithMotion(<AccessibleAnimatedComponent />)

      const button = screen.getByTestId('accessible-animated')
      
      // Should be focusable
      button.focus()
      expect(button).toHaveFocus()

      // Should be clickable
      await userEvent.click(button)

      // Should maintain aria attributes
      expect(button).toHaveAttribute('aria-label', 'Animated button')
    })

    it('should handle keyboard navigation during animations', async () => {
      const KeyboardNavTest = () => {
        const [focused, setFocused] = React.useState(false)
        const motion = useMotion({ trigger: 'focus' })

        return (
          <div>
            <button data-testid="first-button">First</button>
            <motion.button
              ref={motion.ref}
              {...motion.animationProps}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              data-testid="animated-button"
            >
              Animated {focused ? '(focused)' : ''}
            </motion.button>
            <button data-testid="last-button">Last</button>
          </div>
        )
      }

      renderWithMotion(<KeyboardNavTest />)

      const firstButton = screen.getByTestId('first-button')
      const animatedButton = screen.getByTestId('animated-button')
      const lastButton = screen.getByTestId('last-button')

      // Tab navigation should work
      firstButton.focus()
      await userEvent.tab()
      expect(animatedButton).toHaveFocus()
      
      await userEvent.tab()
      expect(lastButton).toHaveFocus()
    })
  })
})