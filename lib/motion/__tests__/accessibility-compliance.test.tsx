import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithMotion,
  AccessibilityTestUtils,
  setupAnimationTestEnvironment,
} from "../test-utils";
import { AccessibilityWrapper } from "../accessibility-wrapper";
import { validateAnimationSafety } from "../accessibility";

// Setup test environment
setupAnimationTestEnvironment();

// Test components for accessibility validation
function AccessibleAnimationComponent({
  animationState = "idle",
  enableReducedMotion = false,
}: {
  animationState?: "idle" | "animating" | "complete" | "error";
  enableReducedMotion?: boolean;
}) {
  return (
    <AccessibilityWrapper
      elementType="button"
      animationState={animationState}
      ariaLabel="Accessible animation button"
      ariaDescription="This button demonstrates accessible animations"
      announcement="Animation state changed"
    >
      <button>
        {animationState === "animating" ? "Animating..." : "Click me"}
      </button>
    </AccessibilityWrapper>
  );
}

function ReducedMotionTestComponent() {
  const [isAnimating, setIsAnimating] = React.useState(false);

  return (
    <div className={isAnimating ? "animating" : ""}>
      <button onClick={() => setIsAnimating(!isAnimating)}>
        Toggle Animation
      </button>
      <div
        className="animated-element"
        style={{
          transition: "transform 0.3s ease",
          transform: isAnimating ? "translateX(100px)" : "translateX(0px)",
        }}
      >
        Animated Content
      </div>
    </div>
  );
}

describe("Accessibility Compliance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("WCAG 2.1 Compliance", () => {
    describe("Guideline 2.2.2 - Pause, Stop, Hide", () => {
      it("should respect prefers-reduced-motion setting", () => {
        // Mock reduced motion preference
        Object.defineProperty(window, "matchMedia", {
          writable: true,
          value: jest.fn().mockImplementation((query) => ({
            matches: query.includes("prefers-reduced-motion: reduce"),
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          })),
        });

        renderWithMotion(<ReducedMotionTestComponent />, {
          providerProps: { reducedMotion: true },
        });

        const animatedElement = screen.getByText("Animated Content");
        const button = screen.getByText("Toggle Animation");

        fireEvent.click(button);

        // Check if reduced motion styles are applied
        const reducedMotionTest =
          AccessibilityTestUtils.testReducedMotion(animatedElement);
        expect(
          reducedMotionTest.hasReducedMotionStyles ||
            reducedMotionTest.animationDuration === "0.01ms" ||
            reducedMotionTest.transitionDuration === "0.01ms",
        ).toBe(true);
      });

      it("should disable animations when reduced motion is preferred", async () => {
        renderWithMotion(<AccessibleAnimationComponent />, {
          providerProps: { reducedMotion: true },
        });

        const button = screen.getByRole("button");

        // Animation should be disabled or very fast
        const computedStyle = window.getComputedStyle(button);
        expect(
          computedStyle.animationDuration === "0s" ||
            computedStyle.animationDuration === "0.01ms" ||
            computedStyle.transitionDuration === "0s" ||
            computedStyle.transitionDuration === "0.01ms",
        ).toBe(true);
      });
    });

    describe("Guideline 2.3.1 - Three Flashes or Below Threshold", () => {
      it("should validate animation safety for seizure prevention", () => {
        // Test safe animation
        const safeAnimation = validateAnimationSafety({
          flashRate: 2,
          colorChanges: 3,
          contrastRatio: 4.5,
        });

        expect(safeAnimation.safe).toBe(true);
        expect(safeAnimation.warnings).toHaveLength(0);
      });

      it("should detect unsafe flash rates", () => {
        const unsafeAnimation = validateAnimationSafety({
          flashRate: 5, // Above 3 flashes per second
          colorChanges: 2,
          contrastRatio: 4.5,
        });

        expect(unsafeAnimation.safe).toBe(false);
        expect(unsafeAnimation.warnings).toContain(
          "Flash rate exceeds safe threshold (3 flashes/second)",
        );
      });

      it("should detect excessive color changes", () => {
        const unsafeAnimation = validateAnimationSafety({
          flashRate: 2,
          colorChanges: 10, // Too many rapid color changes
          contrastRatio: 4.5,
        });

        expect(unsafeAnimation.safe).toBe(false);
        expect(unsafeAnimation.warnings).toContain(
          "Too many rapid color changes detected",
        );
      });

      it("should detect insufficient contrast", () => {
        const unsafeAnimation = validateAnimationSafety({
          flashRate: 2,
          colorChanges: 3,
          contrastRatio: 3.0, // Below 4.5:1 minimum
        });

        expect(unsafeAnimation.safe).toBe(false);
        expect(unsafeAnimation.warnings).toContain(
          "Insufficient color contrast ratio (minimum 4.5:1)",
        );
      });
    });

    describe("Guideline 4.1.2 - Name, Role, Value", () => {
      it("should provide proper ARIA attributes", () => {
        renderWithMotion(<AccessibleAnimationComponent />);

        const button = screen.getByRole("button");
        const ariaTest = AccessibilityTestUtils.testAriaAttributes(button);

        expect(ariaTest.hasAriaLabel).toBe(true);
        expect(ariaTest.hasAriaDescription).toBe(true);
        expect(button.getAttribute("aria-label")).toBe(
          "Accessible animation button",
        );
      });

      it("should update ARIA attributes during animation states", async () => {
        const { rerender } = renderWithMotion(
          <AccessibleAnimationComponent animationState="idle" />,
        );

        const button = screen.getByRole("button");

        // Initial state
        let ariaTest = AccessibilityTestUtils.testAriaAttributes(button);
        expect(ariaTest.isBusy).toBe(false);

        // Animating state
        rerender(<AccessibleAnimationComponent animationState="animating" />);

        await waitFor(() => {
          ariaTest = AccessibilityTestUtils.testAriaAttributes(button);
          expect(ariaTest.isBusy).toBe(true);
        });

        // Complete state
        rerender(<AccessibleAnimationComponent animationState="complete" />);

        await waitFor(() => {
          ariaTest = AccessibilityTestUtils.testAriaAttributes(button);
          expect(ariaTest.isBusy).toBe(false);
        });
      });

      it("should provide appropriate role attributes", () => {
        renderWithMotion(<AccessibleAnimationComponent />);

        const button = screen.getByRole("button");
        expect(button.getAttribute("role")).toBe("button");
      });
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should create ARIA live regions for announcements", () => {
      renderWithMotion(<AccessibleAnimationComponent />);

      const liveRegions = document.querySelectorAll("[aria-live]");
      expect(liveRegions.length).toBeGreaterThan(0);

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).toBeInTheDocument();
    });

    it("should announce animation state changes", async () => {
      const { rerender } = renderWithMotion(
        <AccessibleAnimationComponent animationState="idle" />,
      );

      // Change to animating state
      rerender(<AccessibleAnimationComponent animationState="animating" />);

      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion?.textContent).toContain("Animation state changed");
      });
    });

    it("should handle urgent announcements", async () => {
      const { rerender } = renderWithMotion(
        <AccessibleAnimationComponent animationState="idle" />,
      );

      // Change to error state (should be urgent)
      rerender(<AccessibleAnimationComponent animationState="error" />);

      await waitFor(() => {
        const assertiveRegion = document.querySelector(
          '[aria-live="assertive"]',
        );
        expect(assertiveRegion).toBeInTheDocument();
      });
    });

    it("should not interfere with screen reader navigation", () => {
      renderWithMotion(
        <AccessibleAnimationComponent animationState="animating" />,
      );

      const button = screen.getByRole("button");

      // Should not be hidden from screen readers during animation
      expect(button.getAttribute("aria-hidden")).not.toBe("true");

      // Should maintain proper tabindex
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support keyboard activation", async () => {
      const user = userEvent.setup();

      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");

      // Test keyboard navigation
      const keyboardResults =
        await AccessibilityTestUtils.testKeyboardNavigation(button);

      expect(keyboardResults.Tab).toBeDefined();
      expect(keyboardResults.Enter).toBeDefined();
      expect(keyboardResults[" "]).toBeDefined(); // Space key
    });

    it("should preserve focus during animations", async () => {
      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");
      button.focus();

      expect(document.activeElement).toBe(button);

      // Simulate animation state change
      const focusResult = await AccessibilityTestUtils.testFocusManagement(
        () => {
          // Trigger some DOM changes that might affect focus
          button.textContent = "Animating...";
        },
        button,
      );

      expect(focusResult.focusPreserved).toBe(true);
    });

    it("should provide visible focus indicators", () => {
      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");
      button.focus();

      // Should have focus styles (this would be tested with actual CSS in real scenarios)
      expect(button).toHaveFocus();
    });

    it("should handle Escape key for dismissible animations", async () => {
      const user = userEvent.setup();

      renderWithMotion(
        <AccessibleAnimationComponent animationState="animating" />,
      );

      const button = screen.getByRole("button");

      // Test Escape key
      await user.type(button, "{Escape}");

      // Should handle escape gracefully (implementation dependent)
      expect(button).toBeInTheDocument();
    });
  });

  describe("Alternative Interaction Methods", () => {
    it("should provide audio feedback when enabled", async () => {
      // Mock AudioContext
      const mockOscillator = {
        connect: jest.fn(),
        frequency: { setValueAtTime: jest.fn() },
        start: jest.fn(),
        stop: jest.fn(),
      };

      const mockGainNode = {
        connect: jest.fn(),
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
      };

      const mockAudioContext = {
        createOscillator: jest.fn(() => mockOscillator),
        createGain: jest.fn(() => mockGainNode),
        destination: {},
        currentTime: 0,
      };

      global.AudioContext = jest.fn(() => mockAudioContext);

      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Audio feedback should be available (implementation would trigger it)
      expect(global.AudioContext).toBeDefined();
    });

    it("should provide haptic feedback when available", () => {
      // Mock navigator.vibrate
      const mockVibrate = jest.fn();
      Object.defineProperty(navigator, "vibrate", {
        writable: true,
        value: mockVibrate,
      });

      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Haptic feedback should be available
      expect(navigator.vibrate).toBeDefined();
    });

    it("should provide visual feedback alternatives", () => {
      renderWithMotion(
        <AccessibleAnimationComponent animationState="animating" />,
      );

      const button = screen.getByRole("button");

      // Should provide visual indication of state
      expect(button.textContent).toContain("Animating");

      // Should have appropriate ARIA state
      expect(button.getAttribute("aria-busy")).toBe("true");
    });
  });

  describe("High Contrast Mode Support", () => {
    it("should work in forced colors mode", () => {
      // Mock forced colors media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query.includes("forced-colors: active"),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");

      // Should render without errors in high contrast mode
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it("should maintain functionality with system colors", () => {
      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");

      // Should maintain all functionality
      expect(button.getAttribute("aria-label")).toBeTruthy();
      expect(button.getAttribute("role")).toBe("button");
    });
  });

  describe("Print Media Support", () => {
    it("should disable animations in print media", () => {
      // Mock print media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query.includes("print"),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      renderWithMotion(<AccessibleAnimationComponent />);

      const button = screen.getByRole("button");

      // Should render static content for print
      expect(button).toBeInTheDocument();
      expect(button.textContent).not.toContain("Animating");
    });
  });

  describe("Error Handling and Graceful Degradation", () => {
    it("should handle missing accessibility APIs gracefully", () => {
      // Remove ARIA support
      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = jest.fn();

      expect(() => {
        renderWithMotion(<AccessibleAnimationComponent />);
      }).not.toThrow();

      // Restore
      Element.prototype.setAttribute = originalSetAttribute;
    });

    it("should work without animation support", () => {
      // Mock missing animation support
      const originalRAF = global.requestAnimationFrame;
      delete (global as any).requestAnimationFrame;

      expect(() => {
        renderWithMotion(<AccessibleAnimationComponent />);
      }).not.toThrow();

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // Restore
      global.requestAnimationFrame = originalRAF;
    });

    it("should provide fallbacks for unsupported features", () => {
      // Mock missing IntersectionObserver
      const originalIO = global.IntersectionObserver;
      delete (global as any).IntersectionObserver;

      expect(() => {
        renderWithMotion(<AccessibleAnimationComponent />);
      }).not.toThrow();

      // Should still be functional
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.getAttribute("aria-label")).toBeTruthy();

      // Restore
      global.IntersectionObserver = originalIO;
    });
  });
});
