// Simple test for animation configuration
import {
  EASING_PRESETS,
  DURATION_PRESETS,
  ANIMATION_PRESETS,
  animationRegistry,
  createAnimationConfig,
  mergeAnimationProperties,
} from "../config";

describe("Animation Configuration", () => {
  describe("Presets", () => {
    it("should have easing presets", () => {
      expect(EASING_PRESETS.linear).toBe("linear");
      expect(EASING_PRESETS.cinematic).toBe(
        "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      );
      expect(EASING_PRESETS.bounce).toBe("cubic-bezier(0.68, -0.6, 0.32, 1.6)");
    });

    it("should have duration presets", () => {
      expect(DURATION_PRESETS.fast).toBe(150);
      expect(DURATION_PRESETS.normal).toBe(300);
      expect(DURATION_PRESETS.cinematic).toBe(1000);
    });

    it("should have animation presets", () => {
      expect(ANIMATION_PRESETS.fadeIn).toBeDefined();
      expect(ANIMATION_PRESETS.fadeIn.duration).toBe(DURATION_PRESETS.normal);
      expect(ANIMATION_PRESETS.slideInUp).toBeDefined();
      expect(ANIMATION_PRESETS.hoverLift).toBeDefined();
    });
  });

  describe("Animation Registry", () => {
    beforeEach(() => {
      animationRegistry.clear();
    });

    it("should register and retrieve configurations", () => {
      const config = createAnimationConfig("test-config", "test-component");

      expect(animationRegistry.get("test-config")).toEqual(config);
    });

    it("should create from preset", () => {
      const config = animationRegistry.createFromPreset("hero-text", {
        id: "custom-hero",
      });

      expect(config).toBeDefined();
      expect(config?.id).toBe("custom-hero");
      expect(config?.component).toBe("hero-text");
    });

    it("should get configurations by component", () => {
      createAnimationConfig("config1", "button");
      createAnimationConfig("config2", "button");
      createAnimationConfig("config3", "input");

      const buttonConfigs = animationRegistry.getByComponent("button");
      expect(buttonConfigs).toHaveLength(2);
    });

    it("should validate configuration creation", () => {
      expect(() => {
        createAnimationConfig("", "component");
      }).toThrow("Animation configuration must have id and component");

      expect(() => {
        createAnimationConfig("test", "");
      }).toThrow("Animation configuration must have id and component");
    });
  });

  describe("Animation Properties Merging", () => {
    it("should merge properties correctly", () => {
      const base = ANIMATION_PRESETS.fadeIn;
      const overrides = { duration: 500 };

      const merged = mergeAnimationProperties(base, overrides, "high");

      expect(merged.duration).toBe(500);
      expect(merged.easing).toBe(base.easing);
    });

    it("should adjust for performance modes", () => {
      const base = { duration: 1000, easing: "ease-out" };

      const batteryMode = mergeAnimationProperties(base, {}, "battery");
      expect(batteryMode.duration).toBeLessThan(base.duration);
      expect(batteryMode.easing).toBe("ease");

      const highMode = mergeAnimationProperties(base, {}, "high");
      expect(highMode.duration).toBe(base.duration);
      expect(highMode.easing).toBe(base.easing);
    });
  });
});
