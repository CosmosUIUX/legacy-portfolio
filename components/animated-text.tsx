"use client";

import { motion } from "@/lib/motion";
import { useStaggerAnimation } from "@/lib/motion/hooks";
import { EASING_PRESETS, DURATION_PRESETS } from "@/lib/motion/config";
import { useMotionSettings } from "@/lib/motion/provider";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  animationType?: "character" | "word" | "line";
  easing?: keyof typeof EASING_PRESETS;
  duration?: number;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedText({
  text,
  delay = 0,
  animationType = "character",
  easing = "cinematic",
  duration = DURATION_PRESETS.cinematic,
  staggerDelay = 30,
  className = "",
}: AnimatedTextProps) {
  const { shouldAnimate } = useMotionSettings();

  // Fallback for when animations are disabled
  if (!shouldAnimate) {
    return <span className={className}>{text}</span>;
  }

  // Split text based on animation type with proper handling
  const textParts =
    animationType === "word"
      ? text.split(" ").filter((word) => word.length > 0)
      : animationType === "line"
        ? text.split("\n").filter((line) => line.length > 0)
        : text.split("");

  // Use Motion.dev's enhanced stagger animation system
  const { ref, getItemProps } = useStaggerAnimation({
    items: textParts,
    staggerDelay,
    trigger: "viewport",
    direction: "forward",
    animationPreset: "staggerFadeIn",
  });

  // Enhanced cinematic animation variants with Motion.dev capabilities
  const cinematicVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
      filter: "blur(8px)",
      rotateX: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      rotateX: 0,
    },
  };

  // Professional text reveal variants for different animation types
  const getVariantsForType = () => {
    switch (animationType) {
      case "character":
        return {
          hidden: {
            opacity: 0,
            y: 20,
            scale: 0.8,
            filter: "blur(4px)",
            rotateY: 45,
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            rotateY: 0,
          },
        };
      case "word":
        return {
          hidden: {
            opacity: 0,
            y: 40,
            scale: 0.85,
            filter: "blur(6px)",
            rotateX: 20,
          },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            rotateX: 0,
          },
        };
      case "line":
        return cinematicVariants;
      default:
        return cinematicVariants;
    }
  };

  return (
    <span ref={ref} className={className}>
      {textParts.map((part, index) => {
        const itemProps = getItemProps(index);

        return (
          <motion.span
            key={`${animationType}-${index}-${part}`}
            {...itemProps}
            transition={{
              ...itemProps.transition,
              duration: duration / 1000,
              ease: EASING_PRESETS[easing] as any,
              delay: (delay + index * staggerDelay) / 1000,
            }}
            variants={getVariantsForType()}
            style={{
              display:
                animationType === "character" && part === " "
                  ? "inline"
                  : "inline-block",
              marginRight: animationType === "word" ? "0.25em" : undefined,
              transformOrigin: "center bottom",
              willChange: "transform, opacity, filter",
            }}
          >
            {animationType === "character" && part === " " ? "\u00A0" : part}
            {animationType === "word" && index < textParts.length - 1
              ? " "
              : ""}
          </motion.span>
        );
      })}
    </span>
  );
}
