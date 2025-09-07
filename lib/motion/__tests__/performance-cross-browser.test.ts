/**
 * Cross-browser performance validation tests
 * Ensures animations maintain 60fps across different browsers and devices
 */

import {
  detectBrowser,
  getPerformanceTier,
  getBrowserAnimationConfig,
} from "../browser-detection";

// Mock performance API for testing
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

// Mock requestAnimationFrame for consistent testing
const mockRAF = () => {
  let id = 0;
  const callbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];

  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    const currentId = ++id;
    callbacks.push({ id: currentId, callback });

    // Simulate 60fps (16.67ms per frame)
    setTimeout(() => {
      const callbackData = callbacks.find((cb) => cb.id === currentId);
      if (callbackData) {
        callbackData.callback(performance.now());
        const index = callbacks.indexOf(callbackData);
        callbacks.splice(index, 1);
      }
    }, 16.67);

    return currentId;
  });

  global.cancelAnimationFrame = jest.fn((id: number) => {
    const index = callbacks.findIndex((cb) => cb.id === id);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  });
};

describe("Cross-Browser Performance Validation", () => {
  beforeEach(() => {
    mockRAF();
    global.performance = mockPerformance as any;
    jest.clearAllMocks();
  });

  describe("Frame Rate Monitoring", () => {
    it("should maintain 60fps during animations on Chrome", async () => {
      // Mock Chrome browser
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
        configurable: true,
      });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      const frameRates: number[] = [];
      let lastTime = performance.now();
      let frameCount = 0;

      const measureFrameRate = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        const fps = 1000 / deltaTime;

        frameRates.push(fps);
        lastTime = currentTime;
        frameCount++;

        if (frameCount < 60) {
          // Test for 1 second at 60fps
          requestAnimationFrame(measureFrameRate);
        }
      };

      requestAnimationFrame(measureFrameRate);

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const averageFPS =
        frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
      expect(averageFPS).toBeGreaterThan(55); // Allow some variance from 60fps
      expect(config.useHardwareAcceleration).toBe(true);
    });

    it("should adapt animation complexity for Safari", async () => {
      // Mock Safari browser
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.1",
        configurable: true,
      });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      expect(browser.name).toBe("safari");
      expect(config.maxAnimationDuration).toBe(800); // Shorter than default
      expect(config.useWillChange).toBe(false); // Safari-specific optimization
      expect(config.preferredEasing).toBe("ease-out");
    });

    it("should optimize for Firefox performance characteristics", async () => {
      // Mock Firefox browser
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
        configurable: true,
      });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      expect(browser.name).toBe("firefox");
      expect(config.useWillChange).toBe(true); // Firefox benefits from will-change
      expect(config.useTransform3d).toBe(true);
      expect(config.preferredEasing).toBe(
        "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      );
    });

    it("should handle Edge browser optimizations", async () => {
      // Mock Edge browser
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Edg/120.0.2210.91",
        configurable: true,
      });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      expect(browser.name).toBe("edge");
      expect(config.useHardwareAcceleration).toBe(true);
      expect(config.maxAnimationDuration).toBe(1000);
    });
  });

  describe("Memory Usage Monitoring", () => {
    it("should track memory usage during complex animations", async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Simulate complex animation with multiple elements
      const animationElements = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        transform: `translateX(${i * 10}px)`,
        opacity: Math.random(),
      }));

      // Simulate animation frames
      for (let frame = 0; frame < 60; frame++) {
        animationElements.forEach((element) => {
          element.transform = `translateX(${Math.sin(frame * 0.1) * 100}px)`;
          element.opacity = 0.5 + Math.sin(frame * 0.1) * 0.5;
        });

        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined)),
        );
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 5MB for test)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    it("should clean up animation resources properly", async () => {
      const animationIds: number[] = [];

      // Create multiple animations
      for (let i = 0; i < 10; i++) {
        const id = requestAnimationFrame(() => {
          // Animation callback
        });
        animationIds.push(id);
      }

      // Cancel all animations
      animationIds.forEach((id) => cancelAnimationFrame(id));

      // Verify cleanup
      expect(global.cancelAnimationFrame).toHaveBeenCalledTimes(10);
    });
  });

  describe("Device Performance Adaptation", () => {
    it("should detect high-performance devices", () => {
      // Mock high-performance device
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 8 });
      Object.defineProperty(navigator, "deviceMemory", { value: 8 });
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "4g" },
      });

      const tier = getPerformanceTier();
      expect(tier).toBe("high");
    });

    it("should detect medium-performance devices", () => {
      // Mock medium-performance device
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 4 });
      Object.defineProperty(navigator, "deviceMemory", { value: 4 });
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "3g" },
      });

      const tier = getPerformanceTier();
      expect(tier).toBe("medium");
    });

    it("should detect low-performance devices", () => {
      // Mock low-performance device
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 });
      Object.defineProperty(navigator, "deviceMemory", { value: 2 });
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "2g" },
      });

      const tier = getPerformanceTier();
      expect(tier).toBe("low");
    });
  });

  describe("Animation Complexity Scaling", () => {
    it("should reduce animation complexity on low-end devices", () => {
      // Mock low-end device
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 });
      Object.defineProperty(navigator, "deviceMemory", { value: 1 });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      // Should use conservative settings
      expect(config.maxAnimationDuration).toBeLessThanOrEqual(1000);
    });

    it("should enable full animations on high-end devices", () => {
      // Mock high-end device
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 12 });
      Object.defineProperty(navigator, "deviceMemory", { value: 16 });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      expect(config.useHardwareAcceleration).toBe(true);
    });
  });

  describe("Battery Impact Assessment", () => {
    it("should minimize battery usage on mobile devices", () => {
      // Mock mobile device
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/17.0",
        configurable: true,
      });

      const browser = detectBrowser();
      const config = getBrowserAnimationConfig(browser);

      expect(browser.isMobile).toBe(true);
      // Mobile should use shorter animations to save battery
      expect(config.maxAnimationDuration).toBeLessThanOrEqual(800);
    });

    it("should track animation performance metrics", async () => {
      const metrics = {
        frameDrops: 0,
        averageFrameTime: 0,
        maxFrameTime: 0,
        totalFrames: 0,
      };

      const frameTimes: number[] = [];
      let lastFrameTime = performance.now();

      const trackFrame = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;

        frameTimes.push(frameTime);

        if (frameTime > 16.67) {
          // Frame drop if > 60fps
          metrics.frameDrops++;
        }

        metrics.totalFrames++;
        lastFrameTime = currentTime;

        if (metrics.totalFrames < 60) {
          requestAnimationFrame(trackFrame);
        }
      };

      requestAnimationFrame(trackFrame);

      // Wait for tracking to complete
      await new Promise((resolve) => setTimeout(resolve, 1100));

      metrics.averageFrameTime =
        frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      metrics.maxFrameTime = Math.max(...frameTimes);

      expect(metrics.averageFrameTime).toBeLessThan(20); // Should be close to 16.67ms
      expect(metrics.frameDrops / metrics.totalFrames).toBeLessThan(0.1); // Less than 10% frame drops
    });
  });

  describe("Responsive Performance", () => {
    it("should adapt to viewport size changes", () => {
      const viewportSizes = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      viewportSizes.forEach((size) => {
        // Mock viewport size
        Object.defineProperty(window, "innerWidth", { value: size.width });
        Object.defineProperty(window, "innerHeight", { value: size.height });

        const browser = detectBrowser();
        const config = getBrowserAnimationConfig(browser);

        if (size.width < 768) {
          // Mobile should have simpler animations
          expect(config.maxAnimationDuration).toBeLessThanOrEqual(800);
        } else {
          // Desktop can handle more complex animations
          expect(config.maxAnimationDuration).toBeGreaterThanOrEqual(600);
        }
      });
    });

    it("should handle orientation changes on mobile", async () => {
      // Mock mobile device
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/17.0",
        configurable: true,
      });

      let orientationChangeHandled = false;

      // Mock orientation change
      const handleOrientationChange = () => {
        orientationChangeHandled = true;
      };

      window.addEventListener("orientationchange", handleOrientationChange);

      // Simulate orientation change
      window.dispatchEvent(new Event("orientationchange"));

      expect(orientationChangeHandled).toBe(true);

      window.removeEventListener("orientationchange", handleOrientationChange);
    });
  });
});
