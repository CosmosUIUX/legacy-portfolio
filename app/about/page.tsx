"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Testimonials } from "@/components/testimonials"
import { motion } from "framer-motion"
import { Reveal } from "@/components/reveal"
import { Award, Users, Clock, Target } from "lucide-react"


export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container-custom">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6">
                About <span className="italic font-light">Legacy</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                We are Legacy Interiors and Developers, crafting exceptional spaces that blend timeless design with modern functionality.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                  Our <span className="italic font-light">Story</span>
                </h2>
                <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                  <p>
                    Founded with a vision to create spaces that inspire and endure, Legacy Interiors and Developers has been at the forefront of innovative design and construction.
                  </p>
                  <p>
                    Our team combines decades of experience in interior design and development, bringing together creative vision and technical expertise to deliver exceptional results.
                  </p>
                  <p>
                    Every project we undertake is a testament to our commitment to quality, sustainability, and timeless design principles.
                  </p>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                  <span className="text-neutral-500 text-lg">About Image</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Our <span className="italic font-light">Values</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Excellence",
                description: "We never compromise on the quality of materials, craftsmanship, or attention to detail."
              },
              {
                icon: Target,
                title: "Innovation",
                description: "Embracing new technologies and design approaches while respecting timeless principles."
              },
              {
                icon: Users,
                title: "Collaboration",
                description: "Working closely with clients to understand their vision and bring it to life."
              },
              {
                icon: Clock,
                title: "Reliability",
                description: "Delivering projects on time and within budget while maintaining the highest standards."
              }
            ].map((value, index) => (
              <Reveal key={value.title} delay={index * 0.1}>
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-sm text-center"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-neutral-900 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <value.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">{value.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{value.description}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Meet Our <span className="italic font-light">Team</span>
              </h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Our diverse team of designers, architects, and project managers brings decades of combined experience to every project.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandra Chen",
                role: "Principal Designer",
                bio: "With over 15 years of experience in luxury residential design, Alexandra leads our design vision.",
                image: "/team-1.jpg"
              },
              {
                name: "Marcus Rodriguez",
                role: "Development Director",
                bio: "Marcus oversees all construction and development projects with his 20+ years of industry expertise.",
                image: "/team-2.jpg"
              },
              {
                name: "Sarah Kim",
                role: "Project Manager",
                bio: "Sarah ensures every project runs smoothly from conception to completion with meticulous attention to detail.",
                image: "/team-3.jpg"
              }
            ].map((member, index) => (
              <Reveal key={member.name} delay={index * 0.1}>
                <motion.div 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 text-center"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-neutral-500 text-sm">Photo</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{member.name}</h3>
                  <p className="text-neutral-600 font-medium mb-4">{member.role}</p>
                  <p className="text-neutral-600 leading-relaxed text-sm">{member.bio}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <Footer />
    </main>
  )
}