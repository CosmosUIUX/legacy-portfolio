import {
  AnimationLazyLoader,
  ScrollAnimationMemoryManager,
  PerformanceDashboard,
  globalLazyLoader,
  globalMemoryManager,
  globalPerformanceDashboard,
  useLazyAnimation,
  useScrollAnimationMemory,
} from "../performance";

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  callback,
}));

// Mock performance API
Object.defineProperty(global, "performance", {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    },
  },
});

// Mock window properties if needed
if (typeof window !== "undefined") {
  Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
  Object.defineProperty(window, "innerHeight", { writable: true, value: 768 });
}

describe("AnimationLazyLoader", () => {
  let lazyLoader: AnimationLazyLoader;

  beforeEach(() => {
    lazyLoader = new AnimationLazyLoader();
    jest.clearAllMocks();
  });

  afterEach(() => {
    lazyLoader.dispose();
  });

  it("should create intersection observer", () => {
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  it("should track loaded animations", async () => {
    expect(lazyLoader.isLoaded("test-animation")).toBe(false);

    // Mock successful load
    jest
      .spyOn(lazyLoader as any, "dynamicImportAnimation")
      .mockResolvedValue({});

    await lazyLoader.loadAnimation("test-animation");
    expect(lazyLoader.isLoaded("test-animation")).toBe(true);
  });

  it("should handle loading errors gracefully", async () => {
    jest
      .spyOn(lazyLoader as any, "dynamicImportAnimation")
      .mockRejectedValue(new Error("Load failed"));

    await expect(lazyLoader.loadAnimation("failing-animation")).rejects.toThrow(
      "Load failed",
    );
    expect(lazyLoader.isLoaded("failing-animation")).toBe(false);
  });

  it("should observe and unobserve elements", () => {
    const element = document.createElement("div");
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };

    // Replace the observer
    (lazyLoader as any).intersectionObserver = mockObserver;

    lazyLoader.observeElement(element, "test-animation");
    expect(mockObserver.observe).toHaveBeenCalledWith(element);
    expect(element.getAttribute("data-animation-id")).toBe("test-animation");

    lazyLoader.unobserveElement(element);
    expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
  });

  it("should preload animations", async () => {
    jest
      .spyOn(lazyLoader as any, "dynamicImportAnimation")
      .mockResolvedValue({});

    await lazyLoader.preloadAnimation("preload-test");
    expect(lazyLoader.isLoaded("preload-test")).toBe(true);
  });
});

describe("ScrollAnimationMemoryManager", () => {
  let memoryManager: ScrollAnimationMemoryManager;

  beforeEach(() => {
    memoryManager = new ScrollAnimationMemoryManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    memoryManager.dispose();
  });

  it("should register and unregister animations", () => {
    const element = document.createElement("div");
    const cleanup = jest.fn();

    expect(memoryManager.getActiveCount()).toBe(0);

    memoryManager.registerAnimation("test-1", element, cleanup);
    expect(memoryManager.getActiveCount()).toBe(1);

    memoryManager.unregisterAnimation("test-1");
    expect(memoryManager.getActiveCount()).toBe(0);
    expect(cleanup).toHaveBeenCalled();
  });

  it("should update last seen timestamp", () => {
    const element = document.createElement("div");
    const cleanup = jest.fn();

    memoryManager.registerAnimation("test-1", element, cleanup);

    // Should not throw
    memoryManager.updateLastSeen("test-1");
    memoryManager.updateLastSeen("non-existent"); // Should handle gracefully
  });

  it("should enforce maximum active animations", () => {
    const cleanup = jest.fn();

    // Set a lower limit for testing
    (memoryManager as any).maxActiveAnimations = 2;

    // Register 3 animations
    for (let i = 0; i < 3; i++) {
      const element = document.createElement("div");
      memoryManager.registerAnimation(`test-${i}`, element, cleanup);
    }

    // Should only have 2 active (oldest should be removed)
    expect(memoryManager.getActiveCount()).toBe(2);
    expect(cleanup).toHaveBeenCalled();
  });
});

describe("PerformanceDashboard", () => {
  let dashboard: PerformanceDashboard;

  beforeEach(() => {
    dashboard = new PerformanceDashboard();
    jest.clearAllMocks();
  });

  it("should add and retrieve metrics", () => {
    const metric = {
      componentId: "test-component",
      renderTime: 16.67,
      frameRate: 60,
      memoryUsage: 25,
      batteryImpact: "low" as const,
    };

    dashboard.addMetric(metric);

    const metrics = dashboard.getMetrics("test-component");
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toEqual(metric);
  });

  it("should generate performance alerts", () => {
    const lowFrameRateMetric = {
      componentId: "slow-component",
      renderTime: 50,
      frameRate: 25, // Below 30fps threshold
      memoryUsage: 10,
      batteryImpact: "high" as const,
    };

    dashboard.addMetric(lowFrameRateMetric);

    const alerts = dashboard.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].type).toBe("error");
    expect(alerts[0].message).toContain("Low frame rate");
  });

  it("should generate performance summary", () => {
    const metrics = [
      {
        componentId: "comp-1",
        renderTime: 16,
        frameRate: 60,
        memoryUsage: 20,
        batteryImpact: "low" as const,
      },
      {
        componentId: "comp-2",
        renderTime: 20,
        frameRate: 50,
        memoryUsage: 30,
        batteryImpact: "medium" as const,
      },
    ];

    metrics.forEach((metric) => dashboard.addMetric(metric));

    const summary = dashboard.getPerformanceSummary();
    expect(summary).toBeDefined();
    expect(summary?.averageFrameRate).toBe(55); // (60 + 50) / 2
    expect(summary?.averageMemoryUsage).toBe(25); // (20 + 30) / 2
    expect(summary?.totalComponents).toBe(1); // Unique components
  });

  it("should export metrics as JSON", () => {
    const metric = {
      componentId: "test-component",
      renderTime: 16.67,
      frameRate: 60,
      memoryUsage: 25,
      batteryImpact: "low" as const,
    };

    dashboard.addMetric(metric);

    const exported = dashboard.exportMetrics();
    const parsed = JSON.parse(exported);

    expect(parsed).toHaveProperty("timestamp");
    expect(parsed).toHaveProperty("summary");
    expect(parsed).toHaveProperty("metrics");
    expect(parsed).toHaveProperty("alerts");
  });

  it("should clear data", () => {
    const metric = {
      componentId: "test-component",
      renderTime: 16.67,
      frameRate: 60,
      memoryUsage: 25,
      batteryImpact: "low" as const,
    };

    dashboard.addMetric(metric);
    expect(dashboard.getMetrics()).toHaveLength(1);

    dashboard.clearData();
    expect(dashboard.getMetrics()).toHaveLength(0);
    expect(dashboard.getAlerts()).toHaveLength(0);
  });

  it("should limit stored metrics per component", () => {
    const baseMetric = {
      componentId: "test-component",
      renderTime: 16.67,
      frameRate: 60,
      memoryUsage: 25,
      batteryImpact: "low" as const,
    };

    // Add more than 100 metrics
    for (let i = 0; i < 150; i++) {
      dashboard.addMetric({ ...baseMetric });
    }

    const metrics = dashboard.getMetrics("test-component");
    expect(metrics.length).toBeLessThanOrEqual(100);
  });
});

describe("Global instances", () => {
  it("should provide global lazy loader instance", () => {
    expect(globalLazyLoader).toBeInstanceOf(AnimationLazyLoader);
  });

  it("should provide global memory manager instance", () => {
    expect(globalMemoryManager).toBeInstanceOf(ScrollAnimationMemoryManager);
  });

  it("should provide global performance dashboard instance", () => {
    expect(globalPerformanceDashboard).toBeInstanceOf(PerformanceDashboard);
  });
});
