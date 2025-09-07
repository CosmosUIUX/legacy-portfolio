// Motion.dev utilities and exports
export * from './provider'
export * from './accessibility'
export * from './accessibility-wrapper'
export * from './accessibility-compliance'
export * from './skip-navigation'
export * from './focus-management'
export * from './reduced-motion'
export * from './aria-live'
export * from './performance'
export * from './bundle-optimizer'
export * from './types'
export * from './config'
export * from './hooks'
export * from './error-boundary'

// Form animations and validation
export * from './form-animations'
export * from './form-validation'
export * from './form-feedback'

// Cross-browser compatibility
export * from './browser-detection'
export * from './browser-fallbacks'

// Framer Motion exports
export { motion } from './motion-bridge'
export { AnimatePresence, usePresence } from './animate-presence'
export {
  useMotionValue,
  useSpring,
  useTransform,
  useAnimation,
  useScroll,
  useInView,
} from 'framer-motion'
