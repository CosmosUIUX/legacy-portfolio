"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "@/lib/motion"
import { Reveal } from "@/components/reveal"
import { Palette, Home, Lightbulb, Ruler } from "lucide-react"

export default function InteriorDesignPage() {
  const services = [
    {
      icon: Palette,
      title: "Design Consultation",
      description: "Comprehensive design planning tailored to your vision and lifestyle needs."
    },
    {
      icon: Home,
      title: "Space Planning",
      description: "Optimizing layouts for functionality, flow, and aesthetic appeal."
    },
    {
      icon: Lightbulb,
      title: "Lighting Design",
      description: "Creating ambiance through strategic lighting solutions and fixtures."
    },
    {
      icon: Ruler,
      title: "Custom Solutions",
      description: "Bespoke furniture and built-in elements designed for your space."
    }
  ]

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container-custom">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6">
                Interior <span className="italic font-light">Design</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Transform your space with our expert interior design services, creating environments that reflect your personality and enhance your lifestyle.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 0.1}>
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-6">
                    <service.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">{service.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{service.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Our <span className="italic font-light">Process</span>
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                From initial consultation to final installation, we guide you through every step of the design journey.
              </p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Consultation", description: "Understanding your vision, needs, and budget" },
              { step: "02", title: "Design", description: "Creating detailed plans and 3D visualizations" },
              { step: "03", title: "Selection", description: "Choosing materials, furniture, and finishes" },
              { step: "04", title: "Installation", description: "Professional implementation and styling" }
            ].map((phase, index) => (
              <Reveal key={phase.step} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-neutral-300 mb-4">{phase.step}</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{phase.title}</h3>
                  <p className="text-neutral-600">{phase.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}