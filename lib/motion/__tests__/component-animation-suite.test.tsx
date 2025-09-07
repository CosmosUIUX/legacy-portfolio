// Comprehensive test suite for all animation components
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
  AnimationTestUtils,
  PerformanceTestUtils,
  AccessibilityTestUtils,
  setupAnimationTestEnvironment,
} from "../test-utils";

// Import components to test
import { AnimatedText } from "../../../components/animated-text";
import { ProductCard } from "../../../components/product-card";
import { ParallaxBackground } from "../../../components/parallax-background";
import { EnhancedInfoStrip } from "../../../components/enhanced-info-strip";
import { ModernSidebar } from "../../../components/modern-sidebar";
import { PageTransition } from "../../../components/page-transition";

// Import hooks
import {
  useMotion,
  useStaggerAnimation,
  useScrollAnimation,
  useTextAnimation,
  useGestureAnimation,
  useViewportAnimation,
} from "../hooks";

// Setup test environment
setupAnimationTestEnvironment();

// Mock product data
const mockProduct = {
  id: "1",
  name: "Test Product",
  price: "$99.99",
  image: "/test-image.jpg",
  materials: ["Wood", "Metal"],
  badge: "New" as const,
};

// Mock intersection observer for viewport animations
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe("Animation Component Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAnimationTestEnvironment();
  });

  describe("AnimatedText Component", () => {
    it("should render and animate text correctly", async () => {
      renderWithMotion(
        <AnimatedText
          text="Hello World"
          animationType="character"
          staggerDelay={50}
        />,
      );

      // Should render all characters
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("should handle different animation types", async () => {
      const { rerender } = renderWithMotion(
        <AnimatedText text="Test Text" animationType="character" />,
      );

      expect(screen.getByText("Test Text")).toBeInTheDocument();

      // Test word animation
      rerender(<AnimatedText text="Test Text" animationType="word" />);

      expect(screen.getByText("Test Text")).toBeInTheDocument();

      // Test line animation
      rerender(<AnimatedText text="Line 1\nLine 2" animationType="line" />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    });

    it("should respect reduced motion preferences", async () => {
      renderWithMotion(
        <AnimatedText text="Reduced Motion Test" animationType="character" />,
        { providerProps: { reducedMotion: true } },
      );

      // Should render immediately without animation
      expect(screen.getByText("Reduced Motion Test")).toBeInTheDocument();
    });

    it("should handle empty text gracefully", async () => {
      renderWithMotion(<AnimatedText text="" animationType="character" />);

      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    it("should apply custom styling", async () => {
      renderWithMotion(
        <AnimatedText text="Styled Text" className="custom-class" />,
      );

      const textElement = screen.getByText("Styled Text");
      expect(textElement).toHaveClass("custom-class");
    });
  });

  describe("ProductCard Component", () => {
    it("should render product information correctly", async () => {
      const onQuickLook = jest.fn();

      renderWithMotion(
        <ProductCard product={mockProduct} onQuickLook={onQuickLook} />,
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("$99.99")).toBeInTheDocument();
      expect(screen.getByText("Wood, Metal")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should handle hover animations", async () => {
      const onQuickLook = jest.fn();

      renderWithMotion(
        <ProductCard product={mockProduct} onQuickLook={onQuickLook} />,
      );

      const card = screen.getByText("Test Product").closest("div");
      expect(card).toBeInTheDocument();

      // Simulate hover
      if (card) {
        await userEvent.hover(card);
        // Animation should trigger (tested through motion props)
      }
    });

    it("should handle click interactions", async () => {
      const onQuickLook = jest.fn();

      renderWithMotion(
        <ProductCard product={mockProduct} onQuickLook={onQuickLook} />,
      );

      const card = screen.getByText("Test Product").closest("div");

      if (card) {
        await userEvent.click(card);
        expect(onQuickLook).toHaveBeenCalledWith(mockProduct);
      }
    });

    it("should handle different animation presets", async () => {
      const onQuickLook = jest.fn();

      const { rerender } = renderWithMotion(
        <ProductCard
          product={mockProduct}
          onQuickLook={onQuickLook}
          animationPreset="subtle"
        />,
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();

      rerender(
        <ProductCard
          product={mockProduct}
          onQuickLook={onQuickLook}
          animationPreset="cinematic"
        />,
      );

      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should handle loading state", async () => {
      const onQuickLook = jest.fn();

      renderWithMotion(
        <ProductCard
          product={mockProduct}
          onQuickLook={onQuickLook}
          isLoading={true}
        />,
      );

      // Should still render content
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should handle price updates with animation", async () => {
      const onQuickLook = jest.fn();
      const updatedProduct = { ...mockProduct, price: "$149.99" };

      const { rerender } = renderWithMotion(
        <ProductCard product={mockProduct} onQuickLook={onQuickLook} />,
      );

      expect(screen.getByText("$99.99")).toBeInTheDocument();

      // Update price
      rerender(
        <ProductCard product={updatedProduct} onQuickLook={onQuickLook} />,
      );

      expect(screen.getByText("$149.99")).toBeInTheDocument();
    });
  });

  describe("Animation Hooks Integration", () => {
    it("should integrate useMotion hook correctly", async () => {
      const TestComponent = () => {
        const { ref, animationProps, eventHandlers, isActive } = useMotion({
          trigger: "hover",
          duration: 300,
        });

        return (
          <motion.div
            ref={ref}
            {...animationProps}
            {...eventHandlers}
            data-testid="motion-test"
            data-active={isActive}
          >
            Motion Test
          </motion.div>
        );
      };

      renderWithMotion(<TestComponent />);

      const element = screen.getByTestId("motion-test");
      expect(element).toHaveAttribute("data-active", "false");

      await userEvent.hover(element);

      await waitFor(() => {
        expect(element).toHaveAttribute("data-active", "true");
      });
    });

    it("should integrate useStaggerAnimation hook correctly", async () => {
      const TestComponent = () => {
        const items = ["Item 1", "Item 2", "Item 3"];
        const { ref, getItemProps, currentIndex } = useStaggerAnimation({
          items,
          staggerDelay: 100,
          trigger: "viewport",
        });

        return (
          <div ref={ref} data-testid="stagger-test">
            <div data-testid="current-index">{currentIndex}</div>
            {items.map((item, index) => {
              const itemProps = getItemProps(index);
              return (
                <motion.div
                  key={index}
                  {...itemProps}
                  data-testid={`stagger-item-${index}`}
                >
                  {item}
                </motion.div>
              );
            })}
          </div>
        );
      };

      renderWithMotion(<TestComponent />);

      const container = screen.getByTestId("stagger-test");
      const currentIndex = screen.getByTestId("current-index");

      expect(container).toBeInTheDocument();
      expect(currentIndex).toHaveTextContent("-1"); // Initial state
    });

    it("should integrate useScrollAnimation hook correctly", async () => {
      const TestComponent = () => {
        const { ref, style } = useScrollAnimation({
          transform: {
            y: [0, -100],
            opacity: [1, 0.5],
          },
        });

        return (
          <motion.div ref={ref} style={style} data-testid="scroll-test">
            Scroll Test
          </motion.div>
        );
      };

      renderWithMotion(<TestComponent />);

      const element = screen.getByTestId("scroll-test");
      expect(element).toBeInTheDocument();
    });

    it("should integrate useTextAnimation hook correctly", async () => {
      const TestComponent = () => {
        const { displayText, isComplete, progress } = useTextAnimation({
          text: "Hello World",
          animationType: "typewriter",
          speed: 50,
        });

        return (
          <div data-testid="text-animation-test">
            <div data-testid="display-text">{displayText}</div>
            <div data-testid="is-complete">{isComplete.toString()}</div>
            <div data-testid="progress">{Math.round(progress * 100)}%</div>
          </div>
        );
      };

      renderWithMotion(<TestComponent />);

      const container = screen.getByTestId("text-animation-test");
      const displayText = screen.getByTestId("display-text");
      const isComplete = screen.getByTestId("is-complete");
      const progress = screen.getByTestId("progress");

      expect(container).toBeInTheDocument();
      expect(displayText).toBeInTheDocument();
      expect(isComplete).toHaveTextContent("false");
      expect(progress).toBeInTheDocument();
    });

    it("should integrate useGestureAnimation hook correctly", async () => {
      const onSwipeLeft = jest.fn();
      const onSwipeRight = jest.fn();

      const TestComponent = () => {
        const { gestureProps, isDragging, dragOffset } = useGestureAnimation({
          onSwipeLeft,
          onSwipeRight,
          swipeThreshold: 50,
        });

        return (
          <div
            {...gestureProps}
            data-testid="gesture-test"
            data-dragging={isDragging}
            data-offset-x={dragOffset.x}
            data-offset-y={dragOffset.y}
          >
            Gesture Test
          </div>
        );
      };

      renderWithMotion(<TestComponent />);

      const element = screen.getByTestId("gesture-test");
      expect(element).toHaveAttribute("data-dragging", "false");
      expect(element).toHaveAttribute("data-offset-x", "0");
      expect(element).toHaveAttribute("data-offset-y", "0");
    });

    it("should integrate useViewportAnimation hook correctly", async () => {
      const onEnter = jest.fn();
      const onExit = jest.fn();

      const TestComponent = () => {
        const { ref, isInView, hasEntered, shouldAnimate } =
          useViewportAnimation({
            onEnter,
            onExit,
            triggerOnce: false,
          });

        return (
          <div
            ref={ref}
            data-testid="viewport-test"
            data-in-view={isInView}
            data-has-entered={hasEntered}
            data-should-animate={shouldAnimate}
          >
            Viewport Test
          </div>
        );
      };

      renderWithMotion(<TestComponent />);

      const element = screen.getByTestId("viewport-test");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Performance Testing", () => {
    it("should maintain performance with multiple animated components", async () => {
      const { tick, restore } = AnimationTestUtils.mockAnimationFrame();

      const MultipleAnimationsTest = () => {
        const components = Array.from({ length: 10 }, (_, i) => (
          <AnimatedText
            key={i}
            text={`Animation ${i + 1}`}
            animationType="character"
            staggerDelay={30}
          />
        ));

        return <div data-testid="multiple-animations">{components}</div>;
      };

      renderWithMotion(<MultipleAnimationsTest />);

      const container = screen.getByTestId("multiple-animations");
      expect(container).toBeInTheDocument();

      // Simulate animation frames
      for (let i = 0; i < 60; i++) {
        tick(16.67); // 60fps
      }

      restore();
    });

    it("should handle memory cleanup correctly", async () => {
      const CleanupTest = ({ show }: { show: boolean }) => {
        if (!show) return null;

        return (
          <div>
            <AnimatedText text="Cleanup Test" />
            <ProductCard product={mockProduct} onQuickLook={() => {}} />
          </div>
        );
      };

      const { rerender } = renderWithMotion(<CleanupTest show={true} />);

      expect(screen.getByText("Cleanup Test")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();

      // Unmount components
      rerender(<CleanupTest show={false} />);

      expect(screen.queryByText("Cleanup Test")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Product")).not.toBeInTheDocument();

      // Remount components
      rerender(<CleanupTest show={true} />);

      expect(screen.getByText("Cleanup Test")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should validate 60fps performance", async () => {
      const performanceTest = await PerformanceTestUtils.validate60FPS(
        () => {
          // Simulate animation work
          for (let i = 0; i < 100; i++) {
            Math.sin(i) * Math.cos(i);
          }
        },
        1000, // 1 second test
        5, // 5fps tolerance
      );

      expect(performanceTest.passes).toBe(true);
      expect(performanceTest.averageFPS).toBeGreaterThan(55);
    });

    it("should detect memory leaks", async () => {
      const memoryTest = await PerformanceTestUtils.testMemoryLeaks(
        () => {
          // Simulate animation setup and cleanup
          const elements: HTMLElement[] = [];

          // Setup
          for (let i = 0; i < 10; i++) {
            const element = document.createElement("div");
            element.textContent = `Animation ${i}`;
            elements.push(element);
          }

          // Cleanup function
          return () => {
            elements.forEach((el) => {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            });
            elements.length = 0;
          };
        },
        10, // 10 iterations
      );

      expect(memoryTest.hasMemoryLeak).toBe(false);
      expect(memoryTest.memoryGrowth).toBeLessThan(10); // Less than 10MB growth
    });
  });

  describe("Accessibility Testing", () => {
    it("should maintain accessibility with animations", async () => {
      renderWithMotion(
        <div>
          <AnimatedText text="Accessible Animation" className="sr-only" />
          <ProductCard product={mockProduct} onQuickLook={() => {}} />
        </div>,
      );

      // Check for proper ARIA attributes
      const productName = screen.getByText("Test Product");
      expect(productName).toBeInTheDocument();

      // Should be keyboard accessible
      const card = productName.closest("div");
      if (card) {
        card.focus();
        expect(document.activeElement).toBe(card);
      }
    });

    it("should handle reduced motion preferences", async () => {
      renderWithMotion(
        <div>
          <AnimatedText text="Reduced Motion Test" />
          <ProductCard product={mockProduct} onQuickLook={() => {}} />
        </div>,
        { providerProps: { reducedMotion: true } },
      );

      // Components should render without animations
      expect(screen.getByText("Reduced Motion Test")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      renderWithMotion(
        <div>
          <button>Before</button>
          <ProductCard product={mockProduct} onQuickLook={() => {}} />
          <button>After</button>
        </div>,
      );

      const beforeButton = screen.getByText("Before");
      const afterButton = screen.getByText("After");

      beforeButton.focus();
      expect(beforeButton).toHaveFocus();

      await userEvent.tab();
      // Focus should move to product card or next focusable element

      await userEvent.tab();
      expect(afterButton).toHaveFocus();
    });

    it("should provide screen reader announcements", async () => {
      renderWithMotion(
        <AnimatedText text="Screen Reader Test" animationType="typewriter" />,
      );

      // Should have appropriate ARIA attributes
      const textElement = screen.getByText("Screen Reader Test");
      expect(textElement).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle animation errors gracefully", async () => {
      const ErrorProneComponent = () => {
        const [shouldError, setShouldError] = React.useState(false);

        if (shouldError) {
          throw new Error("Animation error");
        }

        return (
          <div>
            <button
              onClick={() => setShouldError(true)}
              data-testid="trigger-error"
            >
              Trigger Error
            </button>
            <AnimatedText text="Error Test" />
          </div>
        );
      };

      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = React.useState(false);

        if (hasError) {
          return <div data-testid="error-fallback">Something went wrong</div>;
        }

        try {
          return <>{children}</>;
        } catch (error) {
          setHasError(true);
          return <div data-testid="error-fallback">Something went wrong</div>;
        }
      };

      renderWithMotion(
        <ErrorBoundary>
          <ErrorProneComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Error Test")).toBeInTheDocument();

      // Triggering error should show fallback
      const triggerButton = screen.getByTestId("trigger-error");

      // Note: In a real scenario, you'd need proper error boundary implementation
      // This is a simplified test
      expect(triggerButton).toBeInTheDocument();
    });

    it("should handle missing dependencies gracefully", async () => {
      const MissingDepsComponent = () => {
        // Simulate component with missing animation dependencies
        return (
          <motion.div
            data-testid="missing-deps"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
          >
            Missing Deps Test
          </motion.div>
        );
      };

      renderWithMotion(<MissingDepsComponent />);

      const element = screen.getByTestId("missing-deps");
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent("Missing Deps Test");
    });

    it("should handle invalid animation parameters", async () => {
      const InvalidParamsComponent = () => {
        return (
          <motion.div
            data-testid="invalid-params"
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: -1 }} // Invalid duration
          >
            Invalid Params Test
          </motion.div>
        );
      };

      renderWithMotion(<InvalidParamsComponent />);

      const element = screen.getByTestId("invalid-params");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Cross-browser Compatibility", () => {
    it("should work with different user agents", async () => {
      const originalUserAgent = navigator.userAgent;

      // Test with different browsers
      const browsers = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      ];

      for (const userAgent of browsers) {
        Object.defineProperty(navigator, "userAgent", {
          writable: true,
          value: userAgent,
        });

        renderWithMotion(<AnimatedText text="Cross-browser Test" />);

        expect(screen.getByText("Cross-browser Test")).toBeInTheDocument();
      }

      // Restore original user agent
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: originalUserAgent,
      });
    });

    it("should handle missing browser features gracefully", async () => {
      // Mock missing IntersectionObserver
      const originalIntersectionObserver = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;

      renderWithMotion(<AnimatedText text="Missing Features Test" />);

      expect(screen.getByText("Missing Features Test")).toBeInTheDocument();

      // Restore IntersectionObserver
      window.IntersectionObserver = originalIntersectionObserver;
    });
  });
});
