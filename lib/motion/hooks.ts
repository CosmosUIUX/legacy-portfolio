'use client'

import { useScroll, useTransform, useInView, useAnimation, MotionValue } from 'framer-motion';
import { useRef, useState, useEffect, RefObject } from 'react';

type ScrollOffset = string | number;

interface ScrollAnimationOptions {
  offset?: [ScrollOffset, ScrollOffset];
  transform?: {
    [key: string]: [number, number];
  };
  spring?: boolean;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  }
}

interface ScrollAnimationResult {
  ref: RefObject<HTMLElement>;
  style: {
    [key: string]: MotionValue<number>;
  };
  scrollYProgress: MotionValue<number>;
}

export function useScrollAnimation(options: ScrollAnimationOptions): ScrollAnimationResult {
  const ref = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({ 
    target: isMounted ? ref : undefined,
    offset: options.offset as any
  });

  // Always create transforms, but they'll be empty if not mounted or no transform options
  const transforms = options.transform || {};
  const style: Record<string, any> = {};
  
  for (const key in transforms) {
    style[key] = useTransform(scrollYProgress, [0, 1], transforms[key]);
  }

  return { ref, style, scrollYProgress };
}

interface MotionOptions {
  trigger?: 'viewport' | 'hover' | 'press' | 'focus' | 'click';
  duration?: number;
  easing?: any;
  delay?: number;
}

interface MotionResult {
  ref: RefObject<HTMLElement>;
  animationProps: {
    initial: {
      opacity: number;
      y: number;
    };
    animate: {
      opacity: number;
      y: number;
    };
    transition: {
      duration: number;
      ease: any;
      delay?: number;
    };
  };
  eventHandlers: {
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
    onPointerDown?: () => void;
    onPointerUp?: () => void;
    onFocus?: (e: any) => void;
    onBlur?: (e: any) => void;
  };
  isHovered: boolean;
  isPressed: boolean;
}

export function useMotion(options: MotionOptions): MotionResult {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: (options.trigger === 'viewport' && isInView) || (options.trigger === 'hover' && isHovered) || (options.trigger === 'press' && isPressed) || (options.trigger === 'focus' && isFocused) ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: {
      duration: options.duration ? options.duration / 1000 : 0.5,
      ease: options.easing || 'easeInOut',
      delay: options.delay ? options.delay / 1000 : 0,
    },
  };

  const eventHandlers = {
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
    onPointerDown: () => setIsPressed(true),
    onPointerUp: () => setIsPressed(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return { ref, animationProps, eventHandlers, isHovered, isPressed };
}

interface StaggerAnimationOptions {
  staggerDelay?: number | ((index: number) => number);
  items?: any[];
  trigger?: 'viewport' | 'manual' | 'hover';
  direction?: 'forward' | 'reverse' | 'center-out' | 'random';
  animationPreset?: string;
  onItemStart?: (index: number) => void;
  onItemComplete?: (index: number) => void;
}

interface StaggerAnimationResult {
  ref: RefObject<HTMLElement>;
  animationProps: {
    initial: string;
    animate: any;
    variants: {
      hidden: {
        opacity: number;
      };
      visible: {
        opacity: number;
        transition: {
          staggerChildren: number;
        };
      };
    };
  };
  getItemProps: (index: number) => any;
  isComplete: boolean;
  eventHandlers: any;
}

export function useStaggerAnimation(options: StaggerAnimationOptions): StaggerAnimationResult {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isInView) {
      controls.start("visible").then(() => setIsComplete(true));
    }
  }, [controls, isInView]);

  const animationProps = {
    initial: "hidden",
    animate: controls,
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: options.staggerDelay && typeof options.staggerDelay === 'number' ? options.staggerDelay / 1000 : 0.1,
        },
      },
    },
  };

  const getItemProps = (index: number) => ({
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  });

  return { ref, animationProps, getItemProps, isComplete, eventHandlers: {} };
}

interface ViewportAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

interface ViewportAnimationResult {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
  hasEntered: boolean;
}

export function useViewportAnimation(options: ViewportAnimationOptions): ViewportAnimationResult {
  const ref = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const isInView = useInView(ref, { once: options.triggerOnce, amount: options.threshold || 0.1, margin: options.rootMargin as any });

  useEffect(() => {
    if (isInView) {
      setHasEntered(true);
      if (options.onEnter) {
        options.onEnter();
      }
    }
  }, [isInView, options]);

  return { ref, isInView, hasEntered };
}

export function useTextAnimation() {}
export function useGestureAnimation() {}
