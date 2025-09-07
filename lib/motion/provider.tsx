"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useReducedMotion, useScreenReader } from "./accessibility";
import { globalPerformanceObserver, isLowPoweredDevice } from "./performance";
import type {
  MotionProviderProps,
  MotionContextValue,
  AnimationConfig,
} from "./types";

// Create the Motion context
const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * MotionProvider component that provides global animation settings and configuration
 */
export function MotionProvider({
  children,
  reducedMotion: forcedReducedMotion,
  performanceMode: initialPerformanceMode,
  enablePerformanceMonitoring = true,
}: MotionProviderProps) {
  const systemReducedMotion = useReducedMotion();
  const isScreenReader = useScreenReader();

  // Determine final reduced motion setting
  const reducedMotion =
    forcedReducedMotion ?? systemReducedMotion ?? isScreenReader;

  // Auto-detect performance mode based on device capabilities
  const [performanceMode, setPerformanceMode] = useState<
    "high" | "balanced" | "battery"
  >(() => {
    if (initialPerformanceMode) return initialPerformanceMode;

    if (typeof window === "undefined") return "balanced";

    // Auto-detect based on device capabilities
    if (isLowPoweredDevice()) return "battery";

    // Check battery API if available
    if ("getBattery" in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          if (battery.level < 0.2 || !battery.charging) {
            setPerformanceMode("battery");
          }
        })
        .catch(() => {
          // Battery API not supported, keep default
        });
    }

    return "balanced";
  });

  // Animation configuration registry
  const [animationConfig, setAnimationConfig] = useState<
    Record<string, AnimationConfig>
  >({});

  // Update configuration function
  const updateConfig = (config: Partial<AnimationConfig>) => {
    if (!config.id) return;

    setAnimationConfig((prev) => {
      const configId = config.id!;
      return {
        ...prev,
        [configId]: {
          ...prev[configId],
          ...config,
        } as AnimationConfig,
      };
    });
  };

  // Monitor performance and adjust settings automatically
  useEffect(() => {
    if (!enablePerformanceMonitoring || typeof window === "undefined") return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const monitorPerformance = () => {
      const now = performance.now();
      frameCount++;

      // Check performance every 2 seconds
      if (now - lastTime > 2000) {
        const fps = (frameCount * 1000) / (now - lastTime);

        // Auto-adjust performance mode based on frame rate
        if (fps < 30 && performanceMode !== "battery") {
          console.warn("Low frame rate detected, switching to battery mode");
          setPerformanceMode("battery");
        } else if (fps > 55 && performanceMode === "battery") {
          console.log("Good frame rate detected, switching to balanced mode");
          setPerformanceMode("balanced");
        }

        frameCount = 0;
        lastTime = now;
      }

      animationId = requestAnimationFrame(monitorPerformance);
    };

    animationId = requestAnimationFrame(monitorPerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [performanceMode, enablePerformanceMonitoring]);

  // Initialize performance observer
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      globalPerformanceObserver.startObserving("motion-provider");
    }

    return () => {
      if (enablePerformanceMonitoring) {
        globalPerformanceObserver.stopObserving("motion-provider");
      }
    };
  }, [enablePerformanceMonitoring]);

  // Log accessibility and performance settings
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Motion.dev Provider Settings:", {
        reducedMotion,
        performanceMode,
        isScreenReader,
        enablePerformanceMonitoring,
      });
    }
  }, [
    reducedMotion,
    performanceMode,
    isScreenReader,
    enablePerformanceMonitoring,
  ]);

  const contextValue: MotionContextValue = {
    reducedMotion,
    performanceMode,
    enablePerformanceMonitoring,
    animationConfig,
    updateConfig,
  };

  return (
    <MotionContext.Provider value={contextValue}>
      {children}
    </MotionContext.Provider>
  );
}

/**
 * Hook to access Motion context
 */
export function useMotionContext(): MotionContextValue {
  const context = useContext(MotionContext);

  if (!context) {
    throw new Error("useMotionContext must be used within a MotionProvider");
  }

  return context;
}

/**
 * Hook to get accessibility-aware animation settings
 */
export function useMotionSettings() {
  const { reducedMotion, performanceMode } = useMotionContext();

  return {
    reducedMotion,
    performanceMode,
    shouldAnimate: !reducedMotion,
    getDuration: (baseDuration: number) => {
      if (reducedMotion) return 0;

      switch (performanceMode) {
        case "battery":
          return baseDuration * 0.5;
        case "high":
          return baseDuration;
        case "balanced":
        default:
          return baseDuration * 0.8;
      }
    },
    getEasing: (baseEasing: string = "ease-out") => {
      if (reducedMotion) return "linear"; // Linear easing for reduced motion

      // Convert CSS easing names to cubic bezier strings for Motion.dev
      const easingMap: Record<string, any> = {
        linear: "linear",
        ease: "ease",
        "ease-in": "easeIn",
        "ease-out": "easeOut",
        "ease-in-out": "easeInOut",
        easeOut: "easeOut",
        easeIn: "easeIn",
        easeInOut: "easeInOut",
        smooth: [0.4, 0, 0.2, 1],
        cinematic: [0.25, 0.46, 0.45, 0.94],
        bounce: [0.68, -0.6, 0.32, 1.6],
        elastic: [0.175, 0.885, 0.32, 1.275],
        fast: [0.4, 0, 1, 1],
        slow: [0, 0, 0.2, 1],
        subtle: [0.4, 0, 0.6, 1],
        snappy: [0.4, 0, 0.2, 1],
        spring: "spring",
      };

      // Check if baseEasing is already a cubic-bezier string
      if (baseEasing.startsWith("cubic-bezier(")) {
        return baseEasing;
      }

      switch (performanceMode) {
        case "battery":
          return easingMap["ease"] || "ease"; // Simpler easing for better performance
        case "high":
          return easingMap[baseEasing] || baseEasing || "ease-out";
        case "balanced":
        default:
          return easingMap[baseEasing] || baseEasing || "ease-out";
      }
    },
  };
}
