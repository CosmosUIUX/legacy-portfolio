"use client";

import React from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { useMotion, useViewportAnimation } from "@/lib/motion/hooks";
import { useMotionSettings } from "@/lib/motion/provider";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey?: string;
  direction?:
    | "slide-left"
    | "slide-right"
    | "slide-up"
    | "slide-down"
    | "fade"
    | "scale"
    | "blur-fade"
    | "zoom-fade";
  duration?: number;
  loading?: boolean;
  loadingText?: string;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

export function PageTransition({
  children,
  className = "",
  transitionKey = "page",
  direction = "fade",
  duration = 500,
  loading = false,
  loadingText = "Loading...",
  onTransitionStart,
  onTransitionComplete,
}: PageTransitionProps) {
  const { shouldAnimate, getDuration, getEasing } = useMotionSettings();

  // Enhanced Motion.dev animation variants with improved easing and transforms
  const getVariants = () => {
    const baseTransition = {
      duration: getDuration(duration) / 1000,
      ease: getEasing("smooth"),
      type: "tween" as const,
    };

    switch (direction) {
      case "slide-left":
        return {
          initial: { x: "100%", opacity: 0, filter: "blur(4px)" },
          animate: { x: 0, opacity: 1, filter: "blur(0px)" },
          exit: { x: "-100%", opacity: 0, filter: "blur(4px)" },
        };
      case "slide-right":
        return {
          initial: { x: "-100%", opacity: 0, filter: "blur(4px)" },
          animate: { x: 0, opacity: 1, filter: "blur(0px)" },
          exit: { x: "100%", opacity: 0, filter: "blur(4px)" },
        };
      case "slide-up":
        return {
          initial: { y: "100%", opacity: 0, scale: 0.95 },
          animate: { y: 0, opacity: 1, scale: 1 },
          exit: { y: "-100%", opacity: 0, scale: 0.95 },
        };
      case "slide-down":
        return {
          initial: { y: "-100%", opacity: 0, scale: 0.95 },
          animate: { y: 0, opacity: 1, scale: 1 },
          exit: { y: "100%", opacity: 0, scale: 0.95 },
        };
      case "scale":
        return {
          initial: { scale: 0.8, opacity: 0, rotate: -2 },
          animate: { scale: 1, opacity: 1, rotate: 0 },
          exit: { scale: 1.1, opacity: 0, rotate: 2 },
        };
      case "blur-fade":
        return {
          initial: { opacity: 0, filter: "blur(10px)", scale: 1.02 },
          animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
          exit: { opacity: 0, filter: "blur(10px)", scale: 0.98 },
        };
      case "zoom-fade":
        return {
          initial: { opacity: 0, scale: 0.9, y: 30 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 1.1, y: -30 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0, y: 20, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.98 },
        };
    }
  };

  const variants = getVariants();
  const transition = {
    duration: getDuration(duration) / 1000,
    ease: getEasing("smooth"),
    type: "tween" as const,
  };

  // Handle transition callbacks
  const handleAnimationStart = React.useCallback(() => {
    onTransitionStart?.();
  }, [onTransitionStart]);

  const handleAnimationComplete = React.useCallback(() => {
    onTransitionComplete?.();
    // Ensure proper focus management after transition
    const timer = setTimeout(() => {
      const mainElement = document.querySelector("main");
      const h1Element = document.querySelector("h1");
      const focusTarget = h1Element || mainElement;

      if (focusTarget && focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });
        // Announce page change to screen readers
        focusTarget.setAttribute("aria-live", "polite");
        setTimeout(() => {
          focusTarget.removeAttribute("aria-live");
        }, 1000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onTransitionComplete]);

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {loading ? (
        <motion.div
          key="loading"
          className={`${className} flex flex-col items-center justify-center min-h-[200px] gap-4`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.3,
            ease: getEasing("smooth"),
          }}
          role="status"
          aria-label={loadingText}
        >
          <LoadingSpinner />
          <motion.p
            className="text-sm text-neutral-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {loadingText}
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key={transitionKey}
          className={className}
          initial={shouldAnimate ? variants.initial : undefined}
          animate={shouldAnimate ? variants.animate : undefined}
          exit={shouldAnimate ? variants.exit : undefined}
          transition={transition}
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
          // Accessibility attributes
          aria-live="polite"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Enhanced loading spinner component with Motion.dev animations
function LoadingSpinner() {
  const { shouldAnimate, getEasing } = useMotionSettings();

  if (!shouldAnimate) {
    return (
      <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-600 rounded-full" />
    );
  }

  return (
    <div className="relative w-12 h-12">
      {/* Primary spinner ring */}
      <div className="absolute inset-0 border-4 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />

      {/* Secondary pulse ring */}
      <motion.div
        className="absolute inset-2 border-2 border-neutral-300 border-t-neutral-500 rounded-full"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          ease: getEasing("smooth"),
        }}
      />

      {/* Center dot with pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-2 h-2 bg-neutral-600 rounded-full"
          animate={{
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            ease: getEasing("smooth"),
          }}
        />
      </div>
    </div>
  );
}

// Enhanced section transition wrapper for smooth navigation between sections
interface SectionTransitionProps {
  children: React.ReactNode;
  sectionId: string;
  className?: string;
  delay?: number;
  animationType?:
    | "fade-up"
    | "fade-in"
    | "slide-left"
    | "slide-right"
    | "scale"
    | "blur-fade";
  threshold?: number;
  onEnterView?: () => void;
  onExitView?: () => void;
}

export function SectionTransition({
  children,
  sectionId,
  className = "",
  delay = 0,
  animationType = "fade-up",
  threshold = 0.1,
  onEnterView,
  onExitView,
}: SectionTransitionProps) {
  const { shouldAnimate } = useMotionSettings();

  const viewportAnimation = useViewportAnimation({
    threshold,
    rootMargin: "0px 0px -100px 0px",
    triggerOnce: true,
    onEnter: onEnterView,
    onExit: onExitView,
  });

  const sectionMotion = useMotion({
    trigger: "viewport",
    duration: 600,
    delay: delay,
  });

  // Animation variants based on type
  const getVariants = () => {
    switch (animationType) {
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      case "blur-fade":
        return {
          hidden: { opacity: 0, filter: "blur(8px)" },
          visible: { opacity: 1, filter: "blur(0px)" },
        };
      case "fade-up":
      default:
        return {
          hidden: { opacity: 0, y: 50, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1 },
        };
    }
  };

  return (
    <motion.section
      ref={viewportAnimation.ref}
      id={sectionId}
      className={className}
      initial={shouldAnimate ? "hidden" : false}
      animate={
        shouldAnimate && viewportAnimation.isInView ? "visible" : "hidden"
      }
      variants={getVariants()}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      // Accessibility attributes
      aria-label={`Section: ${sectionId}`}
      tabIndex={-1}
    >
      {children}
    </motion.section>
  );
}

// Enhanced route transition wrapper for Next.js page transitions with Motion.dev routing
interface RouteTransitionProps {
  children: React.ReactNode;
  pathname: string;
  className?: string;
  direction?: "forward" | "backward" | "none";
  preserveScroll?: boolean;
  onRouteChangeStart?: (pathname: string) => void;
  onRouteChangeComplete?: (pathname: string) => void;
}

export function RouteTransition({
  children,
  pathname,
  className = "",
  direction = "forward",
  preserveScroll = false,
  onRouteChangeStart,
  onRouteChangeComplete,
}: RouteTransitionProps) {
  const { shouldAnimate, getDuration, getEasing } = useMotionSettings();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const scrollPositionRef = React.useRef(0);

  // Store scroll position before transition
  React.useEffect(() => {
    if (preserveScroll) {
      scrollPositionRef.current = window.scrollY;
    }
  }, [pathname, preserveScroll]);

  // Enhanced route transition variants based on direction
  const getRouteVariants = () => {
    const baseTransition = {
      duration: getDuration(400) / 1000,
      ease: getEasing("smooth"),
    };

    switch (direction) {
      case "backward":
        return {
          initial: {
            opacity: 0,
            x: -30,
            scale: 0.98,
            filter: "blur(6px)",
          },
          animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
          },
          exit: {
            opacity: 0,
            x: 30,
            scale: 1.02,
            filter: "blur(6px)",
          },
        };
      case "forward":
        return {
          initial: {
            opacity: 0,
            x: 30,
            scale: 0.98,
            filter: "blur(6px)",
          },
          animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)",
          },
          exit: {
            opacity: 0,
            x: -30,
            scale: 1.02,
            filter: "blur(6px)",
          },
        };
      case "none":
      default:
        return {
          initial: {
            opacity: 0,
            y: 20,
            filter: "blur(4px)",
          },
          animate: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          },
          exit: {
            opacity: 0,
            y: -20,
            filter: "blur(4px)",
          },
        };
    }
  };

  const variants = getRouteVariants();

  const handleAnimationStart = React.useCallback(() => {
    setIsTransitioning(true);
    onRouteChangeStart?.(pathname);

    // Announce route change to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Navigating to ${pathname}`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      if (announcement && announcement.parentNode === document.body) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, [pathname, onRouteChangeStart]);

  const handleAnimationComplete = React.useCallback(() => {
    setIsTransitioning(false);
    onRouteChangeComplete?.(pathname);

    // Enhanced focus management
    const timer = setTimeout(() => {
      // Try to focus the main heading first, then main element
      const h1Element = document.querySelector("h1");
      const mainElement = document.querySelector("main");
      const skipLink = document.querySelector('[href="#main-content"]');

      let focusTarget = h1Element || mainElement;

      // If we have a skip link, focus that instead for better accessibility
      if (skipLink && skipLink instanceof HTMLElement) {
        focusTarget = skipLink;
      }

      if (focusTarget && focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });

        // Restore scroll position if preserveScroll is enabled
        if (preserveScroll && scrollPositionRef.current > 0) {
          window.scrollTo({
            top: scrollPositionRef.current,
            behavior: "smooth",
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, onRouteChangeComplete, preserveScroll]);

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      <motion.div
        key={pathname}
        className={className}
        initial={shouldAnimate ? variants.initial : undefined}
        animate={shouldAnimate ? variants.animate : undefined}
        exit={shouldAnimate ? variants.exit : undefined}
        transition={{
          duration: getDuration(400) / 1000,
          ease: getEasing("smooth"),
        }}
        onAnimationStart={handleAnimationStart}
        // Accessibility attributes
        aria-busy={isTransitioning}
        aria-live="polite"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced navigation transition hook for programmatic transitions with Motion.dev
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [transitionDirection, setTransitionDirection] = React.useState<
    "forward" | "backward"
  >("forward");
  const [transitionProgress, setTransitionProgress] = React.useState(0);
  const [loadingState, setLoadingState] = React.useState<
    "idle" | "loading" | "complete"
  >("idle");
  const { getDuration } = useMotionSettings();

  const startTransition = React.useCallback(
    (
      direction: "forward" | "backward" = "forward",
      options?: {
        duration?: number;
        showLoading?: boolean;
        onProgress?: (progress: number) => void;
      },
    ) => {
      const { duration = 600, showLoading = false, onProgress } = options || {};

      setIsTransitioning(true);
      setTransitionDirection(direction);
      setTransitionProgress(0);

      if (showLoading) {
        setLoadingState("loading");
      }

      // Simulate transition progress
      const adjustedDuration = getDuration(duration);
      const progressInterval = adjustedDuration / 100;
      let currentProgress = 0;

      const progressTimer = setInterval(() => {
        currentProgress += 1;
        setTransitionProgress(currentProgress);
        onProgress?.(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(progressTimer);
          setLoadingState("complete");
        }
      }, progressInterval);

      return () => clearInterval(progressTimer);
    },
    [getDuration],
  );

  const endTransition = React.useCallback(() => {
    setIsTransitioning(false);
    setTransitionProgress(100);
    setLoadingState("idle");
  }, []);

  const resetTransition = React.useCallback(() => {
    setIsTransitioning(false);
    setTransitionDirection("forward");
    setTransitionProgress(0);
    setLoadingState("idle");
  }, []);

  // Auto-end transition after a delay
  React.useEffect(() => {
    if (isTransitioning && loadingState !== "loading") {
      const timer = setTimeout(() => {
        endTransition();
      }, getDuration(600));
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, loadingState, endTransition, getDuration]);

  // Navigation helpers
  const navigateWithTransition = React.useCallback(
    (
      url: string,
      direction: "forward" | "backward" = "forward",
      options?: { replace?: boolean; scroll?: boolean },
    ) => {
      const cleanup = startTransition(direction, { showLoading: true });

      // Simulate navigation delay for smooth transition
      setTimeout(() => {
        if (options?.replace) {
          window.history.replaceState(null, "", url);
        } else {
          window.history.pushState(null, "", url);
        }

        // Dispatch custom navigation event
        window.dispatchEvent(
          new CustomEvent("pageTransition", {
            detail: { url, direction, options },
          }),
        );

        cleanup?.();
      }, getDuration(300));
    },
    [startTransition, getDuration],
  );

  return {
    isTransitioning,
    transitionDirection,
    transitionProgress,
    loadingState,
    startTransition,
    endTransition,
    resetTransition,
    navigateWithTransition,
    // Computed states
    isComplete: transitionProgress >= 100,
    isLoading: loadingState === "loading",
  };
}

// Enhanced focus management utility for accessibility during transitions
export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = React.useState<HTMLElement[]>([]);
  const [isManagingFocus, setIsManagingFocus] = React.useState(false);

  const focusMainContent = React.useCallback(
    (options?: {
      preventScroll?: boolean;
      announceChange?: boolean;
      customTarget?: string;
    }) => {
      const {
        preventScroll = true,
        announceChange = true,
        customTarget,
      } = options || {};

      // Priority order for focus targets
      const selectors = customTarget
        ? [customTarget]
        : [
            '[data-focus-target="main"]',
            "h1",
            "main",
            '[role="main"]',
            "#main-content",
            ".main-content",
          ];

      let focusTarget: HTMLElement | null = null;

      for (const selector of selectors) {
        focusTarget = document.querySelector(selector) as HTMLElement;
        if (focusTarget) break;
      }

      if (focusTarget) {
        // Make element focusable if it isn't already
        if (focusTarget.tabIndex < 0 && !focusTarget.hasAttribute("tabindex")) {
          focusTarget.tabIndex = -1;
        }

        focusTarget.focus({ preventScroll });

        // Announce page change to screen readers
        if (announceChange) {
          const announcement = document.createElement("div");
          announcement.setAttribute("aria-live", "polite");
          announcement.setAttribute("aria-atomic", "true");
          announcement.className =
            "sr-only absolute -left-[10000px] w-1 h-1 overflow-hidden";
          announcement.textContent = `Page content updated. Now viewing: ${
            focusTarget.textContent?.trim().substring(0, 100) || "main content"
          }`;

          document.body.appendChild(announcement);

          setTimeout(() => {
            if (announcement && announcement.parentNode === document.body) {
              document.body.removeChild(announcement);
            }
          }, 1500);
        }

        return true;
      }

      return false;
    },
    [],
  );

  const preserveFocus = React.useCallback(() => {
    // Store current focus before transition
    const activeElement = document.activeElement as HTMLElement;

    if (activeElement && activeElement !== document.body) {
      setFocusHistory((prev) => [...prev.slice(-4), activeElement]); // Keep last 5 elements
    }

    return () => {
      // Restore focus after transition
      if (activeElement && activeElement instanceof HTMLElement) {
        // Check if element is still in DOM and focusable
        if (
          document.contains(activeElement) &&
          !activeElement.hasAttribute("disabled")
        ) {
          activeElement.focus({ preventScroll: true });
          return true;
        }
      }
      return false;
    };
  }, []);

  const restoreLastFocus = React.useCallback(() => {
    const lastFocusedElement = focusHistory[focusHistory.length - 1];

    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus({ preventScroll: true });
      return true;
    }

    return false;
  }, [focusHistory]);

  const manageFocusDuringTransition = React.useCallback(
    (transitionCallback: () => Promise<void> | void) => {
      setIsManagingFocus(true);
      const restoreFocus = preserveFocus();

      const handleTransition = async () => {
        try {
          await transitionCallback();

          // Try to restore focus, fallback to main content
          const restored = restoreFocus();
          if (!restored) {
            focusMainContent();
          }
        } finally {
          setIsManagingFocus(false);
        }
      };

      return handleTransition();
    },
    [preserveFocus, focusMainContent],
  );

  // Focus trap for modal-like transitions
  const createFocusTrap = React.useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Skip link functionality
  const createSkipLink = React.useCallback(
    (targetSelector: string = "main") => {
      const skipLink = document.createElement("a");
      skipLink.href = `#${targetSelector}`;
      skipLink.textContent = "Skip to main content";
      skipLink.className =
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:border focus:border-black";

      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        focusMainContent({ customTarget: `#${targetSelector}` });
      });

      // Insert at beginning of body
      document.body.insertBefore(skipLink, document.body.firstChild);

      return () => {
        if (skipLink && skipLink.parentNode === document.body) {
          document.body.removeChild(skipLink);
        }
      };
    },
    [focusMainContent],
  );

  return {
    focusMainContent,
    preserveFocus,
    restoreLastFocus,
    manageFocusDuringTransition,
    createFocusTrap,
    createSkipLink,
    isManagingFocus,
    focusHistory: focusHistory.slice(-3), // Return last 3 for debugging
  };
}

// Progress indicator component for loading states
interface TransitionProgressProps {
  progress: number;
  isVisible: boolean;
  className?: string;
  color?: string;
}

export function TransitionProgress({
  progress,
  isVisible,
  className = "",
  color = "bg-blue-500",
}: TransitionProgressProps) {
  const { shouldAnimate } = useMotionSettings();

  if (!shouldAnimate) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-200 ${className}`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Page transition progress"
        >
          <motion.div
            className={`h-full ${color} origin-left`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
