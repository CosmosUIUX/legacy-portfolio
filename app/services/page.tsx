"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ServiceComparison } from "@/components/service-comparison"
import { motion } from "@/lib/motion"
import { Reveal } from "@/components/reveal"
import { Palette, Building, Hammer, Lightbulb, Ruler, Shield } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: Palette,
      title: "Interior Design",
      description: "Complete interior design services from concept to completion, creating spaces that reflect your style and enhance your lifestyle.",
      features: ["Space Planning", "Color Consultation", "Furniture Selection", "Lighting Design"]
    },
    {
      icon: Building,
      title: "Development",
      description: "Full-service development from ground up construction to major renovations, delivered with exceptional quality and attention to detail.",
      features: ["Residential Development", "Commercial Construction", "Project Management", "Quality Assurance"]
    },
    {
      icon: Hammer,
      title: "Renovation",
      description: "Transform existing spaces with our renovation expertise, preserving character while adding modern functionality and style.",
      features: ["Home Renovations", "Office Makeovers", "Historic Restoration", "Structural Modifications"]
    },
    {
      icon: Lightbulb,
      title: "Consultation",
      description: "Expert advice and guidance for your design and development projects, helping you make informed decisions every step of the way.",
      features: ["Design Consultation", "Feasibility Studies", "Budget Planning", "Timeline Development"]
    },
    {
      icon: Ruler,
      title: "Custom Solutions",
      description: "Bespoke design and construction solutions tailored to your unique requirements and vision.",
      features: ["Custom Furniture", "Built-in Storage", "Unique Architectural Elements", "Specialized Installations"]
    },
    {
      icon: Shield,
      title: "Project Management",
      description: "Comprehensive project management ensuring your project is completed on time, within budget, and to the highest standards.",
      features: ["Timeline Management", "Budget Control", "Quality Oversight", "Vendor Coordination"]
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
                Our <span className="italic font-light">Services</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Comprehensive design and development services to bring your vision to life with exceptional quality and attention to detail.
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
                  <p className="text-neutral-600 leading-relaxed mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-neutral-600">
                        <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service Comparison */}
      <ServiceComparison />

      {/* Process Section */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Our <span className="italic font-light">Process</span>
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                We follow a proven process to ensure your project is delivered on time, within budget, and exceeds expectations.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery",
                description: "We start by understanding your vision, needs, lifestyle, and budget requirements."
              },
              {
                step: "02", 
                title: "Design",
                description: "Our team creates detailed plans, 3D visualizations, and material specifications."
              },
              {
                step: "03",
                title: "Development",
                description: "We manage the construction process with regular updates and quality checkpoints."
              },
              {
                step: "04",
                title: "Delivery",
                description: "Final walkthrough, styling, and handover with ongoing support and warranty."
              }
            ].map((phase, index) => (
              <Reveal key={phase.step} delay={index * 0.1}>
                <motion.div 
                  className="text-center p-6"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-6xl font-bold text-neutral-200 mb-4">{phase.step}</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">{phase.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{phase.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="container-custom">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Ready to Start Your <span className="italic font-light">Project?</span>
              </h2>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Let&apos;s discuss how we can bring your vision to life with our expert design and development services.
              </p>
              <motion.a
                href="/contact"
                className="inline-block bg-neutral-900 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-neutral-800 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get In Touch
              </motion.a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}