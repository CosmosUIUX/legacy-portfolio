"use client";

import { motion } from "@/lib/motion";
import { useScrollAnimation } from "@/lib/motion/hooks";
import { useMotionSettings } from "@/lib/motion/provider";
import { EASING_PRESETS } from "@/lib/motion/config";
import { useState, useEffect } from "react";

interface ParallaxBackgroundProps {
  imageUrl: string;
  speed?: number;
  scale?: [number, number];
  rotation?: [number, number];
  opacity?: [number, number];
  className?: string;
  children?: React.ReactNode;
  enableRotation?: boolean;
  enableScale?: boolean;
}

export function ParallaxBackground({
  imageUrl,
  speed = 0.5,
  scale = [1.05, 0.95],
  rotation = [0, 2],
  opacity = [0.7, 0.9],
  className = "",
  children,
  enableRotation = false,
  enableScale = true,
}: ParallaxBackgroundProps) {
  const { shouldAnimate, performanceMode } = useMotionSettings();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { ref, style } = useScrollAnimation({
    offset: ["start start", "end start"],
    transform: {
      y: [0, speed * 100],
      ...(enableScale && { scale }),
      ...(enableRotation && performanceMode !== "battery" && { rotate: rotation }),
    },
  });

  if (!isMounted || !shouldAnimate) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
            filter: `brightness(${opacity[0]})`,
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <motion.div
        ref={ref}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${imageUrl})`,
          ...style,
          filter: "brightness(0.7) saturate(1.4) contrast(1.2)",
        }}
        initial={{
          scale: scale[0],
          opacity: opacity[0],
          ...(enableRotation && { rotate: rotation[0] }),
        }}
        animate={{
          scale: scale[0],
          opacity: opacity[0],
          ...(enableRotation && { rotate: 0 }),
        }}
        transition={{
          duration: 1.4,
          ease: EASING_PRESETS.cinematic as any,
        }}
      />
      <motion.div
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: EASING_PRESETS.smooth as any,
        }}
      />
      {children}
    </div>
  );
}
