"use client"

import { motion } from "@/lib/motion"
import { useStaggerAnimation } from "@/lib/motion/hooks"
import { useMotionSettings } from "@/lib/motion/provider"
import { EASING_PRESETS, DURATION_PRESETS } from "@/lib/motion/config"
import { BlurPanel } from "./blur-panel"
import { useState, useCallback } from "react"

interface InfoItem {
  icon: React.ComponentType<{ className?: string }>
  text: string
  color: string
  hoverColor?: string
  iconAnimation?: 'slide' | 'fade' | 'scale' | 'bounce' | 'rotate' | 'flip'
}

interface EnhancedInfoStripProps {
  items: InfoItem[]
  className?: string
  staggerDelay?: number
  animationType?: 'slide' | 'fade' | 'scale' | 'bounce'
  enableHoverEffects?: boolean
  enableIconAnimations?: boolean
  responsiveStagger?: boolean
}

export function EnhancedInfoStrip({
  items,
  className = "",
  staggerDelay = 150,
  animationType = 'slide',
  enableHoverEffects = true,
  enableIconAnimations = true,
  responsiveStagger = true
}: EnhancedInfoStripProps) {
  const { shouldAnimate, performanceMode } = useMotionSettings()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  // Responsive stagger delay based on screen size
  const getResponsiveStaggerDelay = useCallback(() => {
    if (!responsiveStagger) return staggerDelay
    
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 640) return staggerDelay * 0.7 // Mobile: faster stagger
      if (width < 1024) return staggerDelay * 0.85 // Tablet: slightly faster
    }
    return staggerDelay // Desktop: normal speed
  }, [staggerDelay, responsiveStagger])

  // Use enhanced stagger animation with Motion.dev sequence animations
  const { ref, getItemProps, isComplete } = useStaggerAnimation({
    items,
    staggerDelay: getResponsiveStaggerDelay(),
    trigger: 'viewport',
    direction: 'forward',
    animationPreset: 'staggerFadeIn',
    onItemStart: (index) => {
      // Optional callback for when each item starts animating
    },
    onItemComplete: (index) => {
      // Optional callback for when each item completes animation
    }
  })

  // Enhanced animation variants with Motion.dev sequence support
  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'slide':
        return {
          hidden: { 
            opacity: 0, 
            y: 30, 
            scale: 0.9,
            filter: 'blur(4px)',
            rotateX: 15
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            filter: 'blur(0px)',
            rotateX: 0
          }
        }
      case 'fade':
        return {
          hidden: { 
            opacity: 0,
            filter: 'blur(2px)',
            scale: 0.95
          },
          visible: { 
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1
          }
        }
      case 'scale':
        return {
          hidden: { 
            opacity: 0, 
            scale: 0.3,
            rotate: -15,
            filter: 'blur(3px)'
          },
          visible: { 
            opacity: 1, 
            scale: 1,
            rotate: 0,
            filter: 'blur(0px)'
          }
        }
      case 'bounce':
        return {
          hidden: { 
            opacity: 0, 
            y: -30, 
            scale: 0.6,
            rotate: 10
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotate: 0
          }
        }
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }
    }
  }

  // Icon-specific animation variants
  const getIconAnimationVariants = (iconAnimation: string) => {
    switch (iconAnimation) {
      case 'rotate':
        return {
          hidden: { opacity: 0, rotate: -180, scale: 0.5 },
          visible: { opacity: 1, rotate: 0, scale: 1 }
        }
      case 'flip':
        return {
          hidden: { opacity: 0, rotateY: 90, scale: 0.8 },
          visible: { opacity: 1, rotateY: 0, scale: 1 }
        }
      case 'bounce':
        return {
          hidden: { opacity: 0, y: -20, scale: 0.3 },
          visible: { opacity: 1, y: 0, scale: 1 }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0 },
          visible: { opacity: 1, scale: 1 }
        }
      case 'slide':
        return {
          hidden: { opacity: 0, x: -20, scale: 0.8 },
          visible: { opacity: 1, x: 0, scale: 1 }
        }
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
    }
  }

  const variants = getAnimationVariants(animationType)

  // Fallback for when animations are disabled
  if (!shouldAnimate) {
    return (
      <div className={className}>
        <BlurPanel className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-4 sm:px-6 py-3 sm:py-4 bg-black/24 backdrop-blur-md border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white/90">
            {items.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                  <span className="text-xs sm:text-sm whitespace-nowrap">{item.text}</span>
                </div>
              )
            })}
          </div>
        </BlurPanel>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref as any}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: DURATION_PRESETS.normal / 1000, 
        delay: 1.2, 
        ease: EASING_PRESETS.cinematic as any
      }}
    >
      <BlurPanel className="w-full max-w-4xl mx-auto mb-4 sm:mb-6 px-4 sm:px-6 py-3 sm:py-4 bg-black/24 backdrop-blur-md border-white/20">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white/90">
          {items.map((item, index) => {
            const IconComponent = item.icon
            const itemProps = getItemProps(index)
            const iconVariants = enableIconAnimations 
              ? getIconAnimationVariants(item.iconAnimation || 'fade')
              : { hidden: { opacity: 0 }, visible: { opacity: 1 } }
            
            return (
              <motion.div
                key={index}
                {...itemProps}
                variants={variants}
                transition={{
                  ...itemProps.transition,
                  duration: DURATION_PRESETS.normal / 1000,
                  ease: (animationType === 'bounce' ? EASING_PRESETS.bounce : EASING_PRESETS.cinematic) as any
                }}
                className="flex items-center gap-2 group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={enableHoverEffects && performanceMode !== 'battery' ? {
                  scale: 1.08,
                  y: -3,
                  transition: { 
                    duration: DURATION_PRESETS.fast / 1000,
                    ease: EASING_PRESETS.snappy as any,
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }
                } : undefined}
                whileTap={enableHoverEffects ? {
                  scale: 0.92,
                  transition: { 
                    duration: DURATION_PRESETS.fast / 1000,
                    ease: EASING_PRESETS.fast as any
                  }
                } : undefined}
              >
                {/* Enhanced icon with individual animation */}
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    duration: DURATION_PRESETS.normal / 1000,
                    delay: (itemProps.transition?.delay || 0) + 0.1, // Slight delay after container
                    ease: item.iconAnimation === 'bounce' ? EASING_PRESETS.bounce as any : EASING_PRESETS.cinematic as any
                  }}
                  whileHover={enableHoverEffects && performanceMode !== 'battery' ? {
                    rotate: hoveredIndex === index ? [0, -8, 8, -4, 4, 0] : 0,
                    scale: hoveredIndex === index ? 1.15 : 1,
                    transition: { 
                      duration: 0.6,
                      ease: EASING_PRESETS.bounce as any,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  } : undefined}
                  className="relative"
                >
                  <IconComponent 
                    className={`w-4 h-4 ${item.color} flex-shrink-0 transition-all duration-300 ${
                      enableHoverEffects && item.hoverColor 
                        ? `group-hover:${item.hoverColor}` 
                        : ''
                    } ${hoveredIndex === index ? 'drop-shadow-lg' : ''}`} 
                  />
                  
                  {/* Hover glow effect */}
                  {enableHoverEffects && hoveredIndex === index && (
                    <motion.div
                      className={`absolute inset-0 ${item.color} opacity-30 blur-sm`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.3 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>

                {/* Enhanced text with micro-interactions */}
                <motion.span 
                  className="text-xs sm:text-sm whitespace-nowrap font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: DURATION_PRESETS.normal / 1000,
                    delay: (itemProps.transition?.delay || 0) + 0.15, // Slight delay after icon
                    ease: EASING_PRESETS.smooth as any
                  }}
                  whileHover={enableHoverEffects ? {
                    x: hoveredIndex === index ? 4 : 0,
                    scale: hoveredIndex === index ? 1.05 : 1,
                    transition: { 
                      duration: DURATION_PRESETS.fast / 1000,
                      ease: EASING_PRESETS.snappy as any,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  } : undefined}
                >
                  {item.text}
                </motion.span>

                {/* Hover underline effect */}
                {enableHoverEffects && (
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 ${item.color} opacity-60`}
                    initial={{ width: 0 }}
                    animate={{ width: hoveredIndex === index ? '100%' : 0 }}
                    transition={{ 
                      duration: DURATION_PRESETS.fast / 1000,
                      ease: EASING_PRESETS.snappy as any
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </BlurPanel>
    </motion.div>
  )
}

// Responsive info strip that adapts animation based on screen size and device capabilities
export function ResponsiveInfoStrip({
  items,
  className = "",
  mobileAnimationType = 'fade',
  desktopAnimationType = 'slide',
  enableHoverEffects = true,
  enableIconAnimations = true
}: Omit<EnhancedInfoStripProps, 'animationType' | 'enableIconAnimations'> & {
  mobileAnimationType?: 'slide' | 'fade' | 'scale' | 'bounce'
  desktopAnimationType?: 'slide' | 'fade' | 'scale' | 'bounce'
  enableIconAnimations?: boolean
}) {
  const { performanceMode } = useMotionSettings()
  
  // Enhanced responsive behavior with device detection
  const getResponsiveSettings = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        animationType: desktopAnimationType,
        staggerDelay: 150,
        enableAdvancedEffects: true
      }
    }

    const width = window.innerWidth
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isTouch = 'ontouchstart' in window
    
    // Mobile optimizations
    if (isMobile) {
      return {
        animationType: mobileAnimationType,
        staggerDelay: 80, // Faster on mobile
        enableAdvancedEffects: performanceMode === 'high'
      }
    }
    
    // Tablet optimizations
    if (isTablet) {
      return {
        animationType: isTouch ? mobileAnimationType : desktopAnimationType,
        staggerDelay: 120,
        enableAdvancedEffects: performanceMode !== 'battery'
      }
    }
    
    // Desktop settings
    return {
      animationType: desktopAnimationType,
      staggerDelay: 150,
      enableAdvancedEffects: true
    }
  }, [mobileAnimationType, desktopAnimationType, performanceMode])

  const { animationType, staggerDelay, enableAdvancedEffects } = getResponsiveSettings()

  // Enhanced items with responsive icon animations
  const enhancedItems = items.map((item, index) => ({
    ...item,
    iconAnimation: enableAdvancedEffects 
      ? (item.iconAnimation || (['rotate', 'flip', 'bounce', 'scale'][index % 4] as any))
      : 'fade'
  }))

  return (
    <EnhancedInfoStrip
      items={enhancedItems}
      className={className}
      animationType={animationType}
      staggerDelay={staggerDelay}
      enableHoverEffects={enableHoverEffects && performanceMode !== 'battery'}
      enableIconAnimations={enableIconAnimations && enableAdvancedEffects}
      responsiveStagger={true}
    />
  )
}