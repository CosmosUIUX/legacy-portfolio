// Comprehensive accessibility tests for Motion.dev animations
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { motion } from "@/lib/motion";
import {
  renderWithMotion,
  AccessibilityTestUtils,
  setupAnimationTestEnvironment,
} from "../test-utils";
import { MotionProvider } from "../provider";
import { useMotion, useStaggerAnimation, useTextAnimation } from "../hooks";
import {
  useReducedMotion,
  useScreenReader,
  useKeyboardNavigation,
  useAriaAnnouncements,
  getAriaProps,
  validateAnimationSafety,
} from "../accessibility";

// Setup test environment
setupAnimationTestEnvironment();

// Mock screen reader detection
const mockScreenReaderDetection = (isScreenReader: boolean) => {
  Object.defineProperty(navigator, "userAgent", {
    writable: true,
    value: isScreenReader ? "NVDA" : "Chrome",
  });
};

// Mock reduced motion preference
const mockReducedMotionPreference = (reducedMotion: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion: reduce")
        ? reducedMotion
        : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test components
function AccessibleAnimatedButton({
  children,
  onAnimationStart,
  onAnimationComplete,
}: {
  children: React.ReactNode;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}) {
  const { ref, animationProps, eventHandlers, isActive } = useMotion({
    trigger: "hover",
    duration: 300,
  });

  React.useEffect(() => {
    if (isActive && onAnimationStart) {
      onAnimationStart();
    }
  }, [isActive, onAnimationStart]);

  React.useEffect(() => {
    if (isActive && onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, onAnimationComplete]);

  const ariaProps = getAriaProps("button", isActive ? "animating" : "idle", {
    label: typeof children === "string" ? children : "Animated button",
  });

  return (
    <motion.button
      ref={ref}
      {...animationProps}
      {...eventHandlers}
      {...ariaProps}
      data-testid="accessible-animated-button"
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </motion.button>
  );
}

function AccessibleStaggeredList({
  items,
  announceProgress = false,
}: {
  items: string[];
  announceProgress?: boolean;
}) {
  const { ref, getItemProps, currentIndex, isComplete } = useStaggerAnimation({
    items,
    staggerDelay: 100,
    trigger: "viewport",
  });

  const { announce } = useAriaAnnouncements();

  React.useEffect(() => {
    if (announceProgress && currentIndex >= 0) {
      announce(`Loading item ${currentIndex + 1} of ${items.length}`);
    }
  }, [currentIndex, items.length, announce, announceProgress]);

  React.useEffect(() => {
    if (isComplete && announceProgress) {
      announce("All items loaded", "assertive");
    }
  }, [isComplete, announce, announceProgress]);

  return (
    <div
      ref={ref}
      data-testid="accessible-staggered-list"
      role="list"
      aria-label={`List of ${items.length} items`}
      aria-busy={!isComplete}
    >
      {items.map((item, index) => {
        const itemProps = getItemProps(index);
        const isVisible = currentIndex >= index;

        return (
          <motion.div
            key={index}
            {...itemProps}
            data-testid={`stagger-item-${index}`}
            role="listitem"
            aria-label={item}
            aria-hidden={!isVisible}
            className="p-2 bg-gray-100 mb-2 rounded"
          >
            {item}
          </motion.div>
        );
      })}
    </div>
  );
}

function AccessibleTextAnimation({
  text,
  announceCompletion = false,
}: {
  text: string;
  announceCompletion?: boolean;
}) {
  const { displayText, isComplete } = useTextAnimation({
    text,
    animationType: "typewriter",
    speed: 50,
  });

  const { announce } = useAriaAnnouncements();

  React.useEffect(() => {
    if (isComplete && announceCompletion) {
      announce(`Text animation complete: ${text}`);
    }
  }, [isComplete, text, announce, announceCompletion]);

  return (
    <div
      data-testid="accessible-text-animation"
      aria-label={isComplete ? text : `Loading text: ${displayText}`}
      aria-busy={!isComplete}
      aria-live="polite"
    >
      {displayText}
    </div>
  );
}

function KeyboardNavigationTest() {
  const { isKeyboardUser, preserveFocus } = useKeyboardNavigation();
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const buttons = ["First", "Second", "Third"];

  return (
    <div data-testid="keyboard-navigation-test">
      <div data-testid="keyboard-user-indicator">
        Keyboard user: {isKeyboardUser.toString()}
      </div>

      {buttons.map((label, index) => (
        <AccessibleAnimatedButton
          key={index}
          onAnimationStart={() => setFocusedIndex(index)}
        >
          {label}
        </AccessibleAnimatedButton>
      ))}

      <button onClick={preserveFocus} data-testid="preserve-focus-button">
        Preserve Focus
      </button>

      <div data-testid="focused-index">{focusedIndex}</div>
    </div>
  );
}

describe("Comprehensive Accessibility Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    mockReducedMotionPreference(false);
    mockScreenReaderDetection(false);
  });

  describe("Reduced Motion Compliance", () => {
    it("should disable animations when reduced motion is preferred", async () => {
      mockReducedMotionPreference(true);

      const onAnimationStart = jest.fn();

      renderWithMotion(
        <AccessibleAnimatedButton onAnimationStart={onAnimationStart}>
          Test Button
        </AccessibleAnimatedButton>,
        { providerProps: { reducedMotion: true } },
      );

      const button = screen.getByTestId("accessible-animated-button");

      // Hover should not trigger animation
      await userEvent.hover(button);

      // Animation should not start
      expect(onAnimationStart).not.toHaveBeenCalled();
    });

    it("should provide alternative feedback when animations are disabled", async () => {
      mockReducedMotionPreference(true);

      renderWithMotion(
        <AccessibleAnimatedButton>Test Button</AccessibleAnimatedButton>,
        { providerProps: { reducedMotion: true } },
      );

      const button = screen.getByTestId("accessible-animated-button");

      // Should still be interactive
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute("aria-label");

      // Should have appropriate ARIA attributes for non-animated state
      expect(button).toHaveAttribute("aria-busy", "false");
    });

    it("should respect system reduced motion preference", async () => {
      // Mock system preference
      mockReducedMotionPreference(true);

      const TestComponent = () => {
        const reducedMotion = useReducedMotion();
        return (
          <div data-testid="reduced-motion-status">
            {reducedMotion.toString()}
          </div>
        );
      };

      render(<TestComponent />);

      const status = screen.getByTestId("reduced-motion-status");
      expect(status).toHaveTextContent("true");
    });

    it("should handle reduced motion preference changes", async () => {
      const TestComponent = () => {
        const reducedMotion = useReducedMotion();
        return (
          <div data-testid="reduced-motion-status">
            {reducedMotion.toString()}
          </div>
        );
      };

      render(<TestComponent />);

      let status = screen.getByTestId("reduced-motion-status");
      expect(status).toHaveTextContent("false");

      // Simulate preference change
      mockReducedMotionPreference(true);

      // Trigger a re-render by dispatching a media query change event
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      fireEvent(mediaQuery, new Event("change"));

      await waitFor(() => {
        status = screen.getByTestId("reduced-motion-status");
        expect(status).toHaveTextContent("true");
      });
    });

    it("should provide reduced motion alternatives for complex animations", async () => {
      mockReducedMotionPreference(true);

      renderWithMotion(
        <AccessibleStaggeredList
          items={["Item 1", "Item 2", "Item 3"]}
          announceProgress={true}
        />,
        { providerProps: { reducedMotion: true } },
      );

      const list = screen.getByTestId("accessible-staggered-list");

      // All items should be immediately visible when reduced motion is enabled
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);

      // List should not be marked as busy
      expect(list).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should detect screen reader usage", async () => {
      mockScreenReaderDetection(true);

      const TestComponent = () => {
        const isScreenReader = useScreenReader();
        return (
          <div data-testid="screen-reader-status">
            {isScreenReader.toString()}
          </div>
        );
      };

      render(<TestComponent />);

      const status = screen.getByTestId("screen-reader-status");
      expect(status).toHaveTextContent("true");
    });

    it("should provide appropriate ARIA attributes during animations", async () => {
      const onAnimationStart = jest.fn();

      renderWithMotion(
        <AccessibleAnimatedButton onAnimationStart={onAnimationStart}>
          Test Button
        </AccessibleAnimatedButton>,
      );

      const button = screen.getByTestId("accessible-animated-button");

      // Initial state
      expect(button).toHaveAttribute("aria-busy", "false");
      expect(button).toHaveAttribute("aria-pressed", "false");

      // Trigger animation
      await userEvent.hover(button);

      await waitFor(() => {
        expect(onAnimationStart).toHaveBeenCalled();
      });

      // During animation
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should announce animation progress to screen readers", async () => {
      renderWithMotion(
        <AccessibleStaggeredList
          items={["Item 1", "Item 2", "Item 3"]}
          announceProgress={true}
        />,
      );

      // Check for ARIA live regions
      const liveRegions = document.querySelectorAll("[aria-live]");
      expect(liveRegions.length).toBeGreaterThan(0);

      // List should be marked as busy initially
      const list = screen.getByTestId("accessible-staggered-list");
      expect(list).toHaveAttribute("aria-busy", "true");
    });

    it("should handle text animation announcements", async () => {
      renderWithMotion(
        <AccessibleTextAnimation
          text="Hello World"
          announceCompletion={true}
        />,
      );

      const textElement = screen.getByTestId("accessible-text-animation");

      // Should have live region
      expect(textElement).toHaveAttribute("aria-live", "polite");

      // Should be marked as busy initially
      expect(textElement).toHaveAttribute("aria-busy", "true");

      // Should have appropriate label
      expect(textElement).toHaveAttribute("aria-label");
    });

    it("should not interfere with screen reader navigation", async () => {
      mockScreenReaderDetection(true);

      renderWithMotion(
        <div>
          <h1>Page Title</h1>
          <AccessibleAnimatedButton>
            Interactive Button
          </AccessibleAnimatedButton>
          <p>Some content after the button</p>
        </div>,
        { providerProps: { reducedMotion: false } },
      );

      const heading = screen.getByRole("heading");
      const button = screen.getByRole("button");
      const paragraph = screen.getByText("Some content after the button");

      // All elements should be accessible
      expect(heading).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();

      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should detect keyboard usage", async () => {
      renderWithMotion(<KeyboardNavigationTest />);

      const indicator = screen.getByTestId("keyboard-user-indicator");
      expect(indicator).toHaveTextContent("Keyboard user: false");

      // Simulate Tab key press
      fireEvent.keyDown(document, { key: "Tab" });

      await waitFor(() => {
        expect(indicator).toHaveTextContent("Keyboard user: true");
      });
    });

    it("should maintain focus during animations", async () => {
      renderWithMotion(<KeyboardNavigationTest />);

      const buttons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.getAttribute("data-testid") === "accessible-animated-button",
        );

      // Focus first button
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();

      // Trigger animation with hover
      await userEvent.hover(buttons[0]);

      // Focus should be maintained
      expect(buttons[0]).toHaveFocus();
    });

    it("should support keyboard navigation between animated elements", async () => {
      renderWithMotion(<KeyboardNavigationTest />);

      const buttons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.getAttribute("data-testid") === "accessible-animated-button",
        );

      // Tab through buttons
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();

      await userEvent.tab();
      expect(buttons[1]).toHaveFocus();

      await userEvent.tab();
      expect(buttons[2]).toHaveFocus();
    });

    it("should handle Enter and Space key activation", async () => {
      const onClick = jest.fn();

      const TestButton = () => {
        const { ref, animationProps, eventHandlers } = useMotion({
          trigger: "click",
        });

        return (
          <motion.button
            ref={ref}
            {...animationProps}
            {...eventHandlers}
            onClick={onClick}
            data-testid="keyboard-activated-button"
          >
            Click me
          </motion.button>
        );
      };

      renderWithMotion(<TestButton />);

      const button = screen.getByTestId("keyboard-activated-button");

      // Focus button
      button.focus();

      // Activate with Enter
      fireEvent.keyDown(button, { key: "Enter" });
      expect(onClick).toHaveBeenCalledTimes(1);

      // Activate with Space
      fireEvent.keyDown(button, { key: " " });
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("should preserve focus order with dynamic content", async () => {
      const DynamicContentTest = () => {
        const [showExtra, setShowExtra] = React.useState(false);

        return (
          <div>
            <button data-testid="button-1">Button 1</button>
            <button
              onClick={() => setShowExtra(!showExtra)}
              data-testid="toggle-button"
            >
              Toggle
            </button>
            {showExtra && (
              <AccessibleAnimatedButton>
                Dynamic Button
              </AccessibleAnimatedButton>
            )}
            <button data-testid="button-2">Button 2</button>
          </div>
        );
      };

      renderWithMotion(<DynamicContentTest />);

      const button1 = screen.getByTestId("button-1");
      const toggleButton = screen.getByTestId("toggle-button");
      const button2 = screen.getByTestId("button-2");

      // Initial tab order
      button1.focus();
      await userEvent.tab();
      expect(toggleButton).toHaveFocus();
      await userEvent.tab();
      expect(button2).toHaveFocus();

      // Add dynamic content
      toggleButton.focus();
      await userEvent.click(toggleButton);

      const dynamicButton = screen.getByTestId("accessible-animated-button");
      expect(dynamicButton).toBeInTheDocument();

      // Tab order should include dynamic button
      toggleButton.focus();
      await userEvent.tab();
      expect(dynamicButton).toHaveFocus();
      await userEvent.tab();
      expect(button2).toHaveFocus();
    });
  });

  describe("ARIA Announcements", () => {
    it("should create appropriate live regions", async () => {
      const TestComponent = () => {
        const { announce } = useAriaAnnouncements();

        return (
          <button
            onClick={() => announce("Test announcement")}
            data-testid="announce-button"
          >
            Announce
          </button>
        );
      };

      renderWithMotion(<TestComponent />);

      // Should create live regions
      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
    });

    it("should announce animation state changes", async () => {
      const StateChangeTest = () => {
        const [isAnimating, setIsAnimating] = React.useState(false);
        const { announce } = useAriaAnnouncements();

        const handleToggle = () => {
          setIsAnimating(!isAnimating);
          announce(isAnimating ? "Animation stopped" : "Animation started");
        };

        return (
          <div>
            <button onClick={handleToggle} data-testid="toggle-animation">
              Toggle Animation
            </button>
            <div data-testid="animation-status">
              {isAnimating ? "Animating" : "Static"}
            </div>
          </div>
        );
      };

      renderWithMotion(<StateChangeTest />);

      const toggleButton = screen.getByTestId("toggle-animation");
      const status = screen.getByTestId("animation-status");

      expect(status).toHaveTextContent("Static");

      await userEvent.click(toggleButton);
      expect(status).toHaveTextContent("Animating");

      // Check that announcement was made
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent("Animation started");
    });

    it("should handle urgent announcements", async () => {
      const UrgentAnnouncementTest = () => {
        const { announce } = useAriaAnnouncements();

        return (
          <button
            onClick={() => announce("Urgent message", "assertive")}
            data-testid="urgent-announce-button"
          >
            Urgent Announce
          </button>
        );
      };

      renderWithMotion(<UrgentAnnouncementTest />);

      const button = screen.getByTestId("urgent-announce-button");
      await userEvent.click(button);

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).toHaveTextContent("Urgent message");
    });
  });

  describe("Animation Safety Validation", () => {
    it("should validate safe animation parameters", () => {
      const safeAnimation = {
        flashRate: 2,
        colorChanges: 3,
        contrastRatio: 5.0,
      };

      const result = validateAnimationSafety(safeAnimation);

      expect(result.safe).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect unsafe flash rates", () => {
      const unsafeAnimation = {
        flashRate: 5, // Above 3 flashes/second threshold
      };

      const result = validateAnimationSafety(unsafeAnimation);

      expect(result.safe).toBe(false);
      expect(result.warnings).toContain(
        "Flash rate exceeds safe threshold (3 flashes/second)",
      );
    });

    it("should detect excessive color changes", () => {
      const unsafeAnimation = {
        colorChanges: 10, // Too many rapid color changes
      };

      const result = validateAnimationSafety(unsafeAnimation);

      expect(result.safe).toBe(false);
      expect(result.warnings).toContain(
        "Too many rapid color changes detected",
      );
    });

    it("should detect insufficient contrast", () => {
      const unsafeAnimation = {
        contrastRatio: 3.0, // Below 4.5:1 minimum
      };

      const result = validateAnimationSafety(unsafeAnimation);

      expect(result.safe).toBe(false);
      expect(result.warnings).toContain(
        "Insufficient color contrast ratio (minimum 4.5:1)",
      );
    });

    it("should validate multiple safety criteria", () => {
      const multipleIssues = {
        flashRate: 4,
        colorChanges: 8,
        contrastRatio: 2.5,
      };

      const result = validateAnimationSafety(multipleIssues);

      expect(result.safe).toBe(false);
      expect(result.warnings).toHaveLength(3);
    });
  });

  describe("Focus Management", () => {
    it("should preserve focus during animation sequences", async () => {
      const FocusPreservationTest = () => {
        const [step, setStep] = React.useState(0);

        return (
          <div>
            <button onClick={() => setStep(1)} data-testid="start-sequence">
              Start Sequence
            </button>

            {step >= 1 && (
              <AccessibleAnimatedButton>Step 1 Button</AccessibleAnimatedButton>
            )}

            {step >= 2 && (
              <AccessibleAnimatedButton>Step 2 Button</AccessibleAnimatedButton>
            )}

            <button onClick={() => setStep(step + 1)} data-testid="next-step">
              Next Step
            </button>
          </div>
        );
      };

      renderWithMotion(<FocusPreservationTest />);

      const startButton = screen.getByTestId("start-sequence");
      const nextButton = screen.getByTestId("next-step");

      // Start sequence
      startButton.focus();
      await userEvent.click(startButton);

      // Focus should move to next interactive element
      nextButton.focus();
      await userEvent.click(nextButton);

      // New button should be focusable
      const step2Button = screen.getByText("Step 2 Button");
      step2Button.focus();
      expect(step2Button).toHaveFocus();
    });

    it("should handle focus trapping in modal animations", async () => {
      const ModalTest = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button onClick={() => setIsOpen(true)} data-testid="open-modal">
              Open Modal
            </button>

            {isOpen && (
              <div role="dialog" aria-modal="true" data-testid="modal">
                <AccessibleAnimatedButton>
                  Modal Button 1
                </AccessibleAnimatedButton>
                <AccessibleAnimatedButton>
                  Modal Button 2
                </AccessibleAnimatedButton>
                <button
                  onClick={() => setIsOpen(false)}
                  data-testid="close-modal"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      };

      renderWithMotion(<ModalTest />);

      const openButton = screen.getByTestId("open-modal");
      await userEvent.click(openButton);

      const modal = screen.getByTestId("modal");
      const modalButtons = screen.getAllByText(/Modal Button/);
      const closeButton = screen.getByTestId("close-modal");

      expect(modal).toBeInTheDocument();

      // Focus should be trapped within modal
      modalButtons[0].focus();
      expect(modalButtons[0]).toHaveFocus();

      await userEvent.tab();
      expect(modalButtons[1]).toHaveFocus();

      await userEvent.tab();
      expect(closeButton).toHaveFocus();
    });
  });

  describe("Error State Accessibility", () => {
    it("should handle animation errors accessibly", async () => {
      const ErrorStateTest = () => {
        const [hasError, setHasError] = React.useState(false);

        const ariaProps = getAriaProps("button", hasError ? "error" : "idle");

        return (
          <div>
            <button
              onClick={() => setHasError(true)}
              data-testid="trigger-error"
            >
              Trigger Error
            </button>

            <motion.div {...ariaProps} data-testid="error-prone-element">
              {hasError ? "Error occurred" : "Normal state"}
            </motion.div>
          </div>
        );
      };

      renderWithMotion(<ErrorStateTest />);

      const triggerButton = screen.getByTestId("trigger-error");
      const element = screen.getByTestId("error-prone-element");

      // Initial state
      expect(element).toHaveAttribute("aria-invalid", "false");

      // Trigger error
      await userEvent.click(triggerButton);

      // Error state should be announced
      expect(element).toHaveAttribute("aria-invalid", "true");
      expect(element).toHaveAttribute("aria-live", "assertive");
    });

    it("should provide fallback content for failed animations", async () => {
      const FallbackTest = () => {
        const [animationFailed, setAnimationFailed] = React.useState(false);

        return (
          <div>
            <button
              onClick={() => setAnimationFailed(true)}
              data-testid="fail-animation"
            >
              Fail Animation
            </button>

            {animationFailed ? (
              <div data-testid="fallback-content">Static fallback content</div>
            ) : (
              <AccessibleAnimatedButton>
                Animated Content
              </AccessibleAnimatedButton>
            )}
          </div>
        );
      };

      renderWithMotion(<FallbackTest />);

      const failButton = screen.getByTestId("fail-animation");

      // Initially shows animated content
      expect(screen.getByText("Animated Content")).toBeInTheDocument();

      // Trigger failure
      await userEvent.click(failButton);

      // Should show fallback
      expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
      expect(screen.queryByText("Animated Content")).not.toBeInTheDocument();
    });
  });
});
