"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useKeyboardNavigation, useAriaAnnouncements } from "./accessibility";

interface FocusManagerProps {
  children: React.ReactNode;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
  className?: string;
}

/**
 * Focus management component for accessible animations and modals
 */
export function FocusManager({
  children,
  restoreFocus = true,
  trapFocus = false,
  autoFocus = false,
  onEscape,
  className = "",
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const {
    trapFocus: trapFocusUtil,
    releaseFocusTrap,
    getFocusableElements,
  } = useKeyboardNavigation();
  const { announce } = useAriaAnnouncements();

  // Store previous focus when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Handle focus trapping
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const cleanup = trapFocusUtil(containerRef.current);

      if (autoFocus) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
          announce("Focus moved to interactive content");
        }
      }

      return cleanup;
    }
  }, [trapFocus, autoFocus, trapFocusUtil, getFocusableElements, announce]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
      }
    };

    if (trapFocus) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [trapFocus, onEscape]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (
            previousFocusRef.current &&
            document.contains(previousFocusRef.current)
          ) {
            previousFocusRef.current.focus();
            announce("Focus restored to previous element");
          }
        }, 10);
      }

      if (trapFocus) {
        releaseFocusTrap();
      }
    };
  }, [restoreFocus, trapFocus, releaseFocusTrap, announce]);

  return (
    <div
      ref={containerRef}
      className={`focus-manager ${className}`}
      role={trapFocus ? "dialog" : undefined}
      aria-modal={trapFocus ? "true" : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Hook for managing focus during animations
 */
export function useAnimationFocus() {
  const focusBeforeAnimationRef = useRef<HTMLElement | null>(null);
  const { announce } = useAriaAnnouncements();

  const preserveFocusForAnimation = useCallback(() => {
    focusBeforeAnimationRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocusAfterAnimation = useCallback(() => {
    if (
      focusBeforeAnimationRef.current &&
      document.contains(focusBeforeAnimationRef.current)
    ) {
      focusBeforeAnimationRef.current.focus();
      announce("Animation complete, focus restored");
    }
  }, [announce]);

  const announceFocusChange = useCallback(
    (message: string) => {
      announce(message);
    },
    [announce],
  );

  return {
    preserveFocusForAnimation,
    restoreFocusAfterAnimation,
    announceFocusChange,
  };
}

/**
 * Component for managing focus during route transitions
 */
export function RouteTransitionFocus({
  children,
  announcePageChange = true,
}: {
  children: React.ReactNode;
  announcePageChange?: boolean;
}) {
  const { announce } = useAriaAnnouncements();
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (
      announcePageChange &&
      previousPathRef.current &&
      previousPathRef.current !== currentPath
    ) {
      // Announce page change
      const pageTitle = document.title || "New page";
      announce(`Navigated to ${pageTitle}`);

      // Focus main content area
      const mainContent = document.querySelector(
        'main, [role="main"], #main-content',
      );
      if (mainContent) {
        (mainContent as HTMLElement).focus();
      }
    }

    previousPathRef.current = currentPath;
  }, [announcePageChange, announce]);

  return <>{children}</>;
}

/**
 * Hook for creating accessible focus indicators
 */
export function useFocusIndicator() {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isKeyboardFocus, setIsKeyboardFocus] = React.useState(false);
  const { isKeyboardUser } = useKeyboardNavigation();

  const focusProps = {
    onFocus: (event: React.FocusEvent) => {
      setIsFocused(true);
      setIsKeyboardFocus(isKeyboardUser);
    },
    onBlur: () => {
      setIsFocused(false);
      setIsKeyboardFocus(false);
    },
    className:
      `${isFocused ? "focused" : ""} ${isKeyboardFocus ? "keyboard-focused" : ""}`.trim(),
  };

  return {
    isFocused,
    isKeyboardFocus,
    focusProps,
  };
}

/**
 * Component for creating accessible focus boundaries
 */
export function FocusBoundary({
  children,
  label,
  onEnter,
  onExit,
}: {
  children: React.ReactNode;
  label?: string;
  onEnter?: () => void;
  onExit?: () => void;
}) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const { announce } = useAriaAnnouncements();

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (boundary.contains(event.target as Node)) {
        onEnter?.();
        if (label) {
          announce(`Entered ${label}`);
        }
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (
        boundary.contains(event.target as Node) &&
        !boundary.contains(event.relatedTarget as Node)
      ) {
        onExit?.();
        if (label) {
          announce(`Exited ${label}`);
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [label, onEnter, onExit, announce]);

  return (
    <div
      ref={boundaryRef}
      className="focus-boundary"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
