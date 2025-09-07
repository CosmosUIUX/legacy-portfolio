"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "@/lib/motion";
import {
  RouteTransition,
  useFocusManagement,
  usePageTransition,
  TransitionProgress,
} from "./page-transition";
import { useMotionSettings } from "@/lib/motion/provider";

interface TransitionLayoutProps {
  children: React.ReactNode;
  enableProgressBar?: boolean;
  preserveScroll?: boolean;
}

export function TransitionLayout({
  children,
  enableProgressBar = true,
  preserveScroll = false,
}: TransitionLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { shouldAnimate } = useMotionSettings();
  const { focusMainContent, createSkipLink } = useFocusManagement();
  const {
    isTransitioning,
    transitionProgress,
    transitionDirection,
    isLoading,
  } = usePageTransition();

  // Determine transition direction based on navigation
  const getTransitionDirection = React.useCallback(
    (newPath: string, oldPath: string) => {
      // Simple heuristic: if going to a "deeper" path, it's forward
      const newDepth = newPath.split("/").length;
      const oldDepth = oldPath.split("/").length;

      if (newDepth > oldDepth) return "forward";
      if (newDepth < oldDepth) return "backward";

      // Same depth, check if it's a known navigation pattern
      if (newPath.includes("/about") && oldPath === "/") return "forward";
      if (newPath === "/" && oldPath.includes("/")) return "backward";

      return "none";
    },
    [],
  );

  const [previousPathname, setPreviousPathname] = React.useState(pathname);
  const [currentDirection, setCurrentDirection] = React.useState<
    "forward" | "backward" | "none"
  >("none");

  // Track pathname changes and determine direction
  React.useEffect(() => {
    if (pathname !== previousPathname) {
      const direction = getTransitionDirection(pathname, previousPathname);
      setCurrentDirection(direction);
      setPreviousPathname(pathname);
    }
  }, [pathname, previousPathname, getTransitionDirection]);

  // Handle focus management after route transitions
  React.useEffect(() => {
    if (!isTransitioning) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        focusMainContent({
          announceChange: true,
          preventScroll: preserveScroll,
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [pathname, focusMainContent, isTransitioning, preserveScroll]);

  // Create skip link for accessibility
  React.useEffect(() => {
    if (shouldAnimate) {
      const cleanup = createSkipLink("main-content");
      return cleanup;
    }
  }, [createSkipLink, shouldAnimate]);

  // Handle route change events
  const handleRouteChangeStart = React.useCallback((newPathname: string) => {
    // Announce navigation start to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Navigating to ${newPathname}`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  const handleRouteChangeComplete = React.useCallback((newPathname: string) => {
    // Update document title if needed
    const pageTitle = document.title;
    if (pageTitle) {
      // Announce page title change
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Page loaded: ${pageTitle}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1500);
    }
  }, []);

  return (
    <>
      {/* Progress bar for route transitions */}
      {enableProgressBar && (
        <TransitionProgress
          progress={transitionProgress}
          isVisible={isLoading}
          className="z-50"
          color="bg-gradient-to-r from-blue-500 to-purple-500"
        />
      )}

      {/* Main route transition wrapper */}
      <RouteTransition
        pathname={pathname}
        direction={currentDirection}
        className="min-h-screen"
        preserveScroll={preserveScroll}
        onRouteChangeStart={handleRouteChangeStart}
        onRouteChangeComplete={handleRouteChangeComplete}
      >
        <div id="main-content" data-focus-target="main">
          {children}
        </div>
      </RouteTransition>
    </>
  );
}

// Enhanced navigation link with Motion.dev transition support
interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  prefetch?: boolean;
  direction?: "forward" | "backward" | "auto";
  replace?: boolean;
  scroll?: boolean;
  showProgress?: boolean;
}

export function TransitionLink({
  href,
  children,
  className = "",
  onClick,
  prefetch = true,
  direction = "auto",
  replace = false,
  scroll = true,
  showProgress = false,
}: TransitionLinkProps) {
  const { navigateWithTransition } = usePageTransition();
  const { shouldAnimate } = useMotionSettings();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Call custom onClick if provided
    onClick?.();

    if (shouldAnimate) {
      // Use enhanced navigation with transition
      navigateWithTransition(
        href,
        direction === "auto" ? "forward" : direction,
        {
          replace,
          scroll,
        },
      );
    } else {
      // Fallback to standard navigation
      if (replace) {
        window.location.replace(href);
      } else {
        window.location.href = href;
      }
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <motion.a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      // Enhanced hover and press animations
      animate={{
        scale: isPressed ? 0.98 : isHovered ? 1.02 : 1,
        opacity: isPressed ? 0.9 : 1,
      }}
      transition={{
        duration: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      // Add prefetch hint for better performance
      {...(prefetch && { rel: "prefetch" })}
      // Accessibility attributes
      aria-label={`Navigate to ${href}`}
    >
      {children}
    </motion.a>
  );
}

// Page transition provider for managing global transition state
interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const [globalTransitionState, setGlobalTransitionState] = React.useState({
    isTransitioning: false,
    currentRoute: "",
    previousRoute: "",
    direction: "forward" as "forward" | "backward",
  });

  // Listen for custom page transition events
  React.useEffect(() => {
    const handlePageTransition = (event: CustomEvent) => {
      const { url, direction } = event.detail;
      setGlobalTransitionState((prev) => ({
        ...prev,
        isTransitioning: true,
        previousRoute: prev.currentRoute,
        currentRoute: url,
        direction,
      }));
    };

    const handleTransitionComplete = () => {
      setGlobalTransitionState((prev) => ({
        ...prev,
        isTransitioning: false,
      }));
    };

    window.addEventListener(
      "pageTransition",
      handlePageTransition as EventListener,
    );
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      window.removeEventListener(
        "pageTransition",
        handlePageTransition as EventListener,
      );
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete,
      );
    };
  }, []);

  // Provide transition state to children via context if needed
  const contextValue = React.useMemo(
    () => ({
      ...globalTransitionState,
      setTransitionState: setGlobalTransitionState,
    }),
    [globalTransitionState],
  );

  return (
    <PageTransitionContext.Provider value={contextValue}>
      {children}
    </PageTransitionContext.Provider>
  );
}

// Context for sharing transition state
const PageTransitionContext = React.createContext<{
  isTransitioning: boolean;
  currentRoute: string;
  previousRoute: string;
  direction: "forward" | "backward";
  setTransitionState: React.Dispatch<React.SetStateAction<any>>;
} | null>(null);

// Hook to use page transition context
export function usePageTransitionContext() {
  const context = React.useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransitionContext must be used within PageTransitionProvider",
    );
  }
  return context;
}
