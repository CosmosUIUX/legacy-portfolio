"use client";

import { useEffect, useState, useRef } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
  amount?: number;
  margin?: string;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    once = true,
    amount,
    margin,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Use margin or rootMargin
    const finalRootMargin = margin || rootMargin;
    // Use amount or threshold
    const finalThreshold = amount !== undefined ? amount : threshold;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isInView = entry.isIntersecting;
        setIsIntersecting(isInView);

        if (isInView && !hasIntersected) {
          setHasIntersected(true);
        }

        // If once is true and element has intersected, disconnect
        if (once && isInView) {
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: finalThreshold,
        rootMargin: finalRootMargin,
      },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, once, amount, margin, hasIntersected]);

  const setElement = (element: Element | null) => {
    elementRef.current = element;
  };

  return {
    ref: { current: elementRef.current },
    isIntersecting: once ? hasIntersected : isIntersecting,
    hasIntersected,
    setElement,
  };
}

// Hook with simpler API matching Motion.dev patterns
export function useInView(
  ref: React.RefObject<Element>,
  options: {
    once?: boolean;
    margin?: string;
    amount?: number;
  } = {},
) {
  const [isInView, setIsInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { once = true, margin = "0px", amount = 0.1 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsInView(isIntersecting);

        if (isIntersecting && !hasEntered) {
          setHasEntered(true);
        }

        if (once && isIntersecting) {
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: amount,
        rootMargin: margin,
      },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref, once, margin, amount, hasEntered]);

  return once ? hasEntered : isInView;
}

// Hook for scroll progress tracking
export function useScroll(
  options: {
    target?: React.RefObject<Element>;
    offset?: string[];
    container?: React.RefObject<Element>;
  } = {},
) {
  const [scrollY, setScrollY] = useState(0);
  const [scrollYProgress, setScrollYProgress] = useState(0);
  const { target, offset = ["start end", "end start"] } = options;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (target?.current) {
        const element = target.current;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate scroll progress based on element position
        const elementTop = rect.top + currentScrollY;
        const elementHeight = rect.height;

        // Simple progress calculation
        const startPoint = elementTop - windowHeight;
        const endPoint = elementTop + elementHeight;
        const totalDistance = endPoint - startPoint;
        const currentProgress = Math.max(
          0,
          Math.min(1, (currentScrollY - startPoint) / totalDistance),
        );

        setScrollYProgress(currentProgress);
      } else {
        // Global scroll progress
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollYProgress(maxScroll > 0 ? currentScrollY / maxScroll : 0);
      }
    };

    handleScroll(); // Initial calculation
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [target, offset]);

  return {
    scrollY: {
      get: () => scrollY,
      on: (event: string, callback: (value: number) => void) => {
        if (event === "change") {
          // Simple implementation - in real usage would set up proper event system
          const unsubscribe = () => {};
          return unsubscribe;
        }
        return () => {};
      },
    },
    scrollYProgress: {
      get: () => scrollYProgress,
      on: (event: string, callback: (value: number) => void) => {
        if (event === "change") {
          // Simple implementation
          const unsubscribe = () => {};
          return unsubscribe;
        }
        return () => {};
      },
    },
  };
}
