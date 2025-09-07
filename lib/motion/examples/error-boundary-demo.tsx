"use client";

import React, { useState } from "react";
import {
  AnimationErrorBoundary,
  ErrorRecoveryProvider,
  EnhancedMotionFallback,
  useAnimationHealthCheck,
  useAnimationErrorLogger,
  AnimationDebugger,
  AnimationErrorType,
  RecoveryStrategy,
} from "../error-boundary";

/**
 * Demo component that can simulate different types of animation errors
 */
function AnimationErrorDemo() {
  const [errorType, setErrorType] = useState<string>("none");
  const healthStatus = useAnimationHealthCheck();
  const { errors, logError, clearErrors, getErrorStats } =
    useAnimationErrorLogger();

  const simulateError = (type: string) => {
    switch (type) {
      case "runtime":
        throw new Error("Simulated animation runtime error");
      case "performance":
        logError({
          type: AnimationErrorType.PERFORMANCE_DEGRADATION,
          message: "Simulated performance degradation",
          timestamp: Date.now(),
          performanceMetrics: {
            frameRate: 15,
            memoryUsage: 100 * 1024 * 1024,
            renderTime: 50,
          },
        });
        break;
      case "memory":
        logError({
          type: AnimationErrorType.MEMORY_LEAK,
          message: "Simulated memory leak detected",
          timestamp: Date.now(),
          performanceMetrics: {
            frameRate: 30,
            memoryUsage: 200 * 1024 * 1024,
            renderTime: 20,
          },
        });
        break;
      default:
        break;
    }
  };

  if (errorType === "runtime") {
    simulateError("runtime");
  }

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h2>Animation Error Boundary Demo</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Health Status</h3>
        <div
          style={{
            padding: "10px",
            backgroundColor: healthStatus.performanceGood
              ? "#d1fae5"
              : "#fee2e2",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          <div>
            Motion Available: {healthStatus.motionAvailable ? "✅" : "❌"}
          </div>
          <div>
            Performance Good: {healthStatus.performanceGood ? "✅" : "⚠️"}
          </div>
          <div>Recent Errors: {healthStatus.errorsCount}</div>
          <div>
            Last Check: {new Date(healthStatus.lastCheck).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Error Simulation</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => setErrorType("runtime")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Trigger Runtime Error
          </button>
          <button
            onClick={() => simulateError("performance")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Simulate Performance Issue
          </button>
          <button
            onClick={() => simulateError("memory")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Simulate Memory Leak
          </button>
        </div>
        <button
          onClick={() => {
            setErrorType("none");
            clearErrors();
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear All Errors
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Error Statistics</h3>
        <pre
          style={{
            backgroundColor: "#f3f4f6",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(getErrorStats(), null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Recent Errors ({errors.length})</h3>
        <div style={{ maxHeight: "200px", overflow: "auto" }}>
          {errors.slice(0, 5).map((error, index) => (
            <div
              key={index}
              style={{
                padding: "8px",
                marginBottom: "8px",
                backgroundColor: "#fef3c7",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <div>
                <strong>{error.type}</strong>
              </div>
              <div>{error.message}</div>
              <div>{new Date(error.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Debug Actions</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const debugInfo = AnimationDebugger.getDebugInfo();
              console.log("Debug Info:", debugInfo);
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Log Debug Info
          </button>
          <button
            onClick={() => AnimationDebugger.exportDebugData()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#06b6d4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Export Debug Data
          </button>
          <button
            onClick={() => AnimationDebugger.clearDebugData()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#64748b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear Debug Data
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main demo component with error boundary
 */
export function ErrorBoundaryDemo() {
  return (
    <ErrorRecoveryProvider>
      <AnimationErrorBoundary
        recoveryStrategy={RecoveryStrategy.FALLBACK_TO_CSS}
        maxRetries={3}
        retryDelay={2000}
        onError={(error, errorInfo) => {
          console.log("Error caught by boundary:", error, errorInfo);
        }}
      >
        <EnhancedMotionFallback
          showLoadingState={true}
          errorComponent={({ retry }) => (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fee2e2",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <h3>Motion.dev Unavailable</h3>
              <p>Falling back to CSS animations</p>
              <button
                onClick={retry}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Retry Loading Motion.dev
              </button>
            </div>
          )}
        >
          <AnimationErrorDemo />
        </EnhancedMotionFallback>
      </AnimationErrorBoundary>
    </ErrorRecoveryProvider>
  );
}

export default ErrorBoundaryDemo;
