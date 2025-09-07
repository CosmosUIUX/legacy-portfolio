"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useReducedMotion,
  useKeyboardNavigation,
  useAriaAnnouncements,
  useAlternativeInteractions,
  getAriaProps,
  getScreenReaderSafeProps,
  createAccessibilityInstructions,
} from "./accessibility";

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  elementType?:
    | "button"
    | "link"
    | "card"
    | "modal"
    | "menu"
    | "form"
    | "navigation"
    | "banner"
    | "main"
    | "complementary";
  animationState?:
    | "idle"
    | "animating"
    | "complete"
    | "error"
    | "loading"
    | "disabled";
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onAnimationError?: (error: Error) => void;
  onEscape?: () => void;
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void;
  ariaLabel?: string;
  ariaDescription?: string;
  ariaInstructions?: string;
  announcement?: string;
  enableAlternativeInteractions?: boolean;
  enableFocusTrap?: boolean;
  interactions?: string[];
  customInstructions?: string;
  className?: string;
  id?: string;
  [key: string]: any;
}

/**
 * Accessibility wrapper component that ensures animations are accessible
 */
export function AccessibilityWrapper({
  children,
  elementType = "card",
  animationState = "idle",
  onAnimationStart,
  onAnimationComplete,
  onAnimationError,
  onEscape,
  onNavigate,
  ariaLabel,
  ariaDescription,
  ariaInstructions,
  announcement,
  enableAlternativeInteractions = true,
  enableFocusTrap = false,
  interactions = [],
  customInstructions,
  className = "",
  id,
  ...props
}: AccessibilityWrapperProps) {
  const reducedMotion = useReducedMotion();
  const {
    isKeyboardUser,
    preserveFocus,
    trapFocus,
    releaseFocusTrap,
    restoreFocus,
  } = useKeyboardNavigation();
  const { announce } = useAriaAnnouncements();
  const { triggerAlternativeAction } = useAlternativeInteractions();

  const elementRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [instructionElements, setInstructionElements] = useState<HTMLElement[]>(
    [],
  );
  const elementId =
    id || `accessible-element-${Math.random().toString(36).substr(2, 9)}`;

  // Create accessibility instruction elements
  useEffect(() => {
    if (elementId && elementType && typeof document !== "undefined") {
      try {
        const elements = createAccessibilityInstructions(
          elementId,
          elementType,
          interactions,
          customInstructions,
        );

        // Add elements to DOM
        elements.forEach((element) => {
          document.body.appendChild(element);
        });

        setInstructionElements(elements);

        return () => {
          // Cleanup instruction elements
          elements.forEach((element) => {
            if (document.body.contains(element)) {
              document.body.removeChild(element);
            }
          });
        };
      } catch (error) {
        // Gracefully handle errors in test environment
        console.warn("Failed to create accessibility instructions:", error);
      }
    }
  }, [elementId, elementType, interactions, customInstructions]);

  // Handle focus trapping for modals
  useEffect(() => {
    if (
      enableFocusTrap &&
      elementRef.current &&
      animationState === "complete"
    ) {
      const cleanup = trapFocus(elementRef.current);
      return cleanup;
    } else if (!enableFocusTrap || animationState !== "complete") {
      releaseFocusTrap();
    }
  }, [enableFocusTrap, animationState, trapFocus, releaseFocusTrap]);

  // Handle animation lifecycle with accessibility considerations
  useEffect(() => {
    if (animationState === "animating") {
      onAnimationStart?.();

      // Announce animation start for screen readers
      if (announcement) {
        announce(announcement);
      }

      // Preserve focus during animation
      if (isKeyboardUser) {
        preserveFocus();
      }

      // Trigger alternative feedback for animation start
      if (enableAlternativeInteractions && elementRef.current) {
        triggerAlternativeAction("activate", elementRef.current, {
          textFeedback: announcement || "Animation started",
        });
      }
    } else if (animationState === "complete") {
      onAnimationComplete?.();

      // Announce completion
      if (announcement) {
        announce(`${announcement} complete`);
      }

      // Trigger alternative feedback
      if (enableAlternativeInteractions && elementRef.current) {
        triggerAlternativeAction("complete", elementRef.current, {
          textFeedback: `${announcement || "Animation"} complete`,
        });
      }
    } else if (animationState === "error") {
      setHasError(true);
      onAnimationError?.(new Error("Animation error"));

      // Announce error
      announce("Animation error occurred", "assertive");

      // Trigger error feedback
      if (enableAlternativeInteractions && elementRef.current) {
        triggerAlternativeAction("error", elementRef.current, {
          textFeedback: "Animation error occurred",
        });
      }
    } else if (animationState === "loading") {
      // Announce loading state
      announce(`${announcement || "Content"} is loading`, "polite");
    }
  }, [
    animationState,
    announcement,
    isKeyboardUser,
    preserveFocus,
    announce,
    triggerAlternativeAction,
    enableAlternativeInteractions,
    onAnimationStart,
    onAnimationComplete,
    onAnimationError,
  ]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyboardEvents = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.type === "animation-escape") {
        onEscape?.();

        // Default escape behavior for modals
        if (elementType === "modal" && !onEscape) {
          releaseFocusTrap();
          restoreFocus();
        }
      } else if (customEvent.type === "animation-navigate") {
        const direction = customEvent.detail.direction as
          | "up"
          | "down"
          | "left"
          | "right";
        onNavigate?.(direction);
      }
    };

    if (elementRef.current) {
      elementRef.current.addEventListener(
        "animation-escape",
        handleKeyboardEvents,
      );
      elementRef.current.addEventListener(
        "animation-navigate",
        handleKeyboardEvents,
      );

      return () => {
        if (elementRef.current) {
          elementRef.current.removeEventListener(
            "animation-escape",
            handleKeyboardEvents,
          );
          elementRef.current.removeEventListener(
            "animation-navigate",
            handleKeyboardEvents,
          );
        }
      };
    }
  }, [onEscape, onNavigate, elementType, releaseFocusTrap, restoreFocus]);

  // Get appropriate ARIA properties
  const ariaProps = getAriaProps(elementType, animationState, {
    label: ariaLabel,
    description: ariaDescription,
    announcement,
    instructions: ariaInstructions,
  });

  // Get screen reader safe properties
  const screenReaderProps = getScreenReaderSafeProps(
    animationState === "animating",
    ariaLabel,
  );

  // Combine all accessibility properties
  const accessibilityProps = {
    ...ariaProps,
    ...screenReaderProps,
    id: elementId,
    ref: elementRef,
    className:
      `${className} ${isKeyboardUser ? "keyboard-user" : ""} ${hasError ? "animation-error" : ""} ${reducedMotion ? "reduced-motion" : ""}`.trim(),
    onKeyDown: (event: React.KeyboardEvent) => {
      // Handle keyboard interactions
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (enableAlternativeInteractions && elementRef.current) {
          triggerAlternativeAction("activate", elementRef.current, {
            textFeedback: ariaLabel
              ? `Activated ${ariaLabel}`
              : "Element activated",
          });
        }
      }

      // Call original onKeyDown if provided
      props.onKeyDown?.(event);
    },
    onFocus: (event: React.FocusEvent) => {
      // Announce focus for screen readers
      if (ariaLabel) {
        announce(`Focused on ${ariaLabel}`);
      }

      // Trigger focus feedback
      if (enableAlternativeInteractions && elementRef.current) {
        triggerAlternativeAction("focus", elementRef.current, {
          intensity: "low",
          textFeedback: ariaLabel
            ? `Focused on ${ariaLabel}`
            : "Element focused",
        });
      }

      // Call original onFocus if provided
      props.onFocus?.(event);
    },
    onBlur: (event: React.FocusEvent) => {
      // Call original onBlur if provided
      props.onBlur?.(event);
    },
    onMouseEnter: (event: React.MouseEvent) => {
      // Trigger hover feedback for non-keyboard users
      if (
        !isKeyboardUser &&
        enableAlternativeInteractions &&
        elementRef.current
      ) {
        triggerAlternativeAction("hover", elementRef.current, {
          intensity: "low",
          audioFeedback: false, // Don't play audio for mouse hover
          hapticFeedback: false,
        });
      }

      // Call original onMouseEnter if provided
      props.onMouseEnter?.(event);
    },
    ...props,
  };

  // If reduced motion is enabled, add appropriate classes
  if (reducedMotion) {
    accessibilityProps.className += " reduced-motion";
  }

  // Create the appropriate element based on elementType
  const Element =
    elementType === "button"
      ? "button"
      : elementType === "link"
        ? "a"
        : elementType === "modal"
          ? "div"
          : elementType === "menu"
            ? "nav"
            : "div";

  return (
    <Element {...accessibilityProps}>
      {children}
      {/* Hidden description for screen readers */}
      {ariaDescription && (
        <div
          id={`${elementType}-description`}
          className="sr-only"
          aria-hidden="true"
        >
          {ariaDescription}
        </div>
      )}
      {/* Hidden instructions for screen readers */}
      {ariaInstructions && (
        <div
          id={`${elementType}-instructions`}
          className="sr-only"
          aria-hidden="true"
        >
          {ariaInstructions}
        </div>
      )}
      {/* Keyboard instructions for modals */}
      {elementType === "modal" && (
        <div
          id="modal-keyboard-instructions"
          className="sr-only"
          aria-hidden="true"
        >
          Press Escape to close this modal. Tab to navigate between elements.
        </div>
      )}
    </Element>
  );
}

/**
 * Higher-order component to wrap any component with accessibility features
 */
export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultProps?: Partial<AccessibilityWrapperProps>,
) {
  return function AccessibleComponent(
    props: P & Partial<AccessibilityWrapperProps>,
  ) {
    const {
      elementType,
      animationState,
      onAnimationStart,
      onAnimationComplete,
      onAnimationError,
      ariaLabel,
      ariaDescription,
      announcement,
      enableAlternativeInteractions,
      ...componentProps
    } = props;

    return (
      <AccessibilityWrapper
        elementType={elementType || defaultProps?.elementType}
        animationState={animationState || defaultProps?.animationState}
        onAnimationStart={onAnimationStart || defaultProps?.onAnimationStart}
        onAnimationComplete={
          onAnimationComplete || defaultProps?.onAnimationComplete
        }
        onAnimationError={onAnimationError || defaultProps?.onAnimationError}
        ariaLabel={ariaLabel || defaultProps?.ariaLabel}
        ariaDescription={ariaDescription || defaultProps?.ariaDescription}
        announcement={announcement || defaultProps?.announcement}
        enableAlternativeInteractions={
          enableAlternativeInteractions ??
          defaultProps?.enableAlternativeInteractions
        }
      >
        <WrappedComponent {...(componentProps as P)} />
      </AccessibilityWrapper>
    );
  };
}
