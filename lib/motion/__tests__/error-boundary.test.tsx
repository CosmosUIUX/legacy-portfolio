// Tests for animation error boundary and fallback system
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
    AnimationErrorBoundary,
    ErrorRecoveryProvider,
    useErrorRecovery,
    AnimationPerformanceMonitor,
    MotionFallback,
    withAnimationErrorBoundary,
    AnimationErrorType,
    RecoveryStrategy,
    MotionLoadDetector,
    EnhancedMotionFallback,
    BundleOptimizer,
    AnimationErrorLogger
} from '../error-boundary'
import type { AnimationError } from '../error-boundary'

// Mock component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
    if (shouldThrow) {
        throw new Error('Test animation error')
    }
    return <div>No error</div>
}

// Test component that uses error recovery
function TestErrorRecoveryComponent() {
    const { hasErrors, errorCount, reportError, clearErrors } = useErrorRecovery()

    const handleReportError = () => {
        reportError({
            type: AnimationErrorType.ANIMATION_RUNTIME_ERROR,
            message: 'Test error',
            timestamp: Date.now()
        })
    }

    return (
        <div>
            <div data-testid="error-status">
                Has errors: {hasErrors.toString()}
            </div>
            <div data-testid="error-count">
                Error count: {errorCount}
            </div>
            <button onClick={handleReportError} data-testid="report-error">
                Report Error
            </button>
            <button onClick={clearErrors} data-testid="clear-errors">
                Clear Errors
            </button>
        </div>
    )
}

describe('AnimationErrorBoundary', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Suppress console.error for error boundary tests
        jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'warn').mockImplementation(() => { })
        jest.spyOn(console, 'group').mockImplementation(() => { })
        jest.spyOn(console, 'groupEnd').mockImplementation(() => { })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render children when there is no error', () => {
        render(
            <AnimationErrorBoundary>
                <ThrowError shouldThrow={false} />
            </AnimationErrorBoundary>
        )

        expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render fallback when error occurs', () => {
        render(
            <AnimationErrorBoundary>
                <ThrowError shouldThrow={true} />
            </AnimationErrorBoundary>
        )

        expect(screen.getByText('Animation Error')).toBeInTheDocument()
        expect(screen.getByText('Test animation error')).toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
        const onError = jest.fn()

        render(
            <AnimationErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} />
            </AnimationErrorBoundary>
        )

        expect(onError).toHaveBeenCalled()
        expect(onError.mock.calls[0][0]).toMatchObject({
            message: 'Test animation error',
            type: AnimationErrorType.ANIMATION_RUNTIME_ERROR
        })
    })

    it('should render custom fallback component', () => {
        const CustomFallback = ({ error }: { error: any }) => (
            <div>Custom fallback: {error.message}</div>
        )

        render(
            <AnimationErrorBoundary fallback={CustomFallback}>
                <ThrowError shouldThrow={true} />
            </AnimationErrorBoundary>
        )

        expect(screen.getByText('Custom fallback: Test animation error')).toBeInTheDocument()
    })

    it('should handle retry functionality', async () => {
        let shouldThrow = true

        function RetryableComponent() {
            if (shouldThrow) {
                throw new Error('Retryable error')
            }
            return <div>Success after retry</div>
        }

        render(
            <AnimationErrorBoundary maxRetries={1} retryDelay={100}>
                <RetryableComponent />
            </AnimationErrorBoundary>
        )

        expect(screen.getByText('Animation Error')).toBeInTheDocument()

        // Simulate fixing the error
        shouldThrow = false

        // Click retry button
        fireEvent.click(screen.getByText('Retry Animation'))

        await waitFor(() => {
            expect(screen.getByText('Success after retry')).toBeInTheDocument()
        }, { timeout: 200 })
    })
})

describe('ErrorRecoveryProvider and useErrorRecovery', () => {
    it('should track errors and provide recovery context', () => {
        render(
            <ErrorRecoveryProvider>
                <TestErrorRecoveryComponent />
            </ErrorRecoveryProvider>
        )

        expect(screen.getByTestId('error-status')).toHaveTextContent('Has errors: false')
        expect(screen.getByTestId('error-count')).toHaveTextContent('Error count: 0')

        // Report an error
        fireEvent.click(screen.getByTestId('report-error'))

        expect(screen.getByTestId('error-status')).toHaveTextContent('Has errors: true')
        expect(screen.getByTestId('error-count')).toHaveTextContent('Error count: 1')

        // Clear errors
        fireEvent.click(screen.getByTestId('clear-errors'))

        expect(screen.getByTestId('error-status')).toHaveTextContent('Has errors: false')
        expect(screen.getByTestId('error-count')).toHaveTextContent('Error count: 0')
    })

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        expect(() => {
            render(<TestErrorRecoveryComponent />)
        }).toThrow('useErrorRecovery must be used within ErrorRecoveryProvider')

        consoleSpy.mockRestore()
    })
})

describe('AnimationPerformanceMonitor', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
        global.performance = {
            ...global.performance,
            now: jest.fn(() => Date.now()),
            memory: {
                usedJSHeapSize: 10 * 1024 * 1024 // 10MB
            }
        } as any
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it('should create monitor with default options', () => {
        const monitor = new AnimationPerformanceMonitor()
        expect(monitor).toBeInstanceOf(AnimationPerformanceMonitor)
    })

    it('should create monitor with custom options', () => {
        const onError = jest.fn()
        const monitor = new AnimationPerformanceMonitor({
            frameRateThreshold: 60,
            memoryThreshold: 100 * 1024 * 1024,
            onError
        })

        expect(monitor).toBeInstanceOf(AnimationPerformanceMonitor)
    })

    it('should start monitoring when called', () => {
        const monitor = new AnimationPerformanceMonitor()

        // Should not throw
        expect(() => {
            monitor.startMonitoring()
        }).not.toThrow()
    })
})

describe('MotionFallback', () => {
    it('should render children with fallback styles', () => {
        render(
            <MotionFallback className="test-class" style={{ color: 'red' }}>
                <div>Fallback content</div>
            </MotionFallback>
        )

        const fallback = screen.getByText('Fallback content').parentElement
        expect(fallback).toHaveClass('test-class')
        expect(fallback).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })
})

describe('withAnimationErrorBoundary', () => {
    it('should wrap component with error boundary', () => {
        const TestComponent = ({ message }: { message: string }) => (
            <div>{message}</div>
        )

        const WrappedComponent = withAnimationErrorBoundary(TestComponent)

        render(<WrappedComponent message="Test message" />)

        expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should handle errors in wrapped component', () => {
        const ErrorComponent = () => {
            throw new Error('Wrapped component error')
        }

        const WrappedComponent = withAnimationErrorBoundary(ErrorComponent)

        render(<WrappedComponent />)

        expect(screen.getByText('Animation Error')).toBeInTheDocument()
        expect(screen.getByText('Wrapped component error')).toBeInTheDocument()
    })
})

describe('MotionLoadDetector', () => {
    let detector: any

    beforeEach(() => {
        detector = (MotionLoadDetector as any).getInstance()
        detector.reset()
    })

    it('should be a singleton', () => {
        const detector1 = (MotionLoadDetector as any).getInstance()
        const detector2 = (MotionLoadDetector as any).getInstance()
        expect(detector1).toBe(detector2)
    })

    it('should detect motion availability', async () => {
        const isAvailable = await detector.checkMotionAvailability()
        expect(typeof isAvailable).toBe('boolean')
    })

    it('should track load status', () => {
        const status = detector.getLoadStatus()
        expect(['loading', 'loaded', 'failed']).toContain(status)
    })
})

describe('AnimationErrorLogger', () => {
    beforeEach(() => {
        (AnimationErrorLogger as any).clearErrors()
    })

    it('should log errors', () => {
        const error: AnimationError = {
            type: AnimationErrorType.ANIMATION_RUNTIME_ERROR,
            message: 'Test error',
            timestamp: Date.now()
        }

        ;(AnimationErrorLogger as any).logError(error)
        const errors = (AnimationErrorLogger as any).getErrors()
        
        expect(errors).toHaveLength(1)
        expect(errors[0]).toMatchObject(error)
    })

    it('should filter errors by type', () => {
        const error1: AnimationError = {
            type: AnimationErrorType.ANIMATION_RUNTIME_ERROR,
            message: 'Runtime error',
            timestamp: Date.now()
        }

        const error2: AnimationError = {
            type: AnimationErrorType.PERFORMANCE_DEGRADATION,
            message: 'Performance error',
            timestamp: Date.now()
        }

        ;(AnimationErrorLogger as any).logError(error1)
        ;(AnimationErrorLogger as any).logError(error2)

        const runtimeErrors = (AnimationErrorLogger as any).getErrorsByType(AnimationErrorType.ANIMATION_RUNTIME_ERROR)
        expect(runtimeErrors).toHaveLength(1)
        expect(runtimeErrors[0].message).toBe('Runtime error')
    })

    it('should provide error statistics', () => {
        const error: AnimationError = {
            type: AnimationErrorType.ANIMATION_RUNTIME_ERROR,
            message: 'Test error',
            timestamp: Date.now()
        }

        ;(AnimationErrorLogger as any).logError(error)
        const stats = (AnimationErrorLogger as any).getErrorStats()
        
        expect(stats[AnimationErrorType.ANIMATION_RUNTIME_ERROR]).toBe(1)
    })
})

describe('BundleOptimizer', () => {
    beforeEach(() => {
        (BundleOptimizer as any).clearCache()
    })

    it('should track loaded modules', async () => {
        await (BundleOptimizer as any).loadMotionModule('core')
        const loadedModules = (BundleOptimizer as any).getLoadedModules()
        
        expect(Array.isArray(loadedModules)).toBe(true)
    })

    it('should provide bundle info', () => {
        const bundleInfo = (BundleOptimizer as any).getBundleInfo()
        
        expect(bundleInfo).toHaveProperty('loadedModules')
        expect(bundleInfo).toHaveProperty('cacheSize')
        expect(bundleInfo).toHaveProperty('estimatedSize')
    })
})

describe('EnhancedMotionFallback', () => {
    it('should render children with fallback behavior', () => {
        render(
            <EnhancedMotionFallback>
                <div>Fallback content</div>
            </EnhancedMotionFallback>
        )

        expect(screen.getByText('Fallback content')).toBeInTheDocument()
    })

    it('should show loading state when enabled', () => {
        render(
            <EnhancedMotionFallback showLoadingState={true}>
                <div>Content</div>
            </EnhancedMotionFallback>
        )

        // Should render content (loading state shows reduced opacity)
        expect(screen.getByText('Content')).toBeInTheDocument()
    })
})