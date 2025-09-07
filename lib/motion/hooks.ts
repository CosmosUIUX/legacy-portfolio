// lib/motion/hooks.ts
'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

type Direction = 'forward' | 'reverse' | 'center-out' | 'random'

type StaggerOptions = {
  items?: any[]
  staggerDelay?: number | ((index: number) => number)
  animationPreset?: 'staggerFadeIn' | 'staggerSlideUp' | 'staggerScaleIn'
  trigger?: 'viewport' | 'manual' | 'load'
  direction?: Direction
  duration?: number
  easing?: any
  onComplete?: () => void
  onItemStart?: (index: number) => void
  onItemComplete?: (index: number) => void
  pauseOnHover?: boolean
  loop?: boolean
  loopDelay?: number
}

type ViewportOptions = {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  onEnter?: () => void
  onExit?: () => void
}

function calculateAnimationOrder(length: number, direction: Direction) {
  const indices = Array.from({ length }, (_, i) => i)
  switch (direction) {
    case 'reverse':
      return indices.reverse()
    case 'center-out': {
      const center = Math.floor(length / 2)
      const order: number[] = []
      for (let i = 0; i < length; i++) {
        const leftIndex = center - i
        const rightIndex = center + i + (length % 2 === 0 ? 1 : 0)
        if (leftIndex >= 0) order.push(leftIndex)
        if (rightIndex < length && rightIndex !== leftIndex) order.push(rightIndex)
      }
      return order
    }
    case 'random':
      return indices.sort(() => Math.random() - 0.5)
    case 'forward':
    default:
      return indices
  }
}

export function useStaggerAnimation(options: StaggerOptions = {}) {
  const {
    items = [],
    staggerDelay = 100,
    animationPreset = 'staggerFadeIn',
    trigger = 'viewport',
    direction = 'forward',
    duration = 400,
    easing = 'easeOut',
    onComplete,
    onItemStart,
    onItemComplete,
    pauseOnHover = false,
    loop = false,
    loopDelay = 1000
  } = options

  const containerRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const order = useMemo(() => calculateAnimationOrder(items.length, direction), [items.length, direction])

  const computeDelayForIndex = useCallback((index: number) => {
    const orderIndex = order.indexOf(index)
    const base =
      typeof staggerDelay === 'function'
        ? staggerDelay(orderIndex)
        : typeof staggerDelay === 'number'
        ? staggerDelay
        : 100
    return (typeof base === 'number' ? base : 100) * (orderIndex >= 0 ? 1 : index)
  }, [staggerDelay, order])

  const startAnimation = useCallback(() => {
    setActive(true)
    setIsComplete(false)
    setIsPaused(false)
    setCurrentIndex(0)
  }, [])

  const resetAnimation = useCallback(() => {
    setActive(false)
    setIsComplete(false)
    setIsPaused(false)
    setCurrentIndex(-1)
  }, [])

  useEffect(() => {
    if (trigger !== 'viewport') {
      if (trigger === 'load') startAnimation()
      return
    }

    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation()
            options.onEnter?.()
          } else {
            if (!options.triggerOnce) {
              resetAnimation()
              options.onExit?.()
            }
          }
        })
      },
      { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0.1 }
    )

    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, trigger])

  useEffect(() => {
    if (!active) return
    const lastIndex = Math.max(0, items.length - 1)
    const maxDelay = computeDelayForIndex(lastIndex)
    const totalMs = maxDelay + duration + 50

    const t = window.setTimeout(() => {
      setIsComplete(true)
      onComplete?.()
      if (loop) {
        const loopTimer = window.setTimeout(() => {
          resetAnimation()
          startAnimation()
        }, loopDelay)
        return () => window.clearTimeout(loopTimer)
      }
    }, totalMs)

    return () => window.clearTimeout(t)
  }, [active, items.length, computeDelayForIndex, duration, onComplete, loop, loopDelay, resetAnimation, startAnimation])

  const getItemProps = useCallback((index: number) => {
    const orderIndex = order.indexOf(index)
    const delayMs = computeDelayForIndex(index)
    const delayS = Math.max(0, delayMs / 1000)
    const durS = Math.max(0.01, duration / 1000)

    const presets: Record<string, any> = {
      staggerFadeIn: {
        hidden: { opacity: 0, y: 8, scale: 0.985 },
        visible: { opacity: 1, y: 0, scale: 1 }
      },
      staggerSlideUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      },
      staggerScaleIn: {
        hidden: { opacity: 0, scale: 0.92 },
        visible: { opacity: 1, scale: 1 }
      }
    }

    const chosen = presets[animationPreset] ?? presets.staggerFadeIn

    return {
      initial: 'hidden',
      animate: active && !isPaused ? 'visible' : 'hidden',
      variants: {
        hidden: chosen.hidden,
        visible: {
          ...chosen.visible,
          transition: {
            duration: durS,
            ease: easing,
            delay: delayS
          }
        }
      },
      transition: {
        duration: durS,
        ease: easing,
        delay: delayS
      },
      'data-stagger-index': orderIndex >= 0 ? orderIndex : index
    }
  }, [active, isPaused, computeDelayForIndex, duration, animationPreset, easing, order])

  return {
    ref: containerRef as React.RefObject<HTMLElement>,
    getItemProps,
    startAnimation,
    resetAnimation,
    isComplete,
    isPaused,
    start: startAnimation,
    stop: resetAnimation
  }
}

/**
 * Simple viewport hook using IntersectionObserver.
 * Usage:
 *   const { ref, isInView, hasEntered } = useViewportAnimation({...})
 */
export function useViewportAnimation(options: ViewportOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    onEnter,
    onExit
  } = options

  const ref = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true)
            setHasEntered(true)
            onEnter?.()
            if (triggerOnce) obs.disconnect()
          } else {
            setIsInView(false)
            if (!triggerOnce) onExit?.()
          }
        })
      },
      { root: null, threshold, rootMargin }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, rootMargin, triggerOnce, onEnter, onExit])

  return {
    ref: ref as React.RefObject<HTMLElement>,
    isInView,
    hasEntered,
    shouldAnimate: isInView
  }
}

/**
 * Minimal scroll tracking helper returning progress (no Motion dep).
 */
export function useScrollAnimation(range: { start?: number; end?: number } = {}) {
  const { start = 0, end = 100 } = range
  const [scrollY, setScrollY] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      const p = Math.max(0, Math.min(1, (y - start) / Math.max(1, end - start)))
      setScrollY(y)
      setProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [start, end])

  return { scrollY, progress }
}

/**
 * Lightweight micro-interaction hook exposing hover/press gesture state.
 * Spread eventHandlers onto motion.* (onHoverStart/onHoverEnd or pointer). 
 */
type UseMotionOptions = {
  trigger?: 'hover' | 'press'
  duration?: number
  easing?: 'spring' | 'ease' | any
}

export function useMotion(opts: UseMotionOptions = {}) {
  const { trigger = 'hover', duration = 200, easing = 'spring' } = opts
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const eventHandlers =
    trigger === 'hover'
      ? {
          onHoverStart: () => setIsHovered(true),
          onHoverEnd: () => setIsHovered(false),
        }
      : {
          onPointerDown: () => setIsPressed(true),
          onPointerUp: () => setIsPressed(false),
          onPointerCancel: () => setIsPressed(false),
          onBlur: () => setIsPressed(false),
        }

  return {
    isHovered,
    isPressed,
    eventHandlers,
    duration,
    easing,
  }
}
