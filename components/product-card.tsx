// components/product-card.tsx
"use client";

import React from "react";
import { motion } from "@/lib/motion";
import Image from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useMotion, useViewportAnimation } from "@/lib/motion/hooks";
import { EASING_PRESETS, DURATION_PRESETS } from "@/lib/motion/config";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onQuickLook: (product: Product) => void;
  layoutId?: string;
  animationPreset?: "subtle" | "dynamic" | "cinematic";
  isLoading?: boolean;
}

export function ProductCard({
  product,
  onQuickLook,
  layoutId,
  animationPreset = "dynamic",
  isLoading = false,
}: ProductCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hoverMotion = useMotion({
    trigger: "hover",
    duration: DURATION_PRESETS.fast,
    easing: EASING_PRESETS.snappy,
  });

  const entranceMotion = useViewportAnimation({ triggerOnce: true });

  const handlePress = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
  }, []);

  const handleQuickLook = useCallback(() => {
    handlePress();
    setTimeout(() => onQuickLook(product), 100);
  }, [product, onQuickLook, handlePress]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        y: animationPreset === "cinematic" ? 40 : 20,
        scale: animationPreset === "cinematic" ? 0.9 : 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
      },
    };

    const hoverVariants = {
      rest: {
        y: 0,
        scale: 1,
        rotateX: 0,
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 50px",
      },
      hover: {
        y: animationPreset === "subtle" ? -2 : -8,
        scale: animationPreset === "subtle" ? 1.01 : 1.03,
        rotateX: animationPreset === "cinematic" ? 2 : 0,
        boxShadow:
          animationPreset === "subtle"
            ? "rgba(0, 0, 0, 0.15) 0px 15px 60px"
            : "rgba(0, 0, 0, 0.2) 0px 20px 80px",
      },
      pressed: {
        y: animationPreset === "subtle" ? -1 : -4,
        scale: animationPreset === "subtle" ? 0.99 : 0.97,
        rotateX: 0,
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 5px 30px",
      },
    };

    return { baseVariants, hoverVariants };
  };

  const { baseVariants, hoverVariants } = getAnimationVariants();

  const [priceKey, setPriceKey] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(product.price);

  React.useEffect(() => {
    if (product.price !== previousPrice) {
      setPriceKey((prev) => prev + 1);
      setPreviousPrice(product.price);
    }
  }, [product.price, previousPrice]);

  const getCurrentAnimationState = () => {
    if (isPressed) return "pressed";
    if (hoverMotion.isHovered) return "hover";
    if (entranceMotion.hasEntered) return "visible";
    return "hidden";
  };

  const breathingAnimation = {
    scale: [1, 1.005, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  };

  return (
    <motion.div
      ref={entranceMotion.ref as React.RefObject<HTMLDivElement>}
      layoutId={layoutId}
      className="group relative bg-white overflow-hidden cursor-pointer w-full"
      style={{ borderRadius: "24px" }}
      initial="hidden"
      animate={getCurrentAnimationState()}
      whileHover={{
        y: -8,
        scale: 1.03,
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 20px 80px",
      }}
      whileTap={{
        scale: 0.98,
        rotateX: 1,
        boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 25px",
        transition: { duration: 0.1, ease: "easeOut" },
      }}
      onClick={handleQuickLook}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setTimeout(() => setIsPressed(false), 50)}
      onMouseLeave={() => setIsPressed(false)}
      {...hoverMotion.eventHandlers}
      transition={{
        duration: isPressed ? 0.4 : 0.3,
        ease: "easeOut",
        layout: { duration: 0.4, ease: "easeOut" },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      <motion.div
        className="w-full h-full"
        animate={!hoverMotion.isHovered && !isPressed ? breathingAnimation : {}}
        style={{ boxShadow: hoverVariants.rest.boxShadow }}
      >
        {product.badge && (
          <motion.div
            className="absolute top-4 left-4 z-20"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            whileHover={{
              scale: 1.1,
              rotate: [0, -2, 2, 0],
              transition: {
                duration: 0.6,
                ease: "easeInOut",
                repeat: Infinity,
              },
            }}
            whileTap={{ scale: 0.95, rotate: 0, transition: { duration: 0.1 } }}
          >
            <motion.span
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full relative overflow-hidden cursor-pointer border",
                product.badge === "New" && "bg-green-500 text-white border-green-400",
                product.badge === "Back in stock" &&
                  "bg-blue-500 text-white border-blue-400",
                product.badge === "Limited" && "bg-amber-500 text-white border-amber-400",
                product.badge === "Popular" && "bg-purple-500 text-white border-purple-400",
                product.badge === "Featured" && "bg-indigo-500 text-white border-indigo-400",
              )}
            >
              <span className="relative z-10">{product.badge}</span>
            </motion.span>
          </motion.div>
        )}

        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "25/36" }}
        >
          <div className="relative w-full h-full">
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 1.1,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src={product.image || "/placeholder-product.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
                priority={false}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0 bg-black/0 pointer-events-none"
              animate={{
                backgroundColor: hoverMotion.isHovered
                  ? "rgba(0, 0, 0, 0.1)"
                  : "rgba(0, 0, 0, 0)",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
            >
              <motion.h3
                className="text-lg font-semibold text-white mb-1"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                {product.name}
              </motion.h3>

              <motion.p
                className="text-sm text-white/90 mb-2"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {product.materials.join(", ")}
              </motion.p>

              <motion.span
                key={priceKey}
                className="text-xl font-bold text-white relative inline-block cursor-pointer"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{
                  opacity: 1,
                  scale: priceKey > 0 ? [0.9, 1.2, 1] : 1,
                  y: 0,
                  color:
                    priceKey > 0
                      ? ["#ffffff", "#10b981", "#ffffff"]
                      : "#ffffff",
                }}
                transition={{
                  delay: 0.6,
                  duration: priceKey > 0 ? 0.8 : 0.4,
                  ease: "easeOut",
                }}
              >
                <motion.span
                  className="relative z-10"
                  animate={
                    priceKey > 0
                      ? {
                          filter: [
                            "brightness(1)",
                            "brightness(1.3) saturate(1.2)",
                            "brightness(1)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {product.price.split("").map((char, index) => (
                    <motion.span
                      key={`${priceKey}-${index}`}
                      className="inline-block"
                      initial={priceKey > 0 ? { y: -10, opacity: 0 } : {}}
                      animate={priceKey > 0 ? { y: 0, opacity: 1 } : {}}
                      transition={{
                        delay: priceKey > 0 ? index * 0.05 : 0,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
