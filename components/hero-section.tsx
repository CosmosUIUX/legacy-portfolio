"use client"

import { motion } from "@/lib/motion"
import { useRef } from "react"

import { PackageCheck, Rocket, ShieldCheck } from "lucide-react" // Added PackageCheck, Rocket, and ShieldCheck icon imports
import { Reveal } from "./reveal"
import { ParallaxBackground, MultiLayerParallax } from "./parallax-background"
import { AnimatedText } from "./animated-text"
import { ResponsiveInfoStrip } from "./enhanced-info-strip"
import { PerformanceMonitor } from "./performance-monitor"
import { useScrollAnimation } from "@/lib/motion/hooks"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Enhanced scroll animations using Motion.dev
  const { ref: contentRef, style: contentStyle } = useScrollAnimation({
    offset: ['start start', 'end start'],
    transform: {
      y: [0, 100],
      opacity: [1, 0]
    },
    spring: true,
    springConfig: {
      stiffness: 100,
      damping: 30,
      mass: 0.8
    }
  })



  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Advanced Multi-Layer Parallax Background System with Enhanced Effects */}
      <MultiLayerParallax
        layers={[
          // Deep background layer - slowest movement with atmospheric effects
          {
            imageUrl: "https://unsplash.com/photos/9M66C_w_ToM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU3MTY2MzgzfA&force=true",
            speed: 0.2,
            opacity: 0.4,
            blur: 3,
            brightness: 0.6,
            contrast: 1.2,
            saturate: 0.8,
            scale: [1.1, 1.0],
            enableAdvancedEffects: true,
            className: "z-0"
          },
          // Mid background layer - medium movement with subtle rotation
          {
            imageUrl: "https://unsplash.com/photos/9M66C_w_ToM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU3MTY2MzgzfA&force=true",
            speed: 0.4,
            opacity: 0.5,
            blur: 1.5,
            brightness: 0.7,
            contrast: 1.1,
            saturate: 0.9,
            scale: [1.08, 0.98],
            rotation: [0, 1],
            enableAdvancedEffects: true,
            className: "z-1"
          },
          // Foreground layer - fastest movement with dynamic effects
          {
            imageUrl: "https://unsplash.com/photos/9M66C_w_ToM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU3MTY2MzgzfA&force=true",
            speed: 0.7,
            opacity: 0.6,
            blur: 0.5,
            brightness: 0.8,
            contrast: 1.0,
            saturate: 1.1,
            scale: [1.06, 0.96],
            rotation: [0, -0.5],
            enableAdvancedEffects: true,
            className: "z-2"
          }
        ]}
        className="absolute inset-0"
        enablePerformanceMode={true}
      />

      {/* Main Parallax Background with Advanced Effects */}
      <ParallaxBackground
        imageUrl="https://unsplash.com/photos/9M66C_w_ToM/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzU3MTY2MzgzfA&force=true"
        speed={0.6}
        scale={[1.05, 0.95]}
        rotation={[0, 2]}
        opacity={[0.8, 0.9]}
        enableRotation={true}
        enableScale={true}
        enableSkew={true}
        skew={[0, 1]}
        enablePerspective={true}
        rotateX={[0, 3]}
        rotateY={[0, 1]}
        enableWillChange={true}
        enableGPUAcceleration={true}
        className="z-3"
      />

      {/* Content with enhanced scroll animations */}
      <motion.div
        ref={contentRef as any}
        className="relative z-10 h-full flex items-center justify-center"
        style={contentStyle}
      >
        <div className="container-custom text-center text-white px-4 sm:px-6">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight sm:leading-none tracking-tight mb-6">
              <span className="block sm:inline">
                <AnimatedText 
                  text="Creating" 
                  delay={500} 
                  animationType="character"
                  easing="cinematic"
                  staggerDelay={50}
                />
              </span>
              <span className="block sm:inline sm:ml-3">
                <AnimatedText 
                  text="beautiful" 
                  delay={700} 
                  animationType="character"
                  easing="cinematic"
                  staggerDelay={50}
                />
              </span>
              <br />
              <span className="italic font-light block">
                <AnimatedText 
                  text="spaces that inspire." 
                  delay={1100} 
                  animationType="word"
                  easing="cinematic"
                  staggerDelay={100}
                />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              Expert interior design and development services that transform your vision into reality.
            </motion.p>
          </Reveal>
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
            iconAnimation: "rotate"
          },
          {
            icon: Rocket,
            text: "Fast project delivery",
            color: "text-amber-400",
            hoverColor: "text-amber-300",
            iconAnimation: "flip"
          },
          {
            icon: ShieldCheck,
            text: "Quality guarantee",
            color: "text-blue-400",
            hoverColor: "text-blue-300",
            iconAnimation: "bounce"
          }
        ]}
        mobileAnimationType="fade"
        desktopAnimationType="slide"
        enableHoverEffects={true}
        enableIconAnimations={true}
      />

      {/* Performance Monitor for Development */}
      <PerformanceMonitor 
        enabled={process.env.NODE_ENV === 'development'} 
        showDetails={true}
      />
    </section>
  )
}
