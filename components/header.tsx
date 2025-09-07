// components/header.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useMotion as useHoverMotion } from "@/lib/motion/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Menu } from "lucide-react";
import { ModernSidebar } from "./modern-sidebar";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll-linked state
  const scrollY = useMotionValue(0);
  const scrollProgress = useMotionValue(0);

  // Header springs
  const headerOpacity = useSpring(
    useTransform(scrollProgress, [0, 0.2], [0.02, 0.08]),
    { stiffness: 300, damping: 30 },
  );
  const headerBlur = useSpring(useTransform(scrollProgress, [0, 1], [8, 16]), {
    stiffness: 200,
    damping: 25,
  });
  const borderOpacity = useSpring(
    useTransform(scrollProgress, [0, 0.2], [0.02, 0.1]),
    { stiffness: 300, damping: 30 },
  );

  // Logo springs
  const logoOpacity = useSpring(
    useTransform(scrollProgress, [0, 0.3], [0.8, 0.9]),
    { stiffness: 400, damping: 35 },
  );
  const logoScale = useSpring(
    useTransform(scrollProgress, [0, 0.3], [1, 0.95]),
    { stiffness: 300, damping: 25 },
  );

  // Track scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const progress = Math.min(y / 100, 1);
      scrollY.set(y);
      scrollProgress.set(progress);
      setIsScrolled(y > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY, scrollProgress]);

  // Hover micro-interactions
  const menuButtonMotion = useHoverMotion({
    trigger: "hover",
    duration: 200,
    easing: "spring",
  });

  // ESC + body scroll lock
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        className={cn("fixed top-0 left-0 right-0 z-[100] border-b")}
        initial={{ y: -100 }}
        animate={{
          y: 0,
          backgroundColor: isScrolled 
            ? "rgba(255, 255, 255, 0.95)" 
            : "rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(12px)",
        }}
        animate={{ y: 0 }}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${headerOpacity.get ? headerOpacity.get() : headerOpacity})`,
          backdropFilter: `blur(${headerBlur.get ? headerBlur.get() : headerBlur}px)`,
          borderBottomColor: `rgba(255, 255, 255, ${borderOpacity.get ? borderOpacity.get() : borderOpacity})`,
        }}
        transition={{
          duration: 0.6,
          ease: [0.21, 0.47, 0.32, 0.98], // valid bezier array
        }}
      >
        <div className="container-custom relative">
          <div className="flex items-center justify-center h-12 lg:h-16">
            {/* Menu Button - Screen Corner */}
            {!isMenuOpen && (
              <motion.button
                className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20"
                onClick={() => setIsMenuOpen(true)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  color: "rgb(255, 255, 255)",
                }}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                whileTap={{
                  scale: 0.92,
                }}
                aria-label="Open menu"
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <Menu size={20} />
              </motion.button>
            )}

            {/* Logo - Centered */}
            <motion.div
              className="flex items-center gap-3 flex-shrink-0"
              whileHover={{
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 17 },
              }}
            >
              <a
                href="#"
                className="flex items-center gap-3 group"
                aria-label="Legacy Interiors and Developers Home"
              >
                <motion.div
                  className="relative"
                  animate={{ opacity: logoOpacity.get(), scale: logoScale.get() }}
                  whileHover={{
                    scale: 1.05,
                    rotate: [0, -2, 2, 0],
                    transition: { duration: 0.4, ease: "easeInOut" },
                  }}
                >
                  <Image
                    src="/legacy-logo.svg"
                    alt="Legacy Interiors and Developers Logo"
                    width={48}
                    height={48}
                  />
                </motion.div>

                <div className="flex flex-col">
                  <motion.span
                    className="text-lg lg:text-xl font-bold tracking-tight leading-tight"
                    animate={{
                      color: isScrolled
                        ? "rgb(23, 23, 23)"
                        : "rgb(255, 255, 255)",
                      scale: isScrolled ? 0.98 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      },
                    }}
                  >
                    LEGACY
                  </motion.span>
                  <motion.span
                    className="text-xs lg:text-sm font-medium tracking-wide leading-tight"
                    animate={{
                      color: isScrolled
                        ? "rgb(82, 82, 82)"
                        : "rgba(255, 255, 255, 0.7)",
                      opacity: isScrolled ? 0.9 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      opacity: 1,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    INTERIORS AND DEVELOPERS
                  </motion.span>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <ModernSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
