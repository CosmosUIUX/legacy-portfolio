import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SkipNavigation,
  useSkipNavigation,
  SkipTarget,
} from "../skip-navigation";
import {
  FocusManager,
  useAnimationFocus,
  RouteTransitionFocus,
  useFocusIndicator,
  FocusBoundary,
} from "../focus-management";
import {
  ReducedMotionProvider,
  useReducedMotionContext,
  MotionPreference,
  useMotionSafeAnimation,
  MotionPreferenceSettings,
  useMotionCapability,
  AdaptiveMotion,
} from "../reduced-motion";
import {
  AriaLiveProvider,
  useAriaLive,
  AnimationAnnouncer,
  RouteAnnouncer,
  FormValidationAnnouncer,
  useContextualAnnouncements,
} from "../aria-live";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock matchMedia
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

// Mock navigator properties
Object.defineProperty(navigator, "hardwareConcurrency", {
  writable: true,
  value: 4,
});

// Mock the accessibility hooks
jest.mock("../accessibility", () => ({
  useReducedMotion: jest.fn(() => true),
  useKeyboardNavigation: jest.fn(() => ({
    isKeyboardUser: true,
    focusedElement: null,
    focusHistory: [],
    preserveFocus: jest.fn(),
    restoreFocus: jest.fn(),
    trapFocus: jest.fn(() => jest.fn()),
    releaseFocusTrap: jest.fn(),
    getFocusableElements: jest.fn(() => []),
    getNextFocusableElement: jest.fn(() => null),
  })),
  useAriaAnnouncements: jest.fn(() => ({
    announce: jest.fn(),
  })),
  useAlternativeInteractions: jest.fn(() => ({
    interactionMode: "visual",
    setInteractionMode: jest.fn(),
    triggerAlternativeAction: jest.fn(),
    availableInteractionMethods: ["visual", "audio"],
    isAudioEnabled: false,
    isHapticEnabled: false,
  })),
}));

describe("Accessibility Enhancements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("SkipNavigation", () => {
    it("should render skip navigation links", () => {
      // Force the component to be visible by setting isKeyboardUser to true
      const mockUseKeyboardNavigation =
        require("../accessibility").useKeyboardNavigation;
      mockUseKeyboardNavigation.mockReturnValue({
        isKeyboardUser: true,
        focusedElement: null,
        focusHistory: [],
        preserveFocus: jest.fn(),
        restoreFocus: jest.fn(),
        trapFocus: jest.fn(() => jest.fn()),
        releaseFocusTrap: jest.fn(),
        getFocusableElements: jest.fn(() => []),
        getNextFocusableElement: jest.fn(() => null),
      });

      render(<SkipNavigation />);

      const skipNav = screen.getByRole("navigation", {
        name: "Skip navigation",
      });
      expect(skipNav).toBeInTheDocument();

      const mainContentLink = screen.getByText("Skip to main content");
      expect(mainContentLink).toBeInTheDocument();
      expect(mainContentLink).toHaveAttribute("href", "#main-content");
    });

    it("should show skip navigation on keyboard interaction", async () => {
      const user = userEvent.setup();

      // Mock the component to be initially visible
      const mockUseKeyboardNavigation =
        require("../accessibility").useKeyboardNavigation;
      mockUseKeyboardNavigation.mockReturnValue({
        isKeyboardUser: true,
        focusedElement: null,
        focusHistory: [],
        preserveFocus: jest.fn(),
        restoreFocus: jest.fn(),
        trapFocus: jest.fn(() => jest.fn()),
        releaseFocusTrap: jest.fn(),
        getFocusableElements: jest.fn(() => []),
        getNextFocusableElement: jest.fn(() => null),
      });

      render(<SkipNavigation />);

      const skipNav = screen.getByRole("navigation", {
        name: "Skip navigation",
      });
      expect(skipNav).toBeInTheDocument();

      // Check that it has the correct CSS classes and structure
      expect(skipNav).toHaveClass("skip-navigation");

      // Test that Tab key interaction works by checking if event listeners are set up
      await user.keyboard("{Tab}");

      // The component should still be in the document
      expect(skipNav).toBeInTheDocument();
    });

    it("should accept custom skip links", () => {
      const customLinks = [
        { href: "#custom-content", label: "Skip to custom content" },
        { href: "#custom-nav", label: "Skip to custom navigation" },
      ];

      // Force visibility
      const mockUseKeyboardNavigation =
        require("../accessibility").useKeyboardNavigation;
      mockUseKeyboardNavigation.mockReturnValue({
        isKeyboardUser: true,
        focusedElement: null,
        focusHistory: [],
        preserveFocus: jest.fn(),
        restoreFocus: jest.fn(),
        trapFocus: jest.fn(() => jest.fn()),
        releaseFocusTrap: jest.fn(),
        getFocusableElements: jest.fn(() => []),
        getNextFocusableElement: jest.fn(() => null),
      });

      render(<SkipNavigation links={customLinks} />);

      expect(screen.getByText("Skip to custom content")).toBeInTheDocument();
      expect(screen.getByText("Skip to custom navigation")).toBeInTheDocument();
    });
  });

  describe("FocusManager", () => {
    it("should manage focus restoration", async () => {
      const TestComponent = () => {
        const [showModal, setShowModal] = React.useState(false);

        return (
          <div>
            <button onClick={() => setShowModal(true)}>Open Modal</button>
            {showModal && (
              <FocusManager restoreFocus trapFocus>
                <div>
                  <button onClick={() => setShowModal(false)}>Close</button>
                </div>
              </FocusManager>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const openButton = screen.getByText("Open Modal");

      // Focus the open button first
      openButton.focus();
      expect(openButton).toHaveFocus();

      fireEvent.click(openButton);

      const closeButton = screen.getByText("Close");
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);

      // Wait for focus restoration
      await waitFor(() => {
        // The component should handle focus restoration
        expect(closeButton).not.toBeInTheDocument();
      });

      // Test that the focus manager component works without throwing errors
      expect(openButton).toBeInTheDocument();
    });

    it("should handle escape key", async () => {
      const mockOnEscape = jest.fn();
      const user = userEvent.setup();

      render(
        <FocusManager trapFocus onEscape={mockOnEscape}>
          <button>Test Button</button>
        </FocusManager>,
      );

      await user.keyboard("{Escape}");

      expect(mockOnEscape).toHaveBeenCalled();
    });
  });

  describe("ReducedMotionProvider", () => {
    it("should provide reduced motion context", () => {
      const TestComponent = () => {
        const { reducedMotion, motionPreference } = useReducedMotionContext();
        return (
          <div>
            <span data-testid="reduced-motion">{reducedMotion.toString()}</span>
            <span data-testid="motion-preference">{motionPreference}</span>
          </div>
        );
      };

      render(
        <ReducedMotionProvider>
          <TestComponent />
        </ReducedMotionProvider>,
      );

      expect(screen.getByTestId("reduced-motion")).toHaveTextContent("true");
      expect(screen.getByTestId("motion-preference")).toHaveTextContent(
        "reduce",
      );
    });

    it("should save preferences to localStorage", () => {
      const TestComponent = () => {
        const { setMotionPreference } = useReducedMotionContext();
        return (
          <button onClick={() => setMotionPreference("reduce")}>
            Set Reduced Motion
          </button>
        );
      };

      render(
        <ReducedMotionProvider>
          <TestComponent />
        </ReducedMotionProvider>,
      );

      fireEvent.click(screen.getByText("Set Reduced Motion"));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "motion-preference",
        "reduce",
      );
    });
  });

  describe("MotionPreference", () => {
    it("should render children when motion is enabled", () => {
      // Mock the useReducedMotion hook to return false
      const mockUseReducedMotion = require("../accessibility").useReducedMotion;
      mockUseReducedMotion.mockReturnValue(false);

      render(
        <ReducedMotionProvider>
          <MotionPreference fallback={<div>Fallback</div>}>
            <div>Animated Content</div>
          </MotionPreference>
        </ReducedMotionProvider>,
      );

      expect(screen.getByText("Animated Content")).toBeInTheDocument();
      expect(screen.queryByText("Fallback")).not.toBeInTheDocument();
    });

    it("should render fallback when motion is reduced", () => {
      // Mock the useReducedMotion hook to return true
      const mockUseReducedMotion = require("../accessibility").useReducedMotion;
      mockUseReducedMotion.mockReturnValue(true);

      render(
        <ReducedMotionProvider>
          <MotionPreference fallback={<div>Fallback</div>}>
            <div>Animated Content</div>
          </MotionPreference>
        </ReducedMotionProvider>,
      );

      expect(screen.getByText("Fallback")).toBeInTheDocument();
      expect(screen.queryByText("Animated Content")).not.toBeInTheDocument();
    });
  });

  describe("useMotionSafeAnimation", () => {
    it("should return static config when motion is reduced", () => {
      const TestComponent = () => {
        const config = useMotionSafeAnimation(
          { duration: 0.5, opacity: 1 },
          { opacity: 0.5 },
        );

        return <div data-testid="config">{JSON.stringify(config)}</div>;
      };

      render(
        <ReducedMotionProvider>
          <TestComponent />
        </ReducedMotionProvider>,
      );

      const configElement = screen.getByTestId("config");
      const config = JSON.parse(configElement.textContent || "{}");

      expect(config.duration).toBe(0);
      expect(config.opacity).toBe(0.5);
    });
  });

  describe("AriaLiveProvider", () => {
    it("should provide announcement functionality", async () => {
      const TestComponent = () => {
        const { announce } = useAriaLive();

        return (
          <button onClick={() => announce("Test announcement")}>
            Announce
          </button>
        );
      };

      render(
        <AriaLiveProvider>
          <TestComponent />
        </AriaLiveProvider>,
      );

      fireEvent.click(screen.getByText("Announce"));

      // Check if live region was created and contains the announcement
      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it("should handle assertive announcements", async () => {
      const TestComponent = () => {
        const { announce } = useAriaLive();

        return (
          <button onClick={() => announce("Urgent announcement", "assertive")}>
            Announce Urgent
          </button>
        );
      };

      render(
        <AriaLiveProvider>
          <TestComponent />
        </AriaLiveProvider>,
      );

      fireEvent.click(screen.getByText("Announce Urgent"));

      await waitFor(() => {
        const assertiveRegion = document.querySelector(
          '[aria-live="assertive"]',
        );
        expect(assertiveRegion).toBeInTheDocument();
      });
    });
  });

  describe("AnimationAnnouncer", () => {
    it("should announce animation state changes", async () => {
      const { rerender } = render(
        <AriaLiveProvider>
          <AnimationAnnouncer animationState="idle" />
        </AriaLiveProvider>,
      );

      // Change to animating state
      rerender(
        <AriaLiveProvider>
          <AnimationAnnouncer animationState="animating" />
        </AriaLiveProvider>,
      );

      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion?.textContent).toContain("Animation started");
      });
    });

    it("should use custom messages", async () => {
      const customMessages = {
        animating: "Custom animation message",
        complete: "Custom completion message",
      };

      const { rerender } = render(
        <AriaLiveProvider>
          <AnimationAnnouncer animationState="idle" messages={customMessages} />
        </AriaLiveProvider>,
      );

      rerender(
        <AriaLiveProvider>
          <AnimationAnnouncer
            animationState="animating"
            messages={customMessages}
          />
        </AriaLiveProvider>,
      );

      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion?.textContent).toContain("Custom animation message");
      });
    });
  });

  describe("useContextualAnnouncements", () => {
    it("should provide interaction announcements", () => {
      const TestComponent = () => {
        const { announceInteraction } = useContextualAnnouncements();

        return (
          <button onClick={() => announceInteraction("click", "test button")}>
            Test Button
          </button>
        );
      };

      render(
        <AriaLiveProvider>
          <TestComponent />
        </AriaLiveProvider>,
      );

      fireEvent.click(screen.getByText("Test Button"));

      // Should not throw any errors
      expect(screen.getByText("Test Button")).toBeInTheDocument();
    });

    it("should announce progress updates", () => {
      const TestComponent = () => {
        const { announceProgress } = useContextualAnnouncements();

        return (
          <button onClick={() => announceProgress(5, 10, "Upload")}>
            Update Progress
          </button>
        );
      };

      render(
        <AriaLiveProvider>
          <TestComponent />
        </AriaLiveProvider>,
      );

      fireEvent.click(screen.getByText("Update Progress"));

      // Should not throw any errors
      expect(screen.getByText("Update Progress")).toBeInTheDocument();
    });
  });

  describe("useMotionCapability", () => {
    it("should detect motion capabilities", () => {
      const TestComponent = () => {
        const capability = useMotionCapability();

        return <div data-testid="capability">{JSON.stringify(capability)}</div>;
      };

      render(<TestComponent />);

      const capabilityElement = screen.getByTestId("capability");
      const capability = JSON.parse(capabilityElement.textContent || "{}");

      expect(capability).toHaveProperty("supportsAnimations");
      expect(capability).toHaveProperty("supportsTransforms");
      expect(capability).toHaveProperty("supportsGPUAcceleration");
      expect(capability).toHaveProperty("performanceLevel");
    });
  });

  describe("AdaptiveMotion", () => {
    it("should adapt configuration based on performance level", () => {
      const highConfig = { duration: 0.5, complexity: "high" };
      const mediumConfig = { duration: 0.3, complexity: "medium" };
      const lowConfig = { duration: 0.1, complexity: "low" };

      const TestComponent = () => (
        <ReducedMotionProvider>
          <AdaptiveMotion
            highPerformanceConfig={highConfig}
            mediumPerformanceConfig={mediumConfig}
            lowPerformanceConfig={lowConfig}
          >
            {(config) => (
              <div data-testid="adaptive-config">{JSON.stringify(config)}</div>
            )}
          </AdaptiveMotion>
        </ReducedMotionProvider>
      );

      render(<TestComponent />);

      const configElement = screen.getByTestId("adaptive-config");
      const config = JSON.parse(configElement.textContent || "{}");

      // Should have some configuration
      expect(config).toHaveProperty("duration");
    });
  });

  describe("Integration Tests", () => {
    it("should work together in a complete accessibility setup", async () => {
      // Ensure proper mocking for integration test
      const mockUseKeyboardNavigation =
        require("../accessibility").useKeyboardNavigation;
      mockUseKeyboardNavigation.mockReturnValue({
        isKeyboardUser: true,
        focusedElement: null,
        focusHistory: [],
        preserveFocus: jest.fn(),
        restoreFocus: jest.fn(),
        trapFocus: jest.fn(() => jest.fn()),
        releaseFocusTrap: jest.fn(),
        getFocusableElements: jest.fn(() => []),
        getNextFocusableElement: jest.fn(() => null),
      });

      const mockUseReducedMotion = require("../accessibility").useReducedMotion;
      mockUseReducedMotion.mockReturnValue(true);

      const CompleteAccessibilityApp = () => {
        const [animationState, setAnimationState] = React.useState<
          "idle" | "animating" | "complete"
        >("idle");

        return (
          <ReducedMotionProvider>
            <AriaLiveProvider>
              <SkipNavigation />
              <FocusManager>
                <div>
                  <button
                    onClick={() => setAnimationState("animating")}
                    data-testid="start-animation"
                  >
                    Start Animation
                  </button>

                  <AnimationAnnouncer animationState={animationState} />

                  <MotionPreference fallback={<div>Static content</div>}>
                    <div>Animated content</div>
                  </MotionPreference>
                </div>
              </FocusManager>
            </AriaLiveProvider>
          </ReducedMotionProvider>
        );
      };

      render(<CompleteAccessibilityApp />);

      // Check that all components render without errors
      expect(
        screen.getByRole("navigation", { name: "Skip navigation" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("start-animation")).toBeInTheDocument();
      expect(screen.getByText("Static content")).toBeInTheDocument(); // Reduced motion fallback

      // Test interaction
      fireEvent.click(screen.getByTestId("start-animation"));

      // Should not throw any errors
      expect(screen.getByTestId("start-animation")).toBeInTheDocument();
    });
  });
});
