import React from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { MotionProvider } from "./provider";
import { AnimationMetrics } from "./types";

/**
 * Custom render function with Motion.dev provider
 */
export function renderWithMotion(
  ui: React.ReactElement,
  options?: {
    providerProps?: {
      reducedMotion?: boolean;
      performanceMode?: "high" | "balanced" | "battery";
      enablePerformanceMonitoring?: boolean;
    };
    renderOptions?: Omit<RenderOptions, "wrapper">;
  },
): RenderResult {
  const { providerProps = {}, renderOptions = {} } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MotionProvider {...providerProps}>{children}</MotionProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock performance observer for testing
 */
export class MockPerformanceObserver {
  private callback: PerformanceObserverCallback;
  private entries: PerformanceEntry[] = [];

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe(options: PerformanceObserverInit) {
    // Mock implementation
  }

  disconnect() {
    this.entries = [];
  }

  takeRecords(): PerformanceEntryList {
    return this.entries;
  }

  // Test helper to add mock entries
  addEntry(entry: Partial<PerformanceEntry>) {
    const mockEntry: PerformanceEntry = {
      name: "test-entry",
      entryType: "measure",
      startTime: 0,
      duration: 16.67,
      toJSON: () => ({}),
      ...entry,
    };
    this.entries.push(mockEntry);

    // Trigger callback
    this.callback(
      {
        getEntries: () => [mockEntry],
        getEntriesByName: (name: string) =>
          this.entries.filter((e) => e.name === name),
        getEntriesByType: (type: string) =>
          this.entries.filter((e) => e.entryType === type),
      } as PerformanceObserverEntryList,
      this,
    );
  }
}

/**
 * Mock intersection observer for testing
 */
export class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  private elements: Map<Element, IntersectionObserverEntry> = new Map();

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
  }

  observe(element: Element) {
    const entry: IntersectionObserverEntry = {
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      intersectionRect: element.getBoundingClientRect(),
      boundingClientRect: element.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    };
    this.elements.set(element, entry);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Test helper to trigger intersection
  triggerIntersection(element: Element, isIntersecting: boolean = true) {
    const entry = this.elements.get(element);
    if (entry) {
      const updatedEntry = { ...entry, isIntersecting };
      this.elements.set(element, updatedEntry);
      this.callback([updatedEntry], this);
    }
  }

  // Test helper to trigger all intersections
  triggerAllIntersections(isIntersecting: boolean = true) {
    const entries = Array.from(this.elements.values()).map((entry) => ({
      ...entry,
      isIntersecting,
    }));
    if (entries.length > 0) {
      this.callback(entries, this);
    }
  }
}

/**
 * Animation test utilities
 */
export class AnimationTestUtils {
  /**
   * Wait for animation to complete
   */
  static async waitForAnimation(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * Mock requestAnimationFrame for testing
   */
  static mockAnimationFrame(): {
    tick: (time?: number) => void;
    restore: () => void;
  } {
    const originalRAF = global.requestAnimationFrame;
    const originalCAF = global.cancelAnimationFrame;

    let callbacks: Array<{ id: number; callback: FrameRequestCallback }> = [];
    let nextId = 1;
    let currentTime = 0;

    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const id = nextId++;
      callbacks.push({ id, callback });
      return id;
    });

    global.cancelAnimationFrame = jest.fn((id: number) => {
      callbacks = callbacks.filter((cb) => cb.id !== id);
    });

    const tick = (time: number = 16.67) => {
      currentTime += time;
      const currentCallbacks = [...callbacks];
      callbacks = [];

      currentCallbacks.forEach(({ callback }) => {
        callback(currentTime);
      });
    };

    const restore = () => {
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCAF;
    };

    return { tick, restore };
  }

  /**
   * Create mock animation metrics
   */
  static createMockMetrics(
    overrides: Partial<AnimationMetrics> = {},
  ): AnimationMetrics {
    return {
      componentId: "test-component",
      renderTime: 16.67,
      frameRate: 60,
      memoryUsage: 25,
      batteryImpact: "low",
      ...overrides,
    };
  }

  /**
   * Simulate performance issues
   */
  static simulatePerformanceIssue(
    type: "low-fps" | "high-memory" | "slow-render",
  ): AnimationMetrics {
    switch (type) {
      case "low-fps":
        return this.createMockMetrics({
          frameRate: 25,
          batteryImpact: "high",
        });
      case "high-memory":
        return this.createMockMetrics({
          memoryUsage: 150,
          batteryImpact: "high",
        });
      case "slow-render":
        return this.createMockMetrics({
          renderTime: 50,
          frameRate: 40,
          batteryImpact: "medium",
        });
      default:
        return this.createMockMetrics();
    }
  }

  /**
   * Test frame rate consistency
   */
  static testFrameRate(
    callback: () => void,
    duration: number = 1000,
    targetFPS: number = 60,
  ): Promise<{ averageFPS: number; isConsistent: boolean }> {
    return new Promise((resolve) => {
      const frames: number[] = [];
      let startTime = performance.now();
      let lastFrameTime = startTime;

      const measureFrame = () => {
        const now = performance.now();
        const frameDuration = now - lastFrameTime;
        frames.push(1000 / frameDuration); // Convert to FPS
        lastFrameTime = now;

        callback();

        if (now - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const averageFPS =
            frames.reduce((sum, fps) => sum + fps, 0) / frames.length;
          const isConsistent = frames.every(
            (fps) => Math.abs(fps - targetFPS) < 10,
          );
          resolve({ averageFPS, isConsistent });
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Test memory usage during animations
   */
  static async testMemoryUsage(
    animationCallback: () => void,
    duration: number = 1000,
  ): Promise<{
    initialMemory: number;
    peakMemory: number;
    finalMemory: number;
  }> {
    const getMemoryUsage = () => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    };

    const initialMemory = getMemoryUsage();
    let peakMemory = initialMemory;

    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkMemory = () => {
        const currentMemory = getMemoryUsage();
        peakMemory = Math.max(peakMemory, currentMemory);

        animationCallback();

        if (Date.now() - startTime < duration) {
          setTimeout(checkMemory, 16); // Check every frame
        } else {
          const finalMemory = getMemoryUsage();
          resolve({
            initialMemory: initialMemory / 1024 / 1024, // Convert to MB
            peakMemory: peakMemory / 1024 / 1024,
            finalMemory: finalMemory / 1024 / 1024,
          });
        }
      };

      checkMemory();
    });
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityTestUtils {
  /**
   * Test reduced motion compliance
   */
  static testReducedMotion(element: HTMLElement): {
    hasReducedMotionStyles: boolean;
    animationDuration: string;
    transitionDuration: string;
  } {
    const computedStyle = window.getComputedStyle(element);

    return {
      hasReducedMotionStyles: element.classList.contains("reduced-motion"),
      animationDuration: computedStyle.animationDuration,
      transitionDuration: computedStyle.transitionDuration,
    };
  }

  /**
   * Test ARIA attributes
   */
  static testAriaAttributes(element: HTMLElement): {
    hasAriaLabel: boolean;
    hasAriaDescription: boolean;
    hasAriaLive: boolean;
    isBusy: boolean;
    isHidden: boolean;
  } {
    return {
      hasAriaLabel: element.hasAttribute("aria-label"),
      hasAriaDescription: element.hasAttribute("aria-describedby"),
      hasAriaLive: element.hasAttribute("aria-live"),
      isBusy: element.getAttribute("aria-busy") === "true",
      isHidden: element.getAttribute("aria-hidden") === "true",
    };
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(
    element: HTMLElement,
    keys: string[] = ["Tab", "Enter", " ", "Escape"],
  ): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const key of keys) {
      try {
        element.focus();

        const event = new KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        });

        const handled = !element.dispatchEvent(event);
        results[key] = handled || document.activeElement === element;
      } catch (error) {
        results[key] = false;
      }
    }

    return results;
  }

  /**
   * Test focus management during animations
   */
  static async testFocusManagement(
    animationTrigger: () => void,
    expectedFocusElement?: HTMLElement,
  ): Promise<{
    focusPreserved: boolean;
    focusElement: Element | null;
  }> {
    const initialFocus = document.activeElement;

    animationTrigger();

    // Wait for animation to potentially affect focus
    await new Promise((resolve) => setTimeout(resolve, 100));

    const finalFocus = document.activeElement;
    const expectedElement = expectedFocusElement || initialFocus;

    return {
      focusPreserved: finalFocus === expectedElement,
      focusElement: finalFocus,
    };
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Validate 60fps requirement
   */
  static async validate60FPS(
    animationCallback: () => void,
    duration: number = 1000,
    tolerance: number = 5,
  ): Promise<{ passes: boolean; averageFPS: number; minFPS: number }> {
    const result = await AnimationTestUtils.testFrameRate(
      animationCallback,
      duration,
      60,
    );

    // Calculate minimum FPS from frame measurements
    const frames: number[] = [];
    let frameCount = 0;
    let startTime = performance.now();
    let minFPS = 60;

    return new Promise((resolve) => {
      const measureFrame = () => {
        const now = performance.now();
        frameCount++;

        if (frameCount > 1) {
          const fps = 1000 / (now - startTime);
          frames.push(fps);
          minFPS = Math.min(minFPS, fps);
        }

        startTime = now;
        animationCallback();

        if (frames.length < duration / 16) {
          // Approximate frame count
          requestAnimationFrame(measureFrame);
        } else {
          const averageFPS =
            frames.reduce((sum, fps) => sum + fps, 0) / frames.length;
          const passes =
            averageFPS >= 60 - tolerance && minFPS >= 60 - tolerance * 2;

          resolve({
            passes,
            averageFPS: Math.round(averageFPS),
            minFPS: Math.round(minFPS),
          });
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Test memory leak detection
   */
  static async testMemoryLeaks(
    setupAnimation: () => () => void, // Returns cleanup function
    iterations: number = 10,
  ): Promise<{
    hasMemoryLeak: boolean;
    memoryGrowth: number;
    initialMemory: number;
    finalMemory: number;
  }> {
    const getMemoryUsage = () => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    };

    // Force garbage collection if available
    const forceGC = () => {
      if ((global as any).gc) {
        (global as any).gc();
      }
    };

    forceGC();
    const initialMemory = getMemoryUsage();

    const cleanupFunctions: (() => void)[] = [];

    // Create and cleanup animations multiple times
    for (let i = 0; i < iterations; i++) {
      const cleanup = setupAnimation();
      cleanupFunctions.push(cleanup);

      // Simulate some animation time
      await new Promise((resolve) => setTimeout(resolve, 50));

      cleanup();
    }

    // Force cleanup and garbage collection
    cleanupFunctions.forEach((cleanup) => cleanup());
    forceGC();

    // Wait for GC to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    const finalMemory = getMemoryUsage();
    const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB

    // Consider it a leak if memory grew by more than 10MB
    const hasMemoryLeak = memoryGrowth > 10;

    return {
      hasMemoryLeak,
      memoryGrowth,
      initialMemory: initialMemory / 1024 / 1024,
      finalMemory: finalMemory / 1024 / 1024,
    };
  }

  /**
   * Test animation performance under load
   */
  static async testPerformanceUnderLoad(
    animationCallback: () => void,
    loadSimulation: () => void,
    duration: number = 2000,
  ): Promise<{
    baselinePerformance: { fps: number; renderTime: number };
    loadedPerformance: { fps: number; renderTime: number };
    performanceDegradation: number;
  }> {
    // Measure baseline performance
    const baseline = await AnimationTestUtils.testFrameRate(
      animationCallback,
      duration / 2,
      60,
    );

    // Start load simulation
    const loadInterval = setInterval(loadSimulation, 10);

    // Measure performance under load
    const loaded = await AnimationTestUtils.testFrameRate(
      animationCallback,
      duration / 2,
      60,
    );

    clearInterval(loadInterval);

    const performanceDegradation =
      ((baseline.averageFPS - loaded.averageFPS) / baseline.averageFPS) * 100;

    return {
      baselinePerformance: {
        fps: baseline.averageFPS,
        renderTime: 1000 / baseline.averageFPS,
      },
      loadedPerformance: {
        fps: loaded.averageFPS,
        renderTime: 1000 / loaded.averageFPS,
      },
      performanceDegradation,
    };
  }
}

/**
 * Setup global test environment
 */
export function setupAnimationTestEnvironment() {
  // Mock performance API
  if (!(global as any).performance) {
    (global as any).performance = {
      now: jest.fn(() => Date.now()),
      getEntriesByType: jest.fn(() => []),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
      },
    };
  }

  // Mock IntersectionObserver
  if (!(global as any).IntersectionObserver) {
    (global as any).IntersectionObserver = MockIntersectionObserver;
  }

  // Mock PerformanceObserver
  if (!(global as any).PerformanceObserver) {
    (global as any).PerformanceObserver = MockPerformanceObserver;
  }

  // Mock matchMedia for reduced motion testing
  if (!(global as any).matchMedia) {
    (global as any).matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  }

  // Mock requestAnimationFrame
  if (!(global as any).requestAnimationFrame) {
    (global as any).requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
    (global as any).cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
  }
}
