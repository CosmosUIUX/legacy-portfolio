"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationMetrics } from "./types";

/**
 * Performance monitoring hook for animations
 */
export function useAnimationPerformance(
  componentId: string,
  enabled: boolean = true,
) {
  const [metrics, setMetrics] = useState<AnimationMetrics | null>(null);
  const frameCount = useRef(0);
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const measurePerformance = () => {
      const now = performance.now();

      if (startTime.current === 0) {
        startTime.current = now;
      }

      frameCount.current++;

      // Calculate metrics every 60 frames (approximately 1 second at 60fps)
      if (frameCount.current >= 60) {
        const elapsed = now - startTime.current;
        const frameRate = Math.round((frameCount.current * 1000) / elapsed);

        // Get memory usage if available
        const memoryUsage = (performance as any).memory
          ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
          : 0;

        // Determine battery impact based on frame rate and memory usage
        let batteryImpact: "low" | "medium" | "high" = "low";
        if (frameRate < 30 || memoryUsage > 50) {
          batteryImpact = "high";
        } else if (frameRate < 50 || memoryUsage > 25) {
          batteryImpact = "medium";
        }

        setMetrics({
          componentId,
          renderTime: elapsed / frameCount.current,
          frameRate,
          memoryUsage,
          batteryImpact,
        });

        // Reset counters
        frameCount.current = 0;
        startTime.current = now;
      }

      animationFrame.current = requestAnimationFrame(measurePerformance);
    };

    animationFrame.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [componentId, enabled]);

  return metrics;
}

/**
 * Performance observer for animation-related metrics
 */
export class AnimationPerformanceObserver {
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: Map<string, AnimationMetrics[]> = new Map();

  startObserving(componentId: string) {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();

        entries.forEach((entry) => {
          if (
            entry.entryType === "measure" &&
            entry.name.includes(componentId)
          ) {
            const existingMetrics = this.metrics.get(componentId) || [];

            const newMetric: AnimationMetrics = {
              componentId,
              renderTime: entry.duration,
              frameRate: 60, // Default assumption
              memoryUsage: 0, // Will be updated by other methods
              batteryImpact: entry.duration > 16 ? "high" : "low", // 16ms = 60fps threshold
            };

            existingMetrics.push(newMetric);
            this.metrics.set(componentId, existingMetrics.slice(-10)); // Keep last 10 measurements
          }
        });
      });

      observer.observe({ entryTypes: ["measure", "navigation", "paint"] });
      this.observers.set(componentId, observer);
    } catch (error) {
      console.warn(
        "Performance Observer not supported or failed to initialize:",
        error,
      );
    }
  }

  stopObserving(componentId: string) {
    const observer = this.observers.get(componentId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(componentId);
    }
  }

  getMetrics(componentId: string): AnimationMetrics[] {
    return this.metrics.get(componentId) || [];
  }

  getAverageMetrics(componentId: string): AnimationMetrics | null {
    const metrics = this.getMetrics(componentId);
    if (metrics.length === 0) return null;

    const avg = metrics.reduce(
      (acc, metric) => ({
        componentId,
        renderTime: acc.renderTime + metric.renderTime,
        frameRate: acc.frameRate + metric.frameRate,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        batteryImpact: "medium" as const, // Will be recalculated
      }),
      {
        componentId,
        renderTime: 0,
        frameRate: 0,
        memoryUsage: 0,
        batteryImpact: "low" as const,
      },
    );

    const count = metrics.length;
    const avgMetrics: AnimationMetrics = {
      componentId,
      renderTime: avg.renderTime / count,
      frameRate: avg.frameRate / count,
      memoryUsage: avg.memoryUsage / count,
      batteryImpact:
        avg.frameRate / count < 30
          ? "high"
          : avg.frameRate / count < 50
            ? "medium"
            : "low",
    };

    return avgMetrics;
  }

  clearMetrics(componentId?: string) {
    if (componentId) {
      this.metrics.delete(componentId);
    } else {
      this.metrics.clear();
    }
  }
}

// Global performance observer instance
export const globalPerformanceObserver = new AnimationPerformanceObserver();

/**
 * Hook to monitor frame rate during animations
 */
export function useFrameRate(): number {
  const [frameRate, setFrameRate] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        // Measure every second
        setFrameRate(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      } else {
        frameCount.current++;
      }

      animationId = requestAnimationFrame(measureFrameRate);
    };

    animationId = requestAnimationFrame(measureFrameRate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return frameRate;
}

/**
 * Lazy loading manager for complex animations
 */
export class AnimationLazyLoader {
  private loadedAnimations: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private intersectionObserver?: IntersectionObserver;

  constructor() {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const animationId =
                entry.target.getAttribute("data-animation-id");
              if (animationId) {
                this.loadAnimation(animationId);
              }
            }
          });
        },
        { rootMargin: "50px" }, // Load animations 50px before they come into view
      );
    }
  }

  async loadAnimation(animationId: string): Promise<any> {
    if (this.loadedAnimations.has(animationId)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(animationId)) {
      return this.loadingPromises.get(animationId);
    }

    const loadPromise = this.dynamicImportAnimation(animationId);
    this.loadingPromises.set(animationId, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedAnimations.add(animationId);
      this.loadingPromises.delete(animationId);
      return result;
    } catch (error) {
      this.loadingPromises.delete(animationId);
      console.error(`Failed to load animation ${animationId}:`, error);
      throw error;
    }
  }

  private async dynamicImportAnimation(animationId: string): Promise<any> {
    // Dynamic imports for different animation types
    switch (animationId) {
      case "parallax":
      case "stagger":
      case "morphing":
      case "particles":
        // Animation modules would be imported here when available
        return Promise.resolve(null);
      default:
        return Promise.resolve(null);
    }
  }

  observeElement(element: HTMLElement, animationId: string) {
    if (this.intersectionObserver) {
      element.setAttribute("data-animation-id", animationId);
      this.intersectionObserver.observe(element);
    }
  }

  unobserveElement(element: HTMLElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  isLoaded(animationId: string): boolean {
    return this.loadedAnimations.has(animationId);
  }

  preloadAnimation(animationId: string): Promise<any> {
    return this.loadAnimation(animationId);
  }

  dispose() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.loadedAnimations.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Memory management for scroll-triggered animations
 */
export class ScrollAnimationMemoryManager {
  private activeAnimations: Map<
    string,
    {
      element: HTMLElement;
      cleanup: () => void;
      lastSeen: number;
    }
  > = new Map();

  private cleanupInterval?: NodeJS.Timeout;
  private maxActiveAnimations = 20;
  private cleanupThreshold = 30000; // 30 seconds

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveAnimations();
    }, 10000); // Check every 10 seconds
  }

  registerAnimation(id: string, element: HTMLElement, cleanup: () => void) {
    // If we're at capacity, remove oldest animation
    if (this.activeAnimations.size >= this.maxActiveAnimations) {
      this.removeOldestAnimation();
    }

    this.activeAnimations.set(id, {
      element,
      cleanup,
      lastSeen: Date.now(),
    });
  }

  updateLastSeen(id: string) {
    const animation = this.activeAnimations.get(id);
    if (animation) {
      animation.lastSeen = Date.now();
    }
  }

  unregisterAnimation(id: string) {
    const animation = this.activeAnimations.get(id);
    if (animation) {
      animation.cleanup();
      this.activeAnimations.delete(id);
    }
  }

  private cleanupInactiveAnimations() {
    const now = Date.now();
    const toRemove: string[] = [];

    this.activeAnimations.forEach((animation, id) => {
      // Check if element is still in viewport or recently seen
      const isInViewport = this.isElementInViewport(animation.element);
      const isRecent = now - animation.lastSeen < this.cleanupThreshold;

      if (!isInViewport && !isRecent) {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => this.unregisterAnimation(id));
  }

  private removeOldestAnimation() {
    let oldestId = "";
    let oldestTime = Date.now();

    this.activeAnimations.forEach((animation, id) => {
      if (animation.lastSeen < oldestTime) {
        oldestTime = animation.lastSeen;
        oldestId = id;
      }
    });

    if (oldestId) {
      this.unregisterAnimation(oldestId);
    }
  }

  private isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }

  getActiveCount(): number {
    return this.activeAnimations.size;
  }

  dispose() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Cleanup all active animations
    this.activeAnimations.forEach((animation) => {
      animation.cleanup();
    });
    this.activeAnimations.clear();
  }
}

/**
 * Performance monitoring dashboard
 */
export class PerformanceDashboard {
  private metrics: Map<string, AnimationMetrics[]> = new Map();
  private alerts: Array<{
    timestamp: number;
    type: "warning" | "error";
    message: string;
    componentId?: string;
  }> = [];

  addMetric(metric: AnimationMetrics) {
    const existing = this.metrics.get(metric.componentId) || [];
    existing.push(metric);

    // Keep only last 100 metrics per component
    if (existing.length > 100) {
      existing.shift();
    }

    this.metrics.set(metric.componentId, existing);

    // Check for performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: AnimationMetrics) {
    const now = Date.now();

    // Check frame rate
    if (metric.frameRate < 30) {
      this.alerts.push({
        timestamp: now,
        type: "error",
        message: `Low frame rate detected: ${metric.frameRate}fps`,
        componentId: metric.componentId,
      });
    } else if (metric.frameRate < 50) {
      this.alerts.push({
        timestamp: now,
        type: "warning",
        message: `Suboptimal frame rate: ${metric.frameRate}fps`,
        componentId: metric.componentId,
      });
    }

    // Check memory usage
    if (metric.memoryUsage > 100) {
      this.alerts.push({
        timestamp: now,
        type: "error",
        message: `High memory usage: ${metric.memoryUsage.toFixed(1)}MB`,
        componentId: metric.componentId,
      });
    } else if (metric.memoryUsage > 50) {
      this.alerts.push({
        timestamp: now,
        type: "warning",
        message: `Elevated memory usage: ${metric.memoryUsage.toFixed(1)}MB`,
        componentId: metric.componentId,
      });
    }

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  getMetrics(componentId?: string): AnimationMetrics[] {
    if (componentId) {
      return this.metrics.get(componentId) || [];
    }

    // Return all metrics
    const allMetrics: AnimationMetrics[] = [];
    this.metrics.forEach((metrics) => allMetrics.push(...metrics));
    return allMetrics;
  }

  getAlerts(since?: number): typeof this.alerts {
    if (since) {
      return this.alerts.filter((alert) => alert.timestamp > since);
    }
    return [...this.alerts];
  }

  getPerformanceSummary() {
    const allMetrics = this.getMetrics();
    if (allMetrics.length === 0) {
      return null;
    }

    const avgFrameRate =
      allMetrics.reduce((sum, m) => sum + m.frameRate, 0) / allMetrics.length;
    const avgMemory =
      allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / allMetrics.length;
    const avgRenderTime =
      allMetrics.reduce((sum, m) => sum + m.renderTime, 0) / allMetrics.length;

    const recentAlerts = this.getAlerts(Date.now() - 300000); // Last 5 minutes
    const errorCount = recentAlerts.filter((a) => a.type === "error").length;
    const warningCount = recentAlerts.filter(
      (a) => a.type === "warning",
    ).length;

    return {
      averageFrameRate: Math.round(avgFrameRate),
      averageMemoryUsage: Math.round(avgMemory * 10) / 10,
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      totalComponents: this.metrics.size,
      recentErrors: errorCount,
      recentWarnings: warningCount,
      overallHealth:
        errorCount > 0 ? "poor" : warningCount > 3 ? "fair" : "good",
    };
  }

  exportMetrics(): string {
    const summary = this.getPerformanceSummary();
    const allMetrics = this.getMetrics();
    const recentAlerts = this.getAlerts();

    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary,
        metrics: allMetrics,
        alerts: recentAlerts,
      },
      null,
      2,
    );
  }

  clearData() {
    this.metrics.clear();
    this.alerts = [];
  }
}

/**
 * Bundle optimization utilities
 */
export const BundleOptimizer = {
  // Lazy load Motion.dev components
  async loadMotionComponent(componentName: string) {
    try {
      switch (componentName) {
        case "motion":
          return (await import("@/lib/motion")).motion;
        case "AnimatePresence":
          return (await import("@/lib/motion")).AnimatePresence;
        case "useMotionValue":
          return (await import("@/lib/motion")).useMotionValue;
        case "useSpring":
          return (await import("@/lib/motion")).useSpring;
        case "useTransform":
          return (await import("@/lib/motion")).useTransform;
        case "useAnimation":
          return (await import("@/lib/motion")).useAnimation;
        default:
          throw new Error(`Unknown component: ${componentName}`);
      }
    } catch (error) {
      console.error(
        `Failed to load Motion.dev component ${componentName}:`,
        error,
      );
      return null;
    }
  },

  // Check if Motion.dev is already loaded
  isMotionLoaded(): boolean {
    return typeof window !== "undefined" && "motion" in window;
  },

  // Preload critical Motion.dev components
  async preloadCriticalComponents() {
    const criticalComponents = ["motion", "AnimatePresence"];
    const loadPromises = criticalComponents.map((comp) =>
      this.loadMotionComponent(comp),
    );

    try {
      await Promise.all(loadPromises);
      console.log("Critical Motion.dev components preloaded");
    } catch (error) {
      console.error("Failed to preload critical components:", error);
    }
  },
};

// Global instances
export const globalLazyLoader = new AnimationLazyLoader();
export const globalMemoryManager = new ScrollAnimationMemoryManager();
export const globalPerformanceDashboard = new PerformanceDashboard();

/**
 * Hook for lazy loading animations
 */
export function useLazyAnimation(animationId: string, enabled: boolean = true) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !animationId) return;

    const loadAnimation = async () => {
      if (globalLazyLoader.isLoaded(animationId)) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      try {
        await globalLazyLoader.loadAnimation(animationId);
        setIsLoaded(true);
      } catch (error) {
        console.error(`Failed to load animation ${animationId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    // Observe element for intersection-based loading
    if (elementRef.current) {
      globalLazyLoader.observeElement(elementRef.current, animationId);
    }

    // Or load immediately if needed
    loadAnimation();

    return () => {
      if (elementRef.current) {
        globalLazyLoader.unobserveElement(elementRef.current);
      }
    };
  }, [animationId, enabled]);

  return {
    isLoaded,
    isLoading,
    elementRef,
  };
}

/**
 * Hook for managing scroll animation memory
 */
export function useScrollAnimationMemory(
  animationId: string,
  cleanup: () => void,
  enabled: boolean = true,
) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !animationId || !elementRef.current) return;

    globalMemoryManager.registerAnimation(
      animationId,
      elementRef.current,
      cleanup,
    );

    // Update last seen on scroll
    const handleScroll = () => {
      globalMemoryManager.updateLastSeen(animationId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      globalMemoryManager.unregisterAnimation(animationId);
    };
  }, [animationId, cleanup, enabled]);

  return { elementRef };
}

/**
 * Utility to detect if device is low-powered
 */
export function isLowPoweredDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  // Check for device memory API
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    return true;
  }

  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }

  // Check user agent for mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return isMobile;
}
