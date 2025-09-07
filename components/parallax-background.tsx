"use client"

import { motion } from "@/lib/motion"
import { useScrollAnimation } from "@/lib/motion/hooks"
import { useMotionSettings } from "@/lib/motion/provider"
import { EASING_PRESETS } from "@/lib/motion/config"

interface ParallaxBackgroundProps {
  imageUrl: string
  speed?: number
  scale?: [number, number]
  rotation?: [number, number]
  opacity?: [number, number]
  className?: string
  children?: React.ReactNode
  enableRotation?: boolean
  enableScale?: boolean
  // Enhanced parallax options
  enableSkew?: boolean
  skew?: [number, number]
  enablePerspective?: boolean
  rotateX?: [number, number]
  rotateY?: [number, number]
  // Performance optimizations
  enableWillChange?: boolean
  enableGPUAcceleration?: boolean
}

export function ParallaxBackground({
  imageUrl,
  speed = 0.5,
  scale = [1.05, 0.95],
  rotation = [0, 2],
  opacity = [0.7, 0.9],
  className = "",
  children,
  enableRotation = false,
  enableScale = true,
  // Enhanced parallax options
  enableSkew = false,
  skew = [0, 2],
  enablePerspective = false,
  rotateX = [0, 5],
  rotateY = [0, 3],
  // Performance optimizations
  enableWillChange = true,
  enableGPUAcceleration = true
}: ParallaxBackgroundProps) {
  const { shouldAnimate, performanceMode } = useMotionSettings()
  
  // Configure advanced scroll animation with enhanced effects and performance optimizations
  const { ref, style } = useScrollAnimation({
    offset: ['start start', 'end start'],
    transform: {
      y: [0, `${speed * 100}%`],
      ...(enableScale && { scale }),
      ...(enableRotation && performanceMode !== 'battery' && { rotate: rotation }),
      ...(enableSkew && performanceMode === 'high' && { skewX: skew, skewY: [skew[0] * 0.5, skew[1] * 0.5] }),
      ...(enablePerspective && performanceMode === 'high' && { 
        rotateX: rotateX,
        rotateY: rotateY
      })
    },
    spring: performanceMode === 'high',
    springConfig: {
      stiffness: 120,
      damping: 25,
      mass: 0.8
    },
    onScrollStart: () => {
      // Performance optimization: enable GPU acceleration during scroll
      if (enableGPUAcceleration && ref.current) {
        (ref.current as HTMLElement).style.willChange = 'transform, opacity'
      }
    },
    onScrollEnd: () => {
      // Performance optimization: disable GPU acceleration when not scrolling
      if (enableGPUAcceleration && ref.current) {
        (ref.current as HTMLElement).style.willChange = 'auto'
      }
    }
  })

  // Separate opacity animation for smoother performance
  const { style: opacityStyle } = useScrollAnimation({
    offset: ['start start', 'end start'],
    transform: {
      opacity
    }
  })

  // Fallback for when animations are disabled
  if (!shouldAnimate) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            filter: `brightness(${opacity[0]})`
          }}
        />
        {children}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={`absolute inset-0 ${className}`}>
      {/* Enhanced parallax background layer with advanced effects */}
      <motion.div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${enableWillChange ? 'will-change-transform' : ''}`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          ...style,
          ...opacityStyle,
          filter: 'brightness(0.7)',
          // Enhanced GPU acceleration
          ...(enableGPUAcceleration && {
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: enablePerspective ? '1000px' : 'none'
          })
        }}
        initial={{ 
          scale: scale[0],
          opacity: opacity[0],
          ...(enableRotation && { rotate: rotation[0] }),
          ...(enableSkew && { skewX: skew[0], skewY: skew[0] * 0.5 }),
          ...(enablePerspective && { rotateX: rotateX[0], rotateY: rotateY[0] })
        }}
        animate={{ 
          scale: scale[0],
          opacity: opacity[0],
          ...(enableRotation && { rotate: 0 }),
          ...(enableSkew && { skewX: 0, skewY: 0 }),
          ...(enablePerspective && { rotateX: 0, rotateY: 0 })
        }}
        transition={{ 
          duration: 1.4, 
          ease: EASING_PRESETS.cinematic as any,
          // Stagger different transform properties for more natural feel
          scale: { duration: 1.6, ease: EASING_PRESETS.smooth as any },
          rotate: { duration: 2.0, ease: EASING_PRESETS.elastic as any },
          skewX: { duration: 1.8, ease: EASING_PRESETS.bounce as any },
          skewY: { duration: 1.8, ease: EASING_PRESETS.bounce as any }
        }}
      />
      
      {/* Overlay for better text readability */}
      <motion.div 
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.3,
          ease: EASING_PRESETS.smooth as any
        }}
      />
      
      {children}
    </div>
  )
}

// Multi-layer parallax system for complex effects
interface ParallaxLayerProps {
  imageUrl?: string
  speed: number
  opacity?: number
  blur?: number
  className?: string
  children?: React.ReactNode
  // Enhanced layer options
  scale?: [number, number]
  rotation?: [number, number]
  enableAdvancedEffects?: boolean
  brightness?: number
  contrast?: number
  saturate?: number
}

export function ParallaxLayer({
  imageUrl,
  speed,
  opacity = 1,
  blur = 0,
  className = "",
  children,
  // Enhanced layer options
  scale = [1, 1],
  rotation = [0, 0],
  enableAdvancedEffects = false,
  brightness = 1,
  contrast = 1,
  saturate = 1
}: ParallaxLayerProps) {
  const { shouldAnimate } = useMotionSettings()
  
  const { ref, style } = useScrollAnimation({
    offset: ['start start', 'end start'],
    transform: {
      y: [0, `${speed * 100}%`],
      ...(enableAdvancedEffects && scale[0] !== scale[1] && { scale }),
      ...(enableAdvancedEffects && rotation[0] !== rotation[1] && { rotate: rotation })
    },
    spring: enableAdvancedEffects,
    springConfig: {
      stiffness: 80,
      damping: 20,
      mass: 1.2
    }
  })

  if (!shouldAnimate) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        {imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
              opacity,
              filter: blur > 0 ? `blur(${blur}px)` : undefined
            }}
          />
        )}
        {children}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={`absolute inset-0 ${className}`}>
      {imageUrl && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url(${imageUrl})`,
            opacity,
            filter: `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
            ...style,
            // Performance optimizations
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          initial={{
            ...(enableAdvancedEffects && scale[0] !== scale[1] && { scale: scale[0] }),
            ...(enableAdvancedEffects && rotation[0] !== rotation[1] && { rotate: rotation[0] })
          }}
          animate={{
            ...(enableAdvancedEffects && scale[0] !== scale[1] && { scale: scale[0] }),
            ...(enableAdvancedEffects && rotation[0] !== rotation[1] && { rotate: 0 })
          }}
          transition={{
            duration: 1.0,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      )}
      {children}
    </div>
  )
}

// Multi-layer parallax container
interface MultiLayerParallaxProps {
  layers: Array<{
    imageUrl?: string
    speed: number
    opacity?: number
    blur?: number
    className?: string
    // Enhanced layer options
    scale?: [number, number]
    rotation?: [number, number]
    enableAdvancedEffects?: boolean
    brightness?: number
    contrast?: number
    saturate?: number
  }>
  children?: React.ReactNode
  className?: string
  // Performance options
  enablePerformanceMode?: boolean
}

export function MultiLayerParallax({
  layers,
  children,
  className = "",
  enablePerformanceMode = true
}: MultiLayerParallaxProps) {
  return (
    <div className={`relative ${className}`} style={{ 
      // Performance optimization for multi-layer parallax
      ...(enablePerformanceMode && {
        willChange: 'transform',
        transform: 'translateZ(0)'
      })
    }}>
      {layers.map((layer, index) => (
        <ParallaxLayer
          key={`parallax-layer-${index}`}
          imageUrl={layer.imageUrl}
          speed={layer.speed}
          opacity={layer.opacity}
          blur={layer.blur}
          className={layer.className}
          scale={layer.scale}
          rotation={layer.rotation}
          enableAdvancedEffects={layer.enableAdvancedEffects}
          brightness={layer.brightness}
          contrast={layer.contrast}
          saturate={layer.saturate}
        />
      ))}
      {children}
    </div>
  )
}