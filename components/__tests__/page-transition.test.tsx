import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  PageTransition,
  SectionTransition,
  RouteTransition,
  usePageTransition,
} from "../page-transition";

// Mock Motion.dev
jest.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useScroll: () => ({
    scrollYProgress: { get: () => 0, on: () => () => {} },
    scrollY: { on: () => () => {} },
  }),
  useTransform: () => ({ get: () => 0 }),
  useMotionValue: () => ({ get: () => 0, set: () => {} }),
  useSpring: (value: any) => value,
}));

// Mock Motion.dev hooks
jest.mock("@/lib/motion/hooks", () => ({
  useMotion: () => ({
    ref: { current: null },
    isActive: true,
    animationProps: {
      animate: "visible",
      initial: "hidden",
      transition: { duration: 0.3 },
      variants: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      },
    },
    eventHandlers: {},
    isHovered: false,
  }),
  useScrollAnimation: () => ({
    ref: { current: null },
    style: {},
    scrollProgress: { get: () => 0 },
    scrollY: { on: () => () => {} },
  }),
  useStaggerAnimation: () => ({
    ref: { current: null },
    getItemProps: () => ({
      animate: "visible",
      initial: "hidden",
      variants: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      },
    }),
    startAnimation: jest.fn(),
    resetAnimation: jest.fn(),
  }),
  useViewportAnimation: () => ({
    ref: { current: null },
    isInView: true,
    hasEntered: true,
    shouldAnimate: true,
  }),
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/test-path",
}));

// Mock Motion.dev provider
jest.mock("@/lib/motion/provider", () => ({
  useMotionSettings: () => ({
    shouldAnimate: true,
    getDuration: (duration: number) => duration,
    getEasing: (easing: string) => easing,
    performanceMode: "high",
  }),
}));

// Mock MotionProvider
const MockMotionProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="motion-provider">{children}</div>
);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MockMotionProvider>{children}</MockMotionProvider>
);

describe("PageTransition", () => {
  it("renders children correctly", () => {
    render(
      <TestWrapper>
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      </TestWrapper>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("shows loading spinner when loading prop is true", () => {
    render(
      <TestWrapper>
        <PageTransition loading={true} loadingText="Loading content...">
          <div>Test Content</div>
        </PageTransition>
      </TestWrapper>,
    );

    // Loading spinner should be present and content should not be visible
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
    expect(screen.getByText("Loading content...")).toBeInTheDocument();
  });

  it("applies correct transition direction classes", () => {
    const { rerender } = render(
      <TestWrapper>
        <PageTransition direction="slide-left" transitionKey="test1">
          <div>Content 1</div>
        </PageTransition>
      </TestWrapper>,
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <PageTransition direction="slide-right" transitionKey="test2">
          <div>Content 2</div>
        </PageTransition>
      </TestWrapper>,
    );

    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });
});

describe("SectionTransition", () => {
  it("renders section with correct props", () => {
    render(
      <TestWrapper>
        <SectionTransition sectionId="test-section" className="test-class">
          <div>Section Content</div>
        </SectionTransition>
      </TestWrapper>,
    );

    const section = screen.getByText("Section Content").closest("section");
    expect(section).toHaveClass("test-class");
    expect(screen.getByText("Section Content")).toBeInTheDocument();
  });
});

describe("RouteTransition", () => {
  it("renders with pathname key", () => {
    render(
      <TestWrapper>
        <RouteTransition pathname="/test" className="route-class">
          <div>Route Content</div>
        </RouteTransition>
      </TestWrapper>,
    );

    expect(screen.getByText("Route Content")).toBeInTheDocument();
  });
});

describe("usePageTransition", () => {
  const TestComponent = () => {
    const {
      isTransitioning,
      transitionDirection,
      startTransition,
      endTransition,
    } = usePageTransition();

    return (
      <div>
        <div data-testid="transition-state">
          {isTransitioning ? "transitioning" : "idle"}
        </div>
        <div data-testid="transition-direction">{transitionDirection}</div>
        <button onClick={() => startTransition("forward")}>
          Start Forward
        </button>
        <button onClick={() => startTransition("backward")}>
          Start Backward
        </button>
        <button onClick={endTransition}>End Transition</button>
      </div>
    );
  };

  it("manages transition state correctly", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId("transition-state")).toHaveTextContent("idle");
    expect(screen.getByTestId("transition-direction")).toHaveTextContent(
      "forward",
    );

    fireEvent.click(screen.getByText("Start Forward"));
    expect(screen.getByTestId("transition-state")).toHaveTextContent(
      "transitioning",
    );
    expect(screen.getByTestId("transition-direction")).toHaveTextContent(
      "forward",
    );

    fireEvent.click(screen.getByText("Start Backward"));
    expect(screen.getByTestId("transition-direction")).toHaveTextContent(
      "backward",
    );

    fireEvent.click(screen.getByText("End Transition"));
    expect(screen.getByTestId("transition-state")).toHaveTextContent("idle");
  });

  it("auto-ends transition after timeout", async () => {
    jest.useFakeTimers();

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    fireEvent.click(screen.getByText("Start Forward"));
    expect(screen.getByTestId("transition-state")).toHaveTextContent(
      "transitioning",
    );

    // Fast-forward time
    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(screen.getByTestId("transition-state")).toHaveTextContent("idle");
    });

    jest.useRealTimers();
  });
});

describe("Focus Management", () => {
  it("focuses main content after transition", () => {
    // Create a main element
    const main = document.createElement("main");
    main.tabIndex = -1;
    document.body.appendChild(main);

    render(
      <TestWrapper>
        <RouteTransition pathname="/test">
          <main>
            <h1>Page Title</h1>
            <div>Content</div>
          </main>
        </RouteTransition>
      </TestWrapper>,
    );

    // Clean up
    document.body.removeChild(main);
  });
});

describe("Accessibility", () => {
  it("maintains proper ARIA attributes during transitions", () => {
    render(
      <TestWrapper>
        <PageTransition>
          <div role="main" aria-label="Main content">
            <h1>Accessible Content</h1>
          </div>
        </PageTransition>
      </TestWrapper>,
    );

    const mainContent = screen.getByRole("main");
    expect(mainContent).toHaveAttribute("aria-label", "Main content");
  });

  it("preserves focus indicators during transitions", () => {
    render(
      <TestWrapper>
        <PageTransition>
          <button>Focusable Button</button>
        </PageTransition>
      </TestWrapper>,
    );

    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();
  });
});
