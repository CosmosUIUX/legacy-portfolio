# Motion.dev Integration

This directory contains the Motion.dev integration for the Legacy Interiors application. Motion.dev provides advanced animation capabilities with better performance characteristics than traditional animation libraries.

## Setup Complete ✅

The following components have been implemented:

### 1. Core Components

- **MotionProvider** (`provider.tsx`): Global animation configuration and context
- **Accessibility Helpers** (`accessibility.ts`): Reduced motion and screen reader support
- **Performance Monitoring** (`performance.ts`): Animation performance tracking and optimization
- **TypeScript Types** (`types.ts`): Complete type definitions for Motion.dev integration

### 2. Key Features

#### Accessibility Support
- Automatic detection of `prefers-reduced-motion` settings
- Screen reader compatibility
- Keyboard navigation support
- Alternative interaction methods for users with disabilities

#### Performance Monitoring
- Real-time frame rate monitoring
- Memory usage tracking
- Battery impact assessment
- Automatic performance mode adjustment

#### Error Boundaries and Fallback System ✅
- Comprehensive error boundary with graceful degradation
- Motion.dev load detection and fallback handling
- Performance monitoring with automatic error reporting
- Bundle optimization with dynamic module loading
- Enhanced error logging and recovery mechanisms

#### Smart Configuration
- Auto-detection of device capabilities
- Battery-aware animation adjustments
- Performance-based animation scaling
- Graceful degradation for low-powered devices

## Usage

### 1. Wrap your app with MotionProvider and Error Boundaries

```tsx
import { 
  MotionProvider, 
  ErrorRecoveryProvider, 
  AnimationErrorBoundary 
} from '@/lib/motion'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorRecoveryProvider>
          <MotionProvider enablePerformanceMonitoring={true}>
            <AnimationErrorBoundary
              recoveryStrategy="FALLBACK_TO_CSS"
              maxRetries={3}
              onError={(error) => console.log('Animation error:', error)}
            >
              {children}
            </AnimationErrorBoundary>
          </MotionProvider>
        </ErrorRecoveryProvider>
      </body>
    </html>
  )
}
```

### 2. Use Motion.dev components with accessibility support

```tsx
import { motion } from '@/lib/motion'
import { useMotionSettings } from '@/lib/motion'

function MyComponent() {
  const { shouldAnimate, getDuration, getEasing } = useMotionSettings()

  if (!shouldAnimate) {
    return <div>Static content for reduced motion</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: getDuration(0.5),
        ease: getEasing('easeOut')
      }}
    >
      Animated content
    </motion.div>
  )
}
```

### 3. Monitor performance and handle errors

```tsx
import { 
  useAnimationPerformance, 
  useAnimationHealthCheck,
  useAnimationErrorLogger,
  EnhancedMotionFallback 
} from '@/lib/motion'

function AnimatedComponent() {
  const metrics = useAnimationPerformance('my-component', true)
  const health = useAnimationHealthCheck()
  const { errors, logError } = useAnimationErrorLogger()
  
  return (
    <EnhancedMotionFallback
      showLoadingState={true}
      errorComponent={({ retry }) => (
        <div>Motion.dev failed to load <button onClick={retry}>Retry</button></div>
      )}
    >
      <motion.div>
        {/* Your animated content */}
        <div>Health: {health.performanceGood ? '✅' : '⚠️'}</div>
        <div>Errors: {errors.length}</div>
      </motion.div>
    </EnhancedMotionFallback>
  )
}
```

## Configuration Options

### MotionProvider Props

- `reducedMotion?: boolean` - Force reduced motion mode
- `performanceMode?: 'high' | 'balanced' | 'battery'` - Set performance mode
- `enablePerformanceMonitoring?: boolean` - Enable performance tracking

### Performance Modes

- **High**: Full animations with complex easing and effects
- **Balanced**: Optimized animations with good performance (default)
- **Battery**: Simplified animations to preserve battery life

## Accessibility Features

### Reduced Motion Support
- Respects system `prefers-reduced-motion` setting
- Provides alternative static content when needed
- Maintains functionality without animations

### Screen Reader Compatibility
- Animations don't interfere with screen reader navigation
- Proper ARIA labels and descriptions
- Alternative interaction methods available

### Keyboard Navigation
- Focus management during animations
- Proper tab order maintenance
- Keyboard shortcuts for animation controls

## Performance Optimization

### Automatic Adjustments
- Frame rate monitoring with automatic quality reduction
- Memory usage tracking and cleanup
- Battery level detection and optimization
- Device capability detection

### Manual Optimization
- Bundle splitting for animation code
- Lazy loading of complex animations
- Memory management for scroll-triggered animations
- Performance metrics dashboard

## Testing

A test component is available at `test-setup.tsx` to verify the Motion.dev integration:

```tsx
import { MotionTestSetup } from '@/lib/motion/test-setup'

// Use this component to test Motion.dev setup
<MotionTestSetup />
```

## Next Steps

With the foundation complete, you can now:

1. Replace existing Framer Motion components with Motion.dev equivalents
2. Implement enhanced animations in the hero section
3. Upgrade product card interactions
4. Enhance navigation and menu animations
5. Add form and input animations

## Error Handling Features ✅

### Error Boundary System
- **AnimationErrorBoundary**: Catches and handles animation component errors
- **ErrorRecoveryProvider**: Manages error state and recovery strategies
- **Enhanced fallback components**: Graceful degradation when Motion.dev fails

### Motion.dev Load Detection
- **MotionLoadDetector**: Detects Motion.dev availability and handles load failures
- **Automatic retry mechanisms**: Configurable retry attempts with exponential backoff
- **Fallback mode detection**: Switches to CSS animations when Motion.dev unavailable

### Performance Monitoring Integration
- **AnimationPerformanceMonitor**: Real-time performance issue detection
- **Automatic error reporting**: Performance degradation triggers error events
- **Memory leak detection**: Monitors and reports excessive memory usage

### Bundle Optimization
- **BundleOptimizer**: Dynamic loading and caching of Motion.dev modules
- **Module splitting**: Load only required Motion.dev features
- **Cache management**: Efficient module caching and cleanup

### Debug and Logging Tools
- **AnimationErrorLogger**: Centralized error logging with filtering and statistics
- **AnimationDebugger**: Debug utilities for development and support
- **Export functionality**: Export debug data for troubleshooting

## Demo Component

A comprehensive demo is available at `examples/error-boundary-demo.tsx`:

```tsx
import { ErrorBoundaryDemo } from '@/lib/motion/examples/error-boundary-demo'

// Use this component to test all error handling features
<ErrorBoundaryDemo />
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **5.1**: Clean separation between animation logic and component logic ✅
- **5.2**: Consistent patterns and TypeScript types ✅
- **5.4**: Proper error boundaries and fallbacks ✅
- **5.5**: Bundle size optimization with dynamic imports ✅
- **6.1**: Accessibility support with reduced motion detection ✅

The Motion.dev foundation with comprehensive error handling is now ready for use throughout the application.