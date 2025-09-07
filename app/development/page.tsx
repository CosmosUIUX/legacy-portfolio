"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "@/lib/motion"
import { Reveal } from "@/components/reveal"
import { Building, Hammer, Shield, Clock } from "lucide-react"

export default function DevelopmentPage() {
  const services = [
    {
      icon: Building,
      title: "Residential Development",
      description: "Custom homes and residential projects built to the highest standards."
    },
    {
      icon: Hammer,
      title: "Commercial Construction",
      description: "Office spaces, retail environments, and commercial developments."
    },
    {
      icon: Shield,
      title: "Renovation & Restoration",
      description: "Breathing new life into existing spaces with expert craftsmanship."
    },
    {
      icon: Clock,
      title: "Project Management",
      description: "End-to-end project coordination ensuring timely and quality delivery."
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
                Development <span className="italic font-light">Services</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                From concept to completion, we deliver exceptional development projects that stand the test of time.
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

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Why Choose <span className="italic font-light">Legacy</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Craftsmanship",
                description: "Decades of experience in construction and development with attention to every detail."
              },
              {
                title: "Sustainable Practices",
                description: "Environmentally conscious building methods and materials for a better future."
              },
              {
                title: "Timely Delivery",
                description: "Proven track record of completing projects on time and within budget."
              }
            ].map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.1}>
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-sm"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}