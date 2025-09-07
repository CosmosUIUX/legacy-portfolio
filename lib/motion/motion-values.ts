"use client";

import { useRef, useState, useCallback, useMemo } from "react";

// Basic MotionValue implementation
export class MotionValue<T = number> {
  private _value: T;
  private _subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get(): T {
    return this._value;
  }

  set(value: T): void {
    if (this._value !== value) {
      this._value = value;
      this._subscribers.forEach((subscriber) => subscriber(value));
    }
  }

  on(event: "change", callback: (value: T) => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  destroy(): void {
    this._subscribers.clear();
  }
}

// Hook to create a motion value
export function useMotionValue<T = number>(initialValue: T): MotionValue<T> {
  const motionValueRef = useRef<MotionValue<T>>();

  if (!motionValueRef.current) {
    motionValueRef.current = new MotionValue(initialValue);
  }

  return motionValueRef.current;
}

// Basic spring physics implementation
class SpringAnimation {
  private _value: number;
  private _target: number;
  private _velocity: number = 0;
  private _stiffness: number;
  private _damping: number;
  private _mass: number;
  private _isAnimating: boolean = false;
  private _subscribers: Set<(value: number) => void> = new Set();
  private _animationId: number | null = null;

  constructor(
    initialValue: number,
    config: { stiffness?: number; damping?: number; mass?: number } = {},
  ) {
    this._value = initialValue;
    this._target = initialValue;
    this._stiffness = config.stiffness || 100;
    this._damping = config.damping || 10;
    this._mass = config.mass || 1;
  }

  get(): number {
    return this._value;
  }

  set(value: number): void {
    this._target = value;
    if (!this._isAnimating) {
      this._startAnimation();
    }
  }

  on(event: "change", callback: (value: number) => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  private _startAnimation(): void {
    this._isAnimating = true;

    const animate = () => {
      const force = this._stiffness * (this._target - this._value);
      const damping = this._damping * this._velocity;
      const acceleration = (force - damping) / this._mass;

      this._velocity += acceleration * 0.016; // 60fps
      this._value += this._velocity * 0.016;

      // Check if animation should stop
      const isAtRest =
        Math.abs(this._velocity) < 0.01 &&
        Math.abs(this._target - this._value) < 0.01;

      if (isAtRest) {
        this._value = this._target;
        this._velocity = 0;
        this._isAnimating = false;
        this._subscribers.forEach((subscriber) => subscriber(this._value));
        return;
      }

      this._subscribers.forEach((subscriber) => subscriber(this._value));
      this._animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy(): void {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
    }
    this._subscribers.clear();
  }
}

// Hook for spring animations
export function useSpring(
  source: MotionValue<number> | number,
  config: { stiffness?: number; damping?: number; mass?: number } = {},
): MotionValue<number> {
  const springRef = useRef<SpringAnimation>();
  const motionValueRef = useRef<MotionValue<number>>();

  const initialValue = typeof source === "number" ? source : source.get();

  if (!springRef.current) {
    springRef.current = new SpringAnimation(initialValue, config);
  }

  if (!motionValueRef.current) {
    motionValueRef.current = new MotionValue(initialValue);

    // Connect spring to motion value
    springRef.current.on("change", (value) => {
      motionValueRef.current!.set(value);
    });
  }

  // Handle source changes
  useMemo(() => {
    if (typeof source === "number") {
      springRef.current!.set(source);
    } else {
      // Subscribe to source changes
      const unsubscribe = source.on("change", (value) => {
        springRef.current!.set(value);
      });

      return unsubscribe;
    }
  }, [source]);

  return motionValueRef.current;
}

// Basic transform implementation
export function useTransform<T>(
  source: MotionValue<number>,
  inputRange: number[],
  outputRange: T[],
): MotionValue<T> {
  const transformedValueRef = useRef<MotionValue<T>>();

  if (!transformedValueRef.current) {
    const interpolate = (value: number): T => {
      // Simple linear interpolation
      for (let i = 0; i < inputRange.length - 1; i++) {
        const inputStart = inputRange[i];
        const inputEnd = inputRange[i + 1];

        if (value >= inputStart && value <= inputEnd) {
          const progress = (value - inputStart) / (inputEnd - inputStart);
          const outputStart = outputRange[i];
          const outputEnd = outputRange[i + 1];

          if (
            typeof outputStart === "number" &&
            typeof outputEnd === "number"
          ) {
            return (outputStart + (outputEnd - outputStart) * progress) as T;
          }

          if (
            typeof outputStart === "string" &&
            typeof outputEnd === "string"
          ) {
            // Handle string interpolation for CSS values
            const startValue = parseFloat(outputStart);
            const endValue = parseFloat(outputEnd);
            const unit = outputStart.replace(/[\d.-]/g, "");

            if (!isNaN(startValue) && !isNaN(endValue)) {
              const interpolatedValue =
                startValue + (endValue - startValue) * progress;
              return `${interpolatedValue}${unit}` as T;
            }
          }

          // For non-numeric values, return based on progress threshold
          return progress >= 0.5 ? outputEnd : outputStart;
        }
      }

      // Handle values outside range
      if (value <= inputRange[0]) return outputRange[0];
      if (value >= inputRange[inputRange.length - 1])
        return outputRange[outputRange.length - 1];

      return outputRange[0];
    };

    transformedValueRef.current = new MotionValue(interpolate(source.get()));

    // Subscribe to source changes
    source.on("change", (value) => {
      transformedValueRef.current!.set(interpolate(value));
    });
  }

  return transformedValueRef.current;
}

// Basic animation controls
export function useAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);

  const start = useCallback((animation: any) => {
    setIsAnimating(true);
    // Basic implementation - in real usage, this would trigger animations
    return Promise.resolve();
  }, []);

  const stop = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const set = useCallback((values: Record<string, any>) => {
    // Basic implementation - would set element styles directly
  }, []);

  return {
    start,
    stop,
    set,
    isAnimating,
  };
}
