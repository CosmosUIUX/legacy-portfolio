// Error boundary and fallback system for Motion.dev animations
"use client";

import React, {
  Component,
  ErrorInfo,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { BundleOptimizer } from "./performance";

/**
 * Error types for animation failures
 */
export enum AnimationErrorType {
  MOTION_LOAD_FAILURE = "MOTION_LOAD_FAILURE",
  ANIMATION_RUNTIME_ERROR = "ANIMATION_RUNTIME_ERROR",
  PERFORMANCE_DEGRADATION = "PERFORMANCE_DEGRADATION",
  MEMORY_LEAK = "MEMORY_LEAK",
  BROWSER_COMPATIBILITY = "BROWSER_COMPATIBILITY",
}

/**
 * Animation error interface
 */
export interface AnimationError {
  type: AnimationErrorType;
  message: string;
  componentStack?: string;
  timestamp: number;
  userAgent?: string;
  performanceMetrics?: {
    frameRate: number;
    memoryUsage: number;
    renderTime: number;
  };
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  FALLBACK_TO_CSS = "FALLBACK_TO_CSS",
  DISABLE_ANIMATIONS = "DISABLE_ANIMATIONS",
  REDUCE_COMPLEXITY = "REDUCE_COMPLEXITY",
  RETRY_WITH_DELAY = "RETRY_WITH_DELAY",
}

/**
 * Error boundary props
 */
interface AnimationErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: AnimationError; retry: () => void }>;
  onError?: (error: AnimationError, errorInfo: ErrorInfo) => void;
  recoveryStrategy?: RecoveryStrategy;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Error boundary state
 */
interface AnimationErrorBoundaryState {
  hasError: boolean;
  error: AnimationError | null;
  retryCount: number;
  isRecovering: boolean;
}

/**
 * Default fallback component for animation errors
 */
function DefaultAnimationFallback({
  error,
  retry,
}: {
  error: AnimationError;
  retry: () => void;
}) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #fbbf24",
        borderRadius: "8px",
        backgroundColor: "#fef3c7",
        color: "#92400e",
        fontSize: "14px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        Animation Error
      </div>
      <div style={{ marginBottom: "8px" }}>{error.message}</div>
      {process.env.NODE_ENV === "development" && (
        <details style={{ marginBottom: "8px" }}>
          <summary style={{ cursor: "pointer" }}>Error Details</summary>
          <pre
            style={{
              fontSize: "12px",
              overflow: "auto",
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
      <button
        onClick={retry}
        style={{
          padding: "8px 16px",
          backgroundColor: "#d97706",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Retry Animation
      </button>
    </div>
  );
}

/**
 * Animation Error Boundary Component
 */
export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: AnimationErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<AnimationErrorBoundaryState> {
    // Create animation error from caught error
    const animationError: AnimationError = {
      type: AnimationErrorType.ANIMATION_RUNTIME_ERROR,
      message: error.message || "Unknown animation error",
      timestamp: Date.now(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };

    return {
      hasError: true,
      error: animationError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const animationError: AnimationError = {
      type: this.determineErrorType(error),
      message: error.message || "Animation component error",
      componentStack: errorInfo.componentStack || undefined,
      timestamp: Date.now(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };

    // Log error
    this.logError(animationError, errorInfo);

    // Call onError callback
    this.props.onError?.(animationError, errorInfo);

    // Apply recovery strategy
    this.applyRecoveryStrategy(animationError);
  }

  private determineErrorType(error: Error): AnimationErrorType {
    const message = error.message.toLowerCase();

    if (message.includes("motion") || message.includes("framer")) {
      return AnimationErrorType.MOTION_LOAD_FAILURE;
    }

    if (message.includes("memory") || message.includes("heap")) {
      return AnimationErrorType.MEMORY_LEAK;
    }

    if (message.includes("performance") || message.includes("frame")) {
      return AnimationErrorType.PERFORMANCE_DEGRADATION;
    }

    if (message.includes("browser") || message.includes("support")) {
      return AnimationErrorType.BROWSER_COMPATIBILITY;
    }

    return AnimationErrorType.ANIMATION_RUNTIME_ERROR;
  }

  private logError(error: AnimationError, errorInfo: ErrorInfo) {
    // Enhanced error with component stack
    const enhancedError: AnimationError = {
      ...error,
      componentStack: errorInfo.componentStack || undefined,
    };

    // Use the centralized error logging system
    AnimationErrorLogger.logError(enhancedError);
  }

  private applyRecoveryStrategy(error: AnimationError) {
    const strategy =
      this.props.recoveryStrategy || RecoveryStrategy.FALLBACK_TO_CSS;

    switch (strategy) {
      case RecoveryStrategy.RETRY_WITH_DELAY:
        this.scheduleRetry();
        break;

      case RecoveryStrategy.DISABLE_ANIMATIONS:
        // This would be handled by the motion context
        console.warn("Animations disabled due to error:", error.message);
        break;

      case RecoveryStrategy.REDUCE_COMPLEXITY:
        // This would be handled by the motion context
        console.warn(
          "Animation complexity reduced due to error:",
          error.message,
        );
        break;

      case RecoveryStrategy.FALLBACK_TO_CSS:
      default:
        console.warn(
          "Falling back to CSS animations due to error:",
          error.message,
        );
        break;
    }
  }

  private scheduleRetry = () => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState({ isRecovering: true });

      this.retryTimeout = setTimeout(() => {
        this.setState((prevState) => ({
          hasError: false,
          error: null,
          retryCount: prevState.retryCount + 1,
          isRecovering: false,
        }));
      }, retryDelay);
    }
  };

  private handleRetry = () => {
    this.scheduleRetry();
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultAnimationFallback;

      return (
        <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}

/**
 * Context for error recovery state
 */
interface ErrorRecoveryContextValue {
  hasErrors: boolean;
  errorCount: number;
  lastError: AnimationError | null;
  recoveryMode: RecoveryStrategy | null;
  reportError: (error: AnimationError) => void;
  clearErrors: () => void;
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextValue | null>(
  null,
);

/**
 * Error recovery provider
 */
export function ErrorRecoveryProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AnimationError[]>([]);
  const [recoveryMode, setRecoveryMode] = useState<RecoveryStrategy | null>(
    null,
  );

  const reportError = (error: AnimationError) => {
    setErrors((prev) => [...prev, error]);

    // Auto-adjust recovery mode based on error frequency
    if (errors.length >= 3) {
      setRecoveryMode(RecoveryStrategy.DISABLE_ANIMATIONS);
    } else if (errors.length >= 2) {
      setRecoveryMode(RecoveryStrategy.REDUCE_COMPLEXITY);
    }
  };

  const clearErrors = () => {
    setErrors([]);
    setRecoveryMode(null);
  };

  const contextValue: ErrorRecoveryContextValue = {
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    lastError: errors[errors.length - 1] || null,
    recoveryMode,
    reportError,
    clearErrors,
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

/**
 * Hook to access error recovery context
 */
export function useErrorRecovery(): ErrorRecoveryContextValue {
  const context = useContext(ErrorRecoveryContext);

  if (!context) {
    throw new Error(
      "useErrorRecovery must be used within ErrorRecoveryProvider",
    );
  }

  return context;
}

/**
 * Performance monitoring for animation errors
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private frameRateThreshold = 30;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB
  private onError?: (error: AnimationError) => void;

  constructor(
    options: {
      frameRateThreshold?: number;
      memoryThreshold?: number;
      onError?: (error: AnimationError) => void;
    } = {},
  ) {
    this.frameRateThreshold = options.frameRateThreshold || 30;
    this.memoryThreshold = options.memoryThreshold || 50 * 1024 * 1024;
    this.onError = options.onError;
  }

  startMonitoring() {
    if (typeof window === "undefined") return;

    this.monitorFrameRate();
    this.monitorMemoryUsage();
  }

  private monitorFrameRate() {
    const checkFrameRate = (currentTime: number) => {
      this.frameCount++;

      if (currentTime - this.lastTime >= 1000) {
        const fps = (this.frameCount * 1000) / (currentTime - this.lastTime);

        if (fps < this.frameRateThreshold) {
          this.reportPerformanceError("Low frame rate detected", {
            frameRate: fps,
            memoryUsage: this.getMemoryUsage(),
            renderTime: currentTime - this.lastTime,
          });
        }

        this.frameCount = 0;
        this.lastTime = currentTime;
      }

      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }

  private monitorMemoryUsage() {
    if (!("memory" in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;

      if (memory.usedJSHeapSize > this.memoryThreshold) {
        this.reportPerformanceError("High memory usage detected", {
          frameRate: 0,
          memoryUsage: memory.usedJSHeapSize,
          renderTime: 0,
        });
      }
    };

    // Check memory every 5 seconds
    setInterval(checkMemory, 5000);
  }

  private getMemoryUsage(): number {
    if (typeof window === "undefined" || !("memory" in performance)) {
      return 0;
    }

    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  private reportPerformanceError(message: string, metrics: any) {
    const error: AnimationError = {
      type: AnimationErrorType.PERFORMANCE_DEGRADATION,
      message,
      timestamp: Date.now(),
      performanceMetrics: metrics,
      userAgent: window.navigator.userAgent,
    };

    this.onError?.(error);
  }
}

/**
 * Hook for performance monitoring
 */
export function useAnimationPerformanceMonitor(enabled = true) {
  const { reportError } = useErrorRecovery();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const monitor = new AnimationPerformanceMonitor({
      onError: (error) => {
        reportError(error);
        AnimationErrorLogger.logError(error);
      },
    });

    monitor.startMonitoring();
  }, [enabled, reportError]);
}

/**
 * Comprehensive animation health check
 */
export function useAnimationHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<{
    motionAvailable: boolean;
    performanceGood: boolean;
    errorsCount: number;
    lastCheck: number;
  }>({
    motionAvailable: false,
    performanceGood: true,
    errorsCount: 0,
    lastCheck: Date.now(),
  });

  useEffect(() => {
    const checkHealth = async () => {
      const detector = MotionLoadDetector.getInstance();
      const motionAvailable = await detector.checkMotionAvailability();
      const errors = AnimationErrorLogger.getErrors();
      const recentErrors = errors.filter(
        (e) => Date.now() - e.timestamp < 60000,
      ); // Last minute

      // Check performance metrics
      const performanceGood =
        recentErrors.filter(
          (e) => e.type === AnimationErrorType.PERFORMANCE_DEGRADATION,
        ).length < 3;

      setHealthStatus({
        motionAvailable,
        performanceGood,
        errorsCount: recentErrors.length,
        lastCheck: Date.now(),
      });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return healthStatus;
}

/**
 * Animation debugging utilities
 */
export const AnimationDebugger = {
  /**
   * Get comprehensive debug information
   */
  getDebugInfo() {
    const detector = MotionLoadDetector.getInstance();
    const bundleInfo = { loaded: true }; // Simple bundle info placeholder
    const errorStats = AnimationErrorLogger.getErrorStats();
    const recentErrors = AnimationErrorLogger.getErrors().slice(0, 5);

    return {
      motionStatus: detector.getLoadStatus(),
      bundleInfo,
      errorStats,
      recentErrors,
      timestamp: Date.now(),
    };
  },

  /**
   * Export debug data for support
   */
  exportDebugData() {
    const debugInfo = this.getDebugInfo();
    const dataStr = JSON.stringify(debugInfo, null, 2);

    if (typeof window !== "undefined") {
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `animation-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return dataStr;
  },

  /**
   * Clear all debug data
   */
  clearDebugData() {
    AnimationErrorLogger.clearErrors();
    // BundleOptimizer cache clearing not implemented
    MotionLoadDetector.getInstance().reset();
  },
};

/**
 * Fallback component for when Motion.dev fails to load
 */
export function MotionFallback({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        ...style,
        transition: "all 0.3s ease",
        // Provide basic CSS transitions as fallback
      }}
    >
      {children}
    </div>
  );
}

/**
 * Motion.dev load detection and fallback system
 */
export class MotionLoadDetector {
  private static instance: MotionLoadDetector;
  private isMotionLoaded = false;
  private loadPromise: Promise<boolean> | null = null;
  private fallbackMode = false;
  private loadAttempts = 0;
  private maxLoadAttempts = 3;

  static getInstance(): MotionLoadDetector {
    if (!MotionLoadDetector.instance) {
      MotionLoadDetector.instance = new MotionLoadDetector();
    }
    return MotionLoadDetector.instance;
  }

  async checkMotionAvailability(): Promise<boolean> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.attemptMotionLoad();
    return this.loadPromise;
  }

  private async attemptMotionLoad(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      this.loadAttempts++;

      // Try to dynamically import Motion.dev
      const motionModule = await import("@/lib/motion").catch(() => null);

      if (motionModule) {
        this.isMotionLoaded = true;
        return true;
      }

      throw new Error("Motion.dev module not available");
    } catch (error) {
      console.warn(
        `Motion.dev load attempt ${this.loadAttempts} failed:`,
        error,
      );

      if (this.loadAttempts >= this.maxLoadAttempts) {
        this.fallbackMode = true;
        this.reportLoadFailure(error as Error);
      }

      return false;
    }
  }

  private reportLoadFailure(error: Error) {
    const animationError: AnimationError = {
      type: AnimationErrorType.MOTION_LOAD_FAILURE,
      message: `Motion.dev failed to load after ${this.loadAttempts} attempts: ${error.message}`,
      timestamp: Date.now(),
      userAgent: window.navigator.userAgent,
    };

    // Dispatch custom event for error reporting
    window.dispatchEvent(
      new CustomEvent("motion-load-failure", {
        detail: animationError,
      }),
    );
  }

  isInFallbackMode(): boolean {
    return this.fallbackMode;
  }

  getLoadStatus(): "loading" | "loaded" | "failed" {
    if (this.isMotionLoaded) return "loaded";
    if (this.fallbackMode) return "failed";
    return "loading";
  }

  reset() {
    this.isMotionLoaded = false;
    this.loadPromise = null;
    this.fallbackMode = false;
    this.loadAttempts = 0;
  }
}

/**
 * Enhanced fallback component with loading states
 */
export function EnhancedMotionFallback({
  children,
  className,
  style,
  loadingComponent,
  errorComponent,
  showLoadingState = true,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ retry: () => void }>;
  showLoadingState?: boolean;
}) {
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const detector = MotionLoadDetector.getInstance();

  useEffect(() => {
    const checkLoad = async () => {
      const isLoaded = await detector.checkMotionAvailability();
      setLoadStatus(isLoaded ? "loaded" : "failed");
    };

    checkLoad();

    // Listen for load failure events
    const handleLoadFailure = () => {
      setLoadStatus("failed");
    };

    window.addEventListener("motion-load-failure", handleLoadFailure);
    return () => {
      window.removeEventListener("motion-load-failure", handleLoadFailure);
    };
  }, [detector]);

  const handleRetry = () => {
    detector.reset();
    setLoadStatus("loading");
    detector.checkMotionAvailability().then((isLoaded) => {
      setLoadStatus(isLoaded ? "loaded" : "failed");
    });
  };

  if (loadStatus === "loading" && showLoadingState) {
    if (loadingComponent) {
      const LoadingComponent = loadingComponent;
      return <LoadingComponent />;
    }

    return (
      <div
        className={className}
        style={{
          ...style,
          opacity: 0.7,
          transition: "opacity 0.3s ease",
        }}
      >
        {children}
      </div>
    );
  }

  if (loadStatus === "failed") {
    if (errorComponent) {
      const ErrorComponent = errorComponent;
      return <ErrorComponent retry={handleRetry} />;
    }

    return (
      <div
        className={className}
        style={{
          ...style,
          transition: "all 0.3s ease",
          position: "relative",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "4px 8px",
            backgroundColor: "#fbbf24",
            color: "#92400e",
            fontSize: "10px",
            borderRadius: "0 0 0 4px",
            fontFamily: "system-ui, sans-serif",
          }}
          title="Motion.dev unavailable - using CSS fallback"
        >
          CSS
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Enhanced error logging system
 */
export class AnimationErrorLogger {
  private static errors: AnimationError[] = [];
  private static maxErrors = 50;
  private static listeners: ((error: AnimationError) => void)[] = [];

  static logError(error: AnimationError) {
    // Add to error history
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error("Error in error listener:", e);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🎬 Animation Error [${error.type}]`);
      console.error("Message:", error.message);
      console.error("Timestamp:", new Date(error.timestamp).toISOString());
      if (error.performanceMetrics) {
        console.table(error.performanceMetrics);
      }
      console.groupEnd();
    }

    // Send to external service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToErrorService(error);
    }
  }

  private static async sendToErrorService(error: AnimationError) {
    try {
      // Placeholder for external error reporting service
      // Replace with actual service like Sentry, LogRocket, etc.
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error),
      }).catch(() => {
        // Silently fail if error reporting is unavailable
      });
    } catch (e) {
      // Don't throw errors from error reporting
    }
  }

  static addListener(listener: (error: AnimationError) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static getErrors(): AnimationError[] {
    return [...this.errors];
  }

  static getErrorsByType(type: AnimationErrorType): AnimationError[] {
    return this.errors.filter((error) => error.type === type);
  }

  static clearErrors() {
    this.errors = [];
  }

  static getErrorStats() {
    const stats = new Map<AnimationErrorType, number>();

    this.errors.forEach((error) => {
      stats.set(error.type, (stats.get(error.type) || 0) + 1);
    });

    return Object.fromEntries(stats);
  }
}

/**
 * Hook for accessing error logging
 */
export function useAnimationErrorLogger() {
  const [errors, setErrors] = useState<AnimationError[]>([]);

  useEffect(() => {
    setErrors(AnimationErrorLogger.getErrors());

    const unsubscribe = AnimationErrorLogger.addListener((error) => {
      setErrors((prev) => [error, ...prev.slice(0, 49)]);
    });

    return unsubscribe;
  }, []);

  return {
    errors,
    logError: AnimationErrorLogger.logError,
    clearErrors: AnimationErrorLogger.clearErrors,
    getErrorStats: AnimationErrorLogger.getErrorStats,
  };
}

/**
 * Higher-order component for safe animation wrapping
 */
export function withAnimationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<AnimationErrorBoundaryProps>,
) {
  return function WrappedComponent(props: P) {
    return (
      <AnimationErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AnimationErrorBoundary>
    );
  };
}
