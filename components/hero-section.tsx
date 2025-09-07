"use client";

import { motion } from "@/lib/motion";
import { useRef } from "react";

import { PackageCheck, Rocket, ShieldCheck } from "lucide-react"; // Added PackageCheck, Rocket, and ShieldCheck icon imports
import { Reveal } from "./reveal";
import { ParallaxBackground } from "./parallax-background";
import { AnimatedText } from "./animated-text";
import { ResponsiveInfoStrip } from "./enhanced-info-strip";
import { PerformanceMonitor } from "./performance-monitor";
import { useScrollAnimation } from "@/lib/motion/hooks";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll animations using Motion.dev
  const { ref: contentRef, style: contentStyle } = useScrollAnimation({
    offset: ["start start", "end start"],
    transform: {
      y: [0, 100],
      opacity: [1, 0],
    },
    spring: true,
    springConfig: {
      stiffness: 100,
      damping: 30,
      mass: 0.8,
    },
  });

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Main Parallax Background */}
      <ParallaxBackground
        imageUrl="https://unsplash.com/photos/9M66C_w_ToM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU3MTY2MzgzfA&force=true"
        speed={0.6}
        scale={[1.05, 0.95]}
        rotation={[0, 2]}
        opacity={[0.8, 0.9]}
        enableRotation={true}
        enableScale={true}
        className="z-3"
      />

      {/* Content with enhanced scroll animations */}
      <motion.div
        ref={contentRef as any}
        className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6"
        style={contentStyle}
      >
        <div className="text-center text-white max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight mb-4 sm:mb-6">
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <AnimatedText
                  text="Creating"
                  delay={500}
                  animationType="character"
                  easing="cinematic"
                  staggerDelay={50}
                />
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <AnimatedText
                  text="beautiful"
                  delay={700}
                  animationType="character"
                  easing="cinematic"
                  staggerDelay={50}
                />
              </motion.span>
              <motion.span 
                className="italic font-light block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1, ease: "easeOut" }}
              >
                <AnimatedText
                  text="spaces that inspire."
                  delay={1100}
                  animationType="word"
                  easing="cinematic"
                  staggerDelay={100}
                />
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 1.5,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            Expert interior design and development services that transform
            your vision into reality.
          </motion.p>
        </div>
      </motion.div>

      {/* Enhanced Info Strip with Motion.dev Sequence Animations */}
      <ResponsiveInfoStrip
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4"
        items={[
          {
            icon: PackageCheck,
            text: "Free consultation",
            color: "text-green-400",
            hoverColor: "text-green-300",
            iconAnimation: "rotate",
          },
          {
            icon: Rocket,
            text: "Fast project delivery",
            color: "text-amber-400",
            hoverColor: "text-amber-300",
            iconAnimation: "flip",
          },
          {
            icon: ShieldCheck,
            text: "Quality guarantee",
            color: "text-blue-400",
            hoverColor: "text-blue-300",
            iconAnimation: "bounce",
          },
        ]}
        mobileAnimationType="fade"
        desktopAnimationType="slide"
        enableHoverEffects={true}
        enableIconAnimations={true}
      />

      {/* Performance Monitor for Development */}
      <PerformanceMonitor
        enabled={process.env.NODE_ENV === "development"}
        showDetails={true}
      />
    </section>
  );
}
