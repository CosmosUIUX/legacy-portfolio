import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AccessibilityWrapper,
  withAccessibility,
} from "../accessibility-wrapper";

// Mock the accessibility hooks
jest.mock("../accessibility", () => ({
  useReducedMotion: jest.fn(() => false),
  useKeyboardNavigation: jest.fn(() => ({
    isKeyboardUser: false,
    focusedElement: null,
    preserveFocus: jest.fn(),
    trapFocus: jest.fn(),
    releaseFocusTrap: jest.fn(),
    restoreFocus: jest.fn(),
  })),
  useAriaAnnouncements: jest.fn(() => ({
    announce: jest.fn(),
  })),
  useAlternativeInteractions: jest.fn(() => ({
    triggerAlternativeAction: jest.fn(),
  })),
  getAriaProps: jest.fn(() => ({
    role: "button",
    "aria-pressed": "false",
    "aria-busy": "false",
  })),
  getScreenReaderSafeProps: jest.fn(() => ({
    "aria-hidden": "false",
  })),
  createAccessibilityInstructions: jest.fn(() => []),
}));

// Mock AudioContext and navigator.vibrate
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
}));

Object.defineProperty(navigator, "vibrate", {
  writable: true,
  value: jest.fn(),
});

describe("AccessibilityWrapper", () => {
  const mockOnAnimationStart = jest.fn();
  const mockOnAnimationComplete = jest.fn();
  const mockOnAnimationError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render children correctly", () => {
    render(
      <AccessibilityWrapper>
        <div data-testid="child">Test Content</div>
      </AccessibilityWrapper>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Test Content");
  });

  it("should apply correct element type", () => {
    render(
      <AccessibilityWrapper elementType="button">
        <span>Button Content</span>
      </AccessibilityWrapper>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Button Content");
  });

  it("should handle animation lifecycle callbacks", async () => {
    const { rerender } = render(
      <AccessibilityWrapper
        animationState="idle"
        onAnimationStart={mockOnAnimationStart}
        onAnimationComplete={mockOnAnimationComplete}
        onAnimationError={mockOnAnimationError}
      >
        <div>Content</div>
      </AccessibilityWrapper>,
    );

    // Change to animating state
    rerender(
      <AccessibilityWrapper
        animationState="animating"
        onAnimationStart={mockOnAnimationStart}
        onAnimationComplete={mockOnAnimationComplete}
        onAnimationError={mockOnAnimationError}
      >
        <div>Content</div>
      </AccessibilityWrapper>,
    );

    await waitFor(() => {
      expect(mockOnAnimationStart).toHaveBeenCalled();
    });

    // Change to complete state
    rerender(
      <AccessibilityWrapper
        animationState="complete"
        onAnimationStart={mockOnAnimationStart}
        onAnimationComplete={mockOnAnimationComplete}
        onAnimationError={mockOnAnimationError}
      >
        <div>Content</div>
      </AccessibilityWrapper>,
    );

    await waitFor(() => {
      expect(mockOnAnimationComplete).toHaveBeenCalled();
    });

    // Change to error state
    rerender(
      <AccessibilityWrapper
        animationState="error"
        onAnimationStart={mockOnAnimationStart}
        onAnimationComplete={mockOnAnimationComplete}
        onAnimationError={mockOnAnimationError}
      >
        <div>Content</div>
      </AccessibilityWrapper>,
    );

    await waitFor(() => {
      expect(mockOnAnimationError).toHaveBeenCalled();
    });
  });

  it("should handle keyboard interactions", async () => {
    const user = userEvent.setup();

    render(
      <AccessibilityWrapper
        elementType="button"
        enableAlternativeInteractions={true}
      >
        <span>Interactive Content</span>
      </AccessibilityWrapper>,
    );

    const button = screen.getByRole("button");

    // Test Enter key
    await user.type(button, "{Enter}");

    // Test Space key
    await user.type(button, " ");

    // Should not throw errors
    expect(button).toBeInTheDocument();
  });

  it("should render ARIA description when provided", () => {
    render(
      <AccessibilityWrapper
        elementType="button"
        ariaDescription="This is a test button description"
      >
        <span>Button</span>
      </AccessibilityWrapper>,
    );

    const description = screen.getByText("This is a test button description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("sr-only");
  });

  it("should apply accessibility classes correctly", () => {
    const { container } = render(
      <AccessibilityWrapper className="custom-class">
        <div>Content</div>
      </AccessibilityWrapper>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should handle focus events", async () => {
    const mockOnFocus = jest.fn();

    render(
      <AccessibilityWrapper
        elementType="button"
        ariaLabel="Test Button"
        onFocus={mockOnFocus}
      >
        <span>Button</span>
      </AccessibilityWrapper>,
    );

    const button = screen.getByRole("button");
    fireEvent.focus(button);

    expect(mockOnFocus).toHaveBeenCalled();
  });

  it("should pass through additional props", () => {
    render(
      <AccessibilityWrapper
        elementType="button"
        data-testid="custom-button"
        title="Custom Title"
      >
        <span>Button</span>
      </AccessibilityWrapper>,
    );

    const button = screen.getByTestId("custom-button");
    expect(button).toHaveAttribute("title", "Custom Title");
  });
});

describe("withAccessibility HOC", () => {
  // Test component
  function TestComponent({
    message,
    onClick,
  }: {
    message: string;
    onClick?: () => void;
  }) {
    return (
      <div onClick={onClick} data-testid="test-component">
        {message}
      </div>
    );
  }

  it("should wrap component with accessibility features", () => {
    const AccessibleTestComponent = withAccessibility(TestComponent, {
      elementType: "button",
      ariaLabel: "Test Button",
    });

    render(<AccessibleTestComponent message="Hello World" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("test-component")).toHaveTextContent(
      "Hello World",
    );
  });

  it("should allow overriding default props", () => {
    const AccessibleTestComponent = withAccessibility(TestComponent, {
      elementType: "button",
      ariaLabel: "Default Label",
    });

    render(
      <AccessibleTestComponent
        message="Hello World"
        ariaLabel="Custom Label"
        elementType="button"
      />,
    );

    // Should use the overridden props
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should pass through component props correctly", () => {
    const mockOnClick = jest.fn();
    const AccessibleTestComponent = withAccessibility(TestComponent);

    render(
      <AccessibleTestComponent message="Clickable" onClick={mockOnClick} />,
    );

    const component = screen.getByTestId("test-component");
    fireEvent.click(component);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it("should handle animation state changes", async () => {
    const mockOnAnimationStart = jest.fn();
    const AccessibleTestComponent = withAccessibility(TestComponent);

    const { rerender } = render(
      <AccessibleTestComponent
        message="Test"
        animationState="idle"
        onAnimationStart={mockOnAnimationStart}
      />,
    );

    rerender(
      <AccessibleTestComponent
        message="Test"
        animationState="animating"
        onAnimationStart={mockOnAnimationStart}
      />,
    );

    await waitFor(() => {
      expect(mockOnAnimationStart).toHaveBeenCalled();
    });
  });
});
