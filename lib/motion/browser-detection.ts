/**
 * Browser detection and feature support utilities
 * Provides browser-specific optimizations and fallbacks
 */

export interface BrowserInfo {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  version: number
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  supportsModernCSS: boolean
  supportsWebGL: boolean
  supportsIntersectionObserver: boolean
  supportsResizeObserver: boolean
}

export interface FeatureSupport {
  cssGrid: boolean
  flexbox: boolean
  transforms3d: boolean
  backdropFilter: boolean
  clipPath: boolean
  customProperties: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  webAnimations: boolean
  requestAnimationFrame: boolean
}

/**
 * Detect current browser and version
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  const isIOS = /iphone|ipad|ipod/i.test(userAgent)
  const isAndroid = /android/i.test(userAgent)

  let name: BrowserInfo['name'] = 'unknown'
  let version = 0

  // Chrome detection (must come before Safari)
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    name = 'chrome'
    const match = userAgent.match(/chrome\/(\d+)/)
    version = match ? parseInt(match[1], 10) : 0
  }
  // Edge detection (must come before Chrome)
  else if (userAgent.includes('edg')) {
    name = 'edge'
    const match = userAgent.match(/edg\/(\d+)/)
    version = match ? parseInt(match[1], 10) : 0
  }
  // Firefox detection
  else if (userAgent.includes('firefox')) {
    name = 'firefox'
    const match = userAgent.match(/firefox\/(\d+)/)
    version = match ? parseInt(match[1], 10) : 0
  }
  // Safari detection
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    name = 'safari'
    const match = userAgent.match(/version\/(\d+)/)
    version = match ? parseInt(match[1], 10) : 0
  }

  return {
    name,
    version,
    isMobile,
    isIOS,
    isAndroid,
    supportsModernCSS: checkModernCSSSupport(name, version),
    supportsWebGL: checkWebGLSupport(),
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window
  }
}

/**
 * Check feature support across browsers
 */
export function checkFeatureSupport(): FeatureSupport {
  const support: FeatureSupport = {
    cssGrid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    transforms3d: CSS.supports('transform', 'translateZ(0)'),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    clipPath: CSS.supports('clip-path', 'circle(50%)'),
    customProperties: CSS.supports('--custom', 'value'),
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    webAnimations: 'animate' in document.createElement('div'),
    requestAnimationFrame: 'requestAnimationFrame' in window
  }

  return support
}

/**
 * Check if browser supports modern CSS features
 */
function checkModernCSSSupport(browser: string, version: number): boolean {
  switch (browser) {
    case 'chrome':
      return version >= 88 // Chrome 88+ has full modern CSS support
    case 'firefox':
      return version >= 85 // Firefox 85+ has good modern CSS support
    case 'safari':
      return version >= 14 // Safari 14+ has decent modern CSS support
    case 'edge':
      return version >= 88 // Edge 88+ (Chromium-based)
    default:
      return false
  }
}

/**
 * Check WebGL support for hardware acceleration
 */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

/**
 * Get browser-specific animation preferences
 */
export function getBrowserAnimationConfig(browser: BrowserInfo): {
  useHardwareAcceleration: boolean
  preferredEasing: string
  maxAnimationDuration: number
  useWillChange: boolean
  useTransform3d: boolean
} {
  const config = {
    useHardwareAcceleration: true,
    preferredEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    maxAnimationDuration: 1000,
    useWillChange: true,
    useTransform3d: true
  }

  switch (browser.name) {
    case 'safari':
      // Safari benefits from shorter animations and careful will-change usage
      return {
        ...config,
        maxAnimationDuration: 800,
        useWillChange: false, // Safari can have issues with will-change
        preferredEasing: 'ease-out'
      }

    case 'firefox':
      // Firefox performs well with will-change and transform3d
      return {
        ...config,
        useWillChange: true,
        useTransform3d: true,
        preferredEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }

    case 'edge':
    case 'chrome':
      // Chrome and Edge handle all modern features well
      return config

    default:
      // Conservative settings for unknown browsers
      return {
        ...config,
        useHardwareAcceleration: false,
        maxAnimationDuration: 600,
        useWillChange: false,
        useTransform3d: false,
        preferredEasing: "easeInOut"
      }
  }
}

/**
 * Get fallback styles for unsupported features
 */
export function getFallbackStyles(features: FeatureSupport): Record<string, string> {
  const fallbacks: Record<string, string> = {}

  if (!features.cssGrid) {
    fallbacks['--grid-fallback'] = 'flex'
    fallbacks['--grid-gap-fallback'] = 'margin'
  }

  if (!features.backdropFilter) {
    fallbacks['--backdrop-fallback'] = 'rgba(255, 255, 255, 0.9)'
  }

  if (!features.transforms3d) {
    fallbacks['--transform-fallback'] = 'transform: scale(1.02)'
  }

  if (!features.customProperties) {
    // Provide static values for browsers without CSS custom properties
    fallbacks['color'] = '#333'
    fallbacks['background-color'] = '#fff'
  }

  return fallbacks
}

/**
 * Apply browser-specific optimizations to animation config
 */
export function optimizeForBrowser(
  animationConfig: any,
  browser: BrowserInfo
): any {
  const browserConfig = getBrowserAnimationConfig(browser)
  
  return {
    ...animationConfig,
    duration: Math.min(animationConfig.duration || 500, browserConfig.maxAnimationDuration),
    easing: browserConfig.preferredEasing,
    useHardwareAcceleration: browserConfig.useHardwareAcceleration,
    style: {
      ...animationConfig.style,
      ...(browserConfig.useWillChange && { willChange: 'transform, opacity' }),
      ...(browserConfig.useTransform3d && { transform: 'translateZ(0)' })
    }
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get device performance tier for animation complexity
 */
export function getPerformanceTier(): 'high' | 'medium' | 'low' {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory || 4
  
  // Check connection speed
  const connection = (navigator as any).connection
  const effectiveType = connection?.effectiveType || '4g'
  
  if (cores >= 8 && memory >= 8 && effectiveType === '4g') {
    return 'high'
  } else if (cores >= 4 && memory >= 4) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * Create browser-specific CSS class names
 */
export function getBrowserClasses(browser: BrowserInfo): string[] {
  const classes = [
    `browser-${browser.name}`,
    `browser-version-${browser.version}`,
    browser.isMobile ? 'is-mobile' : 'is-desktop',
    browser.supportsModernCSS ? 'supports-modern-css' : 'legacy-css'
  ]

  if (browser.isIOS) classes.push('is-ios')
  if (browser.isAndroid) classes.push('is-android')
  if (prefersReducedMotion()) classes.push('prefers-reduced-motion')

  return classes
}