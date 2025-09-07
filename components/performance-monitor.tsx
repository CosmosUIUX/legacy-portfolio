"use client";

import React, { useEffect, useState } from "react";
import {
  globalPerformanceDashboard,
  globalMemoryManager,
} from "../lib/motion/performance";
import { useMotionSettings } from "@/lib/motion/provider";

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === "development",
  showDetails = false,
  position = "top-right",
}: PerformanceMonitorProps) {
  const { performanceMode } = useMotionSettings();
  const [metrics, setMetrics] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationMetrics, setAnimationMetrics] = useState<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Get basic performance metrics
      const performanceEntries = performance.getEntriesByType("navigation");
      const paintEntries = performance.getEntriesByType("paint");

      const navigationEntry =
        performanceEntries[0] as PerformanceNavigationTiming;
      const firstPaint = paintEntries.find(
        (entry) => entry.name === "first-paint",
      );
      const firstContentfulPaint = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint",
      );

      // Get memory info if available
      const memoryInfo = (performance as any).memory;

      // Get animation-specific metrics
      const animationSummary =
        globalPerformanceDashboard.getPerformanceSummary();
      const activeAnimations = globalMemoryManager.getActiveCount();
      const recentAlerts = globalPerformanceDashboard.getAlerts(
        Date.now() - 60000,
      ); // Last minute

      setMetrics({
        loadTime: navigationEntry
          ? Math.round(
              navigationEntry.loadEventEnd - navigationEntry.fetchStart,
            )
          : 0,
        domContentLoaded: navigationEntry
          ? Math.round(
              navigationEntry.domContentLoadedEventEnd -
                navigationEntry.fetchStart,
            )
          : 0,
        firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 0,
        firstContentfulPaint: firstContentfulPaint
          ? Math.round(firstContentfulPaint.startTime)
          : 0,
        memoryUsed: memoryInfo
          ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
          : 0,
        memoryTotal: memoryInfo
          ? Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)
          : 0,
        timestamp: Date.now(),
      });

      setAnimationMetrics({
        summary: animationSummary,
        activeAnimations,
        recentAlerts: recentAlerts.length,
        errorCount: recentAlerts.filter((a) => a.type === "error").length,
        warningCount: recentAlerts.filter((a) => a.type === "warning").length,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled || !metrics) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case "good":
        return "text-green-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getHealthIndicator = (health?: string) => {
    switch (health) {
      case "good":
        return "●";
      case "fair":
        return "◐";
      case "poor":
        return "●";
      default:
        return "○";
    }
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 bg-black/90 text-white text-xs p-3 rounded-lg font-mono shadow-lg border border-gray-700`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            animationMetrics?.summary?.overallHealth === "good"
              ? "bg-green-400"
              : animationMetrics?.summary?.overallHealth === "fair"
                ? "bg-yellow-400"
                : animationMetrics?.summary?.overallHealth === "poor"
                  ? "bg-red-400"
                  : "bg-gray-400"
          }`}
        ></div>
        <span className="font-semibold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-300 hover:text-white ml-auto"
        >
          {isVisible ? "−" : "+"}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-2 min-w-[250px]">
          {/* Basic Performance Metrics */}
          <div className="space-y-1">
            <div className="text-gray-300 font-semibold">Page Performance</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Load: {metrics.loadTime}ms</div>
              <div>DOMReady: {metrics.domContentLoaded}ms</div>
              <div>FP: {metrics.firstPaint}ms</div>
              <div>FCP: {metrics.firstContentfulPaint}ms</div>
            </div>
            {metrics.memoryUsed > 0 && (
              <div>
                Memory: {metrics.memoryUsed}MB / {metrics.memoryTotal}MB
              </div>
            )}
            <div className="text-xs text-gray-400">Mode: {performanceMode}</div>
          </div>

          {/* Animation Performance */}
          {animationMetrics?.summary && (
            <div className="border-t border-gray-600 pt-2 space-y-1">
              <div className="text-gray-300 font-semibold flex items-center gap-2">
                Animation Performance
                <span
                  className={getHealthColor(
                    animationMetrics.summary.overallHealth,
                  )}
                >
                  {getHealthIndicator(animationMetrics.summary.overallHealth)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>FPS: {animationMetrics.summary.averageFrameRate}</div>
                <div>
                  Components: {animationMetrics.summary.totalComponents}
                </div>
                <div>Active: {animationMetrics.activeAnimations}</div>
                <div>
                  Memory: {animationMetrics.summary.averageMemoryUsage}MB
                </div>
              </div>

              {(animationMetrics.errorCount > 0 ||
                animationMetrics.warningCount > 0) && (
                <div className="flex gap-2 text-xs">
                  {animationMetrics.errorCount > 0 && (
                    <span className="text-red-400">
                      ⚠ {animationMetrics.errorCount} errors
                    </span>
                  )}
                  {animationMetrics.warningCount > 0 && (
                    <span className="text-yellow-400">
                      ⚠ {animationMetrics.warningCount} warnings
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {showDetails && (
            <div className="border-t border-gray-600 pt-2 space-y-1">
              <div className="text-gray-300 font-semibold">Details</div>
              <div className="text-xs">
                <div>
                  Timestamp: {new Date(metrics.timestamp).toLocaleTimeString()}
                </div>
                {animationMetrics?.summary && (
                  <div>
                    Render Time: {animationMetrics.summary.averageRenderTime}ms
                  </div>
                )}
              </div>

              {/* Export button */}
              <button
                onClick={() => {
                  const data = globalPerformanceDashboard.exportMetrics();
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `performance-metrics-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-blue-400 hover:text-blue-300 underline text-xs"
              >
                Export Metrics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for performance monitoring without UI
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    isOptimal: true,
    frameTime: 16.67, // Target 16.67ms per frame for 60fps
    memoryUsage: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;

      // Calculate metrics every second
      if (now - lastTime >= 1000) {
        const currentFPS = Math.round((frameCount * 1000) / (now - lastTime));
        const avgFrameTime = (now - lastTime) / frameCount;

        // Get memory usage if available
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

        setMetrics({
          fps: currentFPS,
          isOptimal: currentFPS >= 55 && avgFrameTime <= 20, // 20ms threshold for smooth animations
          frameTime: avgFrameTime,
          memoryUsage: memoryUsage / 1024 / 1024, // Convert to MB
        });

        frameCount = 0;
        lastTime = now;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return metrics;
}
