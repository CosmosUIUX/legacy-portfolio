// Motion.dev TypeScript types and interfaces

export interface MotionProviderProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
  performanceMode?: "high" | "balanced" | "battery";
  enablePerformanceMonitoring?: boolean;
}

export interface AnimationConfig {
  id: string;
  component: string;
  trigger: AnimationTrigger;
  properties: AnimationProperties;
  accessibility: AccessibilityOptions;
}

export interface AnimationTrigger {
  type: "viewport" | "hover" | "click" | "scroll" | "focus" | "manual";
  threshold?: number;
  rootMargin?: string;
}

export interface AnimationProperties {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
  transform?: TransformProperties;
  opacity?: OpacityProperties;
}

export interface TransformProperties {
  x?: number | string;
  y?: number | string;
  scale?: number;
  rotate?: number | string;
  skew?: number | string;
}

export interface OpacityProperties {
  from?: number;
  to?: number;
}

export interface AccessibilityOptions {
  respectReducedMotion: boolean;
  skipOnScreenReader: boolean;
  alternativeText?: string;
}

export interface AnimationMetrics {
  componentId: string;
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  batteryImpact: "low" | "medium" | "high";
}

export interface UseMotionOptions {
  trigger?: "viewport" | "hover" | "click" | "scroll" | "focus" | "manual";
  duration?: number;
  easing?: string;
  delay?: number;
  stagger?: number;
}

export interface MotionContextValue {
  reducedMotion: boolean;
  performanceMode: "high" | "balanced" | "battery";
  enablePerformanceMonitoring: boolean;
  animationConfig: Record<string, AnimationConfig>;
  updateConfig: (config: Partial<AnimationConfig>) => void;
}
