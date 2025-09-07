// Animation configuration system for Motion.dev
import type {
  AnimationConfig,
  AnimationProperties,
  AnimationTrigger,
  AccessibilityOptions,
} from "./types";

/**
 * Common easing curves for animations
 */
export const EASING_PRESETS = {
  // Standard easings
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],

  // Material Design standard
  standard: [0.4, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  decelerate: [0, 0, 0.2, 1],

  // Custom easings
  cinematic: [0.25, 0.46, 0.45, 0.94],
  dramatic: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.4, 0, 0.2, 1],

  // Emphasized easings
  bounce: [0.68, -0.6, 0.32, 1.6],
  elastic: [0.175, 0.885, 0.32, 1.275],

  // Speed-based easings
  fast: [0.4, 0, 1, 1],
  slow: [0, 0, 0.2, 1],

  // Other useful easings
  subtle: [0.4, 0, 0.6, 1],
  snappy: [0.4, 0, 0.2, 1],
};

/**
 * Standard animation durations in milliseconds
 */
export const DURATION_PRESETS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  cinematic: 1000,
  dramatic: 1500,
} as const;

/**
 * Common animation property presets
 */
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: {
    duration: DURATION_PRESETS.normal,
    easing: "easeInOut",
    opacity: { from: 0, to: 1 },
  },
  fadeOut: {
    duration: DURATION_PRESETS.normal,
    easing: "easeInOut",
    opacity: { from: 1, to: 0 },
  },

  // Slide animations
  slideInUp: {
    duration: DURATION_PRESETS.normal,
    easing: "easeOut",
    transform: { y: 20 },
    opacity: { from: 0, to: 1 },
  },
  slideInDown: {
    duration: DURATION_PRESETS.normal,
    easing: "easeOut",
    transform: { y: -20 },
    opacity: { from: 0, to: 1 },
  },
  slideInLeft: {
    duration: DURATION_PRESETS.normal,
    easing: "easeOut",
    transform: { x: -20 },
    opacity: { from: 0, to: 1 },
  },
  slideInRight: {
    duration: DURATION_PRESETS.normal,
    easing: "easeOut",
    transform: { x: 20 },
    opacity: { from: 0, to: 1 },
  },

  // Scale animations
  scaleIn: {
    duration: DURATION_PRESETS.normal,
    easing: "easeOut",
    transform: { scale: 0.8 },
    opacity: { from: 0, to: 1 },
  },
  scaleOut: {
    duration: DURATION_PRESETS.fast,
    easing: "easeIn",
    transform: { scale: 1.1 },
    opacity: { from: 1, to: 0 },
  },

  // Hover effects
  hoverLift: {
    duration: DURATION_PRESETS.fast,
    easing: "easeOut",
    transform: { y: -4, scale: 1.02 },
  },
  hoverScale: {
    duration: DURATION_PRESETS.fast,
    easing: "easeOut",
    transform: { scale: 1.05 },
  },

  // Press effects
  pressDown: {
    duration: DURATION_PRESETS.fast,
    easing: "easeIn",
    transform: { scale: 0.95 },
  },

  // Stagger animations
  staggerFadeIn: {
    duration: DURATION_PRESETS.normal,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    stagger: 100,
    opacity: { from: 0, to: 1 },
    transform: { y: 20 },
  },

  // Cinematic effects
  cinematicEntrance: {
    duration: DURATION_PRESETS.cinematic,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    transform: { y: 40, scale: 0.9 },
    opacity: { from: 0, to: 1 },
  },

  // Micro-interactions
  subtleFloat: {
    duration: DURATION_PRESETS.slower,
    easing: "easeInOut",
    transform: { y: -2 },
  },

  // Loading animations
  pulse: {
    duration: DURATION_PRESETS.slow,
    easing: "easeInOut",
    opacity: { from: 0.5, to: 1 },
  },
} as const;

/**
 * Common trigger configurations
 */
export const TRIGGER_PRESETS = {
  viewport: {
    type: "viewport" as const,
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  },
  viewportFull: {
    type: "viewport" as const,
    threshold: 0.8,
    rootMargin: "0px",
  },
  hover: {
    type: "hover" as const,
  },
  click: {
    type: "click" as const,
  },
  scroll: {
    type: "scroll" as const,
    threshold: 0.1,
  },
  focus: {
    type: "focus" as const,
  },
} as const;

/**
 * Accessibility configurations
 */
export const ACCESSIBILITY_PRESETS = {
  default: {
    respectReducedMotion: true,
    skipOnScreenReader: false,
  },
  decorative: {
    respectReducedMotion: true,
    skipOnScreenReader: true,
    alternativeText: "Decorative animation",
  },
  essential: {
    respectReducedMotion: false,
    skipOnScreenReader: false,
  },
} as const;

/**
 * Animation registry for component-specific configurations
 */
class AnimationRegistry {
  private configs: Map<string, AnimationConfig> = new Map();
  private presetConfigs: Map<string, Partial<AnimationConfig>> = new Map();

  constructor() {
    this.initializePresetConfigs();
  }

  /**
   * Initialize common preset configurations
   */
  private initializePresetConfigs() {
    // Hero section presets
    this.presetConfigs.set("hero-text", {
      component: "hero-text",
      trigger: TRIGGER_PRESETS.viewport,
      properties: ANIMATION_PRESETS.cinematicEntrance,
      accessibility: ACCESSIBILITY_PRESETS.default,
    });

    this.presetConfigs.set("hero-background", {
      component: "hero-background",
      trigger: TRIGGER_PRESETS.scroll,
      properties: {
        duration: DURATION_PRESETS.slow,
        easing: "linear",
        transform: { y: "50%" },
      },
      accessibility: ACCESSIBILITY_PRESETS.decorative,
    });

    // Product card presets
    this.presetConfigs.set("product-card-entrance", {
      component: "product-card",
      trigger: TRIGGER_PRESETS.viewport,
      properties: ANIMATION_PRESETS.staggerFadeIn,
      accessibility: ACCESSIBILITY_PRESETS.default,
    });

    this.presetConfigs.set("product-card-hover", {
      component: "product-card",
      trigger: TRIGGER_PRESETS.hover,
      properties: ANIMATION_PRESETS.hoverLift,
      accessibility: ACCESSIBILITY_PRESETS.default,
    });

    // Navigation presets
    this.presetConfigs.set("menu-slide-in", {
      component: "mobile-menu",
      trigger: TRIGGER_PRESETS.click,
      properties: {
        duration: DURATION_PRESETS.normal,
        easing: "easeInOut",
        transform: { x: "-100%" },
      },
      accessibility: ACCESSIBILITY_PRESETS.essential,
    });

    // Form element presets
    this.presetConfigs.set("button-press", {
      component: "button",
      trigger: TRIGGER_PRESETS.click,
      properties: ANIMATION_PRESETS.pressDown,
      accessibility: ACCESSIBILITY_PRESETS.default,
    });

    this.presetConfigs.set("input-focus", {
      component: "input",
      trigger: TRIGGER_PRESETS.focus,
      properties: {
        duration: DURATION_PRESETS.fast,
        easing: "easeOut",
        transform: { scale: 1.02 },
      },
      accessibility: ACCESSIBILITY_PRESETS.default,
    });
  }

  /**
   * Register a new animation configuration
   */
  register(config: AnimationConfig): void {
    this.configs.set(config.id, config);
  }

  /**
   * Get animation configuration by ID
   */
  get(id: string): AnimationConfig | undefined {
    return this.configs.get(id);
  }

  /**
   * Create configuration from preset
   */
  createFromPreset(
    presetId: string,
    overrides: Partial<AnimationConfig> = {},
  ): AnimationConfig | null {
    const preset = this.presetConfigs.get(presetId);
    if (!preset) {
      console.warn(`Animation preset '${presetId}' not found`);
      return null;
    }

    const config: AnimationConfig = {
      id: overrides.id || `${presetId}-${Date.now()}`,
      component: preset.component || "unknown",
      trigger: preset.trigger || TRIGGER_PRESETS.viewport,
      properties: preset.properties || ANIMATION_PRESETS.fadeIn,
      accessibility: preset.accessibility || ACCESSIBILITY_PRESETS.default,
      ...overrides,
    };

    this.register(config);
    return config;
  }

  /**
   * Get all registered configurations
   */
  getAll(): AnimationConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get configurations by component type
   */
  getByComponent(component: string): AnimationConfig[] {
    return this.getAll().filter((config) => config.component === component);
  }

  /**
   * Remove configuration by ID
   */
  remove(id: string): boolean {
    return this.configs.delete(id);
  }

  /**
   * Clear all configurations
   */
  clear(): void {
    this.configs.clear();
  }

  /**
   * Get available preset IDs
   */
  getPresetIds(): string[] {
    return Array.from(this.presetConfigs.keys());
  }
}

// Global animation registry instance
export const animationRegistry = new AnimationRegistry();

/**
 * Helper function to create animation configuration with validation
 */
export function createAnimationConfig(
  id: string,
  component: string,
  options: {
    trigger?: AnimationTrigger;
    properties?: AnimationProperties;
    accessibility?: AccessibilityOptions;
  } = {},
): AnimationConfig {
  const config: AnimationConfig = {
    id,
    component,
    trigger: options.trigger || TRIGGER_PRESETS.viewport,
    properties: options.properties || ANIMATION_PRESETS.fadeIn,
    accessibility: options.accessibility || ACCESSIBILITY_PRESETS.default,
  };

  // Validate configuration
  if (!id || !component) {
    throw new Error("Animation configuration must have id and component");
  }

  if (config.properties.duration < 0) {
    throw new Error("Animation duration must be non-negative");
  }

  animationRegistry.register(config);
  return config;
}

/**
 * Helper function to merge animation properties with performance adjustments
 */
export function mergeAnimationProperties(
  base: AnimationProperties,
  overrides: Partial<AnimationProperties>,
  performanceMode: "high" | "balanced" | "battery" = "balanced",
): AnimationProperties {
  const merged = { ...base, ...overrides };

  // Adjust for performance mode
  switch (performanceMode) {
    case "battery":
      merged.duration = Math.min(merged.duration * 0.5, DURATION_PRESETS.fast);
      merged.easing = "ease"; // Simpler easing
      break;
    case "high":
      // Keep original values
      break;
    case "balanced":
    default:
      merged.duration = merged.duration * 0.8;
      break;
  }

  return merged;
}

/**
 * Type-safe preset keys
 */
export type EasingPreset = keyof typeof EASING_PRESETS;
export type DurationPreset = keyof typeof DURATION_PRESETS;
export type AnimationPreset = keyof typeof ANIMATION_PRESETS;
export type TriggerPreset = keyof typeof TRIGGER_PRESETS;
export type AccessibilityPreset = keyof typeof ACCESSIBILITY_PRESETS;
