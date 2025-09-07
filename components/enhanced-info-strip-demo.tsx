"use client"

import { PackageCheck, Rocket, ShieldCheck, Star, Zap, Heart } from "lucide-react"
import { EnhancedInfoStrip, ResponsiveInfoStrip } from "./enhanced-info-strip"

export function EnhancedInfoStripDemo() {
  const demoItems = [
    {
      icon: PackageCheck,
      text: "Free consultation",
      color: "text-green-400",
      hoverColor: "text-green-300",
      iconAnimation: "rotate" as const
    },
    {
      icon: Rocket,
      text: "Fast delivery",
      color: "text-amber-400", 
      hoverColor: "text-amber-300",
      iconAnimation: "flip" as const
    },
    {
      icon: ShieldCheck,
      text: "Quality guarantee",
      color: "text-blue-400",
      hoverColor: "text-blue-300", 
      iconAnimation: "bounce" as const
    },
    {
      icon: Star,
      text: "5-star rated",
      color: "text-purple-400",
      hoverColor: "text-purple-300",
      iconAnimation: "scale" as const
    },
    {
      icon: Zap,
      text: "Lightning fast",
      color: "text-yellow-400",
      hoverColor: "text-yellow-300",
      iconAnimation: "slide" as const
    },
    {
      icon: Heart,
      text: "Customer loved",
      color: "text-red-400",
      hoverColor: "text-red-300",
      iconAnimation: "fade" as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl font-bold mb-4">Enhanced Info Strip Demo</h1>
          <p className="text-lg text-white/80">Motion.dev powered stagger animations with icon-specific effects</p>
        </div>

        {/* Different Animation Types */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">Animation Types</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg text-white/90 mb-2">Slide Animation</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(0, 3)}
                animationType="slide"
                staggerDelay={120}
                enableHoverEffects={true}
                enableIconAnimations={true}
              />
            </div>

            <div>
              <h3 className="text-lg text-white/90 mb-2">Scale Animation</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(1, 4)}
                animationType="scale"
                staggerDelay={150}
                enableHoverEffects={true}
                enableIconAnimations={true}
              />
            </div>

            <div>
              <h3 className="text-lg text-white/90 mb-2">Bounce Animation</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(2, 5)}
                animationType="bounce"
                staggerDelay={100}
                enableHoverEffects={true}
                enableIconAnimations={true}
              />
            </div>

            <div>
              <h3 className="text-lg text-white/90 mb-2">Fade Animation</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(3, 6)}
                animationType="fade"
                staggerDelay={80}
                enableHoverEffects={true}
                enableIconAnimations={true}
              />
            </div>
          </div>
        </div>

        {/* Responsive Demo */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Responsive Behavior</h2>
          <p className="text-white/70">This strip adapts its animation based on screen size and device capabilities</p>
          
          <ResponsiveInfoStrip
            items={demoItems}
            mobileAnimationType="fade"
            desktopAnimationType="slide"
            enableHoverEffects={true}
            enableIconAnimations={true}
          />
        </div>

        {/* Performance Modes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Performance Optimizations</h2>
          <p className="text-white/70">Animations automatically adjust based on device performance mode</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg text-white/90 mb-2">With Icon Animations</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(0, 3)}
                animationType="slide"
                enableIconAnimations={true}
                enableHoverEffects={true}
              />
            </div>
            
            <div>
              <h3 className="text-lg text-white/90 mb-2">Simplified (Battery Mode)</h3>
              <EnhancedInfoStrip
                items={demoItems.slice(0, 3)}
                animationType="fade"
                enableIconAnimations={false}
                enableHoverEffects={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}